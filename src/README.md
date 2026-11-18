# Veylo application foundation — BOOYAH-12

Node **24.20.0**, Next **16.4.6**, React **19.3.1**, TypeScript **5.9.3**, Tailwind **4.3.5**, Prisma **7.10.1**, OpenSpec **1.16.0**, PostgreSQL **18.7**. Exact dependencies are locked in package-lock.json. No global OpenSpec/Prisma install is needed. This is an application foundation, without business models, auth or order features.

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

The Prisma probe runs **SELECT 1** only. Invalid/missing URL, unavailable DB and a 20-second subprocess timeout exit nonzero with no connection-string output. `npm run db:migrate` and `npm run db:seed` intentionally exit nonzero naming **BOOYAH-13/19**: no approved domain schema or seed exists yet. Do not add a fake model just to generate Prisma Client. Full N15 (independent clean machine plus synthetic seed in ≤30 minutes) remains pending those tasks and a second member.

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

Kiệt confirmed instructor/TA approval for OpenSpec instead of GitHub Spec Kit on 17 November 2026. The setup files were carried from `docs/openspec-setup` into this local starter branch. The `app-foundation` change was created by the pinned CLI; its artifacts were AI-authored under the approved design, not fabricated CLI-generated content or five-person training.

Open the repository root as the coding-agent workspace. OpenSpec artifacts are in [../openspec/](../openspec/), governance is in [../constitution.md](../constitution.md), and agent skills/commands are at the repository root. The pinned CLI dependency stays in `src`; the following commands run from `src` after `npm ci` and discover the parent OpenSpec directory. A globally installed `openspec` CLI can also run directly from the repository root. PA2's submitted-artifact placement under `src` remains a separate requirement.

```powershell
$env:OPENSPEC_TELEMETRY='0'
npx --no-install openspec status --change app-foundation
npm run spec:validate
npx --no-install openspec new change <your-change-name>
```

Write the proposal, specs with WHEN/THEN scenarios, design and owner tasks before implementation. New requirements/business schema still need concrete approval. Keep the foundation change unarchived until peer acceptance. No shared Git merge, CI run, deployment or five-member walkthrough is claimed. The Figma kit belongs to BOOYAH-25; it is not an implemented order UI.
