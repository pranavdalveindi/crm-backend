import { AppDataSource } from "../../../database/connection";
import { CRMCallList, CRMCallListStatus, CRMCallListPriority } from "../../../database/entities/CRMCallList";
import { CRMRule } from "../../../database/entities/CRMRule";
import { Meter } from "../../../database/entities/Meter";
import { CRMUser } from "../../../database/entities/CRMUser";
import { buildRuleEventQuery, evaluateCondition } from "../rules/rules.query-builder";
import { maskPhone, decryptPhone } from "../../../utils/phone.encryption";
import { format } from "date-fns";

const repo = () => AppDataSource.getRepository(CRMCallList);

// ── Generate call list ────────────────────────────────────────────────────────
export const generateCallList = async () => {
  const today = format(new Date(), "yyyy-MM-dd");

  // Delete existing today's list before regenerating
  await repo().delete({ generatedAt: today });

  const rules = await AppDataSource.getRepository(CRMRule).find({
    where: { isActive: true },
  });

  if (!rules.length) return { generated: 0, message: "No active rules" };

  // Collect all matched households across rules
  const matchMap = new Map<string, {
    deviceId: string; householdId: string; hhid: string;
    priority: CRMCallListPriority; reason: string; daysAffected: number;
    ruleName: string; ruleId: string;
  }>();

  for (const rule of rules) {
    const qb = buildRuleEventQuery(rule.eventType, rule.condition, rule.lookbackDays);
    const rows: { device_id: string; event_dates: string[] }[] = await qb
      .groupBy("e.device_id")
      .getRawMany();

    const matched = rows.filter((r) => evaluateCondition(r, rule.condition, rule.lookbackDays));
    if (!matched.length) continue;

    const deviceIds = matched.map((r) => r.device_id);
    const meters = await AppDataSource.getRepository(Meter)
      .createQueryBuilder("m")
      .innerJoinAndSelect("m.assignedHousehold", "h")
      .where("m.meter_id IN (:...ids)", { ids: deviceIds })
      .andWhere("m.is_assigned = true")
      .getMany();

    for (const meter of meters) {
      const row = matched.find((r) => r.device_id === meter.meterId)!;
      const days = new Set(row.event_dates).size;
      const existing = matchMap.get(meter.meterId);

      // Keep highest priority if device already matched another rule
      const newPriority = rule.priority as unknown as CRMCallListPriority;
      if (existing && priorityRank(existing.priority) >= priorityRank(newPriority)) continue;

      matchMap.set(meter.meterId, {
        deviceId: meter.meterId,
        householdId: meter.assignedHouseholdId!,
        hhid: meter.assignedHousehold!.hhid,
        priority: newPriority,
        reason: `${rule.name} — ${days} of last ${rule.lookbackDays} days`,
        daysAffected: days,
        ruleName: rule.name,
        ruleId: rule.id,
      });
    }
  }

  if (!matchMap.size) return { generated: 0, message: "No households matched rules" };

  // Distribute among active call agents
  const agents = await AppDataSource.getRepository(CRMUser).find({
    where: { role: "call_agent" as any, isActive: true },
  });

  const entries = [...matchMap.values()].sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
  const callListEntries: Partial<CRMCallList>[] = entries.map((entry, i) => ({
    generatedAt: today,
    deviceId: entry.deviceId,
    householdId: entry.householdId,
    hhid: entry.hhid,
    ruleId: entry.ruleId,
    ruleName: entry.ruleName,
    priority: entry.priority,
    reason: entry.reason,
    daysAffected: entry.daysAffected,
    assignedTo: agents.length ? agents[i % agents.length].id : undefined,
    status: CRMCallListStatus.PENDING,
  }));

  await repo().createQueryBuilder()
    .insert().into(CRMCallList).values(callListEntries as CRMCallList[]).execute();

  return { generated: callListEntries.length, message: `Generated ${callListEntries.length} entries` };
};

// ── Get today's list for an agent ─────────────────────────────────────────────
export const getTodayList = async (agentId: string, role: string) => {
  const today = format(new Date(), "yyyy-MM-dd");

  const qb = repo()
    .createQueryBuilder("cl")
    .leftJoinAndSelect("cl.household", "h")
    .where("cl.generated_at = :today", { today })
    .orderBy("CASE cl.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END", "ASC")
    .addOrderBy("cl.createdAt", "ASC");

  if (role === "call_agent") qb.andWhere("cl.assigned_to = :agentId", { agentId });

  const entries = await qb.getMany();

  return entries.map((e) => ({
    id: e.id,
    generatedAt: e.generatedAt,
    deviceId: e.deviceId,
    householdId: e.householdId,
    hhid: e.hhid,
    ruleName: e.ruleName,
    priority: e.priority,
    reason: e.reason,
    daysAffected: e.daysAffected,
    status: e.status,
    contactName: e.household?.contactName ?? null,
    city: e.household?.city ?? null,
    region: e.household?.region ?? null,
    maskedPhone: e.household?.phoneNumberEncrypted
      ? maskPhone(decryptPhone(e.household.phoneNumberEncrypted))
      : null,
  }));
};

// ── Lock a household ──────────────────────────────────────────────────────────
export const lockEntry = async (id: string, agentId: string) => {
  const entry = await repo().findOneBy({ id });
  if (!entry) return null;
  if (entry.assignedTo !== agentId) return null;
  await repo().update(id, { status: CRMCallListStatus.LOCKED, lockedAt: new Date() });
  return repo().findOneBy({ id });
};

// ── Update status after call ──────────────────────────────────────────────────
export const updateStatus = async (
  id: string,
  agentId: string,
  data: { outcome: string; issueTags?: string[]; notes?: string }
) => {
  const entry = await repo().findOneBy({ id });
  if (!entry) return null;

  const statusMap: Record<string, CRMCallListStatus> = {
    RESOLVED:  CRMCallListStatus.RESOLVED,
    ESCALATED: CRMCallListStatus.ESCALATED,
    NO_ANSWER: CRMCallListStatus.ATTEMPTED,
    CALLBACK:  CRMCallListStatus.ATTEMPTED,
  };

  await repo().update(id, { status: statusMap[data.outcome] ?? CRMCallListStatus.ATTEMPTED });
  return repo().findOneBy({ id });
};

// ── Summary for panel manager ─────────────────────────────────────────────────
export const getSummary = async () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const entries = await repo().find({
    where: { generatedAt: today },
    relations: ["agent"],
  });

  const byAgent = new Map<string, { name: string; assigned: number; resolved: number; pending: number }>();
  for (const e of entries) {
    const name = e.agent?.name ?? "Unassigned";
    const cur = byAgent.get(name) ?? { name, assigned: 0, resolved: 0, pending: 0 };
    cur.assigned++;
    if (e.status === CRMCallListStatus.RESOLVED) cur.resolved++;
    if (e.status === CRMCallListStatus.PENDING)  cur.pending++;
    byAgent.set(name, cur);
  }

  return {
    date: today,
    totalHouseholds: entries.length,
    pending:   entries.filter((e) => e.status === CRMCallListStatus.PENDING).length,
    attempted: entries.filter((e) => e.status === CRMCallListStatus.ATTEMPTED).length,
    resolved:  entries.filter((e) => e.status === CRMCallListStatus.RESOLVED).length,
    escalated: entries.filter((e) => e.status === CRMCallListStatus.ESCALATED).length,
    byAgent: [...byAgent.values()],
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const priorityRank = (p: CRMCallListPriority) =>
  ({ HIGH: 3, MEDIUM: 2, LOW: 1 }[p] ?? 0);