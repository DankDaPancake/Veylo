## Purpose

Define the observable document outputs, evidence quality and review handoff required by BOOYAH-23. This contract covers Project Plan revision and its Section A Changes entries; it introduces no application functionality or product NFR thresholds.

## ADDED Requirements

### Requirement: DOC-FR-01 Versioned baseline and traceable changes

The revised Project Plan SHALL identify its v1.6 baseline and revision date, preserve the source section structure where applicable, and map each correction to a Section A Changes entry containing old section/content, revised content, reason/source and revised location. It MUST distinguish actual TA feedback from member-confirmed absence of feedback and internal-review changes.

Traceability: BOOYAH-23 AC1; Section A deliverable.

#### Scenario: No TA feedback was received
- **WHEN** the requesting member confirms full PA2 marks and no TA feedback
- **THEN** the revision records that confirmation as its source and lists internal-review/current-information changes without inventing TA comments

#### Scenario: A plan statement is revised
- **WHEN** a schedule, status, process, risk or scope-allocation passage changes from v1.6
- **THEN** its Changes entry locates both versions and records the reason/source so a reviewer can trace the change

### Requirement: DOC-FR-02 Current Sprint 3 schedule

The plan SHALL present the actual PA3 Jira tasks with keys, task scope, assignees, designated reviewers, due dates and observed statuses, and identify the observation time. It MUST be reconciled with Jira at review time, including the designated human reviewer's check of three randomly selected rows. It MUST distinguish a submission deadline from an unconfirmed sprint calendar and MUST NOT backdate completion or silently reschedule missed work.

Traceability: BOOYAH-23 AC2; scope sections 2.3, 4.2 and 4.3.

#### Scenario: Jira changes after the draft snapshot
- **WHEN** an assignment, due date or status differs at review time
- **THEN** the affected row is refreshed against Jira and the observation time is updated before schedule consistency is claimed

#### Scenario: Schedule acceptance is checked
- **WHEN** the designated reviewer checks three randomly selected Sprint 3 rows
- **THEN** each row matches the current task scope, assignee, reviewer, due date and status, and only the review actually performed is recorded

### Requirement: DOC-FR-03 Evidence-based status and build planning

The plan SHALL support claims of completed build, seed, test, setup or acceptance with identifiable repository/Jira evidence. Future work MUST be labelled planned and unknowns MUST remain explicit. A checked implementation task, merged PR, successful application health response or configuration file MUST NOT be represented as proof of independent human acceptance, DB readiness, completed business workflows or executed Docker setup.

The revision SHALL reconcile the baseline's Next.js 14 initialization, seed/Docker claims, branch naming, Scrum cadence and OpenSpec approval statements against current evidence, while keeping risk owners/team decisions distinct from proposals.

Traceability: BOOYAH-23 AC3; build/process/risk scope.

#### Scenario: A historical completed-state claim lacks evidence
- **WHEN** v1.6 says that seeds, fallback behavior, tests or Docker setup are complete but available evidence does not establish that result
- **THEN** the revision removes the unsupported completed-state claim or describes it as planned/unverified with the owning task, without inventing a successful run

#### Scenario: Foundation source exists but business models do not
- **WHEN** source inspection shows an application foundation and a datasource-only Prisma schema
- **THEN** the plan distinguishes implemented foundation from pending business schema, migrations, seed, sign-in and order workflows

#### Scenario: Tool approval and artifact location are reported
- **WHEN** the plan records the confirmed OpenSpec approval and root working layout
- **THEN** it preserves their recorded provenance and does not infer an instructor exception for submitted-artifact placement

### Requirement: DOC-FR-04 Vision consistency without scope ownership expansion

The plan SHALL keep the three roles, F01-F08, exclusions and later-sprint scope consistent with the identified Vision version used for final review. It MUST preserve order/attempt separation, raw-note/draft/published-guide boundaries, dispatcher publication control and deterministic recommendation scope. It SHALL distinguish minimum PA3 sign-in/authorization from later full F01 administration.

Draft factual corrections MUST be allowed before all related Vision tickets finish. Unresolved Vision/product/schedule decisions MUST be attributed to their owners and MUST NOT be silently resolved or treated as a passed final AC4 merely because a limitation was acknowledged.

Traceability: BOOYAH-23 AC4 and scope exclusion on role/product changes.

#### Scenario: Only a review-draft Vision is available
- **WHEN** BOOYAH-26/27 content is not yet confirmed for final consistency review
- **THEN** factual schedule/evidence corrections can proceed, the comparison version and unresolved points are explicit, and final AC4 remains unverified until an agreed consistent revision is available

#### Scenario: F05 checkpoints conflict across sources
- **WHEN** the Vision review draft assigns N02 measurement to PA4 while the inherited plan assigns F05 implementation to PA5
- **THEN** the discrepancy is surfaced for the owning team to reconcile, and no new allocation or weakened NFR is invented to mark consistency passed

### Requirement: DOC-FR-05 Bounded Section A handoff

BOOYAH-23 SHALL deliver the revised Project Plan and complete Section A Changes entries to BOOYAH-29 without replacing that ticket's ownership of the single shared ledger, PDF pipeline/export or final package. A temporary handoff fragment MUST be clearly labelled and MUST NOT be represented as a second final Changes.md. Its completeness MUST be rechecked after final consistency fixes.

Traceability: BOOYAH-23 AC1, deliverables and handoff; BOOYAH-29 ownership boundary.

#### Scenario: The shared ledger location is available
- **WHEN** BOOYAH-29 supplies the canonical Changes.md location
- **THEN** Section A entries are prepared for that location while other contributors' sections are preserved

#### Scenario: The shared ledger location is not yet agreed
- **WHEN** the plan revision needs a handoff before the canonical shared location is available
- **THEN** a labelled Section A fragment is supplied for BOOYAH-29 to integrate, without blocking all drafting or claiming final shared-ledger integration

### Requirement: DOC-NFR-01 Readability, attribution and document navigation

The plan and Section A handoff SHALL use English UTF-8 Markdown, preserve valid relative links and provide actual performer/reviewer/editor information immediately after report section headings. AI assistance MUST be identified factually, and unknown or unperformed human review/editing MUST remain pending. The documentation index SHALL make the revised plan discoverable. Required matching PDF export SHALL be identified in the BOOYAH-29 handoff, without claiming export already occurred.

Traceability: BOOYAH-23 common handoff; AC1/AC3; PA3 submission rules.

#### Scenario: A reader follows the revised documentation links
- **WHEN** the reader opens the plan from the documentation index or follows an internal Changes reference
- **THEN** the intended Markdown file/section exists and the link does not depend on the author's temporary workstation directory

#### Scenario: Human review has not occurred
- **WHEN** AI-assisted draft sections are prepared before Đăng's review
- **THEN** attribution identifies the actual assistance and pending human review/editing, without inheriting v1.6 sign-off as certification of v2

### Requirement: DOC-NFR-02 Application and team compatibility

The revision SHALL preserve application source, runtime interfaces, database structure, installed dependencies and existing application specifications. It MUST NOT change functional requirements, team roles, shared policies, resource assignments, provider/hosting choices or NFR targets to make the plan appear complete. Proposed new risk ownership and unconfirmed future dates MUST remain explicitly pending/proposed.

Traceability: BOOYAH-23 AC3/AC4 and explicit out-of-scope boundary.

#### Scenario: Only planning documentation needs correction
- **WHEN** the BOOYAH-23 deliverables are implemented
- **THEN** application/schema/dependency files remain unchanged, and no unrelated feature or team decision is encoded through document edits

### Requirement: DOC-NFR-03 Verification and acceptance integrity

Verification SHALL distinguish document-level unit checks, cross-document/source integration checks, recorded historical runtime results and actual human acceptance. Every BOOYAH-23 AC MUST have an identifiable verification result and evidence location. Unresolved blocking discrepancies MUST remain failed/unverified; no approval, test run, timestamp or task completion may be fabricated. Preparing artifacts MUST NOT automatically execute implementation, publish externally or mark Jira Done.

Traceability: BOOYAH-23 AC1-AC4 and common Definition of Done.

#### Scenario: Document checks pass while human acceptance is pending
- **WHEN** rows, ledger entries, links and source consistency have been checked by AI but human review is outstanding
- **THEN** those actual results are reported separately and final human acceptance is still pending

#### Scenario: The implementation handoff still has a blocking discrepancy
- **WHEN** a scope/schedule conflict or failed AC remains unresolved
- **THEN** its result remains failed/unverified and the corresponding task stays incomplete rather than being closed as a documented exception
