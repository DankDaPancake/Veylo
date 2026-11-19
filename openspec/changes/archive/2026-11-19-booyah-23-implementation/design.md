## Context

See [proposal.md](proposal.md) for motivation, source links, current Jira differences and scope. The behavior contract is [project-plan-revision](specs/project-plan-revision/spec.md). Design is included because evidence provenance, final-consistency dependencies and shared-file ownership need explicit decisions before editing the deliverables.

The current repository is an application foundation: Next.js App Router landing page and application-only health endpoint, safe CLI DB probe and model-free Prisma datasource. There are no auth/order/business modules to modify for BOOYAH-23. The plan and canonical shared Changes.md are absent locally; v1.6 and the handouts are available as downloaded external sources. Existing Markdown editing, documentation index and task-branch PR conventions are sufficient.

## Goals / Non-Goals

**Goals:** preserve v1.6 structure, make every material correction traceable, keep independent work moving while final inputs are pending, and produce a bounded Section A handoff that another owner can integrate.

**Non-goals:** introduce application architecture, automation services, Jira sync jobs, a new document framework or dependency; decide another task's requirements; duplicate packaging/report ownership. See proposal.md for the full boundary.

## Decisions

### 1. Targeted Markdown revision over a rewrite

Use `docs/management/ProjectPlan.md` as the authoritative revision, keeping sections 1-4.5 and the five-sprint sequence unless a source-grounded correction requires a local edit. Update sections 2.3/4.2/4.3 plus affected process/build/risk/later-sprint paragraphs. Add its navigation link to `docs/README.md`.

This minimizes review and change-ledger cost. A new plan structure would require unnecessary remapping; generating a new application component would not satisfy the ticket. Preserve baseline team-role information as such, while using actual Jira ownership for current Sprint tasks. Do not convert old role leads into new assignees.

### 2. Reuse existing sources and interfaces

| Input / interface | Consumer / output | Validation boundary |
| --- | --- | --- |
| Submitted v1.6 plus handouts | Versioned plan and Changes comparison | Record original version/date/link; no PA1 template substituted for v1.6 |
| PA3 Jira task descriptions/fields | Sprint table: key, scope, assignee, reviewer, due date, observed status | Capture timestamp/timezone; reviewer may require the description, not the assignee field; refresh all pages/rows at review |
| Git commit, package metadata, setup/scripts/schema and actual check records | Deliverable/build/risk statements | Existence, historical verification and human acceptance remain distinct evidence types |
| Vision 26/27 content | Role/group/exclusion/later-sprint consistency | Record compared version and unresolved conflicts; do not modify Vision to force a pass |
| Revised plan and Section A entries | Đăng review; BOOYAH-29 integration | Actual review result, file links and outstanding limits; no assumed shared-ledger integration or PDF success |

The data flow is source evidence -> targeted plan revision -> Section A comparison -> document/source verification -> human review -> handoff. These are document interfaces, not new application APIs or database models. Keep observations in the relevant plan source/revision notes and ledger entries; no extra evidence database or mandatory standalone evidence report is introduced.

### 3. Separate drafting, final consistency and downstream delivery

Jira allows factual corrections before final Vision acceptance. Work from existing drafts without treating their uncertain values as newly approved requirements. Final AC4 needs an agreed, consistent comparison version, not merely a Done label on another ticket. If an unresolved conflict prevents AC4, leave that final check open while retaining independently completed corrections/ledger preparation.

BOOYAH-12 and implementation tickets are evidence inputs. Their implementation/acceptance is not assigned to this task. BOOYAH-28's meeting/report work remains separate even though Trung owns both. BOOYAH-29 is downstream: its finished package is not a prerequisite for BOOYAH-23 handing over complete Section A entries.

### 4. One shared Changes.md with a bounded fallback

Use the shared ledger path identified by BOOYAH-29 and edit only Section A when coordinated. If no path is agreed, deliver `docs/management/pa3/ProjectPlan-Changes.md` as a clearly labelled handoff fragment. Each entry contains an original location/content reference, revision, reason/source and revised location. Reconcile the fragment after any Vision/review fix.

This avoids concurrent edits to other sections or creation of a competing authoritative ledger. BOOYAH-29 remains responsible for integration, PDF conversion/render checks and ZIP assembly. No new export pipeline is chosen here. Preparing reviewable input is within BOOYAH-23; completing another owner's task is not.

### 5. Evidence-backed corrections, not new team decisions

- Replace the obsolete seven-task table with the current complete PA3 task inventory; do not hard-code a permanent count of 19 if Jira changes before review.
- Use the recorded 21 November submission date. Keep cutoff hour and sprint-end date unconfirmed until sourced; a deadline is not automatically the end of a 2-3 week sprint.
- Reconcile Next.js 14/Sprint 2 setup language with current Next.js 16.4.6 and the actual foundation/root-layout merge history. Preserve the distinction between a recorded past build and a build rerun now.
- Replace unsupported seed/Docker/AI-fallback/F04-test completion claims with sourced results or planned/unverified work. Native PostgreSQL is an accepted foundation alternative; full business seed belongs to its owner.
- Align branch naming with feature/** and the course cadence with two Weekly Scrum meetings per sprint; do not invent actual meetings or new attendance agreements.
- Record 17 November OpenSpec approval and root working location without inventing a submission-placement exception or completed training.
- Separate minimum PA3 sign-in/Dispatcher-hub guard from later full F01 administration. Retain three roles, orders vs attempts, notes/drafts/published guides, rule-based F05 and the existing exclusions.
- Retain unconfirmed later dates, capacities and new risk owners as inherited assumptions/proposals. The N02 PA4/F05 PA5 conflict must be reconciled by its owners before claiming final consistency.

### 6. Proportional testing and acceptance evidence

**Document-level unit checks:** use small read-only assertions/manual comparisons for individual Jira row fields, unique keys, ledger old/new/reason/location completeness, local links/anchors, English/source headings and immediate truthful attribution. Standard Python/file checks are sufficient; do not add a committed parser, test framework or npm dependency solely for these documents.

**Integration checks:** compare the complete plan table to a fresh Jira snapshot, revised passages to v1.6 and Changes entries, completed-state claims to repository/Jira evidence, and scope/later allocations to the chosen Vision version. Confirm documentation navigation and that the application/schema/dependency diff is empty. Inspect untracked files directly as well as running `git diff --check`.

**Human acceptance:** Đăng checks three random Jira rows and the AC1-AC4 package. Record only review actually received, with the reviewed revision/commit or file version. Acknowledging a blocking discrepancy does not pass its AC. No app unit/integration tests are needed for an unchanged runtime; existing npm checks remain the owning implementation tasks' checks. No CI, DB probe or PDF pass is inferred from document checks.

### AC and requirement traceability

| Jira criterion | Spec requirements | Verification / tasks |
| --- | --- | --- |
| AC1 | DOC-FR-01, DOC-FR-05, DOC-NFR-01, DOC-NFR-03 | Source/no-feedback provenance; v1.6 diff and complete Section A entries; 1.1, 2.3, 3.1-3.3 |
| AC2 | DOC-FR-02, DOC-NFR-03 | Full refreshed table and actual reviewer sample of three; 1.2, 2.1, 3.1-3.3 |
| AC3 | DOC-FR-03, DOC-NFR-01, DOC-NFR-02, DOC-NFR-03 | Evidence sweep, honest attribution and empty runtime diff; 1.2, 2.1, 3.1-3.3 |
| AC4 | DOC-FR-04, DOC-NFR-02, DOC-NFR-03 | Chosen Vision/version comparison, conflict resolution evidence and human review; 2.2, 3.2-3.3 |

## Execution order and parallel work

Wave 1: source/version confirmation (1.1) and dated Jira/repository snapshot (1.2) are independent. Wave 2: produce the targeted plan (2.1), then compare Vision (2.2) and prepare Section A entries (2.3) in parallel on different files. Wave 3: document-unit checks (3.1), then cross-source integration checks (3.2) after the final inputs/fixes, then review/handoff (3.3). Recheck the ledger if 2.2 changes the plan. This describes potential work scheduling; it does not assign extra team members or authorize agents automatically.

## Risks / Trade-offs

- Stale cached Drive files or changing Jira -> confirm sources during apply and refresh the final review snapshot; store the observation time and source version.
- Draft Vision conflict -> factual corrections can proceed; final AC4 stays unverified until owner-confirmed consistency is available. Do not weaken an NFR or choose a new team allocation.
- Shared-ledger conflict -> use the labelled Section A fragment fallback and leave integration to BOOYAH-29.
- Compressed 19 November task deadline and Đăng's other assignments -> prepare small reviewable edits and identify the actual review slot; estimates exclude waiting and do not reassign work.
- Confusing automated checks with human approval -> separate actual check results, historical evidence and Đăng's acceptance record; leave unfinished acceptance tasks unchecked.

## Migration Plan

There is no application/data migration or deployment. Implementation edits only the scoped Markdown deliverables/index and factual AI records. Review on the task branch before any separately authorized publication. Reverting document edits restores the old document state; keep AI history append-only. PDF/shared-ledger packaging remains BOOYAH-29's downstream work.

## Open Questions and external confirmations

These confirmations select source content or handoff metadata without changing this approach/task boundary: the current combined Vision 26/27 version; canonical shared Changes.md path (fallback already defined); actual sprint calendar/cutoff and reviewer availability. Unknown dates/owners stay explicit, rather than blocking unrelated drafting.

The F05 checkpoint discrepancy is an external consistency blocker for final AC4, not an unresolved architecture decision to implement here. The owning team must provide the resolution; task 2.2 and final integration/acceptance checks cannot close while it remains inconsistent. No decision is inferred from this proposal's creation or the user's authorization to plan.
