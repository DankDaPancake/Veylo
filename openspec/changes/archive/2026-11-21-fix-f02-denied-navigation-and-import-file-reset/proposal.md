## Why

PR #22 review identified two UI regressions introduced by application commit `5d67ce8`: cancellation denied with HTTP 401/403 can reopen cached order details, and a failed CSV confirmation can return to an empty picker while retaining a file that Check CSV silently resends. Both were confirmed by source review and execution of the actual component handlers in an in-memory harness; they need bounded fixes before merge.

## What Changes

- Hide the common local back control while order access is denied, retaining the appropriate sign-in or staff-workspace recovery instead of reopening cached details.
- Clear the retained CSV file when a failed confirmation returns from preview to the picker after a non-row error. Keep picker-origin selection and row-report replacement behavior intact.
- Add focused UI regression coverage for both failures and nearby permitted recovery paths.
- **In scope:** these two recovery defects in `src/app/orders/workspace.tsx` and regression checks for the existing order-intake interactions.
- **Out of scope:** API or authentication redesign, database/schema/migrations, CSV contract changes, retry/idempotency policies, prototype redesign, unrelated cleanup, publication and merging.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `order-intake-interactions`: make denied cancellation navigation and CSV picker/file consistency explicit within the existing saved-detail and import-recovery contracts, preserving their current scenarios.

## Impact

- Application target: `src/app/orders/workspace.tsx`; existing Node test tooling and browser-check tooling can support focused regression coverage without new dependencies.
- No API, data, migration or deployment compatibility changes. The backend continues enforcing session, role, hub, state and version checks.
- The prior F02 verification remains historical evidence for its tested cases; it does not cover these two client-state transitions. No implementation or new runtime acceptance is claimed by this proposal.
