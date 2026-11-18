# Veylo

**Velocity Flow**

Repository: [DankDaPancake/Veylo](https://github.com/DankDaPancake/Veylo) — private.

## Project Brief

Veylo is a proposed responsive web application that helps small delivery hubs coordinate last-mile deliveries and share practical knowledge about delivery locations. Hub Dispatchers manage orders and rider assignments, while Delivery Riders view their assigned work, consult location guides, and record delivery attempts and outcomes.

The proposed system suggests the next delivery using explicit priority rules. Its AI feature turns informal rider notes into structured guide drafts, which a dispatcher reviews before publication. Veylo aims to make field knowledge reusable and daily coordination clearer; these benefits are project goals, not measured results.

Current stage: **PA3 application foundation**. The local foundation uses Next.js, TypeScript, Tailwind, PostgreSQL and Prisma; order/auth workflows and business schema are not implemented by BOOYAH-12. See [application setup](src/README.md). Requirements, use-case and prototype deliverables are maintained in their separate tasks.

Veylo was previously named SmartRoute. Published PA1 documents now live under `docs/`. Old root drafts, research, course bundles, and PDF exports remain local references excluded from the current Git tree. Pending information is explicitly left for the team to complete.

## Team

**GroupID:** 09

Fill in each member's StudentID, FullName, and Handle (for example, their GitHub username).

| StudentID | FullName | Handle |
| --- | --- | --- |
| | | |
| | | |
| | | |
| | | |
| | | |

## Start Here

- [PA1 project proposal](docs/requirements/project-proposal.md)
- [Existing-app survey — add the team's report](docs/requirements/existing-app-survey.md)
- [Team contract — complete and agree as a team](docs/management/team-contract.md)
- [PA1 submission checklist](docs/management/submission-checklist.md)
- [Documentation index](docs/README.md)
- [Contribution guidance](CONTRIBUTING.md)
- [AI log guide](docs/ai-logs/README.md), [agent instructions](AGENTS.md), [Claude instructions](CLAUDE.md), and [AI assistance log](AI_LOG.md)
- [Tools and process](docs/management/tools-and-process.md), [weekly report](docs/management/weekly-report.md), and [AI usage declaration](docs/management/ai-usage.md)

## Repository Layout

```text
src/                       Application foundation and OpenSpec artifacts
docs/management/           PA1 contract, tools/process, reports, and checklist
docs/requirements/         PA1 proposal and survey
docs/analysis-and-design/  Future architecture, diagrams, and UI design
docs/test/                 Future test plans, cases, and results
.github/                   Task and pull-request templates
```

Original preparation/reference files stay locally at their existing paths and are ignored. Published links point to curated repository documents. Existing copies in earlier commits remain in Git history.

## Working Locally

Follow [src/README.md](src/README.md) for locked dependency installation, local PostgreSQL, development and verification commands. Hosting/deployment remain pending.

```powershell
git status --short --branch
git diff --check
git diff
```

Use UTF-8 text files. `.gitattributes` normalizes Markdown and script line endings to LF; supplied PDFs, Word files, and images remain binary. `.editorconfig` supplies conservative editing defaults.

Root research/course material, old draft exports, and temporary renders are ignored. Add final PA1 PDF exports beside their reviewed Markdown sources in `docs/`; they are not globally ignored. Do not commit API keys, credentials, private operational data, or personal recipient data.

## Deferred Team Decisions

The private GitHub repository is owned by `DankDaPancake`. The team has selected `main` for stable releases and `dev` for sprint integration; `dev` exists and protection for both branches was verified on October 25, 2026. The foundation stack is selected for BOOYAH-12; budget is 0 VND. Hosting, deployment and remaining team policies need their owners to confirm them. The approved workflow uses squash PRs from task branches into `dev` and milestone merge PRs from `dev` into `main`. The local foundation is present; shared-branch integration and hosted CI are not claimed.

[AGENTS.md](AGENTS.md) records planned branch protection and CI/CD requirements. Main/dev protection was observed in the historical governance check; recheck before relying on current enforcement. CI/CD setup is separate work.

The user confirmed OpenSpec is accepted in place of GitHub Spec Kit. The real `app-foundation` change and pinned CLI live inside `src`. Do not create a nested Git repository under `src`.

Keep the repository private and provide instructor/TA access when requested, as PA1 requires. Add team collaborators after their handles are supplied. Preserve the existing Git history when cloning or setting up another machine.
