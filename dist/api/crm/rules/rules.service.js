"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewRule = exports.toggleRule = exports.deleteRule = exports.updateRule = exports.createRule = exports.getRuleById = exports.getAllRules = void 0;
const connection_1 = require("../../../database/connection");
const CRMRule_1 = require("../../../database/entities/CRMRule");
const Event_1 = require("../../../database/entities/Event");
const date_fns_1 = require("date-fns");
const repo = () => connection_1.AppDataSource.getRepository(CRMRule_1.CRMRule);
// ── Helpers ──────────────────────────────────────────────────────────────────
const toUnixSeconds = (date) => Math.floor(date.getTime() / 1000);
// ── Service functions ─────────────────────────────────────────────────────────
const getAllRules = () => repo().find({
    relations: ["creator"],
    order: { createdAt: "DESC" },
});
exports.getAllRules = getAllRules;
const getRuleById = (id) => repo().findOne({ where: { id }, relations: ["creator"] });
exports.getRuleById = getRuleById;
const createRule = (dto, createdBy) => repo().save(repo().create({ ...dto, createdBy }));
exports.createRule = createRule;
const updateRule = async (id, dto) => {
    await repo().update(id, dto);
    return (0, exports.getRuleById)(id);
};
exports.updateRule = updateRule;
const deleteRule = (id) => repo().delete(id);
exports.deleteRule = deleteRule;
const toggleRule = async (id, isActive) => {
    await repo().update(id, { isActive });
    return (0, exports.getRuleById)(id);
};
exports.toggleRule = toggleRule;
/**
 * Preview — runs a single rule against real event data and returns
 * the list of device_ids that would be selected if the rule were active.
 * Used from the Rules Management page before activating a rule.
 */
const previewRule = async (id) => {
    const rule = await (0, exports.getRuleById)(id);
    if (!rule)
        return null;
    const since = toUnixSeconds((0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), rule.lookbackDays)));
    // Fetch all events of this type in the lookback window grouped by device
    const rows = await connection_1.AppDataSource.getRepository(Event_1.Event)
        .createQueryBuilder("e")
        .select("e.device_id", "device_id")
        .addSelect(`array_agg(DISTINCT to_char(to_timestamp(e.timestamp), 'YYYY-MM-DD'))`, "event_dates")
        .where("e.type = :type", { type: rule.eventType })
        .andWhere("e.timestamp >= :since", { since })
        .groupBy("e.device_id")
        .getRawMany();
    // Apply the condition from the rule
    const matched = rows.filter((row) => evaluateCondition(row, rule.condition, rule.lookbackDays));
    return {
        rule: { id: rule.id, name: rule.name, eventType: rule.eventType },
        lookbackDays: rule.lookbackDays,
        totalDevicesChecked: rows.length,
        matchedCount: matched.length,
        matchedDevices: matched.map((r) => r.device_id),
    };
};
exports.previewRule = previewRule;
/**
 * Evaluates a single device's event history against the rule condition.
 * Condition format: { metric, operator, value, min_days }
 *
 * Examples:
 *   { metric: "connectivity", operator: "equals", value: false, min_days: 3 }
 *   { metric: "viewership", operator: "no_event", min_days: 4 }
 */
function evaluateCondition(row, condition, lookbackDays) {
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
//# sourceMappingURL=rules.service.js.map