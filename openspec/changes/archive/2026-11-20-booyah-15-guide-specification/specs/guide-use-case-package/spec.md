## Purpose

Define the PA3 evidence and review criteria for the location guides and AI-assisted note normalization use cases.

## ADDED Requirements

### Requirement: GUIDE-01 Complete and traceable use cases

The package SHALL contain UC15, UC16 and UC18 in English with name and ID, actors, description, preconditions, numbered basic flow, alternative flows linked to branch steps, postconditions and applicable special requirements. UC17 SHALL remain reserved. The package SHALL trace each use case to the Vision requirements and map every flow to a screen or state ID and an embedded prototype image.

#### Scenario: Reviewer walks the package

- **WHEN** the reviewer selects any basic step or alternative branch in the package
- **THEN** the spec identifies the relevant screen or state and the matching screenshot is embedded alongside the use case

### Requirement: GUIDE-02 Published guide access

UC15 and the UC11 handoff SHALL show the same publication and hub rules in search, shift preview and direct links. Published views SHALL contain only reusable building guidance and exclude recipient details, access codes, order and delivery records, proof-of-delivery photos, raw notes and drafts.

#### Scenario: Same-hub rider searches off shift

- **WHEN** an active rider with no current shift searches for a published guide in their hub
- **THEN** the result opens the full guide without granting access to any other rider's deliveries

#### Scenario: Rider opens an assigned stop preview

- **WHEN** the rider selects EP11-B on `S11-02-stop-details` or `S11-02-guide-only` for an assigned stop with an eligible published guide in the repository walkthrough
- **THEN** `S15-02` shows the same guide and published version as the preview and search, and Back restores the originating UC11 screen and selected stop

#### Scenario: Missing or unauthorized guide

- **WHEN** no guide exists, or a guide is cross-hub, unpublished or rejected
- **THEN** the search and preview expose no such guide, a direct request shows an unavailable or denied state, and the assignment list remains usable

#### Scenario: Superseded guide link

- **WHEN** an authorized rider opens a link to a superseded guide
- **THEN** the full-guide flow shows the current eligible published version and an update notice, or an unavailable state if no eligible version remains

### Requirement: GUIDE-03 Raw note capture

UC16 SHALL show a privacy warning and end successfully when the raw note linked to the location is saved. The package SHALL cover empty or too-long input, save failure and repeat submission, including preservation of unsaved form text.

#### Scenario: Invalid input or save failure

- **WHEN** the rider submits empty or too-long text or the save fails
- **THEN** the prototype shows the reason or retry state and retains the entered text for correction or retry

#### Scenario: Retry of an already saved note

- **WHEN** the rider retries the same submission after a double-tap or an interrupted confirmation
- **THEN** the flow shows one saved raw note and a successful confirmation for that submission

### Requirement: GUIDE-04 AI preparation and manual fallback

UC18 SHALL cover asynchronous preparation, visible job status, comparison with the retained source, flagged uncertainty, editing, regeneration and manual drafting. The spec and screens SHALL show the raw note preserved and manual drafting available for timeout, invalid JSON, quota failure and mocked or unavailable AI. The accepted Vision baseline SHALL govern the documented NFRs.

#### Scenario: AI preparation fails or runs in mock mode

- **WHEN** the reviewer walks timeout, invalid JSON, exhausted quota or mock mode
- **THEN** each branch shows the raw note available and an actionable manual drafting path

#### Scenario: AI prepares a draft

- **WHEN** the mock preparation produces a structured draft with incomplete source context
- **THEN** the dispatcher can compare it with the original note, inspect uncertainty, edit or regenerate it, and review it before publication

### Requirement: GUIDE-05 Dispatcher publication and conflict review

UC18 SHALL show explicit dispatcher approval before publication, rejection with a reason, and superseding of the existing published version on approved publication. The package SHALL show how already-reviewed drafts and conflicting guide versions are handled without losing the source note or local edits.

#### Scenario: Dispatcher approves or rejects

- **WHEN** the dispatcher explicitly approves the reviewed draft or rejects it with a reason
- **THEN** approval publishes the new current version and supersedes the prior version, while rejection keeps the draft unavailable to riders

#### Scenario: Dispatcher reviews stale work

- **WHEN** another dispatcher has already handled the draft or the current guide changed during review
- **THEN** the stale screen blocks publication, keeps the raw note and local edits, and asks the dispatcher to reload and compare

### Requirement: GUIDE-06 Review and handoff evidence

The package SHALL use synthetic data, the confirmed BOOYAH-25 kit and screen ID convention, and actual attribution immediately after applicable headings. The handoff SHALL identify the reviewed Markdown and matching PDF, record walkthrough results for AC1 through AC4, and provide the FR-to-UC references for BOOYAH-24 and package inputs for BOOYAH-29.

#### Scenario: Materials are ready for independent review

- **WHEN** the assignee hands the package to the designated reviewer
- **THEN** each embedded PNG resolves and is legible in the PDF, each flow is covered by the walkthrough, and human acceptance is recorded only after it occurs
