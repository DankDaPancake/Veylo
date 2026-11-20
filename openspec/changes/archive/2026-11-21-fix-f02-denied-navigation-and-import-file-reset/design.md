## Context

See [proposal.md](proposal.md) for scope and [the delta](specs/order-intake-interactions/spec.md) for behavior. A short design is warranted because denied-state navigation and file-input remounting need precise recovery boundaries before coding.

In `src/app/orders/workspace.tsx`, `open()` clears the current error but retains `selected`. The common back control omits the denial guard and cancellation calls `open("detail")`, so a denied response can be dismissed without another access check. Other local detail controls already live inside guarded branches.

The file picker exists only in the import `pick` phase. Confirmation runs from `preview`, where that input is unmounted. Its error handler chooses `report` for numeric-row diagnostics or `pick` otherwise, but retains `file`. Returning to `pick` creates an empty native input while subsequent submission reads the old React `File` state. Existing API and form-helper tests do not exercise these component transitions. Exploration executed actual component handlers with mocked hooks/fetch/FormData; that evidence is not a real-browser reproduction.

## Goals / Non-Goals

**Goals:** close the cached-detail recovery path and keep visible file selection consistent with the upload state using the existing component's guards and phase transitions.

**Non-Goals:** clear all cached application data, redesign authentication/navigation, change CSV validation or backend authorization, introduce upload retry guarantees, or add a component-test framework.

## Decisions

1. Add `!denied` to the common non-list back-control condition, retaining `!unavailable`. This also hides that control in denied create/edit/import modes, where explicit 401/403 recovery remains available. Keep the separate 404 Back to orders action and authorized dismissal/conflict behavior. Re-fetching details on every cancellation dismissal or introducing a second authorization flag would add unnecessary behavior/state.
2. In the import catch branch, compute the existing diagnostic-based destination once. Clear preview as today; clear `file` only when the submitted phase was `preview` and the destination is `pick`; then set that destination. Do not clear every error: a picker-origin failure leaves the input mounted, so retaining its selection is correct. Row reports keep their current replacement action, whose `open("import")` already clears file and preview.
3. Leave one focused Node regression file at `src/tests/orders-workspace.test.mjs`, using installed TypeScript/React and Node's test/assert/vm facilities to execute actual component handlers with mocked hooks, fetch and FormData. Reuse the exploration approach, keep it local to this test, and assert rendered controls, request count/endpoint and uploaded file identity. Avoid a duplicated recovery implementation, source-string-only assertions or extracting production helpers purely for tests. Native file-input behavior also needs a targeted browser check using available local browser tooling and mocked responses.

## Verification

| Case | Required observation |
| --- | --- |
| Cancel receives 401 / 403 separately | Corresponding recovery link visible; local back control, cached detail and Edit/Cancel absent; no automatic follow-up request or replay. |
| Authorized cancellation dismissal / 409 / success | Ordinary Keep order/Back to detail, conflict reload and saved CANCELLED detail/reason remain correct. |
| Preview confirmation receives network error / 500 / file-level 400 | Picker returns empty; retained upload is cleared; Check CSV without selection sends no request; a new selection checks the replacement file. |
| Picker-origin non-row failure | Still-mounted selection and state remain aligned for deliberate retry. |
| Row diagnostics / replacement / success | Row report and diagnostics remain; replacement clears the previous upload; successful confirmation reaches complete and clears file. |
| Separate 404 recovery | Back to orders remains available without revealing the missing order. |

Run `npm test`, `npm run lint`, `npm run typecheck` and `npm run build` from `src`, following its documented setup. Use existing browser tooling for a focused client walkthrough with intercepted order responses and synthetic fixtures; no database mutation is necessary for these UI regressions. Record actual commands/results in the implementation handoff, distinguishing mocked component/browser evidence from real backend integration.

## Risks / Trade-offs

- Mocked hooks do not prove native DOM behavior; verify the remounted picker and denied controls in a real browser as well.
- Over-broad file clearing would discard a visible selection after picker validation; include the preservation case in regression coverage.
- Removing all back navigation would break ordinary dismissal or 404 recovery; keep their existing branches and positive checks.
- A network/500 response does not establish whether a remote import committed. This change fixes local picker consistency and introduces no new rollback or idempotency claim.

## Migration Plan

No data migration, dependency addition or deployment is required for this change. Apply the component/test diff on the task branch for review; rollback is a normal revert of that diff without data conversion. Publication and merging remain separate user-authorized actions.
