## Context

See [proposal.md](proposal.md) and [interaction spec](specs/order-intake-interactions/spec.md). The user selected prototype behavior. `workspace.tsx` currently commits a file immediately, ignores returned saved orders and clears selection on success. It shows inline errors but has no focused linked summary. Existing POST/PATCH/cancel routes return the saved order, so successful detail navigation needs no new persistence. The atomic import service already checks current hub codes and unique races. `parseOrdersCsv` currently throws field/in-file diagnostics before querying same-hub duplicates; the prototype mixed sample expects both in one report.

## Goals / Non-Goals

**Goals:** Match authored interaction states and data safeguards through existing UI/services, with no second validation algorithm or stored preview state.

**Non-Goals:** Redesigning the kit, altering business validation, enforcing preview through an unforgeable server token, changing the legacy atomic commit API or resolving unrelated QA acceptance questions.

## Decisions

1. Add guarded multipart `POST /api/orders/import/preview` using the same Dispatcher/hub guard and file limits as commit. Return normalized preview records/count for clean files; return existing structured errors for invalid batches. It performs read-only parsing and current-hub duplicate queries, never creates orders or stores preview records. Reuse the existing commit endpoint for explicit confirmation; it revalidates the original File in full and relies on the unique constraint/transaction against races. A client-only parser cannot establish existing-hub duplicates, while persistent preview/session tables would require unnecessary schema/lifecycle decisions.
2. Refactor the existing CSV validator to expose shared analysis (valid parsed records, all syntactically valid normalized codes with record numbers, validation/in-file diagnostics). Keep the existing throwing parse wrapper and commit error behavior compatible. Preview can query current hub codes even when another record has validation errors and merge all relevant diagnostics. File-level errors retain file semantics; incorrect record width must identify the record as the prototype requires. Never include other-hub codes or raw source CSV in logs.
3. Add explicit picker/checking/preview/report/committing/complete UI states, retaining only the selected File and current preview in memory. Use the same original File on confirmation, clear stale preview after replacement/conflict and prevent duplicate submits. Display the actual row/valid/affected counts and zero saved on check/error/cancel. Escape all CSV values through React; render a scrollable labeled preview table for the existing maximum500 records. Show template/replacement and cancellation/View orders controls as authored.
4. Use returned order objects to open saved detail after create/edit/cancel. Show immutable code read-only during edit but omit it from payload. Add discard/back-to-detail/keep-order controls and state/conflict recovery, including retained cancellation reason after reload. Keep list/filter behavior and year-0001 formatting intact. Do not simulate prototype outcomes using fixture-specific branching.
5. Focus linked summaries after validation/state changes using refs/effects; keep inline labels/errors and entered values. Include client-native invalid submission paths in the summary behavior rather than allowing native validation to bypass the required summary. CSV diagnostics use record/column/reason and totals; denied access preserves existing server enforcement and offers sign-in/access recovery without replay.
6. Test shared analysis and read-only API permission/no-write behavior, including mixed diagnostics and post-preview races; keep existing commit/API regression expectations intact. Browser evidence must follow actual preview/confirm/cancel plus create/edit/cancel/detail/error-focus paths at1440×900 and1280×720, keyboard and saved readback. Preserve all historical evidence; final BOOYAH-17 committed-build acceptance remains separate.

## Risks / Trade-offs

- Shared parser refactor changes API diagnostics -> preserve existing status/contracts and run original unit/integration suites; add specific mixed-diagnostic assertions.
- Concurrent changes invalidate preview -> commit revalidation and atomic rollback; require a fresh check after conflict.
- Row payload and large tables affect readability -> bounded500-record source contract, labeled scroll region, existing CSS; no new table framework.
- Missing review/handout/commit -> retain pending QA states; never turn local parity checks into final acceptance.

## Migration Plan

No schema or migration. Preview is an additive read-only endpoint; existing import remains compatible. Roll back UI and preview/service changes together without rewriting stored orders. Only isolated local DB/server tests are authorized; no shared deployment, push or archive is implied.
