"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummary = exports.updateStatus = exports.lockEntry = exports.getTodayList = exports.generateCallList = void 0;
const connection_1 = require("../../../database/connection");
const CRMCallList_1 = require("../../../database/entities/CRMCallList");
const CRMRule_1 = require("../../../database/entities/CRMRule");
const Event_1 = require("../../../database/entities/Event");
const Meter_1 = require("../../../database/entities/Meter");
const CRMUser_1 = require("../../../database/entities/CRMUser");
const phone_encryption_1 = require("../../../utils/phone.encryption");
const date_fns_1 = require("date-fns");
const repo = () => connection_1.AppDataSource.getRepository(CRMCallList_1.CRMCallList);
const toUnix = (d) => Math.floor(d.getTime() / 1000);
// ── Generate call list ────────────────────────────────────────────────────────
const generateCallList = async () => {
    const today = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
    // Delete existing today's list before regenerating
    await repo().delete({ generatedAt: today });
    const rules = await connection_1.AppDataSource.getRepository(CRMRule_1.CRMRule).find({
        where: { isActive: true },
    });
    if (!rules.length)
        return { generated: 0, message: "No active rules" };
    // Collect all matched households across rules
    const matchMap = new Map();
    for (const rule of rules) {
        const since = toUnix((0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), rule.lookbackDays)));
        const isConnectivityRule = rule.condition.operator === "equals" && rule.condition.metric === "connectivity";
        const qb = connection_1.AppDataSource.getRepository(Event_1.Event)
            .createQueryBuilder("e")
            .select("e.device_id", "device_id")
            .addSelect(`array_agg(DISTINCT to_char(to_timestamp(e.timestamp), 'YYYY-MM-DD'))`, "event_dates")
            .where("e.type = :type", { type: rule.eventType })
            .andWhere("e.timestamp >= :since", { since });
        // For connectivity rules — only count days where connectivity = false
        if (isConnectivityRule && rule.condition.value === false) {
            qb.andWhere(`(e.details->>'connectivity')::boolean = false`);
        }
        const rows = await qb.groupBy("e.device_id").getRawMany();
        const matched = rows.filter((r) => evaluateCondition(r, rule.condition, rule.lookbackDays));
        if (!matched.length)
            continue;
        const deviceIds = matched.map((r) => r.device_id);
        const meters = await connection_1.AppDataSource.getRepository(Meter_1.Meter)
            .createQueryBuilder("m")
            .innerJoinAndSelect("m.assignedHousehold", "h")
            .where("m.meter_id IN (:...ids)", { ids: deviceIds })
            .andWhere("m.is_assigned = true")
            .getMany();
        for (const meter of meters) {
            const row = matched.find((r) => r.device_id === meter.meterId);
            const days = new Set(row.event_dates).size;
            const existing = matchMap.get(meter.meterId);
            // Keep highest priority if device already matched another rule
            const newPriority = rule.priority;
            if (existing && priorityRank(existing.priority) >= priorityRank(newPriority))
                continue;
            matchMap.set(meter.meterId, {
                deviceId: meter.meterId,
                householdId: meter.assignedHouseholdId,
                hhid: meter.assignedHousehold.hhid,
                priority: newPriority,
                reason: `${rule.name} — ${days} of last ${rule.lookbackDays} days`,
                daysAffected: days,
                ruleName: rule.name,
                ruleId: rule.id,
            });
        }
    }
    if (!matchMap.size)
        return { generated: 0, message: "No households matched rules" };
    // Distribute among active call agents
    const agents = await connection_1.AppDataSource.getRepository(CRMUser_1.CRMUser).find({
        where: { role: "call_agent", isActive: true },
    });
    const entries = [...matchMap.values()].sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
    const callListEntries = entries.map((entry, i) => ({
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
        status: CRMCallList_1.CRMCallListStatus.PENDING,
    }));
    await repo().createQueryBuilder()
        .insert().into(CRMCallList_1.CRMCallList).values(callListEntries).execute();
    return { generated: callListEntries.length, message: `Generated ${callListEntries.length} entries` };
};
exports.generateCallList = generateCallList;
// ── Get today's list for an agent ─────────────────────────────────────────────
const getTodayList = async (agentId, role) => {
    const today = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
    const qb = repo()
        .createQueryBuilder("cl")
        .leftJoinAndSelect("cl.household", "h")
        .where("cl.generated_at = :today", { today })
        .orderBy("CASE cl.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END", "ASC")
        .addOrderBy("cl.createdAt", "ASC");
    if (role === "call_agent")
        qb.andWhere("cl.assigned_to = :agentId", { agentId });
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
            ? (0, phone_encryption_1.maskPhone)((0, phone_encryption_1.decryptPhone)(e.household.phoneNumberEncrypted))
            : null,
    }));
};
exports.getTodayList = getTodayList;
// ── Lock a household ──────────────────────────────────────────────────────────
const lockEntry = async (id, agentId) => {
    const entry = await repo().findOneBy({ id });
    if (!entry)
        return null;
    if (entry.assignedTo !== agentId)
        return null;
    await repo().update(id, { status: CRMCallList_1.CRMCallListStatus.LOCKED, lockedAt: new Date() });
    return repo().findOneBy({ id });
};
exports.lockEntry = lockEntry;
// ── Update status after call ──────────────────────────────────────────────────
const updateStatus = async (id, agentId, data) => {
    const entry = await repo().findOneBy({ id });
    if (!entry)
        return null;
    const statusMap = {
        RESOLVED: CRMCallList_1.CRMCallListStatus.RESOLVED,
        ESCALATED: CRMCallList_1.CRMCallListStatus.ESCALATED,
        NO_ANSWER: CRMCallList_1.CRMCallListStatus.ATTEMPTED,
        CALLBACK: CRMCallList_1.CRMCallListStatus.ATTEMPTED,
    };
    await repo().update(id, { status: statusMap[data.outcome] ?? CRMCallList_1.CRMCallListStatus.ATTEMPTED });
    return repo().findOneBy({ id });
};
exports.updateStatus = updateStatus;
// ── Summary for panel manager ─────────────────────────────────────────────────
const getSummary = async () => {
    const today = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
    const entries = await repo().find({
        where: { generatedAt: today },
        relations: ["agent"],
    });
    const byAgent = new Map();
    for (const e of entries) {
        const name = e.agent?.name ?? "Unassigned";
        const cur = byAgent.get(name) ?? { name, assigned: 0, resolved: 0, pending: 0 };
        cur.assigned++;
        if (e.status === CRMCallList_1.CRMCallListStatus.RESOLVED)
            cur.resolved++;
        if (e.status === CRMCallList_1.CRMCallListStatus.PENDING)
            cur.pending++;
        byAgent.set(name, cur);
    }
    return {
        date: today,
        totalHouseholds: entries.length,
        pending: entries.filter((e) => e.status === CRMCallList_1.CRMCallListStatus.PENDING).length,
        attempted: entries.filter((e) => e.status === CRMCallList_1.CRMCallListStatus.ATTEMPTED).length,
        resolved: entries.filter((e) => e.status === CRMCallList_1.CRMCallListStatus.RESOLVED).length,
        escalated: entries.filter((e) => e.status === CRMCallList_1.CRMCallListStatus.ESCALATED).length,
        byAgent: [...byAgent.values()],
    };
};
exports.getSummary = getSummary;
// ── Helpers ───────────────────────────────────────────────────────────────────
const priorityRank = (p) => ({ HIGH: 3, MEDIUM: 2, LOW: 1 }[p] ?? 0);
function evaluateCondition(row, condition, lookbackDays) {
    const uniqueDays = new Set(row.event_dates).size;
    const minDays = condition.min_days ?? 1;
    // no_event: device has fewer active days than threshold (silent device)
    if (condition.operator === "no_event")
        return uniqueDays < minDays;
    // equals: already filtered in SQL — just check min_days threshold
    if (condition.operator === "equals")
        return uniqueDays >= minDays;
    return false;
}
//# sourceMappingURL=call-list.service.js.map