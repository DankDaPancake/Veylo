# Repository Instructions

@RTK.md

Read [RTK.md](RTK.md) for command-output guidance. These instructions apply throughout this repository unless a more specific instruction applies.

## Current Stage and Authority

- The project is named **Veylo (Velocity Flow)**, formerly SmartRoute. Existing SmartRoute filenames and historical records remain valid references; do not interpret the rename as a change in functional requirements.
- [AGENTS.md](AGENTS.md) is the shared instruction source. [CLAUDE.md](CLAUDE.md) imports it so Claude follows the same rules; maintain shared rules here instead of creating divergent copies.
- The user reports PA1 finalized and submitted. Current work is repository governance and PA2 preparation; do not infer a stack or implementation status from submission alone.
- Read [README.md](README.md), [the documentation index](docs/README.md), and the relevant course assignment before changing project material.
- The current product-scope draft is [docs/requirements/project-proposal.md](docs/requirements/project-proposal.md). Older root preparation/research files are ignored local references, not published requirements or approval to implement additional ideas.
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
- For `Group09_Veylo.md`, the user explicitly chose shared attribution at the major B and D sections; do not require duplicate attribution in their subsections.
- Preserve existing user work. Keep relative links valid when moving or renaming files and distinguish draft sources from older PDF exports.
- Keep published PA1 documents under `docs/`. Leave unavailable team information/evidence for the user to fill in; do not turn placeholders into claimed agreements. Do not re-add ignored research, course bundles, or obsolete exports unless requested.
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

- The user has confirmed `main` for stable releases and `dev` for sprint integration. `dev` exists. Protection for both branches was applied and read back on 2026-10-25; see [the governance record](docs/management/branch-governance-proposal.md). Recheck live settings when relying on them.
- Treat the eventual default/integration branch (for example, `main`) as protected. Work on task branches and submit pull requests; do not push directly, force-push, or delete a protected branch.
- Approved merge requirements: at least one approving human reviewer other than the author, resolved review conversations, and all required checks passing against the latest changes. AI review does not replace human approval. Material changes after approval must be reviewed again.
- Do not bypass, disable, weaken, or remove branch protection or required checks to get a change merged. Report a blocking rule/check and resolve its cause; changes to protection settings require explicit authorization.
- Once the remote exists, verify which protections the private repository's GitHub plan can enforce and record the actual settings. If a setting is unavailable, document the limitation and manual review process; do not make the repository public or claim server enforcement as a workaround.
- Approved workflow: task branches from `dev`, squash PRs into `dev`, and milestone PRs with merge commits from `dev` to `main`. Keep both long-lived branches. GitHub protection was verified on 2026-10-25; required CI checks await real workflows. Per-PR merge method remains a human convention.

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

## Mandatory AI Usage Logging

- Keep [AI_LOG.md](AI_LOG.md) at the root as the historical record and entry point. Record every new AI-assisted task in `docs/ai-logs/<phase>/<github-handle>.md`, following [the log guide](docs/ai-logs/README.md). Use the requesting member's actual handle; use `unassigned.md` when unknown. Add new log links to the guide index. One entry may group related calls; never invent other members' activity.
- Before handing a task back or committing its changes, record the actual date, AI tool/model when known, the user's request or faithful prompt reference, purpose, work performed, affected files, commands/checks and results, and remaining limitations or approvals.
- Logging is mandatory for every AI-assisted task, including questions, read-only reviews, research, planning, documentation, and tasks with no code changes. Do not skip logging because the task is small.
- Before the final response, commit, or PR handoff, verify that this task has an actual entry in the correct phase/member file and that the file is linked from the log index. Read the entry back and confirm it records only actions and checks that actually occurred. Do not claim completion before this check.
- If the phase is not established, use `docs/ai-logs/general/<github-handle>.md`; if ownership is unknown, use `unassigned.md`. Do not guess identities from commit authorship. If writing is unavailable, disclose that logging could not be completed and provide the entry for the user to save; never claim it was recorded.
- Distinguish AI-generated work, AI review, and human work/validation. Record human validation only when it actually happens. Mark unavailable metadata or evidence as unavailable rather than inventing it.
- Include the outcome of requirements/database approval requests when relevant; a proposal awaiting approval is not completed implementation.
- Keep history append-only. Add a correction/amendment when an entry is wrong; do not rewrite prior entries to fabricate a cleaner history. Task status and verification may be updated while that task's entry is still in progress.
- Do not log secrets, credentials, personal recipient data, or unredacted sensitive prompts. Use a redacted summary/reference instead. Preserve available original prompts/chat evidence separately when required by the course; the summary log alone is not a full transcript.
- Keep the log factual and concise. It supplements the course AI usage declaration and supporting evidence; it does not replace them.
