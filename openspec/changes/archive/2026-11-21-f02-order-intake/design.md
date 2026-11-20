## Context

BOOYAH-13 applies to the root OpenSpec workspace and the Next.js app under `src`. BOOYAH-20 handed off UC05–UC08, `F02-Business-Rules-Proposal.md` and the CSV samples. Phạm Công Khánh confirmed the rules and model for local work on 19 November 2026, and delegated the remaining implementation details. On 20 November, he confirmed that Thái Kiệt had approved in place of Trần Lê Hải; see the approval record below. The BOOYAH-18 branch now supplies the approved Hub/User and Better Auth models. Order and the shared initial migration remain BOOYAH-19 work.

## F02 contract

| Rule | PA3 contract |
| --- | --- |
| D-F02-1 | For manual creation and each CSV record, require `order_code` (ASCII letters/digits, underscore or hyphen, 1–40), `recipient_name` (1–100), `recipient_phone` (`0` followed by nine digits), `delivery_address` (5–255), `window_start`, `window_end` and finite positive `weight_kg`. Trim text and count Unicode characters for name and address. Use `YYYY-MM-DD HH:mm` in `Asia/Ho_Chi_Minh` for local inputs and require end strictly after start. Store timestamps as instants. `priority` defaults to `NORMAL`; the other accepted value is `HIGH`. `note` is optional. Accept `latitude` and `longitude` only as a pair in [-90, 90] and [-180, 180]. ASCII order codes make code comparison deterministic across APIs and the database. |
| D-F02-2 | Preserve the trimmed display code. Normalize it to lowercase ASCII and enforce uniqueness in PostgreSQL on hub plus normalized code. Reject duplicates within a file and against current records. The same code in another hub is allowed. |
| D-F02-3 | Validate every row, match same-hub codes and write the entire import in one transaction. Report the one-based CSV record number (header is record 1), field and reason without echoing recipient data. Report both occurrences of an in-file duplicate. If a competing write wins, roll back the import and report the conflicting code's source rows. |
| D-F02-4 | Accept `.csv` only, UTF-8 with optional BOM, LF or CRLF, quoted commas/newlines and escaped double quotes. Require 1–500 records and at most 1,000,000 bytes. Require unique names `order_code,recipient_name,recipient_phone,delivery_address,window_start,window_end,weight_kg`. Allow only these or known optional columns `priority,note,latitude,longitude`, in any order. Reject unknown/duplicate headers and wrong column counts. The sample template lists required columns first. |
| D-F02-5 | Edit recipient/contact, address, window, weight and optional metadata only while current status is `NEW`. Apply the D-F02-1 validation rules to editable fields. Reject an edit that includes `order_code`, `hub_id`, state or audit fields. Cancel only `NEW`, after confirmation with a trimmed 5–300-character reason. Retain the record and save the reason. Both writes require a matching version and check state and version in the same statement. |
| D-F02-6 | Persist `NEW` on create/import and permit only `NEW → CANCELLED` in PA3. Later business outcomes and the separate DeliveryAttempt lifecycle are outside this migration. |
| D-F02-7 | Permit only an authenticated Dispatcher with a trusted hub assignment. The guard derives the user ID and hub ID on the server. Return 401 without a valid session, 403 for denied roles or absent hub authorization and 404 for orders outside the authorized hub. No Administrator or Rider exception in PA3. |
| D-F02-8 | AND the filters. Match a case-insensitive literal keyword in code, recipient name or recipient phone. Apply inclusive local date bounds to `window_start` via a half-open interval ending at the day after the chosen end date. Sort by `window_start` then `order_code` ascending. Return 20 rows per page, total count and effective page. Reset an out-of-range page to page 1. |

## Shared data model

| Model | Fields and constraints |
| --- | --- |
| Hub | Primary key, unique code, display name. Owns order records and supplies Dispatcher hub membership. |
| User | Primary key, unique normalized email, role, optional hub association. The signed-off access policy determines which roles require hub membership. BOOYAH-18 confirms the session and credential contract before migration. |
| Order | Primary key, required Hub foreign key, display code, normalized code, recipient contact, address, delivery window, positive finite decimal weight, optional approved metadata, state, cancellation reason, version and timestamps. Unique on hub and normalized code. Index hub, delivery-window start and display code for scoped listing. |

Use an additive initial migration. Review constraints and validate on a disposable PostgreSQL instance, including seed replay and cross-hub fixtures. BOOYAH-19 owns the one shared migration and synthetic orders. BOOYAH-18 owns demo account fixtures using the shared schema and seed entry point. A second hub tests isolation. No schema or seed is applied by this design.

## Server contract

- BOOYAH-18 owns session and role enforcement. The F02 caller consumes a server guard returning either authenticated Dispatcher `{ userId, hubId }`, or a failure with status 401/403. Resolve the IDs from the verified session and current assignment. Never take order scope from headers or body fields supplied by the client.
- BOOYAH-19 wires `GET/POST /api/orders`, `GET/PATCH /api/orders/[id]`, `POST /api/orders/[id]/cancel` and `POST /api/orders/import`. Use hub criteria in every read and write. State and version checks belong in the same write as the update.
- Successful creates/imports return 201. Use `q`, `status`, `from`, `to`, and `page` for list query parameters. Import uses multipart field `file`. Edit accepts the editable fields and current `version`; cancellation accepts `{ reason, version }`. Validation returns 400 with field or row/column errors, missing session returns 401, denied role returns 403, absent or other-hub order returns 404, and write conflicts return 409.
- BOOYAH-16 uses the shared validation and API for list, create, import, detail and edit screens. Cancel requires confirmation with a reason. BOOYAH-17 exercises the combined build with demo sessions and a disposable database.

## Approval and rollback

### BOOYAH-18 auth contract (19 November)

The user approved the Better Auth Prisma schema. Use normalized email on User, the independently salted scrypt v1 hash on the credential Account, and PostgreSQL-backed Session. Verification is included for adapter compatibility. No User password hash column is introduced. BOOYAH-19 owns the shared migration.

The server guard accepts request headers and returns `{ ok: true, userId, hubId }`, `{ ok: false, status: 401, code: "UNAUTHENTICATED" }`, or `{ ok: false, status: 403, code: "FORBIDDEN" }`. Resolve current role and hub from persisted user data. Keep D-F02-7 unchanged. BOOYAH-19 owns the shared migration.

Demo account fixtures accept existing, distinct hub IDs from the shared seed. BOOYAH-18 supplies placeholder hub references only. The session is valid for up to eight hours and sign-out revokes it server-side. Public registration is disabled.

Phạm Công Khánh confirmed D-F02-1 through D-F02-8 and the Hub/User/Order model for local work on 19 November. On 20 November, he explicitly confirmed in the conversation that Thái Kiệt had approved in place of Trần Lê Hải. [PR #9](https://github.com/DankDaPancake/Veylo/pull/9) records Kiệt's approval on 19 November; the conversation supplies the reviewer-substitution confirmation. This resolves task 1.1's contract-review prerequisite for local implementation. It does not claim a separate review by Hải or approval of a future migration diff. The migration PR still requires normal human review and passing checks before merge. BOOYAH-18 supplies the guard source; combined runtime verification remains pending. If the development rehearsal fails, discard only its disposable database. A future rollback on shared data requires a backup and separate authorization.
