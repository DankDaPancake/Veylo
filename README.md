# Veylo

**Velocity Flow**

Repository: [DankDaPancake/Veylo](https://github.com/DankDaPancake/Veylo) — private.

## Project Brief

Veylo is a proposed responsive web application that helps small delivery hubs coordinate last-mile deliveries and share practical knowledge about delivery locations. Hub Dispatchers manage orders and rider assignments, while Delivery Riders view their assigned work, consult location guides, and record delivery attempts and outcomes.

The proposed system suggests the next delivery using explicit priority rules. Its AI feature turns informal rider notes into structured guide drafts, which a dispatcher reviews before publication. Veylo aims to make field knowledge reusable and daily coordination clearer; these benefits are project goals, not measured results.

Current stage: **PA3 application foundation**. The local foundation uses Next.js, TypeScript, Tailwind, PostgreSQL and Prisma; order/auth workflows and business schema are not implemented by BOOYAH-12. See [application setup](src/README.md). Requirements, use-case and prototype deliverables are maintained in their separate tasks.

Veylo was previously named SmartRoute. Historical PA1 repository materials are indexed under [project documentation](docs/README.md#pa1-reference-materials). Old root drafts, research, course bundles, and PDF exports remain local references excluded from the current Git tree. Pending information is explicitly left for the team to complete.

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

- [Application setup and verification](src/README.md)
- [Project documentation and historical PA1 materials](docs/README.md)
- [Contribution guidance](CONTRIBUTING.md)
- [Agent instructions](AGENTS.md)
- [AI usage logs](docs/ai-log/README.md)

## Repository Layout

```text
src/                       Application foundation and pinned CLI dependency
openspec/                  OpenSpec configuration, specifications, and changes
constitution.md            OpenSpec project governance
.agents/                   Shared agent skills and workflows
docs/management/           PA1 contract, tools/process, reports, and checklist
docs/requirements/         PA1 proposal and survey
docs/analysis-and-design/  Future architecture, diagrams, and UI design
docs/test/                 Future test plans, cases, and results
docs/ai-log/               AI usage records by assignment
.github/                   Task and pull request templates
```

Original preparation/reference files stay locally at their existing paths and are ignored. Published links point to curated repository documents. Existing copies in earlier commits remain in Git history.

## Working Locally

Follow [src/README.md](src/README.md) for locked dependency installation, local PostgreSQL, development and verification commands. Hosting/deployment remain pending.

Open the repository root as the coding-agent workspace. OpenSpec configuration and agent commands live there. With the installed OpenSpec CLI, run `openspec list --json` from the root; the pinned CLI can also be invoked after `npm ci` in `src` as described in [the OpenSpec workflow](src/README.md#openspec-workflow-and-handoff).

```powershell
git status --short --branch
git diff --check
git diff
```

Use UTF-8 text files. `.gitattributes` normalizes Markdown and script line endings to LF; supplied PDFs, Word files, and images remain binary. `.editorconfig` supplies conservative editing defaults.

Root research/course material, old draft exports, and temporary renders are ignored. Add final PA1 PDF exports beside their reviewed Markdown sources in `docs/`; they are not globally ignored. Do not commit API keys, credentials, private operational data, or personal recipient data.

## Deferred Team Decisions

The private GitHub repository is owned by `DankDaPancake`. The team has selected `main` for stable releases and `dev` for sprint integration; `dev` exists and protection for both branches was verified on October 25, 2026. The foundation stack is selected for BOOYAH-12; budget is 0 VND. Hosting, deployment and remaining team policies need their owners to confirm them. The approved workflow uses squash PRs from task branches into `dev` and milestone merge PRs from `dev` into `main`. The foundation and root OpenSpec setup were merged into `dev` in PRs #6 and #7.

[AGENTS.md](AGENTS.md) records planned branch protection and CI/CD requirements. Main/dev protection was observed in the historical governance check; recheck before relying on current enforcement. CI/CD setup is separate work.

The user confirmed OpenSpec is accepted in place of GitHub Spec Kit. The real `app-foundation` change lives in `openspec/` at the repository root; the pinned CLI dependency remains in `src`. The user requested this working layout so tools can discover OpenSpec from the root. PA2's submitted-artifact placement under `src` remains a separate requirement. Do not create a nested Git repository under `src`.

Keep the repository private and provide instructor/TA access when requested, as PA1 requires. Add team collaborators after their handles are supplied. Preserve the existing Git history when cloning or setting up another machine.
