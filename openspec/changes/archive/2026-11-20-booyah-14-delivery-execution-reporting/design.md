# Design

## Context

See [proposal.md](proposal.md) for scope and sources. Section D needs a walkthrough that spans rider and dispatcher screens and uses the same attempt history for resolution and reporting. This design expresses user-visible state through synthetic examples in Khánh's shared prototype kit. The [delivery](specs/delivery-execution/spec.md) and [reporting](specs/shift-rider-reporting/spec.md) delta specs define the scenarios and screen references.

## Goals / Non-Goals

**Goals:** Make the rider loop, failed-order decisions, and report arithmetic reviewable. Make each loss of access, invalid action, or uncertain submission visible and give the reviewer an explicit recovery path. Keep each rule traceable to its affected screens, report definitions and upstream contracts.

**Non-Goals:** Data model or migration design, endpoint design, real uploads and storage, live security controls, background processing, deployment and production application changes. All effects, including access and upload states, are simulated.

## Decisions

### Two lifecycles and one end-to-end walkthrough

An **Order** is the delivery request and its overall business outcome. A **DeliveryAttempt** is one execution record identified separately and linked to the Order, with the executing rider and shift, timestamps and outcome. An **Assignment** identifies the rider's work in a published Shift. Opening a stop does not create an attempt. Preserve each attempt's original rider and shift when an order is re-dispatched.

```text
UC11 published work --> UC12 start, arrive, record result
       ^                    |
       +-- next eligible ---+-- Successful --> delivered Order
           stop or no work  |
                             +-- Failed --> Order awaiting decision
                                                 |
                                                 v
                                             UC13 resolve
                                   re-dispatch /           \ close
                                   handoff request          delivery outcome
                                        :
                                   Future F03 integration
                                        :
                                   UC11 new assignment

UC19 reports from scoped shift, assignment, Order and attempt events.
```

Show the successful order bypassing the failed-order decision and the rider continuing after either outcome. Visualize one history with multiple attempts rather than overwriting the last result. This makes the audit trail and the distinct report denominators visible in a single review.

### Integration boundaries

| Owner | Boundary used by this change |
| --- | --- |
| F02 / BOOYAH-20 and BOOYAH-13 | Use the existing Order identity and scoped access expectations. The current PA3 F02 contract recognizes `NEW` and `CANCELLED`, restricts edits and cancellation to `NEW` and requires the current version. UC13 step 4T records a terminal F04/F08 outcome and preserves the Order and attempt history without changing status, cancelling or deleting the Order. Any F02 post-attempt edit or cancellation restrictions require separately approved integration. |
| F03 / BOOYAH-21 | Consume the published assignment and sequence, with active-attempt locks and revalidation when the assignment changes. F03 intake for a new shift currently selects eligible same-hub unassigned `NEW` orders. UC13 step 4R records an F04/F08 re-dispatch request and preserves existing attempts and assignments. Failed-order readmission, the handling of the prior placement and publication of the new allocation require a separately approved F03 integration contract. Candidate shifts in the retained prototype illustrate a hypothetical downstream handoff. |
| UC14 / BOOYAH-21 | UC11 automatically shows a returned suggestion. EP11-A is the rider's optional selection of the explanation. Ranking and missing-signal fallbacks remain owned by UC14. The local model's request wording needs reconciliation with current Jira. |
| UC15 / BOOYAH-15 | At a selected stop UC11 automatically previews an available published same-hub guide. EP11-B opens the full guide on selection. The guide is independent of the suggestion and uses UC15 publication and access policy. A preview exposes no draft, recipient data, access code or POD. |

### Final business rules for F04/F08

The requester reported team agreement on P01–P06 for the BOOYAH-14 documentation and synthetic scenarios. This agreement covers the UC13 boundaries above.

| ID | Draft rule | Rationale and alternative |
| --- | --- | --- |
| P01 | One active attempt per Order. Start and Arrived are milestones. A terminal attempt can be Successful, Failed or Aborted. Confirm success with accepted photo evidence and show the Order as delivered. Failed leaves the Order awaiting dispatcher action. Delivered is an F04/F08 operational outcome. | Separate workflow events prevent history loss and premature terminal failure. Parallel active attempts would require conflict rules across riders and shifts. |
| P02 | Failure choices: recipient unreachable, recipient refused, address incorrect or not found, unsafe access, Other. Show a comment field, required for Other and any permitted pre-arrival failure. Address and unsafe access reasons can be submitted after Start without Arrived and retain a visible missing-arrival marker. Closing a form preserves activity. Explicit abort preserves an Aborted record and reopens the eligible stop if still assigned. | Standard reasons support reports and comments preserve field context. Requiring Arrived universally could force a false event when a location cannot safely be reached. |
| P03 | One readable JPEG or PNG, up to 5 MB, with preview, replace and retry. Show success only when the simulated photo and result are both accepted. | A single bounded photo keeps the synthetic walkthrough straightforward to review. Multiple photos or additional formats introduce policy and UI decisions. |
| P04 | Model one action result for repeated Start, Arrived, outcome or resolution. Distinguish unsent from unknown results after a network failure, then recover the current state. Recheck stale assignment or resolution at confirmation. A successful Start locks F03 reassignment, and a completed reassignment rejects the old Start. | Disabling the button helps with double tap but cannot account for a lost acknowledgement or another actor's change. |
| P05 | Three distinct Failed attempts maximum per Order. Exclude Aborted, active and duplicate attempts from the limit. The dispatcher can close earlier with a reason, and must explicitly confirm terminal closure when the limit is reached. A re-dispatch request preserves Order identity and attempt and assignment history. | This gives reviewers a concrete retry boundary without implying that the last Failed attempt automatically closes the Order. A reason-sensitive limit can be evaluated during review. |
| P06 | Use hub calendar dates with a half-open window. Scope order cohorts to the first valid Start and evaluate outcomes by cutoff. Scope final attempts to their outcome time and actual performing rider/shift. Report shift workload as a cutoff snapshot. Display formulas, units, exclusions, incomplete data and zero-denominator explanations. | This makes cross-shift retries visible and distinguishes cohort success from work performed. Outcome-date order counts are an alternative, with a different cohort and attribution story. See the reporting delta for exact definitions. |

### Decision Log and review

The [Decision Log](../../../../docs/analysis-and-design/use-cases/UC-F04-F08-Delivery-Reporting.md#decision-log) records each rule, rationale, examples and affected screens. The requester reported the team's approval and archive authorization in the task conversation. The original PR approval and merge are recorded separately. Neither an individual decision confirmer nor a date was supplied for the later team agreement. The F02/F03 integration work remains under its owning contracts.

### Prototype and evidence

The design source is Phạm Công Khánh's original BOOYAH-25 PrototypeKit at `docs/draft/3/Công Khánh - PA3 - ProtoypeKit-20261119T103921Z-1-001/Công Khánh - PA3 - ProtoypeKit/PrototypeKit/`. Use its `README.md` for conventions, `index.html` for component markup, `kit.css` and `tokens.css` for styling, local font assets for typography, and `export.mjs` for the standalone Chrome capture workflow. Keep the original `docs/draft` tree read-only and gitignored.

Use the [working copy](../../../../docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/README.md) as the editable source for this change. Reuse the kit's Light Glass styling, role shells, rider stop cards, touch actions, dispatcher tables and KPI cards, badges, field errors, banners, and empty and permission states. Add the new confirmation, POD and report states using the same components and visual conventions. Use 360×800 for rider, 1440×900 for dispatcher, and check dispatcher layouts at 1280×720. Use fresh synthetic data and frames. Keep rejected BOOYAH-14 specifications, PNGs, fixtures, business rules, PR #14 and historical commits outside the source set.

The adapted exporter lists the planned base screens and variants for UC11, UC12, UC13 and UC19. During Apply, use the manifest to register each frame in the working copy and keep a register of FR → UC → step or branch → screen ID and variant → PNG path. The exporter checks each frame before capture so a missing variant cannot silently export a shared-kit example.

Follow the working copy README to prepare Playwright Chromium locally. From the repository root, list the manifest, check the browser, capture and inspect the sample, then capture the batch:

```sh
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs --list
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs --check-browser
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs --sample
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs
```

PNG capture requires Node.js 22 and Playwright Chromium with its sandbox enabled. Capture the Light Glass theme at the manifest pixel dimensions to `docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/UC{11,12,13,19}/S<UC>-<nn>-<state>.png`. Embed images beside the relevant flow with relative links in `docs/analysis-and-design/use-cases/UC-F04-F08-Delivery-Reporting.md`. Generate the matching review PDF from that Markdown and inspect every image for legibility and cropping. Regenerate the PDF after recording the PR decisions.

At handoff, run `git check-ignore --no-index` on the complete output list and expect no matches. Verify the Markdown, prototype source, PNGs and final PDF with `git ls-files --error-unmatch` and reconcile the list with the PR diff.

### Traceability index

The delta scenario titles carry the detailed UC flow and screen references. During Apply, expand the index below into one row per main step or alternative branch and capture distinct screen variants when their observable outcomes differ.

| FR or Jira hook | UC and flows | Planned screen IDs |
| --- | --- | --- |
| FR-03-3, FR-04-1, EP11-A/B | UC11 Main 1–4, A1–A8 | S11-01–S11-07 |
| FR-04-2, FR-04-5 | UC12 Main 1–2, A1–A3, A9–A11 | S12-01–S12-03, S12-05, S12-08, S12-10–S12-11 |
| FR-04-3 | UC12 Main 3S–4, A4–A5, A9–A11 | S12-04, S12-06, S12-09–S12-11 |
| FR-04-4, FR-04-5, AC3 | UC12 Main 3F–5, A6–A7, A9–A11 | S12-05–S12-07, S12-10–S12-11, S11-01, S11-07 |
| FR-04-5, FR-04-6, FR-08-1 | UC13 Main 1–4R/4T, A1–A8 | S13-01–S13-10 |

| FR or Jira hook | UC and flows | Planned screen IDs |
| --- | --- | --- |
| FR-08-1 | UC19 Main 1–3, A1–A5 | S19-01–S19-07 |
| FR-04-5, FR-08-2, AC4 | UC19 Main 2, A3–A4, A7 | S19-02, S19-05, S19-06, S19-08 |
| FR-08-3, AC4 | UC19 Main 3, A6–A9 | S19-02, S19-06, S19-08 |

## Risks / Trade-offs

- Source edition mismatch → Reconcile the newer review documents named in Jira if accessible. Track any unresolved mismatch explicitly in the PR handoff.
- A retry crosses shifts, riders or a date boundary → Show a synthetic counterexample with order cohort and attempt attribution side by side. Include start/end boundary and invalid event examples.
- Approval attribution → Record the requester-reported agreement and the original PR review separately. F02/F03 interface or persistence behavior requires its own approval.
- Similar outcomes hide different recovery paths → Use distinguishable state variants where invalid input, unsent action, unknown result, or stale data need different next steps.

## Migration Plan

The outputs are documents and synthetic prototype evidence. There is no deployment or migration step.
