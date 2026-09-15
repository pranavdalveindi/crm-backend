import "reflect-metadata";
import { AppDataSource } from "../connection";
import { CRMUser, CRMUserRole } from "../entities/CRMUser";
import { hashPassword } from "../../utils/encryption";

/**
 * Creates the initial CRM developer account in `crm_users`.
 * Replace the values below with the account you want to seed.
 */
export const seedAdmin = async () => {
  const ownsDataSource = !AppDataSource.isInitialized;
  if (ownsDataSource) await AppDataSource.initialize();

  const crmUser = {
    email: "dev@gmail.com",
    password: "Test@1234",
    name: "Dev Bro",
    role: CRMUserRole.DEVELOPER,
  };

  if (
    crmUser.email === "replace-with-crm-user@example.com" ||
    crmUser.password === "replace-with-a-strong-password"
  ) {
    if (ownsDataSource) await AppDataSource.destroy();
    throw new Error("Set the CRM user email and password in src/database/seeds/admin.ts before running the seed");
  }

  try {
    const repo = AppDataSource.getRepository(CRMUser);
    const existingUser = await repo.findOneBy({ email: crmUser.email });

    if (existingUser) {
      console.log("CRM user already exists – skipping seed");
      return;
    }

    await repo.insert({
      email: crmUser.email,
      password: await hashPassword(crmUser.password),
      name: crmUser.name,
      role: crmUser.role,
      isActive: false,
    });

    console.log(`CRM user seeded: ${crmUser.email}`);
  } finally {
    if (ownsDataSource) await AppDataSource.destroy();
  }
};

// Allow direct execution: node dist/database/seeds/admin.js
if (require.main === module) {
  seedAdmin().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
