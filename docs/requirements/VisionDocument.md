# Veylo: Vision Document

Performed by: Trần Lê Hải (v1.6), Thái Kiệt / Codex (BOOYAH-26 v2.2-review), Lý Huỳnh Minh Đăng / Codex (BOOYAH-27 sections 2-4). Reviewed by: Phạm Công Khánh, Trần Lê Hải, and Group 09 (21 November 2026). Edited by: Antigravity (PDF integration assembly).

**CS300: Introduction to Software Engineering | Group 09**  
**PA3 Requirements Revision: Deliverable B (based on PA2 v1.6)**  
**Version 2.2-review + BOOYAH-27 integration | Updated: 21 November 2026 | Baseline: v1.6**

## 1. Introduction
Performed by: Trần Lê Hải. Reviewed by: Lý Huỳnh Minh Đăng. Edited by: Phạm Công Khánh.

This document defines the product vision for **Veylo**, a responsive web application for small urban delivery hubs in Vietnam. Veylo brings together order intake, shift planning, rider delivery execution, and location knowledge management in one zero-budget platform. An AI-assisted feature drafts structured access guidance from informal Vietnamese rider notes, while keeping dispatcher review mandatory before publication. The sections below set out the problem statement, stakeholders, product features, workflow diagrams, functional requirements, and measurable quality targets.

### 1.1 References
Performed by: Trần Lê Hải. Reviewed by: Lý Huỳnh Minh Đăng. Edited by: Phạm Công Khánh.

| Reference | Document Title | Description & Relevance |
| :---: | :--- | :--- |
| **[1]** | **PA1-Group09.pdf**: Project Proposal and Team Contract | Established Veylo project scope, three operational subsystems, eight functional groups, and comparative surveys of Giao Hàng Nhanh (GHN) and Routific. |
| **[2]** | **PA2-2026.pdf**: Project Assignment 2 Guidelines | Course requirements for Section B: Vision Document, positioning tables, 3-5 sentence feature descriptions, Mermaid workflow diagrams, and quantifiable NFRs. |
| **[3]** | **rup_vision_sp.docx**: Vision Document Template (Small Project) | Standard Rational Unified Process (RUP) structural template for small software engineering projects. |
| **[4]** | **Veylo Engineering Constitution** (`constitution.md`, repository root) | Repository engineering rules enforcing the TypeScript + Next.js 16 + PostgreSQL + Prisma ORM stack and OpenSpec specification-driven development. |

## 2. Positioning
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

### 2.1 Problem Statement
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

Small delivery hubs need a shared record of orders, assignments and delivery attempts. Riders also need access to practical location notes, such as entrances and parking instructions, when they approach a stop. The team hypothesizes that information spread across chats, spreadsheets and map pins can be hard to retrieve during a shift. The project has no measured time-saving baseline.

### 2.2 Product Position Statement
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

Veylo is a responsive web application for dispatchers and riders at small delivery hubs. It combines scoped order intake, shift assignment, attempt recording and location guides. AI may help prepare a draft from a rider's note. A dispatcher reviews the draft before it can become published guidance.

## 3. Stakeholders, users and alternatives
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

### 3.1 Stakeholder Summary
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

Hub Management sponsors and oversees hub operations. System Administrator is an application actor with administrative responsibilities defined by F01. Hub Dispatcher and Delivery Rider are the operational actors. Parcel recipients are affected by delivery outcomes and are stakeholders. They have no direct interaction in the proposed use-case model. Group 09 develops and documents the application. Course staff evaluate its engineering artifacts and demonstration.

### 3.2 User Summary
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

System Administrator, Hub Dispatcher and Delivery Rider are the three concrete roles. Staff User is abstract and represents common sign-in participation.

### 3.3 User Environment
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

| Actor | Device and setting | Connectivity, language and session |
| --- | --- | --- |
| System Administrator | Desktop or laptop in an office, using a modern desktop browser and the shared desktop prototype frame. | Typical office connectivity. Administrative pages require an authenticated, authorized session. Use the team's confirmed interface locale. |
| Hub Dispatcher | Desktop or laptop in the hub, using a modern desktop browser with space for forms and lists. | Normally on hub Wi-Fi or wired internet. Demo order data uses synthetic Vietnamese names and addresses. Reauthentication is required when a session expires. |
| Delivery Rider | Smartphone browser used while stopped, potentially outdoors in bright light. Use the shared mobile prototype frame. | Mobile data with possible gaps. Vietnamese notes and addresses remain readable. An interrupted request needs clear feedback. Session expiry requires reauthentication. |

The shared [prototype kit](../analysis-and-design/use-cases/prototypes/kit/index.html) uses a 1440 × 900 desktop frame, with a 1280 × 720 minimum baseline, for Administrator and Dispatcher. The Rider mobile frame is 360 × 800. The F02 Dispatcher UI uses English under G4. N17 targets Chrome, Firefox and Edge on desktop, and Android Chrome and Mobile Safari for rider views. Record actual browser versions when testing. N04 sets the rider baseline at 360 CSS px and targets at least 44 × 44 CSS px. N16 covers contrast and keyboard access to core actions. The BOOYAH-24 catalog models Staff User as an abstract sign-in actor shared by Administrator, Dispatcher and Rider.

Sources: [Vision 2.2-review](https://drive.google.com/file/d/1FGJ7CS2HvPsV1oz2lmePL8cSHBYwjGKH/view) and [BOOYAH-24 UseCaseModel](https://drive.google.com/file/d/1BJBcPWMsFNr-2qnKkTXYu7afLKCuFiAV/view).

### 3.4 Summary of Key Stakeholder and User Needs
Performed by: Trần Lê Hải (baseline). Reviewed by: Phạm Công Khánh (BOOYAH-27 revision). Edited by: Codex (wording alignment).

| Role / Stakeholder | Core Operational Need | Solution Feature in Veylo |
| :--- | :--- | :--- |
| **Dispatcher** | Efficiently batch and assign daily delivery orders without manual spreadsheet chaos. | Automated order ingestion (CSV/manual), shift creation, and rider assignment (F02, F03). |
| **Dispatcher** | Verify why delivery attempts fail and identify operational bottlenecks. | Detailed delivery attempt histories with distinct failure reasons and duration metrics (F04, F08). |
| **Dispatcher** | Maintain reliable hub knowledge without manually writing documentation from scratch. | AI-assisted draft generation that extracts key facts from rider notes for dispatcher review (F06, F07). |
| **Rider** | Quickly find building entrances, parking spots, and security rules at unfamiliar destinations. | Mobile access to verified location micro-guides attached to delivery addresses (F06). |
| **Rider** | Know which parcel to deliver next without complex manual sorting. | Contextual rule-based next-stop recommendation with transparent explanations (F05). |
| **Rider** | Log delivery attempts and submit quick field tips without extensive typing. | Touch-friendly sequential stop interface, photo POD upload, and informal raw note submission (F04, F06). |

### 3.5 Alternatives and Competition
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

| Alternative | What it does | Veylo comparison and trace |
| --- | --- | --- |
| Chat, spreadsheets and map pins | Team hypothesis recorded for the 19 November 2026 review draft. A dispatcher shares lists and riders use chat and pins for updates and directions. | A shared order and assignment record connects intake and shift planning (FR-02-1, FR-03-1). Reviewed guidance links a location to the delivery workflow (FR-06-1, FR-06-4). |
| GHN web portal | GHN documents manual order creation and Excel bulk entry for shops sending parcels through GHN. | Veylo's focus is coordinating the hub's own dispatcher/rider workflow and preserving attempt history (FR-02-1, FR-03-1, FR-04-5). [GHN help, accessed 2026-11-19](https://ghn.vn/blogs/app-va-web-ghn/huong-dan-tao-don-bang-web-ghn-ghn-express) |
| Routific | Routific documents dispatcher route publication and driver completion of stops using its mobile app. | Veylo proposes binding Vietnamese rider observations to location guides via dispatcher review and optional AI draft preparation (FR-06-2, FR-06-3, FR-07-1). [Routific help, accessed 2026-11-19](https://help.routific.com/en/articles/51-teammate-roles-and-permissions) |

## 4. Product Overview
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

### 4.1 Product Perspective
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

Veylo brings together staff access and administration, order intake, shift planning, delivery attempts, next-order suggestions, location guides, AI-assisted note drafting and shift reporting. PA3 implements F02 order intake and the supporting sign-in and authorization needed for its demo. Vision 2.2 scopes product operations to one hub. Additional hubs are synthetic authorization fixtures (FR-06-4). The F02 design uses synthetic order data and restricts order access to Dispatchers within their assigned hub.

### 4.2 Assumptions and Dependencies
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

Location guide quality depends on rider observations and dispatcher review. Notes remain usable for manual review if AI drafting is unavailable. Map tiles and language model access are external dependencies for later capabilities. Their availability and costs must be evaluated against the project budget.

## 5. Product Features
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Trần Lê Hải. Edited by: Phạm Công Khánh.

The Veylo MVP organizes the eight functional groups from PA1 into defined feature specifications. Each feature below is described in 3-5 sentences covering what it does, why the hub needs it, and who uses it.

### 5.1 Functional Group Descriptions

#### F01: Account and Access Management
Veylo handles sign-in and role-based access control for three staff roles: Administrator, Hub Dispatcher, and Delivery Rider. Server-side permission checks restrict each route and record by role and assigned hub, so riders only open their own deliveries while only dispatchers can plan shifts or publish guides. Separating administrative maintenance from daily dispatch and delivery work protects customer data and keeps account changes auditable. Hub administrators, dispatchers, and riders all depend on clear role boundaries and reliable sign-in behavior.

#### F02: Order Intake and Management
Hub dispatchers can enter single delivery orders through a form or upload batches from a UTF-8 CSV file. Before any record enters shift planning, the system checks required fields such as destination address, delivery window, parcel weight, and recipient phone number, and flags duplicate order codes within the hub. Catching bad rows and duplicate codes early avoids manual spreadsheet cleanup and stops incomplete orders from reaching a shift. Dispatchers spend less time fixing intake errors, and riders start shifts with complete delivery details.

#### F03: Shift Planning and Assignment
Dispatchers group validated orders into shifts and assign them to active riders based on parcel weight capacity and delivery area. The planning view lists stops and lets dispatchers adjust stop order and balance workloads before publishing the shift. Structured planning helps avoid overloaded shifts and gives both sides one published task list before couriers leave the hub. Dispatchers keep oversight of daily workload distribution, and riders receive clear, ordered assignments.

#### F04: Delivery Attempt Execution and Recording
Riders work through their assigned stops on a mobile web view and record when an attempt starts, when they arrive, and how the stop ends. Successful drops require an uploaded proof-of-delivery photo, while failed attempts require a structured reason code and optional or conditional notes. Storing each attempt separately from its parent order keeps an exact history across retries without closing the order too early. Riders get a clear record of field obstacles, and dispatchers can inspect failed stops and decide whether to re-dispatch or close them.

#### F05: Rule-Based Next-Order Recommendation
This module scores a rider's remaining open stops and suggests which delivery to handle next using deterministic rules. The rules weigh delivery window urgency, order priority, and proximity without relying on opaque machine learning models. Each suggestion displays a short plain-text reason, such as an upcoming delivery window deadline, and the rider can still pick a different eligible stop. Riders spend less time choosing their next stop on the road, and hubs improve on-time delivery performance.

#### F06: Location Guides and Knowledge Review
Veylo stores searchable location guides covering practical access details such as building entrances, parking spots, and security check-in rules. Riders can read published guides before arriving at a stop and submit raw field notes when they spot new constraints. Dispatchers compare drafts against raw notes, edit the text, and explicitly approve or reject guides before riders in the same hub can see them. Couriers navigate unfamiliar buildings faster, and the hub retains local access knowledge instead of losing it in chat threads.

#### F07: AI-Assisted Raw-Note Normalization
When enabled, an AI language service converts informal, shorthand Vietnamese rider notes into structured draft guides for dispatcher review. The draft keeps only facts present in the source note and flags missing or ambiguous details for human verification rather than guessing. If the external AI request fails or times out, the raw note stays saved so the dispatcher can write the draft manually. Dispatchers spend less time formatting repetitive notes, while riders still receive clear, checked instructions.

#### F08: Shift and Rider Reporting
Dispatchers use the reporting view to track shift progress, order completion rates, and per-rider metrics over a selected date range. The calculations keep order outcomes separate from individual delivery attempts so retried orders do not distort attempt counts or success rates. Reporting average attempt duration and top failure reasons from timestamped events makes recurring delays easier to spot. Hub dispatchers and management gain accurate numbers for reviewing shift execution and courier performance.

### 5.2 Mermaid Workflow Diagrams
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Trần Lê Hải. Edited by: Phạm Công Khánh.

#### Workflow 1: Order Dispatch and Delivery Execution Workflow

This workflow traces an order from intake and validation through shift assignment, field execution, attempt recording, and final shift reporting.

```mermaid
flowchart TD
    START([Start: Orders Ingested]) --> D1[Dispatcher creates or imports orders via CSV]
    D1 --> S1{Are order fields valid?}
    S1 -->|No| D2[Display validation errors & correct data]
    D2 --> D1
    S1 -->|Yes| S2[Persist validated Order records in PostgreSQL]
    S2 --> D3[Dispatcher creates Shift and assigns Orders to Rider]
    D3 --> S3[Publish shift assignments to Rider Mobile Web]
    S3 --> R1[Rider opens assigned shift and reviews delivery list]
    R1 --> S4[Show next-stop suggestion and published guide preview when available]
    S4 --> R2[Rider selects stop and initiates Delivery Attempt]
    R2 --> S5[Record Attempt start timestamp]
    S5 --> R3[Rider arrives at stop and records attempt outcome]
    R3 --> S6{Attempt outcome?}
    S6 -->|Success| S7[Upload photo POD & mark Attempt Successful]
    S6 -->|Failed| S8[Select failure reason & mark Attempt Failed]
    S7 --> D4[Dispatcher inspects updated attempt progress]
    S8 --> D4
    D4 --> S10{More assigned stops remaining in shift?}
    S10 -->|Yes| S4
    S10 -->|No| S9{Is any failed Order eligible for re-dispatch?}
    S9 -->|Yes: Retry policy| D3
    S9 -->|No: Terminal status| D5[Dispatcher reviews final Shift & Rider Performance Reports]
    D5 --> END([End: Shift Completed])
```

[Rendered PNG](diagrams/workflow-1.svg)

UC11 shows the available previews when the rider opens a published shift. The rider may open UC14 for the recommendation explanation or UC15 for the full guide. The shift list remains usable if either preview is unavailable.

After each recorded attempt the rider continues with the next assigned stop until no stops remain. Only then does the dispatcher resolve failed orders through re-dispatch or a terminal decision under FR-04-6. Successful orders do not pass through the re-dispatch decision.

#### Workflow 2: AI-Assisted Location Knowledge Management Workflow

This workflow shows how a rider's field note is captured, normalized into a draft, reviewed by a dispatcher, and published as a location guide.

```mermaid
flowchart TD
    START([Start: Rider observes physical access constraint]) --> R1[Rider submits raw note via Mobile Web]
    R1 --> S1[System persists raw note linked to Location entity]
    S1 --> S2[Trigger AI normalization job with JSON schema guardrails]
    S2 --> S3{Did AI processing succeed?}
    S3 -->|Yes| S4[Save structured AI draft as 'Unapproved']
    S3 -->|No / Timeout| S5[Log AI failure & route raw note to Manual Queue]
    S5 --> D1[Dispatcher drafts guide manually from raw note]
    S4 --> D2[Dispatcher compares raw note with AI draft on review console]
    D1 --> D2
    D2 --> D3{Dispatcher Review Decision}
    D3 -->|Edit| D4[Modify entrance, parking, or security details]
    D4 --> D2
    D3 -->|Reject| D5[Mark draft Rejected with feedback reason]
    D3 -->|Approve| S6[Publish approved Location Micro-Guide]
    S6 --> R2[Published guide becomes visible to active riders of its hub]
    R2 --> R3[Rider reads guide from an assigned stop or searches the hub library]
    R3 -.->|New observation / update| R1
    D5 --> END([End: Draft Archived])
    S6 --> END
```

[Rendered PNG](diagrams/workflow-2.svg)

### 5.3 Numbered functional requirements (BOOYAH-26)
Performed by: Thái Kiệt / Codex (BOOYAH-26 revision). Reviewed by: Trần Lê Hải and Group 09 (21 November 2026). Edited by: Antigravity.

The following IDs refine the existing eight groups. They are review-draft requirements, not evidence of implementation or peer acceptance. Source clauses retain baseline versus task-refinement provenance. Detailed policies listed in Changes.md remain unresolved.

Abbreviations used in the source lines: **V1** = Vision v1.6 (7 November 2026); **T06-T10** = owner tasks BOOYAH-22, BOOYAH-20, BOOYAH-21, BOOYAH-14 and BOOYAH-15 respectively; **SRC-xx-yy** = the source-clause identifier used in the use-case model coverage matrix.

#### F01 requirements

**FR-01-1 (Staff User).** The system SHALL authenticate active staff accounts for the Administrator, Dispatcher and Rider roles.

Source: SRC-01-01 / V1 §5.1 F01 (Baseline). UC: UC01. Delivery: PA3 minimum access; full administration later.

**FR-01-2 (Staff User).** The system SHALL enforce server-side role and resource authorization, restricting riders to assigned deliveries and shift planning and guide publication to dispatchers.

Source: SRC-01-02 / V1 §5.1 F01 (Baseline; cross-cutting). UC: UC01, UC02, UC03, UC04, UC05, UC06, UC07, UC08, UC09, UC10, UC11, UC12, UC13, UC14, UC15, UC16, UC18, UC19. Delivery: PA3 minimum access; full administration later.

**FR-01-3 (Administrator).** The system SHALL allow an authorized administrator to maintain staff accounts and role/hub assignments within the agreed account policy.

Source: SRC-01-03 / V1 §3.2, §4.1; T06 (Baseline; policy pending). UC: UC02. Delivery: PA3 minimum access; full administration later.

**FR-01-4 (Administrator).** The system SHALL allow an authorized administrator to configure the operating hub and service-area information.

Source: SRC-01-04 / V1 §3.2, §4.1; T06 (Baseline; breadth pending). UC: UC03. Delivery: PA3 minimum access; full administration later.

**FR-01-5 (Administrator).** The system SHALL allow an authorized administrator to inspect operational audit logs.

Source: SRC-01-05 / V1 §3.2, §4.1; T06 (Baseline). UC: UC04. Delivery: PA3 minimum access; full administration later.

#### F02 requirements

**FR-02-1 (Dispatcher).** The system SHALL allow a dispatcher to create a single delivery order manually.

Source: SRC-02-01 / V1 §5.1 F02 (Baseline). UC: UC05. Delivery: PA3.

**FR-02-2 (Dispatcher).** The system SHALL allow a dispatcher to import multiple delivery orders from a structured CSV file.

Source: SRC-02-02 / V1 §5.1 F02 (Baseline). UC: UC06. Delivery: PA3.

**FR-02-3 (Dispatcher).** The system SHALL validate required destination address, delivery window, parcel weight and recipient contact fields and display errors before invalid data enters shift planning.

Source: SRC-02-03 / V1 §5.1 F02 (Baseline; limits pending). UC: UC05, UC06, UC08. Delivery: PA3.

**FR-02-4 (Dispatcher).** The system SHALL allow a dispatcher to search and list permitted orders and inspect their details.

Source: SRC-02-04 / T07; V1 workflow 1 (Task proposal / refinement). UC: UC07. Delivery: PA3.

**FR-02-5 (Dispatcher).** The system SHALL allow a dispatcher to update or cancel an order subject to the agreed state and permission rules.

Source: SRC-02-05 / T07 (Task proposal / refinement). UC: UC08. Delivery: PA3.

#### F03 requirements

**FR-03-1 (Dispatcher).** The system SHALL allow a dispatcher to organize validated orders into shifts and assign active riders using capacity and service-area context.

Source: SRC-03-01 / V1 §5.1 F03 (Baseline). UC: UC09. Delivery: Later implementation; PA3 model/prototype.

**FR-03-2 (Dispatcher).** The system SHALL provide an interactive list and route overview for rebalancing workloads and changing stop order before shift publication.

Source: SRC-03-02 / V1 §5.1 F03 (Baseline). UC: UC09. Delivery: Later implementation; PA3 model/prototype.

**FR-03-3 (Dispatcher / Rider).** The system SHALL make a published shift and its assigned delivery work available to the assigned rider.

Source: SRC-03-03 / V1 §5.1 F03; workflow 1 (Baseline). UC: UC09, UC11. Delivery: Later implementation; PA3 model/prototype.

**FR-03-4 (Dispatcher).** The system SHALL allow a dispatcher to revise a published assignment subject to the agreed active-attempt and shift rules.

Source: SRC-03-04 / T08 (Task proposal / refinement). UC: UC10. Delivery: Later implementation; PA3 model/prototype.

#### F04 requirements

**FR-04-1 (Rider).** The system SHALL show the rider their assigned published shift, delivery list and stop details, including the next-stop suggestion and published guide preview when available, as soon as the rider opens the shift.

Source: SRC-04-01 / V1 §4.1; workflow 1 (Baseline). UC: UC11. Delivery: Later implementation; PA3 model/prototype.

**FR-04-2 (Rider).** The system SHALL record delivery-attempt initiation and arrival confirmation with timestamps.

Source: SRC-04-02 / V1 §5.1 F04 (Baseline). UC: UC12. Delivery: Later implementation; PA3 model/prototype.

**FR-04-3 (Rider).** The system SHALL allow a rider to record a successful delivery attempt with photographic proof of delivery.

Source: SRC-04-03 / V1 §5.1 F04 (Baseline). UC: UC12. Delivery: Later implementation; PA3 model/prototype.

**FR-04-4 (Rider).** The system SHALL allow a rider to record a failed attempt with a structured failure reason and comments.

Source: SRC-04-04 / V1 §5.1 F04 (Baseline). UC: UC12. Delivery: Later implementation; PA3 model/prototype.

**FR-04-5 (Rider / Dispatcher).** The system SHALL preserve each delivery attempt as a separate record linked to its parent order for audit and reporting.

Source: SRC-04-05 / V1 §5.1 F04 (Baseline). UC: UC12, UC13, UC19. Delivery: Later implementation; PA3 model/prototype.

**FR-04-6 (Dispatcher).** The system SHALL allow a dispatcher to monitor attempts and resolve failed orders through re-dispatch or an agreed terminal decision.

Source: SRC-04-06 / V1 workflow 1; T09 (Baseline; transition rules pending). UC: UC13. Delivery: Later implementation; PA3 model/prototype.

#### F05 requirements

**FR-05-1 (Rider).** The system SHALL suggest an assigned, unfulfilled delivery using deterministic rules based on time-window urgency, parcel priority and proximity.

Source: SRC-05-01 / V1 §5.1 F05 (Baseline; ranking rules pending). UC: UC11, UC14. Delivery: Later implementation; PA3 model/prototype.

**FR-05-2 (Rider).** The system SHALL explain a next-stop suggestion in understandable text while allowing the rider to select a different eligible stop.

Source: SRC-05-02 / V1 §5.1 F05; T08 (Baseline / task refinement). UC: UC14. Delivery: Later implementation; PA3 model/prototype.

#### F06 requirements

**FR-06-1 (Rider).** The system SHALL allow active riders to search and read published location guides for their own hub, including locations outside their current shift. Guides may cover entrances, parking and reception or security procedures.

Source: SRC-06-01 / V1 §5.1 F06 (Baseline). UC: UC15. Delivery: Later implementation; PA3 model/prototype.

**FR-06-2 (Rider).** The system SHALL persist a rider raw field note linked to its location before any AI normalization is attempted.

Source: SRC-06-02 / V1 §5.1 F06; workflow 2 (Baseline). UC: UC16. Delivery: Later implementation; PA3 model/prototype.

**FR-06-3 (Dispatcher).** The system SHALL allow a dispatcher to compare a guide draft with source notes, edit it and explicitly approve or reject it.

Source: SRC-06-03 / V1 §5.1 F06; workflow 2 (Baseline). UC: UC18. Delivery: Later implementation; PA3 model/prototype.

**FR-06-4 (Dispatcher / Rider).** The system SHALL restrict rider access to approved, published location guidance from the rider's own hub in shift previews, search and direct links. Shared guides exclude raw notes, drafts, recipient details, access codes, order records and proof-of-delivery photos. Delivery data remains subject to the assignment boundary in FR-01-2. The product scope remains one operating hub; other hubs appear only as authorization test fixtures.

Source: SRC-06-04 / V1 §5.1 F06; workflow 2 (Baseline; hub audience clarified 19 November). UC: UC11, UC15, UC18. Delivery: Later implementation; PA3 model/prototype.

#### F07 requirements

**FR-07-1 (Dispatcher).** The system SHALL prepare a structured guide draft from a Vietnamese source note using AI without inventing location facts.

Source: SRC-07-01 / V1 §5.1 F07; workflow 2 (Baseline; internal preparation). UC: UC18. Delivery: Later implementation; PA3 model/prototype.

**FR-07-2 (Dispatcher).** The system SHALL flag ambiguous or incomplete source context in the draft for human review.

Source: SRC-07-02 / V1 §5.1 F07 (Baseline). UC: UC18. Delivery: Later implementation; PA3 model/prototype.

**FR-07-3 (Dispatcher / Rider).** The system SHALL preserve the raw note and support manual drafting when AI processing fails or times out.

Source: SRC-07-03 / V1 §5.1 F07; workflow 2 (Baseline). UC: UC16, UC18. Delivery: Later implementation; PA3 model/prototype.

#### F08 requirements

**FR-08-1 (Dispatcher).** The system SHALL display shift progress and rider performance based on recorded operational events.

Source: SRC-08-01 / V1 §5.1 F08 (Baseline). UC: UC13, UC19. Delivery: Later implementation; PA3 model/prototype.

**FR-08-2 (Dispatcher).** The system SHALL distinguish order completion rates from delivery-attempt counts and rates in reports.

Source: SRC-08-02 / V1 §5.1 F08 (Baseline; formulas pending). UC: UC19. Delivery: Later implementation; PA3 model/prototype.

**FR-08-3 (Dispatcher).** The system SHALL report average attempt duration and frequent failure causes using the agreed event and aggregation definitions.

Source: SRC-08-03 / V1 §5.1 F08 (Baseline; event rules pending). UC: UC19. Delivery: Later implementation; PA3 model/prototype.

## 6. Non-Functional Requirements (NFRs)
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Trần Lê Hải. Edited by: Phạm Công Khánh.

These quality attributes set measurable constraints for architecture, performance, security, and usability. All targets are measured against an initial demonstration baseline ($E_1$: 4-core CPU, 8 GiB RAM; $D_1$: 1,000 synthetic orders, 2,000 delivery attempts, 100 locations; $D_2$: 40 synthetic Vietnamese delivery notes).

| ID | Quality Category | Quantifiable Requirement Specification | Verification Method |
| :---: | :--- | :--- | :--- |
| **N01** | **Web Performance** | 95th percentile ($p_{95}$) page load time for usable order list and detail views shall be $\le 2.0$ seconds; cold page load shall be $\le 4.0$ seconds on local broadband. | Automated browser performance profiling across 30 repeated load cycles. |
| **N02** | **Recommendation Latency** | The rule-based next-stop engine (F05) shall return evaluated rankings for 100 assigned orders in $\le 500$ ms at $p_{95}$. | Benchmark test executing deterministic rule fixtures against simulated order arrays. |
| **N03** | **Reporting Response** | Generation of shift summary and courier performance reports for 1,000 orders shall complete in $\le 2.0$ seconds at $p_{95}$ with zero count mismatches. | SQL query timing and automated oracle aggregation reconciliation tests. |
| **N04** | **Mobile Usability** | Rider mobile web views shall have zero horizontal scrolling on a 360 CSS-pixel viewport. All interactive touch targets (buttons, stop cards) shall be $\ge 44 \times 44$ CSS pixels. | Automated Cypress layout viewport assertions and manual touch-target inspection. |
| **N05** | **RBAC Authorization** | 100% of unauthorized API requests (e.g., rider attempting shift creation or guide approval) shall be rejected with HTTP 403 Forbidden across $\ge 24$ negative test scenarios. | Automated API test suite executing negative permission matrix across all endpoints. |
| **N06** | **Data Protection & Privacy** | Zero real customer personal data and zero API secrets shall exist in repository sources, fixtures, application logs, or AI prompt payloads. | Automated secret scanner (`git-secrets`) and synthetic data fixture audit prior to build release. |
| **N07** | **Data Integrity** | Zero duplicate logical completions and zero dropped raw notes across 100 concurrent submissions. Delivery attempts must maintain immutable relational integrity with orders. | Automated concurrency test injecting 50 parallel note writes and 50 attempt replays. |
| **N08** | **System Availability** | Core application shall achieve $\ge 99\%$ request success rate during a 30-minute demonstration. In-field manual workflows shall remain usable within $\le 10$ seconds of an AI failure. | Simulated continuous test session with fault injection disabling external AI APIs. |
| **N09** | **AI Factual Fidelity** | AI-generated guide drafts shall contain zero fabricated location facts not present in the rider source note; omission rate of stated access facts shall be $\le 10\%$. | Dual-reviewer scoring of 40 synthetic Vietnamese notes against normalized drafts. |
| **N10** | **AI Uncertainty Handling** | 100% of ambiguous or missing context elements in raw rider notes shall be flagged with uncertainty qualifiers rather than hallucinated facts. | Benchmark evaluation against 40 ambiguous note fixtures with reference ground-truth flags. |
| **N11** | **AI Drafting Efficiency** | Dispatchers using AI drafts shall achieve a median active review/editing time $\le 60$ seconds, representing a $\ge 20\%$ time saving compared to manual drafting. | Timed counterbalanced user study comparing manual drafting versus AI draft review. |
| **N12** | **AI Response Budget** | The AI normalization pipeline shall return a completed draft in $\le 15.0$ seconds at $p_{95}$, with an enforced timeout threshold of 20.0 seconds triggering manual fallback. | Monotonic timer logging of 40 consecutive normalization requests. |
| **N13** | **Publication Safety** | Zero unapproved or rejected guide drafts shall be visible to delivery riders across 20 adversarial edge-case scenarios (forged approvals, stale drafts, bypassed review). | Automated integration test verifying database publication status flags and rider view queries. |
| **N14** | **Zero-Budget Infrastructure** | Incremental third-party service expenditures shall equal 0 VND. 100% of core delivery and review workflows shall function with mock AI/OSM dependencies enabled. | Financial audit confirming zero paid subscriptions and isolated offline demo verification. |
| **N15** | **Setup Reproducibility** | Fresh setup from a cloned repository to a running local application with seeded synthetic data shall take $\le 30$ minutes following documented instructions. | Independent walkthrough conducted by a secondary team member on a clean workstation. |
| **N16** | **Standards Compliance** | Text elements shall achieve WCAG 2.2 Level AA contrast ratios ($\ge 4.5:1$ for standard text, $\ge 3:1$ for large headings). 100% of core actions shall be keyboard navigable. | Automated axe-core accessibility scanner and manual keyboard-only navigation audit. |
| **N17** | **Browser Compatibility** | Zero blocking JavaScript or layout errors across Google Chrome, Mozilla Firefox, Microsoft Edge (Desktop), and Android Chrome / Mobile Safari (Mobile). | Cross-browser compatibility matrix testing on current stable releases. |
| **N18** | **Audit Traceability** | 100% of guide publications, shift reassignments, and delivery attempt logs shall retain immutable user ID, timestamp, and action type records. | Automated database audit log assertion on all mutating administrative operations. |


### 6.1 Measurement conditions and delivery checkpoints
Performed by: Thái Kiệt / Codex (BOOYAH-26 revision). Reviewed by: Trần Lê Hải and Group 09 (21 November 2026). Edited by: Antigravity.

All 18 thresholds and original verification methods above are preserved verbatim from v1.6. Checkpoints indicate when evidence can exist; they do not relax a target or record a passing test. E1/D1/D2 retain their source definitions.

**N01: PA3 F02; repeat after integration.** E1/D1; record browser, commit, network and cold/warm cache. Usable means list/detail data and core actions available; measure 30 cycles and report percentile definition.

**N02: PA4 F05.** E1; fixed 100-order fixtures with deterministic ranking oracle; measure engine wall-clock time, excluding unrelated UI.

**N03: PA5 F08.** E1/D1; compare all totals to an independent aggregation oracle; include retries and boundary dates; report query/API timing boundary.

**N04: PA3 prototype; PA4 rider runtime.** 360 CSS px at 100% zoom; inspect each rider view, focus state and long content; CSS pixels rather than screenshot pixels.

**N05: PA3 F02 subset; full matrix when endpoints exist.** At least 24 authenticated-but-forbidden role/resource cases across final endpoints. Missing/expired authentication is separately tested as 401; it is not counted as a 403 case.

**N06: Every phase.** Scan tracked/untracked deliverables, fixtures, logs and actual prompt payloads before sharing; synthetic people/locations only.

**N07: PA4/PA5 after note and attempt features.** 50 simultaneous note writes and 50 replayed attempt submissions against isolated PostgreSQL; reconcile accepted unique notes/completions and parent links after completion.

**N08: PA5 integrated demo.** 30-minute session on recorded environment and request mix; count core-request successes/total. Inject AI timeout/network failure and time return to usable manual workflow.

**N09: PA5 real AI evaluation.** D2: 40 synthetic Vietnamese notes; two independent reviewers label source facts and omissions. Mock output is not evidence of AI capability.

**N10: PA5 real AI evaluation.** 40 ambiguous fixtures with human reference flags; count correctly flagged ambiguity/missing-context elements against all expected elements.

**N11: PA5 human study.** Same tasks counterbalanced between manual and AI-assisted review; record participant count, active time and paired comparison. No invented participant data.

**N12: PA5 real AI integration.** 40 consecutive requests with monotonic end-to-end timers; report provider/model/network and timeouts separately. Paid requests require separate approval; 0 VND budget remains.

**N13: PA4/PA5 guide integration.** 20 adversarial authorization/publication cases including forged approval, rejected/stale draft and direct rider requests; verify API and UI exposure.

**N14: Every phase; full offline demo PA5.** Record actual free service usage. Disable external AI/map access and exercise core manual workflows with deterministic mocks; this does not pass N09-N12.

**N15: PA3 after BOOYAH-19 supplies schema/seed.** Independent member starts from clean clone, follows pinned versions and reaches running app plus synthetic seed within 30 minutes. Foundation smoke alone is not this test.

**N16: PA3 F02; expand with every feature.** Check text/background pairs including errors/disabled context and every core action using keyboard only; run axe-core on implemented pages.

**N17: PA3 desktop F02; full rider matrix PA4/PA5.** Record exact current stable versions and physical/emulated device coverage. Desktop Chromium automation alone does not establish Firefox or Mobile Safari compatibility.

**N18: PA4/PA5 after relevant mutations exist.** For every publication, reassignment and attempt action, assert actor ID, timestamp, action and protected history. Authentication identity comes from the session, not client input.


### 6.2 Revision and acceptance

BOOYAH-26 revision 2.2-review, 19 November 2026, based on v1.6. Reviewed and accepted by Group 09 on 21 November 2026. The attribution in earlier sections applies to the v1.6 baseline and BOOYAH-27 integration. See [the change record](../Changes.md) and [the use-case model](../analysis-and-design/use-cases/UseCaseModel.md). Revision 2.2 corrects reference [4] and edits §2.1, §3.1, §3.5 and §4.2 as listed in the change record. It also extends workflow 1 with a loop over the remaining stops.
