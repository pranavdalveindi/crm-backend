/**
 * src/database/seeds/events-dev-seed.ts
 *
 * Seeds the events table with realistic test data for the last 5 days.
 * Covers all event types used by the CRM rule engine:
 *   - Type 36: Connectivity
 *   - Type 42: Audio fingerprint (viewership)
 *   - Type 29: Image recognized (viewership)
 *   - Type 30: Image unrecognized (no viewership)
 *
 * Scenario per device:
 *   IM000001 → No connectivity for 4 of last 5 days  → triggers HIGH rule
 *   IM000002 → No viewership (only type 30) for 5 days → triggers MEDIUM rule
 *   IM000003 → Healthy device (good connectivity + viewership) → no rule triggered
 *
 * Run: npm run seed:events-dev
 */

import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "../connection";
import { Event } from "../entities/Event";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns Unix timestamp (seconds) for a given date at a specific hour */
const toUnix = (date: Date, hour = 10): number => {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
};

/** Returns a Date object for N days ago from today */
const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// ── Event builders ────────────────────────────────────────────────────────────

const connectivityEvent = (
  deviceId: string,
  date: Date,
  connected: boolean,
  strength = connected ? 85 : 0,
  hour = 10
) => ({
  device_id: deviceId,
  timestamp: toUnix(date, hour),
  type: 36,
  details: { strength, connectivity: connected },
});

const audioFingerprintEvent = (
  deviceId: string,
  date: Date,
  matched: boolean,
  hour = 14
) => ({
  device_id: deviceId,
  timestamp: toUnix(date, hour),
  type: 42,
  details: {
    date: date.toISOString().split("T")[0],
    hour: String(hour).padStart(2, "0"),
    event: "fingerprint_identified",
    status: matched ? "MATCHED" : "UNMATCHED",
    hit_score: matched ? 92 : 0,
    channel_id: matched ? "CH001" : "",
    match_state: matched ? "MATCHED" : "UNKNOWN",
    channel_name: matched ? "Armenia TV" : "",
  },
});

const imageRecognizedEvent = (
  deviceId: string,
  date: Date,
  hour = 15
) => ({
  device_id: deviceId,
  timestamp: toUnix(date, hour),
  type: 29,
  details: {
    label: "Armenia TV",
    status: "recognized",
    confidence: 0.99,
  },
});

const imageUnrecognizedEvent = (
  deviceId: string,
  date: Date,
  hour = 15
) => ({
  device_id: deviceId,
  timestamp: toUnix(date, hour),
  type: 30,
  details: {
    label: "",
    status: "unrecognized",
    confidence: 0,
  },
});

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  await AppDataSource.initialize();
  console.log("✅ Connected to NeonDB");

  const eventRepo = AppDataSource.getRepository(Event);
  const events: Partial<Event>[] = [];

  // ── DEVICE IM000001 — No connectivity for 4 of last 5 days ──────────────────
  // Day 0 (today): connected (so it's not 5/5, makes it realistic)
  // Days 1-4: no connectivity
  // This device WILL trigger the "No Connectivity for 3+ Days" HIGH rule
  console.log("\n📡 Seeding IM000001 (no connectivity scenario)...");

  events.push(connectivityEvent("IM000001", daysAgo(0), true,  88, 8));   // today: ok
  events.push(connectivityEvent("IM000001", daysAgo(0), true,  82, 20));
  events.push(connectivityEvent("IM000001", daysAgo(1), false, 0,  9));   // day 1: no signal
  events.push(connectivityEvent("IM000001", daysAgo(1), false, 0,  18));
  events.push(connectivityEvent("IM000001", daysAgo(2), false, 0,  10));  // day 2: no signal
  events.push(connectivityEvent("IM000001", daysAgo(3), false, 0,  11));  // day 3: no signal
  events.push(connectivityEvent("IM000001", daysAgo(4), false, 0,  9));   // day 4: no signal

  // Some audio fingerprint events (unmatched — TV on but no signal)
  events.push(audioFingerprintEvent("IM000001", daysAgo(1), false, 10));
  events.push(audioFingerprintEvent("IM000001", daysAgo(2), false, 14));
  events.push(audioFingerprintEvent("IM000001", daysAgo(3), false, 16));


  // ── DEVICE IM000002 — No viewership for all 5 days ──────────────────────────
  // Has connectivity but only type 30 (unrecognized) image events — no type 29
  // This device WILL trigger the "No Viewership for 4+ Days" MEDIUM rule
  console.log("📺 Seeding IM000002 (no viewership scenario)...");

  // Good connectivity — device is online
  events.push(connectivityEvent("IM000002", daysAgo(0), true, 91, 8));
  events.push(connectivityEvent("IM000002", daysAgo(1), true, 88, 9));
  events.push(connectivityEvent("IM000002", daysAgo(2), true, 90, 10));
  events.push(connectivityEvent("IM000002", daysAgo(3), true, 87, 8));
  events.push(connectivityEvent("IM000002", daysAgo(4), true, 93, 9));

  // Only unrecognized image events — TV on but channel not identified
  events.push(imageUnrecognizedEvent("IM000002", daysAgo(0), 14));
  events.push(imageUnrecognizedEvent("IM000002", daysAgo(0), 20));
  events.push(imageUnrecognizedEvent("IM000002", daysAgo(1), 13));
  events.push(imageUnrecognizedEvent("IM000002", daysAgo(1), 19));
  events.push(imageUnrecognizedEvent("IM000002", daysAgo(2), 15));
  events.push(imageUnrecognizedEvent("IM000002", daysAgo(3), 14));
  events.push(imageUnrecognizedEvent("IM000002", daysAgo(4), 16));

  // Unmatched audio too
  events.push(audioFingerprintEvent("IM000002", daysAgo(0), false, 15));
  events.push(audioFingerprintEvent("IM000002", daysAgo(1), false, 14));
  events.push(audioFingerprintEvent("IM000002", daysAgo(2), false, 16));


  // ── DEVICE IM000003 — Healthy device ────────────────────────────────────────
  // Good connectivity + recognized viewership every day
  // This device should NOT appear in any call list
  console.log("✅ Seeding IM000003 (healthy device scenario)...");

  for (let day = 0; day <= 4; day++) {
    events.push(connectivityEvent("IM000003", daysAgo(day), true, 90 + day, 8));
    events.push(connectivityEvent("IM000003", daysAgo(day), true, 88 + day, 20));
    events.push(imageRecognizedEvent("IM000003",  daysAgo(day), 14));
    events.push(imageRecognizedEvent("IM000003",  daysAgo(day), 20));
    events.push(audioFingerprintEvent("IM000003", daysAgo(day), true, 15));
  }

  // ── INSERT ALL ───────────────────────────────────────────────────────────────
  console.log(`\n💾 Inserting ${events.length} events...`);
  await eventRepo
    .createQueryBuilder()
    .insert()
    .into(Event)
    .values(events as Event[])
    .execute();

  console.log(`✅ Inserted ${events.length} events successfully`);
  console.log("\n📊 Summary:");
  console.log("  IM000001 → 4/5 days no connectivity  → should trigger HIGH rule");
  console.log("  IM000002 → 5/5 days no viewership    → should trigger MEDIUM rule");
  console.log("  IM000003 → Healthy                   → should NOT appear in call list");
  console.log("\n🎯 Test the preview endpoint:");
  console.log("  GET /api/v1/crm/rules/:id/preview");

  await AppDataSource.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Events seed failed:", err);
  process.exit(1);
});