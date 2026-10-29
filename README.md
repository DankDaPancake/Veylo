# Veylo

**Velocity Flow**

Repository: [DankDaPancake/Veylo](https://github.com/DankDaPancake/Veylo) — private.

## Project Brief

Veylo is a proposed responsive web application that helps small delivery hubs coordinate last-mile deliveries and share practical knowledge about delivery locations. Hub Dispatchers manage orders and rider assignments, while Delivery Riders view their assigned work, consult location guides, and record delivery attempts and outcomes.

The proposed system suggests the next delivery using explicit priority rules. Its AI feature turns informal rider notes into structured guide drafts, which a dispatcher reviews before publication. Veylo aims to make field knowledge reusable and daily coordination clearer; these benefits are project goals, not measured results.

Current stage: **PA1 submitted; PA2 preparation**, as reported by the owner. The technology stack remains undecided, and the application has not been implemented. The team reports completing a two-app survey; add its actual report and screenshots to the survey document linked below.

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
src/                       Future application source; no stack selected
docs/management/           PA1 contract, tools/process, reports, and checklist
docs/requirements/         PA1 proposal and survey
docs/analysis-and-design/  Future architecture, diagrams, and UI design
docs/test/                 Future test plans, cases, and results
.github/                   Task and pull-request templates
```

Original preparation/reference files stay locally at their existing paths and are ignored. Published links point to curated repository documents. Existing copies in earlier commits remain in Git history.

## Working Locally

Only Git and a Markdown editor are needed at this stage. There are no application dependencies, startup commands, automated tests, or deployment yet.

```powershell
git status --short --branch
git diff --check
git diff
```

Use UTF-8 text files. `.gitattributes` normalizes Markdown and script line endings to LF; supplied PDFs, Word files, and images remain binary. `.editorconfig` supplies conservative editing defaults.

Root research/course material, old draft exports, and temporary renders are ignored. Add final PA1 PDF exports beside their reviewed Markdown sources in `docs/`; they are not globally ignored. Do not commit API keys, credentials, private operational data, or personal recipient data.

## Deferred Team Decisions

The private GitHub repository is owned by `DankDaPancake`. The team has selected `main` for stable releases and `dev` for sprint integration; `dev` exists and protection for both branches was verified on October 25, 2026. The application stack and remaining tooling, schedule, hosting, budget, and deployment details remain to be confirmed. The approved workflow uses squash PRs from task branches into `dev` and milestone merge PRs from `dev` into `main`. No application scaffold or framework-specific CI has been created.

[AGENTS.md](AGENTS.md) records planned branch protection and CI/CD requirements. Main/dev protection is active; framework-specific CI follows stack selection, and CD follows hosting/release decisions.

PA2 will require Spec Kit artifacts inside `src`. Initialization and coding-agent selection are deferred until the course instructions and team integration are agreed. Do not create a nested Git repository under `src`.

Keep the repository private and provide instructor/TA access when requested, as PA1 requires. Add team collaborators after their handles are supplied. Preserve the existing Git history when cloning or setting up another machine.
