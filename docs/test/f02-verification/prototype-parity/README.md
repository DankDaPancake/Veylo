# F02 prototype parity verification
Performed by: Codex (AI implementation/verification; Luna backend/UI workers and independent AI review). Reviewed by: Human acceptance pending. Edited by: Codex.

## Scope and identity
Performed by: Codex. Reviewed by: Human acceptance pending. Edited by: Codex.

The user selected the authored UC05–UC08 prototype as the interaction target. This record covers the separate [parity correction](../../../../openspec/changes/archive/2026-11-20-fix-f02-prototype-parity/proposal.md), not final BOOYAH-17 acceptance. Base HEAD is `9be2097b647b6a7ca7c6fdebc09d9267d8c30411` plus uncommitted application changes, including the prior year-0001 correction. No final committed demo revision is claimed. Synthetic fixtures only; no schema/dependency changes.

The existing isolated database is `veylo_demo`, PostgreSQL18.7, UTC at loopback54417; production server origin is loopback3017. SQL confirmed database/timezone. Node24.22.2 and Next16.4.6; available physical RAM10GiB before the first production build. No shared service or data reset was performed.

## Backend wave
Performed by: Codex with Luna backend worker and independent AI reviewer. Reviewed by: Human acceptance pending. Edited by: Codex.

- Shared CSV analysis exposes records, valid normalized code occurrences and all field/in-file/width diagnostics; the existing parse wrapper remains the commit boundary.
- Guarded `POST /api/orders/import/preview` queries only authorized-hub codes and writes nothing. Clean response contains orders, total, valid and saved0. Mixed diagnostics include current same-hub collisions even when another record is invalid.
- The existing atomic import is still the confirmation endpoint, revalidating current authorization and file/codes. A preview neither reserves codes nor grants permission.
- [Backend build](backend-build.txt) exited0; [initial extended integration](integration.txt) exited0 with10 subtests plus parent (11 records), no skips/failures. Preview20 rows/repeated checks left counts unchanged; explicit commit wrote20; foreign-only codes did not collide; mixed diagnostics and post-preview race rollback passed. New route checks cover anonymous401, Admin/Rider403, current-hub403 and expired401. The initial run was followed by stronger preview-value/mixed-error no-write assertions, to be exercised in the final regression below.
- Luna independent review found no backend correctness/security issues and suggested the stronger assertions above. AI review is not human acceptance.

## Final regression
Performed by: Codex (actual local execution). Reviewed by: Human acceptance pending. Edited by: Codex.

| Command/check | Result |
| --- | --- |
| `npm test` | Exit0,18/18; [output](test.txt). |
| `npm run lint` | Exit0; [output](lint.txt). |
| `npm run typecheck` | Exit0; [output](typecheck.txt). |
| `npm run build` | Exit0; [production build](build.txt). |
| `npm run start -- --port 3017` | Production Ready; [startup](server-start.txt). |
| `VEYLO_ENABLE_DEMO_SEED=1 node --env-file=.env --test --test-concurrency=1 tests/orders.integration.mjs` | Exit0,10 subtests plus parent (11 records); [final output](integration-final.txt). All stronger preview-value/mixed-error no-write assertions passed. |
| Focused production-browser runner | Exit0,7 groups passed, zero page exceptions; [output](browser-output.txt), [results/source hashes](browser-results.json). |

Chrome156.0.8078.79 ran at1440×900 and1280×720 through the preinstalled Python/Playwright environment. Both frames passed required-blank and malformed-phone summary focus, field-link keyboard focus, input retention, create→detail, protected edit code, discard/no-write, edit→detail/reload, cancellation dismissal, short-reason feedback and saved CANCELLED detail/reason. Year0001 windows remained unchanged through edits. CSV check displayed20 preview records and0 saved, cancel wrote0, explicit confirm wrote20, completion/View orders worked, mixed in-file+field+same-hub errors showed record/column/reason and focused diagnostics, and file replacement cleared stale confirmation.

Additional checks passed: a competing API create after preview caused UI confirmation409 and atomic rollback; competing edits/cancellation caused stale UI actions409 then Reload order opened the newest detail and retained the original cancellation reason; signing out after preview produced401 and signing in again did not replay import. Second-actor API requests are labeled controlled race fixtures, not additional UI tabs. Seven groups are not seven independent spec scenarios. No full cross-browser/NFR or independent human acceptance is claimed.

Luna's final read-only UI review found one focus gap: diagnostics were outside the focused summary. Parent moved the actual diagnostic table into the focused report summary, keeping the scrollable diagnostic region keyboard reachable, then reran lint/typecheck/build and final browser checks. No preview writes or disclosure findings were identified. Parent visually inspected1280-preview.png; other captures were generated by the runner.

The first browser harness attempt incorrectly required an untouched optional note to be null although form serialization had saved an empty string; [failure](initial-harness-attempt/browser-output.txt) is retained. Corrected the assertion to compare the saved before value. The next attempt passed both viewport groups and race/stale recovery but tested API count too early during reauthentication because a URL glob matched the sign-in query's `/orders` suffix; [failure](signin-harness-attempt/browser-output.txt) is retained. Corrected only the harness to wait for the exact Orders pathname and enabled Create order control. The final run passed all groups; no product edits were needed for either harness issue. An earlier typecheck launch from repository root failed at shell output redirection before npm ran; the actual documented src invocation passed above.

## Evidence and reproduction
Performed by: Codex. Reviewed by: Human acceptance pending. Edited by: Codex.

- 1440: [validation](1440-create-errors.png), [created detail](1440-created-detail.png), [cancelled detail](1440-cancelled-detail.png), [preview](1440-preview.png), [complete](1440-complete.png), [mixed diagnostics](1440-mixed-diagnostics.png).
- 1280: [validation](1280-create-errors.png), [created detail](1280-created-detail.png), [cancelled detail](1280-cancelled-detail.png), [preview](1280-preview.png), [complete](1280-complete.png), [mixed diagnostics](1280-mixed-diagnostics.png).
- [Confirmation conflict](confirmation-conflict.png), [stale cancellation recovery](stale-cancellation-recovery.png).

The source hashes in browser-results.json and [application patch](application.patch) identify the tested worktree. The patch includes the earlier date correction on the same base commit; it is not a new commit. Only task-owned local server3017 was restarted; unrelated server untouched. The existing integration suite replays the guarded synthetic seed and expires/restores fixture sessions/hub; no schema migration or shared reset was performed. Local server/database remain available for follow-up.

To reproduce from repository root with that isolated environment, set VEYLO_DEMO_PASSWORD without printing it and run the existing workstation-local tool:

```bash
/tmp/veylo-booyah15-pdf/bin/python docs/test/f02-verification/prototype-parity/check_browser.py
```

The runner creates synthetic data, edits/cancels its fixtures, signs in/out of Dispatcher A and overwrites its output/capture filenames. Preserve prior evidence first; do not run alongside another reviewer session. This environment is not a new application dependency or portable clean-machine claim. No final demo hash, commit/push, deployment, Jira publication or archive is authorized by these results. BOOYAH-17 final committed-build verification, remaining source/NFR dispositions, independent acceptance and PDF remain pending.

Archive record (2026-11-20): user authorized sync then archive. The four interaction requirements/eight scenarios are synced to [the main interaction spec](../../../../openspec/specs/order-intake-interactions/spec.md); proposal/design/tasks/delta remain in the dated archive linked above. This does not close final BOOYAH-17 acceptance.
