
## 2026-11-18 — Remove unused agent integrations

- Tool/model: Codex, gpt-6.2-sol. Requesting member's handle was not confirmed.
- User request: clean only Veylo, keep the .agents integration, and remove RTK.md.
- Work: removed Claude, Cursor, and Copilot integration files, CLAUDE.md, and RTK.md. Updated README.md and AGENTS.md. Preserved OpenSpec and GitHub issue and pull request templates.
- Verification: git diff --check passed. openspec list --json detected the Veylo root and app-foundation. No IDE checks or human review performed.

## 2026-11-19 — Consolidate AI usage logs

- Tool/model: Codex, gpt-6.2-sol. Requesting member's handle was not confirmed.
- User request: move all logs to docs/ai-log and place the former root AI_LOG.md under PA1.
- Work: preserved the historical log and existing phase/member files, moved the index and template, and updated repository guidance and relative links.
- Verification: git diff --check passed, PA1 log content matched the original apart from updated link targets, and the log index links resolved.
