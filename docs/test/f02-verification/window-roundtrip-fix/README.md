# B17-UI-01 local correction and retest
Performed by: Codex (AI implementation and verification). Reviewed by: Human review pending. Edited by: Codex.

## Build identity and scope
Performed by: Codex. Reviewed by: Human review pending. Edited by: Codex.

Date: 2026-11-20 UTC. Base HEAD is `9be2097b647b6a7ca7c6fdebc09d9267d8c30411` plus the uncommitted [application correction](application.patch). This is a corrected local build, not a committed or accepted demo revision. [Browser results](browser-results.json) record SHA-256 for the three changed application/test files and Chrome 156.0.8078.79 at 1440×900. Node v24.22.2, Next 16.4.6; existing task-owned PostgreSQL 18.7 at loopback54417, `veylo_demo`, UTC. SQL confirmed database/timezone; a guard confirmed the ignored local env targeted that database and browser origin3017 without printing values. Available physical memory was11GiB before heavy jobs (free3GiB plus reclaimable cache).

Correction: extracted the actual UI `formValue` helper into the existing `order-form.mjs`; replaced Intl timezone formatting with the existing pure `localInput` UTC+7 conversion and native `T` separator. Validator has no imports or server/database dependency chain. Production client build passed. No parser, date limits, schema, API, dependency or stored timestamp changes.

## Checks
Performed by: Codex. Reviewed by: Human review pending. Edited by: Codex.

| Check | Actual result |
| --- | --- |
| `node --test src/tests/order-form.test.mjs` before correction | Exit1,3PASS/1FAIL; actual formatter returned `1-01-01T07:06` instead of `0001-01-01T07:00`. [Failure](regression-before.txt). |
| Same focused check after correction | Exit0,4PASS. [Retest](regression-after.txt). |
| `npm test` from src | Exit0,17/17. [Output](test.txt). |
| `npm run lint` | Exit0. [Output](lint.txt). |
| `npm run typecheck` | Exit0. [Output](typecheck.txt). |
| `npm run build` | Exit0, production webpack build/type checks complete. [Output](build.txt). |
| `npm run start -- --port 3017` | Production server Ready in105ms; left running for follow-up. [Startup](server-start.txt). |
| Focused production-browser runner | Exit0,3/3 boundary cases passed. [Output](browser-output.txt), [sanitized results](browser-results.json), [runner](check_browser.py). |

For each of year0001,2026 and9999, fixtures were created through the authenticated API, followed by UI list/detail, valid prefilled edit inputs, a note edit/save, full reload, reopened detail and API readback. Saved UTC windows, order ID/code and NEW state remained unchanged; version advanced1→2 and edited note persisted. No full F02 permission/integration suite rerun or independent human acceptance is claimed.

| Window | Detail | Edit inputs | After reload |
| --- | --- | --- | --- |
| `0001-01-01 07:00`–`08:00` | [Screenshot](minimum-detail.png) | [Screenshot](minimum-edit.png) | [Screenshot](minimum-after-reload.png) |
| `2026-11-20 09:00`–`10:00` | [Screenshot](ordinary-detail.png) | [Screenshot](ordinary-edit.png) | [Screenshot](ordinary-after-reload.png) |
| `9999-12-31 23:58`–`23:59` | [Screenshot](maximum-detail.png) | [Screenshot](maximum-edit.png) | [Screenshot](maximum-after-reload.png) |

The initial browser harness attempt reached the minimum-date note save/reload but failed while asserting `hub_id`, a field the API does not return. Its [output](initial-harness-attempt/browser-output.txt), partial results and screenshots are retained. Corrected the harness to compare exposed ID/code, windows and state, then reran all three flows successfully. No product change was needed after this harness failure.

## Reproduction and remaining acceptance
Performed by: Codex. Reviewed by: Human review pending. Edited by: Codex.

Use only the [task-owned isolated setup](../setup/booyah17-database.md), production server3017 and synthetic demo account. From repository root set `VEYLO_DEMO_PASSWORD` without printing it, then run the already-installed Playwright environment:

```bash
/tmp/veylo-booyah15-pdf/bin/python docs/test/f02-verification/window-roundtrip-fix/check_browser.py
```

This runner creates three synthetic orders, edits only their notes and overwrites this folder's current result/screenshot filenames. Preserve earlier evidence before rerunning. It is workstation-local tooling, not a new application dependency or N15 claim.

B17-UI-01 passes these scoped local retests. The [BOOYAH-17 baseline report](../../PA3-F02-verification.md) retains the original13PASS/2FAIL/1UNVERIFIED evidence at its original application revision. A final committed build/retest and independent acceptance are still needed; CSV/prototype/non-UTC/Vision/handout/API-only UI decisions, favicon disposition, final QA task3.1 and archival remain pending. Do not treat this narrow correction as all-green F02 acceptance.

Archive record (2026-11-20): the completed correction change is retained in [the OpenSpec archive](../../../../openspec/changes/archive/2026-11-20-fix-f02-order-window-roundtrip/proposal.md). This archive does not establish final BOOYAH-17 acceptance.
