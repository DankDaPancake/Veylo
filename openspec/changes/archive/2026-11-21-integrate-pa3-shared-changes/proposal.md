## Why

PA3 requires one Changes.md shared by Sections A and B, but the repository currently holds separate handoff fragments and lacks the original BOOYAH-26 change record in the integrated ledger. A single source with a matching PDF must retain all three contributors' change coverage and their distinct evidence/review status.

## What Changes

- Create `docs/Changes.md` and matching `docs/Changes.pdf` with `A. Project Plan` and `B. Vision Document` sections.
- Integrate BOOYAH-23 A01–A16, the BOOYAH-26 source change record and BOOYAH-27 B01–B05, preserving source references and reconciling overlapping entries without losing distinct changes.
- Give each integrated entry old content/location, revised content, reason/source and a resolvable revised location; retain draft and pending decision labels.
- Link the canonical ledger from the documentation index and existing fragments, clearly retaining the fragments as provenance rather than competing final ledgers.
- **In scope:** the shared A/B ledger, its PDF, fragment/index pointers and focused source/coverage/export checks.
- **Out of scope:** rewriting or finalizing Project Plan/Vision/UseCaseModel, publishing their missing PDFs, changing requirements/NFR targets, diagram or F03 polish, full ZIP/GitLog/video, external publication and new human approval claims.

## Capabilities

### New Capabilities

- `pa3-shared-changes`: one traceable, attributed and consistently exported A/B change ledger assembled from the three identified owner sources.

### Modified Capabilities

None. The existing `project-plan-revision` capability keeps BOOYAH-23's bounded handoff contract; this change performs the BOOYAH-29 ledger integration without revising the plan.

## Impact

Adds the canonical Markdown/PDF pair and a small integration/check record; updates only `docs/README.md` and pointers in the two source fragments. Reuses the existing Markdown/PDF exporter. BOOYAH-29 ownership remains Phạm Công Khánh with Thái Kiệt as designated reviewer; ledger assembly does not certify their review, other BOOYAH-29 acceptance criteria or final submission readiness.
