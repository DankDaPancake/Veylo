# Tasks

Follow [design.md](design.md) for exact output paths, screen IDs and commands, and the [delta spec](specs/order-intake-prototype/spec.md) for expected behavior. Complete machine-verifiable work before reviewer handoff. Use the decision register and the PR #16 corrections. Preserve pending review gates.

## 1. Prepare the working copy and fixture contract

- [x] 1.1 **Trần Lê Hải · 1 h** — Create the repository-bound standalone gallery under `docs/analysis-and-design/use-cases/prototypes/order-intake/` from Công Khánh's original kit. Copy the approved source inputs with provenance, keep the source drafts read-only and initialize the screen manifest. Verify the gallery opens in light mode and the inherited desktop shell and local fonts load at both target viewports.
- [x] 1.2 **Trần Lê Hải · 1.5 h** — Generate `orders-template.csv`, `orders-valid.csv` and `orders-invalid.csv` in `docs/analysis-and-design/use-cases/fixtures/order-intake/` and implement their checks in `verify.mjs`. Verify required and optional header rules, UTF-8 with/without BOM, quoted commas, 20 valid records and all seven simulated preview diagnostics using a known same-hub fixture. Verify the proposed limits at 500/501 records and 1,000,000/1,000,001 bytes, required header and template recovery. Keep checks local and synthetic.
- [x] 1.3 **Trần Lê Hải · 1 h** — Add the D-F02-1–8 decision log and FR/SRC traceability skeleton to `UC-F02-Orders.md`. Verify every rule has its source, example, status and review authority, and every FR-02-1–5 plus FR-01-2 has the correct UC coverage.

## 2. Write the use cases and build their visible states

- [x] 2.1 **Trần Lê Hải · 1.5 h** — Write and build UC05 creation, field errors and duplicate-code states. Verify linked transitions to the created NEW detail and back to correction or the list without creating a second order. Verify required fields, retained inputs, inline and summary feedback, and AC1 structure.
- [x] 2.2 **Trần Lê Hải · 1.5 h** — Write and build UC06 file picker, template download, preview, confirmation, success and cancellation paths. Verify the downloadable filename/content, 20 confirmed and 0 when exiting confirmation, with each state referenced by the relevant UC06 step.
- [x] 2.3 **Trần Lê Hải · 2 h** — Add UC06 file-level and record-level alternatives including the confirmation-time conflict. Verify visible recovery for wrong type, empty/header, format and both size/count limits, plus record/column feedback for field errors and both kinds of duplicates. Verify the 0-order outcome, exact branch links and recovery paths.
- [x] 2.4 **Trần Lê Hải · 2 h** — Write and build UC07 list, filtered results, page two, detail, empty hub, no matches and invalid filter states. Verify sort tie-break, reset to page one, clear-filter recovery and correct detail links against synthetic orders. Check AC1 flow structure and screen traceability.
- [x] 2.5 **Trần Lê Hải · 1.5 h** — Write and build UC08 detail, edit, update success, cancel with reason, unchanged detail on dismissal and cancelled detail. Verify the NEW edit and NEW → CANCELLED examples, retained code/hub and exact confirmation steps.
- [x] 2.6 **Trần Lê Hải · 1.5 h** — Add UC08 blocked status, invalid edit/reason, stale change and already-cancelled states. Verify that every alternative points back to its trigger, shows the correct feedback and offers appropriate recovery without overwriting the current simulated record.
- [x] 2.7 **Trần Lê Hải · 1 h** — Add the shared denied and expired-session states and map them to entry and submit steps of all four UCs. Verify out-of-hub resources and denied roles have distinct 404 and 403 screens with safe exits, and session 401 offers Sign In and does not replay a mutation. Check keyboard focus for shared recovery actions.

## 3. Export, verify and package for review

- [x] 3.1 **Trần Lê Hải · 1.5 h** — Lock and install prototype-local Playwright, add `export.mjs --png` and document reproduction. Verify fresh light captures for the complete manifest at 1440×900 CSS pixels and 2× raster scale, with screenshot file names equal to their screen IDs. Store them in `prototypes/UC05/` through `UC08/`.
- [x] 3.2 **Trần Lê Hải · 1.5 h** — Run the light browser checks at 1440×900 and 1280×720. Verify no horizontal overflow or unexpected browser errors, access to primary controls, correct keyboard focus and visible feedback. Visually inspect representative screens and file/row error variants, recording actual results and browser version.
- [x] 3.3 **Trần Lê Hải · 2 h** — Complete Section D traceability and embed every required frame beside its UC flows, with shared states referenced explicitly. Verify every FR → UC → step/branch → state → PNG path, full AC1 coverage and actual role attribution per heading. Export with `export.mjs --pdf`, then verify A4, text, local image/link resolution and page readability.
- [x] 3.4 **Trần Lê Hải · 1 h** — Compare CSV and runtime-facing behaviors with available authorized BOOYAH-13 and BOOYAH-19 evidence. Verify the Section D handoff gives source/revision and a disposition per contract field, boundary and outcome, with any unavailable spec/code parity shown as unverified.
- [x] 3.5 **Trần Lê Hải · 1 h** — Finish the reviewer checklist and local handoff in `UC-F02-Orders.md`. Verify it covers AC1–AC5, every flow and variant, D-F02 decision owners, available parity evidence and limitations. Run `verify.mjs`, relative-link, UTF-8, whitespace and scoped-change checks including untracked deliverables. Append actual checks/results to the indexed PA3 AI log and link it for PA3-T18.

## 4. PR and human review

- [x] 4.1 **Trần Lê Hải · 0.5 h** — After 3.5 and in an authorized publication turn, open the task PR into `dev` for Phạm Công Khánh and the team. Verify it links the ticket, files, commit, checked artifacts, AI log, parity gaps and unresolved rules, with AC3–AC5 identified as pending where evidence is missing.
- [ ] 4.2 **Phạm Công Khánh · 1.5 h** — Walk the main and alternative screens and check implementability against the Section D specification. Verify AC2/AC5 through dated human review evidence listing the scenarios walked, discrepancies and acceptance or requested changes.
- [ ] 4.3 **Trần Lê Hải · 1 h** — Record actual D-F02 decisions coordinated with Kiệt and the team. Verify each of the eight values carries recorded source, decision owner/date and outcome, and keep AC3 open until all required decisions are confirmed.
- [ ] 4.4 **Trần Lê Hải · 1 h** — Record the reviewer recheck of actual BOOYAH-13 spec and BOOYAH-19 validated behavior as evidence becomes available. Verify AC4 against the same CSV, columns, validation and expected outcomes, and retain any unverified entries as open.
- [ ] 4.5 **Trần Lê Hải · 2 h** — Incorporate recorded review findings, regenerate affected screenshots and A4 PDF, rerun the relevant checks and update the handoff. Verify current artifact revisions have the required independent approval and checks before claiming acceptance. Keep review-dependent boxes open while evidence is absent.

## 5. Review correction evidence

- [x] 5.1 **Trần Lê Hải · 2 h** — Correct the six findings from PR #16 and verify the isolated Section E contract checks, simulated browser flows, light-only PNGs and regenerated PDF. Retain 4.2–4.5 pending reviewer and integration evidence.
