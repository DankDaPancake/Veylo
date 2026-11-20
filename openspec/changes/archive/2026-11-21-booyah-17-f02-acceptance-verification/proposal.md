## Why

BOOYAH-17 must verify the integrated F02 build before BOOYAH-30 records its demo. Auth/API/UI have merged, but existing evidence refers to earlier builds and the original F02 task 3.3 remains open.

## What Changes

- Create an English acceptance report at `docs/test/PA3-F02-verification.md` covering every scenario in the existing F02 spec, separate negative permission checks, evidence and actual command results.
- Verify a fresh disposable database, production UI, API authorization and persisted results on a recorded revision; track failures and retest fixes.
- Reconcile known prototype differences and pending Vision checkpoints with their owners without silently changing acceptance rules.
- Add a Section E README handoff mapping proposal/spec/design/tasks to the rubric and identifying the verified demo commit.
- After passing verification and resolving acceptance blockers, complete F02 task 3.3 and sync/archive the original `f02-order-intake` change using the archive skill. Preserve this QA change until its own work is complete.

In scope: acceptance verification, evidence, defect reporting, documentation and conditional F02 archival. Out of scope: new product behavior, schema/migrations, new test frameworks, accepting pending rules, full later-phase NFR certification, deployment, video publishing and course packaging. A discovered defect is not permission to change a requirement or schema.

## Capabilities

### New Capabilities

None. This is a verification/documentation change; metadata declares `skip_specs: true`.

### Modified Capabilities

None. The acceptance source is now `openspec/specs/order-intake/spec.md`; the original delta and planning artifacts are retained in `openspec/changes/archive/2026-11-21-f02-order-intake/`. No duplicate order-intake delta is introduced.

## Impact

- Planned deliverables: verification Markdown and matching PDF, synthetic evidence under `docs/test/f02-verification/`, Section E in root `README.md`, factual AI log, and original F02 task/archive updates after acceptance gates pass.
- Existing implementation and suites under `src` are verification inputs, not planned feature edits. No dependency, API contract, database or compatibility change is proposed.
- BOOYAH-17 owner: Nguyễn Thành Trung; independent reviewer: Trần Lê Hải, as recorded in Jira. No review is claimed. Jira's `src/openspec` and `docs/ai-logs` wording is stale; use the repository's root `openspec/` and `docs/ai-log/` layout and document that mapping.
- PA3 handout text was unavailable locally; rubric references currently rely on Jira and repository records and must be checked against the actual handout before submission.
