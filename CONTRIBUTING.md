# Contributing to Veylo

This guidance covers the PA3 foundation while preserving the historical PA1 workflow. Team-owned policies remain pending unless explicitly approved.

## Course Requirements

- Record each project task before starting it. Each task has exactly one assignee and real creation, assignment, and completion dates.
- Keep actual Git history and task-board evidence. Do not backdate or fabricate activity.
- All members must participate as full-stack engineers; coordination roles do not restrict them to one layer.
- Submitted documents must be English Markdown, with matching PDF exports and Mermaid diagrams where appropriate.
- Immediately after each submitted report section heading, record who performed, reviewed, and edited that section. Unknown names stay explicitly pending.
- From PA2, each task needs a different member to review it; do not imply a human review has happened when it has not.
- Preserve AI prompts/history and record affected work and human validation. PA2 explicitly requires an AI usage report; no completed declaration is supplied by this setup.
- Update the root [AI_LOG.md](AI_LOG.md) for each AI-assisted task, following [AGENTS.md](AGENTS.md). Keep actual human validation separate from AI output/review.

## Editing and Verification

Read the relevant assignment and current proposal before changing requirements. Treat the wider research notes as background rather than an approved expansion of scope.

Keep edits scoped to the assigned work. Preserve existing user changes and document links. Avoid mass-formatting supplied material. Edit Markdown as the source; a PDF export may become stale when the corresponding Markdown changes.

Before handing work over, inspect the changed files and run the relevant available checks. At present, use `git status --short --branch`, `git diff --check`, and `git diff`; newly created untracked files also need direct inspection because `git diff` does not include them. Check local Markdown links after moves or renames. Application verification commands are documented in [src/README.md](src/README.md).

Record what changed, what was checked, and what remains unverified. The pull-request template is a reporting aid, not evidence that checks or reviews ran.

## Repository Hygiene

Commit source documents and necessary reference files. Keep secrets, local environment files, dependency directories, caches, and disposable render output out of Git. Preserve placeholder-only `.env.example` files when application configuration is added.

Use one Git repository at the root. `src` contains application code and the pinned CLI dependency. The working OpenSpec directory, `constitution.md`, and agent configuration live at the repository root. Use the locked foundation stack; do not add business requirements or models without their required approval.

## Planned Branch Protection and CI/CD

Follow the [branch protection and CI/CD instructions](AGENTS.md). Use task branches and PRs for the eventual protected integration branch, with a non-author human approval, resolved conversations, and passing required checks. Do not bypass protection or force-push to a protected branch. Remote enforcement is not configured by this document.

The foundation has local verification commands; framework-specific CI remains separate backlog work. Deployment automation depends on agreed hosting and release authorization. The planned checks cover lint/format, types where relevant, tests, build, and relevant documentation/database checks. `main` is selected for stable releases and `dev` for sprint integration; both branches exist and protection was verified on October 25, 2026. Squash task PRs into `dev`; use merge commits for milestone PRs from `dev` into `main`. Exact CI jobs and deployment environments remain pending.

## Pending Team Agreement

Remaining access/tooling, reviewer rotation, meeting dates, and application tooling must be confirmed by the team. Templates intentionally leave unavailable fields open; the user's confirmed `main`/`dev` workflow is recorded above.

Record each AI-assisted task using the [phase/member log guide](docs/ai-logs/README.md) before commit or handoff.
