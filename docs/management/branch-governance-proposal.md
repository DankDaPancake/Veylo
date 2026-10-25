# Branch Governance Proposal

Status: owner-approved policy; main/dev protection applied and verified on 2026-10-25. The audit snapshot below describes the state before application.
Prepared by: Codex (AI assistance). Human approver: DankDaPancake, explicit approval in chat; independent implementation review pending.

## Verified State

The user reports that PA1 is finalized and submitted. This audit does not verify the submitted package or change product requirements.

- Repository: private, owned by `DankDaPancake`; default branch: `main`.
- Owner credentials have admin access. Accepted collaborators `Yelgsef` and `Cee-Ka` have write access.
- Invitations for `kiettheis0702` and `thepenguinguy123` remain pending with write access.
- `dev` was created from remote `main`, commit `3c56aa7d732b964986f29d8e933c6089f28e7d31`. A local tracking branch was added without switching the current checkout.
- Neither `main` nor `dev` is protected. The repository ruleset list is empty.
- Actions are enabled with all actions allowed. Default workflow token permissions are read-only; workflow approval of pull requests is disabled.
- The account plan was unavailable in the API response. Private-repository protection availability has not been established.

## Proposed Working Process

Keep `main` as the default stable branch and `dev` as sprint integration. Start short-lived task branches from current `dev`, using names such as `feature/<task>`, `fix/<task>`, or `docs/<task>`.

Open task pull requests against `dev`. Require one approving human other than the author, resolved conversations, and review of the latest material changes. Use squash merge for task PRs; delete completed task branches after confirming their work is merged.

At a milestone, open a `dev` to `main` PR with a concise change summary and actual verification results. Require a non-author human review; the owner coordinates the release. Use a merge commit for this recurring integration PR to preserve shared ancestry. Do not require linear history on `main` under this strategy. Never delete `main` or `dev`; leave global automatic head-branch deletion disabled.

Track each task with an assignee, acceptance criteria, and a linked PR. Use the team's existing board; no new external tool is selected by this proposal. Keep requirement/database approval gates and factual AI logging from [AGENTS.md](../../AGENTS.md).

## Proposed Protection Configuration

For both `main` and `dev`: require PRs, one approving non-author human review, dismissal of stale approvals, resolved conversations, and application of the rules to administrators. Disallow direct pushes, force pushes, branch deletion, and bypasses. Do not activate empty or nonexistent required CI checks.

Apply these settings only after explicit owner authorization and checking what the private repository's plan supports. If GitHub cannot enforce them, record that limitation and follow the same review process manually; do not describe manual policy as server enforcement.

## Access and CI

Retain the owner as administrator and the other four members as write collaborators once invitations are accepted. Members with pending invitations must accept them. A personal repository has owner/collaborator roles; granular roles or an additional administrator would require a separate organization proposal and authorized transfer.

After confirming the team's chosen stack and reproducible commands, implement real lint/format, type, test, and build checks as applicable for PRs targeting `dev` and `main`. Add migration checks only with the required database approval. Enable required checks after successful workflow verification. Retain read-only default token permissions and disabled workflow PR approvals; propose action allowlisting and pinned action revisions when building CI. CD requires separate hosting and release decisions.

## Sources and Follow-up

- [GitHub personal repository permissions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)
- [GitHub protected branches and plan availability](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

No protection, collaborator permission, merge setting, default branch, or workflow setting was changed by this task. Existing uncommitted PA1 edits and submission artifacts were preserved. Documentation still describing PA1 preparation needs a separate update against the team's finalized material; this proposal does not treat old placeholders as current team decisions.


## Approved Configuration Outcome — 2026-10-25

After owner approval, protection PUT and readback GET both returned HTTP 200 for main and dev. Both require one approving review, dismissal of stale reviews, approval after the latest push, resolved conversations, and admin enforcement. Force pushes and deletion are disabled; no bypass allowances were added. No required status checks were configured. This confirms protection availability for this private repository without identifying the account plan.

The earlier unprotected state is historical. Access/default branch/workflow/merge settings were left unchanged. Squash task PRs and merge milestone PRs remain a human convention; they are not automatically enforced per target branch. New AI records use [phase/member logs](../ai-logs/README.md). No document commit or push was performed.
