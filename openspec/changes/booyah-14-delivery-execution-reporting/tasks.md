# Tasks

Trần Lê Hải is the BOOYAH-14 assignee and Nguyễn Thành Trung is the named reviewer in Jira. Estimates below describe task size. Review and confirmation are separate from drafting, and all checkboxes start open. See the [design](design.md), [delivery spec](specs/delivery-execution/spec.md), and [reporting spec](specs/shift-rider-reporting/spec.md).

## 1. Sources and rule draft

- [X]  1.1 **Trần Lê Hải · 1 h.** Reconcile Vision FR-04/08, the UC model and glossary, the F02/F03 contracts, and the UC14/UC15 handoffs. Verify the traceability list and record edition differences or unavailable sources, including the EP11-A wording difference.
- [X]  1.2 **Trần Lê Hải · 1 h.** Draft P01–P06 and their Decision Log entries, including F02 edit/cancel and F03 re-dispatch questions. Verify every entry includes rationale, examples and affected branches with **Proposed / Pending PR Review** and no invented approval.

## 2. Use-case specification and screen register

- [X]  2.1 **Trần Lê Hải · 1 h.** Draft UC11 in English. Verify D's required sections and trace published, unpublished, no shift, denied, stale stop, and independent recommendation/guide states to named branches and screens.
- [X]  2.2 **Trần Lê Hải · 2 h.** Draft UC12 in English. Verify timestamps, photo success, failed reason/comments, abort, double tap, network loss, stale assignment and next-stop continuation all have numbered branch points, observable outcomes and screen IDs.
- [X]  2.3 **Trần Lê Hải · 1.5 h.** Draft UC13 in English. Verify shift monitoring, attempt history, re-dispatch, terminal confirmation, retry limit, no eligible destination, concurrent or uncertain resolution, and successful-order bypass.
- [X]  2.4 **Trần Lê Hải · 1.5 h.** Draft UC19 in English. Verify each metric's formula, unit, event and inclusion rules and map filter, empty, incomplete, invalid timing, missing reason, tie and zero-denominator branches.
- [X]  2.5 **Trần Lê Hải · 1 h.** Consolidate the four UCs in `UC-F04-F08-Delivery-Reporting.md` with actual attribution under each required section heading. Verify every main step and alternative has a branch/resume or end point, postcondition, and a FR → UC → flow → screen/state reference. Record planned PNG names and pending attribution honestly.

## 3. Prototype and numerical checks

Edit `docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/index.html` and its adjacent sources. The [working copy README](../../../docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/README.md) records the original BOOYAH-25 kit under `docs/draft/3`, exact exporter commands, prerequisites and output paths. Keep `docs/draft` read-only and ignored. The exporter list provides the keys to register for each frame.

- [X]  3.1 **Trần Lê Hải · 1.5 h.** Register UC11 screen keys S11-01 through S11-07 and their variants in the working copy using the kit's rider shell, stop cards and touch controls at 360×800. Walk published work, empty and denied states, independent recommendation/guide combinations, and both extension points with fresh synthetic data.
- [X]  3.2 **Trần Lê Hải · 2 h.** Register UC12 screen keys S12-01 through S12-11 and their variants in the same working copy at 360×800. Reuse rider and field components. Walk success, failure, photo validation/retry, abort, double tap, network loss, stale work, and the repeat-until-empty loop.
- [X]  3.3 **Trần Lê Hải · 2 h.** Register UC13 screen keys S13-01 through S13-10 and their variants using the kit's dispatcher shell, tables and badges at 1440×900. Walk both resolutions and blocked/uncertain states, inspect attempt history, and verify the minimum layout at 1280×720.
- [X]  3.4 **Trần Lê Hải · 2 h.** Register UC19 screen keys S19-01 through S19-08 and their variants using the kit's dispatcher shell and KPI cards. Verify formulas and scope labels at 1440×900 and 1280×720, including no data, filtered results, incomplete activity and data quality states.
- [X]  3.5 **Trần Lê Hải · 1.5 h.** Independently calculate expected metrics from fresh synthetic examples before comparing the UC19 results and metric definitions variants. Verify order success 1/2 and attempt success 1/3, order closure, progress, cross-shift/rider and window boundaries, excluded durations, ties and missing causes. Record inputs, expected outputs and observed results.
- [X]  3.6 **Trần Lê Hải · 2 h.** From the repo root, run `node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs --list` and `node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs --check-browser`. After all frames are ready, run the same command without the flag to capture `UC{11,12,13,19}/S<UC>-<nn>-<state>.png` in the working copy. Report a missing browser as a blocker. Embed the verified fresh PNGs in `docs/analysis-and-design/use-cases/UC-F04-F08-Delivery-Reporting.md` and check unique names, working relative links, and complete flow/state coverage.

## 4. Acceptance evidence and handoff

- [X]  4.1 **Trần Lê Hải · 1.5 h.** Check Jira AC1–AC5 and PA3 Section D against the integrated draft. Record AC1 field completeness, AC2 branch/image mapping, AC3 rider-to-dispatcher walkthrough and AC4 formula evidence. Record AC5 as pending while any scope-affecting decision awaits PR review.
- [X]  4.2 **Trần Lê Hải · 1 h.** Prepare `docs/analysis-and-design/use-cases/UC-F04-F08-Delivery-Reporting.pdf` from the matching Markdown and prepare the PR review handoff with traceability, actual checks, decisions and limitations. Inspect every PNG and any Mermaid diagram in the PDF. Check the Markdown, prototype source, PNGs, and PDF with `git check-ignore --no-index` and `git ls-files --error-unmatch`, then confirm inclusion in the PR file list at handoff. Append and read back the AI log and verify its index link.
- [X]  4.3 **Trần Lê Hải · 2 h.** After PR review evidence is available, incorporate decisions and any reviewer feedback. Verify decision rationale, confirmer/date and evidence are recorded for each scope-affecting rule, impacted flow/screens/metrics agree, and regenerate and inspect the final PDF. Record actual reviewer evidence before claiming final AC5 acceptance.
