# Vision v2 §§2–4 — BOOYAH-27
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

## 2. Positioning
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

Small delivery hubs need a shared record of orders, assignments and delivery attempts. Riders also need access to practical location notes, such as entrances and parking instructions, when they approach a stop. The team hypothesizes that information spread across chats, spreadsheets and map pins can be hard to retrieve during a shift. The project has no measured time-saving baseline.

Veylo is a responsive web application for dispatchers and riders at small delivery hubs. It combines scoped order intake, shift assignment, attempt recording and location guides. AI may help prepare a draft from a rider's note. A dispatcher reviews the draft before it can become published guidance.

## 3. Stakeholders, users and alternatives
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

Hub Management sponsors and oversees hub operations. System Administrator is an application actor with administrative responsibilities defined by F01. Hub Dispatcher and Delivery Rider are the operational actors. Parcel recipients are affected by delivery outcomes and are stakeholders. They have no direct interaction in the proposed use-case model.

| Alternative | What it does | Veylo comparison and trace |
| --- | --- | --- |
| Chat, spreadsheets and map pins | Team hypothesis recorded for the 19 November 2026 review draft. A dispatcher shares lists and riders use chat and pins for updates and directions. | A shared order and assignment record connects intake and shift planning (FR-02-1, FR-03-1). Reviewed guidance links a location to the delivery workflow (FR-06-1, FR-06-4). |
| GHN web portal | GHN documents manual order creation and Excel bulk entry for shops sending parcels through GHN. | Veylo's focus is coordinating the hub's own dispatcher/rider workflow and preserving attempt history (FR-02-1, FR-03-1, FR-04-5). [GHN help, accessed 2026-11-19](https://ghn.vn/blogs/app-va-web-ghn/huong-dan-tao-don-bang-web-ghn-ghn-express) |
| Routific | Routific documents dispatcher route publication and driver completion of stops using its mobile app. | Veylo proposes binding Vietnamese rider observations to location guides via dispatcher review and optional AI draft preparation (FR-06-2, FR-06-3, FR-07-1). [Routific help, accessed 2026-11-19](https://help.routific.com/en/articles/51-teammate-roles-and-permissions) |

### User environments
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

| Actor | Device and setting | Connectivity, language and session |
| --- | --- | --- |
| System Administrator | Desktop or laptop in an office, using a modern desktop browser and the shared desktop prototype frame. | Typical office connectivity. Administrative pages require an authenticated, authorized session. Use the team's confirmed interface locale. |
| Hub Dispatcher | Desktop or laptop in the hub, using a modern desktop browser with space for forms and lists. | Normally on hub Wi-Fi or wired internet. Demo order data uses synthetic Vietnamese names and addresses. Reauthentication is required when a session expires. |
| Delivery Rider | Smartphone browser used while stopped, potentially outdoors in bright light. Use the shared mobile prototype frame. | Mobile data with possible gaps. Vietnamese notes and addresses remain readable. An interrupted request needs clear feedback. Session expiry requires reauthentication. |

The shared [prototype kit](../analysis-and-design/use-cases/prototypes/kit/index.html) uses a 1440 × 900 desktop frame, with a 1280 × 720 minimum baseline, for Administrator and Dispatcher. The Rider mobile frame is 360 × 800. The F02 Dispatcher UI uses English under G4. N17 targets Chrome, Firefox and Edge on desktop, and Android Chrome and Mobile Safari for rider views. Record actual browser versions when testing. N04 sets the rider baseline at 360 CSS px and targets at least 44 × 44 CSS px. N16 covers contrast and keyboard access to core actions. The BOOYAH-24 catalog models Staff User as an abstract sign-in actor shared by Administrator, Dispatcher and Rider.

Sources: [Vision 2.2-review](https://drive.google.com/file/d/1FGJ7CS2HvPsV1oz2lmePL8cSHBYwjGKH/view) and [BOOYAH-24 UseCaseModel](https://drive.google.com/file/d/1BJBcPWMsFNr-2qnKkTXYu7afLKCuFiAV/view).

## 4. Product Overview
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

Veylo brings together staff access and administration, order intake, shift planning, delivery attempts, next-order suggestions, location guides, AI-assisted note drafting and shift reporting. PA3 implements F02 order intake and the supporting sign-in and authorization needed for its demo. Vision 2.2 scopes product operations to one hub. Additional hubs are synthetic authorization fixtures (FR-06-4). The F02 design uses synthetic order data and restricts order access to Dispatchers within their assigned hub.

Location guide quality depends on rider observations and dispatcher review. Notes remain usable for manual review if AI drafting is unavailable. Map tiles and language model access are external dependencies for later capabilities. Their availability and costs must be evaluated against the project budget.

## Section B Changes.md entries for consolidation
Performed by: Lý Huỳnh Minh Đăng. Reviewed by: Phạm Công Khánh. Edited by: Codex (AI-assisted).

- Removed the unsupported minutes-per-stop claim. Stated the retrieval problem as a team hypothesis without a quantified effect.
- Removed the unsupported Routific price range and absolute comparisons. Replaced competitor capability claims with dated official sources about documented workflows.
- Added chat, spreadsheets and map pins as the status-quo alternative. Documented how the relevant Veylo feature groups address each alternative.
- Distinguished Hub Management and Parcel Recipient stakeholders from the three application actors. Separated desktop and field contexts, connectivity, language and session expectations.
