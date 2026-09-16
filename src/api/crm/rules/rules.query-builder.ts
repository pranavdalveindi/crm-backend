// src/api/crm/rules/rules.query-builder.ts
import { SelectQueryBuilder } from "typeorm";
import { Event } from "../../../database/entities/Event";
import { AppDataSource } from "../../../database/connection";
import { subDays, startOfDay } from "date-fns";

const toUnixSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

export function buildRuleEventQuery(
  eventType: number,
  condition: Record<string, any>,
  lookbackDays: number
): SelectQueryBuilder<Event> {
  const since = toUnixSeconds(startOfDay(subDays(new Date(), lookbackDays)));

  const qb = AppDataSource.getRepository(Event)
    .createQueryBuilder("e")
    .select("e.device_id", "device_id")
    .addSelect(
      `array_agg(DISTINCT to_char(to_timestamp(e.timestamp), 'YYYY-MM-DD'))`,
      "event_dates"
    )
    .where("e.type = :eventType", { eventType })
    .andWhere("e.timestamp >= :since", { since });

  const { field, operator, value } = condition;

  // 1. Absence of events (e.g. no audio fingerprint for X days)
  if (operator === "no_event") {
    return qb;
  }

  // 2. Member Array Specific Operators (Event Type 3)
  if (operator === "all_inactive" || field === "all_inactive") {
    qb.andWhere(
      "NOT EXISTS (SELECT 1 FROM jsonb_array_elements(e.details->'members') m WHERE (m->>'active')::boolean = true)"
    );
    return qb;
  }

  if (operator === "active_count" || field === "active_count") {
    const op = getSqlOperator(condition.comparison || "equals");
    qb.andWhere(
      `(SELECT count(*) FROM jsonb_array_elements(e.details->'members') m WHERE (m->>'active')::boolean = true) ${op} :val`,
      { val: Number(value ?? 0) }
    );
    return qb;
  }

  if (operator === "inactive_count" || field === "inactive_count") {
    const op = getSqlOperator(condition.comparison || "equals");
    qb.andWhere(
      `(SELECT count(*) FROM jsonb_array_elements(e.details->'members') m WHERE (m->>'active')::boolean = false) ${op} :val`,
      { val: Number(value ?? 0) }
    );
    return qb;
  }

  // 3. Guest Array Specific Operators (Event Type 4)
  if (operator === "guest_count" || field === "guest_count") {
    const op = getSqlOperator(condition.comparison || "greater_than");
    qb.andWhere(
      `jsonb_array_length(COALESCE(e.details->'guests', '[]'::jsonb)) ${op} :val`,
      { val: Number(value ?? 0) }
    );
    return qb;
  }

  // 4. Standard Field Operators (connectivity, strength, status, label, confidence)
  const targetField = field || condition.metric || "connectivity";

  if (operator === "equals" || operator === "not_equals") {
    const op = operator === "equals" ? "=" : "!=";
    if (typeof value === "boolean" || value === "true" || value === "false") {
      const boolVal = value === true || value === "true";
      qb.andWhere(`(e.details->>'${targetField}')::boolean ${op} :val`, { val: boolVal });
    } else if (typeof value === "number") {
      qb.andWhere(`(e.details->>'${targetField}')::numeric ${op} :val`, { val: value });
    } else {
      qb.andWhere(`e.details->>'${targetField}' ${op} :val`, { val: String(value ?? "") });
    }
  } else if (
    operator === "less_than" ||
    operator === "greater_than" ||
    operator === "less_than_or_equal" ||
    operator === "greater_than_or_equal"
  ) {
    const op = getSqlOperator(operator);
    qb.andWhere(`(e.details->>'${targetField}')::numeric ${op} :val`, { val: Number(value ?? 0) });
  } else if (operator === "contains") {
    qb.andWhere(`e.details->>'${targetField}' ILIKE :val`, { val: `%${value}%` });
  }

  return qb;
}

export function evaluateCondition(
  row: { device_id: string; event_dates: string[] },
  condition: Record<string, any>,
  lookbackDays: number
): boolean {
  const uniqueDays = new Set(row.event_dates).size;
  const minDays = condition.min_days ?? 1;

  // "no_event" — device has fewer active days than min_days (effectively silent)
  if (condition.operator === "no_event") {
    return uniqueDays < minDays;
  }

  // All other SQL-filtered operators: device matched the query on `uniqueDays`
  // Return true if the condition was met on at least `minDays` distinct days!
  return uniqueDays >= minDays;
}

function getSqlOperator(op: string): string {
  switch (op) {
    case "less_than":
      return "<";
    case "less_than_or_equal":
      return "<=";
    case "greater_than":
      return ">";
    case "greater_than_or_equal":
      return ">=";
    case "not_equals":
      return "!=";
    case "equals":
    default:
      return "=";
  }
}

