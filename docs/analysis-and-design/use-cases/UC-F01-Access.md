# F01 — Access and Administration Use Cases
Performed by: Lý Huỳnh Minh Đăng. Source review: Thái Kiệt (relayed by assignee; detailed findings unavailable). Reviewed by: Pending for restoration. Edited by: Codex (AI-assisted).

Based on BOOYAH-22, the PA2 Vision and the PA3 F02 guard contract. UC IDs and actors were reconciled with the [BOOYAH-24 catalog](https://drive.google.com/file/d/1BJBcPWMsFNr-2qnKkTXYu7afLKCuFiAV/view) and FR IDs with [Vision 2.2-review](https://drive.google.com/file/d/1FGJ7CS2HvPsV1oz2lmePL8cSHBYwjGKH/view). The administrative decision record still needs confirmation. The PA3 implementation scope covers email-credential sign-in and Dispatcher-only F02 authorization. The account-management, hub and audit screens describe the broader F01 design. The catalog marks account policy and hub configuration breadth as pending.

## UC01 — Sign In
Performed by: Lý Huỳnh Minh Đăng. Source review: Thái Kiệt (relayed by assignee; detailed findings unavailable). Reviewed by: Pending for restoration. Edited by: Codex (AI-assisted).

**Trace:** FR-01-1 and FR-01-2.

**Actor:** Staff User (Administrator, Dispatcher, Rider). **Description:** Establish a session and enter an authorized workspace. **Preconditions:** The user has a provisioned staff account. **Postconditions:** Successful sign-in establishes a session. Sign-out or expiry removes access.

**Basic flow:**

1. Open the sign-in screen (S01-01). The PA3 demonstration uses a provisioned email credential.
2. Enter the account identifier and password, then submit (S01-01).
3. The system checks credentials and account eligibility. It opens the role's permitted landing screen (S01-02). The exact landing route per role is pending.
4. Select Sign out. The system revokes the session and returns to sign-in (S01-01).

**Alternative flows:**

- **2a — Invalid credentials:** Branch from basic step 2. Show a generic error and allow retry (S01-03).
- **3a — Ineligible account:** Branch from basic step 3. Refuse access for a deactivated account or a staff role with missing required hub membership. Confirm the approved user-facing response (S01-04).
- **3b — Wrong role:** Branch from basic step 3. Deny protected access. F02 denies Administrator and Rider with 403 (S01-05).
- **3c — Expired session:** Branch from basic step 3. Require sign-in again. F02 API requests without a valid session return 401 (S01-06).

**Special requirements:** F02 reads role/hub on the server. Never show protected orders in an error state. A valid session survives reload.

## UC02 — Manage User Accounts
Performed by: Lý Huỳnh Minh Đăng. Source review: Thái Kiệt (relayed by assignee; detailed findings unavailable). Reviewed by: Pending for restoration. Edited by: Codex (AI-assisted).

**Trace:** FR-01-2 and FR-01-3.

**Actor:** System Administrator. **Description:** Maintain staff accounts and role assignments. **Preconditions:** Administrator session and access to account administration. **Postconditions:** Accepted changes persist and eligible mutations produce audit entries.

**Basic flow:**

1. Open the account list and choose Create or Edit (S02-01).
2. Enter the identifier and select role and hub where required (S02-02).
3. Submit. The system validates and displays the updated account (S02-01).
4. To deactivate an account, select it, confirm the action, and inspect the resulting status (confirmation S02-03; result S02-06).

**Alternative flows:**

- **2a — Duplicate identifier or invalid fields:** Branch from basic step 2. Show validation next to the affected fields and retain input (S02-04).
- **3a — Missing required hub:** Branch from basic step 3. Show the hub validation error (S02-04).
- **4a — Own account:** Branch from basic step 4. Reject self-deactivation (S02-05).
- **1a — Wrong role:** Branch from basic step 1. Deny access (S01-05).

**Special requirements:** Administrator permissions here do not grant F02 access. Confirm deactivation impact on existing sessions and the exact business rules in FR-01.

## UC03 — Configure Hub
Performed by: Lý Huỳnh Minh Đăng. Source review: Thái Kiệt (relayed by assignee; detailed findings unavailable). Reviewed by: Pending for restoration. Edited by: Codex (AI-assisted).

**Trace:** FR-01-2 and FR-01-4.

**Actor:** System Administrator. **Description:** Maintain the assigned hub configuration. **Preconditions:** Administrator session and hub configuration access. **Postconditions:** Accepted settings persist and record a mutation in the audit log.

**Basic flow:**

1. Open the hub configuration for the current hub (S03-01).
2. Edit the approved attributes and save (S03-01).
3. Inspect the persisted settings and confirmation (S03-02).

**Alternative flows:**

- **1a — Wrong role:** Branch from basic step 1. Deny access (S01-05).
- **2a — Invalid setting:** Branch from basic step 2. Show the field error and retain input (S03-03).
- **2b — Deactivation with dependencies:** Branch from basic step 2. Show the blocking state for active users or orders, subject to the approved deactivation policy (S03-04).

**Special requirements:** FR-01-4 covers the operating hub and its service-area information. FR-06-4 keeps product scope to one operating hub and uses other hubs as authorization fixtures. Exact editable fields and the proposed deactivation workflow remain pending.

## UC04 — View Audit Log
Performed by: Lý Huỳnh Minh Đăng. Source review: Thái Kiệt (relayed by assignee; detailed findings unavailable). Reviewed by: Pending for restoration. Edited by: Codex (AI-assisted).

**Trace:** FR-01-2 and FR-01-5.

**Actor:** System Administrator. **Description:** Inspect recorded administrative activity. **Preconditions:** Administrator session and audit access. **Postconditions:** Matching entries display. Viewing and filtering leave audit entries unchanged.

**Basic flow:**

1. Open the read-only audit list (S04-01).
2. Enter approved filters and apply them (S04-01).
3. Review matching entries by actor, timestamp and action (S04-01).

**Alternative flows:**

- **1a — Wrong role:** Branch from basic step 1. Deny access (S01-05).
- **2a — Invalid date range:** Branch from basic step 2. Show the date error (S04-02).
- **3a — No matches:** Branch from basic step 3. Show an empty state with a way to clear filters (S04-03).

**Special requirements:** Use N18 as audit context. Its explicit scenarios cover guide publication, shift reassignment and delivery attempts in PA4/PA5. Confirm exact audited events and filter fields in FR-01.

## Prototype evidence
Performed by: Lý Huỳnh Minh Đăng. Source review: Thái Kiệt (relayed by assignee; detailed findings unavailable). Reviewed by: Pending for restoration. Edited by: Codex (AI-assisted).

The IDs in each step form the step-to-screen map. Shared access-denied state S01-05 is reused. The screenshots below show prototype states using synthetic data. The companion PDF contains these same prototype screens. Original-source review by Thái Kiệt was relayed by the assignee; detailed findings are unavailable. That source review does not approve this restoration, editorial changes or the supplementary screen. The 18 original PNGs remain unchanged. S02-06 was created by Codex with user authorization on 21 November 2026 to show the deactivation result missing from the original set; its human review is pending. All 19 screenshots use the shared 1440 × 900 desktop frame. This is prototype evidence, not evidence of implemented administration.

<!-- pagebreak -->

![S01-01 — Sign in](prototypes/UC01/S01-01.png)

S01-01 — Sign in.

<!-- pagebreak -->

![S01-02 — Dispatcher workspace](prototypes/UC01/S01-02.png)

S01-02 — Dispatcher workspace.

<!-- pagebreak -->

![S01-03 — Sign in](prototypes/UC01/S01-03.png)

S01-03 — Sign in.

<!-- pagebreak -->

![S01-04 — Access unavailable](prototypes/UC01/S01-04.png)

S01-04 — Access unavailable.

<!-- pagebreak -->

![S01-05 — 403 — Access denied](prototypes/UC01/S01-05.png)

S01-05 — 403 — Access denied.

<!-- pagebreak -->

![S01-06 — Session expired](prototypes/UC01/S01-06.png)

S01-06 — Session expired.

<!-- pagebreak -->

![S02-01 — Staff accounts](prototypes/UC02/S02-01.png)

S02-01 — Staff accounts.

<!-- pagebreak -->

![S02-02 — Create or edit staff account](prototypes/UC02/S02-02.png)

S02-02 — Create or edit staff account.

<!-- pagebreak -->

![S02-03 — Deactivate staff account?](prototypes/UC02/S02-03.png)

S02-03 — Deactivate staff account?.

<!-- pagebreak -->

![S02-04 — Check account details](prototypes/UC02/S02-04.png)

S02-04 — Check account details.

<!-- pagebreak -->

![S02-05 — Account remains active](prototypes/UC02/S02-05.png)

S02-05 — Account remains active.

<!-- pagebreak -->

![S02-06 — Account deactivated (AI-created supplementary prototype)](prototypes/UC02/S02-06.png)

S02-06 — Dispatcher account deactivated. AI-created supplementary prototype; human review pending. [Editable HTML source](prototypes/UC02/S02-06.html).

<!-- pagebreak -->

![S03-01 — Hub configuration](prototypes/UC03/S03-01.png)

S03-01 — Hub configuration.

<!-- pagebreak -->

![S03-02 — Hub configuration](prototypes/UC03/S03-02.png)

S03-02 — Hub configuration.

<!-- pagebreak -->

![S03-03 — Hub configuration](prototypes/UC03/S03-03.png)

S03-03 — Hub configuration.

<!-- pagebreak -->

![S03-04 — Hub deactivation blocked](prototypes/UC03/S03-04.png)

S03-04 — Hub deactivation blocked.

<!-- pagebreak -->

![S04-01 — Audit log](prototypes/UC04/S04-01.png)

S04-01 — Audit log.

<!-- pagebreak -->

![S04-02 — Audit log](prototypes/UC04/S04-02.png)

S04-02 — Audit log.

<!-- pagebreak -->

![S04-03 — Audit log](prototypes/UC04/S04-03.png)

S04-03 — Audit log.
