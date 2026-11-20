## Context

[BOOYAH-21's use-case spec](../../../../docs/analysis-and-design/use-cases/UC-F03-F05-Shifts.md) demonstrates numbered flow tables, embedded PNGs and screen IDs. The local prototype source and Chromium exporter are specific to BOOYAH-21. The repository app provides only the foundation for this scope. The course rubric, Jira description, [Use-Case Model 0.4](https://drive.google.com/file/d/1G-GlRLTj7ZsOw_g9o-bYTu_MLQ4AYEfi/view) and the [Vision 2.2-review source](https://drive.google.com/file/d/1vC5KwBkyKqXwPbQVq8lEtUQZlhlkWkXU/view) provide the evidence baseline. The requester selected the repository prototype kit and Vision 2.2-review on 19 November 2026 as the BOOYAH-15 acceptance baseline.

The [BOOYAH-14 walkthrough on dev at 21a5688](https://github.com/DankDaPancake/Veylo/tree/21a5688/docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting) uses the local kit and script-defined screen IDs. Its guide control currently expands an inline UC15 illustration. Its guide fixture is Atrium A, order `DEMO-201`, shift `D-110`, rider `R-17`, with guidance to use the marked visitor entrance and follow signs to reception. The team selected the repository-native walkthrough for the BOOYAH-15 integration.

## Goals / Non-Goals

**Goals:** Use the same synthetic location and guide versions across both rider entry points and the dispatcher story. Make permission, concurrency and fallback outcomes inspectable in the walkthrough.

**Non-Goals:** Runtime state management, provider selection, production authorization, benchmark results and shared kit migration.

## Decisions

- Reuse the [repository prototype kit](../../../../docs/analysis-and-design/use-cases/prototypes/kit/index.html) in Rider 360 x 800 and Dispatcher 1440 x 900 frames. Use its shared styling and export pattern for the BOOYAH-15 screen set. Export `prototypes/UCxx/Sxx-nn-state.png` and embed each image beside its UC.
- Build the link on a branch that includes the updated dev walkthrough. Replace the inline EP11-B illustration in BOOYAH-14 with a relative link from `S11-02-stop-details` and `S11-02-guide-only` to `guide-screens.html?screen=S15-02`. Pass the originating UC11 screen ID and map only those supported IDs to local return destinations. `S15-01` still opens the same guide with Back to search. Verify the delivery actions in `S11-02-guide-unavailable` and `S11-02-neither-context`.
- Align UC15–UC18 with the Atrium A location and guide content. Keep order, shift and rider identifiers in assigned-stop context only. Use v2 and v3 as BOOYAH-15 walkthrough labels for supersession. Keep a second hub solely for isolation checks. Exercise published, rejected, unpublished, missing and superseded fixtures across search, preview and direct links as applicable. Update the review packet's screen mapping and regenerate the affected PNG and PDF evidence.
- UC16 validates the trimmed note at 1 to 500 characters and preserves the remaining text. Double-tap or retry of the same submission shows one saved note, even when confirmation is lost. A new submission can use identical text. Show saved state before asynchronous preparation in UC18. No shared persistence is needed for the prototype.
- Use scripted UC18 states for queued or processing, structured draft with uncertainty, timeout, invalid JSON, quota and mock, manual drafting, source comparison, regeneration, explicit approval or rejection and conflicts. Publish only after dispatcher approval. A stale review preserves raw note and in-progress edits, blocks publication and asks the dispatcher to reload and compare. A superseded direct link resolves to the eligible current publication, shows an update notice and falls back to unavailable when none remains.
- Record the screen, note-limit, retry, superseded-link and stale-review decisions in the deliverable as draft BOOYAH-15 decisions. Confirm them in independent review before using them as runtime acceptance criteria.
- N12 timeout of 20 seconds and the N08 manual path within 10 seconds of failure are the design targets from the ticket and Vision 2.2-review. N09 and N10 guide source fidelity and uncertainty states. N13 guides the authorization walkthrough. Real latency, reliability, AI quality and authorization benchmarks belong to the later runtime milestones defined in Vision.

## Risks / Trade-offs

- Inconsistent UC11 and UC15 fixtures can hide cross-hub or unpublished-guide exposure -> coordinate the same synthetic case and record the walkthrough from both entry points.
- Shared kit divergence can cause duplicated screens or unreadable PDF exports -> confirm the kit revision and check every embedded screen at actual output size.
- Mock output can be mistaken for product verification -> label mock states and separate prototype evidence from later application measurements.
- Lost confirmation or competing reviews can obscure the authoritative state -> include both cases in the reviewer walkthrough with explicit expected outcomes.
