## Why

BOOYAH-13 defines the shared contract for the PA3 F02 demo before the authentication, persistence and interface tasks implement it. The Vision maps F02 to UC05–UC08. The BOOYAH-20 handoff supplies D-F02-1 through D-F02-8, the UC flows and the synthetic CSV fixtures.

## What Changes

- Specify dispatcher sign-in and server-side hub authorization for F02.
- Specify manual order intake, CSV intake, search, detail, conditional editing and cancellation.
- Agree the shared schema, API and fixture ownership before BOOYAH-19 writes a migration.
- Defer full account administration, dispatch shifts, delivery attempts, rider tools and continuous tracking.

## Capabilities

### New Capabilities

- `order-intake`: Hub-scoped dispatcher intake and order maintenance with the minimum sign-in and authorization needed for the PA3 demo.

### Modified Capabilities

None.

## Impact

BOOYAH-18 owns authentication and demo account integration. BOOYAH-19 owns shared persistence and the order API. BOOYAH-16 owns the interface, and BOOYAH-17 verifies integration.

On 19 November 2026, Phạm Công Khánh confirmed the F02 rules and Hub/User/Order design for local work and delegated the remaining contract details. This proposal and the exact contract in the design are ready for independent review by Trần Lê Hải. Record his approval before merging a migration.
