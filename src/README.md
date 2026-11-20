# Veylo application foundation — BOOYAH-12

Node **24.20.0**, Next **16.4.6**, React **19.3.1**, TypeScript **5.9.3**, Tailwind **4.3.5**, Prisma **7.10.1**, OpenSpec **1.16.0**, PostgreSQL **18.7**. Exact dependencies are locked in package-lock.json. No global OpenSpec/Prisma install is needed. The foundation now includes BOOYAH-18 authentication and the BOOYAH-19 F02 database/API. Order screens remain BOOYAH-16 work.

## First setup

From the repository root, with Node 24 installed:

```powershell
cd src
npm ci
Copy-Item .env.example .env
npm run dev
```

Open http://127.0.0.1:3000. The landing page and `GET /api/health` work without DATABASE_URL. The endpoint returns `{"status":"ok","service":"veylo","scope":"application"}` and does not check database readiness. `POST /api/health` is unsupported.

`.env.example` contains local-only example credentials. Keep actual credentials in ignored `.env`; never paste them into logs, issues or commits. Node loads `.env` for `db:check`; Next loads it for the app. To use raw Prisma commands with `.env`, invoke its CLI with Node's environment loader as below.

## Local database

If Docker Desktop works, run from the repository root:

```powershell
docker compose up -d postgres
docker compose ps
cd src
npm run db:check
node --env-file=.env node_modules/prisma/build/index.js validate
```

Compose uses project `veylo-local`, a dedicated volume and **127.0.0.1:54339**. The example password is local-only; `VEYLO_LOCAL_DB_PASSWORD` can override it when creating a new volume, and DATABASE_URL must match. Do not reuse the example in a shared environment. Changing the variable does not change a password already stored in an existing volume. `docker compose stop` preserves data; never delete a volume to diagnose a connection problem.

Docker Desktop was unavailable on the verification workstation. The real connection check therefore used the free Windows PostgreSQL binary archive linked by [postgresql.org](https://www.postgresql.org/download/windows/) via [EDB](https://productsdl.enterprisedb.com/download-postgresql-binaries). Compose execution remains unverified. A dedicated native cluster on the same localhost port is an alternative; do not run both simultaneously. On Windows, launch background helpers hidden. If starting `pg_ctl` with PowerShell, use `Start-Process -PassThru`, then the returned process's `.WaitForExit()`; `Start-Process -Wait` also waits for the long-running PostgreSQL descendants.

The Prisma probe runs **SELECT 1** only. Invalid/missing URL, unavailable DB and a 20-second subprocess timeout exit nonzero with no connection-string output. `npm run db:migrate` applies the approved shared initial migration; `npm run db:seed` initializes synthetic fixtures under the explicit restrictions below. Do not apply migrations to shared/production data without database-change authorization. Full N15 (independent clean machine plus synthetic seed in ≤30 minutes) remains pending a second member's verification.

## Verification

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm run start
```

Tests use one worker; Next build uses `experimental.cpus: 1`. Before heavy jobs, require ≥8 GiB free physical RAM. Do not raise heap limits or stop unrelated work. `npm run build` uses webpack explicitly for reproducibility. No remote font or paid service is required.

With the dedicated PostgreSQL running, this explicit integration probe also verifies missing/malformed URLs and a TCP server that accepts a connection but never answers the PostgreSQL handshake:

```powershell
node --env-file=.env scripts/probe-foundation.mjs
```

The probe opens only an ephemeral localhost test port, performs a read-only query, takes about 20 seconds and closes its test listener. It does not stop your real database.

## OpenSpec workflow and handoff

Kiệt confirmed instructor/TA approval for OpenSpec instead of GitHub Spec Kit on 17 November 2026. The application foundation and the root OpenSpec setup were merged into `dev` in PRs #6 and #7. The `app-foundation` change was created by the pinned CLI; its artifacts were AI-authored under the approved design, not fabricated CLI-generated content or five-person training.

Open the repository root as the coding-agent workspace. OpenSpec artifacts are in [../openspec/](../openspec/), governance is in [../constitution.md](../constitution.md), and agent skills/commands are at the repository root. The pinned CLI dependency stays in `src`; the following commands run from `src` after `npm ci` and discover the parent OpenSpec directory. A globally installed `openspec` CLI can also run directly from the repository root. PA2's submitted-artifact placement under `src` remains a separate requirement.

```powershell
$env:OPENSPEC_TELEMETRY='0'
npx --no-install openspec status --change app-foundation
npm run spec:validate
npx --no-install openspec new change <your-change-name>
```

Write the proposal, specs with WHEN/THEN scenarios, design and owner tasks before implementation. New requirements/business schema still need concrete approval. Keep the foundation change unarchived until peer acceptance. The Figma kit belongs to BOOYAH-25; it is not an implemented order UI.
## BOOYAH-18 local demo accounts

Generate Prisma Client with `npx --no-install prisma generate` after configuring a local `DATABASE_URL`. Set `BETTER_AUTH_URL` to the browser origin and supply a generated `BETTER_AUTH_SECRET` in local environment configuration. Use `/sign-in` to sign in and the home page to sign out.

The BOOYAH-19 seed calls `seedDemoAccounts` after resolving the two synthetic hubs. Use the same Prisma connection as the validated local URL. The seed requires `VEYLO_ENABLE_DEMO_SEED=1`, a localhost URL, non-production mode and disposable database `veylo_demo`; it verifies the connected database name before writing. It creates 50 synthetic orders across two hubs and preserves existing rows on replay.

| Demo login | Role |
| --- | --- |
| `admin@example.test` | Admin |
| `dispatcher-a@example.test` | Dispatcher, hub A |
| `dispatcher-b@example.test` | Dispatcher, hub B |
| `rider@example.test` | Rider |

The local demo password for these accounts is `Veylo-PA3-demo-only!`. Each credential account receives an independently salted scrypt hash.

## BOOYAH-19 F02 API and database verification

Use a fresh, dedicated PostgreSQL database named `veylo_demo` with database timezone set to UTC before migrating or seeding. On an isolated local cluster, set it with `ALTER DATABASE veylo_demo SET timezone TO 'UTC';` and reconnect. This setting preserves UTC instants in the Prisma PostgreSQL adapter. The application still accepts delivery windows in Ho Chi Minh City local time. The foundation Compose database named `veylo` is not a demo seed target. Configure `DATABASE_URL` in ignored local `.env`, then run from `src`:

```powershell
node --env-file=.env node_modules/prisma/build/index.js generate
node --env-file=.env node_modules/prisma/build/index.js validate
npm run db:migrate
$env:VEYLO_ENABLE_DEMO_SEED='1'
npm run db:seed
npm run db:check
npm run build
npm run start
```

Keep `BETTER_AUTH_URL` equal to the server's browser origin and configure `BETTER_AUTH_SECRET` before starting. In another terminal with the same local database environment and explicit seed opt-in, run:

```powershell
$env:VEYLO_ENABLE_DEMO_SEED='1'
node --env-file=.env --run test:integration
```

`VEYLO_TEST_URL` defaults to `http://127.0.0.1:3000`; set it to the running test server origin when using another port. The integration suite uses real Better Auth sign-ins and writes synthetic test orders. It checks seed replay, authorization on every F02 route, filtering/pagination, persisted edits/cancellation, 20-row CSV import, atomic failures and concurrent duplicate writes. It also expires Dispatcher A's sessions and briefly clears/restores its hub association. Use only an isolated demo database/server without other users; synthetic test orders remain for inspection. The script verifies database name and local target before writing. Normal `npm test` runs pure validation/parser and existing foundation/password tests without a database.

| Method | Endpoint | Request / result |
| --- | --- | --- |
| GET | `/api/orders` | `q`, `status`, inclusive hub-local `from`/`to`, `page`; returns `{ orders, total, page, pageSize: 20 }` |
| POST | `/api/orders` | Approved snake_case create fields; returns saved order, 201 |
| GET | `/api/orders/[id]` | Saved order, including current version |
| PATCH | `/api/orders/[id]` | Changed editable fields plus numeric `version`; returns saved order |
| POST | `/api/orders/[id]/cancel` | `{ reason, version }`; returns retained CANCELLED order |
| POST | `/api/orders/import` | Multipart `file`; returns `{ imported }`, 201 |
| GET | `/api/orders/template` | Guarded UTF-8 CSV download with a synthetic example |

Every endpoint uses the existing Dispatcher/session/hub guard. Administrator and Rider are denied. JSON validation errors contain `{ code, errors: [{ field, message, row? }] }`; CSV `row` counts records with header as record 1. Statuses are 400 for validation, 401/403 for access denial, 404 for unavailable or other-hub orders, and 409 for duplicates/stale or ineligible writes. The database enforces hub/code uniqueness. CSV writes are atomic, including duplicate races. Timestamps in responses are UTC instants; input windows use `YYYY-MM-DD HH:mm` in `Asia/Ho_Chi_Minh`. Decimal weight is returned as a JSON string to preserve precision. Edits reject identity, hub, state and audit fields; omitted editable fields retain their values.
