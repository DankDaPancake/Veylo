# PA3 F02 Acceptance Verification
Performed by: Codex (AI-assisted report preparation for BOOYAH-17 owner Nguyễn Thành Trung; current-build verification recorded; acceptance pending). Reviewed by: Trần Lê Hải (assigned in Jira; review pending). Edited by: Codex.

**Latest status:** Final original16 F02 scenarios passed on committed application `5d67ce821e6c77c1952c8191a5086b0d8e712171`; see [final committed verification](#final-committed-application-verification--2026-11-21). Requester reports all closure checks passed on21November; reviewer metadata and handout copy were not supplied to the assistant. Original F02 is synced/archived; earlier sections preserve their historical baseline status.

**Baseline record status:** Prepared as the live BOOYAH-17 evidence matrix. Scenario results below reflect current execution evidence, including failures and an unavailable UI-only criterion. Historical evidence is labeled with its original revision and does not change these statuses.

## Run identity and environment
Performed by: Codex (AI-assisted; values read from repository state). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

| Field | Recorded value |
| --- | --- |
| Jira work item | [BOOYAH-17](https://thaikiet291006.atlassian.net/browse/BOOYAH-17), assigned to Nguyễn Thành Trung; reviewer Trần Lê Hải |
| Application revision selected for this run | `9be2097b647b6a7ca7c6fdebc09d9267d8c30411` |
| Working tree when selected | Dirty with documentation/OpenSpec planning edits; `src/` has no tracked or untracked application edits. This identifies the code baseline, not a claim that tests ran from a clean checkout. |
| Acceptance source | [`f02-order-intake` spec](../../openspec/changes/archive/2026-11-21-f02-order-intake/specs/order-intake/spec.md), 9 requirements and 16 scenarios at the selected revision |
| Test environment | Linux; Node v24.22.2, npm 11.19.1. PostgreSQL 18.7 on loopback 54417, UTC; production Next server on http://127.0.0.1:3017. Supplemental root browser probe: Chrome 156 (reduced user agent), Linux, screenshot1920x905; desktop walkthrough used Chrome 156.0.8078.79 via preinstalled Python 3.13.11/Playwright, headless at 1440x900 and layout smoke at 1280x720; see browser observations. No cross-browser or N15 certification is claimed. Node is within the declared 24.x engine range; it differs from the README example 24.20.0. |
| Database | Use a fresh, dedicated loopback `veylo_demo` database configured to UTC before migration/seed. Setup PASS: initial and replay counts Hub=2, User=4, Account=4, Order=50; see [setup record](f02-verification/setup/booyah17-database.md). Never place credentials, cookies or recipient data in this report. |
| Evidence root | `docs/test/f02-verification/` contains current setup, command, browser and supplemental evidence |

The root revision is the code under test. The current dirty files are documentation and OpenSpec planning only. Record the final committed demo revision separately if fixes change the application; retest on that revision before acceptance. A later documentation commit does not replace the tested application hash.

## Scenario matrix
Performed by: Codex (AI-assisted matrix preparation from the existing F02 spec and UC05–UC08). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

For every run, record the observed value, result, evidence path and retest/bug reference in this table or a linked, versioned continuation. PASS applies only after all applicable variants and their required interaction mode have evidence. Use FAIL for an observed mismatch, BLOCKED for a known gate preventing execution, and UNVERIFIED when the check has not been run. An API result supplements a UI flow; it does not satisfy the UI acceptance check when that flow can be performed through the UI.

| ID | Exact F02 spec scenario | Variants / expected acceptance | Required evidence and current result |
| --- | --- | --- | --- |
| F02-01 | Invalid new order | In the UI, submit an invalid manual order (invalid phone, missing/invalid destination or non-positive weight); confirm field feedback, retained inputs and no saved row. Through UI import, include an invalid CSV record; confirm row/field feedback and no unintended saved data. API/DB probes may supplement. | **PASS** — UI required-code/address, short address, phone and weight checks passed; mixed CSV omitted code/destination, invalid phone and weight were rejected with no batch rows saved. [Remaining variants](f02-verification/browser/remaining-variants.json), [page fallback](f02-verification/browser/page-fallback.json), [primary observations](f02-verification/browser/observations.json). |
| F02-02 | Reversed window or incomplete coordinates | Exercise end equal to/before start and latitude-only/longitude-only input in the UI. Confirm relevant validation feedback and unchanged data. Probe coordinate bounds and API rejection as supplemental boundary variants. | **PASS** — UI end-before-start and equal-end, latitude-only, longitude-only and out-of-range latitude/longitude variants all produced relevant field errors and retained the form. [Remaining variants](f02-verification/browser/remaining-variants.json), [page fallback](f02-verification/browser/page-fallback.json), [primary observations](f02-verification/browser/observations.json). |
| F02-03 | Duplicate order code | In the UI, try an existing same-hub code and a duplicate in one CSV; confirm useful conflict feedback and no duplicate. Verify trimmed case-insensitive same-hub collisions, a code allowed in another hub, and concurrent duplicate writes with API/DB probes. | **PASS** — UI existing same-hub duplicate, in-file case-normalized duplicates and reuse in hub B passed; API/DB concurrent duplicate/race variants passed. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-04 | Mixed valid and invalid records | Through the import UI, submit a CSV containing a valid row and invalid-weight row; confirm the invalid row/field is identified and neither row persists. Exercise mixed errors, duplicate rows and a commit-time conflict as supplemental cases. | **PASS** — Supplemental UI batch contains a valid record, invalid-weight record and missing-field record; row3 weight and row4 field errors were shown, and no matching batch order persisted. [Remaining variants](f02-verification/browser/remaining-variants.json), [page fallback](f02-verification/browser/page-fallback.json), [primary observations](f02-verification/browser/observations.json). |
| F02-05 | Header missing a required column | Through the UI, submit missing-column CSV; confirm a file-level error and zero writes. Expand with empty/malformed file, unknown/duplicate header, wrong extension/encoding, byte/row limits and supported quoting (from the UC/CSV contract); record each variant. | **PASS** — UI missing/unknown/duplicate headers, malformed/header-only/zero-byte files, wrong extension, invalid UTF8,501 records and oversized files rejected; UTF8 BOM/CRLF/quoted fields accepted. [Remaining variants](f02-verification/browser/remaining-variants.json), [page fallback](f02-verification/browser/page-fallback.json), [primary observations](f02-verification/browser/observations.json). |
| F02-06 | Valid edit preserves order code | Through UI, edit an eligible NEW order's permitted fields, save, reload, and verify values persisted while the same order/code remains. API/DB readback supplements the UI evidence. | Current revision: **FAIL** on accepted minimum-year boundary (B17-UI-01); ordinary-date UI edit/reload and detail/readback passed in the primary browser observations; the boundary failure keeps this scenario failed. [DOM/API evidence](f02-verification/checks/minimum-date-ui.json), [edit screenshot](f02-verification/checks/minimum-date-edit.png). Record synthetic order identifier, before/after fields and UI screenshots. |
| F02-07 | Cancellation is saved | In UI, cancel an eligible NEW order with a valid reason; reload/open it and verify the same order remains CANCELLED with the reason. Verify the confirmation and retained record. | **PASS** — UI confirmation, short-reason block, retained CANCELLED record/reason after full page reload and API readback passed. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-08 | Stale or forbidden mutation | In UI, use two tabs to make an edit stale and test edit/cancel after cancellation; confirm conflict/reload feedback and the newest state remains. API probes exercise races and any forbidden mutation not expressible by controls. | **PASS** — UI two-tab stale edit/conflict/reload passed; API stale/cancelled edit and repeat cancellation preserved latest state/version. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-09 | Edit attempts to change identity | Verify normal UI edit omits or protects order code and retains identity. Separately submit forged `order_code`, `hub_id`, status and audit fields at the API boundary; confirm rejection and unchanged DB values. The forged-field probe is API-only because the UI does not expose these controls. | **UNVERIFIED** — Normal UI edit omits identity control; forged identity fields were rejected through API. The whole forged-field UI criterion is unavailable and awaits reviewer disposition. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-10 | New intake succeeds | In UI, create a valid order and import a valid CSV; after reload verify each order is NEW. Use an isolated DB query/readback to confirm intake did not create DeliveryAttempt records. | **PASS** — Valid manual and20-row import persisted after full page reload; NEW state observed and API asserted. Before/after catalog has no DeliveryAttempt table; see lifecycle-catalog.txt and setup inventory. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-11 | Dispatcher signs in and out | Through UI, sign in as Dispatcher A and open Orders; verify scoped access. Sign out and retry the prior page/session; verify access is removed and sign-in is required. | **PASS** — Dispatcher UI sign-in/scoped Orders, sign-out and protected-page revisit passed; API old session401 passed. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-12 | Authentication required | Request order APIs without a session and with an expired session; each returns 401 with no order data. Open the protected page anonymously and verify sign-in recovery without replaying the attempted action. | **PASS** — Anonymous UI redirect plus anonymous and expired-session API401 across all seven method/route pairs; no order disclosure/mutation. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-13 | Wrong role or hub | Through UI, verify denied roles cannot enter Orders. Separately verify Admin and Rider API requests receive 403 and Dispatcher A requesting hub B order gets 404 without details. Check read and mutation paths and unchanged data. | **PASS** — Admin/Rider UI access denied and API403; hub B UI cannot see A-only order; cross-hub GET/PATCH/cancel404 with unchanged record. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-14 | Filtered list | Through UI, combine status, inclusive hub-local start dates and literal case-insensitive keyword; verify only matching same-hub orders, stable sort, 20-row page size and valid pagination. Include empty results. | **PASS** — UI keyword/date/status combinations, empty state and20-row pages passed; API asserted stable order, inclusive dates and literal keyword behavior. [Browser observations](f02-verification/browser/observations.json), [API output](f02-verification/checks/integration-direct.txt). |
| F02-15 | Page no longer exists | Through UI, apply filters then request a page beyond the result range; verify it returns to page 1, shows current total and retains filters. Confirm response metadata with API evidence. | **PASS** — UI requested page 2 of 21 NEW filtered orders, cancelled its sole row, then received page 1/total20 with keyword and NEW filters retained; API page999 fallback also passed. [Remaining variants](f02-verification/browser/remaining-variants.json), [page fallback](f02-verification/browser/page-fallback.json), [primary observations](f02-verification/browser/observations.json). |
| F02-16 | Open an order | Through UI, open a permitted order and verify saved fields and current state match the list/API/DB record. | Current revision: **FAIL** on accepted minimum-year boundary (B17-UI-01); ordinary-date UI edit/reload and detail/readback passed in the primary browser observations; the boundary failure keeps this scenario failed. [DOM/API evidence](f02-verification/checks/minimum-date-ui.json), [edit screenshot](f02-verification/checks/minimum-date-edit.png). Record synthetic order identifier and detail screenshot/readback. |

### Separate negative permission checks
Performed by: Codex (AI-assisted permission verification). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

These checks remain separate even where they overlap F02-12/13. Test protected page and every relevant API route for read and mutation where applicable. Do not count anonymous 401 as a denied-role 403 case.

| ID | Actor/request | Expected result | Current result and evidence |
| --- | --- | --- | --- |
| PERM-01 | Anonymous caller reads/mutates order endpoint | 401; no order data or state change | **PASS** — [38 sanitized responses and unchanged-data assertions](f02-verification/checks/permissions.json); [browser page evidence](f02-verification/browser/observations.json) for available page flows. |
| PERM-02 | Expired Dispatcher session reads/mutates order endpoint | 401; no order data or state change | **PASS** — [38 sanitized responses and unchanged-data assertions](f02-verification/checks/permissions.json); [browser page evidence](f02-verification/browser/observations.json) for available page flows. |
| PERM-03 | Administrator accesses order UI/API | UI denied; API 403; no order details/state change | **PASS** — [38 sanitized responses and unchanged-data assertions](f02-verification/checks/permissions.json); [browser page evidence](f02-verification/browser/observations.json) for available page flows. |
| PERM-04 | Rider accesses order UI/API | UI denied; API 403; no order details/state change | **PASS** — [38 sanitized responses and unchanged-data assertions](f02-verification/checks/permissions.json); [browser page evidence](f02-verification/browser/observations.json) for available page flows. |
| PERM-05 | Dispatcher A reads/updates a Dispatcher B order | API 404 without resource details; no mutation. UI must not reveal the order. | **PASS** — [38 sanitized responses and unchanged-data assertions](f02-verification/checks/permissions.json); [browser page evidence](f02-verification/browser/observations.json) for available page flows. |

## Human and source decisions still pending
Performed by: Codex (AI-assisted source comparison). Reviewed by: Trần Lê Hải and owning task reviewers (pending). Edited by: Codex.

| Question | Known evidence | Required disposition before acceptance |
| --- | --- | --- |
| UC06 CSV preview vs atomic direct import | UC-F02 describes a read-only preview followed by explicit confirmation; current `workspace.tsx` posts the selected file directly to the atomic import endpoint. Earlier UI evidence is on `28e0cae`, not this revision. | Obtain a recorded reconciliation from BOOYAH-20/13 owners and reviewer Hải. Keep affected UI acceptance UNVERIFIED until resolved; this report chooses neither behavior. |
| Other prototype differences | Earlier handoff notes post-create navigation and error-summary focus differences; reviewer disposition remains pending. | Record reviewer acceptance or an approved correction, then retest the affected flows. |
| Non-UTC PostgreSQL year boundary | Earlier auth/API handoff reports a null timestamp at a minimum-date boundary on an Asia/Bangkok DB and passing integration assertions on a fresh UTC DB. This is historical evidence, not a current reproduction. | Record supported environment impact and disposition with BOOYAH-19 owner/reviewer. A UTC pass alone does not establish non-UTC behavior. |
| Vision candidate checkpoints | Local Vision 2.2 integration candidate identifies PA3 checkpoints N01/N05/N06/N15/N16/N17; independent Vision review and sections 5.3/6.1/6.2 acceptance are marked pending. | Check the actual PA3 handout and accepted Vision source with owners. Record applicability/evidence separately; do not claim full NFR compliance from the F02 scenarios. N15 specifically needs an independent clean setup. |
| Course handout | Jira cites `PA3-2026 (1).pdf`; its contents were not found in the inspected repository. | Verify final rubric language and handout-specific report/PDF needs from the supplied official copy before submission. |

## Confirmed UI defect draft
Performed by: Codex (AI-assisted browser and API observation). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

**B17-UI-01 — accepted minimum-year windows cannot round-trip through the edit UI. Status: FAIL; fix/retest pending.** Jira publication pending. Application revision `9be2097b647b6a7ca7c6fdebc09d9267d8c30411`, Chrome 156 on Linux, production server 3017 and UTC PostgreSQL 18.7.

Reproduction: use the integration-created `CHECK-1795179481100-EARLIEST` NEW order, created with local window `0001-01-01 07:00` to `0001-01-01 08:00`. Sign in as Dispatcher A, open this order from the list, then choose Edit order. Expected: saved valid dates prefill in valid native datetime-local format and preserve their accepted values. Observed: API readback is `0001-01-01T00:00:00.000Z` to `0001-01-01T01:00:00.000Z`; detail displays `1-01-01 07:06` to `1-01-01 08:06`, and both edit date inputs have empty `.value`. Native form validity is false before any edit. No mutation was submitted during this reproduction.

[DOM/API observation](f02-verification/checks/minimum-date-ui.json) and [actual edit screenshot](f02-verification/checks/minimum-date-edit.png) record the finding. The existing formatter in `src/app/orders/workspace.tsx` uses Intl timezone formatting; the short year and historical timezone offset need investigation against the accepted validator/time contract. Do not fix this by silently rejecting previously accepted dates. Proposed bounded correction: reuse the existing pure `localInput(date)` formatter from `src/lib/orders/validation.ts`, which applies the same fixed UTC+7 conversion and ISO year padding as the accepted parser, rather than adding a new date range restriction. No schema/data migration is needed. No application fix has been applied in this verification task. Keep F02-06/16 boundary variants failed until a scoped correction is implemented and retested on the final application revision.

## Commands and execution log
Performed by: Codex (AI-assisted run recording). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

| Command/check | Purpose | Result on selected revision |
| --- | --- | --- |
| `npm ci` (only if locked dependencies are absent) | Reproducible dependencies | PASS, exit 0: installed 562 packages from committed lockfile; deprecation/allowScripts warnings observed. No dependency manifest/lock changes. |
| `DATABASE_URL=<inert loopback URL> node node_modules/prisma/build/index.js generate` | Generate Prisma client without connecting to a database | PASS, exit 0: Prisma Client 7.10.1 generated from existing schema. This is not database verification. |
| `node --env-file=.env node_modules/prisma/build/index.js validate` | Validate current schema | PASS; see [setup record](f02-verification/setup/booyah17-database.md). |
| `npm run db:migrate`, explicit local-only seed opt-in, `npm run db:seed`, `npm run db:check` | Migrate and seed the fresh disposable UTC DB; verify connection | PASS: migration, seed, replay and connection probe; see [setup record](f02-verification/setup/booyah17-database.md). `db:check` alone only establishes connectivity. |
| `npm test` | Unit/parser/form tests | PASS, exit 0, 16/16 on this revision; [unit log](f02-verification/checks/unit.txt). |
| `npm run lint` | Lint | PASS, exit 0; [lint log](f02-verification/checks/lint.txt). |
| `npm run typecheck` | Type check | Initial setup-order attempt failed (exit 2) before Prisma Client generation; [initial log](f02-verification/checks/typecheck.txt). After generation, PASS, exit 0; [retest log](f02-verification/checks/typecheck-after-generate.txt). No application fix was needed. |
| `npm run build` then `npm run start` | Production build and server for integration/browser checks | Build PASS, exit 0; [build log](f02-verification/checks/build.txt). Production server started on 127.0.0.1:3017, reported Ready in 64ms; [startup excerpt](f02-verification/checks/server-start.txt). Integration PASS via direct Node test invocation; browser execution is recorded below, including the minimum-year failure and pending acceptance gates. |
| `node --env-file=.env --run test:integration` | Real auth/API/database integration | FAIL, exit 1 before tests: child reports missing DATABASE_URL despite direct Node env-loader probe confirming it is set. [Documented-command attempt](f02-verification/checks/integration.txt). Direct invocation of the same test file with explicit seed opt-in passed 10/10; [direct invocation log](f02-verification/checks/integration-direct.txt). This does not make the documented --run command pass. |
| Production browser walkthrough at 1440×900 and1280×720 | Current UI evidence | Initial run:27PASS/1FAIL (bounded keyboard search), [observations](f02-verification/browser/observations.json). Targeted keyboard retest:5 groups PASS, [retest](f02-verification/browser/keyboard-retest.json). Eleven supplemental validation variants and UI page fallback also passed; root boundary-date probe FAIL. Forged-identity whole-UI criterion remains UNVERIFIED pending review. |

Record actual command, start/end, exit code and concise output reference here after each run. Use synthetic accounts/data, an isolated loopback server and UTC database as documented in [`src/README.md`](../../src/README.md). Never copy credentials, cookies, real recipient data or raw sensitive prompts into logs/evidence.

## Current API assertion evidence
Performed by: Codex (AI-assisted execution on the selected revision). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

Direct command from `src`: `VEYLO_ENABLE_DEMO_SEED=1 node --env-file=.env --test --test-concurrency=1 tests/orders.integration.mjs`. Exit 0, nine subtests plus parent (10 TAP records), no failed/skipped tests. These are actual assertion results, not captured raw HTTP exchanges; inspect the [test source](../../src/tests/orders.integration.mjs) and [run output](f02-verification/checks/integration-direct.txt). Browser criteria remain separate.

| Passed subtest | Scenario/permission evidence | Scope limits |
| --- | --- | --- |
| migration fixtures and seed replay preserve rows | Initial fixtures and idempotent seed | Setup, not UI |
| every route denies absent sessions, Admin and Rider | F02-12/13; PERM-01/03/04: all seven method/route pairs asserted 401/403/403 and no Synthetic data in response | API assertions; separate Admin/Rider page-denial evidence is recorded in the browser observations |
| create/detail reject invalid fields, preserve values and enforce per-hub codes | F02-01/02/03/10/16: invalid field rejection, no saved invalid order, valid NEW record, persisted detail, same-hub duplicate and different-hub reuse | Does not cover every UI variant |
| cross-hub reads, edits and cancellations return 404 without changes | F02-13; PERM-05: read, PATCH, cancellation denied and persisted version unchanged | API/DB boundary evidence |
| combined filters, inclusive local dates, stable pages and literal keywords | F02-14/15: page isolation, sorting, AND filters, page 999 fallback, date/literal boundaries | API fallback assertion; separate UI page-shrink/fallback evidence is recorded in page-fallback.json |
| edits preserve identity; stale/concurrent edits conflict; cancellation persists | F02-06/07/08/09: forbidden identity fields rejected, current record unchanged, concurrent winner/loser, retained CANCELLED reason/version | Forged fields/races require API probes |
| CSV template, atomic 20-row import, mixed errors and duplicate races | F02-03/04/05/10: template, 20 persisted rows, mixed-error zero writes, duplicate occurrences and atomic race rollback | UI preview/review issue remains unresolved |
| database uniqueness races and invalid numeric values cannot bypass the API | F02-03 and data-integrity supplement | Direct DB assertions, not UI |
| current hub assignment, expired session, reload and server-side sign-out | F02-11/12/13; PERM-02: stale hub assignment403, expiry401, new session200 and signed-out session401 | Initial suite covers list expiry; supplemental38-response probe now covers expiry on all seven route/method pairs |

## Reproducible setup/documentation issue draft
Performed by: Codex (AI-assisted reproduction). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

**B17-DOC-01 — documented Node --run integration command omits loaded env in the child on Node v24.22.2.** Publication to Jira pending; no external write performed. On this checkout `node --env-file=.env -e` confirmed DATABASE_URL/auth variables were present (values not printed), while the documented `node --env-file=.env --run test:integration` exited 1 with DATABASE_URL required before test execution. No DB writes occurred in the failed attempt. Expected: the integration script receives configured local environment. Actual: it does not on this invocation. Run the same test file directly as shown above with explicit seed opt-in; that run passes. A [synthetic-marker probe](f02-verification/checks/env-run-probe.json), independent of app credentials, reproduced the difference: direct Node received the marker (true), while --run did not (false). The README command was corrected locally to the direct invocation that passed above; no test/application behavior changed. Comparison on the exact README Node example 24.20.0 remains unverified. This is a command/setup issue, not evidence that order scenarios failed.

## Browser and supplemental permission results
Performed by: Codex (AI-assisted execution and evidence integration; Luna prepared the initial browser harness). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

The primary Playwright run recorded 27 passing checks and one failed 20-tab focus search, with 28 screenshots. The [original observations](f02-verification/browser/observations.json) are retained; they are test checks, not27 distinct spec scenarios. Root corrected harness ordering/select/wait/reload issues before this run and performed the actual execution after the worker was interrupted. The later [targeted keyboard retest](f02-verification/browser/keyboard-retest.json) passed 5 groups using actual Tab/Enter navigation: create/all 11 form fields/save validation, CSV/template/file chooser/import, search/detail/edit, cancel/reason/confirmation, filters/pagination/sign-out. Create focus had a visible3px solid outline. The initial20-tab failure is not claimed as a product defect; the settled retest allowed a full 150-tab search. The main harness was updated accordingly, without rerunning its already-passing workflows. Both locally prepared runners are outside the selected application commit; source application code was unchanged.

The [supplemental permission runner](f02-verification/check-permissions.mjs) captured 38 sanitized denial responses and confirmed unchanged order count, unchanged foreign order and restored hub fixture. It includes anonymous401, Admin/Rider403, foreign-resource404, missing-current-hub403 and expired-session401. This is a F02 subset, not full N05 certification. An initial probe supplied no valid JSON for a cross-hub PATCH and received400; that harness/input attempt is [retained](f02-verification/checks/permissions-initial-invalid-payload.txt). After supplying valid mutation payloads, all 38 responses matched expectations; [output](f02-verification/checks/permissions-output.txt). No application correction was needed.

The primary browser observations report two non-order-API HTTP403 entries; these are the expected denied-role Orders pages. No uncaught page exceptions were observed. Expected400/409/403 responses produced console resource errors, and navigation produced ERR_ABORTED entries. Root separately identified an actual missing `/favicon.ico`404 in [console/network evidence](f02-verification/checks/favicon-console-network.json). **B17-UI-02: favicon resource404, local fix/review pending**; do not claim a completely error-free console or full BOOYAH-16 AC4 acceptance. The earlier historical404 is not independently tied to the same request. The initial runner listed out-of-range paging as unverified; the later UI page 2-cancellation probe resolved it without changing the application.

Reproduction instructions and tool limitations are in the [runner guide](f02-verification/browser/README.md). The generated oversized CSV was removed after verification; its exact construction remains in the runner. Only synthetic data was used. UI evidence and API-only variants are explicitly separated; all available planned UI flows now have current evidence, including failed boundary variants. The original whole-UI forged-field criterion remains unavailable and UNVERIFIED pending reviewer disposition; it was not waived. Task2.2 records execution coverage, not feature acceptance.

## Live human review evidence
Performed by: Codex (read-only GitHub lookup). Reviewed by: Trần Lê Hải (current QA report review pending). Edited by: Codex.

A fresh `gh pr view 20` lookup found [PR #20](https://github.com/DankDaPancake/Veylo/pull/20) MERGED at 7327989 with an APPROVED review by `thepenguinguy123` at 2026-11-20T11:35:20Z against head 94c0a99. The repository AI log identifies that confirmed handle as Trần Lê Hải. [Saved review metadata](f02-verification/checks/pr20-review.json) records the actual review, along with other approvals. The review body is empty: it establishes approval of that PR head, not an explicit decision rewriting UC06 preview requirements, acceptance of the newly found date defect or review of this new verification report. Specific source reconciliation and current QA acceptance remain pending; no review is fabricated.

## Baseline acceptance decision — revision 9be2097
Performed by: Codex (AI-assisted status collation). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

**Status: FAIL / INCOMPLETE.** The selected revision and evidence matrix are recorded, unit/lint/typecheck/build and direct API integration checks now have current evidence. A current-build minimum-year UI defect (B17-UI-01) is confirmed. Matrix status: 13 PASS, 2 FAIL, 1 UNVERIFIED;38 permission probes and 5 keyboard groups passed. The forged-identity UI-only criterion and human/source decisions remain pending; the original --run invocation failed; the README now documents the passing direct invocation. Previous captures at `28e0cae` and earlier API/unit results remain historical. Do not claim F02 all-green, complete original task 3.3, archive `f02-order-intake`, or use this report as proof for BOOYAH-30 until blocking failures are fixed and retested and pending applicable human dispositions are recorded.

## B17-UI-01 scoped correction retest — 2026-11-20
Performed by: Codex (AI implementation and production-browser verification). Reviewed by: Trần Lê Hải (current QA acceptance pending). Edited by: Codex.

The separate `fix-f02-order-window-roundtrip` change corrects presentation using the existing UTC+7 formatter. On base HEAD `9be2097b647b6a7ca7c6fdebc09d9267d8c30411` plus the uncommitted correction, unit17/17, lint, typecheck and production build passed. Production Chrome156 at1440×900 passed list/detail, valid edit-window prefills, permitted note save/reload and unchanged API window/identity checks for years0001,2026 and9999. [Scoped evidence and exact patch/source hashes](f02-verification/window-roundtrip-fix/README.md) preserve the original failing test and the corrected-build results. Initial browser harness failure involved asserting an API field not returned; its evidence is retained, and the corrected harness passed all three flows without another product edit.

B17-UI-01 is corrected and passes this local retest; the original matrix above remains the baseline result for its original revision, not the corrected uncommitted worktree. These results do not establish a final committed demo revision or human acceptance, and do not close other source/permission-mode decisions, favicon disposition or BOOYAH-17 task3.1. Final committed-build verification, review, report PDF and archive remain pending.

## Evidence links
Performed by: Codex (AI-assisted link preparation). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

- [Existing BOOYAH-16 UI handoff and historical captures](BOOYAH-16-ui-integration.md)
- [Existing BOOYAH-18 auth handoff](BOOYAH-18-auth-checklist.md)
- [F02 OpenSpec requirements](../../openspec/changes/archive/2026-11-21-f02-order-intake/specs/order-intake/spec.md)
- [F02 OpenSpec design and contract decisions](../../openspec/changes/archive/2026-11-21-f02-order-intake/design.md)
- [Defect drafts and pending acceptance decisions](f02-verification/triage.md)
- [Current verification plan](../../openspec/changes/archive/2026-11-21-booyah-17-f02-acceptance-verification/design.md)

## Prototype precedence decision — 2026-11-20
Performed by: Codex (AI-assisted reconciliation of the user's direction). Reviewed by: Trần Lê Hải (implementation and final acceptance pending). Edited by: Codex.

The user explicitly directed “Tuân theo prototype cho mình”. Treat the authored UC05–UC08 prototype as the interaction target; direct CSV commit, list-only mutation success and unfocused inline-only validation are correction work, not accepted exceptions. The [separate parity correction proposal](../../openspec/changes/archive/2026-11-20-fix-f02-prototype-parity/proposal.md) scopes read-only CSV preview/explicit confirmation/cancel/conflict, saved detail and dismissal navigation, and linked focused summaries. No parity code has been applied. [Updated triage](f02-verification/triage.md) preserves the date-fix local PASS and original baseline failures. Other pending timezone/Vision/handout/F02-09 and final committed-build/human-review gates remain separate; BOOYAH-17 remains5/9.

## Prototype parity scoped retest — 2026-11-20
Performed by: Codex (AI implementation and actual production-browser verification; Luna backend/UI contributions and independent AI review). Reviewed by: Trần Lê Hải (current QA acceptance pending). Edited by: Codex.

The separate [prototype parity change](../../openspec/changes/archive/2026-11-20-fix-f02-prototype-parity/proposal.md) implements the user's selected interaction source: guarded read-only CSV preview with complete diagnostics, explicit confirmation/cancellation/result/replacement flows, saved detail after create/edit/cancel, protected identity and dismissal navigation, and focused linked summaries retaining input. No schema, validation-range or dependency changes were made. [Scoped evidence](f02-verification/prototype-parity/README.md) records unit18/18, lint/typecheck/build, extended integration11/11 and7 passing production-browser groups at1440×900 and1280×720, including keyboard, race/stale recovery and sign-in without replay. Original failure/harness evidence is retained and labeled.

This result is base HEAD9be2097b647b6a7ca7c6fdebc09d9267d8c30411 plus uncommitted corrections, with source hashes/patch; it is not the final committed acceptance build. The earlier16-scenario matrix is the original baseline, not a new all-green claim. Prototype source precedence is resolved by user and scoped corrections now pass locally; final review, F02-09 mode disposition, timezone/Vision/handout/favIcon disposition and committed-build retest remain pending. BOOYAH-17 task3.1 and subsequent tasks remain open.

## Final committed application verification — 2026-11-21
Performed by: Codex (AI-assisted actual execution). Reviewed by: Requester confirmation recorded; independent final acceptance pending. Edited by: Codex.

Application commit: **`5d67ce821e6c77c1952c8191a5086b0d8e712171`**. The application tree is clean at that commit; later document/evidence edits are separate. The requester confirmed “+Xác nhận thành công ổn ấp hết rồi” after the remaining scoped evidence questions. This records acceptance of the documented UTC demo setup/known limitations and UI+API F02-09 method, not a named reviewer identity or unexecuted NFR results.

[Final evidence bundle](f02-verification/final-5d67ce8/README.md): unit18/18, lint/typecheck/build exit0, direct opt-in integration11/11, expanded browser10 groups across1440×900/1280×720,5 page/template checks, and43 all-route permission denials with unchanged order data/hub restored. Actual UI sign-out has [separate results](f02-verification/final-5d67ce8/signout.json). Commands and source hashes identify this exact application commit. Earlier matrices/failures remain historical; the following table is the final original-spec scenario result for this committed revision and declared verification modes.

| ID | Original scenario | Final result / evidence scope |
| --- | --- | --- |
| F02-01 | Invalid new order | **PASS** — Blank required fields, malformed phone and nonpositive weight show linked feedback/retained input; invalid manual/CSV writes rejected. |
| F02-02 | Reversed window or incomplete coordinates | **PASS** — Before/equal windows, each missing coordinate and bounds rejected through UI with no saved fixture. |
| F02-03 | Duplicate order code | **PASS** — UI manual/in-file/current-hub conflicts and API normalized/different-hub/race assertions passed. |
| F02-04 | Mixed valid and invalid records | **PASS** — UI preview reports field/in-file/current-hub issues; API confirms zero writes and atomic commit rollback. |
| F02-05 | Header missing a required column | **PASS** — UI file/encoding/header/byte/record boundaries and quoted BOM/CRLF preview; actual keyboard template download passed. |
| F02-06 | Valid edit preserves order code | **PASS** — UI saved detail/reload and immutable identity/window readback; year0001 retained; upper-year formatter unit supplement passed. |
| F02-07 | Cancellation is saved | **PASS** — UI confirmation, short-reason feedback, retained CANCELLED detail/reason and API reload passed. |
| F02-08 | Stale or forbidden mutation | **PASS** — UI stale edit/cancel recovery preserves latest note/original reason; controlled API second actor and cancelled-state checks passed. |
| F02-09 | Edit attempts to change identity | **PASS** — Readonly code UI plus API forged order_code/hub/status/audit-field rejection and unchanged-record assertions; requester accepted this interaction mode. |
| F02-10 | New intake succeeds | **PASS** — UI valid create and explicit20-row CSV confirmation persist NEW; API lifecycle/schema assertions create no attempt records. |
| F02-11 | Dispatcher signs in and out | **PASS** — Actual UI sign-in, keyboard sign-out and protected-page/API revisit require authentication; old-session401. |
| F02-12 | Authentication required | **PASS** — Anonymous page recovery, expired/absent API401 across8 method/route pairs; sign-in does not replay import. |
| F02-13 | Wrong role or hub | **PASS** — Admin/Rider denied pages and API403; hub-B UI hides A-only code; foreign order read/PATCH/cancel404 unchanged. |
| F02-14 | Filtered list | **PASS** — UI combined literal keyword/status/inclusive local dates, stable20-row paging and empty results; API sorting/literal/date assertions passed. |
| F02-15 | Page no longer exists | **PASS** — UI21→20 NEW-record shrink returns page1 with retained filters; API page999 fallback passed. |
| F02-16 | Open an order | **PASS** — UI details match saved/read-back windows, fields and state after create/edit/cancel; year0001 displays correctly. |

Separate final permission matrix: PERM-01 anonymous401, PERM-02 expired401, PERM-03 Admin403, PERM-04 Rider403, PERM-05 foreign-hub404 all **PASS**, with sanitized [43 responses](f02-verification/final-5d67ce8/permissions.json), page evidence and unchanged-data assertions. Eight route/method pairs include the additive read-only preview; anonymous401 is not counted as a forbidden-role403.

**Outcome: original16 F02 scenarios PASS on the frozen local UTC build; independent release/archive acceptance remains pending.** N01/N05 full forbidden-matrix/N06 release audit/N15 independent clean setup/N16 full contrast/axe/N17 cross-browser certification are not claimed by this focused run. The known historical non-UTC boundary issue remains outside the demonstrated UTC environment, and favicon404 remains a disclosed cosmetic limitation accepted by requester disposition. The official PA3 handout is unavailable for direct comparison; Section E maps actual artifacts to the recorded Jira rubric without inventing instructor evidence. Report PDF can be reviewed as a matching draft. No push/merge/deployment/video/handoff message or original F02 archive has occurred.

Matching [report PDF](PA3-F02-verification.pdf) is exported from this Markdown as a review draft. Final supplements confirm wrong-width record2 diagnostics focus, actual imported orders after a full reload/lowercase filter and absence of an attempt table; see the final evidence bundle. Independent acceptance and direct official-handout comparison remain pending.


## Section E closure inputs — 2026-11-21
Performed by: Codex (AI-assisted source/evidence mapping). Reviewed by: Independent final acceptance pending. Edited by: Codex.

The following map makes the outstanding task4.1 inputs explicit. It uses the [Vision integration candidate](../requirements/pa3/Vision-Integration-Candidate.md) as a labeled source and does not assert an unavailable accepted revision or unseen handout content. The official PA3 assignment was not found by a filename search across the repository and its parent Introduction to Software Engineering directory; no source comparison is fabricated.

| Checkpoint/input | Actual F02 evidence | Remaining source/acceptance work |
| --- | --- | --- |
| N01 performance | Functional browser runs at two desktop frames | No30-cycle percentile/cold-load certification; confirm applicability and supply required evidence if applicable. |
| N05 authorization | Final43 sanitized denials, role/hub page checks and unchanged data | Focused F02 coverage, not a claim of24 authenticated-but-forbidden cases across all product endpoints. |
| N06 data protection | Synthetic fixtures/screenshots; scoped check found no actual local DB URL/auth secret in final textual evidence | Full release/secret-scanner certification not claimed. |
| N15 reproducibility | Actual isolated seed/setup and connection evidence | Requires an actual second member's clean-machine walkthrough; AI execution cannot supply independent-member evidence. |
| N16 accessibility | Core keyboard actions, focused summaries/links and diagnostic reports | No full contrast/axe certification claimed. |
| N17 compatibility | Recorded Chrome156 at1440×900 and1280×720 | Firefox/Edge and broader browser certification not executed. |
| Handout/path mapping | Root OpenSpec and singular docs/ai-log paths documented; Jira criterion E references mapped in README | Official handout text/page wording unavailable for direct comparison. |
| Independent acceptance | Requester's scoped confirmation is preserved | Need actual independent reviewer identity and acceptance of committed5d67ce8/report; no reviewer attribution inferred. |

The submitted-path distinction remains explicit: working OpenSpec is at repository root by user direction, while PA2 submission placement is a separate requirement. Video remains pending for BOOYAH-30. The same frozen application commit must be used; later documentation/archive commits must be identified separately.


## Requester-reported closure of 4.1–4.2 — 2026-11-21
Performed by: Codex (AI-assisted closure recording). Reviewed by: Acceptance reported complete by requester; independent reviewer identity/link not supplied. Edited by: Codex.

After being asked for the official handout and actual independent acceptance needed by4.1–4.2, the requester stated “+Đã pass hết”. Record the outstanding closure checks and acceptance as **passed according to requester report**. The requester also explicitly asked to finish4.1–4.2, including the original F02 sync/archive. Reviewer name/date/link and the official handout copy remain unavailable to the assistant; no named approval, firsthand handout comparison or new runtime/NFR test is fabricated. Earlier pending-source tables are historical to the preparation stage; this later user-reported disposition governs local closure. Known limitations stay disclosed and no unexecuted check is relabeled as AI-verified.

The application remains `5d67ce821e6c77c1952c8191a5086b0d8e712171`, with16 actual original-scenario PASS results and43 actual permission responses. Section E, matching report PDF, original OpenSpec artifacts and the prepared BOOYAH-30 handoff use this same hash. Video publication remains pending. This closes local preparation on user-reported acceptance and does not substitute for required independent human approval of a future protected-branch PR.


## Original F02 archive and local handoff — 2026-11-21
Performed by: Codex (AI-assisted sync/archive and evidence preparation). Reviewed by: Acceptance reported complete by requester; reviewer metadata unavailable. Edited by: Codex.

The requester explicitly asked to finish4.1–4.2 and confirmed “+Đã pass hết” after the remaining acceptance/source questions. Original [F02 task3.3](../../openspec/changes/archive/2026-11-21-f02-order-intake/tasks.md) is complete with actual final evidence. The [dated archive](../../openspec/changes/archive/2026-11-21-f02-order-intake/proposal.md) preserves proposal/design/tasks/metadata and the original delta; the [main order-intake spec](../../openspec/specs/order-intake/spec.md) contains all9 requirements and16 scenarios unchanged. Its descriptive Purpose is copied from the original proposal's existing capability description. Strict archive/main validation passed; local relative links were repaired.

The [BOOYAH-30 handoff](f02-verification/final-5d67ce8/README.md#prepared-booyah-30-handoff) and README Section E identify the same verified application commit **`5d67ce821e6c77c1952c8191a5086b0d8e712171`**. Video remains pending; no remote notification/publication, Jira transition, push, merge or deployment is claimed. This is a local artifact handoff to the requester. Later report/archive commits are distinct from the tested application commit. BOOYAH-17 itself remains unarchived for a separate finalization request.

Completion relies on the requester's reported closure of externally performed source/review checks; no reviewer name, review date/link, firsthand handout comparison or unrun NFR result has been invented. The known non-UTC/coverage/cosmetic limitations remain disclosed. Normal protected-branch human approval still applies to a future PR.


## QA change archived — 2026-11-21
Performed by: Codex (AI-assisted archival). Reviewed by: Prior requester-reported closure retained; no new reviewer claim. Edited by: Codex.

At the requester's explicit finalization request, the completed9/9-task QA change is retained in [the dated BOOYAH-17 archive](../../openspec/changes/archive/2026-11-21-booyah-17-f02-acceptance-verification/proposal.md). Metadata, proposal, design and completed tasks are preserved; this verification-only change has no delta specs, so no additional main-spec sync was required. Earlier statements that QA remained active describe the preceding preparation stage. BOOYAH-20 remains active and unchanged by this operation.

The verified application remains5d67ce821e6c77c1952c8191a5086b0d8e712171. No application edit, runtime rerun, push, merge, Jira transition, deployment or video publication is claimed by archive completion.
