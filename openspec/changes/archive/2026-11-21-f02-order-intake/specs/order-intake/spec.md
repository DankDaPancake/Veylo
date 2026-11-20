## Purpose

Hub-scoped dispatcher intake and order maintenance with the minimum sign-in and authorization needed for the PA3 demo.

## ADDED Requirements

### Requirement: Validate new order data

The system SHALL require the following fields for manual creation and every CSV record (D-F02-1, UC05/UC06): `order_code`, `recipient_name`, `recipient_phone`, `delivery_address`, `window_start`, `window_end` and `weight_kg`. A trimmed code uses 1–40 ASCII letters/digits, underscores or hyphens. Trimmed names use 1–100 Unicode characters and addresses 5–255. A phone is 10 digits starting with 0. Weight is finite and greater than zero.

#### Scenario: Invalid new order

- **WHEN** a manual create request or CSV record omits `order_code` or the destination, contains an invalid phone, or has a non-positive weight
- **THEN** the operation reports field errors and leaves the saved data unchanged

### Requirement: Validate delivery windows and optional order metadata

The system SHALL validate delivery windows and optional order metadata (D-F02-1, UC05/UC06/UC08). A delivery window uses valid `YYYY-MM-DD HH:mm` values in `Asia/Ho_Chi_Minh`, and end is strictly after start. Priority defaults to NORMAL and accepts HIGH. Note is optional. Latitude and longitude must be omitted together or supplied within [-90, 90] and [-180, 180], respectively.

#### Scenario: Reversed window or incomplete coordinates

- **WHEN** the window ends at or before its start, or only one coordinate is supplied
- **THEN** the system reports the relevant field errors and leaves the saved data unchanged

### Requirement: Enforce order-code uniqueness

The system SHALL reject duplicate order codes under the approved hub and case rules (D-F02-2, UC05/UC06). The key is the authorized hub plus the trimmed, lowercase ASCII code. The same code in another hub is allowed.

#### Scenario: Duplicate order code

- **WHEN** an order code collides with another row in the same upload or an existing order in the same hub
- **THEN** the system identifies the conflicting code and does not create a duplicate, including when requests race

### Requirement: Apply the agreed CSV commit policy

The system SHALL report invalid CSV records by row and field and import valid files atomically (D-F02-3, UC06). Row numbers identify CSV records and count the header as record 1.

#### Scenario: Mixed valid and invalid records

- **WHEN** a dispatcher imports a valid record and a record with an invalid weight
- **THEN** the response identifies the bad row and its weight field, and neither record is persisted

### Requirement: Validate the CSV file format

The system SHALL validate the file before writing orders and make the accepted template available (D-F02-4, UC06). Accept only `.csv` encoded as UTF-8 with optional BOM, LF or CRLF, 1–500 data records and at most 1,000,000 bytes. Require unique header names for all D-F02-1 required fields. The only allowed extra columns are `priority,note,latitude,longitude`. Support valid quoted fields, including commas, escaped quotes and line breaks.

#### Scenario: Header missing a required column

- **WHEN** a CSV is empty, malformed, missing a required column, contains an unknown or duplicate header, or exceeds the file or row limit
- **THEN** the system reports the file-level problem and creates no orders

### Requirement: Restrict edits and cancellation by state

The system SHALL permit edits and cancellation only on NEW orders with a matching version (D-F02-5, UC08). Validate the editable fields using the D-F02-1 rules for those fields. Reject any edit that includes `order_code`, `hub_id`, status or audit fields. Cancellation requires a trimmed reason of 5–300 characters.

#### Scenario: Valid edit preserves order code

- **WHEN** a dispatcher submits valid editable fields and the current version for a NEW order without `order_code`
- **THEN** the system saves the edit and preserves the existing order code

#### Scenario: Cancellation is saved

- **WHEN** a dispatcher confirms cancellation with a valid reason and the current version for an eligible order
- **THEN** the same order remains accessible in its hub with status CANCELLED and its reason recorded

#### Scenario: Stale or forbidden mutation

- **WHEN** a dispatcher edits a stale order version, edits a cancelled order or cancels after another request has already cancelled it
- **THEN** the system reports a conflict and preserves the latest version

#### Scenario: Edit attempts to change identity

- **WHEN** a dispatcher submits an edit that includes `order_code`, `hub_id`, state or an audit field
- **THEN** the system rejects the edit and leaves the record unchanged

### Requirement: Keep order lifecycle separate from attempts

The system SHALL persist the agreed PA3 order states independently of delivery attempts (D-F02-6, UC05/UC06/UC08). NEW and CANCELLED are the PA3 order states. CANCELLED has no reverse transition.

#### Scenario: New intake succeeds

- **WHEN** the system accepts a valid manual submission or CSV record
- **THEN** the new order is visible as NEW after reload and no delivery attempt is created

### Requirement: Guard order access by session, role and hub

The system SHALL check session, role and permitted hub on every order page and endpoint (D-F02-7, UC01/UC05–UC08). Dispatcher access is hub-scoped. Rider and Administrator are denied access. The authenticated user and trusted hub are resolved server-side. Client-supplied hub IDs cannot grant access.

#### Scenario: Dispatcher signs in and out

- **WHEN** a dispatcher signs in with a valid account and opens the Orders page
- **THEN** the system grants scoped access for that session and sign-out removes it

#### Scenario: Authentication required

- **WHEN** an unauthenticated caller opens an order API, or an expired session calls that API
- **THEN** the API responds with 401 and discloses no order data

#### Scenario: Wrong role or hub

- **WHEN** a caller has a denied role or a permitted dispatcher requests an order outside their hub
- **THEN** the system returns 403 for the denied role or 404 for the out-of-hub resource without exposing order details

### Requirement: List and inspect permitted orders

The system SHALL list, filter and show details for orders visible in the authenticated hub (D-F02-8, UC07). Combine status, inclusive hub-local `window_start` calendar dates, and case-insensitive literal keyword matching on code, name or phone. Return at most 20 rows per page, ordered by `window_start` then `order_code` ascending, with total count and effective page.

#### Scenario: Filtered list

- **WHEN** a dispatcher requests a filtered list or moves to the next page
- **THEN** the result contains only matching orders in that hub in stable order and provides valid pagination information

#### Scenario: Page no longer exists

- **WHEN** the requested page exceeds the number of pages after applying filters
- **THEN** the system returns page 1 and the current total

#### Scenario: Open an order

- **WHEN** the dispatcher selects a permitted order
- **THEN** its details display the saved fields and current order state
