# AGENT.md - AI Developer Guide for CRM Backend

Welcome, AI Agent! This document provides a complete technical map of the **Inditronics CRM Portal Backend** (`crm-backend`). Read this document before making code modifications or adding new features.

---

## 1. Project Overview & Tech Stack

- **Project Name:** Inditronics CRM Portal Backend (`crm-backend`)
- **Runtime & Language:** Node.js (v24+ compatible), TypeScript (ES2020/CommonJS / Node16 module resolution)
- **Web Framework:** Express.js + WebSocket Server (`ws`)
- **Database:** PostgreSQL (AWS RDS or Neon Serverless PostgreSQL)
- **ORM:** TypeORM v0.3 (`DataSource`) with Experimental Decorators & Metadata enabled
- **Security & Auth:** `bcryptjs` password hashing, JWT authentication (`jsonwebtoken`), HTTP-only signed cookies (`crm_access_token`), Express `helmet`, CORS filtering

---

## 2. Project Architecture & Directory Map

```
crm-backend/
├── src/
│   ├── api/                    # REST API Modules
│   │   ├── auth/               # CRM User Authentication & Password Change
│   │   │   ├── crm-auth.controller.ts
│   │   │   ├── crm-auth.middleware.ts
│   │   │   └── crm-auth.routes.ts
│   │   ├── crm/                # Core CRM Domain Modules
│   │   │   └── rules/          # CRM Rules Engine (CRUD + Preview)
│   │   │       ├── rules.controller.ts
│   │   │       ├── rules.entity.ts
│   │   │       ├── rules.routes.ts
│   │   │       └── rules.service.ts
│   │   ├── events/             # Device Telemetry Events API
│   │   └── index.ts            # Main API Router (/api/v1)
│   ├── config/                 # Environment & Config Loaders
│   │   ├── env.ts              # System Environment Parser
│   │   └── jwt.ts              # JWT signing & verification utilities
│   ├── database/               # Database Connection & Entities
│   │   ├── connection.ts       # TypeORM DataSource with Neon SNI support
│   │   ├── tunnel.ts           # SSH Tunnel Manager (`tunnel-ssh`)
│   │   ├── entities/           # All TypeORM Entity Definitions
│   │   │   ├── CRMUser.ts      # CRM User entity (roles, mustChangePassword)
│   │   │   ├── CRMRule.ts      # Rule engine entity
│   │   │   ├── CRMCallList.ts  # Call Queue entity (status, 30-min locks)
│   │   │   ├── CRMCallLog.ts   # Call attempt logs & S3 audio URLs
│   │   │   ├── CRMTicket.ts    # Support Ticket entity
│   │   │   ├── CRMTicketUpdate.ts # Ticket audit log entity
│   │   │   └── ...             # System entities (User, Household, Member, Event, etc.)
│   │   └── seeds/              # Database Seeding Scripts (e.g. admin.ts)
│   ├── middleware/             # Express Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts # Joi Request Validator
│   │   └── role.middleware.ts
│   ├── utils/                  # Encryption (`bcryptjs`) & Response Formatters
│   ├── app.ts                  # Express App Initialization & WebSockets
│   └── server.ts               # Application Main Entry Point
├── dist/                       # Compiled JavaScript Output
├── .env                        # Environment Configuration
├── tsconfig.json               # TypeScript Compiler Config
└── package.json                # Dependencies & Scripts
```

---

## 3. Key Concepts & Workflows

### A. Database Connection & SSH Tunnel
- Connection configuration is managed via `src/database/connection.ts` and `src/database/tunnel.ts`.
- **SSH Tunneling:** If `USE_SSH_TUNNEL=true` in `.env`, `createDbTunnel()` opens a bastion SSH connection (`tunnel-ssh`) on a local port (default: `55432`) before TypeORM initializes `AppDataSource`.
- **Neon PostgreSQL & SNI Support:** When connecting through an SSH tunnel to Neon DB, `connection.ts` passes `servername: env.postgres.host` inside `ssl` options and `extra: { options: "endpoint=<endpoint_id>" }` to ensure Neon's proxy correctly routes SNI traffic.

### B. CRM User Authentication & Roles
- **Entity:** `CRMUser` (`crm_users` table). CRM accounts are kept strictly isolated from regular application users.
- **Roles:** Defined in `CRMUserRole` enum:
  - `developer`: Full access (can create/update/toggle/preview CRM rules).
  - `panel_manager`: Panel management and ticketing operations.
  - `call_agent`: Call processing and list updates.
- **First-Time Password Change:**
  - Column `must_change_password` (default `true`).
  - `POST /api/v1/auth/login` and `GET /api/v1/auth/me` return `mustChangePassword: boolean` in the user payload.
  - Users change their password via `POST /api/v1/auth/change-password` (requires `currentPassword`, `newPassword`, `confirmPassword`), which sets `mustChangePassword` to `false`.

### C. CRM Rules Engine
- **Entity:** `CRMRule` (`crm_rules` table). Stores automated rules targeting telemetry event types (e.g. connectivity dropouts, unrecognized image events).
- **Preview Engine:** `GET /api/v1/crm/rules/:id/preview` evaluates a rule against real event records in the `events` table without modifying state, returning the list of device IDs that match.

---

## 4. Development Guidelines & Important Rules for AI Agents

1. **Building & Execution:**
   - Always run `npx tsc` after modifying TypeScript files in `src/` to recompile into `dist/` before running `npm run start`.
   - For fast development execution without building, use `npx tsx src/server.ts`.
2. **Database & Entity Changes:**
   - Do not set `synchronize: true` in `AppDataSource` as production/staging schema already exists.
   - When adding or modifying columns on entities, ensure the corresponding SQL migration / `ALTER TABLE` statement is provided or documented for the database schema.
3. **API Response Formatting:**
   - Always return HTTP responses using the utility helpers in `src/utils/response.ts`:
     - `sendSuccess(res, data, message, statusCode)`
     - `sendError(res, message, statusCode)`
4. **Validation:**
   - Use `validationMiddleware` with `Joi` schemas on route definitions to validate `body`, `query`, or `params`.

---

## 5. Common Scripts & Commands

```bash
# Rebuild TypeScript to dist/
npx tsc

# Start production server (runs dist/server.js)
npm run start

# Run server directly with TSX (Development mode)
npx tsx src/server.ts

# Seed initial CRM Admin User
npx tsx src/database/seeds/admin.ts
```