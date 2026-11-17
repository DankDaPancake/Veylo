## Context

Use one repository, app root src, Node 24, Next App Router, TypeScript, Tailwind and PostgreSQL with Prisma. Package-lock pins resolved dependencies. Existing OpenSpec setup files are carried from docs/openspec-setup into this local branch; no remote merge is claimed.

## Goals / Non-Goals

Goals: working app, truthful application health, read-only DB probe, credential-safe failure paths, reproducible commands.
Non-goals: business schema, fake probe model, migrations, synthetic order seed, auth/order workflows, cloud deployment, paid requests.

## Decisions

- GET /api/health reports application scope only, so app startup does not depend on DATABASE_URL.
- A dedicated CLI validates DATABASE_URL and invokes Prisma db execute with a SELECT 1 SQL file. Child output is captured, never echoed with connection credentials. It exits nonzero on invalid config, unavailable database or timeout.
- An empty PostgreSQL datasource has no generator/models. Do not run prisma generate to simulate progress; BOOYAH-19 introduces client generation together with the approved schema.
- db:migrate and db:seed exit nonzero with an explicit pending-owner message until BOOYAH-13/19 land. No no-op success.
- Compose binds PostgreSQL to 127.0.0.1:54339 and uses a dedicated volume/project. A local native isolated cluster may verify the same probe if Docker is unavailable; it is not proof Compose ran.
- One build/test worker, no heap increase, no remote font request. Existing protected-branch/human-review gates remain.

## Risks / Trade-offs

The model-free foundation cannot satisfy the full N15 seeded clean-machine walkthrough; that acceptance awaits BOOYAH-19 and another member. PostgreSQL availability is checked separately from application health. No policy decision is hidden in a database model or sample UI.

## Migration Plan

No application migration is required. Future approved schema changes use a new OpenSpec change and the BOOYAH-13 contract. Remove the local foundation branch to discard the scaffold; preserve the original use-case checkout.
