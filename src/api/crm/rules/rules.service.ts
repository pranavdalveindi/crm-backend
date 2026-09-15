import { AppDataSource } from "../../../database/connection";
import { CRMRule, CRMRulePriority } from "../../../database/entities/CRMRule";
import { Event } from "../../../database/entities/Event";
import { subDays, startOfDay } from "date-fns";

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

// ── Helpers ──────────────────────────────────────────────────────────────────

const toUnixSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

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

/**
 * Preview — runs a single rule against real event data and returns
 * the list of device_ids that would be selected if the rule were active.
 * Used from the Rules Management page before activating a rule.
 */
export const previewRule = async (id: string) => {
  const rule = await getRuleById(id);
  if (!rule) return null;

  const since = toUnixSeconds(startOfDay(subDays(new Date(), rule.lookbackDays)));

  // Fetch all events of this type in the lookback window grouped by device
  const rows: { device_id: string; event_dates: string[] }[] =
    await AppDataSource.getRepository(Event)
      .createQueryBuilder("e")
      .select("e.device_id", "device_id")
      .addSelect(
        `array_agg(DISTINCT to_char(to_timestamp(e.timestamp), 'YYYY-MM-DD'))`,
        "event_dates"
      )
      .where("e.type = :type", { type: rule.eventType })
      .andWhere("e.timestamp >= :since", { since })
      .groupBy("e.device_id")
      .getRawMany();

  // Apply the condition from the rule
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

/**
 * Evaluates a single device's event history against the rule condition.
 * Condition format: { metric, operator, value, min_days }
 *
 * Examples:
 *   { metric: "connectivity", operator: "equals", value: false, min_days: 3 }
 *   { metric: "viewership", operator: "no_event", min_days: 4 }
 */
function evaluateCondition(
  row: { device_id: string; event_dates: string[] },
  condition: Record<string, any>,
  lookbackDays: number
): boolean {
  const { min_days } = condition;
  const uniqueDays = new Set(row.event_dates).size;

  // "no_event" — device has fewer events than min_days (effectively silent)
  if (condition.operator === "no_event") {
    return uniqueDays < (min_days ?? lookbackDays);
  }

  // For connectivity-style rules — count days where the signal was bad
  // (actual detailed parsing happens in the rule engine Lambda;
  //  preview uses day-count as a proxy)
  return uniqueDays >= (min_days ?? 1);
}