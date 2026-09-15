"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
require("reflect-metadata");
const connection_1 = require("../connection");
const CRMUser_1 = require("../entities/CRMUser");
const encryption_1 = require("../../utils/encryption");
/**
 * Creates the initial CRM developer account in `crm_users`.
 * Replace the values below with the account you want to seed.
 */
const seedAdmin = async () => {
    const ownsDataSource = !connection_1.AppDataSource.isInitialized;
    if (ownsDataSource)
        await connection_1.AppDataSource.initialize();
    const crmUser = {
        email: "dev@gmail.com",
        password: "Test@1234",
        name: "Dev Bro",
        role: CRMUser_1.CRMUserRole.DEVELOPER,
    };
    if (crmUser.email === "replace-with-crm-user@example.com" ||
        crmUser.password === "replace-with-a-strong-password") {
        if (ownsDataSource)
            await connection_1.AppDataSource.destroy();
        throw new Error("Set the CRM user email and password in src/database/seeds/admin.ts before running the seed");
    }
    try {
        const repo = connection_1.AppDataSource.getRepository(CRMUser_1.CRMUser);
        const existingUser = await repo.findOneBy({ email: crmUser.email });
        if (existingUser) {
            console.log("CRM user already exists – skipping seed");
            return;
        }
        await repo.insert({
            email: crmUser.email,
            password: await (0, encryption_1.hashPassword)(crmUser.password),
            name: crmUser.name,
            role: crmUser.role,
            isActive: false,
        });
        console.log(`CRM user seeded: ${crmUser.email}`);
    }
    finally {
        if (ownsDataSource)
            await connection_1.AppDataSource.destroy();
    }
};
exports.seedAdmin = seedAdmin;
// Allow direct execution: node dist/database/seeds/admin.js
if (require.main === module) {
    (0, exports.seedAdmin)().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
//# sourceMappingURL=admin.js.map