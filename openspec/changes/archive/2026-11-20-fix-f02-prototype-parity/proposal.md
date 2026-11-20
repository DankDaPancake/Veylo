## Why

BOOYAH-17 found that the integrated F02 application bypasses the prototype's read-only CSV preview and returns successful mutations to the list instead of the retained detail. The user explicitly directed “Tuân theo prototype cho mình” on 20 November 2026; implementation must follow the authored UC05–UC08 flows rather than waive the mismatches.

## What Changes

- Add authorized read-only CSV checking with preview/counts and record/column/reason diagnostics; no orders saved before explicit confirmation.
- Follow the prototype's confirmation, cancellation, completion and conflict/retry paths while retaining atomic commit and current authorization checks.
- Open saved detail after create/edit/cancel, support discard/back-to-detail without mutation, show protected order identity, and focus linked validation summaries while retaining input.
- Retest real production UI states against the existing prototype and return evidence to BOOYAH-17.

In scope: UC05–UC08 interaction parity, accessible error/recovery states and necessary read-only API support. Out of scope: business validation changes, schema/migrations, new dependencies, new roles, favicon, historical non-UTC adapter defects, full NFR certification, final QA acceptance and archival. Preserve the already corrected year-0001 formatter.

## Capabilities

### New Capabilities

- `order-intake-interactions`: Prototype-governed F02 preview/confirmation, mutation navigation and accessible recovery. This complements the existing order-intake API/data rules; it does not duplicate their pending original delta.

### Modified Capabilities

None. The original `f02-order-intake` behavioral contracts remain unchanged.

## Impact

Expected files: `src/app/orders/workspace.tsx`, existing form helper/styles, `src/lib/orders/csv.ts` and `service.ts`, a guarded read-only preview route, existing unit/integration suites, and scoped browser evidence. No database compatibility or migration change; existing atomic import remains the commit endpoint and revalidates every request. User direction authorizes matching the prototype; this planning record is not human acceptance of the resulting implementation.

Sources: [UC-F02](../../../../docs/analysis-and-design/use-cases/UC-F02-Orders.md), [prototype](../../../../docs/analysis-and-design/use-cases/prototypes/order-intake/index.html), [QA triage](../../../../docs/test/f02-verification/triage.md). The official course handout remains unavailable locally; no handout-compliance claim is made.
