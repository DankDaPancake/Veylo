# BOOYAH-17 local verification runners
Performed by: Codex (AI-assisted verification; Luna prepared initial browser harness). Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

These checks write synthetic fixtures only to the isolated production server at `http://127.0.0.1:3017`. They do not reset a database. Start the verified application with the disposable UTC database described in the [setup record](../setup/booyah17-database.md) and set `VEYLO_DEMO_PASSWORD` to the documented local-only password from [src/README.md](../../../../src/README.md). Do not print or commit environment values.

## Reproduce
Performed by: Codex. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

Run from the repository root with Python Playwright already installed and Google Chrome at `/usr/bin/google-chrome`. This workstation used `/tmp/veylo-booyah15-pdf/bin/python`; that existing environment is tooling, not a new application dependency or a portable setup claim.

```bash
/tmp/veylo-booyah15-pdf/bin/python docs/test/f02-verification/browser/run_browser_check.py
/tmp/veylo-booyah15-pdf/bin/python docs/test/f02-verification/browser/check_remaining_variants.py
/tmp/veylo-booyah15-pdf/bin/python docs/test/f02-verification/browser/check_keyboard.py
VEYLO_ENABLE_DEMO_SEED=1 node --env-file=src/.env docs/test/f02-verification/check-permissions.mjs
```

Run the permission probe after browser work: it temporarily removes/restores Dispatcher A's hub and expires that fixture's sessions. It verifies the local database opt-in and server origin before any writes. Do not run it alongside human review or another user's session.

The primary browser run creates unique order codes and overwrites its local fixture/output filenames. Preserve evidence needed from a previous run before rerunning. The oversized file is generated for the limit check and removed afterward. Keyboard retest uses the manual order and CSV fixtures from the recorded primary run, does not create a second batch, and deliberately tests duplicate rejection. Runners and observations were prepared locally; they are not part of the selected application commit.

## Actual results and limits
Performed by: Codex. Reviewed by: Trần Lê Hải (pending). Edited by: Codex.

- [Primary observations](observations.json): 27 passing checks, one initial bounded keyboard-search failure. The runner was subsequently adjusted to wait for settled controls and search a full tab cycle. Existing passing flows were not rerun for that adjustment.
- [Targeted keyboard retest](keyboard-retest.json): five groups passed; [output](keyboard-retest-output.txt). This does not resolve the independently reproduced minimum-year date defect.
- [Remaining validation variants](remaining-variants.json): eleven passed; [page fallback](page-fallback.json) also passed via UI cancellation of the sole NEW row on page2, reducing21 matching orders to20 and retaining filters. The supplemental runner requires the fresh21-row CSV set from the primary run.
- [Permission responses](../checks/permissions.json): 38 expected responses with unchanged orders and restored hub; [output](../checks/permissions-output.txt).
- Browser automation used Chrome 156.0.8078.79, with 1440x900 walkthroughs and 1280x720 layout smoke. This is not Firefox/Edge/Mobile Safari or full accessibility certification.
- DevTools in the worker could not attach due profile contention; its save paths were also outside the MCP's configured roots. Parent execution used the preinstalled Playwright fallback with a separate Chrome context. Parent DevTools separately captured the date defect; its image was saved through the local filesystem tool after MCP path-save rejection.
- See the [acceptance report](../../PA3-F02-verification.md) for source-scenario coverage, failures, unavailable UI variants and pending human decisions. Check counts are not counts of passed spec scenarios.
