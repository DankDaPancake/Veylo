# Veylo

**Velocity Flow**

Repository: [DankDaPancake/Veylo](https://github.com/DankDaPancake/Veylo) — private.

## Project Brief

Veylo is a proposed responsive web application that helps small delivery hubs coordinate last-mile deliveries and share practical knowledge about delivery locations. Hub Dispatchers manage orders and rider assignments, while Delivery Riders view their assigned work, consult location guides, and record delivery attempts and outcomes.

The proposed system suggests the next delivery using explicit priority rules. Its AI feature turns informal rider notes into structured guide drafts, which a dispatcher reviews before publication. Veylo aims to make field knowledge reusable and daily coordination clearer; these benefits are project goals, not measured results.

Current stage: **PA1 preparation**. The technology stack remains undecided, and the application has not been implemented. The team reports completing a two-app survey; its report and screenshots have not yet been added to this repository.

Veylo was previously named SmartRoute. Existing proposal filenames and historical preparation records retain that name; the linked proposal remains the scope draft and needs its branding refreshed before submission.

## Team

**GroupID:** _To be filled in_

Fill in each member's StudentID, FullName, and Handle (for example, their GitHub username).

| StudentID | FullName | Handle |
| --- | --- | --- |
| | | |
| | | |
| | | |
| | | |
| | | |

## Start Here

- [PA1 scope draft — previous SmartRoute branding](Group9_SmartRoute.md)
- [PA1 preparation checklist](proposal_checklist.md)
- [Documentation index](docs/README.md)
- [Contribution guidance](CONTRIBUTING.md)
- [Agent instructions](AGENTS.md), [Claude instructions](CLAUDE.md), and [AI assistance log](AI_LOG.md)
- [Repository setup plan](REPO_SETUP_PLAN.md) and [actual setup record](docs/management/repo-setup-log.md)

## Repository Layout

```text
src/                       Future application source; no stack selected
docs/management/           Setup record, planning, reporting, and evidence
docs/requirements/         Index of proposal and requirements documents
docs/analysis-and-design/  Future architecture, diagrams, and UI design
docs/test/                 Future test plans, cases, and results
.github/                   Task and pull-request templates
```

Existing preparation documents and supplied course references remain at their original paths. The index links to them instead of creating editable duplicates.

## Working Locally

Only Git and a Markdown editor are needed at this stage. There are no application dependencies, startup commands, automated tests, or deployment yet.

```powershell
git status --short --branch
git diff --check
git diff
```

Use UTF-8 text files. `.gitattributes` normalizes Markdown and script line endings to LF; supplied PDFs, Word files, and images remain binary. `.editorconfig` supplies conservative editing defaults.

Temporary PDF renders and the duplicate original course ZIP are ignored, while source Markdown, reference PDFs, and required documents remain eligible for version control. Do not commit API keys, credentials, private operational data, or personal recipient data.

## Deferred Team Decisions

The private GitHub repository is owned by `DankDaPancake`. The application stack, task board, member access/responsibilities, sprint dates, hosting, AI provider, budget, and team branching/merge policy remain pending. No application scaffold or framework-specific CI has been created.

[AGENTS.md](AGENTS.md) records planned branch protection and CI/CD requirements. GitHub enforcement will be checked after remote setup; framework-specific CI follows stack selection, and CD follows hosting/release decisions.

PA2 will require Spec Kit artifacts inside `src`. Initialization and coding-agent selection are deferred until the course instructions and team integration are agreed. Do not create a nested Git repository under `src`.

Keep the repository private and provide instructor/TA access when requested, as PA1 requires. Add team collaborators after their handles are supplied. Preserve the existing Git history when cloning or setting up another machine.
