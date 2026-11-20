# BOOYAH-20 code check and archive — 21 November 2026

**Performed by:** Codex (AI). **Reviewed by:** Pending for this archive-status update. **Edited by:** Codex.

The requester authorized syncing and archiving after careful code checks. The change contains 21/21 checked tasks, eight prototype requirements and 20 scenarios. [PR #16](https://github.com/DankDaPancake/Veylo/pull/16) was approved by Cee-Ka against final head `f7f296a4ea510660c15a83be27be3d8adf84785d` at 09:18:55 UTC on 20 November 2026 and merged at 09:19:14 UTC. Its empty approval body does not enumerate the detailed AC3–AC5 walkthrough or separate Kiệt/team confirmations. Historical initial changes-requested review remains part of the record.

## Code comparison

| Delta requirement | Current code and verification |
| --- | --- |
| UC05 manual creation and validation | Prototype `contract.js` validates required fields, phone, code, Unicode text, hub-local timestamps, positive finite weight and paired coordinates. `order-intake.js` retains input, renders field/summary feedback, escapes displayed input and adds one NEW order only after validation. Existing verifier exercises creation, correction and duplicate recovery. |
| D-F02-2 scoped duplicates | Lowercase trimmed keys in the synthetic hub and CSV duplicate occurrence counts; production service scopes stored-code lookups by trusted hub. Verifier checks both duplicate rows and same-hub collision. Cross-hub isolation in the standalone demo is simulated. |
| UC06 preview and atomic import | File parsing and preview mutate no saved orders; confirmation rechecks the batch before adding it. Dismissal creates zero orders; conflict leaves the batch unapplied. Production import uses a transaction. Browser checks assert 20 imports or zero and list counts after dismissal/errors. |
| D-F02-4 CSV and feedback | Strict UTF-8 decoding, optional BOM, LF/CRLF, quoted commas/newlines, reordered required headers, optional fields, width checks and both limits. Current backend template equals the fixture byte-for-byte; the valid fixture parses 20 rows. Invalid input gives six parser errors and seven prototype diagnostics with the simulated existing code. |
| UC07 search and detail | Code/name/phone literal case-insensitive filtering, inclusive window-start dates, displayed-code tie-break, 20-row pages and out-of-range fallback. Empty, no-match, invalid-range and absent-order states have recovery; existing browser checks exercise them. |
| UC08 update and cancellation | Code is read-only and omitted from edit submission; NEW-only mutation, trimmed 5–300-character reason, retained order identity/reason and stale/already-cancelled examples. Current backend uses version and status predicates; the prototype uses explicit conflict injection, not real versioned persistence. |
| Role and hub boundary | Independent simulated 401/403/404 states, safe exits and no mutation replay after sign-in. Source inspection confirms the production access wrapper delegates to the trusted dispatcher guard and hub-scoped service. Prototype checks do not prove server authentication or database isolation. |
| Section D evidence | Existing verifier checks all 39 light states at both target viewports, keyboard/mouse walkthroughs, distinct PNGs, Markdown links/embeds and matching A4 PDF. |

Application source inspected at `5d67ce821e6c77c1952c8191a5086b0d8e712171`: order validation, CSV parser, service and access wrapper. Application logic is unchanged in the working tree; `src/README.md` has prior documentation edits. [Current parser comparison output](current-code.txt) records actual assertions without database calls. The earlier [F02 acceptance report](../PA3-F02-verification.md) contains separate application-runtime evidence; no new database integration run is claimed here.

## Reproduction

From the repository root, use the locked prototype dependency and available local Chrome:

```sh
npm --prefix docs/analysis-and-design/use-cases/prototypes/order-intake ci --ignore-scripts --no-audit --no-fund
node docs/test/booyah20-archive/check.mjs --pdf
node docs/test/booyah20-archive/check.mjs
openspec validate --specs --strict --json
```

`check.mjs` runs the existing verifier/exporter with only the browser launch changed to sandboxed `/usr/bin/google-chrome`. It does not overwrite PNG captures. The preceding readiness run passed with Chrome 156.0.8078.79; the original documented Chromium 149 environment is not re-certified. [Final verifier output](results.txt) and [PDF export output](pdf-export.txt) record this archival run.

Final results: the full verifier passed both viewports, all 39 distinct PNGs, Markdown references and the regenerated A4 PDF (29 pages, 39 figures), exit 0. All eight main specs passed [strict validation](spec-validation.json); the archived proposal and delta passed [direct strict validation](archive-validation.json) without issues. Eight moved/new/affected Markdown files passed UTF-8, final-newline and relative-link checks. Purpose and all eight requirement/20 scenario blocks match after link normalization. Archive metadata and 21 checked tasks were retained; `openspec list --json` now reports no active changes. `git diff --check` passed.

The [main spec](../../../openspec/specs/order-intake-prototype/spec.md) uses canonical main-spec headings and the authored Purpose. The requirement bodies/scenarios are preserved after updating the stale PR-review metadata and rebasing the decision-register link. The [archive](../../../openspec/changes/archive/2026-11-21-booyah-20-f02-order-intake-uc05-uc08/tasks.md) retains metadata and all 21 checked tasks. The UC report and prototype README now distinguish the evidenced final PR approval from unavailable detailed confirmations. The matching PDF is regenerated; original PNGs and prototype logic are unchanged.

The official PA3 handout and ignored original kit are unavailable locally. No new direct handout comparison, independent acceptance of this metadata update, full production equivalence, deployment or database action is claimed. No commit, push, merge or external message was performed.
