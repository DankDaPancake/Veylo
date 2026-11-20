## Context

See [proposal.md](proposal.md). The existing `formValue` in `src/app/orders/workspace.tsx` feeds list/detail formatting and edit inputs. For UTC instants it uses `Intl.DateTimeFormat` with `Asia/Ho_Chi_Minh`: year 0001 becomes `1-01-01 07:06`, incompatible with the accepted fixed UTC+7 parser and native datetime-local control. `src/lib/orders/validation.ts` already exports pure `localInput(Date)`, which returns padded `YYYY-MM-DD HH:mm` by applying UTC+7. `orderPayload` reverses the input separator for requests.

## Goals / Non-Goals

**Goals:** Restore the existing valid-window round-trip contract in every consumer of the shared UI formatter, with one runnable regression check exercising the actual UI conversion.

**Non-Goals:** Changing historical timezone policy or API parsing, reducing accepted dates, certifying non-UTC PostgreSQL behavior, adding a date library or a second formatting algorithm.

## Decisions

1. Reuse `localInput(date).replace(" ", "T")` for valid persisted UTC instants. Preserve existing blank/default, non-window and local-input fallback handling. This matches the accepted parser and retains the browser-required `T` separator. Keeping Intl would retain historical offset and unpadded-year defects; rejecting early dates would change requirements.
2. Keep `formValue` directly testable with minimal edits. If the existing test command cannot import the TSX component, move only this pure helper into the existing `order-form.mjs` form helper module, then have the component and regression test use that exact implementation. No new framework, parallel date algorithm or unrelated refactor. Keep the shared validator client-safe; do not introduce server/database imports into the client bundle.
3. Check year 0001, an ordinary 2026 date and the upper accepted local-year boundary against parser/formatter/payload round-trip assertions. Include non-window/default/fallback assertions only where the helper move risks changing them. The production browser must independently show padded detail values, populated valid edit inputs and successful allowed edit/save/reload with unchanged windows and order identity.
4. Preserve original failing evidence. Append a dated fix/retest record with application hash and dirty-file disclosure to the QA evidence/report. BOOYAH-17 final committed-build acceptance and human/source decisions stay separate; do not mark its full matrix passed or archive it based on this narrow correction.

## Risks / Trade-offs

- Client import grows a server dependency chain -> inspect the pure validator imports and verify the production build.
- API accepted values can include UTC-day rollover -> include the highest accepted local-year value and preserve exact saved instants after browser edit.
- Pure assertions miss native input rejection -> verify actual datetime-local `.value` and validity in the production browser on an isolated UTC demo database.
- New screenshots overwrite baseline evidence -> use a new fix-specific evidence folder and retain original observations.

## Migration Plan

No schema, migration, API compatibility or stored-data change. Apply the code correction, run documented checks, and rebuild/restart only the task-owned local server for browser retest. Reverting the code restores earlier behavior without rewriting data. No shared deployment or publication is authorized.
