## Purpose

Provide one source-traceable PA3 change ledger for the Project Plan and Vision Document, with a matching readable PDF and clear separation of source history from acceptance claims.

## ADDED Requirements

### Requirement: Single shared A and B ledger

The repository SHALL provide one canonical `docs/Changes.md` with separate `A. Project Plan` and `B. Vision Document` sections and a matching `docs/Changes.pdf`. The documentation index and source handoff fragments SHALL point to this canonical pair; retained fragments SHALL be identified as provenance rather than additional final submission ledgers.

#### Scenario: Locate changes for either revised document

- **WHEN** a reader follows the documentation index or either existing A/B handoff fragment
- **THEN** the canonical shared ledger is identifiable and contains both revised-document sections without requiring assembly from separate final files

### Requirement: Complete integration of the three owner sources

The ledger SHALL account for BOOYAH-23 A01–A16, the BOOYAH-26 original Vision change record and BOOYAH-27 B01–B05. Each integrated change SHALL identify old content/location, revised content, reason/source and revised location. Overlapping entries MAY be combined only when their source identities and distinct decisions remain traceable; unresolved contradictions SHALL remain identified rather than silently settled.

#### Scenario: Trace original and overlapping entries

- **WHEN** an original entry is integrated or combined with an overlapping change
- **THEN** a source-to-ledger mapping identifies where every source change is represented
- **AND** distinct FR/NFR, workflow, scope and positioning changes are preserved rather than omitted because they share a topic

#### Scenario: Inspect a revised location

- **WHEN** a reviewer follows an integrated entry's revised location
- **THEN** the link or explicit section reference identifies the actual compared document and revision
- **AND** references do not require an unavailable local workstation path or claim a nonexistent canonical Vision file

### Requirement: Matching export and attribution

The shared ledger SHALL be English UTF-8 Markdown with actual performer/reviewer/editor information immediately after report section headings. Its PDF SHALL be generated from the same submitted ledger revision and retain all entries in readable form with working references and no clipped rows or text.

#### Scenario: Verify the ledger pair

- **WHEN** the ledger is exported for review
- **THEN** both sections, every integrated entry and attribution are present in the PDF, and page-by-page inspection confirms readable tables/text and links

### Requirement: Preserve source decisions and acceptance boundaries

Integration SHALL preserve baseline/revision identities, no-feedback provenance, unchanged NFR thresholds and existing pending decision/review labels. It SHALL distinguish recorded or relayed source reviews from a new review of the integrated ledger. This deliverable SHALL NOT claim completion of the remaining BOOYAH-29 packaging, PDF or video work, or modify product requirements to remove discrepancies.

#### Scenario: Sources have different review status

- **WHEN** a source contains recorded Section A review while a Vision source retains pending peer acceptance
- **THEN** the ledger preserves those distinct statuses and does not transfer approval between sources
- **AND** reviewer sampling of five entries remains unclaimed until it actually occurs
