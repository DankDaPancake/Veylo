# Shift planning and next-order recommendation

Performed by Codex for Phạm Công Khánh. Human review by Trần Lê Hải is pending. Edited by Codex.

BOOYAH-21 review draft. Traceability follows Vision v2 and BOOYAH-24. Khánh confirmed the planning and ranking rules on 19 November 2026. All 23 screens use the Light-theme BOOYAH-25 Apple Liquid Glass kit (`prototypes/kit/`); team acceptance of the new kit and Trần Lê Hải’s review remain pending. The screen exports illustrate synthetic data. The [decision log](#decision-log) records the rules and remaining review evidence.

## UC09 — Plan Delivery Shift

Performed by Codex for Phạm Công Khánh. Human review by Trần Lê Hải is pending. Edited by Codex.

**Actor** · Hub Dispatcher. **Requirements** · FR-03-1 to FR-03-3.

**Description and preconditions** · The dispatcher plans a shift for the signed-in hub. The planning view loads validated, unassigned NEW orders in the dispatcher’s hub and active riders with capacity and service-area context.

| Step | Basic flow | Screen |
| --- | --- | --- |
| 1 | Open Shifts, choose New shift and enter its time window. | S09-01 |
| 2 | Select eligible orders and an available rider. Inspect workload and service area. | S09-01 |
| 3 | Change stop order with Move up/Move down and inspect the resulting route overview. | S09-02 |
| 4 | Confirm publication. The system rechecks eligibility, rider availability, capacity policy and draft version. | S09-02 |
| 5 | The system publishes the shift and displays its rider and assigned work. The assigned rider can now open the shift through UC11. | S09-03 |

| Branch | Alternative flow | Screen |
| --- | --- | --- |
| 2a | No eligible orders. Show the empty list and offer Return to shifts. | S09-04 |
| 2b | Rider inactive or already assigned during the chosen window. Keep the selected orders and ask the dispatcher to choose another rider. | S09-05 |
| 3a | Selected workload exceeds the rider’s configured weight capacity. Show the difference and keep editing available. Block publication until the dispatcher reduces the workload or selects an eligible rider with enough capacity. | S09-05 |
| 4a | No orders selected. Reject publication and keep the draft editable. | S09-07 |
| 4b | Another dispatcher changed the draft, rider availability or order assignment. Reject stale publication, then reload the latest state for review. | S09-06 |

**Postconditions** · Success publishes a single current version with an assigned rider and ordered stops. A rejected publication leaves the previously saved shift unchanged and exposes no new rider work.

**Special requirements** · Recheck hub scope on the server. Offer keyboard controls for changing stop order. The route overview may show missing coordinates as unavailable while leaving the ordered list usable.

![S09-01 · Select orders and a rider](prototypes/UC09/S09-01-plan-shift.png)
![S09-02 · Review workload and stop sequence](prototypes/UC09/S09-02-review-route.png)
![S09-03 · Published shift](prototypes/UC09/S09-03-published.png)
![S09-04 · Empty selection](prototypes/UC09/S09-04-empty.png)
![S09-05 · Rider and capacity warnings](prototypes/UC09/S09-05-rider-capacity.png)
![S09-06 · Stale shift version](prototypes/UC09/S09-06-stale.png)
![S09-07 · Zero orders selected with eligible orders available](prototypes/UC09/S09-07-no-orders-selected.png)

## UC10 — Adjust Shift Assignment

Performed by Codex for Phạm Công Khánh. Human review by Trần Lê Hải is pending. Edited by Codex.

**Actor** · Hub Dispatcher. **Requirement** · FR-03-4.

**Description and preconditions** · The dispatcher opens a published shift in the signed-in hub and has permission to revise it under the agreed shift and attempt rules.

| Step | Basic flow | Screen |
| --- | --- | --- |
| 1 | Open the published shift and inspect the current rider, stop assignments and locks. | S10-01 |
| 2 | Select a replacement rider, remove an eligible stop or move it to another eligible shift. Preview affected assignments before saving. | S10-01 |
| 3 | Confirm the change. The system checks both shift versions for a move, validates the rider and rechecks active attempts and capacity. | S10-02 |
| 4 | The system applies the revision in one operation and shows the updated published assignment. The previous rider loses access to transferred work. The current assignee sees the revision on refresh. | S10-03 |

| Branch | Alternative flow | Screen |
| --- | --- | --- |
| 1a | Completed shift. Display it in read-only mode. | S10-04 |
| 2a | A stop has an active attempt. Disable moving or removing that stop. If rider replacement would affect it, show the reason and block replacement. | S10-05 |
| 2b | The replacement rider or destination shift fails eligibility or capacity checks. Preserve the current assignment and let the dispatcher revise the selection. | S10-05, S10-07 |
| 3a | A concurrent update or an attempt started after preview. Reject the change and reload latest data before a retry. | S10-06 |
| 3b | Dispatcher dismisses confirmation. Return to the preview with no committed changes. | S10-02 |

**Postconditions** · Success updates eligible assignments and preserves existing attempt history. Rejection and dismissal leave both shifts and their attempts unchanged.

**Special requirements** · A move between shifts commits both sides together. No double ownership is visible after refresh. A started attempt holds the assignment lock until it reaches a terminal outcome. A failed terminal attempt remains subject to the UC13 dispatcher resolution policy in BOOYAH-14. It does not reopen an order by itself.

![S10-01 · Adjust published work](prototypes/UC10/S10-01-adjust.png)
![S10-02 · Confirm reassignment](prototypes/UC10/S10-02-confirm.png)
![S10-03 · Updated published work](prototypes/UC10/S10-03-updated.png)
![S10-04 · Completed shift](prototypes/UC10/S10-04-completed.png)
![S10-05 · Blocked changes](prototypes/UC10/S10-05-blocked.png)
![S10-06 · Reload after concurrent change](prototypes/UC10/S10-06-stale.png)
![S10-07 · Replacement rider unavailable with current assignment preserved](prototypes/UC10/S10-07-rider-unavailable.png)

## UC14 — View Next-Order Recommendation

Performed by Codex for Phạm Công Khánh. Human review by Trần Lê Hải is pending. Edited by Codex.

**Actor** · Rider. **Requirements** · FR-05-1 and FR-05-2. **Extension point** · UC11 EP11-A after assigned work loads.

**Description and preconditions** · The signed-in rider views their current published assignment and asks for an explanation of the next suggested stop.

| Step | Basic flow | Screen |
| --- | --- | --- |
| 1 | Open the assigned work list and request a suggestion. | S14-01 |
| 2 | The system ranks eligible unfulfilled stops using the agreed deterministic rules. | S14-02, S14-08, S14-09 |
| 3 | The rider sees a suggestion with the deciding reason and can open it or choose another eligible stop. | S14-02 |

| Branch | Alternative flow | Screen |
| --- | --- | --- |
| 2a | No eligible work remains. Show an empty state with a return action. | S14-03 |
| 2b | A window or coordinates are missing. Apply the agreed fallback and explain which data was unavailable. | S14-04 |
| 2c | At least one eligible window is known and all known windows have passed. Show an overdue suggestion and its deciding reason. | S14-05 |
| 2d | The compared signals tie. Use the agreed stable tie-break and show it. | S14-06 |
| 3a | The rider chooses a different eligible stop from the list. Open that stop without changing the shift sequence. | S14-07 |

**Postconditions** · Viewing a suggestion leaves assignment, sequence and attempt state unchanged. Opening a stop leaves attempt creation to the delivery workflow.

**Special requirements** · Use the current hub clock. Rank known windows whose closing time has not passed first, then known overdue windows, then unknown windows. Inside each known group use ascending closing time. For the same closing time or two unknown times, compare priority, then straight-line distance from the last stop with a recorded completion and coordinates. With no such stop, use configured hub coordinates when available. If the reference point or stop coordinates are missing, mark distance unavailable. Comparable known distances rank before unknown distances. Break remaining ties by published stop sequence, then stable stop ID. Display the deciding signal and any missing inputs.

| Deciding signal | Example reason shown | Screen |
| --- | --- | --- |
| Delivery-window urgency | Earliest closing window at 10:30. | S14-02 |
| Priority | Higher priority among stops with the same closing time. | S14-08 |
| Distance | Closest of the tied stops with known distance. | S14-09 |
| Missing fields | No delivery window or distance available. Ranked by the remaining known signals and planned order. | S14-04 |
| All windows passed | Earliest missed window closed at 09:15. | S14-05 |
| Stable final tie | Equal urgency, priority and distance. This stop comes first in the planned order. | S14-06 |

![S14-01 · Assigned stops](prototypes/UC14/S14-01-stops.png)
![S14-02 · Recommendation explanations](prototypes/UC14/S14-02-reasons.png)
![S14-03 · No eligible stops](prototypes/UC14/S14-03-empty.png)
![S14-04 · Missing input](prototypes/UC14/S14-04-fallback.png)
![S14-05 · Overdue work](prototypes/UC14/S14-05-overdue.png)
![S14-06 · Stable tie-break](prototypes/UC14/S14-06-tie.png)
![S14-07 · Rider chooses a different stop](prototypes/UC14/S14-07-choice.png)
![S14-08 · Priority decides the suggestion](prototypes/UC14/S14-08-priority.png)
![S14-09 · Distance decides the suggestion](prototypes/UC14/S14-09-distance.png)

## Decision log

Performed by Codex for Phạm Công Khánh. Human review by Trần Lê Hải is pending. Edited by Codex.

| Decision | Rule and rationale | Confirmation |
| --- | --- | --- |
| Rider count and overlap | One active rider per shift. Reject time-window overlap for that rider in the same hub to prevent conflicting work. Adjacent non-overlapping shifts are allowed. | Khánh · 19 November 2026 |
| Capacity | Sum the planned stops’ parcel weights in kilograms. Require a configured positive rider capacity, warn during selection and block publication or a published change above capacity. This keeps an editable draft useful without assigning an overloaded shift. | Khánh delegation · 19 November 2026 |
| Eligible orders | Select same-hub validated NEW orders that are not already assigned to another shift. Exclude CANCELLED orders. Keep shift assignment and DeliveryAttempt state separate from Order status. Reconcile future post-attempt eligibility with UC13. | Khánh delegation and BOOYAH-20 · 19 November 2026 |
| Publication | Show the assigned rider only their own published shift, ordered assigned stops and the details needed for delivery under the role policy. Draft work stays in the dispatcher view. | Khánh · 19 November 2026 |
| Post-publication edits | Lock any change that would move an active attempt. Recheck both shifts on a move and commit the transfer together. Completed shifts are read-only. A terminal failed attempt awaits BOOYAH-14/UC13 resolution before it can become eligible for new work. | Khánh delegation · 19 November 2026 |
| Ranking and ties | Compare delivery-window group and closing time, then priority and distance. Missing values fall through to the remaining signals. Use published sequence, then stable stop ID for a repeatable tie-break. Preserve the rider’s choice of another eligible stop. | Khánh delegation · 19 November 2026 |

The independent walkthrough, human review by Trần Lê Hải, and team approval of the migrated BOOYAH-25 Apple Liquid Glass kit remain pending. All 23 BOOYAH-21 screens (14 Dispatcher frames at `1440×900` and 9 Rider frames at `360×800`) are now generated in Light mode from the local reproducible source in `prototypes/kit/`, preserving `S09-04` (branch 2a empty pool), `S09-07` (branch 4a eligible pool with zero selected), `S10-05` (branch 2a/2b active-attempt lock and destination capacity), and `S10-07` (branch 2b unavailable replacement rider).
