# BOOYAH-17 triage and pending decisions
Performed by: Codex (AI-assisted evidence triage for BOOYAH-17 owner Nguyễn Thành Trung). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

This note records reproducible issue drafts and the reviewer decisions that still gate F02 acceptance. No Jira issue or comment has been published. The application revision observed was `9be2097b647b6a7ca7c6fdebc09d9267d8c30411`; see the [acceptance matrix](../PA3-F02-verification.md) for environment and run limits.

## Defect drafts
Performed by: Codex from current-build evidence. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

### B17-UI-01 — Minimum-year date values do not round-trip in order detail/edit
Performed by: Codex. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

- **Status:** Reproduced FAIL on application revision `9be2097b647b6a7ca7c6fdebc09d9267d8c30411`; fix and retest pending. Jira publication pending; no issue key beyond this draft identifier.
- **Environment:** Production Next server on `127.0.0.1:3017`, Chrome `156.0.8078.79`, isolated PostgreSQL 18.7 configured to UTC.
- **Reproduction:** Open the synthetic NEW order `CHECK-1795179481100-EARLIEST`, created with the accepted Ho Chi Minh City delivery window `0001-01-01 07:00`–`08:00`, then open its detail and choose Edit.
- **Expected:** The saved values render as valid local date/time values in the detail and prefill the edit controls, so an unchanged or permitted edit can preserve them.
- **Observed:** API values are `0001-01-01T00:00:00.000Z` and `0001-01-01T01:00:00.000Z`; detail shows `1-01-01 07:06` and `1-01-01 08:06`; both `datetime-local` inputs are empty and invalid. No mutation was submitted during the reproduction.
- **Evidence:** [DOM/API observation](checks/minimum-date-ui.json), [edit screenshot](checks/minimum-date-edit.png), and the [report reproduction](../PA3-F02-verification.md#confirmed-ui-defect-draft).
- **Bounded fix proposal:** Review whether detail/edit formatting can reuse the existing `localInput(date)` formatter in `src/lib/orders/validation.ts`, keeping the accepted date range and UTC+7 conversion consistent. This is a presentation fix; no data-model or migration change is proposed. Verify the behavior with the same boundary value and an ordinary date on a separately scoped application task, then rerun F02-06/F02-16 on the final application revision. This proposal is not implementation approval.

### B17-UI-02 — Missing favicon request
Performed by: Codex from current browser console/network evidence. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

- **Status:** Current-run GET `/favicon.ico` returns 404; disposition and local correction pending. Jira publication pending.
- **Evidence:** [Console/network capture](checks/favicon-console-network.json) records the request and 404 on `127.0.0.1:3017`. The browser walkthrough recorded zero uncaught page exceptions; this resource failure is separate from the expected validation and authorization responses.
- **Preliminary classification:** Cosmetic browser resource issue, with no observed order-flow failure attributed to it. Ask the reviewer to confirm whether adding a favicon is required for the demo/console criterion. Do not describe the console as error-free while the 404 remains. If required, track a bounded static asset/route correction separately and verify the request returns successfully.

## Acceptance decisions pending
Performed by: Codex from the local source and evidence. Reviewed by: Trần Lê Hải and the named owning reviewers (pending). Edited by: Codex.

| Topic | Evidence and current state | Decision needed to close the gate |
| --- | --- | --- |
| UC06 CSV preview versus direct import | Initial triage recorded this as unresolved. Superseded by the 2026-11-20 user direction below: the UC-F02 prototype governs this UI. Current implementation submits the selected file directly to the atomic import API. | Implement the preview/confirmation flow and retest it; the affected acceptance remains incomplete until correction and evidence. See [dated amendment](#2026-11-20-user-direction-and-fix-evidence). |
| Other prototype differences | Initial triage recorded post-create navigation and error-summary focus as awaiting disposition. Superseded by the 2026-11-20 user direction below: the UC-F02 prototype governs these flows. Current UI returns to the list after create and displays inline validation messages without a focused linked error summary. | Implement the specified detail confirmation and focused error summary, then retest. See [dated amendment](#2026-11-20-user-direction-and-fix-evidence). |
| Non-UTC minimum-year behavior | Earlier BOOYAH-18 handoff reports a null timestamp on an Asia/Bangkok PostgreSQL cluster at the year-0001 boundary. That is historical evidence, not a reproduction on this run; this BOOYAH-17 database was UTC. | BOOYAH-19 owner/reviewer should state the supported database timezone/environment and disposition the historical issue. The UTC pass does not establish non-UTC correctness. Preserve the historical evidence and do not narrow supported behavior without approval. |
| Vision candidate checkpoints | Local Vision 2.2-review candidate lists N01/N05/N06/N15/N16/N17 as PA3 checkpoints; review of the revision and §§5.3/6.1/6.2 is pending. Current Chromium F02 evidence does not establish every checkpoint (including cross-browser coverage or independent N15 setup). | Vision owner/reviewer should confirm accepted source revision and checkpoint applicability, then map evidence or remaining work. Do not claim full Vision/NFR compliance from this F02 matrix. |
| Official PA3 handout | The local report records the cited `PA3-2026 (1).pdf` as unavailable; no handout text was checked for this triage. | Compare final report structure, rubric language and PDF needs against the supplied official handout before submission. Keep handout-specific compliance pending. |
| F02-09 forged identity fields in the UI | The normal UI exposes no `order_code`, hub, state or audit controls; API probes rejected forged fields. The matrix keeps the whole UI criterion UNVERIFIED because it cannot be exercised through available UI controls. | Reviewer Hải should decide whether protected identity omission in the UI plus API rejection satisfies the scenario, or record the remaining acceptance test. Until recorded, retain UNVERIFIED; do not treat the API result alone as UI evidence. |

## Scope and handoff
Performed by: Codex. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

These drafts support task 3.1 triage only. They do not record reviewer acceptance, an approved requirement change, a Jira write, a product fix, a final verified application revision, or authorization to complete original F02 task 3.3/archive. Any application correction requires its own scoped work and applicable requirement/database approval; after an approved fix, rerun affected checks against the final committed application revision.

## 2026-11-20 user direction and fix evidence
Prepared by: Codex from the user's direction, archived fix artifacts and local evidence. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

The user directed that the [UC-F02 use case and its prototype](../../analysis-and-design/use-cases/UC-F02-Orders.md) govern the F02 UI. This resolves the earlier source-precedence question for this work. It does not claim independent reviewer acceptance, and the mismatches below require correction rather than waiver. The original application failure record at `9be2097b647b6a7ca7c6fdebc09d9267d8c30411` remains preserved in the [baseline report](../PA3-F02-verification.md).

### B17-UI-01 — bounded correction evidence
Prepared by: Codex (AI implementation and local verification). Reviewed by: Human review pending. Edited by: Codex.

The corrective OpenSpec change is retained in the [2026-11-20 archive](../../../openspec/changes/archive/2026-11-20-fix-f02-order-window-roundtrip/proposal.md). Its local fix record and [scoped retest results](window-roundtrip-fix/README.md) show the UI formatter now reuses the accepted UTC+7 `localInput` conversion with the native `T` separator. The production browser retest passed year 0001, ordinary year 2026 and upper year 9999 detail/edit/save/reload cases (3/3); identity and saved UTC windows stayed unchanged. The focused test passed 4/4; `npm test` passed 17/17; lint, typecheck and production build exited 0. No schema, migration, API, dependency, parser or stored timestamp change was made.

This is a scoped local correction only: the application worktree still contains uncommitted changes on base commit `9be2097b647b6a7ca7c6fdebc09d9267d8c30411`. It is not a final committed demo revision or independent acceptance. The original baseline failure remains recorded; F02-06/F02-16 need final-revision acceptance after remaining F02 corrections.

### Prototype mismatches requiring correction
Prepared by: Codex from the user direction and local UI/prototype source comparison. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

| Flow | Governing prototype behavior | Observed application behavior | Bounded correction scope |
| --- | --- | --- | --- |
| UC06 CSV import (`06.1`–`06.4`, `06.A1`–`06.A8`; screens `S06-01`, `S06-02`, `S06-03`, `S07-01-import-cancelled`, error/conflict variants) | `Check CSV` validates without saving and shows a read-only preview with **0 orders saved**. Only explicit **Import N orders** confirmation calls the atomic import endpoint; server rechecks authorization/codes. Cancel writes zero. Invalid rows show record/column/reason and zero writes; a confirmation-time conflict shows zero imported and requires a fresh preview. | The current `S06-01` form posts the selected file immediately to `/api/orders/import`; successful files commit without preview or confirmation. Errors are rendered in the picker, and there is no separate cancellation or confirmation-time-conflict screen. | Add a distinct validation/preview state and explicit confirm/cancel actions; call the existing atomic endpoint only on confirmation; preserve server-side revalidation and zero-write behavior for invalid/cancelled/conflicted batches. No schema or migration change is indicated. Retest valid 20-row import, mixed errors, file errors, cancel, conflict after preview and persistence. |
| UC05 successful create (`05.4`; screen `S07-02-created`) | After save, show the created order detail with an **Order created** confirmation; **Back to orders** returns to `S07-01`. | `submit` switches directly to the list and shows a generic success notice. | Keep the created order selected and show its detail with explicit creation confirmation and return action. Retest create, saved detail, return-to-list and reload persistence. No data-model change. |
| UC05 invalid create (`05.A1`; screen `S05-01-error`) | Focus an error summary with links to invalid fields and retain entered values. | API field errors render inline with `aria-invalid`/`aria-describedby`, but there is no focused summary with links. | Add an accessible summary that receives focus after a rejected create and links to each invalid control; keep current inline messages and entered values. Retest keyboard navigation, link targets, validation and unchanged persistence. No schema change. |

The source details are in [UC-F02-Orders.md](../../analysis-and-design/use-cases/UC-F02-Orders.md) and the [order-intake prototype guide](../../analysis-and-design/use-cases/prototypes/order-intake/README.md). These are implementation scopes, not claims that fixes already exist. The local year-window correction does not close these remaining prototype mismatches.

### Separate gates retained
Prepared by: Codex. Reviewed by: Trần Lê Hải and owning reviewers (pending). Edited by: Codex.

The historical non-UTC PostgreSQL boundary report remains un-reproduced on this UTC run and awaits BOOYAH-19 disposition. Vision candidate applicability/review, official handout comparison, and F02-09 disposition for API-only forged identity fields also remain pending; none is resolved by the user's prototype direction or by the scoped date fix. Favicon B17-UI-02 disposition and final committed-revision verification remain open.

## Current gate summary after archived fixes — 2026-11-20 16:53 UTC
Prepared by: Codex from the archived fix records and current scoped evidence. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

This dated summary supersedes earlier present-tense descriptions of the local UI state; those entries remain as historical findings. The [year-window correction](../../../openspec/changes/archive/2026-11-20-fix-f02-order-window-roundtrip/proposal.md) passes its scoped [local retest](window-roundtrip-fix/README.md), and the [prototype-parity correction](../../../openspec/changes/archive/2026-11-20-fix-f02-prototype-parity/proposal.md) passes its scoped [local verification](prototype-parity/README.md). The synced [order-intake interactions spec](../../../openspec/specs/order-intake-interactions/spec.md) records the prototype-governed interaction contract. Both result sets are from base `9be2097b647b6a7ca7c6fdebc09d9267d8c30411` plus uncommitted application changes. They show scoped local passes only: no final committed application revision or independent human acceptance is claimed, and the original failed baseline evidence remains intact.

**F02-09 current evidence:** the local prototype-parity browser evidence reports that the edit UI displays order code as read-only; the API integration checks reject forged `order_code`, hub, state and audit fields and check that identity is preserved ([parity evidence](prototype-parity/README.md), [integration results](prototype-parity/integration-final.txt)). Forged-field rejection remains API-tested because the UI offers no editable identity control. Keep F02-09 **UNVERIFIED pending required-mode disposition**: reviewer Hải must decide whether the read-only UI control plus API-boundary rejection satisfies the scenario, or specify another acceptable verification. No disposition is recorded here.

| Remaining gate | Current state |
| --- | --- |
| Non-UTC date/database behavior | Historical Asia/Bangkok minimum-year timestamp failure remains un-reproduced in this UTC environment; BOOYAH-19 owner/reviewer disposition and supported-environment impact are pending. |
| Vision checkpoints | Applicable accepted Vision revision and checkpoint dispositions/evidence remain pending; do not claim full NFR compliance. |
| Official PA3 handout | The cited handout remains unavailable locally; handout-specific rubric and report/PDF checks are pending. |
| B17-UI-02 favicon | Current captured `/favicon.ico` 404 remains without reviewer disposition or verified correction. |
| F02-09 mode | Read-only code control and API forged-field rejection have local evidence; required interaction-mode disposition remains pending. |
| Human acceptance | Trần Lê Hải's independent acceptance of the final committed build and report has not been recorded. |

**Task 3.2 final-build gate:** freeze and record a committed application revision after approved fixes, then rerun affected checks and the final scenario and permission matrix against that exact build. Keep the task open unless every applicable variant passes, required regression commands pass, and the full commit hash, environment and evidence agree; record failures otherwise. The [BOOYAH-17 task list](../../../openspec/changes/archive/2026-11-21-booyah-17-f02-acceptance-verification/tasks.md) remains controlling.

**Task 4.2 human-acceptance and archive gate:** only after passing verification and independent acceptance, update original `f02-order-intake` task 3.3 with evidence; sync/archive that original change and verify the root spec, retained proposal/design/tasks/spec, repaired links and strict validation. Update README/report archive references and hand off the same verified application hash to BOOYAH-30 through authorized channels; record the AI log and remaining limitations. The task does not authorize archiving this QA change, pushing/merging, or transitioning Jira without corresponding authorization. Reviewer acceptance, handout/checkpoint decisions, PDF/report completion and final-build proof remain prerequisites tracked under tasks 4.1–4.2.


## Prototype correction local results — 2026-11-20
Performed by: Codex (AI implementation/evidence collation). Reviewed by: Trần Lê Hải (acceptance pending). Edited by: Codex.

The [separate parity correction](../../../openspec/changes/archive/2026-11-20-fix-f02-prototype-parity/proposal.md) now has [local passing evidence](prototype-parity/README.md) for read-only preview/explicit confirmation/cancel/mixed diagnostics/commit conflict, saved mutation-detail/dismissal navigation and focused linked errors. Unit18/18, lint/typecheck/build, API integration11/11 and7 browser groups passed. This supplements rather than rewrites the earlier findings. Base HEAD plus uncommitted correction is explicitly recorded; final committed-build review and BOOYAH-17 acceptance remain pending. No Jira publication or human acceptance is claimed. Other timezone/Vision/handout/F02-09 and favicon decisions remain unresolved.

## Requester disposition of scoped evidence — 2026-11-20 16:55 UTC
Recorded by: Codex from the requester’s current message (GitHub handle unverified). Reviewed by: Independent reviewer Trần Lê Hải (still pending). Edited by: Codex.

Requester statement: “+Xác nhận thành công ổn ấp hết rồi”. In context, record this as the requester’s acceptance of the presented scoped date-window and prototype-parity local results for the documented UTC demo, including F02-09 evidence: the edit form exposes order code read-only and API probes reject forged identity fields. This resolves the requester-facing F02-09 interaction-mode disposition for this demo. The cited tests and browser runs are the evidence accepted; this statement is not a claim that additional checks ran.

The demo remains scoped to the documented UTC database setup. The earlier Asia/Bangkok year-0001 timestamp failure remains a known, un-reproduced non-UTC limitation; do not claim non-UTC support or universal database-timezone correctness. Vision checkpoint disposition, official handout comparison and favicon 404 review/correction remain separate gates. This requester disposition is not Trần Lê Hải’s independent review or acceptance of the final report/application.

The [3.2 final-build gate](../../../openspec/changes/archive/2026-11-21-booyah-17-f02-acceptance-verification/tasks.md) remains open while the application changes are uncommitted. The parent agent is proceeding with the authorized local application freeze and retest; record the exact committed hash and actual outcomes only after they exist. Task 4.2 still requires passing verification and independent acceptance before updating original F02 task 3.3 and syncing/archiving that original change; its evidence, strict validation, repaired links and same-hash BOOYAH-30 handoff remain outstanding. No QA-change archive, push, merge or Jira transition is implied by the requester statement.


## Final scoped requester disposition and committed retest — 2026-11-21
Performed by: Codex (AI-assisted evidence collation). Reviewed by: Requester confirmed scoped results; independent acceptance pending. Edited by: Codex.

The requester’s confirmation covers the presented original F02 verification approach, the documented UTC demo and disclosed limitations; no additional requirement or test result is inferred. Date/prototype corrections are now committed at `5d67ce821e6c77c1952c8191a5086b0d8e712171`; [final actual checks](final-5d67ce8/README.md) and [final16-scenario matrix](../PA3-F02-verification.md#final-committed-application-verification--2026-11-21) pass on that unchanged application tree. F02-09 uses readonly UI identity plus rejected forged API fields as confirmed by requester. Favicon404 is retained as a disclosed nonblocking cosmetic issue for this scoped demo. The historical non-UTC defect is not declared fixed or universally supported. Vision/NFR evidence outside this run and the unavailable handout comparison remain UNVERIFIED follow-up, not passing certifications.

Task3.1 scoped triage has a recorded requester disposition and no unresolved original F02 functional failure in the tested UTC environment;3.2 has a frozen application commit and passing final scenario/permission evidence. Task4.1 remains open for its actual handout/checkpoint reconciliation; matching draft report/PDF and README E can be reviewed. Task4.2 still requires independent acceptance before original F02 archival. No named independent reviewer approval, Jira publication, push/merge, release or video claim is made.


## Requester-reported final closure — 2026-11-21
Performed by: Codex (AI-assisted record). Reviewed by: Acceptance reported complete by requester; reviewer identity/link unavailable. Edited by: Codex.

The requester asked to finish4.1–4.2 and stated “+Đã pass hết” after the missing handout/independent-acceptance question. Those external closure checks are recorded as passed according to the requester, not as new AI execution or a named review. Original [F02 archive](../../../openspec/changes/archive/2026-11-21-f02-order-intake/proposal.md) and [main spec](../../../openspec/specs/order-intake/spec.md) are now in place; the [final report](../PA3-F02-verification.md) preserves the verified application hash and all limitations. Earlier pending notes remain historical. No application changes, unavailable reviewer details, unrun NFR PASS or external publication are invented.
