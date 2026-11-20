## MODIFIED Requirements

### Requirement: Explicit import confirmation and commit recovery

Only explicit confirmation from a successful preview SHALL start the atomic import. Confirmation SHALL recheck session, role, hub, file/records and current code conflicts. Success SHALL show the actual created count and View orders action; conflict SHALL identify offending records and report zero batch orders imported, requiring a fresh check after replacement. The existing per-hub authorization and atomic import rules remain in force; preview SHALL confer no authorization or reservation. When a failed confirmation returns to the file picker after a non-row error, the retained upload SHALL be cleared so an empty picker cannot submit a previously previewed file. Failures originating in the still-mounted picker SHALL preserve its selected file, and row-error reports SHALL retain their replacement recovery.

#### Scenario: Confirm and view imported orders

- **WHEN** the Dispatcher confirms the clean 20-record preview while all records remain valid
- **THEN** exactly 20 NEW orders are saved atomically, a completion view reports 20, and View orders opens the saved list

#### Scenario: Code claimed after preview

- **WHEN** another request claims a previewed code before confirmation
- **THEN** the batch creates zero orders and shows record/column conflict diagnostics with replacement and fresh-check recovery

#### Scenario: Access lost between checking and confirmation

- **WHEN** the session expires or authorized role/hub access is lost before checking or confirmation
- **THEN** the operation denies access under the existing 401/403/404 rules, discloses no forbidden order data, saves nothing and offers the corresponding sign-in/access recovery without automatically replaying the action

#### Scenario: Non-row confirmation failure resets the picker

- **WHEN** confirmation from a clean preview fails with a network error, HTTP 500 or a file-level HTTP 400 without record diagnostics
- **THEN** the UI returns to the file picker with the preview and retained upload cleared
- **AND** choosing Check CSV without selecting a new file shows a file-required error and sends no upload request
- **AND** selecting a replacement file checks that file through a fresh preview before another confirmation

#### Scenario: Picker-origin failure retains the visible selection

- **WHEN** Check CSV fails with a non-row error while the selected file input remains mounted in the picker
- **THEN** its visible selection and retained upload remain aligned for correction or deliberate retry

#### Scenario: Row diagnostics retain report and replacement recovery

- **WHEN** checking or confirming a CSV produces record-level diagnostics
- **THEN** the UI shows the record report with its replacement action
- **AND** choosing a replacement opens a fresh picker with the previous upload cleared

### Requirement: Saved detail and dismissed mutation navigation

Successful create, edit and cancellation SHALL open the same saved order detail with the corresponding success notice, current status and retained cancellation reason where applicable. Edit SHALL present protected order identity without including immutable identity in the update payload. Discarded edit and Keep order/Back to detail from cancellation SHALL return to retained detail without mutation. State-blocked and stale/already-cancelled outcomes SHALL provide explanation and recovery to the latest retained detail, preserving the existing version/state enforcement. After HTTP 401 or 403, local back navigation SHALL NOT dismiss the access error and reveal cached order details or mutation controls; only the existing sign-in or access-recovery actions SHALL be offered within the denied content.

#### Scenario: Save and return to retained detail

- **WHEN** a Dispatcher creates an order, saves permitted edits or confirms a valid cancellation
- **THEN** the respective saved NEW or CANCELLED detail and success confirmation appear, with Back to orders available and the saved identity preserved

#### Scenario: Dismiss and recover

- **WHEN** a Dispatcher discards an edit, keeps the order during cancellation, or reloads after a stale/state conflict
- **THEN** dismissal writes nothing, recovery opens current retained detail, and an existing cancellation reason is preserved

#### Scenario: Cancellation loses session or permission

- **WHEN** a cancellation submission returns HTTP 401 or HTTP 403
- **THEN** the UI offers sign-in recovery for 401 or staff-workspace recovery for 403
- **AND** Back to detail, cached order detail and Edit/Cancel controls remain hidden while access is denied
- **AND** no cancellation or detail request is automatically replayed by recovery

#### Scenario: Permitted cancellation recovery remains available

- **WHEN** an authorized Dispatcher dismisses cancellation or receives a stale-version conflict
- **THEN** Keep order and Back to detail remain available for ordinary dismissal, and conflict recovery can reload the latest order
- **AND** successful cancellation still displays the saved CANCELLED detail and retained reason
