# Veylo — Project Plan & Build Plan
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).


**CS300: Introduction to Software Engineering | Group 09**
**Project Assignment 3 (PA3-2026) - Revised Deliverable A**
**Version 2.0-review | Updated: 19 November 2026 | Baseline: v1.6**

Revised from PA2 v1.6 to align with the Sprint 3 schedule and Vision v2.2-review. Section-by-section revisions are tracked in [Changes.md](../Changes.md).

## 1. Introduction
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

Veylo is a planned responsive web application for last-mile operations at one operating delivery hub in Vietnam. It combines order intake, shift coordination, separate delivery-attempt histories, and reusable location guides. When enabled, AI converts raw Vietnamese rider notes into structured drafts for Hub Dispatcher review before publication; it never publishes automatically or invents missing location details.

This revision keeps the v1.6 document structure and five-sprint roadmap, updates the Sprint 3 schedule and implementation status, and aligns later sprint scope with Vision v2.2-review. The repository currently holds the application foundation and Sprint 3 F02 scope; later business features remain planned for PA4 and PA5.

## 2. Project Overview
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).


### 2.1 Project Purpose & Goals
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

1. Support manual and CSV order intake, shift planning, rider assignment, attempt recording, and operational reporting.
2. Preserve raw field observations and uncertainty while preparing structured draft guides for dispatcher review.
3. Enforce separate Administrator, Hub Dispatcher, and Delivery Rider permissions; Administrator does not inherit dispatcher access.
4. Deliver verified increments across five course milestones (2-3 week sprint cadence).

### 2.2 Project Scope
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

#### In Scope (Core MVP)
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

The intended MVP comprises eight Functional Groups (FGs), aligned with Vision v2.2-review §5:

| FG ID | Functional Group | Operational Scope |
| :---: | :--- | :--- |
| **F01** | Account and Access Management | Role-Based Access Control (RBAC) across Administrator, Dispatcher, and Rider roles. |
| **F02** | Order Intake and Management | Manual single-order creation and CSV bulk import with schema validation. |
| **F03** | Shift Planning and Assignment | Delivery shift creation, order batching, and rider workload allocation. |
| **F04** | Delivery Attempt Execution | Sequential stop progression, simulated arrival, POD capture, and explicit failure recording. |
| **F05** | Rule-Based Next-Stop Suggestion | Explainable next-order recommendation based on delivery windows, priority, and constraints. |
| **F06** | Location Guides & Knowledge Review | Location micro-guide browsing, raw note submission, and dispatcher review/publication. |
| **F07** | AI-Assisted Note Normalization | AI-assisted normalization of supplied facts and uncertainty into drafts for human review. |
| **F08** | Shift and Rider Reporting | Shift completion metrics, attempt duration statistics, and exception analysis. |

Scope boundaries from the Vision Document: operations center on one hub (additional hubs serve only as authorization-test fixtures). Orders and individual delivery attempts remain separate records. Active riders may search published guides in their own hub outside a current shift, while raw notes, drafts, recipient details, access codes, order records, and POD photos stay excluded from shared guides. Delivery details follow assignment-based access. UC17 is retired/reserved; AI draft preparation sits inside UC18.

**Primary Integrated Workflow (planned):**
`Order Creation (F02) -> Shift Planning & Assignment (F03) -> Delivery Attempt (F04) -> Outcome Recording (F04) -> In-Field Note Submission (F06) -> AI Normalization (F07) -> Dispatcher Review & Publication (F06) -> Rider Guide Access (F06) -> Shift Reporting (F08).`

#### Out of Scope (Explicit Exclusions)
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

To keep delivery practical within semester constraints, the following features are excluded from the MVP:
- Native iOS/Android app store deployment and continuous background GPS tracking.
- Multi-vehicle Traveling Salesperson / Vehicle Routing Problem (VRP) optimization (heuristic sequencing is used instead).
- Telephony VoIP calling integration (standard HTML5 `tel:` link scheme is used instead).
- Live third-party logistics platform integrations (such as live GHN or Shopee Xpress APIs).
- Direct banking payment gateway or live Cash-on-Delivery (COD) reconciliation.
- Autonomous AI publishing without human dispatcher verification.

### 2.3 Deliverables Across Course Milestones
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

| Assignment | Deliverables | Target date / provenance | Observed delivery state |
| --- | --- | --- | --- |
| PA1 | Proposal, app survey, team/process setup | 24 Oct 2026 | Finalized and submitted. |
| PA2 | Project Plan, Vision, specification setup/report materials | 7 Nov 2026 (v1.6) | Submitted; full marks recorded. |
| PA3 | Revised Plan/Vision and shared Changes.md; use-case model and 18 UC specs with prototypes; full-stack F02 with minimum access guard and narrated demo video; Sprint 3 reports and AI log | **21 Nov 2026** | Foundation and Sprint 3 implementation/spec tasks tracked in §4.3. |
| PA4 | Architecture, F03/F04, deterministic F05 with N02 benchmark, workflow video | 11 Dec 2026 (target) | Planned; F05 moved from PA5 to match Vision v2.2-review. |
| PA5 | Full F01-F08 integration, F06/F07/F08, integration testing, and live demo | 28 Dec 2026 (target) | Planned; expands F01 beyond the PA3 minimum access subset. |

PA3 handout Sections A-F define the current deliverables, with `BOOYAH-29` coordinating final `Changes.md`, PDF exports, and packaging.

### 2.4 Assumptions & Constraints
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

- Approved stack: Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma. Leaflet/OSM mapping and external AI services remain planned integrations within the 0 VND project budget constraint.
- The v1.6 five-member capacity estimate of 8-10 hours per member per week is kept as a baseline planning assumption.
- Course staff approved using OpenSpec in place of GitHub Spec Kit (confirmed via Kiệt on 17 November 2026). Working [OpenSpec](../../openspec/), [constitution](../../constitution.md), and agent configuration sit at the repository root, while application code sits in [src](../../src/README.md).
- Demonstrations and tests use synthetic data only, without real recipient information or API secrets. Raw field notes, uncertainty flags, and dispatcher publication approval remain mandatory.

## 3. Project Organization
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

### 3.1 Team Structure and Roles
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

The table below retains the baseline role/SID assignments from v1.6; Sprint 3 per-ticket assignees and reviewers are listed in §4.3.

| Member Name | Student ID | Primary Lead Role | Primary Responsibilities & Functional Alignment |
| :--- | :---: | :--- | :--- |
| **Lý Huỳnh Minh Đăng** | 24127272 | Project Manager | Sprint coordination, Jira tracking, repository management, architecture alignment, and F01 RBAC access management. |
| **Trần Lê Hải** | 24127031 | Backend Lead | Database architecture (Prisma/PostgreSQL), RESTful API Route Handlers, data contracts, and F02 Order Management. |
| **Phạm Công Khánh** | 24127056 | Frontend & UI/UX Lead | Responsive UI architecture (Next.js/Tailwind), Figma design system, mobile rider viewports, and F03 Shift Planning. |
| **Nguyễn Thành Trung** | 24127257 | AI Integration Lead | AI prompt engineering, structured JSON schema guardrails, fallback pipelines, and F06/F07 Location Knowledge. |
| **Thái Kiệt** | 24127069 | QA & Testing Lead | Test planning, acceptance verification, Jira traceability, automated test fixtures, and F04/F08 Delivery & Reporting. |

### 3.2 Risk Management
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

R01-R07 carry over from v1.6 planning; R08-R10 capture Sprint 3 execution risks.

| Risk ID | Risk | Likelihood | Impact | Mitigation plan | Owner |
| --- | --- | --- | --- | --- | --- |
| R01 | Member unavailability | Medium | High | Keep handoffs small and reviewable; confirm capacity and pairing early | Đăng |
| R02 | Next.js/Prisma learning curve | Medium | Medium | Reuse Next.js 16.4.6 foundation and constitution; pair on schema/seed reviews | Hải |
| R03 | VRP scope creep | High | High | Keep deterministic F05 rules only; no fleet-wide optimization or ML prediction | Trung |
| R04 | External AI quota/network failure | Medium | High | Persist raw notes first and keep manual drafting fallback usable offline | Trung |
| R05 | Demo setup failure | Low | High | Use dedicated local PostgreSQL, synthetic seeds, and step-by-step setup checks | Kiệt |
| R06 | Specification drift | Low | High | Drive implementation through OpenSpec contracts and peer review | Khánh |
| R07 | Retry data corruption | Medium | Medium | Preserve Order and DeliveryAttempt separation in schema and tests | Kiệt |
| R08 | Compressed PA3 schedule | Medium | High | Reconcile Jira due dates and blockers at each Scrum check-in | Team |
| R09 | Export/package mismatch | Medium | High | Freeze reviewed Markdown first, then regenerate matching PDFs under BOOYAH-29 | Khánh |
| R10 | OpenSpec artifact placement | Low | High | Retain instructor approval record (17 Nov) and verify submitted artifact layout | Kiệt |

## 4. Project Plan
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

### 4.1 Scrum Process & Agile Governance
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

- Course cadence: five milestones on a 2-3 week sprint schedule. Each Weekly Report documents four meetings per sprint: Sprint Planning, two Weekly Scrums, and Sprint Review/Retrospective.
- Jira tracks task assignees and independent peer reviewers; human approval is required for ticket closure.
- Under [branch governance](branch-governance-proposal.md), task branches (`feature/**`, `fix/**`, `docs/**`) branch from `dev` and merge via squash PRs into `dev`, with milestone PRs from `dev` to `main`. Both `main` and `dev` require at least one approving human reviewer other than the author and passing checks.
- Feature work uses the root OpenSpec artifacts, constitution, and Next.js/Prisma stack.

### 4.2 Five-Sprint Roadmap Aligned with Jira
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

| Sprint | Timeline basis | Focus and milestone output | Task references |
| --- | --- | --- | --- |
| 1 / PA1 | 14-24 Oct 2026 | Proposal, app survey, team/process setup | PA1 baseline |
| 2 / PA2 | 27 Oct-7 Nov 2026 | Project Plan, Vision, initial specification and report setup | Submitted v1.6 |
| 3 / PA3 | Start 10 Nov; **submission 21 Nov** | Revised docs, use-case model and 18 UC specs/prototypes, F02 full stack, demo video, reports | BOOYAH-12 to 30 (§4.3) |
| 4 / PA4 | 27 Nov-11 Dec 2026 (provisional) | Architecture; F03/F04; **F05 implementation plus N02 benchmark**; workflow demo | PA4 backlog |
| 5 / PA5 | 14-28 Dec 2026 (provisional) | Full F01, F06/F07/F08, integration/testing, and final live demo | PA5 backlog |

Under Vision v2.2-review (selected 19 November), F05 implementation and the N02 latency benchmark are aligned together in PA4.

### 4.3 Detailed Upcoming Sprint Tasks (Sprint 3 — PA3)
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

Snapshot from Jira (`project = BOOYAH AND labels = PA3`) taken on **19 November 2026 at 02:49 UTC+7**:

| Jira key | Scope / exact task title | Assignee | Designated reviewer | Due date | Status (19 Nov) |
| --- | --- | --- | --- | --- | --- |
| [BOOYAH-12](https://thaikiet291006.atlassian.net/browse/BOOYAH-12) | [PA3][E][Setup] Merge OpenSpec into dev and scaffold the runnable Next.js + Prisma + PostgreSQL app | Kiệt Thái | Lý Huỳnh Minh Đăng | 2026-11-17 | In QA Review |
| [BOOYAH-13](https://thaikiet291006.atlassian.net/browse/BOOYAH-13) | [PA3][E][OpenSpec] Author the F02 order-intake change: proposal, spec, design and tasks | Khánh Phạm Công | Trần Lê Hải | 2026-11-18 | To Do |
| [BOOYAH-14](https://thaikiet291006.atlassian.net/browse/BOOYAH-14) | [PA3][Use Case][F04+F08] Specify and prototype delivery execution and reporting (UC11-UC13, UC19) | Trần Lê Hải | Nguyễn Thành Trung | 2026-11-20 | In Progress |
| [BOOYAH-15](https://thaikiet291006.atlassian.net/browse/BOOYAH-15) | [PA3][Use Case][F06+F07] Specify and prototype location guides and AI normalization (UC15-UC18) | Trung | Lý Huỳnh Minh Đăng | 2026-11-20 | To Do |
| [BOOYAH-16](https://thaikiet291006.atlassian.net/browse/BOOYAH-16) | [PA3][E][UI] Build the Dispatcher order screens for F02 | Đăng Lee TGB | Nguyễn Thành Trung | 2026-11-19 | To Do |
| [BOOYAH-17](https://thaikiet291006.atlassian.net/browse/BOOYAH-17) | [PA3][E][QA] Verify F02 end to end against the spec and archive the OpenSpec change | Trung | Trần Lê Hải | 2026-11-20 | To Do |
| [BOOYAH-18](https://thaikiet291006.atlassian.net/browse/BOOYAH-18) | [PA3][E][Auth] Seed role accounts, sign-in and server-side Dispatcher/hub guard for F02 | Đăng Lee TGB | Phạm Công Khánh | 2026-11-19 | To Do |
| [BOOYAH-19](https://thaikiet291006.atlassian.net/browse/BOOYAH-19) | [PA3][E][API] Implement F02 persistence, order API and CSV import | Khánh Phạm Công | Trần Lê Hải | 2026-11-19 | To Do |
| [BOOYAH-20](https://thaikiet291006.atlassian.net/browse/BOOYAH-20) | [PA3][Use Case][F02] Specify and prototype order intake use cases (UC05-UC08) | Trần Lê Hải | Phạm Công Khánh | 2026-11-19 | To Do |
| [BOOYAH-21](https://thaikiet291006.atlassian.net/browse/BOOYAH-21) | [PA3][Use Case][F03+F05] Specify and prototype shift planning and next-order recommendation (UC09, UC10, UC14) | Khánh Phạm Công | Trần Lê Hải | 2026-11-20 | To Do |
| [BOOYAH-22](https://thaikiet291006.atlassian.net/browse/BOOYAH-22) | [PA3][Use Case][F01] Specify and prototype access and administration use cases (UC01-UC04) | Đăng Lee TGB | Thái Kiệt | 2026-11-20 | To Do |
| [BOOYAH-23](https://thaikiet291006.atlassian.net/browse/BOOYAH-23) | [PA3][Plan] Revise the Project Plan to v2 with the real Sprint 3 schedule | Trung | Lý Huỳnh Minh Đăng | 2026-11-19 | In Progress |
| [BOOYAH-24](https://thaikiet291006.atlassian.net/browse/BOOYAH-24) | [PA3][Use Case] Build the use-case model, catalog and FR-to-UC traceability | Kiệt Thái | Lý Huỳnh Minh Đăng | 2026-11-20 | In QA Review |
| [BOOYAH-25](https://thaikiet291006.atlassian.net/browse/BOOYAH-25) | [PA3][Prototype] Create the shared prototype kit and screen-ID convention | Kiệt Thái | Nguyễn Thành Trung | 2026-11-17 | In QA Review |
| [BOOYAH-26](https://thaikiet291006.atlassian.net/browse/BOOYAH-26) | [PA3][Vision] Add numbered functional requirements and re-baseline the NFRs | Kiệt Thái | Trần Lê Hải | 2026-11-18 | In QA Review |
| [BOOYAH-27](https://thaikiet291006.atlassian.net/browse/BOOYAH-27) | [PA3][Vision] Strengthen positioning, alternatives/competitors and user environments | Đăng Lee TGB | Phạm Công Khánh | 2026-11-19 | To Do |
| [BOOYAH-28](https://thaikiet291006.atlassian.net/browse/BOOYAH-28) | [PA3][Report] Write the Sprint 3 Weekly Reports and AI Usage Report from real meetings and logs | Trung | Phạm Công Khánh | 2026-11-21 | To Do |
| [BOOYAH-29](https://thaikiet291006.atlassian.net/browse/BOOYAH-29) | [PA3][Package] Integrate Changes.md, export PDFs and assemble PA3-Group09.zip | Khánh Phạm Công | Thái Kiệt | 2026-11-21 | To Do |
| [BOOYAH-30](https://thaikiet291006.atlassian.net/browse/BOOYAH-30) | [PA3][E][Demo] Record and publish the narrated F02 demo video | Trần Lê Hải | Thái Kiệt | 2026-11-20 | To Do |

Sprint 3 implementation follows the dependency order: foundation and early F02 rules (`BOOYAH-12`, `BOOYAH-20`) -> F02 OpenSpec (`BOOYAH-13`) -> auth, API, and UI (`BOOYAH-18`, `BOOYAH-19`, `BOOYAH-16`) -> E2E QA (`BOOYAH-17`) -> demo video (`BOOYAH-30`) -> packaging (`BOOYAH-29`). Final Sprint 3 completion status is recorded in the Sprint Review (`WeeklyReports.md`).

### 4.4 Planned Tasks for Later Sprints (Sprints 4 & 5)
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

- PA4 (provisional window in §4.2): architecture diagrams; F03 shift/assignment and F04 individual attempt execution; deterministic F05 with the Vision N02 PA4 benchmark; rider viewport checks, attempt-history verification, and workflow demo video. Leaflet/OSM preview is planned here without continuous GPS tracking.
- PA5 (provisional window in §4.2): complete F01 administration beyond PA3 minimum sign-in/Dispatcher-hub guard; F06 published-guide access and dispatcher review; F07 raw-note normalization with uncertainty/manual fallback; F08 reporting separating orders from attempts; full F01-F08 integration and live demo.
- Guide authorization/publication, note/attempt concurrency checks, and real-AI evaluations (`N09-N12`) follow the Vision PA4/PA5 staging once those features exist.
- The v1.6 estimate of 50+ tests remains planning guidance rather than a PA3 requirement; test allocation across later sprints will be assigned in Sprint 4 planning.

### 4.5 Build Plan & Testing Schedule Across 5 Sprints
Performed by: Nguyễn Thành Trung / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex (AI-assisted).

Build labels from v1.6 are kept for milestone traceability:

| Build | Milestone / target | Scope and planned verification |
| --- | --- | --- |
| 0 / foundation baseline | PA1 / 24 Oct 2026 | Repository and Jira workflow setup. |
| 1 / specification baseline | PA2 / 7 Nov 2026 | Planning/Vision baseline; application scaffolded in Sprint 3 using root OpenSpec and Next.js 16.4.6. |
| 2 / F02 alpha | PA3 / 21 Nov 2026 | Full-stack F02 order intake/CSV/auth integration (`BOOYAH-13/16/18/19`), QA (`BOOYAH-17`), and narrated demo (`BOOYAH-30`). |
| 3 / dispatch and field beta | PA4 / 10 Dec 2026 (target) | F03/F04 workflows plus deterministic F05 and N02 benchmark; authorization and attempt-history checks. |
| 4 / release candidate | PA5 / 24 Dec 2026 (target) | Full F01-F08 integration, real-AI evaluation, manual fallback, and reporting checks. |
| 5 / final demo | PA5 / 28 Dec 2026 (target) | Final reviewed demo with seeded synthetic datasets (1,000 orders / 100 locations planning baseline). |

Application checks (unit/integration tests, lint, typecheck, build, and local PostgreSQL verification) follow [src/README.md](../../src/README.md). Section A review handoff evidence is kept in [Section A handoff evidence](pa3/ProjectPlan-Changes.md).
