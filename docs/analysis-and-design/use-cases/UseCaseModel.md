# Veylo - Use-Case Model
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

**Group 09 | PA3 Section C | BOOYAH-24 | Version 0.2 | 17 November 2026**

This document defines the Veylo Use-Case Model for PA3 Section C: 18 active user-goal use cases across five Mermaid views, FR-to-UC traceability coverage, shared terminology, and state vocabulary.

## 1. Scope and evidence
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

Veylo is a responsive web application for delivery-hub staff. This model covers all eight Vision functional groups at specification and prototype level. The PA3 implementation slice covers F02 order intake plus minimum sign-in and Dispatcher/hub authorization; modeling F03-F08 covers analysis and design only.

Sources: [VisionDocument.md](../../requirements/VisionDocument.md) (PA3 integrated revision of v1.6 + BOOYAH-26/27), PA3 handout Sections C/D, and owner specifications in [UC-F01-Access.md](UC-F01-Access.md), [UC-F02-Orders.md](UC-F02-Orders.md), [UC-F03-F05-Shifts.md](UC-F03-F05-Shifts.md), [UC-F04-F08-Delivery-Reporting.md](UC-F04-F08-Delivery-Reporting.md), and [UC-F06-F07-Guides.md](UC-F06-F07-Guides.md).

## 2. Actors and system boundary
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Actor | Participation / boundary |
| --- | --- |
| Staff User (abstract) | Common sign-in actor, specialized by Administrator, Dispatcher and Rider. It is not a fourth login role and grants no additional permissions. |
| Administrator | Manage staff accounts, configure the operating hub and inspect audit records. No implicit permission to perform dispatcher goals is inferred. |
| Dispatcher | Intake/manage hub orders, plan assignments, monitor attempts, resolve failed orders, review/publish guides and view reports. |
| Rider | View assigned published work, record delivery attempts, request recommendations, read published guides and submit raw notes. |
| AI Language Service (secondary) | External normalization service participating in draft preparation inside UC18. It cannot approve or publish a guide. |

Recipients and hub management are stakeholders, not additional actors without a direct interaction specified in scope. The database, scheduler, validation and logging are internal parts of Veylo. OSM is a supporting map dependency; this model does not invent an external routing/geocoding goal or recipient portal.

<!-- pagebreak -->

## 3. Use-case catalog and ownership
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

IDs remain stable for cross-team handoff. UC17 is reserved as a retired draft ID, not reused. Its AI preparation behavior is covered by UC18 and the resilient note handoff from UC16. This is a modeling proposal for review, not removal of F07.

### Access and order intake
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| ID / goal | Primary actor | Group / owner task |
| --- | --- | --- |
| **UC01** Sign In | Staff User | F01 / [BOOYAH-22](https://thaikiet291006.atlassian.net/browse/BOOYAH-22) |
| **UC02** Manage User Accounts | Administrator | F01 / [BOOYAH-22](https://thaikiet291006.atlassian.net/browse/BOOYAH-22) |
| **UC03** Configure Hub | Administrator | F01 / [BOOYAH-22](https://thaikiet291006.atlassian.net/browse/BOOYAH-22) |
| **UC04** View Audit Log | Administrator | F01 / [BOOYAH-22](https://thaikiet291006.atlassian.net/browse/BOOYAH-22) |
| **UC05** Create Order Manually | Dispatcher | F02 / [BOOYAH-20](https://thaikiet291006.atlassian.net/browse/BOOYAH-20) |
| **UC06** Import Orders from CSV | Dispatcher | F02 / [BOOYAH-20](https://thaikiet291006.atlassian.net/browse/BOOYAH-20) |
| **UC07** Search and View Orders | Dispatcher | F02 / [BOOYAH-20](https://thaikiet291006.atlassian.net/browse/BOOYAH-20) |
| **UC08** Update or Cancel Order | Dispatcher | F02 / [BOOYAH-20](https://thaikiet291006.atlassian.net/browse/BOOYAH-20) |

### Planning, delivery and knowledge
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| ID / goal | Primary actor | Group / owner task |
| --- | --- | --- |
| **UC09** Plan Delivery Shift | Dispatcher | F03 / [BOOYAH-21](https://thaikiet291006.atlassian.net/browse/BOOYAH-21) |
| **UC10** Adjust Shift Assignment | Dispatcher | F03 / [BOOYAH-21](https://thaikiet291006.atlassian.net/browse/BOOYAH-21) |
| **UC11** View Assigned Shift and Deliveries | Rider | F04 / [BOOYAH-14](https://thaikiet291006.atlassian.net/browse/BOOYAH-14) |
| **UC12** Record Delivery Attempt | Rider | F04 / [BOOYAH-14](https://thaikiet291006.atlassian.net/browse/BOOYAH-14) |
| **UC13** Monitor Attempts and Resolve Failed Orders | Dispatcher | F04 / [BOOYAH-14](https://thaikiet291006.atlassian.net/browse/BOOYAH-14) |
| **UC14** View Next-Order Recommendation | Rider | F05 / [BOOYAH-21](https://thaikiet291006.atlassian.net/browse/BOOYAH-21) |
| **UC15** Search and View Location Guide | Rider | F06 / [BOOYAH-15](https://thaikiet291006.atlassian.net/browse/BOOYAH-15) |
| **UC16** Submit Location Note | Rider | F06 / [BOOYAH-15](https://thaikiet291006.atlassian.net/browse/BOOYAH-15) |
| **UC18** Prepare, Review and Publish Location Guide | Dispatcher; AI Language Service (secondary) | F06, F07 / [BOOYAH-15](https://thaikiet291006.atlassian.net/browse/BOOYAH-15) |
| **UC19** View Shift and Rider Reports | Dispatcher | F08 / [BOOYAH-14](https://thaikiet291006.atlassian.net/browse/BOOYAH-14) |

Ownership and specifications: Đăng (`BOOYAH-22`, [UC-F01-Access.md](UC-F01-Access.md)), Hải (`BOOYAH-20`, [UC-F02-Orders.md](UC-F02-Orders.md); `BOOYAH-14`, [UC-F04-F08-Delivery-Reporting.md](UC-F04-F08-Delivery-Reporting.md)), Khánh (`BOOYAH-21`, [UC-F03-F05-Shifts.md](UC-F03-F05-Shifts.md)), and Trung (`BOOYAH-15`, [UC-F06-F07-Guides.md](UC-F06-F07-Guides.md)).

<!-- pagebreak -->

## 4. Diagram notation and relationship decisions
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

The five views depict one Veylo system. Repeated UC IDs identify the same goal, not duplicate use cases. Ovals are use cases; stick figures are actors; a rectangle is the system boundary. Solid markerless lines show participation, not execution order. A hollow triangle points from a specialized actor to Staff User. A dashed «extend» arrow points from optional behavior to its independently complete base goal.

These sources use native `usecase-beta` syntax with pinned Mermaid 12.3.0. Contrary to the older task note, current Mermaid supports use-case diagrams; the syntax is still beta. The exported PNG/SVG and PDF support readers whose Markdown renderer is older. See the [official syntax reference](https://mermaid.js.org/syntax/usecase.html). No UML meaning is inferred from layout position.

| Relationship | One-line reason / condition |
| --- | --- |
| Administrator -> Staff User; Dispatcher -> Staff User; Rider -> Staff User (generalization) | Each role can sign in through UC01; only the shared authentication participation is inherited. |
| UC14 extends UC11 | At extension point EP11-A, after assigned stops are displayed, a rider may request a next-stop recommendation when eligible work exists; the list remains useful without it. |
| UC15 extends UC11 | At EP11-B, while inspecting a selected delivery, a rider may open its location guide; viewing the assignment does not require a guide to exist. |
| UC15 also has a direct Rider association | Vision F06 includes a searchable guide repository, so guide lookup remains an independent goal beyond the delivery-list entry point. |
| No include relationships selected | No mandatory reusable actor-goal subroutine is needed at this abstraction level. Sign-in is a precondition, validation/logging are internal steps, and AI success is optional. |
| No UC16 include UC17 | Raw-note persistence is the successful end of UC16; an AI timeout, invalid output or exhausted quota must not undo it or prevent manual work. |

The extend entry points describe a proposed model decomposition, not a new minimum-stop rule: no requirement for two remaining stops is introduced. The detailed owner confirms the entry points while reconciling its specification.

### Model changes from the initial catalog
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Item | Change / reason |
| --- | --- |
| UC17 | Retired standalone "Generate AI Draft Guide"; asynchronous processing is an internal supporting behavior of the dispatcher preparation/review goal UC18. |
| UC18 | Name explicitly includes preparation, covering both AI-assisted and manual drafting already present in Vision workflow 2. |
| UC15 | Name explicitly includes search, preserving the searchable repository promised by F06. |
| Count | 18 active user-goal UCs; count is derived from goals rather than a rubric quota. |

<!-- pagebreak -->

### 4.1 Access and administration
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

View D1 | UC01, UC02, UC03, UC04

```mermaid
usecase-beta
direction LR
accTitle: Access and administration
accDescr: Veylo user goals. Actors are outside the system boundary.
actor Staff("Staff User") <<abstract>>
actor Admin("Administrator")
actor Dispatcher("Dispatcher")
actor Rider("Rider")
systemBoundary Veylo["Veylo"]
  UC01("`UC01
Sign In`")
  UC02("`UC02
Manage User Accounts`")
  UC03("`UC03
Configure Hub`")
  UC04("`UC04
View Audit Log`")
end
Staff -- UC01
Admin -- UC02
Admin -- UC03
Admin -- UC04
Admin --|> Staff
Dispatcher --|> Staff
Rider --|> Staff
```

[Rendered PNG](diagrams/D1-access.png)

<!-- pagebreak -->

### 4.2 Order intake and shift planning
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

View D2 | UC05, UC06, UC07, UC08, UC09, UC10

```mermaid
usecase-beta
direction LR
accTitle: Order intake and shift planning
accDescr: Veylo user goals. Actors are outside the system boundary.
actor Dispatcher("Dispatcher")
systemBoundary Veylo["Veylo"]
  UC05("`UC05
Create Order Manually`")
  UC06("`UC06
Import Orders from CSV`")
  UC07("`UC07
Search and View Orders`")
  UC08("`UC08
Update or Cancel Order`")
  UC09("`UC09
Plan Delivery Shift`")
  UC10("`UC10
Adjust Shift Assignment`")
end
Dispatcher -- UC05
Dispatcher -- UC06
Dispatcher -- UC07
Dispatcher -- UC08
Dispatcher -- UC09
Dispatcher -- UC10
```

[Rendered PNG](diagrams/D2-planning.png)

<!-- pagebreak -->

### 4.3 Rider delivery work
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

View D3 | UC11, UC12, UC14, UC15, UC16

```mermaid
usecase-beta
direction LR
accTitle: Rider delivery work
accDescr: Veylo user goals. Actors are outside the system boundary.
actor Rider("Rider")
systemBoundary Veylo["Veylo"]
  UC11("`UC11
View Assigned Shift and
Deliveries`")
  UC12("`UC12
Record Delivery Attempt`")
  UC14("`UC14
View Next-Order
Recommendation`")
  UC15("`UC15
Search and View Location
Guide`")
  UC16("`UC16
Submit Location Note`")
end
Rider -- UC11
Rider -- UC12
Rider -- UC14
Rider -- UC15
Rider -- UC16
UC14 ..> : extend UC11
UC15 ..> : extend UC11
```

[Rendered PNG](diagrams/D3-rider.png)

Extension guards: EP11-A = rider requests a recommendation for eligible assigned work; EP11-B = rider chooses guidance for a selected delivery. No guide / no eligible stop is handled by the corresponding specification, not by inventing another use case.

<!-- pagebreak -->

### 4.4 Monitoring and reporting
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

View D4 | UC13, UC19

```mermaid
usecase-beta
direction LR
accTitle: Monitoring and reporting
accDescr: Veylo user goals. Actors are outside the system boundary.
actor Dispatcher("Dispatcher")
systemBoundary Veylo["Veylo"]
  UC13("`UC13
Monitor Attempts and
Resolve Failed Orders`")
  UC19("`UC19
View Shift and Rider
Reports`")
end
Dispatcher -- UC13
Dispatcher -- UC19
```

[Rendered PNG](diagrams/D4-monitoring.png)

<!-- pagebreak -->

### 4.5 Location knowledge
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

View D5 | UC15, UC16, UC18

```mermaid
usecase-beta
direction LR
accTitle: Location knowledge
accDescr: Veylo user goals. Actors are outside the system boundary.
actor Rider("Rider")
actor Dispatcher("Dispatcher")
actor AI("AI Language Service") <<secondary>>
systemBoundary Veylo["Veylo"]
  UC15("`UC15
Search and View Location
Guide`")
  UC16("`UC16
Submit Location Note`")
  UC18("`UC18
Prepare, Review and Publish
Location Guide`")
end
Rider -- UC15
Rider -- UC16
Dispatcher -- UC18
AI -- UC18
```

[Rendered PNG](diagrams/D5-knowledge.png)

UC16 saves the note first. AI preparation may then run asynchronously as internal support for UC18. A failed AI request leaves the note available for manual drafting. UC18 exposes draft/source comparison, uncertainty, processing/failure states and review outcomes. Only dispatcher approval can make a guide visible in UC15. AI has no publication authority.

<!-- pagebreak -->

## 5. Traceability to functional requirements
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

**Functional requirements traceability:** [VisionDocument.md](../../requirements/VisionDocument.md) defines 32 numbered FRs (`FR-01-1` through `FR-08-3`). Each row below maps its FR and original source identifier (`SRC-*`) to active use cases. Detailed revision notes appear in [Changes.md](../../Changes.md).

The matrix includes all eight functional groups, explicit administrative capabilities in Vision sections 3-4, and identified catalog refinements from the owner tasks. "Task proposal" rows are not silently promoted to approved Vision requirements. ALL means the 18 active catalog UCs; UC01 authenticates, while subsequent goals enforce session/role/resource access.

### F01 coverage
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Source ID / reference | Capability / source status | Use cases |
| --- | --- | --- |
| FR-01-1 / SRC-01-01; V1 §5.1 F01 | Authenticate the three staff roles. **Baseline.** | UC01 |
| FR-01-2 / SRC-01-02; V1 §5.1 F01 | Enforce role and assignment boundaries, including dispatcher-only planning/publication. **Baseline; cross-cutting.** | ALL |
| FR-01-3 / SRC-01-03; V1 §3.2, §4.1; T06 | Administer user accounts and role/hub assignments. **Baseline; policy pending.** | UC02 |
| FR-01-4 / SRC-01-04; V1 §3.2, §4.1; T06 | Configure the operating hub and service-area information. **Baseline; breadth pending.** | UC03 |
| FR-01-5 / SRC-01-05; V1 §3.2, §4.1; T06 | Inspect administrative/operational audit logs. **Baseline.** | UC04 |

### F02 coverage
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Source ID / reference | Capability / source status | Use cases |
| --- | --- | --- |
| FR-02-1 / SRC-02-01; V1 §5.1 F02 | Create one delivery order manually. **Baseline.** | UC05 |
| FR-02-2 / SRC-02-02; V1 §5.1 F02 | Import multiple orders from structured CSV. **Baseline.** | UC06 |
| FR-02-3 / SRC-02-03; V1 §5.1 F02 | Validate destination, delivery window, weight and recipient contact data and show errors. **Baseline; limits pending.** | UC05, UC06, UC08 |
| FR-02-4 / SRC-02-04; T07; V1 workflow 1 | Search/list orders and view details. **Task proposal / refinement.** | UC07 |
| FR-02-5 / SRC-02-05; T07 | Update or cancel orders under agreed rules. **Task proposal / refinement.** | UC08 |

### F03 coverage
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Source ID / reference | Capability / source status | Use cases |
| --- | --- | --- |
| FR-03-1 / SRC-03-01; V1 §5.1 F03 | Organize validated orders into shifts and assign active riders using capacity/zone context. **Baseline.** | UC09 |
| FR-03-2 / SRC-03-02; V1 §5.1 F03 | Inspect an interactive list/route overview and rebalance workload or stop order before publication. **Baseline.** | UC09 |
| FR-03-3 / SRC-03-03; V1 §5.1 F03; workflow 1 | Publish a shift so the rider can see the assigned work. **Baseline.** | UC09, UC11 |
| FR-03-4 / SRC-03-04; T08 | Adjust assignments after publication. **Task proposal / refinement.** | UC10 |

### F04 coverage
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Source ID / reference | Capability / source status | Use cases |
| --- | --- | --- |
| FR-04-1 / SRC-04-01; V1 §4.1; workflow 1 | View the assigned shift, delivery list and stop details. **Baseline.** | UC11 |
| FR-04-2 / SRC-04-02; V1 §5.1 F04 | Record attempt initiation and arrival. **Baseline.** | UC12 |
| FR-04-3 / SRC-04-03; V1 §5.1 F04 | Record successful delivery with photo POD. **Baseline.** | UC12 |
| FR-04-4 / SRC-04-04; V1 §5.1 F04 | Record a failed attempt with structured reason and comments. **Baseline.** | UC12 |
| FR-04-5 / SRC-04-05; V1 §5.1 F04 | Preserve each attempt separately from its parent order and retain traceability. **Baseline.** | UC12, UC13, UC19 |
| FR-04-6 / SRC-04-06; V1 workflow 1; T09 | Monitor attempts and resolve failed orders through re-dispatch or an agreed terminal decision. **Baseline; transition rules pending.** | UC13 |

### F05 coverage
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Source ID / reference | Capability / source status | Use cases |
| --- | --- | --- |
| FR-05-1 / SRC-05-01; V1 §5.1 F05 | Suggest an assigned, unfulfilled stop using time-window urgency, priority and proximity. **Baseline; ranking rules pending.** | UC14 |
| FR-05-2 / SRC-05-02; V1 §5.1 F05; T08 | Show an understandable reason for the suggestion and preserve rider choice. **Baseline / task refinement.** | UC14 |

### F06 coverage
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Source ID / reference | Capability / source status | Use cases |
| --- | --- | --- |
| FR-06-1 / SRC-06-01; V1 §5.1 F06 | Search and read published guides covering entrances, parking and security procedures. **Baseline.** | UC15 |
| FR-06-2 / SRC-06-02; V1 §5.1 F06; workflow 2 | Submit and persist a raw field observation linked to a location. **Baseline.** | UC16 |
| FR-06-3 / SRC-06-03; V1 §5.1 F06; workflow 2 | Review source content, edit a draft and explicitly approve or reject it. **Baseline.** | UC18 |
| FR-06-4 / SRC-06-04; V1 §5.1 F06; workflow 2 | Make only approved published guidance available to authorized riders. **Baseline; audience boundary pending.** | UC18, UC15 |

### F07 coverage
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Source ID / reference | Capability / source status | Use cases |
| --- | --- | --- |
| FR-07-1 / SRC-07-01; V1 §5.1 F07; workflow 2 | Prepare a structured draft from a Vietnamese source note without inventing facts. **Baseline; internal preparation.** | UC18 |
| FR-07-2 / SRC-07-02; V1 §5.1 F07 | Retain uncertainty/omissions for human review. **Baseline.** | UC18 |
| FR-07-3 / SRC-07-03; V1 §5.1 F07; workflow 2 | Preserve the raw note and allow manual drafting if AI fails or times out. **Baseline.** | UC16, UC18 |

### F08 coverage
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Source ID / reference | Capability / source status | Use cases |
| --- | --- | --- |
| FR-08-1 / SRC-08-01; V1 §5.1 F08 | View shift progress and rider performance information. **Baseline.** | UC13, UC19 |
| FR-08-2 / SRC-08-02; V1 §5.1 F08 | Distinguish order completion/success rates from delivery-attempt counts and rates. **Baseline; formulas pending.** | UC19 |
| FR-08-3 / SRC-08-03; V1 §5.1 F08 | Report average attempt durations and frequent failure causes. **Baseline; event rules pending.** | UC19 |

### Reverse coverage and owner reconciliation
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Use case | Source clauses (plus FR-01-2 / SRC-01-02 authorization) | Final owner check |
| --- | --- | --- |
| UC01 | FR-01-1 / SRC-01-01 | Reviewed (21 Nov 2026) |
| UC02 | FR-01-3 / SRC-01-03 | Reviewed (21 Nov 2026) |
| UC03 | FR-01-4 / SRC-01-04 | Reviewed (21 Nov 2026) |
| UC04 | FR-01-5 / SRC-01-05 | Reviewed (21 Nov 2026) |
| UC05 | FR-02-1 / SRC-02-01, FR-02-3 / SRC-02-03 | Reviewed (21 Nov 2026) |
| UC06 | FR-02-2 / SRC-02-02, FR-02-3 / SRC-02-03 | Reviewed (21 Nov 2026) |
| UC07 | FR-02-4 / SRC-02-04 | Reviewed (21 Nov 2026) |
| UC08 | FR-02-3 / SRC-02-03, FR-02-5 / SRC-02-05 | Reviewed (21 Nov 2026) |
| UC09 | FR-03-1 / SRC-03-01, FR-03-2 / SRC-03-02, FR-03-3 / SRC-03-03 | Reviewed (21 Nov 2026) |
| UC10 | FR-03-4 / SRC-03-04 | Reviewed (21 Nov 2026) |
| UC11 | FR-03-3 / SRC-03-03, FR-04-1 / SRC-04-01 | Reviewed (21 Nov 2026) |
| UC12 | FR-04-2 / SRC-04-02, FR-04-3 / SRC-04-03, FR-04-4 / SRC-04-04, FR-04-5 / SRC-04-05 | Reviewed (21 Nov 2026) |
| UC13 | FR-04-5 / SRC-04-05, FR-04-6 / SRC-04-06, FR-08-1 / SRC-08-01 | Reviewed (21 Nov 2026) |
| UC14 | FR-05-1 / SRC-05-01, FR-05-2 / SRC-05-02 | Reviewed (21 Nov 2026) |
| UC15 | FR-06-1 / SRC-06-01, FR-06-4 / SRC-06-04 | Reviewed (21 Nov 2026) |
| UC16 | FR-06-2 / SRC-06-02, FR-07-3 / SRC-07-03 | Reviewed (21 Nov 2026) |
| UC18 | FR-06-3 / SRC-06-03, FR-06-4 / SRC-06-04, FR-07-1 / SRC-07-01, FR-07-2 / SRC-07-02, FR-07-3 / SRC-07-03 | Reviewed (21 Nov 2026) |
| UC19 | FR-04-5 / SRC-04-05, FR-08-1 / SRC-08-01, FR-08-2 / SRC-08-02, FR-08-3 / SRC-08-03 | Reviewed (21 Nov 2026) |

All 32 numbered FRs and their source clauses map to an active use case, and every active use case maps back to at least one FR and source clause.

### Scope exclusions and deferred implementation
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

F03-F08 remain modeled for PA3 C/D even though their implementation is later. Current scope excludes continuous GPS, fleet-wide VRP, live carrier APIs, native mobile apps and payment/COD banking. BOOYAH-26 reconciles broad task mentions to CSV/photo POD and human planning. Excel/JSON import, signature POD, automatic clustering/map override and multi-hub expansion are not added FRs. No numbered FR is excluded from the model; later implementation is distinct from exclusion.

<!-- pagebreak -->

## 6. Shared glossary and state vocabulary
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

| Term | Meaning and boundary |
| --- | --- |
| Order | A delivery request and its overall business outcome. It can have several delivery attempts; an attempt failure is not an automatic terminal order failure. |
| DeliveryAttempt | A particular execution record linked to one order, with responsible rider, event times and outcome. Starting, arriving and finishing belong to this record. |
| Shift | A bounded set of work planned and published for a rider; publication makes assigned work available according to the agreed access rules. |
| Assignment | The relationship between an order, a shift and its rider. It is distinct from executing an attempt; reassignment rules must account for active attempts. |
| Hub | The operational context for staff and delivery work. One operating hub is the current scope proposal; authorization isolation fixtures do not expand product scope. |
| Location | The place to which raw observations and published access instructions relate; not a recipient identity or an individual delivery attempt. |
| Raw Note | The original rider observation retained with its source/location reference, including uncertainty. It is not automatically public guidance. |
| AI Draft | An unapproved structured interpretation of a raw note. It can be incomplete or uncertain and may be rejected or replaced by manual drafting. |
| Manual Draft | A draft prepared by the dispatcher from retained source content, including when AI is unavailable. It follows the same review/publication boundary. |
| Published Guide | Location guidance explicitly approved for publication by a dispatcher. Rejected/unapproved drafts are not rider-visible published guides. |
| POD | Proof of delivery; Vision F04 specifies a photo for success. Allowed file types, limits and completion rules belong to BOOYAH-14. |
| Re-dispatch | A dispatcher decision to arrange another delivery opportunity while preserving earlier attempt records; exact eligibility is not defined here. |
| Next-order recommendation | An explainable rule-based suggestion for assigned unfulfilled work; not the AI note-normalization feature. |
| Source clause / FR / UC | A SRC ID locates a coverage clause; an FR ID belongs to the authoritative Vision; a UC ID identifies an actor goal. These identifiers are not interchangeable. |

### State reconciliation register
Performed by: Thái Kiệt / Codex (AI-assisted). Reviewed by: Lý Huỳnh Minh Đăng and Group 09 (21 November 2026). Edited by: Codex.

This table distinguishes source labels and conceptual states from approved implementation enums. It is not a transition specification. Do not implement it as a database enum or infer timing/limits from it.

| Entity | Vocabulary to reconcile | Authority / unresolved point |
| --- | --- | --- |
| Order | NEW, CANCELLED are proposed in F02 tasks; terminal outcomes and other labels are not fixed here. | BOOYAH-20 with BOOYAH-13; BOOYAH-14 for failed-order resolution. Final shared set pending. |
| DeliveryAttempt | Started, arrived, successful, failed are observable milestones/outcomes from Vision; cancellation and in-progress naming remain open. | BOOYAH-14; retain per-attempt outcome and event times separately from Order. |
| Shift | Draft, published, completed are conceptual lifecycle terms in the catalog/tasks. | BOOYAH-21; exact transitions and editability pending. |
| Note / AI processing | Note persisted; processing; AI unavailable/failed; manual drafting available. | BOOYAH-15; a job failure does not mark the saved note as lost or rejected. |
| Guide draft | Unapproved, rejected, approved/published occur in Vision workflow 2; exact approval/publication transaction and version labels need alignment. | BOOYAH-15; never equate a completed AI response with publication. |

A generic "failed" field shared by orders, attempts and AI jobs is prohibited by the glossary distinction. Final status spelling follows the F02 OpenSpec contract (`NEW`, `CANCELLED` in `openspec/specs/order-intake/spec.md`) and owner specifications.
