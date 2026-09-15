"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPhoneToHouseholds1770000000001 = void 0;
class AddPhoneToHouseholds1770000000001 {
    constructor() {
        this.name = "AddPhoneToHouseholds1770000000001";
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "households"
      DROP COLUMN IF EXISTS "phone_number_encrypted",
      DROP COLUMN IF EXISTS "contact_name"
    `);
        // Note: not dropping city/region as they may already exist in production
    }
}
exports.AddPhoneToHouseholds1770000000001 = AddPhoneToHouseholds1770000000001;
//# sourceMappingURL=1770000000001addphonetohouseholds%20.js.map