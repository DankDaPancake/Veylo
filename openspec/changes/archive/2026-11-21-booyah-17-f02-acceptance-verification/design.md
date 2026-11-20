## Context

See [proposal.md](proposal.md) for motivation. Local dev baseline is `9be2097`; implementation came through BOOYAH-18/19/16. `src/app/orders/workspace.tsx` implements list, create, detail, edit, cancellation and direct CSV import. `src/tests/orders.integration.mjs` exercises real auth/API/database behavior in nine subtests; it does not drive the rendered UI. The [UI handoff](../../../../docs/test/BOOYAH-16-ui-integration.md) contains 16 browser captures on `28e0cae` and unresolved review notes. Earlier passing results are supporting evidence, not a fresh demo-commit acceptance result.

Design is included because authorization verification spans UI, API and database, and acceptance conflicts require explicit gates. This change has no new spec; the existing F02 spec supplies the behavioral oracle.

## Goals / Non-Goals

**Goals:** Reproducible scenario coverage, synthetic evidence, honest pass/fail decisions, an immutable demo revision and a reviewable archive handoff.

**Non-Goals:** Replacing existing tests, redefining a CSV workflow, expanding the database or certifying later features. New requirement/schema decisions stay with their owning tasks and require approval.

## Decisions

### 1. One evidence matrix, using the existing spec

Create `docs/test/PA3-F02-verification.md` during apply, with actual attribution immediately after report headings; unknown human attribution remains pending. Record source spec revision, application commit, worktree cleanliness, runtime/database/browser versions, timezone, viewport and command exit results. Each row records ID, exact scenario title, fixture/precondition, expected result, observed result, status, evidence path and retest/bug reference. Use PASS, FAIL, UNVERIFIED or BLOCKED; no blank result is a pass.

Initial inventory, to recount against the chosen revision:

| ID | Existing F02 scenario |
| --- | --- |
| F02-01 | Invalid new order |
| F02-02 | Reversed window or incomplete coordinates |
| F02-03 | Duplicate order code |
| F02-04 | Mixed valid and invalid records |
| F02-05 | Header missing a required column |
| F02-06 | Valid edit preserves order code |
| F02-07 | Cancellation is saved |
| F02-08 | Stale or forbidden mutation |
| F02-09 | Edit attempts to change identity |
| F02-10 | New intake succeeds |
| F02-11 | Dispatcher signs in and out |
| F02-12 | Authentication required |
| F02-13 | Wrong role or hub |
| F02-14 | Filtered list |
| F02-15 | Page no longer exists |
| F02-16 | Open an order |

Expand combined WHEN clauses into variants: manual and CSV validation, in-file/existing/concurrent duplicates, file format boundaries, stale/cancelled mutations, expired sessions and each denied role. A parent row passes only when its applicable variants pass. Include separate negative permission rows for anonymous 401, Admin 403, Rider 403 and cross-hub Dispatcher 404; cover reads and mutations, verify no disclosure and unchanged data. Anonymous 401 is not a forbidden-role 403 case. Prefer all-route checks from the existing integration suite over only three sample requests.

Alternative: count screenshots or TAP records as coverage. Rejected because neither maps one-to-one to spec scenarios. Execute every user-performable scenario flow through the production UI as Jira requests; API/DB probes supplement those flows. For a variant the UI cannot express, such as a forged immutable field or controlled race, label the API-only probe and its limitation explicitly. API-only evidence must not replace an available UI flow or silently satisfy Jira's UI criterion; if a whole scenario cannot be exercised through the UI, keep that criterion UNVERIFIED until the reviewer records its disposition.

### 2. Reuse documented commands and an isolated database

Follow `src/README.md`, pinned Node/dependencies and lockfile. Check the documented 8 GiB free-memory prerequisite before heavy jobs. In `src`, install with `npm ci` when dependencies are absent; use the locked local OpenSpec CLI rather than assuming the global version matches. Generate/validate Prisma, provision an empty loopback-only `veylo_demo` database with UTC before connecting, then `npm run db:migrate`, opt-in `npm run db:seed` and `npm run db:check`. Record two hubs, four staff accounts and 50 orders immediately after initial seed; seed replay must preserve data. A second hub is an authorization fixture.

Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` and `npm run start`. In another terminal, with the same ignored local environment and explicit `VEYLO_ENABLE_DEMO_SEED=1`, run `node --env-file=.env --test --test-concurrency=1 tests/orders.integration.mjs`. Set `VEYLO_TEST_URL` and `BETTER_AUTH_URL` to the actual isolated server origin. Do not log connection strings, session cookies or secrets. `db:check` proves connectivity only. The integration suite writes orders, expires sessions and temporarily changes a hub association; do not run it against a shared server or a browser capture session. Reseed a separate fresh disposable database for the UI walkthrough when deterministic initial counts are needed.

Alternative: reuse an arbitrary existing database. Rejected because prior fixtures and timezone settings can hide defects or invalidate counts. Only remove disposable resources created for this task; no shared reset or new migration is proposed.

### 3. Verify the integrated UI and track defects

At 1440 x 900 and the 1280 x 720 desktop baseline, walk UC05–UC08 with Dispatcher A: validation/input retention, create/reload, combined filters/pagination/empty state/detail, edit/stale conflict/reload, cancel/reason/retained record, template, valid 20-row CSV and atomic invalid/duplicate files. Exercise core actions using keyboard only. Record exact browser version, screenshots, sanitized API responses and before/after persistence assertions. Investigate the previously unidentified resource 404 rather than treating absence of uncaught exceptions as a clean console.

Link confirmed bugs to BOOYAH-17 when Jira write authorization is available; otherwise prepare concrete issue drafts and mark publication pending. Include reproduction, expected/actual behavior, revision, evidence and retest. Fixes restoring approved behavior need separate scoped apply work; changes to requirements/schema require approval. Retest affected scenarios and relevant regression checks after fixes.

### 4. Explicit acceptance gates for conflicting sources

- CSV preview: UC06 describes read-only preview and explicit confirmation; the current UI submits directly to an atomic endpoint. Verify and report both observations. Obtain a recorded reconciliation through BOOYAH-20/13 and reviewer Hải before declaring the affected acceptance complete. This plan selects neither workflow and does not authorize implementing preview or dropping it.
- Other prototype differences: post-create navigation and error-summary focus await reviewer disposition. Keep those acceptance items pending until recorded review or an approved correction.
- Non-UTC year-boundary defect: reproduce only in an isolated diagnostic database if needed; keep its supported-environment impact visible. A passing UTC demo does not demonstrate non-UTC correctness or close the defect.
- Vision candidate: record the disposition of PA3 checkpoints N01/N05/N06/N15/N16/N17 against the accepted source and actual handout. Record missing evidence separately; do not silently widen/reduce BOOYAH-17 or claim full NFR compliance. N15 requires a real independent member. A checkpoint affecting final acceptance remains a gate until its owner resolves applicability; do not count later-phase tests as passed.

These gates permit independent test preparation/execution while decisions are pending. An unresolved applicable blocker prevents all-green reporting and archival; acknowledgement is not a waiver.

### 5. Freeze, review and archive the original change

After authorized fixes are integrated, select a committed application revision with no unrecorded application changes. Run acceptance against that exact revision; record its full hash for BOOYAH-30. Evidence/docs may be committed later with an explicit distinction between the tested application commit and the documentation/archive commit. Application changes after verification invalidate affected evidence and require retest and renewed review.

Write root `README.md` Section E mapping existing proposal -> specifications -> design/plan -> tasks -> implementation commits -> report/demo hash. Keep video link pending until BOOYAH-30 supplies it. Export the report PDF from reviewed Markdown using existing tooling where available; do not invent an export result or add a framework for it.

When every applicable scenario passes, blockers are resolved and independent acceptance is recorded, mark original F02 task 3.3 complete with evidence. Invoke `openspec-archive-change` for **f02-order-intake**, not this QA change. Verify synced `openspec/specs/order-intake/spec.md` and the original proposal/design/tasks/spec in its dated archive, validate them, and repair affected relative links. Root placement is intentional despite stale Jira paths. Obtain normal protected-branch PR review; no push/merge or Jira transition is authorized merely by this plan. Archive this QA change only in a separate finalization after all its tasks are complete.

## Risks / Trade-offs

- Earlier evidence can look current -> label its original revision and rerun acceptance on the frozen application revision.
- API tests do not establish UI correctness -> separate production-browser and API/DB evidence in the matrix.
- Defects or missing human decisions may exceed Jira's 3h estimate -> preserve failed/blocked status and report remaining work rather than weaken coverage.
- Pending handout/Vision acceptance -> verify source applicability before claiming Section E or NFR compliance.
- Archived paths can break links -> check destination existence and relative links after sync/archive.

## Migration Plan

No deployment or schema migration change. Existing approved migrations run only on the isolated QA database. Verification documents and archive edits are reviewable through a task PR; revise/revert those edits if inaccurate without deleting historical evidence or altering shared data.


## Local completion record — 2026-11-21

The final application revision is5d67ce821e6c77c1952c8191a5086b0d8e712171; actual verification and report are linked from README Section E. The requester explicitly reported all remaining4.1/4.2 closure checks passed; reviewer metadata and handout copy were not supplied and are not fabricated. Original [F02 artifacts](../2026-11-21-f02-order-intake/proposal.md) are archived and [main spec](../../../specs/order-intake/spec.md) is synced unchanged. BOOYAH-30 receives the prepared same-hash local handoff; video/external notification remains pending. This QA change is intentionally not archived by4.2. Historical planning/baseline observations above retain their original scope and are superseded by actual final evidence where stated.
