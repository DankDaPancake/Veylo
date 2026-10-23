# Veylo — PA1 Project Proposal
Performed by: to be filled in. Reviewed by: pending team review. Edited by: AI-assisted extraction/branding; human editor to be filled in.

**Status:** Existing product-scope draft, reorganized for PA1. Team acceptance and actual section attribution remain to be completed. Moving this text does not approve new functional requirements.

**Project name:** Veylo (Velocity Flow). **Group information:** complete the [root README](../../README.md).

This file carries the proposal section from the earlier SmartRoute draft, with the approved project-name change. No functional-group paragraph or workflow has been added or removed. Technical suggestions and undecided details in the source remain proposals, not selected technologies or commitments.

## B. Project Proposal
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

### B.1. Introduction and Project Value
Performed by: Not yet recorded. Reviewed by: Not yet completed. Edited by: Not yet recorded (AI-assisted draft).

Veylo is a web application that supports last-mile delivery by combining daily order coordination with shared knowledge about delivery locations. It is intended for a small delivery hub where dispatchers assign orders and riders carry out delivery attempts.

Reaching a map coordinate does not necessarily explain how to complete a delivery at that location. A rider may also need to identify the correct entrance, find a parking area, understand building access restrictions, or follow instructions for reaching the recipient. These details can be difficult for an unfamiliar rider to interpret when they are scattered across informal notes.

Veylo proposes a shared location guide that turns riders' field notes into reusable instructions. AI will help normalize informal notes into structured drafts, while a dispatcher will review the content before publication. The application will also suggest which assigned order to attempt next using explicit priority rules and the available delivery context.

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
