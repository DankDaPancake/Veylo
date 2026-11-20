## Why

BOOYAH-17 found B17-UI-01: an accepted year-0001 order displays a shortened year and historical timezone minutes, and its edit window inputs are blank. This prevents valid saved windows from round-tripping through F02 detail/edit and keeps F02-06/F02-16 failed.

## What Changes

- Align presentation of persisted order windows with the existing validated UTC+7 local-window conversion, preserving four-digit years and native datetime-local values.
- Add a small regression check for minimum-year, ordinary-date and upper accepted-year round-trips; verify the rendered detail/edit/save/reload flow on the isolated demo environment.
- Record fresh fix evidence for BOOYAH-17 without replacing earlier failed observations.

In scope: B17-UI-01 presentation correction and focused regression evidence. Out of scope: favicon B17-UI-02, CSV preview/prototype reconciliation, non-UTC database-adapter investigation, new date limits, schema/migrations, permissions and final F02 acceptance/archive.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This restores the existing F02 window-validation, valid-edit and saved-detail contracts in [the original spec](../../f02-order-intake/specs/order-intake/spec.md); it introduces no requirement change. Metadata uses `skip_specs: true` rather than duplicating the still-active original order-intake delta.

## Impact

Expected application scope: `src/app/orders/workspace.tsx`, the existing pure form helper/tests if needed for direct runnable regression coverage, and the existing client-safe `localInput` export. No new dependency, API payload change, data rewrite or migration is needed. Existing saved UTC timestamps retain their values. Evidence/report updates belong under `docs/test/`; the AI log remains factual. See [triage](../../../../docs/test/f02-verification/triage.md) and [QA report](../../../../docs/test/PA3-F02-verification.md).

User authorized opening this separate change; this proposal does not claim implementation, human review or acceptance. Implementation ownership is pending; BOOYAH-17's recorded QA owner/reviewer are not automatically assigned to this fix.
