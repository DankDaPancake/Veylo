# App foundation archive: current-code verification
Performed by: Codex (AI-assisted source review and actual checks). Reviewed by: Requester directed code comparison and archive; no new independent setup claim. Edited by: Codex.

## Scope and code identity
Performed by: Codex. Reviewed by: Pending; no independent human review claimed. Edited by: Codex.

Date2026-11-21. Current application logic is commit `5d67ce821e6c77c1952c8191a5086b0d8e712171`; archival updates change docs/spec paths, not application logic, schema or dependencies. Node24.22.2, Prisma7.10.1, PostgreSQL18.7, Chrome156.0.8078.79. Existing isolated `veylo_demo` UTC server at loopback54417 was used read-only. No migrations or seed commands ran for this check. The temporary no-credential application server used3018; the main3017 QA service was untouched.

The [archived foundation](../../../openspec/changes/archive/2026-11-21-app-foundation/proposal.md) was authored for the model-free BOOYAH-12 stage. BOOYAH-18/19 subsequently supplied approved auth/schema/migrations/seed. The [synced main spec](../../../openspec/specs/app-foundation/spec.md) preserves all4 requirements/6 scenarios verbatim, adds descriptive Purpose and an explicit non-normative historical-integration scope note. No requirement was silently weakened or runtime changed to recreate the old stage.

## Requirement-by-requirement comparison
Performed by: Codex. Reviewed by: Pending; independent N15 not performed. Edited by: Codex.

| Requirement | Current source and actual result | Limits |
| --- | --- | --- |
| Reproducible local application | src/package.json/package-lock.json retain pinned install/dev/build/lint/typecheck/test commands. Current home rendered200 without DB credentials and health returned200 with exact status/service/application scope; POST health405. [Browser results](no-db-results.json), [output](no-db-browser-output.txt), [screenshot](no-db-home.png). | DATABASE_URL was explicitly blank to prevent Next loading credentials from existing ignored.env; the file was not changed. This is credential absence, not a claim the env key was deleted. No npm ci/build rerun; final F02 build/check evidence already covers the same application commit. |
| Read-only database connectivity | db-check.mjs validates env then invokes Prisma db execute with check.sql containing only SELECT1. npm run db:check exited0; actual PostgreSQL probe exited0. [db check](db-check.txt), [catalog before](catalog-before.txt)/[after](catalog-after.txt) identical. | Approved business tables now exist; the probe did not create them or seed rows. Their existence is not a read-only-probe violation. |
| Safe environment validation | validate-db-url.mjs rejects missing/blank, malformed, wrong-protocol/no-database values before DB invocation. Focused existing tests4/4 passed. Probe checked missing/malformed failure, successful live SELECT1 and unresponsive handshake failure at20068ms; all outputs credential-free. [Tests](environment-tests.txt), [probe](probe.txt). | This is not a full release secret audit. |
| Honest schema handoff | Before approval, the model-free package used schema-pending.mjs (still present); current package db:migrate/db:seed now point to approved Prisma migration/guarded synthetic seed. Original spec's WHEN explicitly applies to preapproval/model-free stage. | Historical condition is not applicable to the approved integrated build. Did not run real migration/seed or falsely mark the old refusal as a current result. N15 independent clean-machine setup and foundation Compose execution remain unclaimed. |

## Actual limitation found
Performed by: Codex (actual current-build observation). Reviewed by: Pending; not corrected in archive scope. Edited by: Codex.

With DATABASE_URL explicitly blank, the home still renders and application health passes, but the BOOYAH-18 AccountControl widget requests `/api/auth/get-session`, which returnsHTTP500 because authentication requires the database. The browser recorded zero uncaught page exceptions, but this network error remains visible in no-db-results.json. Do not claim an error-free console, working authentication without DB credentials or full database readiness. Foundation startup/application-only health remains satisfied; later auth functionality has its own DB requirement. No code fix was performed or silently added to this archive task.

## Commands and verification boundaries
Performed by: Codex. Reviewed by: Pending; no independent human review claimed. Edited by: Codex.

- `node --test src/tests/environment.test.mjs`: exit0,4/4.
- From src, `node --env-file=.env scripts/probe-foundation.mjs`: exit0, all4 probes PASS (missing exit1, malformed exit1, live SELECT1 exit0, stalled handshake exit1); timeout20068ms.
- From src, `npm run db:check`: exit0; catalog unchanged.
- From src, `DATABASE_URL='' BETTER_AUTH_URL=http://127.0.0.1:3018 npm run start -- --port 3018`: temporary production server, existing.env untouched; browser checks as above.
- Strict main/archive validation and existing `npm run spec:validate` check ensure archive-aware commands still work. `openspec show app-foundation --type spec` replaces the obsolete active-change status example in src/README.md.
- Initial probe launch used an incorrect relative log directory and failed shell redirection before the probe ran. Removed only the empty task-created src/docs directories, reran from correct path and recorded actual successful output. No failed command is relabeled as a passing probe.

All earlier dirty work and reviewer/coverage limitations remain preserved. No new app implementation, model/migration, dependency, independent human walkthrough, commit/push, deployment or Jira activity is claimed by archival.

The task-owned temporary server3018 was stopped after the checks; QA server3017 and unrelated services were left running.
