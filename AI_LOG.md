# AI Assistance Log

This log records actual AI assistance in this workspace. It is a summary, not a full chat transcript, task-board record, or proof of human review. Original prompts are quoted below where available; tool outputs are summarized. Dates use the session's supplied local date; exact times were not recorded. Do not insert secrets or personal recipient data.

## 2026-10-21 — Repository Review and Setup Planning

- Tool/model: Codex in T3 Code, `gpt-6.1-sol`.
- User request: "đọc qua folder hiện tại và document tới PA2, chúng tôi cần bắt đầu setup repo, hãy lên plan trước"
- Purpose: understand the workspace and course requirements and propose a repository setup plan before implementation.
- AI work: inspected preparation files, read PA1/PA2 and reporting/AI instructions, extracted the supplied Vision templates and legacy plan guidance, and consulted official tooling documentation. Wrote a proposed plan, without initializing Git or scaffolding the application in that task.
- Files changed: `REPO_SETUP_PLAN.md` (initial draft).
- Verification: checked that the plan existed, its local file links resolved, and its section-attribution lines were present. Confirmed the workspace was not yet a Git repository and had no `src` folder.
- Limitations: no application survey, team contract, member assignments, training, application, deployment, or benchmark was performed. No human review was recorded.
- Evidence: the original request and tool history are in this T3 conversation; no separate transcript export was created.

## 2026-10-21 — PA1 Local Repository Foundation

- Tool/model: Codex in T3 Code, `gpt-6.1-sol`; independent AI reviewer: `gpt-6-astra`.
- User request: "thực tế là sắp tới mới chỉ là deadline cho PA1, nhưng tôi đang đảm nhận setup repo, những phần nào cần quyết định chung của team thì skip, còn lại theo plan setup. đồng thời thảo luận với tôi để viết AGENTS.md"
- Purpose: implement only the PA1 repository foundation that does not depend on team decisions and discuss repository instructions with the user.
- AI work: initialized local Git on `setup/repo-foundation`; created navigation/contribution documents, reserved documentation/source folders, task/PR templates, ignore rules, editor/line-ending configuration, and a draft `AGENTS.md` with portable RTK guidance. Updated the plan to reflect the corrected PA1 timing. Existing project/research/course sources remain at their original paths.
- Files changed: `.gitignore`, `.gitattributes`, `.editorconfig`, `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `RTK.md`, `.github/ISSUE_TEMPLATE/task.md`, `.github/pull_request_template.md`, `docs/README.md`, `docs/requirements/README.md`, `docs/management/repo-setup-log.md`, `docs/analysis-and-design/.gitkeep`, `docs/test/.gitkeep`, `src/README.md`, and `REPO_SETUP_PLAN.md`.
- Verification: local file-link and UTF-8/newline/whitespace checks passed; 10 ignore cases passed; PDF binary/Markdown LF attributes checked; no nested `src/.git` or remotes found. Eight existing project files were checked against their previously recorded paths and byte sizes; size comparison is not a baseline content-hash check. `git diff --cached --check` passed after staging.
- AI review: the independent reviewer read the setup files, checked 38 links, and consulted PA1 using `pdftotext`. No Critical/Important findings; the minor finding was to update the setup record after final verification/commit, addressed in this task. AI review is not human course review.
- Human involvement: the user corrected the milestone to PA1 and limited execution to work without team decisions. No human review of the resulting files is recorded.
- Deferred: stack, remote ownership/access, board, team branch/merge policy, Spec Kit, application scaffold, hosted CI, and PA1 deliverables outside the assigned setup scope.
- Status: local foundation completed and staged for its initial commit. Final checks inspected 36 tracked files, 57 local file links (none missing or untracked), and 15 new text files; `git diff --cached --check` passed. The commit result is recorded in Git history and the task handoff. No remote publication is authorized by this entry.
- Evidence: original prompt and tool history are in this T3 conversation; no separate transcript export was created.

## 2026-10-21 — Requirements Approval and AI Logging Rules

- Tool/model: Codex in T3 Code, `gpt-6.1-sol`.
- User clarification: "những thao tác về cập nhật các functional requirements, đặc biệt là liên quan đến database, đồng thời thêm một quy định về AI_LOG.md"
- Purpose: record the user's requested approval boundary and maintain factual AI-assistance history.
- AI work: added an explicit approval gate for functional-requirement and database model/schema/migration changes, including changes implied by implementation. Added per-task AI logging rules and created this log from the available conversation history.
- Files changed: `AGENTS.md`, `AI_LOG.md`, `README.md`, `CONTRIBUTING.md`, and `docs/management/repo-setup-log.md`.
- Human decisions: approval is required for functional-requirement updates, especially database-related changes. The detailed log fields and grouping by task are AI-proposed implementation details of the requested logging rule; no additional team agreement is claimed.
- Verification: the full repository file-link check passed (57 links); all 15 new text files passed UTF-8/final-newline/trailing-whitespace checks; `git diff --cached --check` passed. AGENTS.md links to this log, and README/CONTRIBUTING link the rules and log.
- Limitations: no functional requirements, application code, database structure, or migration were changed. No original evidence was fabricated or backdated.
