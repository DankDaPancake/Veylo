# Location guides and AI-assisted note normalization
Performed by Codex for Nguyễn Thành Trung. Reviewed by Lý Huỳnh Minh Đăng (acceptance reported by the requester). Edited by Codex.

BOOYAH-15 · PA3 Section D · Reviewed. Sources are [BOOYAH-15](https://thaikiet291006.atlassian.net/browse/BOOYAH-15), [Use-Case Model 0.4](https://drive.google.com/file/d/1G-GlRLTj7ZsOw_g9o-bYTu_MLQ4AYEfi/view), and [Vision 2.2-review](https://drive.google.com/file/d/1vC5KwBkyKqXwPbQVq8lEtUQZlhlkWkXU/view). UC17 is reserved. The [prototype](prototypes/guide-screens.html) uses synthetic data. BOOYAH-15 uses the [repository prototype kit](prototypes/kit/index.html) and Vision 2.2-review for acceptance. The [BOOYAH-14 UC11 walkthrough](prototypes/delivery-execution-reporting/index.html?screen=S11-02-stop-details&standalone=1) opens UC15 through EP11-B.

## UC15 — Search and View Location Guide
Performed by Codex for Nguyễn Thành Trung. Reviewed by Lý Huỳnh Minh Đăng (acceptance reported by the requester). Edited by Codex.

**Actor** · Rider. **Requirements** · FR-06-1 and FR-06-4.

**Description** · Find current published building guidance from search, an assigned-stop preview or a direct link.

**Preconditions** · The rider is signed in, active and assigned to a hub. Search and direct links are available off shift. A preview requires a published shift and the rider's own assigned stop.

| Step | Basic flow | Screen |
| --- | --- | --- |
| 1 | Open Location guides and search by location. Show eligible published matches from the rider's hub, including off shift. | S15-01 |
| 2 | Open a result. Verify active rider, same hub and current publication on the guide read. | S15-01, S15-02 |
| 3 | Show reusable building information such as entrance and parking. Back returns to the entry context. | S15-02 |

| Branch | Alternative flow | Screen |
| --- | --- | --- |
| 1a | The search has no available match. Display an empty state and keep search usable. | S15-03 |
| 1b | UC11 shows an eligible guide preview for the assigned stop. EP11-B opens the full guide and Back restores the originating UC11 state. | S11-02-stop-details, S11-02-guide-only, S15-02. Standalone example: S15-06. |
| 1c | The assigned stop has no eligible guide. Omit the preview and keep the assignment list usable. | S11-02-guide-unavailable, S11-02-neither-context. Standalone example: S15-07. |
| 2a | A direct link opens an eligible current guide, including off shift. Apply the same checks as search. | S15-02 |
| 2b | An eligible same-hub guide link points to a superseded version. Show the current published guide and update notice. If no eligible current version exists, show unavailable. | S15-04, S15-05 |
| 2c | A guide is cross-hub, unpublished or rejected. Omit it from search and previews and show a generic unavailable response for direct links. | S15-03, S15-07, S15-05 |
| 3a | A rider who can read the building guidance attempts to open another rider's delivery. Deny the delivery lookup. | S15-02, S15-08 |

**Postconditions** · Guide access leaves shifts, assignments and publications unchanged. A permitted guide read grants no delivery access.

**Special requirements** · The same rider, hub and publication checks apply on all three entry paths. Rider-facing guides exclude raw notes, drafts, recipient details, access codes, order records and proof-of-delivery photos. Hub B (test fixture) is solely an authorization test fixture.

![S15-01 · Search](prototypes/UC15/S15-01-search.png)

![S15-02 · Full guide](prototypes/UC15/S15-02-full-guide.png)

![S15-03 · No results](prototypes/UC15/S15-03-no-results.png)

![S15-04 · Updated guide](prototypes/UC15/S15-04-updated-guide.png)

![S15-05 · Unavailable](prototypes/UC15/S15-05-unavailable.png)

![S15-06 · Preview handoff](prototypes/UC15/S15-06-preview-handoff.png)

![S15-07 · Preview unavailable](prototypes/UC15/S15-07-preview-unavailable.png)

![S15-08 · Delivery denied](prototypes/UC15/S15-08-delivery-denied.png)

## UC16 — Submit Location Note
Performed by Codex for Nguyễn Thành Trung. Reviewed by Lý Huỳnh Minh Đăng (acceptance reported by the requester). Edited by Codex.

**Actor** · Rider. **Requirements** · FR-06-2 and FR-07-3.

**Description** · Capture a field observation as a raw note linked to a location.

**Preconditions** · The rider is signed in and can contribute a note for the selected location.

| Step | Basic flow | Screen |
| --- | --- | --- |
| 1 | Open the note form for the selected location. Warn against personal data and access codes. | S16-01 |
| 2 | Enter an observation and select Save note. Validate the text after trimming leading and trailing whitespace. | S16-01 |
| 3 | Save the raw note and its location reference, then confirm the save. UC16 ends here. | S16-02 |

| Branch | Alternative flow | Screen |
| --- | --- | --- |
| 2a | The trimmed note is empty. Keep the form open and show the required-field error. | S16-03 |
| 2b | The trimmed note exceeds the draft limit of 500 characters. Show the limit and keep the entered text. | S16-04 |
| 3a | Saving fails before persistence. Keep the text and offer to retry the same submission. Show the saved state when retry succeeds. | S16-05, S16-07 |
| 3b | The rider double-taps or confirmation is lost after saving. Retrying the same submission returns one saved note and confirms success. A new submission may contain identical text. | S16-06, S16-07 |

**Postconditions** · Success leaves one saved raw note for the submission. Failed saves leave the entered text available for correction or retry. A later AI failure does not undo the save.

**Special requirements** · Allow 1–500 characters after trimming for the review draft. Preserve the rest of the raw text, including uncertainty.

![S16-01 · Note form](prototypes/UC16/S16-01-note-form.png)

![S16-02 · Saved](prototypes/UC16/S16-02-saved.png)

![S16-03 · Empty note](prototypes/UC16/S16-03-empty-note.png)

![S16-04 · Long note](prototypes/UC16/S16-04-long-note.png)

![S16-05 · Save failed](prototypes/UC16/S16-05-save-failed.png)

![S16-06 · Confirm missing](prototypes/UC16/S16-06-confirm-missing.png)

![S16-07 · Retry confirmed](prototypes/UC16/S16-07-retry-confirmed.png)

## UC18 — Prepare, Review and Publish Location Guide
Performed by Codex for Nguyễn Thành Trung. Reviewed by Lý Huỳnh Minh Đăng (acceptance reported by the requester). Edited by Codex.

**Primary actor** · Hub Dispatcher. **Secondary actor** · AI Language Service during preparation. **Requirements** · FR-06-3, FR-06-4 and FR-07-1 through FR-07-3.

**Description** · Prepare a guide from a saved rider note, compare it with the source and explicitly approve or reject it.

**Preconditions** · An authorized dispatcher can review the location in their hub and a raw note has been saved. A current publication may exist.

| Step | Basic flow | Screen |
| --- | --- | --- |
| 1 | Open the review item. See queued or processing status while AI preparation runs asynchronously. | S18-01 |
| 2 | Compare the structured, unapproved draft with the original note. Inspect flags for ambiguous or missing context. | S18-02 |
| 3 | Review the proposed publication and its effect on any current version. Explicitly approve and publish. | S18-10 |
| 4 | See confirmation that the new version is current and the previous version is superseded. | S18-12 |

| Branch | Alternative flow | Screen |
| --- | --- | --- |
| 1a | Preparation reaches the 20-second timeout. Route to the manual queue with the preserved note and offer manual drafting. | S18-03, S18-07 |
| 1b | Preparation returns invalid JSON. Offer manual drafting from the preserved note. | S18-04, S18-07 |
| 1c | Provider quota is exhausted. Offer manual drafting from the preserved note. | S18-05, S18-07 |
| 1d | Mock mode is active. Label it and offer manual drafting from the preserved note. A scripted draft is available for walkthrough. | S18-06, S18-07, S18-02 |
| 1e | The dispatcher starts manual drafting during preparation. Draft from the preserved note and review before any publication. | S18-01, S18-07, S18-10 |
| 2a | Edit the AI draft after comparing it with the source. Leave uncertain details flagged or omit them from the proposed publication. | S18-08, S18-10 |
| 2b | Regenerate, surface processing status and compare the resulting draft again. On failure, use branches 1a–1d. | S18-09, S18-02 |
| 3a | Reject with a reason. Record the reason, preserve the source and keep the draft unavailable to riders. | S18-11, S18-13 |
| 3b | Another dispatcher already handled the draft. Block publication from the stale screen, preserve the note and edits, and reload to compare with the recorded review outcome. | S18-14 |
| 3c | The published guide changes during review. Block publication from the stale screen and keep the note and edits. Reload and compare with the current published version before a new explicit approval. | S18-15, S18-10 |
| 3d | Cancel approval or rejection and return to the editable draft. | S18-10, S18-11, S18-08 |

**Postconditions** · Approval makes the reviewed version current and supersedes its predecessor. Rejection or a blocked review leaves the existing published state intact. The raw note remains linked to the review.

**Special requirements** · N08 sets a manual path within 10 seconds of AI failure, and N12 specifies a 20-second timeout. These are the targets used for BOOYAH-15 from the ticket and Vision 2.2-review. N09 and N10 govern fidelity and uncertainty. N13 governs publication and access. This prototype illustrates the states using scripted data. Runtime timing, AI quality, and authorization benchmarks remain for later milestones.

![S18-01 · Processing](prototypes/UC18/S18-01-processing.png)

![S18-02 · Compare source](prototypes/UC18/S18-02-compare-source.png)

![S18-03 · Timeout](prototypes/UC18/S18-03-timeout.png)

![S18-04 · Invalid json](prototypes/UC18/S18-04-invalid-json.png)

![S18-05 · Quota](prototypes/UC18/S18-05-quota.png)

![S18-06 · Mock mode](prototypes/UC18/S18-06-mock-mode.png)

![S18-07 · Manual draft](prototypes/UC18/S18-07-manual-draft.png)

![S18-08 · Edit draft](prototypes/UC18/S18-08-edit-draft.png)

![S18-09 · Regeneration](prototypes/UC18/S18-09-regeneration.png)

![S18-10 · Approve](prototypes/UC18/S18-10-approve.png)

![S18-11 · Reject](prototypes/UC18/S18-11-reject.png)

![S18-12 · Published](prototypes/UC18/S18-12-published.png)

![S18-13 · Rejected](prototypes/UC18/S18-13-rejected.png)

![S18-14 · Already reviewed](prototypes/UC18/S18-14-already-reviewed.png)

![S18-15 · Guide conflict](prototypes/UC18/S18-15-guide-conflict.png)

## Decision and review record
Performed by Codex for Nguyễn Thành Trung. Reviewed by Lý Huỳnh Minh Đăng (acceptance reported by the requester). Edited by Codex.

| Draft decision | Walkthrough evidence |
| --- | --- |
| EP11-B opens S15-02, then Back returns to the assigned stop. | S11-02-stop-details and S11-02-guide-only each open S15-02. Back returns to the originating state for DEMO-201. S11-02-guide-unavailable and S11-02-neither-context retain delivery actions. |
| Superseded links resolve to the current eligible version or show unavailable. | S15-04 and S15-05. |
| A trimmed note allows 1–500 characters. A retry of the same submission returns the original save result. | S16-03, S16-04, S16-06 and S16-07. |
| A stale dispatcher screen blocks publication and preserves the raw note and local edits. | S18-14 and S18-15. |

| AC | Walkthrough to perform |
| --- | --- |
| AC1 | Inspect actors, preconditions, numbered basic flows, branch steps, postconditions, special requirements and FR IDs for each UC. |
| AC2 | Follow every flow-to-screen reference. Check attribution, all embedded screenshots and the matching PDF. |
| AC3 | Start at S18-03, S18-04, S18-05 and S18-06. In each state inspect RN-016 and follow Draft manually to S18-07. |
| AC4 | Use the Demo hub off-shift search (S15-01 → S15-02), both assigned-stop previews (S11-02-stop-details and S11-02-guide-only) and direct access. For Hub B (test fixture), unpublished and rejected fixtures, exercise filtered search (S15-03), absent preview (S15-07) and denied direct requests (S15-05). Verify other riders' deliveries remain unavailable (S15-08). |

BOOYAH-15 uses the BOOYAH-14 Atrium A fixture, order DEMO-201 in shift D-110 for rider R-17. The published test guide directs riders to use the marked visitor entrance and follow signs to reception. BOOYAH-15 uses v2, v3 and RN-016 as synthetic version and source-note labels for its publication walkthrough. Order, shift and rider identifiers appear only in assigned-stop context.

Open either UC11 preview in the same checkout and follow Open full guide (UC15). S15-02 shows the same Atrium A guide as the off-shift search. Back returns to the originating UC11 state. The [standalone UC15 walkthrough](prototypes/guide-screens.html?screen=S15-06) provides the same guide with a standalone return path.

The requester reported on 20 November 2026 that Lý Huỳnh Minh Đăng reviewed and accepted the BOOYAH-15 packet. The review was relayed by the requester. Detailed review notes were unavailable.

| Handoff | Material |
| --- | --- |
| BOOYAH-24 · FR-to-UC mapping | UC15 → FR-06-1, FR-06-4. UC16 → FR-06-2, FR-07-3. UC18 → FR-06-3, FR-06-4, FR-07-1, FR-07-2, FR-07-3. |
| BOOYAH-29 · Package inputs | [Markdown](UC-F06-F07-Guides.md), [PDF](UC-F06-F07-Guides.pdf), the 30 PNGs embedded in this specification, and the [repository prototype](prototypes/guide-screens.html). |

| AC4 fixture | Search | UC11 preview | Direct link |
| --- | --- | --- | --- |
| Demo hub active rider, off shift | Published v3 opens S15-02 from S15-01 | No assigned-stop entry while off shift | Published v3 opens S15-02 |
| Demo hub active rider, own assigned stop | Published v3 opens S15-02 | Both UC11 preview states open S15-02 and Back returns to the originating stop | Published v3 opens S15-02 |
| Hub B (test fixture) publication viewed by a Demo hub rider | Omit the fixture, S15-03 | Omit preview, S11-02-guide-unavailable or S11-02-neither-context | Unavailable, S15-05 |
| Demo hub unpublished or rejected draft | Omit each fixture, S15-03 | Omit preview for each, S11-02-guide-unavailable or S11-02-neither-context | Unavailable for each, S15-05 |
| Demo hub superseded v2 | Return only current v3 | Preview only current v3 | Show v3 with update notice, S15-04. If no eligible current version remains, show S15-05. |

Local verification on 20 November 2026 covered both EP11-B round trips, the two UC11 states without a guide, off-shift search, direct-link and unavailable states, stale review, and all four manual fallback paths. Chromium rendered all 30 BOOYAH-15 states and the PDF includes all 30 screenshots. The acceptance above is the separate human review record.

In the deny fixtures, omit the restricted object itself. An eligible guide already published to the same hub can remain available. Each row is a walkthrough expectation illustrated by scripted screens.
