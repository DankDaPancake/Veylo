## Purpose

Define the prototype-governed order-intake interactions so Dispatchers can review imports before writing, inspect saved outcomes and recover from validation or concurrent changes without losing input.

## ADDED Requirements

### Requirement: Read-only batch check and preview

The system SHALL let an authorized hub Dispatcher select a CSV and choose Check CSV, validating the existing file/record contract, every in-file duplicate occurrence and current same-hub duplicate codes without saving orders. A clean check SHALL show a read-only record preview, valid count, zero saved count, explicit import confirmation and cancellation. Error reports SHALL identify record, column and reason with affected-record totals; file-level errors SHALL support replacement/template recovery. User-visible content SHALL correspond to the authored UC06 states S06-01, S06-02 and their error variants.

#### Scenario: Clean preview and dismissal

- **WHEN** a Dispatcher checks 20 valid records and then cancels the preview
- **THEN** the preview displays all records and a valid count of 20 with zero saved, and cancellation returns to Orders with zero imported and no writes

#### Scenario: Mixed invalid records and existing codes

- **WHEN** a file includes invalid fields, in-file duplicate codes and a code already saved in the authorized hub
- **THEN** the report identifies all applicable record/column/reason diagnostics including duplicate occurrences and affected-record totals, and creates no orders

### Requirement: Explicit import confirmation and commit recovery

Only explicit confirmation from a successful preview SHALL start the atomic import. Confirmation SHALL recheck session, role, hub, file/records and current code conflicts. Success SHALL show the actual created count and View orders action; conflict SHALL identify offending records and report zero batch orders imported, requiring a fresh check after replacement. The existing per-hub authorization and atomic import rules remain in force; preview SHALL confer no authorization or reservation.

#### Scenario: Confirm and view imported orders

- **WHEN** the Dispatcher confirms the clean 20-record preview while all records remain valid
- **THEN** exactly 20 NEW orders are saved atomically, a completion view reports 20, and View orders opens the saved list

#### Scenario: Code claimed after preview

- **WHEN** another request claims a previewed code before confirmation
- **THEN** the batch creates zero orders and shows record/column conflict diagnostics with replacement and fresh-check recovery

#### Scenario: Access lost between checking and confirmation

- **WHEN** the session expires or authorized role/hub access is lost before checking or confirmation
- **THEN** the operation denies access under the existing 401/403/404 rules, discloses no forbidden order data, saves nothing and offers the corresponding sign-in/access recovery without automatically replaying the action

### Requirement: Saved detail and dismissed mutation navigation

Successful create, edit and cancellation SHALL open the same saved order detail with the corresponding success notice, current status and retained cancellation reason where applicable. Edit SHALL present protected order identity without including immutable identity in the update payload. Discarded edit and Keep order/Back to detail from cancellation SHALL return to retained detail without mutation. State-blocked and stale/already-cancelled outcomes SHALL provide explanation and recovery to the latest retained detail, preserving the existing version/state enforcement.

#### Scenario: Save and return to retained detail

- **WHEN** a Dispatcher creates an order, saves permitted edits or confirms a valid cancellation
- **THEN** the respective saved NEW or CANCELLED detail and success confirmation appear, with Back to orders available and the saved identity preserved

#### Scenario: Dismiss and recover

- **WHEN** a Dispatcher discards an edit, keeps the order during cancellation, or reloads after a stale/state conflict
- **THEN** dismissal writes nothing, recovery opens current retained detail, and an existing cancellation reason is preserved

### Requirement: Focused validation and keyboard recovery

Invalid create/edit/cancel submissions SHALL retain entered values and focus an accessible error summary with links that focus the invalid controls. CSV diagnostics SHALL receive focus and expose record/column/reason and replacement recovery. Core actions SHALL remain operable by keyboard at the prototype desktop frames; existing field labels and inline feedback SHALL be retained.

#### Scenario: Correct invalid fields

- **WHEN** a submission produces validation or duplicate-code errors
- **THEN** focus moves to the summary, its field links focus the appropriate controls, entered values remain available, and correction can be resubmitted using the keyboard
