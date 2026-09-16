import { AppDataSource } from "../../../database/connection";
import { CRMRule, CRMRulePriority } from "../../../database/entities/CRMRule";
import { buildRuleEventQuery, evaluateCondition } from "./rules.query-builder";
import { RULE_SCHEMAS } from "./rules.schema";

const repo = () => AppDataSource.getRepository(CRMRule);

// ── Types ────────────────────────────────────────────────────────────────────

export interface CreateRuleDto {
  name: string;
  description?: string;
  eventType: number;
  condition: Record<string, any>;
  lookbackDays: number;
  priority: CRMRulePriority;
}

export interface UpdateRuleDto extends Partial<CreateRuleDto> {
  isActive?: boolean;
}

// ── Service functions ─────────────────────────────────────────────────────────

export const getAllRules = () =>
  repo().find({
    relations: ["creator"],
    order: { createdAt: "DESC" },
  });

export const getRuleById = (id: string) =>
  repo().findOne({ where: { id }, relations: ["creator"] });

export const createRule = (dto: CreateRuleDto, createdBy: string) =>
  repo().save(repo().create({ ...dto, createdBy }));

export const updateRule = async (id: string, dto: UpdateRuleDto) => {
  await repo().update(id, dto);
  return getRuleById(id);
};

export const deleteRule = (id: string) => repo().delete(id);

export const toggleRule = async (id: string, isActive: boolean) => {
  await repo().update(id, { isActive });
  return getRuleById(id);
};

export const getRuleSchemas = () => RULE_SCHEMAS;

/**
 * Preview — runs a single rule against real event data and returns
 * the list of device_ids that would be selected if the rule were active.
 * Used from the Rules Management page before activating a rule.
 */
export const previewRule = async (id: string) => {
  const rule = await getRuleById(id);
  if (!rule) return null;

  const qb = buildRuleEventQuery(rule.eventType, rule.condition, rule.lookbackDays);
  const rows: { device_id: string; event_dates: string[] }[] = await qb
    .groupBy("e.device_id")
    .getRawMany();

  // Apply the condition threshold evaluation
  const matched = rows.filter((row) =>
    evaluateCondition(row, rule.condition, rule.lookbackDays)
  );

  return {
    rule: { id: rule.id, name: rule.name, eventType: rule.eventType },
    lookbackDays: rule.lookbackDays,
    totalDevicesChecked: rows.length,
    matchedCount: matched.length,
    matchedDevices: matched.map((r) => r.device_id),
  };
};