# order-intake-prototype Specification

## Purpose

The Order Intake prototype lets reviewers walk the Hub Dispatcher's PA3 Section D flows and verify the consistency of specifications, simulated screen states and synthetic CSV fixtures for UC05–UC08.

## Requirements

### Requirement: UC05 manual creation and shared validation

The prototype SHALL demonstrate creation of one Order and correction of invalid destination, delivery window, weight or recipient contact data as described by FR-02-1 and FR-02-3. D-F02-1 follows the BOOYAH-13 contract with the PR #16 form corrections approved by Cee-Ka at revision `f7f296a` on 20 November 2026.

#### Scenario: Create a valid order
- **WHEN** a Dispatcher submits synthetic order F02-001 with a recipient, phone, destination, a 09:00–11:00 window and 1.25 kg weight
- **THEN** the prototype shows one created Order with the proposed NEW status

#### Scenario: Correct invalid fields
- **WHEN** a create or edit form has a missing required field, invalid phone, end at or before start, or nonpositive weight
- **THEN** the corresponding summary and inline messages identify the fields, valid entries remain available for correction and the simulation commits no changes

### Requirement: D-F02-2 hub-scoped duplicate handling

The prototype SHALL demonstrate duplicate detection in manual create, within a CSV and against the hub's existing orders. Per-hub case-insensitive comparison preserves the trimmed display code.

#### Scenario: Duplicate in the selected hub
- **WHEN** an existing code or an earlier record in the same file is F02-001 and the input is ` f02-001 `
- **THEN** the form identifies the same-hub conflict or the CSV report flags every duplicate record

#### Scenario: Same code in another hub
- **WHEN** F02-001 exists only in a separate synthetic hub
- **THEN** the authorized hub's intake example treats F02-001 as available and reveals no other-hub details

### Requirement: UC06 preview and atomic import

The prototype SHALL demonstrate FR-02-2 and FR-02-3 with a valid preview, confirmation, success and row-level errors. Preview saves zero orders. Explicit confirmation alone starts the simulated atomic commit.

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

The review package SHALL provide a downloadable sample template, a valid 20-order fixture and an invalid fixture using the same header contract. CSV inputs SHALL accept all required columns in any order and the approved optional fields in the [decision register](../../changes/archive/2026-11-21-booyah-20-f02-order-intake-uc05-uc08/design.md#decision-register).

#### Scenario: Download the template
- **WHEN** a Dispatcher opens the import screen and selects Download CSV template
- **THEN** the download contains the Section E header and synthetic example, with `priority`, `note`, `latitude` and `longitude` as approved optional columns

#### Scenario: Identify file-level errors
- **WHEN** the input has the wrong file type, invalid UTF-8, empty data, malformed CSV, a missing or invalid header, more than 500 data records or more than 1,000,000 bytes
- **THEN** the applicable screen explains the specific file-level failure and offers replacement without enabling confirmation

### Requirement: UC07 permitted order search and detail

The prototype SHALL demonstrate order listing, filtering, pagination and detail under FR-02-4. Under D-F02-8, filters use status, hub-local window-start dates or keyword in code, name or phone. A page request above the available range SHALL return page 1.

#### Scenario: Browse matching orders
- **WHEN** the Dispatcher applies a status, window-start date range or keyword filter
- **THEN** the example resets to page one, shows matching hub orders in ascending window-start then displayed-code order and links to their details

#### Scenario: List empty and filter empty
- **WHEN** the current hub has no orders or the active query matches none
- **THEN** the screen shows the relevant recovery action, either creating or importing an order or clearing the filters

### Requirement: UC08 conditional update and cancellation

The prototype SHALL demonstrate FR-02-5 with update, cancellation, refusal and conflict recovery. D-F02-5 and D-F02-6 require a read-only order code on edit and a cancellation reason of 5–300 characters after trimming.

#### Scenario: Update a NEW order
- **WHEN** the Dispatcher submits valid edits to a current NEW order
- **THEN** the detail shows updated fields, retains its code and hub, and remains NEW

#### Scenario: Cancel a NEW order with a reason
- **WHEN** the Dispatcher confirms cancellation of a current NEW order with a valid reason
- **THEN** its retained detail shows CANCELLED with the same order code and saved trimmed reason

#### Scenario: Return without cancelling or correct the reason
- **WHEN** the Dispatcher dismisses confirmation or submits a trimmed reason below five or above 300 characters
- **THEN** the prototype returns to detail without cancellation or, for an invalid reason, shows the correction affordance without cancellation

#### Scenario: Refuse a stale or disallowed mutation
- **WHEN** the order changed concurrently, its current state blocks editing or it is already cancelled
- **THEN** the prototype shows the corresponding reload, blocked-edit or already-cancelled state without overwriting the latest details or cancellation reason

### Requirement: F02 role and hub boundary

The prototype SHALL represent the FR-01-2 role and resource boundary across UC05–UC08. D-F02-7 SHALL distinguish simulated 401, 403 and 404 handling without leaking the requested resource.

#### Scenario: Access outside the authorized role or hub
- **WHEN** a signed-in Administrator or Delivery Rider enters dispatcher Order Intake
- **THEN** the prototype shows simulated 403 access restriction and a permitted exit with no other-hub data

#### Scenario: Session expires before a read or mutation
- **WHEN** a session expires at entry or before submit
- **THEN** the prototype shows simulated 401 sign-in recovery without automatically replaying the action

#### Scenario: Request an absent or out-of-hub order
- **WHEN** an authorized Dispatcher requests a missing order or an order outside the permitted hub
- **THEN** the prototype shows the same generic simulated 404 and an Orders recovery link
- **AND** a wrong-role request uses the distinct simulated 403 screen and missing or expired authentication uses simulated 401

### Requirement: Section D traceability and visual evidence

The review package SHALL link every applicable FR to its UC, step or branch, and screen state, and embed light-mode screenshots beside each UC. It MUST include English Markdown, matching A4 PDF, synthetic fixtures and a decision log for D-F02-1–8.

#### Scenario: Reproduce the prototype evidence
- **WHEN** a reviewer builds the locally sourced working copy and checks each state at 1440×900 and 1280×720
- **THEN** the intended state is visible, primary actions are reachable and the report's screen IDs resolve to the corresponding embedded PNGs

#### Scenario: Compare and review the contract
- **WHEN** the package is ready for peer review
- **THEN** it reports machine checks, BOOYAH-13 and BOOYAH-19 parity on accessible evidence, outstanding gaps and a checklist for the independent walkthrough
- **AND** it records AC3–AC5 acceptance only upon the applicable review evidence
