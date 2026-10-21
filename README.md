# SmartRoute

SmartRoute is a proposed responsive web application for last-mile delivery coordination and shared location knowledge. Its primary users are Hub Dispatchers and Delivery Riders. The proposed AI feature normalizes rider notes into drafts that a dispatcher reviews before publication.

Current stage: **PA1 preparation, Group 9**. The proposal is a draft; implementation, application survey, and team agreements must not be represented as completed work.

## Start Here

- [Current PA1 proposal](Group9_SmartRoute.md)
- [PA1 preparation checklist](proposal_checklist.md)
- [Documentation index](docs/README.md)
- [Contribution guidance](CONTRIBUTING.md)
- [Agent instructions](AGENTS.md) and [AI assistance log](AI_LOG.md)
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

The application stack, GitHub owner/remote, board, member responsibilities, sprint dates, hosting, AI provider, budget, and team branching/merge policy are not selected here. No application scaffold or framework-specific CI has been created.

PA2 will require Spec Kit artifacts inside `src`. Initialization and coding-agent selection are deferred until the course instructions and team integration are agreed. Do not create a nested Git repository under `src`.

When creating the remote later, use a private GitHub repository and provide instructor/TA access when requested, as PA1 requires. Do not initialize a separate remote README that conflicts with the local repository history.
