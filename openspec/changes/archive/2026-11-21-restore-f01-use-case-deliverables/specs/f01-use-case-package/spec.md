## Purpose

Make the existing F01 Section D specification and original screen evidence available from the repository while preserving source behavior, attribution and unresolved policy boundaries.

## ADDED Requirements

### Requirement: Repository-complete original F01 package

The repository SHALL contain the BOOYAH-22 UC01–UC04 Markdown specification, its matching PDF and all 18 original prototype PNGs at the relative paths referenced by the Markdown. The user-authorized supplementary UC02 deactivation-result screen S02-06 SHALL be identified separately as AI-created evidence with human review pending; all 18 original PNGs SHALL remain unchanged. The package SHALL identify its supplied source and remain usable without access to an author's ignored local directory.

#### Scenario: Read the restored F01 documents

- **WHEN** a reader opens the F01 package from the documentation index
- **THEN** the Markdown and PDF are available in the repository, and all referenced UC01–UC04 PNGs resolve locally with their original screen IDs
- **AND** imported source files and any later editorial revisions have distinguishable provenance

### Requirement: Complete use-case and screen traceability

Each of UC01 Sign In, UC02 Manage User Accounts, UC03 Configure Hub and UC04 View Audit Log SHALL identify its name/ID, actors, description, preconditions, numbered basic flow, alternative flows with branch-from steps, postconditions and special requirements. Every visible basic/alternative flow state SHALL map to an embedded screenshot or an explicit reusable screen reference. Source omissions SHALL be reported rather than hidden by screen-count totals.

#### Scenario: Inspect a basic or alternative flow

- **WHEN** a reviewer follows any UC01–UC04 step or alternative branch
- **THEN** the specification identifies the relevant action/result, branch point where applicable and available screen evidence
- **AND** the four UCs collectively reference the 18 original images and supplementary S02-06 without broken paths or missing required states

### Requirement: Matching readable Markdown and PDF evidence

The F01 PDF SHALL match the submitted Markdown's content and screen evidence. Every embedded screen SHALL be readable, correctly identified and uncropped. A material Markdown correction SHALL require a corresponding PDF update and renewed content/image verification.

#### Scenario: Restore an unchanged source pair

- **WHEN** the supplied Markdown and PDF are retained without content changes
- **THEN** source identity and content/image checks establish the retained pair, and all 18 images are verified in the PDF and original PNG set

#### Scenario: Repair a specification presentation gap

- **WHEN** editorial corrections change the submitted Markdown or image placement
- **THEN** the PDF is regenerated from that revised Markdown and checked for corresponding text, all screen evidence, page readability and valid links

### Requirement: Honest scope and review attribution

The restored package SHALL preserve the three-role and single-operating-hub boundaries and existing pending account, hub and audit-policy decisions. It SHALL distinguish broader F01 prototype/specification behavior from implemented PA3 minimum sign-in/F02 access. Attribution SHALL identify actual work and source-review provenance; importing a reviewed source SHALL NOT claim independent approval of new edits or constitute authorization for application or database implementation.

#### Scenario: Import a source containing pending decisions

- **WHEN** the source records pending account policy, hub configuration breadth or unavailable detailed review findings
- **THEN** those limits remain explicit in the restored package, and no decision, reviewer result or production capability is invented to mark the package accepted
