# PA3 — thepenguinguy123 — AI Usage Log

- Scope: BOOYAH-20 (UC05–UC08).
- Tools: Codex, Jira/Figma MCP, OpenSpec CLI, Python and document-export tools.
- OpenSpec workflow reference: **Explore → Propose → Apply → Verify → Archive/Handoff**.

## 2026-11-19 — BOOYAH-20.1 — F02 requirements and UC specifications

- User request: Review F02 business rules and specify UC05–UC08 with complete flows and screen maps.
- OpenSpec workflow: `$openspec-explore` to inspect the F02/BOOYAH-13 contract; `$openspec-propose` to organize proposal, specs, design and tasks for a scoped deliverable review.
- Work: Prepared [F02 Business Rules](../../analysis-and-design/use-cases/F02-Business-Rules-Proposal.md) and [UC05–UC08 specifications](../../analysis-and-design/use-cases/UC-F02-Orders.md), keeping the underlying BOOYAH-13 contract separate.
- Verification: A later read-only OpenSpec review strict-validated the saved F02 contract snapshot (9 requirements, 16 scenarios, no issues). Its implementation checklist still showed 0/10 tasks complete.

## 2026-11-19 — BOOYAH-20.2 — Figma prototypes

- User request: Build editable UC05–UC08 screens for basic and alternative flows using the Prototype Kit.
- OpenSpec workflow: `$openspec-apply-change` for screen-to-frame traceability, interactive flows and evidence tasks; verify exported PNGs and navigation against the UC specs.
- Work: Created **54 editable Figma frames** (UC05/06/07/08: 9/15/14/16), exported 54 PNGs and prepared the [prototype handoff](../../analysis-and-design/use-cases/prototypes/F02/F02-Prototype-Handoff.md).
- Verification: 255 recorded interactions, four flow starts, no invalid destinations; PNG hashes and screen mapping checked. These were prototype checks, not backend tests.

## 2026-11-19 — BOOYAH-20.3 — UC06 CSV import evidence

- User request: Provide valid/invalid sample data and demonstrate CSV validation and atomic import behavior.
- OpenSpec workflow: `$openspec-apply-change` for CSV contract-check tasks; verify samples using Python and the relevant F02 requirements.
- Work: Prepared `valid-orders.csv`, `invalid-orders.csv`, the validator and [CSV validation results](../../test/f02-order-intake/csv/validation-results.json).
- Verification: Five valid rows passed; eight invalid-case rows yielded seven errors and zero inserted rows in the simulated store. No live database transaction was tested.

## 2026-11-19 — BOOYAH-20.4 — Documentation integration

- User request: Move only audited BOOYAH-20 materials into official `docs/` locations and keep the original drafts.
- OpenSpec workflow: Apply the document-integration checklist, verify source/destination hashes and relative references; archive the scoped change only after corrections and review.
- Work: Classified **72 audited files**, rebased 186 Markdown references and generated five PDFs. The [integration manifest](../../test/f02-order-intake/integration-manifest.json) records provenance.
- Verification: 72 source/destination hash pairs matched. **158 PDF file links and an old CSV README path remain to be fixed**; no final archive or human approval.

## 2026-11-19 — BOOYAH-20.5 — Documentation repair and PR preparation

- Tool/model: Codex; exact deployed model ID unavailable. Python/Pillow, Pandoc, Poppler and isolated WeasyPrint 70.0 tooling.
- User request: Prepare only BOOYAH-20 deliverables, fix remaining documentation/export defects, branch from the latest `origin/dev`, commit, push and open a PR targeting `dev`; exclude unrelated work and preserve team artifacts.
- Work: Fetched `origin/dev` at `851f324b67bedb6b23f094aa5faebad6c73f197d`. Created `feat/booyah-20-f02-docs-prototypes` in an isolated worktree of the backup repository, leaving its original dirty checkout unchanged. Carried over the 76 audited/integration F02 files and this member log, plus focused index additions; preserved Trung's existing unassigned log/index and all team files. Added document export/verification scripts, corrected the CSV reproduction path and outdated checkout wording, and regenerated four affected PDFs. No business rule, screenshot, CSV or checker logic changed.
- Verification: `PYTHONDONTWRITEBYTECODE=1 python3 docs/test/f02-order-intake/verify_deliverables.py --audited-source <the designated audited directory>` passed. All 72 audited source hashes, 54 PNGs/40 original IDs, recorded 255 reactions/four starts, eight Markdown documents/251 local references, CSV 5 valid and 8 invalid rows/7 errors/0 invalid inserts, and exact PDF image RGB/alpha passed. Four PDFs were regenerated; all five paired PDFs have zero file annotations (pages: rules 2, UC 42, handoff 3, CSV 3, integration 3). This corrects the historical 158-link finding above. Source rules/CSV/checker, UC functional content, ignored drafts and team files are preserved. Direct new-file whitespace checks passed; final staged `git diff --check` and exact 81-file scope are checked before the authorized commit. No new OpenSpec workflow, migration, backend or live-Figma check is claimed.
- Review and publication: Phạm Công Khánh's actual review and unresolved source decisions remain pending. GitHub API confirmed this account has repository write access and the branch endpoint reports `dev` protected. Reading detailed protection settings returned 404, so specific enforcement rules were not established and no setting was changed. Feature-branch publication is authorized; merge remains a separate human action.

- Handoff: Prepared for the user-authorized feature-branch commit, push and PR into `dev`; actual publication URL/result will be reported separately. Human review and team decisions remain pending; no merge or Jira update is authorized.

## 2026-11-19 — BOOYAH-20 PR scope correction

- Tool/model: Codex; exact deployed model ID unavailable.
- User request: Exclude both README Markdown files under `docs/test/f02-order-intake/` and their paired PDFs from the PR, while continuing publication of BOOYAH-20.
- Work: Removed those four reports only from the unpushed publication branch; original backup artifacts remain unchanged. Repointed their active links to the CSV checker/results and provenance metadata, moved reproduction instructions into the existing Figma handoff, and narrowed exporter/verifier metadata to the three published PDFs. Source manifest exclusions remain explicit historical provenance. The earlier 81-file/five-PDF verification above records the first local preparation, not this narrowed final scope.
- Verification: The narrowed verifier passed: six Markdown documents/222 local references, three published PDFs with zero file annotations, exact image RGB/alpha, 54 PNGs/40 original IDs, unchanged CSV output and all 72 original source hashes. The published PDFs are rules 2 pages, UC 42 and handoff 3; source exclusions are explicit in the manifest. There are 77 allowed paths and no test README/report PDF paths. Direct whitespace/scope checks and original-backup preservation passed before amending the local, unpushed commit. No merge or Jira update is authorized.
