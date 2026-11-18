# Veylo Engineering Constitution

**Project Identifier:** Group 09 — CS300 Introduction to Software Engineering\
**Application Name:** Veylo (Last-Mile Delivery Management & Crowdsourced Location Intelligence)\
**Target Milestone:** PA2 to PA5 (PA3 foundation, November 2026)\
**Spec Framework:** OpenSpec (`@fission-ai/openspec`)\
**Status:** Foundation scope approved by Kiệt; independent peer review pending

---

## 1. Project Scope & Architecture

1.1. **System Definition:** Veylo is a responsive web application designed for last-mile delivery hubs in dense urban environments (Vietnam). It connects three primary actors across three distinct subsystems:
- **Central Administration Subsystem (Admin Web):** System configuration, hub provisioning, role-based access control (RBAC), and global audit logging.
- **Delivery Hub & Dispatcher Subsystem (Dispatcher Web):** Manual/CSV order intake, dispatcher-controlled shift assignment, route overview, delivery-event monitoring without continuous GPS, and crowdsourced guide review.
- **Mobile Field Delivery Subsystem (Rider Mobile Web):** Touch-friendly sequential stop execution, turn-by-turn navigation link-out, digital proof-of-delivery (POD) capture, and in-field location note contribution.

1.2. **Architectural Gating:** Any feature or code contribution outside these three operational subsystems is strictly out-of-scope and prohibited.

---

## 2. Spec-First Principle (Specification-Driven Development via OpenSpec)

2.1. **The SDD Imperative:** From Sprint 3 onward, **no production code shall be authored without an approved specification**. All AI coding assistants (GitHub Copilot, Cursor, Claude Code, Codex, Antigravity) must be guided by approved OpenSpec artifacts rather than freestyle prompt engineering.

2.2. **OpenSpec Lifecycle Pipeline:**
1. **Constitution (`src/constitution.md` & `src/openspec/config.yaml`):** Non-negotiable architectural, technical, and quality constraints.
2. **Change Proposal (`src/openspec/changes/<change-name>/proposal.md`):** Problem definition, user stories, and strict scope boundaries initiated via `/opsx-propose`.
3. **Capability Specification (`specs/`):** Behavior-driven contracts using RFC 2119 keywords (`SHALL`, `MUST`) paired with testable scenarios (`WHEN ... THEN ...`).
4. **Design & Tasks Breakdown (`design.md` & `tasks.md`):** Technical component architecture and granular, single-assignee work items (maximum 2 hours per chunk) with explicit verification criteria.
5. **Implementation & Archival (`/opsx-apply` & `/opsx-archive`):** Code authoring strictly constrained by the task list, validated with automated tests and human review before delta specs merge into `src/openspec/specs/`.

2.3. **Scope Discipline:** If an edge case or new requirement arises during implementation, developers must update the OpenSpec delta proposal and obtain approval before altering code.

---

## 3. Technology Stack & Technical Standards

3.1. **Core Architecture & Language:**
- Language: **TypeScript** across the entire codebase (Frontend and Backend) ensuring end-to-end type safety.
- Framework: **Next.js 16.4.6 (App Router)** with **React** for server-side rendering, responsive web UI, and Route Handlers / Server Actions.
- Styling: **Tailwind CSS** for responsive, mobile-first utility styling.
- Mapping & Geolocation: **Leaflet.js** with **OpenStreetMap (OSM)** tiles for hub dispatch and rider route previews.

3.2. **Backend, Database & ORM Layer:**
- Service & API Layer: **Next.js Route Handlers** (Node.js runtime) providing clean, type-safe RESTful API endpoints.
- ORM (Object-Relational Mapping): **Prisma ORM** for declarative schema definition (`schema.prisma`), automated database migrations, and type-safe query generation.
- Database: **PostgreSQL** relational database hosting tables for hubs, users, orders, delivery attempts, and location guides.
- Data Exchange: Standardized JSON payloads adhering to OpenAPI 3.0 conventions.

3.3. **AI Pipeline Integration:**
- LLM Integration: A verified free/local provider, still to be selected, for unstructured delivery-note normalization (extracting parking tips, access codes, entry gates, and building caveats).
- Guardrails: Strict JSON schema enforcement, sanitization against prompt injection, and manual fallback preserving source notes and uncertainty.

---

## 4. Code Quality, Testing, and PR Governance

4.1. **Branching & Git Flow:**
- `main`: Production-ready, stable releases corresponding to official course PA submissions.
- `dev`: Active sprint integration branch.
- `feature/*`, `fix/*`, `docs/*`: Granular working branches cut from `dev`.

4.2. **Pull Request (PR) Mandate:**
- Direct pushes to `main` and `dev` are strictly forbidden.
- Every PR into `dev` must receive at least **one approving review** from a designated peer reviewer.
- Commits must strictly adhere to the **Conventional Commits** specification (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).

4.3. **Testing Standards:**
- Unit test coverage required for core business rules (e.g., status transitions, priority scoring, delivery attempt counters).
- AI prompt outputs must be validated with regression test suites covering typical Vietnamese delivery-note phrasing and slang.

---

## 5. MVP Boundaries & Risk Mitigation

5.1. **Explicit In-Scope Boundaries for Course MVP:**
- Deterministic next-stop suggestions and dispatcher-controlled stop sequencing.
- Single-device touch-optimized web UI for field riders (no native mobile app store deployment required).
- Proof-of-delivery by photo; detailed limits remain in the owner specification.
- AI-powered normalization of rider notes into structured hub knowledge.

5.2. **Explicit Out-of-Scope Exclusions (Mitigating Scope Creep):**
- Complex real-time multi-vehicle dynamic Vehicle Routing Problem (VRP) optimization (no fleet-wide optimizer).
- Telephony VoIP calling integration (direct tel-link URL scheme used instead).
- In-app payment gateway processing / COD banking integration (no banking or payment ledger added by this foundation).
