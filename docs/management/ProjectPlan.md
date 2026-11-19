# Veylo — Project Plan & Build Plan
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.


**CS300 — Introduction to Software Engineering | Group 09**
**Project Assignment 3 (PA3-2026) — Revised Deliverable A**
**Version 2.0-review | Updated: 19 November 2026 | Baseline: v1.6**

**Revision status:** Working review draft. Document checks are recorded in the Section A handoff; human acceptance remains pending; baseline human sign-off does not certify this revision. Trung is the task owner. The requesting member confirmed PA2 full marks and no feedback; all listed corrections are internal-review/current-information updates, not invented TA comments.

**Source record (verified 19 November 2026):** [submitted plan v1.6, 7 November](https://drive.google.com/file/d/1UIfF7g3XSgpKKJu6k9VisnWEKIj4hjvh/view), [PA3 handout](https://drive.google.com/file/d/1vpm_jCN9Q08evz_063eq3wLSnvbNkKul/view), [Weekly Reports guideline](https://drive.google.com/file/d/1Hh3bkvcX13Lj_XMCrESMrtxLb-5Lqw36/view), [Vision v2.2-review, 19 November](https://drive.google.com/file/d/1FGJ7CS2HvPsV1oz2lmePL8cSHBYwjGKH/view) and [its change record](https://drive.google.com/file/d/1XEPEiGuyVp5pO64I4s3JhaNHUiyusWI0/view). The plan/Vision/change record were downloaded again during this revision. The requesting member selected Vision v2.2-review for this plan and confirmed alignment to it on 19 November 2026. Accordingly F05 implementation and N02 measurement move to PA4. Independent Vision review remains pending; this selection does not certify BOOYAH-26/27 as accepted. Handout copies were previously retrieved from the supplied course folder. PA3 p.1 requires one shared Changes.md; p.4 requires English Markdown/PDF and section attribution. Weekly Reports p.1 specifies four meetings per sprint, including two Weekly Scrums.

**Input identity:** Submitted plan SHA-256: `c5c3b55bb0fc7b713e63a97c773de2364ab264aa06f865cededd17e4bc2dd510`. Vision SHA-256: `560ba312c20849e4b9fdeeb57feea740fda46308fce9d64378819b7ddc60cd62`. Vision change-record SHA-256: `d886614026d381df58108add8c837a301fd8466e7869e62d4b77635f33d2fd61`. Originals are compared outside the repository; temporary workstation paths are not submission links.

---

## 1. Introduction
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

Veylo is a planned responsive web application for last-mile operations at one operating delivery hub in Vietnam. It aims to combine order intake, shift coordination, separate delivery-attempt histories and reusable location guidance. The intended AI contribution normalizes raw Vietnamese rider notes into drafts for Hub Dispatcher review before publication; it does not publish autonomously or invent missing location facts.

This revision retains the submitted v1.6 structure and five-sprint roadmap, corrects current PA3 scheduling and implementation evidence, and aligns later scope with the member-selected Vision v2.2-review. The repository currently provides the application foundation; the business workflows below are planned, not delivered.

## 2. Project Overview
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.


### 2.1 Project Purpose & Goals
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

1. Support manual/CSV order intake, shift planning, rider assignment, attempt recording and operational reporting.
2. Preserve raw field observations and uncertainty while preparing structured draft guides for dispatcher review.
3. Provide separate Administrator, Hub Dispatcher and Delivery Rider permissions; Administrator does not implicitly inherit dispatcher access.
4. Deliver verified increments across five course milestones. The course cadence is 2–3 weeks; exact local sprint boundaries and capacity need confirmation. No test, meeting or validation is claimed merely by listing a goal.

### 2.2 Project Scope
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.


#### In Scope (Core MVP)
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

The intended MVP comprises eight planned Functional Groups (FGs), compared with Vision v2.2-review §5. These are scope references, not evidence of implemented functionality:

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

Scope boundaries from the selected Vision: one operating hub; other hubs are authorization-test fixtures. Orders and individual delivery attempts remain separate. Active riders may search their own hub's published guides outside a current shift; raw notes, drafts, recipient details, access codes, order records and POD do not belong in shared guides. Delivery details retain assignment-based access. UC17 is retired/reserved; AI draft preparation belongs to UC18. This plan references those rules without creating new acceptance criteria.

**Primary Integrated Workflow (planned):**
`Order Creation (F02) → Shift Planning & Assignment (F03) → Delivery Attempt (F04) → Outcome Recording (F04) → In-Field Note Submission (F06) → AI Normalization (F07) → Dispatcher Review & Publication (F06) → Rider Guide Access (F06) → Shift Reporting (F08).`

#### Out of Scope (Explicit Exclusions)
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

To ensure reliable delivery within semester constraints, the following features are strictly excluded from the MVP:
- Native iOS/Android app store deployment and background continuous GPS telemetry.
- Dynamic multi-vehicle Traveling Salesperson / Vehicle Routing Problem (VRP) optimization (heuristic sequencing used instead).
- Telephony VoIP calling integration (standard HTML5 `tel:` link scheme used instead).
- Live third-party logistics platform integrations (e.g., GHN, Shopee Xpress live APIs).
- Direct banking payment gateway or live Cash-on-Delivery (COD) reconciliation.
- Autonomous AI publishing without human dispatcher verification.

### 2.3 Deliverables Across Course Milestones
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

| Assignment | Deliverables | Target date / provenance | Observed delivery state |
| --- | --- | --- | --- |
| PA1 | Proposal, app survey, team/process setup | 24 Oct 2026, inherited v1.6 date | User reports finalized/submitted; no new historical acceptance audit |
| PA2 | Project Plan, Vision, specification setup/report materials | 7 Nov 2026, submitted v1.6 | User reports full marks/no feedback; this does not establish app scaffolding at that date |
| PA3 | Revised Plan/Vision and one Changes.md; use-case model/specifications with prototypes/screenshots; full-stack F02 with minimum access guard and narrated video; real reports and AI declaration | **21 Nov 2026**, Kiệt's recorded Jira confirmation; cutoff unknown | Foundation exists; actual per-ticket states in §4.3; package/export and acceptance pending |
| PA4 | Architecture, F03/F04, deterministic F05 and its N02 benchmark, workflow video | 11 Dec 2026, inherited planning target | Planned; F05 moved from PA5 to match selected Vision v2.2-review |
| PA5 | Full F01–F08 integration, F06/F07/F08, comprehensive testing and live demo | 28 Dec 2026, inherited planning target | Planned; full F01 follows the minimum PA3 access subset |

PA3 handout Sections A–F govern deliverables; BOOYAH-29 owns final shared Changes.md, PDF exports and package. A submission deadline does not establish the actual sprint-end date.

### 2.4 Assumptions & Constraints
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

- Approved foundation: Next.js/TypeScript/Tailwind, PostgreSQL and Prisma. Mapping through Leaflet/OSM and external AI remain planned integration work; no new provider/hosting decision is made here. Vision retains a 0 VND budget; provider/free-tier feasibility remains to be checked by the owning task.
- The v1.6 five-member capacity estimate of 8–10 hours per member/week is an inherited planning assumption, not a newly verified commitment.
- Kiệt confirmed instructor/TA approval for OpenSpec on 17 November 2026. Working [OpenSpec](../../openspec/), [constitution](../../constitution.md) and agent configuration are at the repository root; application code is in src. Submitted-artifact placement is separate; no instructor exception is asserted. See [setup evidence](../../src/README.md).
- Demonstrations and tests use synthetic data, without real recipient information or secrets. Preserving raw notes/uncertainty and dispatcher publication control remains required by the selected Vision.

## 3. Project Organization
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.


### 3.1 Team Structure and Roles
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

The table below preserves v1.6 role/SID planning for reference; it is not a new assignment or confirmation of current responsibilities. Actual PA3 assignees and reviewers are listed from Jira in §4.3. No team role or policy is reassigned by this revision.

| Member Name | Student ID | Primary Lead Role | Primary Responsibilities & Functional Alignment |
| :--- | :---: | :--- | :--- |
| **Lý Huỳnh Minh Đăng** | 24127272 | Project Manager | Sprint coordination, Jira tracking, repository management, architecture alignment, and F01 RBAC access management. |
| **Trần Lê Hải** | 24127031 | Backend Lead | Database architecture (Prisma/PostgreSQL), RESTful API Route Handlers, data contracts, and F02 Order Management. |
| **Phạm Công Khánh** | 24127056 | Frontend & UI/UX Lead | Responsive UI architecture (Next.js/Tailwind), Figma design system, mobile rider viewports, and F03 Shift Planning. |
| **Nguyễn Thành Trung** | 24127257 | AI Integration Lead | AI prompt engineering, structured JSON schema guardrails, fallback pipelines, and F06/F07 Location Knowledge. |
| **Thái Kiệt** | 24127069 | QA & Testing Lead | Test planning, acceptance verification, Jira traceability, automated test fixtures, and F04/F08 Delivery & Reporting. |

### 3.2 Risk Management
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

R01–R07 and their owner names are inherited v1.6 planning assignments; mitigation actions below are planned unless separately evidenced. They do not establish current team agreements or completed implementation.

| Risk ID | Risk | Likelihood | Impact | Planned mitigation / current evidence | Inherited owner |
| --- | --- | --- | --- | --- | --- |
| R01 | Member unavailability | Medium | High | Small reviewable handoffs; confirm capacity and pairing rather than assuming attendance or availability | Đăng |
| R02 | Next.js/Prisma learning curve | Medium | Medium | Reuse Next.js 16.4.6 foundation and constitution; business schema/seed and owner review remain pending BOOYAH-13/19 | Hải |
| R03 | VRP scope creep | High | High | Keep deterministic F05; no fleet-wide optimization or learned prediction; PA4 implementation/benchmark planned | Trung |
| R04 | External AI quota/network failure | Medium | High | Plan raw-note preservation and manual drafting fallback; provider candidates only, no implemented fallback or real-AI evaluation claimed | Trung |
| R05 | Demo setup failure | Low | High | Dedicated local DB, synthetic seed and walkthrough checks planned; Compose execution and independent N15 seeded setup remain unverified | Kiệt |
| R06 | Specification drift | Low | High | Use approved OpenSpec artifacts and human review; tooling existence does not prove training or every PR's compliance | Khánh |
| R07 | Retry data corruption | Medium | Medium | Preserve order/attempt separation in future design; F04 schema/tests are not implemented in this foundation | Kiệt |
| R08 | Compressed PA3 schedule and stale Jira | Pending assessment | High | Reconcile due dates/statuses at review; raise missed work without silently rescheduling | Pending team allocation |
| R09 | Review/export/package mismatch | Pending assessment | High | Review the exact revision, update Section A after fixes, then hand off to BOOYAH-29 for matching PDFs/package | Pending team allocation |
| R10 | OpenSpec eligibility and submission placement | Pending assessment | High | Eligibility confirmed through Kiệt on 17 Nov; retain evidence and verify submitted-artifact placement separately without claiming an exception | Pending team allocation |

## 4. Project Plan
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.


### 4.1 Scrum Process & Agile Governance
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

- Course cadence: five milestones, 2–3 weeks per sprint. Weekly Reports requires four meetings per sprint: planning, two Weekly Scrums, review/retrospective. Dates, attendance and reports must come from actual evidence; the old twice-weekly Tuesday/Friday schedule is not retained as an agreed policy.
- Jira records assignees and independent reviewers; actual acceptance requires their review, not an AI check or status inference.
- Existing [branch governance](branch-governance-proposal.md): task branches from dev using feature/**, fix/** or docs/**; squash task PRs into dev, merge milestone PRs from dev to main. Both long-lived branches remain protected. At least one approving human other than the author, resolved conversations and applicable checks are required. Settings were historically verified; no live protection audit is claimed here.
- Reuse root OpenSpec/constitution and the approved stack; do not infer completed training, business features or runtime tests from setup artifacts.

### 4.2 Five-Sprint Roadmap Aligned with Jira
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

| Sprint | Timeline basis | Focus and planned milestone output | Actual task references |
| --- | --- | --- | --- |
| 1 / PA1 | 14–24 Oct 2026, inherited historical window | Proposal, survey, team/process setup; user reports submitted | Historical inventory not re-audited |
| 2 / PA2 | 27 Oct–7 Nov 2026, inherited historical window | Plan/Vision/specification/report submission; do not backdate app bootstrap | Submitted v1.6; no fabricated Epic ID |
| 3 / PA3 | Start 10 Nov inherited; actual end unconfirmed; **submission 21 Nov** | Revised documents, use cases/prototypes, F02 full stack, video and factual reports | BOOYAH-12–30; complete snapshot in §4.3 |
| 4 / PA4 | 27 Nov–11 Dec 2026, provisional inherited window | Architecture; F03/F04; **F05 implementation plus N02 benchmark**; workflow demo | Later task allocation pending |
| 5 / PA5 | 14–28 Dec 2026, provisional inherited window | Full F01, F06/F07/F08, all-feature integration/testing and final demo | Later task allocation pending |

The windows are not new team commitments. Unsupported BOOYAH-EPIC-* identifiers are removed. On 19 November the requesting member explicitly selected Vision v2.2-review, resolving the inherited F05 PA5 / N02 PA4 conflict by aligning both to PA4, without weakening N02 or assigning another member's work. Independent Vision review and future Jira allocation remain pending.

### 4.3 Detailed Upcoming Sprint Tasks (Sprint 3 — PA3)
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

Snapshot: **19 November 2026, 02:49 Asia/Ho_Chi_Minh** (18 November 19:49 UTC; minute precision). Refreshed all six table fields from Jira during integration checking; all 19 rows remained unchanged. Query: `project = BOOYAH AND labels = PA3 ORDER BY key ASC`; one complete page (`isLast: true`); task descriptions were also read individually during the initial snapshot. The final refresh included descriptions for reviewer verification. Assignees are actual Jira account display names; designated reviewers retain their description wording. Due dates are date-only values, not cutoff hours. Refresh the full table at review time; Đăng must check three randomly selected rows before AC2 human acceptance.

| Jira key | Scope / exact task title | Assignee display name | Designated reviewer | Due date | Observed status |
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

**Repository observation:** local dev/HEAD `04ec211eb8d9835ed6190bd602d3c5e1c10f9711` contains foundation/root-layout PRs #6/#7 and cleanup #8. [Package metadata](../../src/package.json) pins Next.js 16.4.6; [Prisma schema](../../src/prisma/schema.prisma) contains no business models. [Setup documentation](../../src/README.md) describes historical checks, pending business seed/migrations and unverified Compose/N15 walkthrough. Those historical results were not rerun for this document revision. Application health reports application scope only and cannot establish database readiness or acceptance. No remote protection audit or hosted CI/deployment is claimed.

The main implementation handoffs are foundation/tooling (12) and early F02 rules (20) -> spec/design (13) -> auth/API/UI work (18/19/16) against approved contracts -> integrated QA (17) -> demo (30) -> packaging (29). A source task does not necessarily have to be Done before an agreed intermediate handoff; final integration/acceptance must still use actual combined behavior. All task states above are observations, not declarations that prerequisites or human reviews passed.

### 4.4 Planned Tasks for Later Sprints (Sprints 4 & 5)
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

- PA4 (provisional window in §4.2): architecture diagrams; F03 shift/assignment and F04 individual attempt execution; deterministic F05 with the unchanged Vision N02 PA4 benchmark. Plan rider viewport checks, attempt-history verification and workflow video. Leaflet/OSM preview is a planned integration, not an installed feature or evidence of continuous GPS.
- PA5 (provisional window in §4.2): complete F01 administration beyond PA3 minimum sign-in/Dispatcher-hub guard; F06 published-guide access and dispatcher review; F07 raw-note normalization with uncertainty/manual fallback; F08 reporting that separates orders from attempts. Integrate all F01–F08 and perform final demo/acceptance checks.
- Guide authorization/publication and note/attempt concurrency checkpoints follow Vision's PA4/PA5 staging after the relevant features exist; real-AI evaluation remains PA5. Mock fallback does not establish real AI capability. Do not choose providers or introduce thresholds here.
- The v1.6 target of 50+ tests is inherited planning guidance, not a course-mandated PA3 count or completed suite. Owners and exact test allocation remain to be agreed. This task does not implement later functionality or revise the Vision.

### 4.5 Build Plan & Testing Schedule Across 5 Sprints
Performed/edited by: Codex (AI assistance for Nguyễn Thành Trung). Human review: pending (designated reviewer: Lý Huỳnh Minh Đăng); human editing: pending.

Build labels are retained from v1.6 for traceability. Targets are planning goals; a row is not a passed build, tag, release or deployment.

| Build | Milestone / target | Scope and verification state |
| --- | --- | --- |
| 0 / historical foundation label | PA1 / 24 Oct 2026, inherited | Repository/Jira setup reference only; no claim Next.js/ESLint/TypeScript runtime existed then |
| 1 / historical specification label | PA2 / 7 Nov 2026, inherited | Submitted planning/tooling materials; current foundation/root layout merged later via PRs #6/#7. Root OpenSpec, not src/openspec; Next.js 16.4.6, not Next.js 14 |
| 2 / F02 alpha | PA3 / before **21 Nov submission**, exact freeze/cutoff pending | Foundation exists; planned order entry/CSV/database/access integration (13/16/18/19), QA (17), video (30). Old 23 Nov target removed as later than submission |
| 3 / dispatch and field beta | PA4 / 10 Dec 2026, inherited target | Planned F03/F04 plus F05 and unchanged N02 benchmark; workflow/authorization/history checks and video pending |
| 4 / release candidate | PA5 / 24 Dec 2026, inherited target | Planned all-feature integration, real-AI evaluation, fallback and reporting tests; no passing suite claimed |
| 5 / final demo | PA5 / 28 Dec 2026, inherited target | Planned reviewed demo artifact, synthetic data and demo accounts; inherited 1,000 orders/100 locations are dataset planning assumptions, not current seed output |

For future application changes, execute the actual test/lint/typecheck/build and dedicated-local-DB checks in [src/README.md](../../src/README.md); record results against the reviewed revision. Foundation records document historical checks, not fresh runs here. Current Prisma has no business models; db:migrate/db:seed intentionally fail pending BOOYAH-13/19. Docker Compose is configured but execution remains unverified; native PostgreSQL was used for historical verification. Independent N15 seeded clean-machine validation is pending. Application health cannot certify DB readiness.

For this documentation revision use row/structure/link/source checks and cross-document comparison; no runtime, DB, PDF or deployment result is claimed. [Section A handoff and acceptance evidence](pa3/ProjectPlan-Changes.md) records review preparation and remaining checks. BOOYAH-29 owns the single shared ledger, matching PDF exports/render checks and ZIP assembly; no export pipeline is introduced here.
