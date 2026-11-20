# Frozen F02 acceptance run
Performed by: Codex (AI-assisted execution for BOOYAH-17). Reviewed by: Requester accepted scoped evidence; independent reviewer acceptance pending. Edited by: Codex.

## Application identity and environment
Performed by: Codex. Reviewed by: Independent acceptance pending. Edited by: Codex.

Application commit: **`5d67ce821e6c77c1952c8191a5086b0d8e712171`** on local task branch `docs/booyah-17-explore-refresh`. `git status --porcelain -- src` is empty. Documentation/evidence remain separate worktree changes; no push/merge or final release approval is claimed. User confirmed current results with “+Xác nhận thành công ổn ấp hết rồi”; this is requester disposition, not a claim of Trần Lê Hải's independent review or unrun NFR checks.

Linux, Node24.22.2, npm11.19.1, Next16.4.6, PostgreSQL18.7 `veylo_demo` UTC at loopback54417, production origin3017. Chrome156.0.8078.79 via existing Python/Playwright; desktop1440×900/1280×720. Available physical RAM12GiB before heavy jobs. Commands ran on20Nov UTC /21Nov Asia/Ho_Chi_Minh as the session crossed midnight. No schema changes/shared reset/new dependencies.

## Actual checks
Performed by: Codex. Reviewed by: Independent acceptance pending. Edited by: Codex.

| Command/check | Result |
| --- | --- |
| `npm test` | Exit0,18/18; [output](test.txt) |
| `npm run lint` | Exit0; [output](lint.txt) |
| `npm run typecheck` | Exit0; [output](typecheck.txt) |
| `npm run build` | Exit0; [output](build.txt) |
| `npm run start -- --port 3017` | Production Ready; [output](server-start.txt) |
| Explicit local opt-in/direct Node integration | Exit0,10 subtests plus parent (11 records); [output](integration.txt) |
| Expanded production UI | Exit0,10 groups PASS, zero page exceptions; [results](browser-results.json), [output](browser-output.txt), [runner](check_browser.py) |
| Role pages and keyboard template download | Exit0,5 checks PASS; [results](pages.json), [runner](check-pages.py) |
| Supplemental all-route permissions | Exit0,43 expected denials, orders/foreign record unchanged and hub restored; [responses](permissions.json), [output](permissions-output.txt), [runner](check-permissions.mjs) |

The final UI run includes actual readonly preview/cancel/confirm20, mixed field/in-file/current-hub diagnostics, replacement, commit-time conflict rollback, stale edit/cancel recovery, create/edit/cancel detail, no-write discard/keep, linked error focus/keyboard, sign-in/out recovery without replay, invalid weight/reversed/equal windows/paired or bounded coordinates, duplicate manual code, empty/header-only/missing/unknown/duplicate headers, malformed syntax/UTF8/wrong extension,501-record/byte limits, quoted BOM/CRLF preview, combined literal/status/date list filters,20-row paging, empty results and an in-UI21→20 page-shrink fallback. Boundary-year0001 windows remain unchanged through edit. API supplements cover forged identity fields, controlled races and DB boundaries; those are explicitly not represented as user controls.

Separate page checks verified anonymous sign-in recovery, Admin/Rider denial, hub-B no disclosure of an A-only code and an actual template download activated by keyboard. Session expiry/current-hub reassignment run after browser checks to avoid contaminating capture sessions.

Two initial final-run harness failures are retained: [status selector attempt](initial-harness-attempt/browser-output.txt) used an exact nested-label name that did not resolve; the corrected selector targets the actual list select. [Page-heading attempt](page-harness-attempt/pages-output.txt) expected “Sign in” instead of the actual “Sign in to Veylo” heading. Both were runner assumptions; no application edit followed. The full corrected runs passed. Earlier fix/browser evidence stays at its original revisions.

Actual UI sign-in and keyboard sign-out were also retested, including protected-page revisit and old-session401: [results](signout.json), [output](signout-output.txt).

## Limits and handoff
Performed by: Codex. Reviewed by: Independent acceptance pending. Edited by: Codex.

This proves the final original16 F02 scenarios and scoped interaction behavior on the documented UTC local setup, subject to the report's requester-approved verification modes. It does not establish historical non-UTC correctness, full Vision/NFR certification, cross-browser coverage, independent N15 setup or human peer approval. Favicon404 is a known cosmetic resource issue accepted as nonblocking by requester disposition; no error-free-console claim. Official handout text remains unavailable for direct comparison. BOOYAH-30 video remains pending and must use the same verified application hash after acceptance. Original F02 archive requires independent acceptance; no reviewer identity was inferred.

Final supplements: [actual UI sign-out](signout.json), [wrong-width record2 focus and imported orders after full reload](width-reload.json), [database table inventory](table-inventory.txt) (no DeliveryAttempt table). These checks passed on the same frozen commit; see [width/reload screenshots](width-diagnostics.png) and [imported list](imported-after-reload.png).


## Prepared BOOYAH-30 handoff
Performed by: Codex (AI-assisted local handoff preparation). Reviewed by: Independent final acceptance pending. Edited by: Codex.

- Application commit: `5d67ce821e6c77c1952c8191a5086b0d8e712171`; local task branch, application tree clean at verification.
- Entry/setup: [documented local application commands](../../../../src/README.md); isolated UTC demo database and synthetic accounts only.
- Verified scope: original16 F02 scenarios, focused prototype interaction checks and43 denial responses. [Acceptance report](../../PA3-F02-verification.md) / [matching PDF](../../PA3-F02-verification.pdf).
- Remaining prerequisites: official handout/checkpoint reconciliation and actual independent acceptance before original F02 archive/release handoff.
- Recording: BOOYAH-30 video/URL pending. Use the same accepted application commit; do not record a later changed application build under this verification hash.
- Delivery state: local handoff ready for review; no external message, Jira transition, push or published video has been sent/claimed.


## Local closure and handoff status — 2026-11-21
Performed by: Codex. Reviewed by: Acceptance reported complete by requester; reviewer metadata unavailable. Edited by: Codex.

Requester confirmed “+Đã pass hết” after the remaining4.1/4.2 source/review questions. Record those external closure checks as user-reported passed, without inventing reviewer identity/link or an assistant-reviewed handout. Original F02 is now [archived](../../../../openspec/changes/archive/2026-11-21-f02-order-intake/proposal.md) and [synced](../../../../openspec/specs/order-intake/spec.md); earlier pending notes above describe the preparation stage. The prepared same-hash handoff is delivered locally to the requester with this record. BOOYAH-30 recording/video and any external notification remain pending; no publication is claimed. Application commit remains5d67ce821e6c77c1952c8191a5086b0d8e712171.
