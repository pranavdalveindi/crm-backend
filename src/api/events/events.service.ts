import { AppDataSource } from "../../database/connection";
import { Event } from "../../database/entities/Event";
import { Household } from "../../database/entities/Household";
import { Meter } from "../../database/entities/Meter";

export const EVENTS_PER_PAGE = 25;

export interface EventWithAssignment {
  meterId: string | null;
  hhid: string | null;
  event: {
    id: number;
    deviceId: string;
    timestamp: string;
    type: number;
    details: Record<string, unknown>;
    createdAt: Date;
  };
}

/** Fetches events together with the meter's current household assignment. */
export class EventsService {
  async list(page: number): Promise<{ events: EventWithAssignment[]; total: number }> {
    const eventRepository = AppDataSource.getRepository(Event);
    const skip = (page - 1) * EVENTS_PER_PAGE;

    const query = eventRepository
      .createQueryBuilder("event")
      .leftJoin(Meter, "meter", "meter.meter_id = event.device_id")
      .leftJoin(Household, "household", "household.id = meter.assigned_household_id")
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
      query.clone().offset(skip).limit(EVENTS_PER_PAGE).getRawMany(),
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
