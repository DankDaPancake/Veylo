## Context

See [proposal.md](proposal.md) and [the ledger contract](specs/pa3-shared-changes/spec.md). A short design is needed to combine three sources with overlapping entries, different review provenance and a noncanonical Vision target. This is the bounded A/B ledger portion of BOOYAH-29, not its whole packaging task.

## Goals / Non-Goals

**Goals:** one clearly discoverable shared ledger, complete source-to-entry coverage and a readable matching export without changing the documents being described.

**Non-Goals:** settle product decisions, refresh historical plan facts to today's implementation, finalize the Vision, publish the use-case model or other missing PDFs, assemble a ZIP, or claim a new peer review.

## Decisions

### One canonical pair; retain provenance fragments

Use `docs/Changes.md` and `docs/Changes.pdf`. This is a repository placement decision for the requested deliverable, not a new team policy. Keep both existing fragments at their current paths and add a clear canonical-ledger pointer; preserve their historical entries and review notes. Update `docs/README.md` to identify the pair. Do not create a root-level competing Changes file or rename/delete the source fragments merely to obtain a single final filename.

### Integrate all three sources with explicit coverage

| Input | Coverage to retain |
| --- | --- |
| `docs/management/pa3/ProjectPlan-Changes.md` | BOOYAH-23 A01–A16, baseline/revision identity, no-TA-feedback provenance and relayed review scope |
| [BOOYAH-26 Changes source](https://drive.google.com/file/d/1XEPEiGuyVp5pO64I4s3JhaNHUiyusWI0/view) | 32 FR/source clauses, retained 18 NFR thresholds/methods, contradictions, workflow/guide-access revisions, exclusions and pending owner decisions |
| `docs/requirements/pa3/Vision-Changes.md` | BOOYAH-27 B01–B05 positioning, alternatives, user environment and single-hub refinements |

During apply, retrieve BOOYAH-26 Markdown read-only, validate its content and record its hash/revision with local input hashes in `docs/test/pa3-shared-changes/README.md`. Keep a source-to-ledger mapping there, referencing source headings/bullets or IDs. No redundant raw source dump is required. Retain A01–A16 and B01–B05; give BOOYAH-26 rows a distinct `B26-xx` prefix where a separate entry is useful. If a BOOYAH-26 bullet overlaps B01/B02/B05, merge only equivalent content and map both source references to that row. Keep distinct chronological changes separate, and preserve conflicts as explicit findings rather than silently selecting a product decision.

Use columns for ID, old content/location, revised content, reason/source and revised location. Add source/revision qualifiers when source notes do not establish exact historical wording; never invent a baseline quote to fill a cell. Link Section A to the current repository plan and Section B to the actual `Vision-Integration-Candidate.md` headings or identified external source revision, explicitly retaining candidate status. A nonexistent `VisionDocument.md` must not become an assumed destination. Unchanged thresholds, pending policies and source-specific review notes remain clear.

### Reuse the existing exporter and verify the complete output

Use `docs/management/pa3/export-pdf.py` with the available MarkdownIt/WeasyPrint environment to export `docs/Changes.md` to its sibling PDF. Its existing table and page styles suffice as the first approach; this ledger introduces no Mermaid diagram or new export framework. Inspect every PDF page for row/text clipping and readability, and compare extracted text to both sections and all entry IDs. Verify local targets/anchors, UTF-8/newlines and immediate attribution. Leave one minimal assert-based source-coverage/link check under `docs/test/pa3-shared-changes/`; no test dependency or application build is needed.

Record an AI consistency sample of five integrated entries against their compared sources/documents. Keep it distinct from the designated human reviewer sample required by BOOYAH-29; no human acceptance box is completed without actual evidence. Attribute integration edits separately from original performers and recorded source reviews.

## Risks / Trade-offs

- The Vision fragment alone omits BOOYAH-26 FR/NFR changes → require a mapping for every relevant original source bullet and every A/B fragment ID.
- Overlapping removals appear in both Vision sources → deduplicate with dual provenance, preserving distinct revisions and reasons.
- A historical plan entry can differ from current runtime → compare the cited revision, do not rewrite plan/application state as packaging work.
- A candidate Vision is not a finalized submission → identify the compared revision and limit this task to ledger integration; no canonicalization is hidden here.
- F01 import may edit the same documentation index → integrate index pointers sequentially, keeping the two change outputs independent.

## Migration Plan

Add the shared pair and provenance/check record; update only fragment/index pointers. Rollback is a normal revert of those outputs and pointers. No application/data migration, source-document rewrite, external publication or full submission package is part of this change.
