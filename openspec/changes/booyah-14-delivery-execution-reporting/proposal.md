# Proposal

## Why

[BOOYAH-14](https://thaikiet291006.atlassian.net/browse/BOOYAH-14) needs a fresh PA3 Section D specification and prototype that a reviewer can walk from published rider work through delivery outcomes, dispatcher resolution, and reporting. Separate the outcome of an Order from the outcome of each DeliveryAttempt so retries are visible without inflating order success metrics.

## What Changes

- Specify UC11 View Assigned Shift and Deliveries, UC12 Record Delivery Attempt, UC13 Monitor Attempts and Resolve Failed Orders, and UC19 View Shift and Rider Reports. Trace Vision FR-04 and FR-08 to numbered steps, alternative branches, and observable screen states.
- Plan an English `UC-F04-F08-Delivery-Reporting.md`, fresh prototype screens based on Khánh's shared kit, embedded PNGs covering the main and alternative flows, and a matching PDF after review. Use synthetic data throughout.
- Draft P01–P06 as **Proposed / Pending PR Review**, with examples and a decision log. Drafting and simulated walkthroughs can proceed while approval is pending. Final acceptance of scope-affecting rules requires recorded decisions under Jira AC5.
- Exclude backend and API work, database schema and migrations, real POD storage or uploads, production application code, and changes to the owners' F02/F03, recommendation, and guide contracts.

## Capabilities

### New Capabilities

- `delivery-execution`: Published rider assignments, attempt capture and history, and dispatcher resolution of failed orders.
- `shift-rider-reporting`: Shift and rider reporting with distinct order and attempt measures, event definitions, and data quality states.

### Modified Capabilities

None.

## Impact

- Future Apply work is limited to Section D documentation, prototype sources and exports, checks, and handoff evidence. This proposal creates planning artifacts only.
- Depends on [BOOYAH-24](https://thaikiet291006.atlassian.net/browse/BOOYAH-24) for model and glossary, [BOOYAH-25](https://thaikiet291006.atlassian.net/browse/BOOYAH-25) for the shared kit, [BOOYAH-26](https://thaikiet291006.atlassian.net/browse/BOOYAH-26) for Vision, [BOOYAH-20](https://thaikiet291006.atlassian.net/browse/BOOYAH-20) and [BOOYAH-13](https://thaikiet291006.atlassian.net/browse/BOOYAH-13) for F02, [BOOYAH-21](https://thaikiet291006.atlassian.net/browse/BOOYAH-21) for F03 and UC14, and [BOOYAH-15](https://thaikiet291006.atlassian.net/browse/BOOYAH-15) for UC15.
- The exploration used local Vision 2.0-review and UseCaseModel 0.2. The review copies named in Jira (Vision 2.2-review and UseCaseModel 0.4) were unavailable. Reconcile those editions before final acceptance.
