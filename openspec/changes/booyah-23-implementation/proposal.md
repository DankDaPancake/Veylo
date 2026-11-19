## Why

[BOOYAH-23 / PA3-T01](https://thaikiet291006.atlassian.net/browse/BOOYAH-23) requires Project Plan v2.0 and traceable Section A Changes entries by 19 November 2026. Submitted v1.6 contains obsolete Sprint 3 assignments, a 24 November PA3 target and unsupported setup/seed claims, while the current repository already contains the approved application foundation.

## What Changes

- Revise `docs/management/ProjectPlan.md` from the submitted v1.6 source, retaining its section structure and five-sprint planning sequence. Update sections 2.3, 4.2, 4.3 and affected build, process, risk and later-sprint passages using dated Jira/repository evidence.
- Prepare Section A entries mapping old section -> new content -> reason/source -> revised location. Use BOOYAH-29's canonical shared Changes.md if its path is agreed; otherwise hand off a clearly labelled `docs/management/pa3/ProjectPlan-Changes.md` fragment for that owner to integrate.
- Link the plan from `docs/README.md`, preserve factual authorship/review metadata, and verify BOOYAH-23 AC1-AC4 with proportional document checks and actual human acceptance.

**Goals:** a current, evidence-based plan; explicit pending decisions; complete change traceability; no duplication of another member's deliverable. The functional requirements in this change describe document-revision outputs and observable handoff behavior. Non-functional requirements describe readability, compatibility and verification integrity. They formalize BOOYAH-23's existing contract at the user's explicit request for specs; they add no Veylo business functionality or product NFR thresholds.

**Non-goals:** application/UI/API/auth implementation; database models/migrations/seed; Figma or use-case ownership; editing Vision on behalf of BOOYAH-26/27; meeting reports; selecting a new stack/provider/hosting/team policy; PDF tooling/export, shared-ledger assembly or ZIP packaging owned by BOOYAH-29; automatic Jira transitions, publication, push, merge or archive.

## Capabilities

### New Capabilities

- `project-plan-revision`: the BOOYAH-23 documentation-delivery contract for versioned changes, current scheduling, evidenced status, Vision consistency and bounded handoff. This is a documentation workflow capability, not an application feature.

### Modified Capabilities

None. No existing application specification is changed. Main specs were empty at inspection; app-foundation remains a separate active change.

## Impact

Implementation will affect the plan, Section A ledger entries/fragment, the documentation index and factual AI records. Application source, database, dependencies, runtime interfaces, existing foundation artifacts and workflow configuration remain unchanged. This proposal run creates planning artifacts and an AI-log entry only; it does not create the plan or execute its implementation tasks.

### Jira dependencies and ownership

| Ticket | Relationship to BOOYAH-23 | Boundary |
| --- | --- | --- |
| BOOYAH-26 (Kiệt), BOOYAH-27 (Đăng) | Vision content for final consistency | Draft factual corrections now; confirm the version used at final review. Do not require both tickets to be Done before any plan work, or resolve their product decisions here. |
| BOOYAH-12 (Kiệt) and implementation tickets | Evidence of current delivery state | Read status/artifacts; do not implement, archive or accept their work in BOOYAH-23. |
| BOOYAH-29 (Khánh) | Downstream consumer of plan and Section A entries | Owns one shared Changes.md, PDF/export pipeline and final package. Its completion is not an upstream prerequisite for handing off Section A. |
| BOOYAH-28 (Trung) | Separate reports consumer of factual AI records | Same assignee does not make meeting/report writing part of this task. |

Trung remains the assignee; Đăng is the designated independent reviewer. Risk owners or team roles are not reassigned by this change.

### Reconciliation with exploration and current sources

Fresh Jira reads on 19 November show BOOYAH-23 **In Progress**, rather than the exploration's To Do; its ACs/due date remain unchanged. BOOYAH-26 is In QA Review and BOOYAH-27/29 are To Do. These observations are not final acceptance evidence and must be refreshed at review.

Jira still says feedback was not found and describes the repository on 16 November. The requesting member has confirmed full PA2 marks and no feedback: record that provenance and internal-review updates, never invent TA comments. Local dev at `04ec211eb8d9835ed6190bd602d3c5e1c10f9711` contains foundation/root-layout PRs #6/#7 and cleanup #8. Current logging uses `docs/ai-log/`, despite the older Jira handoff spelling `ai-logs`.

Vision v2.0-review is a draft input. Its N02 PA4 F05 checkpoint conflicts with v1.6's PA5 implementation allocation; final scope/schedule consistency requires the owning team to reconcile the conflict. No new date, relaxed NFR or approval is inferred here.

### Source baseline

- [Submitted ProjectPlan v1.6, 7 November](https://drive.google.com/file/d/1UIfF7g3XSgpKKJu6k9VisnWEKIj4hjvh/view).
- [PA3 handout, Section A and submission rules](https://drive.google.com/file/d/1vpm_jCN9Q08evz_063eq3wLSnvbNkKul/view).
- [Weekly Reports guideline](https://drive.google.com/file/d/1Hh3bkvcX13Lj_XMCrESMrtxLb-5Lqw36/view).
- [Vision v2.0-review](https://drive.google.com/file/d/1FGJ7CS2HvPsV1oz2lmePL8cSHBYwjGKH/view) and [BOOYAH-26 Changes](https://drive.google.com/file/d/1XEPEiGuyVp5pO64I4s3JhaNHUiyusWI0/view).

Downloaded originals are available outside the repository for comparison. Verify the versions during apply; cached copies are not proof that Drive has not changed. PA3 submission is 21 November per Kiệt's recorded Jira confirmation; cutoff hour and actual sprint-end date remain unconfirmed.
