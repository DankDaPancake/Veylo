# app-foundation Specification

## Purpose

Provide local application startup and read-only database connectivity verification for the approved BOOYAH-12 foundation.

## Scope and subsequent integration

This capability records the BOOYAH-12 bootstrap contract. The model-free migration/seed refusal scenario applies before BOOYAH-13/19 schema approval. The approved F02 integration now provides real migrations, synthetic seed, authentication and business tables under the separate order-intake specifications; this historical scenario does not require disabling them. SELECT 1 remains read-only even when approved business tables already exist. Application health does not certify authentication or database readiness. On application commit5d67ce8 checked on21November2026, home renders without database credentials while its later auth-session widget returns HTTP500; that observed limitation is retained in the [archive verification evidence](../../../docs/test/app-foundation-archive/README.md).

## Requirements

### Requirement: Reproducible local application
The foundation SHALL provide pinned install, development, production build, lint, typecheck and test commands under src.

#### Scenario: Start the application without database credentials
- **WHEN** a developer installs locked dependencies and starts the app without DATABASE_URL
- **THEN** the home page renders and GET /api/health returns HTTP 200 with status ok, service veylo and scope application
- **AND** it does not claim database or business-feature readiness

### Requirement: Read-only database connectivity check
The foundation SHALL verify PostgreSQL connectivity through Prisma using SELECT 1 without creating business tables.

#### Scenario: Database reachable
- **WHEN** DATABASE_URL identifies the dedicated reachable PostgreSQL database
- **THEN** db:check exits zero and prints a connection-check success message
- **AND** no business schema or seed is created

#### Scenario: Database unavailable
- **WHEN** PostgreSQL cannot be reached or the probe times out
- **THEN** db:check exits nonzero within its bounded timeout with a credential-free diagnostic

### Requirement: Safe environment validation
The foundation SHALL reject missing, malformed and non-PostgreSQL connection URLs without exposing their contents.

#### Scenario: Missing configuration
- **WHEN** DATABASE_URL is absent or blank
- **THEN** the validator reports that DATABASE_URL is required without starting a database process

#### Scenario: Invalid protocol or malformed URL
- **WHEN** DATABASE_URL is not a well-formed postgresql or postgres URL with a host and database path
- **THEN** the validator rejects it without printing its username, password or raw value

### Requirement: Honest schema handoff
The foundation SHALL distinguish connection verification from the pending business schema, migrations and seed.

#### Scenario: Migration or seed requested before schema approval
- **WHEN** a developer invokes db:migrate or db:seed in the model-free foundation
- **THEN** the command exits nonzero and names BOOYAH-13/19 as the required schema/seed handoff
- **AND** it does not create a placeholder model or claim seeded orders
