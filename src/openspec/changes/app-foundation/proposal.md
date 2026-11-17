## Why

BOOYAH-12 needs a reproducible application entry point before teammates implement the PA3 order slice. The repository currently contains OpenSpec setup documents but no runnable application.

## What Changes

- Add a pinned Next.js/TypeScript/Tailwind application under src with a landing page and application health endpoint.
- Add model-free PostgreSQL/Prisma connection verification, safe environment diagnostics and an optional local Compose configuration.
- Document setup, checks, OpenSpec use and the boundary to BOOYAH-13/19 business schema/seed work.
- Reconcile inherited setup text to approved CSV/photo POD/manual assignment scope.

## Capabilities

### New Capabilities
- `app-foundation`: local application startup and read-only database connectivity verification.

### Modified Capabilities
None.

## Impact

Only foundation configuration, documentation and application bootstrap are affected. No auth, orders, business tables, migrations, seed data, AI service or deployment is implemented. User approval on 2026-11-17 covers this design and confirms OpenSpec is accepted in place of Spec Kit. Peer review and shared-branch merge remain pending. Budget is 0 VND.
