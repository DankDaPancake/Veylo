# shift-rider-reporting Specification

## Purpose

Explain shift progress and rider performance using recorded events while keeping the outcomes of orders and individual attempts separately auditable.

## Requirements

### Requirement: Filter reports within dispatcher scope

The prototype SHALL show shift progress and rider performance for an authorized Hub Dispatcher, with a date range and optional shift and rider filters. Source baseline: FR-08-1, BOOYAH-14 UC19.

#### Scenario: UC19 Main 1-3 filters and updates the report [S19-01, S19-02]

- **WHEN** a dispatcher selects a valid range and permitted shift or rider
- **THEN** the report shows the selected scope, recorded shift progress and rider performance, and refreshes the results when the filter changes

#### Scenario: UC19 A1-A2 rejects invalid or unauthorized filters [S19-03, S19-04]

- **WHEN** a date is missing or invalid, the end precedes the start, the session expires, or a selected shift or rider is out of scope
- **THEN** the prototype shows the relevant validation, sign-in or denied state
- **AND** no unauthorized result is shown and editable input is preserved on validation failure

#### Scenario: UC19 A3-A5 distinguishes empty, incomplete and unavailable [S19-05, S19-06, S19-07]

- **WHEN** no events match, only incomplete attempts match, or loading fails
- **THEN** the report distinguishes no matching data, incomplete activity, and a retryable load failure
- **AND** a successful empty result does not imply a measured zero-percent success rate

### Requirement: Distinguish order and attempt measures

The prototype SHALL distinguish order completion and success from attempt counts and rates, and show formulas, units, and inclusion or exclusion rules for each metric. Source baseline: FR-04-5, FR-08-2, BOOYAH-14 AC4.

#### Scenario: UC19 Main 2 explains distinct metrics [S19-02, S19-08]

- **WHEN** one order has several attempts and another has an unresolved failure
- **THEN** the order panel shows separate delivered, terminal failure and open categories per distinct order
- **AND** the attempt panel shows separate attempt counts and rates, with the applicable scope and metric definitions accessible on the prototype

### Requirement: Show attempt duration and failure causes

The prototype SHALL show average attempt duration and frequent failure causes with their event and grouping definitions. Source baseline: FR-08-3, BOOYAH-14 AC4.

#### Scenario: UC19 Main 3 shows comparisons [S19-02, S19-08]

- **WHEN** eligible duration and failed attempt data exist
- **THEN** average duration displays its unit and event boundaries, and failure causes show counts grouped by reason

### Requirement: Simulate scoped report cohorts and progress

**Proposed / Pending PR Review (P06).** The draft prototype SHALL apply the date window and event definitions below for order, attempt, and shift progress metrics.

#### Scenario: UC19 Main 1-2 uses distinct reporting windows and attribution [S19-01, S19-02, S19-08]

- **WHEN** the report applies an inclusive range of hub calendar days
- **THEN** the window is half open, starting at local midnight on the first day and ending at local midnight after the last day
- **AND** each order enters the order cohort only when its first valid Start is in that window, with credit scoped by that start's shift and rider
- **AND** order results are evaluated immediately before the window end, including outcomes in another shift or with another rider in the hub after the qualifying start
- **AND** final attempts are scoped by their outcome timestamp in the window and by the shift and rider that performed them

#### Scenario: UC19 Main 2 reads a shift progress snapshot [S19-02, S19-08]

- **WHEN** the selected shift overlaps the report range and its workload is evaluated just before the cutoff
- **THEN** progress is distinct stops with a recorded Successful or Failed outcome in that shift by cutoff divided by stops assigned to that shift by cutoff, excluding stops withdrawn before Start
- **AND** the report displays counts in stops and the rate in percent
- **AND** a stop with a failed attempt counts as worked even if its order remains open, and later retries in a different shift do not complete the first shift's other stops

### Requirement: Simulate order and attempt outcome calculations

**Proposed / Pending PR Review (P06).** The draft prototype SHALL calculate order and attempt rates using the separate cohorts and eligibility rules below.

#### Scenario: UC19 Main 2 counts a retry once per order [S19-02, S19-08]

- **WHEN** Order A fails and succeeds on retry, and Order B fails and remains open, with both orders and all three outcomes in scope
- **THEN** order success is 1 of 2 orders (50%) and attempt success is 1 of 3 final attempts (33.3%)
- **AND** order closure is (delivered orders plus terminal failures) divided by scoped distinct orders, and order success is delivered orders divided by those same scoped orders
- **AND** attempt success is Successful divided by Successful plus Failed, deduplicated by attempt identity

#### Scenario: UC19 A4 and A7 displays incomplete work and zero denominators [S19-06, S19-08]

- **WHEN** data includes active or Aborted attempts, or the denominator of a rate is zero
- **THEN** active attempts started in the window and still active at cutoff, and Aborted attempts ending in the window, display as separate counts
- **AND** neither enters the attempt success denominator, and any zero denominator displays a dash with an explanation
- **AND** the order cohort remains determined by its first valid Start, even when that order has no final attempt in the report window

### Requirement: Simulate event quality and failure grouping

**Proposed / Pending PR Review (P06).** The draft prototype SHALL show how the attempt duration and failure cause measures handle incomplete, invalid, and tied data.

#### Scenario: UC19 Main 3 and A6 excludes invalid duration samples [S19-02, S19-06, S19-08]

- **WHEN** in-scope Successful or Failed attempts include valid durations and rows with missing or reversed start and outcome timestamps
- **THEN** average duration is the sum of outcome minus start divided by the number of attempts with valid ordered timestamps, displayed in minutes per attempt with included and excluded sample counts
- **AND** an attempt with a valid in-window outcome but an invalid start can still count in the outcome rate
- **AND** an outcome without a valid event timestamp cannot be assigned to the reporting window and is flagged separately when its context is known
- **AND** no valid duration sample displays a dash

#### Scenario: UC19 A8-A9 handles no reasons, missing reasons and ties [S19-02, S19-08]

- **WHEN** failed reasons are absent, unavailable for some in-scope failures, or tied
- **THEN** the report counts distinct in-scope Failed attempts per known reason in descending order and keeps ties visible
- **AND** missing reasons appear as a separate data quality count, and no failures produce an explicit empty explanation
