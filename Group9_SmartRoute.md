# SmartRoute — PA1 Project Proposal and Preparation Status
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

**Document status:** Draft for team review and TA consultation. This document describes the proposed application and records the preparation work that is still missing; it does not represent completed implementation, research, or team agreements.

| Item | Current information |
| --- | --- |
| Project name | SmartRoute |
| Application type | Responsive web application |
| Team size | 5 members |
| Group ID | 9 |
| Overall implementation period | 10 weeks |
| Primary actors | Hub Dispatcher and Delivery Rider |
| Selected AI focus | AI-assisted delivery-note normalization with dispatcher approval |
| Selected applications for the survey | Routific and GHN; survey not yet completed |
| Basis for this document | [PA1 assignment](Intro2SE-AI-Integrated-2026-Public/PA1/PA1-2026.pdf), especially Sections B–E and submission instructions |

The attribution lines are placeholders. Before submission, the team must record the actual members who performed, reviewed, and edited each section.

## B. Project Proposal
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

### B.1. Introduction and Project Value
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

SmartRoute is a web application that supports last-mile delivery by combining daily order coordination with shared knowledge about delivery locations. It is intended for a small delivery hub where dispatchers assign orders and riders carry out delivery attempts.

Reaching a map coordinate does not necessarily explain how to complete a delivery at that location. A rider may also need to identify the correct entrance, find a parking area, understand building access restrictions, or follow instructions for reaching the recipient. These details can be difficult for an unfamiliar rider to interpret when they are scattered across informal notes.

SmartRoute proposes a shared location guide that turns riders' field notes into reusable instructions. AI will help normalize informal notes into structured drafts, while a dispatcher will review the content before publication. The application will also suggest which assigned order to attempt next using explicit priority rules and the available delivery context.

The expected value is easier access to practical delivery instructions, more consistent knowledge sharing, and clearer coordination during a shift. These are project hypotheses: user research, baseline measurements, and evidence of operational improvement have **not yet been collected**. This proposal does not claim that existing delivery platforms lack these capabilities.

### B.2. Target Users and Operating Environment
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

| Actor | Intended responsibilities | Intended environment |
| --- | --- | --- |
| Hub Dispatcher | Manage daily orders, assign shifts, review submitted knowledge and AI drafts, and inspect shift reports. | Desktop or laptop web browser. |
| Delivery Rider | View assigned orders, consult location guides, record delivery outcomes, and submit field notes. | Responsive web interface in a smartphone browser. |

The MVP will support these two actors. Recipients will not need a customer account for the proposed workflow. The exact supported browser and operating-system versions have **not yet been confirmed**.

### B.3. Proposed Functional Groups
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

The proposal contains eight functional groups. Their boundaries, particularly the distinction between knowledge management and AI-assisted normalization, are proposed for TA review.

1. **Account and Access Management.** The application will authenticate dispatchers and riders and authorize access according to their roles, including checks on the server. This will allow riders to access their own assignments while restricting order assignment and guide approval to authorized dispatchers; account provisioning details are to be confirmed.

2. **Order Intake and Management.** Dispatchers will create or import sample delivery orders and maintain their destination, delivery window, parcel information, and current status. Input validation will help identify incomplete records before they are used for shift planning; the import format and required fields are not yet finalized.

3. **Shift Planning and Assignment.** Dispatchers will create delivery shifts, assign orders to riders, and adjust assignments when necessary. Riders will be able to view their assigned workload, giving both actors a shared view of who is responsible for each delivery.

4. **Delivery Attempt Execution and Status Tracking.** Riders will start an assigned delivery attempt, record arrival, and submit a successful or unsuccessful outcome with a reason where appropriate. The application will retain attempt timestamps and outcomes so that an unsuccessful attempt is distinguishable from the final state of the order; detailed retry rules are to be confirmed.

5. **Contextual Next-Best Delivery Recommendations.** The application will suggest the next order using explicit rules based on available inputs such as delivery windows, parcel priority, and reviewed location constraints, with map markers supporting the rider's decision. Each recommendation will display the rule-based reason, while scoring weights and tie-breaking rules remain to be defined; global route optimality is not promised.

6. **Shared Location Guides and Knowledge Review.** Riders will read published micro-guides linked to delivery locations and submit new observations or corrections for dispatcher review. Dispatchers will manage publication and updates so that informal reports, approved guidance, and outdated information remain distinguishable.

7. **AI-Assisted Delivery-Note Normalization.** AI will extract relevant details from informal rider notes and generate a structured draft with a concise guide for dispatcher review. The dispatcher will edit, approve, or reject the draft before publication, reducing repetitive rewriting while retaining human control over shared instructions.

8. **Shift Performance Reporting.** Dispatchers will view shift-level delivery outcomes and per-rider attempt summaries using the application's recorded events. Reports will distinguish order counts from attempt counts and calculate average attempt duration only for attempts with valid start and finish timestamps, helping the team inspect the demonstration without claiming measured business gains.

### B.4. Meaningful AI Feature and User Experience
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

The core AI feature is **delivery-note normalization**. Its purpose is to help dispatchers turn short, inconsistent field observations into readable drafts that other riders can use after review.

The proposed workflow is:

1. A rider selects a delivery location and submits a raw note.
2. AI extracts the information present in the note into a structured draft.
3. The application shows the original note beside the proposed fields and short guide.
4. A dispatcher reviews the draft, corrects it, and approves or rejects publication.
5. Riders can read the approved guide when opening an order for that location.
6. Later observations can trigger another review and update.

**Illustrative rider input, preserved in Vietnamese:**

> hầm B2 khóa rồi, gửi xe tiệm nước đối diện 5k rồi đi thang sảnh A

**Illustrative draft interpretation, not a verified location guide:**

| Field | Information reported in the note |
| --- | --- |
| Access issue | Basement B2 is reported as closed. |
| Parking observation | The rider reports parking at the drink shop opposite the building. |
| Reported fee | “5k”; the unit and current validity require confirmation. |
| Internal access | The rider reports using the elevator at Lobby A. |
| Missing information | Observation time, duration of the closure, and verification status are not provided. |

The AI must preserve uncertainty and must not invent opening hours, permissions, fees, entrances, or other location facts. Temporary conditions should be identified for review, and the guide should show its review status and last update; the exact expiry policy is **not yet defined**. If the AI service is unavailable, the original note should remain available for manual drafting and review.

This feature provides end-user value through information extraction and rewriting, beyond keyword suggestions. A question-answering chatbot and LLM-generated priority explanations are **deferred extensions**. The MVP's priority score is rule-based and is not presented as the required AI feature.

**AI preparation status:** Model/provider selection, prompt design, output schema, evaluation examples, quality thresholds, latency measurements, and API cost limits have **not yet been completed or confirmed**. Evaluation should check factual fidelity, handling of missing information, usefulness of the draft, and dispatcher correction effort; no performance results are available yet.

### B.5. MVP Boundaries, Data, and Feasibility
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

The proposed MVP connects order intake, shift assignment, contextual recommendations, delivery attempts, reviewed location knowledge, AI normalization, and shift reports in one end-to-end demonstration. A map is a supporting interface within that workflow. Leaflet with OpenStreetMap was proposed in the original draft; map-service usage, attribution, and deployment details are **not yet confirmed**.

| Area | Proposed approach | What is still missing |
| --- | --- | --- |
| No company data available | Use clearly labeled synthetic orders, locations, notes, and delivery outcomes for demonstration. | Dataset, generation rules, and representative scenarios have not yet been prepared. |
| Company data becomes available | Assess whether authorized, minimized records can support the same workflow. | No partner dataset, permission, or access arrangement has been established. |
| Demo movement | Use an explicitly labeled arrival simulation rather than requiring live rider tracking. | Simulation behavior and event validation have not yet been specified. |
| Architecture | Support a responsive client, application backend, persistent storage, and a replaceable AI integration. | Technology stack, hosting option, and deployment design have not yet been selected. |
| Infrastructure and budget | Choose a configuration suitable for five students working over approximately two months. | Hardware inventory, cloud/API budget, load assumptions, and measured capacity are not yet available. |

Live Shopee/SPX integration, continuous GPS tracking, live traffic ingestion, a trained delivery-success predictor, and full fleet route optimization are **outside the proposed MVP**. No API access to a delivery platform is assumed.

The team must avoid exposing recipient personal information, credentials, or private operational data in demonstrations, repositories, and AI requests. The concrete data-handling procedure and provider terms review are **not yet completed**. No measured improvement in delivery time, delivery success rate, or operating cost is claimed.

## C. Existing Application Survey
Performed by: Not yet completed. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted outline).

### C.1. Selected Applications and Evidence Status
Performed by: Not yet completed. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted outline).

The team has selected **Routific** and **GHN** for the survey. The survey itself, including direct inspection and screenshots, has **not yet been completed**. The following table is a research plan, not a statement that either application supports every listed feature.

| Application | Planned investigation | Evidence status |
| --- | --- | --- |
| Routific | Investigate accessible order planning, assignment, route presentation, and delivery-status workflows. Record which product interface and user role were actually inspected. | Not yet completed; no screenshots or firsthand observations recorded. |
| GHN | Investigate accessible Vietnam delivery workflows, order information, tracking/status presentation, and exception handling. Record access limitations, especially if dispatcher or rider interfaces are unavailable. | Not yet completed; no screenshots or firsthand observations recorded. |

Screenshots must be organized by application and workflow, with captions explaining the screen, action, and relevance to SmartRoute. The team should distinguish directly tested behavior from information taken from official documentation and explicitly identify inaccessible features. The survey should not infer the internal capabilities of Shopee, SPX, or GHN from public tracking pages alone.

### C.2. Required Comparison and Design Lessons
Performed by: Not yet completed. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted outline).

| Required survey output | Current status |
| --- | --- |
| Key screens and workflows for Routific, with captioned screenshots | Not yet completed. |
| Key screens and workflows for GHN, with captioned screenshots | Not yet completed. |
| Common features relevant to SmartRoute | Not yet established from survey evidence. |
| Differences and potential improvements in SmartRoute | Shared location guides and reviewed AI drafts are proposed differentiators; comparative evidence has not yet been collected. |
| UI/UX patterns to adopt and reasons for adopting them | Not yet identified from the survey. |
| Sources, access dates, and limitations | Not yet recorded. |

## D. Team Contract
Performed by: Not yet completed. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted outline).

The team has five members. A team contract has **not yet been agreed or completed**, and member names and student IDs have **not yet been provided**. The table below lists decisions that must be made; it is not an agreed contract.

| Contract topic | Current status / decision required |
| --- | --- |
| Member information and responsibilities | Not yet completed. Record all five members and their primary coordination responsibilities. |
| Full-stack participation | PA1 requires every member to work as a full-stack engineer. Specific cross-layer tasks and collaboration arrangements have not yet been assigned. |
| Communication | Tool, meeting frequency, response expectations, and urgent-contact arrangements are not yet agreed. |
| Availability and milestones | Individual availability, internal deadlines, and contingency arrangements are not yet recorded. |
| Coding and documentation standards | Formatting, naming, branch practices, and documentation conventions are not yet agreed. |
| Review and testing | Review expectations, acceptance criteria, and testing responsibilities are not yet agreed. |
| Accountability | Progress reporting and the procedure for missed commitments or insufficient participation are not yet agreed. |
| Decision-making | Voting, consensus, and final-decision arrangements are not yet agreed. |
| Conflict resolution | Internal escalation steps and conditions for contacting the TA are not yet agreed. |
| Contract review | Review schedule and procedure for changing the agreement are not yet agreed. |
| Member acknowledgment | Not yet completed. |

## E. Tools and Process
Performed by: Not yet completed. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted outline).

### E.1. Tool Setup
Performed by: Not yet completed. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted outline).

| Tool or artifact | PA1 preparation requirement | Current status |
| --- | --- | --- |
| Course channels | Use Moodle for submission and the class announcement channel for course notices. | Team access and monitoring responsibility have not yet been recorded. |
| Team communication | Choose a channel for daily coordination and meeting arrangements. | Not yet selected. |
| Task board | Use Jira or an equivalent tool; include implementation, research, documentation, reporting, and self-training tasks. | Not yet set up. |
| Private Git repository | Store project code and text documentation; provide instructor/TA access when requested and keep secrets out of version control. | Not yet set up. |
| Repository organization | Prepare folders such as `/src`, `/docs/management`, `/docs/requirements`, `/docs/analysis-and-design`, and `/docs/test`. | Not yet created in a team repository. |
| Educational AI coding accounts | Each member registers an appropriate free educational AI coding account. | Per-member setup has not yet been recorded. |
| Weekly reporting document | Maintain planning, Scrum-meeting, and review records using the course instructions. | Not yet prepared. |
| Spec Kit | Setup becomes mandatory from PA2. | Not yet set up; not a PA1 completion requirement. |

Each task must have **exactly one assignee** and record creation, assignment, and completion dates. Tasks must be created and assigned before work starts; completion dates must reflect actual work. The team must not fabricate task history or meeting records to fill missing evidence.

### E.2. Planned Sprint Process
Performed by: Not yet completed. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted outline).

PA1 specifies Scrum with each assignment treated as a sprint of approximately two to three weeks. The team should use the [Weekly Reports instructions](Intro2SE-AI-Integrated-2026-Public/Weekly%20Reports.pdf) to prepare the following records.

| Activity | Required record | Current status |
| --- | --- | --- |
| One sprint-planning meeting | Prioritized tasks or user stories, assignees, and the sprint plan. | Meeting and record not yet completed. |
| Two Scrum meetings | Attendance and each member's completed work, next steps, and obstacles; keep the Scrum meetings in one document. | Meetings and records not yet completed. |
| One sprint review and retrospective | Outcomes, what went well, problems and causes, improvements, lessons, and follow-up actions. | Meeting and record not yet completed. |
| Task-board evidence | Screenshots covering all tasks in the weekly reports. | Not yet captured. |
| Repository evidence | Git-log screenshot or export showing actual contributions. | Not yet available. |
