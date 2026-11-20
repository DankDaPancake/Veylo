# F02 denied navigation and import-file recovery verification

**Performed by:** Codex with Luna workers. **Reviewed by:** Codex integration review; human review pending. **Edited by:** Codex.

Change: [fix-f02-denied-navigation-and-import-file-reset](../../../openspec/changes/archive/2026-11-21-fix-f02-denied-navigation-and-import-file-reset/proposal.md). Verification used the local working-tree correction on application baseline `29b3765` (application logic previously verified at `5d67ce8`). The correction is not committed in this run.

The production diff in `src/app/orders/workspace.tsx` adds `!denied` to the common back-control gate and clears the retained upload only when a failed preview confirmation returns to `pick`. Normal picker-origin failure keeps its selection; row diagnostics retain report/replacement recovery. No API, schema, dependencies or business rules changed.

## Results

| Check | Actual result |
| --- | --- |
| Regression before source correction | `node --test tests/orders-workspace.test.mjs`: 14 tests, 9 passed and 5 failed. Failures were cancellation 401/403 plus confirmation network/500/file-level 400; the positive controls passed. |
| Regression after source correction | Same focused test: 14/14 passed. The test executes actual transpiled component handlers with mocked hooks/fetch/FormData; it is not a DOM test. |
| `npm test` from `src` | 32/32 passed, exit 0; [output](test.txt). |
| `npm run lint` from `src` | Passed, exit 0; [output](lint.txt). |
| `npm run typecheck` from `src` | Passed, exit 0; [output](typecheck.txt). |
| `npm run build` from `src` | Production webpack build passed, exit 0; [output](build.txt). Available RAM was 13 GiB before build. |
| Real browser | Chrome 156.0.8078.79, sandbox enabled, 1440×900: 11 recovery groups passed on the fresh production build at loopback port 3020; [results](browser-results.json). |
| OpenSpec and scope | `openspec validate fix-f02-denied-navigation-and-import-file-reset --strict --json` passed without issues; whitespace, UTF-8/newline and local-link checks passed for the new files. |

Browser checks verified separate cancellation 401/403 with keyboard recovery and no replay, ordinary Keep/Back, 409 reload, successful cancellation detail/reason, separate 404 recovery, three non-row confirmation failures, picker-origin retention, row diagnostics/replacement and successful import. After each failed preview confirmation, the native picker had zero files, an empty Check CSV made no upload request and replacement selection uploaded the new filename. [Denied-state screenshot](cancel-401-recovery.png) and [reset-picker screenshot](confirmation-file-reset.png) show the targeted states.

The [initial partial browser attempt](browser-initial-attempt.json) passed five groups then hit a test timing assertion on 404 recovery. Waiting for the recovery button replaced the immediate visibility check; the rerun passed all groups. No application change was made for that test timing issue.

## Reproduction and limits

Run `npm test` from `src` for the persistent Node regression. For the browser runner, build and start the application on port 3020 with `BETTER_AUTH_URL=http://127.0.0.1:3020`, the existing dedicated local demo database and the documented synthetic dispatcher account. Supply `VEYLO_DEMO_PASSWORD` only through the environment, then run:

```sh
/tmp/veylo-booyah15-pdf/bin/python docs/test/f02-recovery-fix/check_browser.py
```

That temporary Python environment contains Playwright; the runner uses `/usr/bin/google-chrome`. Equivalent local tooling is needed elsewhere. Every order API request is intercepted and answered from synthetic fixtures, with zero unexpected order calls and zero order database mutations. Real local sign-in can create an auth session; no credentials/cookies are recorded. These checks establish client recovery behavior, not a fresh backend integration or remote import rollback/idempotency guarantee.

The temporary 3020 server was stopped after verification; existing unrelated services were left alone. The requester subsequently authorized main-spec sync and archival: both modified requirement blocks and all scenarios were verified against the main spec, and the completed change was archived on 21 November 2026. No commit, push, PR update, merge or deployment was performed. Existing AI logs were left unchanged as requested.
