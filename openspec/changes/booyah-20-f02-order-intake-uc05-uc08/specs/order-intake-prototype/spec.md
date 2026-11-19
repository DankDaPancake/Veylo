# Order Intake Prototype Delta

## Purpose

The Order Intake prototype lets reviewers walk the Hub Dispatcher's PA3 Section D flows and verify the consistency of specifications, simulated screen states and synthetic CSV fixtures for UC05–UC08.

## ADDED Requirements

### Requirement: UC05 manual creation and shared validation

The prototype SHALL demonstrate creation of one Order and correction of invalid destination, delivery window, weight or recipient contact data as described by FR-02-1 and FR-02-3. D-F02-1 formats and limits have status **Proposed / Pending PR Review**.

#### Scenario: Create a valid order
- **WHEN** a Dispatcher submits synthetic order F02-001 with a recipient, phone, destination, a 09:00–11:00 window and 1.25 kg weight
- **THEN** the prototype shows one created Order with the proposed NEW status

#### Scenario: Correct invalid fields
- **WHEN** a create or edit form has a missing required field, invalid phone, end at or before start, or nonpositive weight
- **THEN** the corresponding summary and inline messages identify the fields, valid entries remain available for correction and the simulation commits no changes

### Requirement: D-F02-2 hub-scoped duplicate handling

The prototype SHALL demonstrate duplicate detection in manual create, within a CSV and against the hub's existing orders. Trimmed case-insensitive code comparison per hub has status **Proposed / Pending PR Review**.

#### Scenario: Duplicate in the selected hub
- **WHEN** an existing code or an earlier record in the same file is F02-001 and the input is ` f02-001 `
- **THEN** the applicable form or row report identifies an order code conflict

#### Scenario: Same code in another hub
- **WHEN** F02-001 exists only in a separate synthetic hub
- **THEN** the authorized hub's intake example treats F02-001 as available and reveals no other-hub details

### Requirement: UC06 preview and atomic import

The prototype SHALL demonstrate FR-02-2 and FR-02-3 with a valid preview, confirmation, success and row-level errors. Atomic import under D-F02-3 has status **Proposed / Pending PR Review**.

#### Scenario: Confirm a valid batch
- **WHEN** a Dispatcher previews and confirms the valid 20-order fixture
- **THEN** the simulation reports 20 created NEW orders and offers a return to the order list

#### Scenario: Mixed file or a conflict during confirmation
- **WHEN** a batch contains invalid records or a code becomes unavailable after preview
- **THEN** the row report identifies record number, column and reason and reports zero created orders for the whole batch

#### Scenario: Leave confirmation
- **WHEN** the Dispatcher cancels at the preview confirmation
- **THEN** the prototype shows a return path to the list and the simulated batch creates zero orders

### Requirement: D-F02-4 CSV contract and file feedback

The review package SHALL provide a downloadable header template, a valid 20-order fixture and an invalid fixture using the same header contract. CSV encoding, headers and limits specified in the [decision register](../../design.md#decision-register) have status **Proposed / Pending PR Review**.

#### Scenario: Download the template
- **WHEN** a Dispatcher opens the import screen and selects Download CSV template
- **THEN** the download contains the documented header including the optional note column

#### Scenario: Identify file-level errors
- **WHEN** the input has the wrong file type, invalid UTF-8, empty data, malformed CSV, a missing or invalid header, more than 500 data records or more than 1,000,000 bytes
- **THEN** the applicable screen explains the specific file-level failure and offers replacement without enabling confirmation

### Requirement: UC07 permitted order search and detail

The prototype SHALL demonstrate order listing, filtering, pagination and detail under FR-02-4. D-F02-8 status, date and keyword filters, 20 rows per page and deterministic sort order have status **Proposed / Pending PR Review**.

#### Scenario: Browse matching orders
- **WHEN** the Dispatcher applies a status, window-start date range or keyword filter
- **THEN** the example resets to page one, shows matching hub orders in window-start then order-code order and links to their details

#### Scenario: List empty and filter empty
- **WHEN** the current hub has no orders or the active query matches none
- **THEN** the screen shows the relevant recovery action, either creating or importing an order or clearing the filters

### Requirement: UC08 conditional update and cancellation

The prototype SHALL demonstrate FR-02-5 with update, cancellation, refusal and conflict recovery. D-F02-5 and D-F02-6 status names, transition, editable fields, reason and conflict behavior have status **Proposed / Pending PR Review**.

#### Scenario: Update a NEW order
- **WHEN** the Dispatcher submits valid edits to a current NEW order
- **THEN** the detail shows updated fields, retains its code and hub, and remains NEW

#### Scenario: Cancel a NEW order with a reason
- **WHEN** the Dispatcher confirms cancellation of a current NEW order with a valid reason
- **THEN** its retained detail shows CANCELLED and the recorded reason

#### Scenario: Return without cancelling or correct the reason
- **WHEN** the Dispatcher dismisses confirmation or submits a blank or overlong reason
- **THEN** the prototype returns to detail without cancellation or, for an invalid reason, shows the correction affordance without cancellation

#### Scenario: Refuse a stale or disallowed mutation
- **WHEN** the order changed concurrently, its current state blocks editing or it is already cancelled
- **THEN** the prototype shows the corresponding reload, blocked-edit or already-cancelled state without overwriting the latest details or cancellation reason

### Requirement: F02 role and hub boundary

The prototype SHALL represent the FR-01-2 role and resource boundary across UC05–UC08. The proposed D-F02-7 hub isolation, denial response and session recovery details have status **Proposed / Pending PR Review**.

#### Scenario: Access outside the authorized role or hub
- **WHEN** a signed-in Administrator or Delivery Rider enters dispatcher Order Intake or a Dispatcher requests another hub's order
- **THEN** the prototype shows generic access restriction and a permitted exit with no other-hub data

#### Scenario: Session expires before a read or mutation
- **WHEN** a session expires at entry or before submit
- **THEN** the prototype shows sign-in recovery without automatically replaying the action

### Requirement: Section D traceability and visual evidence

The review package SHALL link every applicable FR to its UC, step or branch, and screen state, and embed fresh screenshots beside each UC. It MUST include English Markdown, matching A4 PDF, synthetic fixtures and a decision log for D-F02-1–8.

#### Scenario: Reproduce the prototype evidence
- **WHEN** a reviewer builds the locally sourced working copy and checks each state at 1440×900 and 1280×720
- **THEN** the intended state is visible, primary actions are reachable and the report's screen IDs resolve to the corresponding embedded PNGs

#### Scenario: Compare and review the contract
- **WHEN** the package is ready for peer review
- **THEN** it reports machine checks, BOOYAH-13 and BOOYAH-19 parity on accessible evidence, outstanding gaps and a checklist for the independent walkthrough
- **AND** it records AC3–AC5 acceptance only upon the applicable review evidence
