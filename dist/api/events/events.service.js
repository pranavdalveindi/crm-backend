"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = exports.EVENTS_PER_PAGE = void 0;
const connection_1 = require("../../database/connection");
const Event_1 = require("../../database/entities/Event");
const Household_1 = require("../../database/entities/Household");
const Meter_1 = require("../../database/entities/Meter");
exports.EVENTS_PER_PAGE = 25;
/** Fetches events together with the meter's current household assignment. */
class EventsService {
    async list(page) {
        const eventRepository = connection_1.AppDataSource.getRepository(Event_1.Event);
        const skip = (page - 1) * exports.EVENTS_PER_PAGE;
        const query = eventRepository
            .createQueryBuilder("event")
            .leftJoin(Meter_1.Meter, "meter", "meter.meter_id = event.device_id")
            .leftJoin(Household_1.Household, "household", "household.id = meter.assigned_household_id")
            .select("event.id", "eventId")
            .addSelect("event.device_id", "deviceId")
            .addSelect("event.timestamp", "timestamp")
            .addSelect("event.type", "type")
            .addSelect("event.details", "details")
            .addSelect("event.created_at", "createdAt")
            .addSelect("meter.meter_id", "meterId")
            .addSelect("household.hhid", "hhid")
            .orderBy("event.timestamp", "DESC")
            .addOrderBy("event.id", "DESC");
        const [rows, total] = await Promise.all([
            query.clone().offset(skip).limit(exports.EVENTS_PER_PAGE).getRawMany(),
            query.clone().getCount(),
        ]);
        return {
            events: rows.map((row) => ({
                meterId: row.meterId ?? null,
                hhid: row.hhid ?? null,
                event: {
                    id: Number(row.eventId),
                    deviceId: row.deviceId,
                    timestamp: String(row.timestamp),
                    type: Number(row.type),
                    details: row.details,
                    createdAt: row.createdAt,
                },
            })),
            total,
        };
    }
}
exports.EventsService = EventsService;
//# sourceMappingURL=events.service.js.map