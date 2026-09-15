/**
 * src/database/seeds/crm-dev-seed.ts
 *
 * Seeds NeonDB with foundational data for CRM development.
 * Rules are NOT seeded here — the Developer creates them via the UI.
 *
 *   - Event Mapping (FK dependency for rules table)
 *   - 4 CRM users (1 developer, 1 panel_manager, 2 call_agents)
 *   - 3 sample households with encrypted phone numbers
 *   - 3 meters assigned to those households
 *
 * Run: npm run seed:crm
 */

import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "../connection";
import { CRMUser, CRMUserRole } from "../entities/CRMUser";
import { Household } from "../entities/Household";
import { Meter } from "../entities/Meter";
import { EventMapping } from "../entities/EventMapping";
import { hashPassword } from "../../utils/encryption";
import { encryptPhone } from "../../utils/phone.encryption";

async function seed() {
  await AppDataSource.initialize();
  console.log("✅ Connected to NeonDB\n");

  // ── 1. EVENT MAPPING ─────────────────────────────────────────────────────────
  console.log("📋 Seeding event_mapping...");
  const eventMappingRepo = AppDataSource.getRepository(EventMapping);

  // Exclude 'default' so it aligns with the EventMapping entity definition
  type Severity = "low" | "medium" | "high" | "critical";

  const eventMappings: {
    type: number;
    name: string;
    description: string;
    is_alert: boolean;
    severity?: Severity;
    enabled: boolean;
  }[] = [
    { type: 3,  name: "Member Declaration",  description: "Household member registration event",         is_alert: false, enabled: true },
    { type: 4,  name: "Guest Declaration",   description: "Guest presence declaration event",            is_alert: false, enabled: true },
    { type: 29, name: "Image Recognized",    description: "TV channel identified via image recognition", is_alert: false, enabled: true },
    { type: 30, name: "Image Unrecognized",  description: "TV on but channel could not be identified",   is_alert: true,  severity: "low",     enabled: true },
    { type: 36, name: "Connectivity",        description: "Device connectivity status event",            is_alert: true,  severity: "high",    enabled: true },
    { type: 42, name: "Audio Fingerprint",   description: "Audio fingerprint identification attempt",    is_alert: false, enabled: true },
  ];

  for (const em of eventMappings) {
    const existing = await eventMappingRepo.findOneBy({ type: em.type });
    if (existing) {
      console.log(`  ⚠️  EventMapping type ${em.type} already exists — skipping`);
      continue;
    }
    // Wrap in eventMappingRepo.create() to prevent DeepPartial type mismatches
    await eventMappingRepo.save(eventMappingRepo.create(em));
    console.log(`  ✅ type ${em.type} — ${em.name}`);
  }


  // ── 2. CRM USERS ─────────────────────────────────────────────────────────────
  console.log("\n👥 Seeding CRM users...");
  const userRepo = AppDataSource.getRepository(CRMUser);

  const users = [
    { email: "dev@crm.test",     name: "Dev User",       role: CRMUserRole.DEVELOPER },
    { email: "manager@crm.test", name: "Panel Manager",  role: CRMUserRole.PANEL_MANAGER },
    { email: "agent1@crm.test",  name: "Call Agent One", role: CRMUserRole.CALL_AGENT },
    { email: "agent2@crm.test",  name: "Call Agent Two", role: CRMUserRole.CALL_AGENT },
  ];

  const hashedPass = await hashPassword("Test@1234");

  for (const u of users) {
    const existing = await userRepo.findOneBy({ email: u.email });
    if (existing) {
      console.log(`  ⚠️  ${u.email} already exists — skipping`);
      continue;
    }
    await userRepo.save(userRepo.create({ ...u, password: hashedPass, isActive: true }));
    console.log(`  ✅ ${u.email} (${u.role})`);
  }

  // ── 3. HOUSEHOLDS ─────────────────────────────────────────────────────────────
  console.log("\n🏠 Seeding households...");
  const householdRepo = AppDataSource.getRepository(Household);

  const households = [
    { hhid: "HH001", city: "Yerevan",  region: "Yerevan", phone: "+37491000001", contact: "Armen Petrosyan" },
    { hhid: "HH002", city: "Gyumri",   region: "Shirak",  phone: "+37491000002", contact: "Narine Grigoryan" },
    { hhid: "HH003", city: "Vanadzor", region: "Lori",    phone: "+37491000003", contact: "Hayk Sargsyan" },
  ];

  const createdHouseholds: Household[] = [];

  for (const h of households) {
    const existing = await householdRepo.findOneBy({ hhid: h.hhid });
    if (existing) {
      console.log(`  ⚠️  Household ${h.hhid} already exists — skipping`);
      createdHouseholds.push(existing);
      continue;
    }
    const hh = householdRepo.create({
      hhid: h.hhid,
      city: h.city,
      region: h.region,
      contactName: h.contact,
      phoneNumberEncrypted: encryptPhone(h.phone),
    });
    const saved = await householdRepo.save(hh);
    createdHouseholds.push(saved);
    console.log(`  ✅ ${h.hhid} — ${h.contact} (${h.city})`);
  }

  // ── 4. METERS ────────────────────────────────────────────────────────────────
  console.log("\n📡 Seeding meters...");
  const meterRepo = AppDataSource.getRepository(Meter);

  const meters = [
    { meterId: "IM000001", householdIdx: 0 },
    { meterId: "IM000002", householdIdx: 1 },
    { meterId: "IM000003", householdIdx: 2 },
  ];

  for (const m of meters) {
    const existing = await meterRepo.findOneBy({ meterId: m.meterId });
    if (existing) {
      console.log(`  ⚠️  Meter ${m.meterId} already exists — skipping`);
      continue;
    }
    await meterRepo.save(meterRepo.create({
      meterId: m.meterId,
      assignedHouseholdId: createdHouseholds[m.householdIdx].id,
      isAssigned: true,
    }));
    console.log(`  ✅ ${m.meterId} → ${createdHouseholds[m.householdIdx].hhid}`);
  }

  // ── DONE ─────────────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────────");
  console.log("Login credentials (password: Test@1234):");
  console.log("  Developer:     dev@crm.test");
  console.log("  Panel Manager: manager@crm.test");
  console.log("  Call Agent 1:  agent1@crm.test");
  console.log("  Call Agent 2:  agent2@crm.test");
  console.log("\nNext steps:");
  console.log("  1. Log in as dev@crm.test");
  console.log("  2. Create rules via the Rules Management page");
  console.log("  3. Run: npm run seed:events-dev  (to seed test events)");

  await AppDataSource.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});