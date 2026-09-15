// src/database/connection.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import * as entities from "./entities";
import { env } from "../config/env";
import { getLocalDbHost, getLocalDbPort } from "./tunnel";

const dbHost = env.ssh.enabled ? getLocalDbHost() : env.postgres.host;
const dbPort = env.ssh.enabled ? getLocalDbPort() : env.postgres.port;

const endpointId = env.postgres.host.split(".")[0];

export const AppDataSource = new DataSource({
  type: "postgres",
  host: dbHost,
  port: dbPort,
  username: env.postgres.user,
  password: env.postgres.password,
  database: env.postgres.database,

  ssl: {
    rejectUnauthorized: false,
    servername: env.postgres.host,
  } as any,

  extra: env.postgres.host.includes("neon.tech")
    ? { options: `endpoint=${endpointId}` }
    : {},

  synchronize: false,
  logging: env.nodeEnv === "development",

  entities: Object.values(entities) as Function[],
  migrations: ["src/database/migrations/**/*.ts"],
});