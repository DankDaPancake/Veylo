# PA4 AI Usage — DankDaPancake

## 2026-11-25 — Summarize the PA4-2026 assignment

- User asked for a summary of the supplied PA4 handout. Codex extracted the five pages with pdftotext and summarized the six graded sections, architecture diagrams, implementation and submission requirements. No project implementation or external changes.

## 2026-11-25 — Read the PA4 Sprint 4 assignment backlog

- User asked to read the assigned tasks in the attached task.md. Codex read the UTF-8 attachment and summarized the owner's T02/T05 tasks, T03/T07 reviewer responsibilities, dependencies and approval gates. Dates and estimates were treated as proposed by the attachment. No Jira or implementation changes.

## 2026-11-25 — Start drafts for Đăng's PA4 Jira work

- Task owner: Lý Huỳnh Minh Đăng (DankDaPancake). This records an AI drafting session for the assigned work. Member declaration and original chat export remain pending.
- AI tool/model: Codex in T3 Code, gpt-6.2-sol. Access date: 25 November 2026 ICT. Draft editing check recorded at 23:20 ICT.
- Request and purpose: “bắt đầu soạn công việc cho Đăng”. Reconcile the draft backlog with live Jira and start the time-sensitive data contract plus preparation for reporting and integrated QA.
- AI-generated work and review: Read BOOYAH-35, BOOYAH-38, BOOYAH-39, BOOYAH-40, BOOYAH-43 and BOOYAH-45 against the earlier attachment. Live Jira supersedes the attached T02 owner for planning this work: BOOYAH-35 belongs to Trung. Đăng's owned issues are BOOYAH-38, BOOYAH-43 and BOOYAH-45. Read the local PA4 and Weekly Reports PDFs, use cases, Vision, F02 spec, Prisma schema and local run instructions. Drafted the proposed contract and synthetic fixture, reporting templates and unexecuted QA scenario plan.
- Affected files: docs/analysis-and-design/pa4/F03-F04-data-contract.md, docs/test/pa4-fixtures/f03-f04-contract-v0.1.json, docs/test/PA4-F03-F04-verification.md, docs/management/pa4/WeeklyReports.md, docs/management/pa4/AIUsageReport.md and the PA4 log/index.
- Commands and results: Fetched origin/dev at 87e82cef49ff179c64f341e1428c4bbab989974c and created a separate worktree on docs/pa4-dang-drafts. pdftotext returned the local course handout text. Used the local Weekly Reports handout after the Drive viewer was inaccessible. Python verification passed for the seven UTF-8 files, 25 relative links, fixture invariants, 11 QA scenarios, four meeting sections and five declaration rows. Git whitespace checks passed with the new files included. Application checks remain pending.
- Human validation and approvals: Pending. The contract records proposed schema, wire format and three open business decisions. No schema, migration, application, Jira status, Git remote branch or submitted report changes. No meetings, test results or review were asserted.

## 2026-11-27 — Pair GPT-6.2 Sol and Gemini 4 Neon for BOOYAH-38 and BOOYAH-45

- Task owner: Lý Huỳnh Minh Đăng (DankDaPancake). AI tools: Codex GPT-6.2 Sol and Antigravity Gemini 4 Neon via T3 Code.
- Request and purpose: Recheck and revise BOOYAH-38 with Sol, then have Gemini review it. Recheck and revise BOOYAH-45 with Gemini, then have Sol review it. Sprint reports are out of scope.
- Work and checks to date: Read BOOYAH-38 and BOOYAH-45 via Atlassian MCP. Dispatched scoped draft tasks on the local docs/pa4-dang-drafts worktree and recorded SHA-256 baselines for both sprint report drafts. The T3 issue panel could not resolve the Jira URLs or keys.
- Status: Agent tasks dispatched. Cross-review results and final checks pending. Human approvals, migration and application verification remain pending.
- BOOYAH-38 first pass: GPT-6.2 Sol revised the contract and fixture, read Jira and BOOYAH-40 comments (0 each), and verified fixture invariants and seven links. D1–D3 and schema approval remain pending. An independent Gemini 4 Neon review was dispatched after the edit.
- BOOYAH-45 first pass: Gemini 4 Neon revised docs/test/PA4-F03-F04-verification.md, adding acceptance evidence and SHA handoff requirements and keeping all 12 scenarios and four permission checks unrun. Agent reported nine valid relative links and no whitespace diagnostics. Parent read live Jira (To Do, last updated 25 Nov, zero comments) and dispatched independent GPT-6.2 Sol review.
- Cross-reviews completed: Gemini reviewed BOOYAH-38 and GPT-6.2 Sol reviewed BOOYAH-45. Codex updated the three draft files to address fixture payload/replay, proposed historical assignment handling, PA3 seed and F02 migration compatibility, race/acknowledgement evidence and final QA scope. D1–D3 and final shift selection/route mappings remain open.
- Verification: Python checked UTF-8/LF, whitespace, attribution, relative links, fixture invariants and all 16 QA cases still marked Not run. Both sprint report SHA-256 digests match the start-of-session baselines. Git diff --check passed. Human review, schema/seed approval, migration, system tests and external handoff remain pending.

## 2026-11-27 — Trace PA4 dependents and handoff locations

- Task owner: Lý Huỳnh Minh Đăng (DankDaPancake). AI tool: Codex GPT-6.2 Sol in T3 Code.
- Request: Identify members and Jira tasks waiting on Đăng and recommend where current deliverables should go.
- Work: Read BOOYAH-38 through BOOYAH-45 via Atlassian MCP. Checked Git status and repository branch/PR conventions. Identified the T05 fixture consumers, T12 exact-SHA consumers and T10 packaging handoff. Recommended a scoped BOOYAH-38 draft PR into dev and Jira links. Current drafts are local. No publication or Jira mutation.

## 2026-11-27 — Check PA4 branches, spec ownership and Drive handoff

- Task owner: Lý Huỳnh Minh Đăng (DankDaPancake). AI tool: Codex GPT-6.2 Sol in T3 Code.
- Request: Check remote branches before push, determine whether the assigned work needs an OpenSpec edit, and identify any manual Drive uploads.
- Work and verification: git ls-remote confirmed live dev at 87e82ce and main at 240cb62, with no published PA4 task branch. GitHub REST returned zero open PRs. Inspected the local draft branch, OpenSpec inventory, PA4 handout and Jira BOOYAH-38/39/40/43/44/45.
- Outcome: Recommended a scoped BOOYAH-38 draft PR and separate BOOYAH-45 handoff. Feature implementation specs are owned by F03/F04 task owners. Deliver approved behavior through the owning OpenSpec change. PA4 requires a ZIP and Jira names Khánh as packager. No current draft publication, spec edit, Drive upload or Jira update.

## 2026-11-27 — Prepare BOOYAH-38 draft PR

- Task owner: Lý Huỳnh Minh Đăng (DankDaPancake). AI tool: Codex GPT-6.2 Sol in T3 Code.
- Request: Begin creating the commit and PR. Scope is the BOOYAH-38 contract and synthetic fixture handoff.
- Work and checks: Confirmed live dev at 87e82ce and no matching remote task branch. Python checked contract links, pending D1–D3, fixture order/capacity, Start/replay/reload and denial invariants, plus the log index. Prepared the scoped draft branch using the repository PR template.
- Pending: Human review, D1–D3, schema approval, migration/seed and sign-in evidence. QA and sprint-report drafts stay local.
