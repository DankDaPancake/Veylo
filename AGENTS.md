# Repository Instructions

@RTK.md

Read [RTK.md](RTK.md) for command-output guidance. These instructions apply throughout this repository unless a more specific instruction applies.

## Current Stage and Authority

- The project is named **Veylo (Velocity Flow)**, formerly SmartRoute. Existing SmartRoute filenames and historical records remain valid references; do not interpret the rename as a change in functional requirements.
- [AGENTS.md](AGENTS.md) is the shared instruction source. [CLAUDE.md](CLAUDE.md) imports it so Claude follows the same rules; maintain shared rules here instead of creating divergent copies.
- The upcoming deadline is PA1. The current assignment is repository setup; the application has not been implemented.
- Read [README.md](README.md), [the documentation index](docs/README.md), and the relevant course assignment before changing project material.
- The current product-scope draft is [Group9_SmartRoute.md](Group9_SmartRoute.md). The `BC26-BCE001*` documents are background research, not approval to implement every idea they describe.
- Follow the user's current task scope. When the user says to skip team decisions, record those decisions as pending and continue independent work.
- Do not choose a stack, AI provider, hosting, budget, external board, team responsibilities, or team policies on the team's behalf. Recommendations must remain explicitly proposed.

## Project Boundaries

- The proposed actors are Hub Dispatcher and Delivery Rider.
- Preserve the distinction between orders and individual delivery attempts.
- The proposed recommendation logic is rule-based. The proposed AI feature normalizes rider notes into drafts for dispatcher review before publication.
- Preserve raw notes and uncertainty. Do not invent location facts, provider capabilities, measurements, or research findings.
- Live carrier integration, continuous GPS tracking, learned success prediction, and fleet-wide optimization are outside the current draft MVP.

## Files and Documentation

- Use one Git repository at the root. Keep application work in `src`; do not create `src/.git`.
- Spec Kit becomes required from PA2; its artifacts must be under `src`. Do not create fake generated artifacts or claim initialization/training before it happens.
- Formal submitted documents must be English Markdown. Communicate with the user in Vietnamese unless requested otherwise; preserve original-language quotations and research sources.
- Use Mermaid for course diagrams where appropriate. Keep Markdown as the editable source and regenerate PDF exports after material changes.
- In submitted report sections, place actual performer, reviewer, and editor information immediately after the heading. Leave unknown attribution pending.
- Preserve existing user work. Keep relative links valid when moving or renaming files and distinguish draft sources from older PDF exports.
- Never fabricate survey screenshots, tasks, dates, meeting minutes, reviews, Git history, training evidence, or benchmark results.
- Keep secrets, credentials, and real recipient data out of commits and AI requests. Preserve factual AI-use records; never label AI work as independently completed student work.

## Working and Verification

- Inspect the current files and Git state before editing. Use small, relevant changes; avoid unrelated rewrites and formatting.
- Read available nested `AGENTS.md` files before working in their directories.
- Use UTF-8 text and the repository's `.editorconfig` and `.gitattributes` settings.
- Run checks relevant to the change and report the actual command/results. Do not invent successful tests, builds, deployment, or human review.
- There is currently no application test suite or build command. For document/configuration work, inspect new files directly, check relative links, and use Git whitespace/diff checks. `git diff` alone does not inspect untracked files.
- Do not install frameworks or add application scaffolding while the stack remains a pending team decision.

## Branch Protection

- Treat the eventual default/integration branch (for example, `main`) as protected. Work on task branches and submit pull requests; do not push directly, force-push, or delete a protected branch.
- Proposed merge requirements: at least one approving human reviewer other than the author, resolved review conversations, and all required checks passing against the latest changes. AI review does not replace human approval. Material changes after approval must be reviewed again.
- Do not bypass, disable, weaken, or remove branch protection or required checks to get a change merged. Report a blocking rule/check and resolve its cause; changes to protection settings require explicit authorization.
- Once the remote exists, verify which protections the private repository's GitHub plan can enforce and record the actual settings. If a setting is unavailable, document the limitation and manual review process; do not make the repository public or claim server enforcement as a workaround.
- These are repository working instructions and proposed remote settings, not a claim of team adoption or GitHub enforcement. The current local setup branch is not evidence that a protected remote branch exists. Team branch names, merge strategy, and remote administration remain pending.

## CI/CD — After Stack Selection

- Do not create a framework-specific pipeline before the stack, reproducible local commands, and dependency locks are selected. Record future pipeline work as planned, not passing CI.
- After stack selection, propose CI that runs on pull requests to the protected branch and pushes to that branch: formatting/lint checks, type checks where applicable, meaningful automated tests, and a production build. Include documentation/link checks and disposable-database migration/integration checks when relevant to the changes.
- Use stable, unique job/check names. Enable required checks in branch protection only after their workflows exist and have been verified. Required checks must report a result for every relevant PR; path filters must not leave a required check permanently pending.
- Keep CI reproducible with pinned runtime/tool versions and committed dependency locks. Use least-privilege workflow permissions; do not expose secrets to untrusted PR code. Never substitute a no-op or skipped check for actual verification.
- Select CD only after hosting, deployment environments, access, and budget are agreed. Deploy only a verified, approved commit/artifact; production deployment requires explicit authorization or a previously approved release policy. Do not deploy arbitrary PR branches to production.
- Keep deployment credentials in the selected CI platform's secret storage, separate from source and logs. Plan smoke checks and a rollback path. Do not run database migrations against shared/production data without the required database-change approval and an appropriate backup/recovery plan.
- Verify environment-protection availability for the chosen private repository/plan before relying on automated deployment approvals. If unavailable, retain an explicitly authorized manual release process rather than silently removing the approval gate.
- Document the actual commands, required check names, deployment trigger, environments, and rollback steps when implemented. Do not claim a successful build, deployment, rollback, or hosted workflow without its real result.

## Changes Requiring User Approval

- Ask the user before adding, changing, or removing functional requirements, including changes expressed through implementation rather than a requirements document. This includes actors/permissions, workflows, business rules, state transitions, validation rules, and feature acceptance criteria.
- Ask before changing database models, schema, relationships, constraints, or migrations. Do not silently encode a new requirement in database structure or data lifecycle rules.
- Before requesting approval, prepare a concrete proposal or diff for review, explain the reason and affected behavior/data, and identify migration or compatibility implications. Wait for explicit approval before applying the dependent change. Proposing a database design is allowed; writing that design into the project's authoritative schema or applying it requires approval.
- Approval already given for a specific requirement/schema change remains valid within that scope; do not ask again for each implementation step. Fixes that restore already approved behavior without changing requirements or database structure do not need a fresh requirements decision.
- Continue other authorized, scoped, reversible work without repeated confirmation. Leave team-owned decisions pending unless the user delegates them. A local task does not by itself authorize publishing, pushing to shared branches, merging, or destructive actions.

## AI_LOG.md

- Maintain [AI_LOG.md](AI_LOG.md) at the repository root. Update it for every task that uses AI, including research, planning, documentation, repository setup, implementation, and review; one entry may group related tool calls within a task.
- Before handing a task back or committing its changes, record the actual date, AI tool/model when known, the user's request or faithful prompt reference, purpose, work performed, affected files, commands/checks and results, and remaining limitations or approvals.
- Distinguish AI-generated work, AI review, and human work/validation. Record human validation only when it actually happens. Mark unavailable metadata or evidence as unavailable rather than inventing it.
- Include the outcome of requirements/database approval requests when relevant; a proposal awaiting approval is not completed implementation.
- Keep history append-only. Add a correction/amendment when an entry is wrong; do not rewrite prior entries to fabricate a cleaner history. Task status and verification may be updated while that task's entry is still in progress.
- Do not log secrets, credentials, personal recipient data, or unredacted sensitive prompts. Use a redacted summary/reference instead. Preserve available original prompts/chat evidence separately when required by the course; the summary log alone is not a full transcript.
- Keep the log factual and concise. It supplements the course AI usage declaration and supporting evidence; it does not replace them.
