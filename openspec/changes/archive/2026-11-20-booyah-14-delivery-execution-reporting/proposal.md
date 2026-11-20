# Proposal

## Why

[BOOYAH-14](https://thaikiet291006.atlassian.net/browse/BOOYAH-14) needs a fresh PA3 Section D specification and prototype that a reviewer can walk from published rider work through delivery outcomes, dispatcher resolution, and reporting. Separate the outcome of an Order from the outcome of each DeliveryAttempt so retries are visible without inflating order success metrics.

## What Changes

- Specify UC11 View Assigned Shift and Deliveries, UC12 Record Delivery Attempt, UC13 Monitor Attempts and Resolve Failed Orders, and UC19 View Shift and Rider Reports. Trace Vision FR-04 and FR-08 to numbered steps, alternative branches, and observable screen states.
- Plan an English `UC-F04-F08-Delivery-Reporting.md`, fresh prototype screens based on Khánh's shared kit, embedded PNGs covering the main and alternative flows, and a matching PDF after review. Use synthetic data throughout.
- The original proposal marked P01–P06 **Proposed / Pending PR Review** and called for examples and a Decision Log. See Finalization for the recorded team agreement and the remaining downstream dependencies.
- Exclude backend and API work, database schema and migrations, real POD storage or uploads, production application code, and changes to the owners' F02/F03, recommendation, and guide contracts.

## Capabilities

### New Capabilities

- `delivery-execution`: Published rider assignments, attempt capture and history, and dispatcher resolution of failed orders.
- `shift-rider-reporting`: Shift and rider reporting with distinct order and attempt measures, event definitions, and data quality states.

### Modified Capabilities

None.

## Impact

- Apply delivered Section D documentation, prototype sources and exports, checks, and handoff evidence.
- Depends on [BOOYAH-24](https://thaikiet291006.atlassian.net/browse/BOOYAH-24) for model and glossary, [BOOYAH-25](https://thaikiet291006.atlassian.net/browse/BOOYAH-25) for the shared kit, [BOOYAH-26](https://thaikiet291006.atlassian.net/browse/BOOYAH-26) for Vision, [BOOYAH-20](https://thaikiet291006.atlassian.net/browse/BOOYAH-20) and [BOOYAH-13](https://thaikiet291006.atlassian.net/browse/BOOYAH-13) for F02, [BOOYAH-21](https://thaikiet291006.atlassian.net/browse/BOOYAH-21) for F03 and UC14, and [BOOYAH-15](https://thaikiet291006.atlassian.net/browse/BOOYAH-15) for UC15.
- The exploration used local Vision 2.0-review and UseCaseModel 0.2. The review copies named in Jira (Vision 2.2-review and UseCaseModel 0.4) were unavailable. Reconcile those editions before final acceptance.

## Finalization

The requester reported the team's approval of P01–P06 and authorized archive for the BOOYAH-14 documentation scope. The [Decision Log](../../../../docs/analysis-and-design/use-cases/UC-F04-F08-Delivery-Reporting.md#decision-log) records the source and limits of that agreement. UC13 step 4R records an F04/F08 re-dispatch request and preserves existing history. Actual allocation requires a separately approved F03 interface. Step 4T records operational closure and leaves the F02 Order intact and its status unchanged. Future post-attempt F02 restrictions require separate approval.
