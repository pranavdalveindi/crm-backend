// src/database/migrations/1770000000001-AddPhoneToHouseholds.ts
import type { MigrationInterface, QueryRunner } from "typeorm";
export class AddPhoneToHouseholds1770000000001 implements MigrationInterface {
  name = "AddPhoneToHouseholds1770000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add encrypted phone number column — select: false in entity keeps it hidden by default
    await queryRunner.query(`
      ALTER TABLE "households"
      ADD COLUMN IF NOT EXISTS "phone_number_encrypted" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "contact_name" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "city" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "region" VARCHAR(100)
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "households"."phone_number_encrypted"
      IS 'AES-256-GCM encrypted phone number. Format: iv:authTag:ciphertext. Never expose raw.'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "households"
      DROP COLUMN IF EXISTS "phone_number_encrypted",
      DROP COLUMN IF EXISTS "contact_name"
    `);
    // Note: not dropping city/region as they may already exist in production
  }
}