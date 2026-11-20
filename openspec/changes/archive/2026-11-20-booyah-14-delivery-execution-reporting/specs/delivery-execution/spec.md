# Delivery Execution

## Purpose

Specify the BOOYAH-14 F04/F08 documentation and synthetic walkthrough for published rider work, delivery attempts, and dispatcher resolution. The F04/F08 workflow preserves attempt and assignment history. F02 status policy and F03 allocation remain under their respective contracts.

## ADDED Requirements

### Requirement: Open assigned published work

The prototype SHALL let a rider view their published shift, ordered stops and stop details. Source baseline: FR-03-3, FR-04-1, UC11.

#### Scenario: UC11 Main 1-3 sees assigned work [S11-01, S11-02]

- **WHEN** a rider opens their published shift and selects an assigned stop
- **THEN** the screen shows the ordered work and the selected stop details, with an action to enter UC12 when eligible

#### Scenario: UC11 A1-A2 has no visible shift [S11-03]

- **WHEN** no shift has been assigned or the assigned shift is still a draft
- **THEN** the rider sees no published work and receives no draft details

#### Scenario: UC11 A3 session or ownership failure [S11-04]

- **WHEN** the session expires or a rider opens a shift belonging to another rider or hub
- **THEN** the screen shows sign-in or access denied before showing any work details

#### Scenario: UC11 A4, A8 cannot load or retain a stop [S11-05, S11-06]

- **WHEN** the work list fails to load or a selected stop is removed or transferred
- **THEN** the screen distinguishes loading failure from unavailable work and offers retry or a return to refreshed assignments, respectively

### Requirement: Show independent optional stop context

The prototype SHALL show the next eligible stop and the published guide preview automatically when their respective data is available. Source baseline: BOOYAH-14, UC11 EP11-A and EP11-B.

#### Scenario: UC11 Main 2-4 opens optional context [S11-01, S11-02]

- **WHEN** eligible recommendation data is returned for the work list and a rider opens an assigned stop with a published same-hub guide
- **THEN** the suggestion and selected stop's guide preview appear automatically
- **AND** rider clicks open the UC14 explanation and UC15 full guide through EP11-A and EP11-B, respectively
- **AND** the rider can select a different eligible stop without changing sequence or creating an attempt

#### Scenario: UC11 A5-A7 degrades independently [S11-01, S11-02, S11-07]

- **WHEN** there are no eligible stops, a suggestion is unavailable, or the guide is missing, unavailable or unauthorized
- **THEN** the screen shows the applicable empty or unavailable state while preserving loaded assignments
- **AND** the prototype demonstrates suggestion only, guide only, and neither

### Requirement: Record attempt initiation and arrival

The prototype SHALL show the start and arrival timestamps of a DeliveryAttempt linked to its Order. Source baseline: FR-04-2, FR-04-5, UC12.

#### Scenario: UC12 Main 1-2 records start and arrival [S12-01, S12-02, S12-03]

- **WHEN** the rider starts a currently assigned eligible stop and confirms arrival
- **THEN** the prototype shows one attempt with distinct start and arrival timestamps and access to outcome capture

#### Scenario: UC12 A1, A11 loses eligibility or access [S12-08, S12-11]

- **WHEN** the stop is removed, transferred or cancelled before Start, or the rider loses the required session or scope
- **THEN** the action is rejected without a new attempt and the prototype offers refreshed work, sign-in or access denied as appropriate

### Requirement: Record a successful delivery with photo proof

The prototype SHALL require photographic POD for a successful attempt and show successful orders bypassing failed-order resolution. Source baseline: FR-04-3, BOOYAH-14 AC3, UC12.

#### Scenario: UC12 Main 3S-4 records success [S12-04, S12-06]

- **WHEN** the rider submits a successful outcome with accepted photo proof and the simulated submission succeeds
- **THEN** the attempt is shown as successful with photo evidence and the order is absent from the failed-order resolution queue

#### Scenario: UC12 A4 missing photo or upload failure [S12-04, S12-09]

- **WHEN** the photo is absent or the simulated upload fails
- **THEN** success is blocked and the rider can replace the photo or retry from the same attempt

### Requirement: Record a failed delivery with a reason and comments

The prototype SHALL capture a structured failure reason and provide a comment field. A failed attempt SHALL preserve order history without recording an F04/F08 terminal resolution or changing the F02 Order status. Source baseline: FR-04-4, FR-04-5, BOOYAH-14 AC3, UC12.

#### Scenario: UC12 Main 3F-4 records failure [S12-05, S12-06]

- **WHEN** the rider submits a failed outcome with valid failure information
- **THEN** the failure and its details appear on the attempt and the order is shown as awaiting dispatcher resolution

#### Scenario: UC12 A6 missing reason [S12-05]

- **WHEN** the rider submits failure without a reason
- **THEN** the form shows a field error and preserves the entered comment

### Requirement: Continue through assigned stops

The prototype SHALL return the rider to remaining work after each recorded success or failure. Source baseline: BOOYAH-14 AC3, UC12 to UC11.

#### Scenario: UC12 Main 5 continues or ends the rider loop [S12-06, S11-01, S11-07]

- **WHEN** the rider acknowledges a saved result
- **THEN** the rider can continue to another eligible assigned stop, or sees that none remain
- **AND** a failed stop stays available for dispatcher resolution without automatically starting another attempt

### Requirement: Monitor attempt history and resolve failed orders

The prototype SHALL let a Hub Dispatcher see scoped shift progress and per-order attempt history, then record an F04/F08 re-dispatch request or a terminal delivery-resolution outcome for an eligible failed order. Source baseline: FR-04-5, FR-04-6, FR-08-1, UC13.

#### Scenario: UC13 Main 1-4R records a re-dispatch request [S13-01, S13-02, S13-03, S13-04]

- **WHEN** the dispatcher confirms re-dispatch for an unresolved failed Order within the retry limit and no attempt is active
- **THEN** the F04/F08 workflow records one re-dispatch request for the same Order and preserves the earlier delivery attempt and assignment history
- **AND** the handoff identifies that allocation and reassignment require a separately approved F03 integration contract. Submitting the request neither changes the existing assignment nor makes the failed Order eligible as an unassigned NEW Order
- **AND** the request creates no new delivery attempt. A later attempt can start only after an eligible assignment is published and a rider starts it

#### Scenario: UC13 Main 1-4T confirms a terminal decision [S13-01, S13-02, S13-05, S13-04]

- **WHEN** the dispatcher confirms a terminal decision for an unresolved failed order
- **THEN** the F04/F08 workflow records the terminal delivery-resolution outcome and reason and preserves the Order and its attempt history
- **AND** the F02 Order status stays unchanged. Terminal resolution neither cancels nor deletes the Order
- **AND** any post-attempt restriction on F02 edits or cancellation requires a separately approved F02 integration. The current F02 Order states are NEW and CANCELLED

#### Scenario: UC13 A1-A3 empty, unavailable or unauthorized monitoring [S13-06, S13-07, S13-08]

- **WHEN** the shift has no work, the queue has no unresolved failed orders, loading fails, or the viewer lacks session or hub authority
- **THEN** the prototype shows the applicable empty, retry, sign-in or denied state
- **AND** a delivered order is never offered a failed-order decision

#### Scenario: UC13 A5-A6 cannot assign or dismisses confirmation [S13-03, S13-05, S13-09]

- **WHEN** the simulated downstream handoff has no eligible candidate, or the dispatcher dismisses confirmation
- **THEN** the prototype explains the applicable constraint or dismissal, leaves resolution options available and preserves history

#### Scenario: UC13 A4 opens a previously resolved order [S13-02, S13-09]

- **WHEN** the dispatcher opens an Order with a recorded terminal delivery resolution or an existing re-dispatch request for its latest failure
- **THEN** the screen shows the recorded outcome or decision and disables another resolution for that failure

### Requirement: Simulate one active attempt and distinct outcomes

Under P01, the prototype SHALL model at most one active attempt per Order and show separate successful, failed, and aborted attempt outcomes.

#### Scenario: UC12 A2 and UC13 A4 have an existing active attempt [S12-02, S12-08, S13-02, S13-09]

- **WHEN** the rider returns to an active attempt or a dispatcher tries to resolve an order with an active attempt
- **THEN** the rider resumes the existing attempt and the dispatcher sees a resolution lock

### Requirement: Simulate failure rules and cancellation before outcome

Under P02, the prototype SHALL check the reason and comment rules and distinguish closing an outcome form from aborting an attempt.

#### Scenario: UC12 A3 and A6 fail before arrival or omit a required comment [S12-02, S12-05]

- **WHEN** the rider has not confirmed arrival, or chooses Other, or omits a required comment
- **THEN** pre-arrival failure is available only for an incorrect or unlocatable address or unsafe access and requires a comment
- **AND** Other requires a comment and other pre-arrival outcomes are blocked

#### Scenario: UC12 A7 exits or aborts [S12-05, S12-07, S11-01]

- **WHEN** the rider closes the outcome form, or separately confirms aborting before a result
- **THEN** closing the form preserves the active attempt, while a confirmed abort preserves Aborted history and makes the stop eligible again if the assignment still applies

### Requirement: Simulate photo format and size limits

Under P03, the prototype SHALL accept one readable JPEG or PNG of up to 5 MB and let the rider preview or replace it.

#### Scenario: UC12 A5 rejects unsuitable photo evidence [S12-04, S12-09]

- **WHEN** the rider selects an unsupported, oversized or unreadable synthetic image
- **THEN** the screen explains the specific problem and keeps the outcome open for replacement

### Requirement: Simulate recovery without a duplicate operation

Under P04, the prototype SHALL show repeated actions and lost acknowledgements converging on a single recorded result, and stale actions being rejected before they change work.

#### Scenario: UC12 A2, A9-A10 double taps or loses network [S12-02, S12-03, S12-10]

- **WHEN** the rider double taps Start, Arrived or Submit, or loses connectivity before or after sending any of those actions
- **THEN** the screens distinguish unsent from unknown results and let the rider retry or refresh
- **AND** at most one start, arrival or outcome is shown for the action when the result is known

#### Scenario: UC12 A1 and UC13 A7-A8 encounter concurrent changes [S12-08, S13-09, S13-10]

- **WHEN** the assignment changes before Start, Start wins before reassignment, or two dispatchers act on the same resolution
- **THEN** the stale action is rejected with refreshed work, an active-attempt lock, or the already recorded decision, respectively
- **AND** after a lost save acknowledgement the dispatcher can recover the current result without recording a second decision

### Requirement: Simulate a bounded retry policy

Under P05, the prototype SHALL allow at most three recorded Failed attempts per Order and show dispatcher confirmation and reason for terminal closure.

#### Scenario: UC13 A4-A5 reaches the limit or closes early [S13-02, S13-05, S13-09]

- **WHEN** three distinct Failed attempts exist for the order, or the dispatcher chooses to close before that limit
- **THEN** a new re-dispatch request is disabled at the limit with an explanation, and terminal closure still requires explicit confirmation with a reason
- **AND** Aborted attempts, duplicate actions and active attempts consume no retry slots
