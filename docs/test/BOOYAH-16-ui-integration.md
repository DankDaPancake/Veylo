# BOOYAH-16 — F02 UI integration checks
Performed by: Codex (AI-assisted verification handoff). Reviewed by: pending. Edited by: Codex.

The UI was integrated with the BOOYAH-18/19 API from dev at `b220ccb`. The production build used a fresh disposable PostgreSQL database and synthetic fixtures. The table tracks full walkthrough evidence.

| Use case | Screen IDs | API and evidence to capture |
| --- | --- | --- |
| UC05 Create Order | S05-01 | Submit valid and invalid form input and a duplicate code. Compare the UI field feedback with the API response and the refreshed list. |
| UC06 Import Orders | S06-01 | Upload a valid CSV and a CSV with an invalid or duplicate row. Capture row-level feedback and confirm the unsuccessful file adds no orders. |
| UC07 Browse Orders | S07-01, S07-02 | Exercise combined filters, empty result, page changes and detail loading. Confirm list pagination metadata and the detail response shape. |
| UC08 Edit or Cancel Order | S08-01, S08-03 | Exercise successful edits and cancellation, invalid reasons and stale versions. Confirm the UI can reload after 409 and that a cancelled order is retained. |

The UI uses the merged list envelope and page size, splits field and CSV record errors, and downloads the guarded server template. Reuse both Dispatcher fixtures for hub isolation and check anonymous, Rider and Administrator API responses separately from the page guard.

## Local results on 20 November 2026
Performed by: Codex (AI-assisted verification). Reviewed by: pending. Edited by: Codex.

- Lint, typecheck, production build and 16 unit tests passed. Migration and seed on an empty disposable database created two hubs, four demo accounts and 50 orders.
- Browser smoke checks observed 20 list rows, a field-level invalid phone error with input retained, create/filter/detail, edit/cancel, and an invalid and valid CSV import. The template link points to the guarded API endpoint.
- Full screenshot evidence, browser console and keyboard checks, and Hải's acceptance of prototype differences remain pending.
- The API suite passed role, hub and session subtests. The initial run exposed a date boundary issue with the PostgreSQL cluster using Asia/Bangkok. An order created at the minimum UTC-supported date was stored as a BC value and returned a null start timestamp. The first UTC retry reused those fixtures and therefore also failed the sorting assertion.
- Fresh UTC database retest passed all 10 Node test records, including 9 subtests. This does not establish correctness on non-UTC PostgreSQL sessions. OpenSpec auth tasks 2.1–2.2 were checked based on the passing auth evidence. UI tasks 3.1–3.2 remain open pending the full walkthrough.

## Manual capture handoff
Performed by: Lý Huỳnh Minh Đăng (manual capture pending). Reviewed by: pending. Edited by: Codex (AI-assisted).

Use Chrome at 1440 × 900 and 100% zoom. Sign in as the documented Dispatcher A demo account. Capture the actual UI and record the revision, browser version, expected result, observed result and PNG path. Place images under f02-ui/evidence/UC05 through UC08. For UC05 use a new code beginning QA-UI-MANUAL. Run the invalid CSV before the valid CSV. In the invalid file, even QA-UI-CSV-REJECT-01 must remain absent. In the valid file, both QA-UI-CSV-OK codes should persist after reload.

- [Valid CSV (two orders)](f02-ui/fixtures/manual-valid.csv)
- [Invalid CSV (third CSV record has an invalid phone)](f02-ui/fixtures/manual-invalid.csv)

### Prototype differences awaiting review
Performed by: Codex (source comparison). Reviewed by: pending. Edited by: Codex.

- UC05 shows a success notice on the list after create. The prototype opens S07-02-created. The UI keeps form values and displays field errors inline, while the prototype also focuses an error summary with links.
- UC06 submits a file directly to the atomic import endpoint. The prototype shows a read-only preview and separate confirmation, with distinct result and cancellation screens. The merged API exposes the atomic import endpoint. The prototype's preview rule is pending re-review in the BOOYAH-20 matrix.
- Capture actual states and identify any additional differences. Full walkthrough, screenshots, keyboard and console results, and Hải's review remain pending.

The capture build was prepared from dev bb8a3fb with the BOOYAH-16 changes. Clean install, Prisma validate/generate, lint, typecheck, 16 unit tests, production build, OpenSpec strict and 10 integration tests passed. The manual preview uses a separate UTC copy of the original seed. Dispatcher A sees 25 orders, with 20 on the first page.

The capture build now uses the BOOYAH-20 desktop layout for Orders, including the sidebar, map-style background, filter panel, order table, status badges and form cards.
