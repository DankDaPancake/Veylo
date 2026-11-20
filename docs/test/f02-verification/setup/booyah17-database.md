# BOOYAH-17 disposable database setup
Performed by: Codex (AI-assisted local setup for BOOYAH-17 owner Nguyễn Thành Trung). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

Setup date: 2026-11-20. This records setup only; it does not claim F02 acceptance or a clean application build.

## Isolated target
Performed by: Codex (AI-assisted local setup). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

- Container: `veylo-booyah17-postgres`, PostgreSQL **18.7**, image `postgres@sha256:eb63372c1e05c755f55fa30cbd07aecc443676fc6c0fa90b9002d01537841e1a`, platform `linux/amd64`.
- Host binding: `127.0.0.1:54417` to container port `5432`. No host-wide port binding or shared Compose volume; Docker created a task-owned anonymous volume at /var/lib/postgresql.
- Database: `veylo_demo`; role timezone and database timezone report `UTC`.
- Environment: ignored `src/.env`, created only after confirming no existing file; permissions `0600`. It contains freshly generated local-only database/auth secrets. Values are intentionally omitted. `BETTER_AUTH_URL` and `VEYLO_TEST_URL` use `http://127.0.0.1:3017`.
- Runtime observed: Node `v24.22.2`, npm `11.19.1`; memory available before setup was 12 GiB, meeting the documented 8 GiB threshold.

## Commands and results
Performed by: Codex (AI-assisted local setup). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

- `npm ci --no-audit --no-fund` — passed; 562 packages installed from lockfile.
- `docker pull postgres:18.7` — passed; digest above.
- Initial container attempt exited because `initdb` does not accept `--timezone=UTC`. No database was initialized on that attempt. The stopped task-owned container was removed and recreated without that argument; `TZ=UTC`/`PGTZ=UTC` were set and the database and role defaults were explicitly set before migration/seed.
- `docker exec veylo-booyah17-postgres pg_isready -U veylo_qa -d veylo_demo` — passed after container startup.
- `docker exec ... psql ... -c "ALTER DATABASE veylo_demo SET timezone TO 'UTC'" -c "ALTER ROLE veylo_qa IN DATABASE veylo_demo SET timezone TO 'UTC'"` — both statements passed; a new connection reported `SHOW timezone = UTC`.
- `node --env-file=.env node_modules/prisma/build/index.js validate` — passed. Prisma Client generation was run successfully by the parent agent after dependencies installed.
- `npm run db:migrate` — passed; existing migration `20261120000100_f02_shared` applied to this new disposable database.
- `VEYLO_ENABLE_DEMO_SEED=1 npm run db:seed` — passed. Output reports two hubs, four demo accounts, 50 orders.
- `npm run db:check` — passed its Prisma `SELECT 1` connection check.
- `VEYLO_ENABLE_DEMO_SEED=1 npm run db:seed` replay — passed; after replay counts remained: Hub 2, User 4, Account 4, Order 50. `SHOW timezone` remained UTC.
- Public table names: `Account`, `Hub`, `Order`, `Session`, `User`, `Verification`, `_prisma_migrations`. No `DeliveryAttempt` table exists, consistent with the existing foundation schema; this is a table inventory observation, not scenario acceptance evidence.

The database is currently running for parent-owned integration checks. Stop only `veylo-booyah17-postgres` after those checks finish. Docker inspect confirmed an anonymous volume at /var/lib/postgresql. Stopping the container preserves the fixture state; a later intentional cleanup must remove only this task container and its own anonymous volume, not shared volumes. Do not copy `.env`, passwords, authentication secret, cookies, or real data into evidence or logs.
