# BOOYAH-20 — F02 Prototype Handoff
Performed by: Codex (AI-generated prototype work for the requesting member). Reviewed by: Pending — Phạm Công Khánh. Edited by: Codex; human editor pending.

Date: 2026-11-19. This is a review draft, not human acceptance or a completed implementation.

**PDF navigation:** HTTPS/Figma links remain clickable. Local references are clickable in Markdown and rendered as plain labels in PDF; screenshots remain embedded.

## Editable source and repository paths
Performed by: Codex (AI-generated prototype work for the requesting member). Reviewed by: Pending — Phạm Công Khánh. Edited by: Codex; human editor pending.

- Working Figma file: [separate copy of the shared kit](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4189-80).
- Figma page: **F02 · UC05–UC08 · BOOYAH-20**. [Scenario review index](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4198-2211).
- Actual business-rule source: [F02-Business-Rules-Proposal.md](../../F02-Business-Rules-Proposal.md), unchanged.
- Updated UC source: [UC-F02-Orders.md](../../UC-F02-Orders.md). Only prototype evidence, attribution and Screen Maps were updated; basic/alternative behavior and pending decisions were preserved.
- PDFs: [UC specifications and screenshots](../../UC-F02-Orders.pdf), [this handoff](F02-Prototype-Handoff.pdf).
- Prototype navigation: [readback checks](../../../../test/f02-order-intake/prototype/F02-Prototype-Links-Verification.json), with 255 reaction nodes, no invalid destinations and no same-frame navigation.
- Output: `docs/analysis-and-design/use-cases/prototypes/UC05/` through `UC08/`, [stable screen manifest](F02-Screen-Manifest.json), [Figma structure checks](../../../../test/f02-order-intake/prototype/F02-Figma-Structure-Verification.json), [PNG checks](../../../../test/f02-order-intake/prototype/F02-PNG-Verification.json).
- Local UC06 CSV fixtures: [valid](../../../../test/f02-order-intake/csv/valid-orders.csv), [invalid](../../../../test/f02-order-intake/csv/invalid-orders.csv), [validation results](../../../../test/f02-order-intake/csv/validation-results.json). These are separate from the static counts shown in Figma; prototype download controls remain visual.
- This official copy was integrated from the user-designated audited handoff. Its ignored source folder remains unchanged. These official outputs have not been staged, committed or pushed.

## Coverage and comparison with the original kit
Performed by: Codex (AI-generated prototype work for the requesting member). Reviewed by: Pending — Phạm Công Khánh. Edited by: Codex; human editor pending.

| Use case | Original kit coverage | Result in the F02 page |
| --- | --- | --- |
| UC05 | S05-01-error had recipient/address examples, but not the full field contract or complete states. | 9 editable screens: empty/filled, saving/success, validation, duplicate/race, auth, denied and uncertain failure. |
| UC06 | Upload and generic errors existed as components; no complete import flow. | 15 editable screens: initial/selected/processing, success, row errors, specific file errors, failure and access states. |
| UC07 | S07-01 normal/empty/denied examples existed; normal used illustrative Pending labels and lacked full filters, pagination and details. | 14 editable screens: normal/filtered/page 2, empty/no results/filter error, details/not-found, auth/denied, loading and request failures. |
| UC08 | Fields/buttons/confirmation components existed; no complete order edit/cancel flow. | 16 editable screens: current/changed edit, saving/updated, cancellation/entered reason/error/cancelled, validation/identity rejection, status block, conflict, not-found, auth/denied and failure. |

All 40 original Screen Map IDs are covered. Fourteen additional IDs expose details of existing flows; they do not add requirements. All 54 screens are native editable 1440 × 900 Figma frames. No complete-UI raster was embedded. Each of the 26 original top-level kit nodes matched the captured structural/content checksum after editing; no original page child was added or removed.

## Reuse and prototype navigation
Performed by: Codex (AI-generated prototype work for the requesting member). Reviewed by: Pending — Phạm Công Khánh. Edited by: Codex; human editor pending.

Existing Button/Primary, Button/Secondary, Button/Disabled, Field/Default, Field/Error, Banner/Error, Empty, Permission/401, Permission/403, Error/Service, Upload and Order row components are reused through instances. New local components are limited to F02 navigation derived from the Dispatcher shell, saved detail values, CSV error rows and the composed cancellation dialog. Existing color/space/radius variables and the Inter product font are reused. Confirmation actions reuse kit buttons; the original Confirm component remains intact.

Four flow start points are configured for UC05, UC06, UC07 and UC08. Readback confirmed 255 reaction-bearing nodes after wiring. The review index opens every scenario. Loading/saving frames advance after a simulated 1.5-second delay; this is presentation timing, not a performance measurement. Scrollable list instances contain 20 rows on page 1 and one row on page 2; counts and orders are synthetic. The detail walkthrough uses VL-0101; other example rows are not wired to misleading copies of its detail.

## Limitations and remaining review
Performed by: Codex (AI-generated prototype work for the requesting member). Reviewed by: Pending — Phạm Công Khánh. Edited by: Codex; human editor pending.

- D-F02-1…8 still require explicit team confirmation. NEW and CANCELLED are used only as the existing draft proposes; prototype work does not approve them.
- UC01 is outside this prototype set and no sign-in destination was supplied. Sign in is a visual handoff; no authentication workflow was invented.
- Download template and Download report are visual controls. No hosted download URL, real file picker, CSV parser, backend request, database operation or live permission enforcement is implemented in Figma.
- Field entry, dropdown/filter choices, validation outcomes and refresh are selected static demonstrations. The review index supplies alternative scenarios; this is not a fully stateful application.
- UC07 preserves the separate no-results and no-orders states. Cross-hub/missing-order screens reveal no order details. No backend security claim follows from a screenshot.
- Source kit minimum-size example (1280 × 720) is preserved. New F02 screens target the kit desktop size; a full 1280 × 720, keyboard/accessibility and human prototype walkthrough remains pending.
- Phạm Công Khánh must review all flows and implementation feasibility; Kiệt and the owning implementers must resolve pending business rules and shared field/lifecycle contracts.
- No Jira issue update, commit, push or PR was made. Human approval, acceptance and measurements are not claimed.

## Screens and exports
Performed by: Codex (AI-generated prototype work for the requesting member). Reviewed by: Pending — Phạm Công Khánh. Edited by: Codex; human editor pending.

| Screen ID | Screen | Editable source | PNG |
| --- | --- | --- |
| `S05-01` | Create order | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-80) | [PNG](../UC05/S05-01.png) |
| `S05-01-filled` | Create order | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-179) | [PNG](../UC05/S05-01-filled.png) |
| `S05-01-saving` | Saving order | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-278) | [PNG](../UC05/S05-01-saving.png) |
| `S05-02-success` | Order created | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-376) | [PNG](../UC05/S05-02-success.png) |
| `S05-01-error` | Create order | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-415) | [PNG](../UC05/S05-01-error.png) |
| `S05-01-duplicate` | Create order | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-515) | [PNG](../UC05/S05-01-duplicate.png) |
| `S05-01-auth` | Sign in required | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-615) | [PNG](../UC05/S05-01-auth.png) |
| `S05-01-denied` | Access restricted | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-642) | [PNG](../UC05/S05-01-denied.png) |
| `S05-01-failure` | Could not confirm creation | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4191-669) | [PNG](../UC05/S05-01-failure.png) |
| `S06-01` | Import orders from CSV | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-577) | [PNG](../UC06/S06-01.png) |
| `S06-01-selected` | Import orders from CSV | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-622) | [PNG](../UC06/S06-01-selected.png) |
| `S06-01-processing` | Validating and importing | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-667) | [PNG](../UC06/S06-01-processing.png) |
| `S06-01-file-error` | CSV file needs correction | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-700) | [PNG](../UC06/S06-01-file-error.png) |
| `S06-01-file-error-type` | CSV file needs correction | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-741) | [PNG](../UC06/S06-01-file-error-type.png) |
| `S06-01-file-error-empty` | CSV file needs correction | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-782) | [PNG](../UC06/S06-01-file-error-empty.png) |
| `S06-01-file-error-limits` | CSV file needs correction | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-823) | [PNG](../UC06/S06-01-file-error-limits.png) |
| `S06-01-file-error-header` | CSV file needs correction | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-864) | [PNG](../UC06/S06-01-file-error-header.png) |
| `S06-01-file-error-encoding` | CSV file needs correction | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-905) | [PNG](../UC06/S06-01-file-error-encoding.png) |
| `S06-01-file-error-rows` | CSV file needs correction | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-946) | [PNG](../UC06/S06-01-file-error-rows.png) |
| `S06-03-errors` | CSV validation errors | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-987) | [PNG](../UC06/S06-03-errors.png) |
| `S06-04-failure` | Import could not complete | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-1054) | [PNG](../UC06/S06-04-failure.png) |
| `S06-01-auth` | Sign in required | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-1090) | [PNG](../UC06/S06-01-auth.png) |
| `S06-01-denied` | Access restricted | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-1117) | [PNG](../UC06/S06-01-denied.png) |
| `S06-02-success` | CSV import completed | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4192-1144) | [PNG](../UC06/S06-02-success.png) |
| `S07-01` | Orders | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-937) | [PNG](../UC07/S07-01.png) |
| `S07-01-filtered` | Orders | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1097) | [PNG](../UC07/S07-01-filtered.png) |
| `S07-01-page-2` | Orders | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1257) | [PNG](../UC07/S07-01-page-2.png) |
| `S07-01-empty` | Orders | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1341) | [PNG](../UC07/S07-01-empty.png) |
| `S07-01-no-results` | Orders | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1373) | [PNG](../UC07/S07-01-no-results.png) |
| `S07-01-filter-error` | Orders | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1430) | [PNG](../UC07/S07-01-filter-error.png) |
| `S07-02-detail` | Order VL-0101 | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1581) | [PNG](../UC07/S07-02-detail.png) |
| `S07-02-not-found` | Order not found | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1662) | [PNG](../UC07/S07-02-not-found.png) |
| `S07-01-auth` | Sign in required | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1689) | [PNG](../UC07/S07-01-auth.png) |
| `S07-01-denied` | Access restricted | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1720) | [PNG](../UC07/S07-01-denied.png) |
| `S07-01-loading` | Loading orders | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1747) | [PNG](../UC07/S07-01-loading.png) |
| `S07-02-loading` | Loading order details | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1774) | [PNG](../UC07/S07-02-loading.png) |
| `S07-01-load-error` | Orders could not load | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1801) | [PNG](../UC07/S07-01-load-error.png) |
| `S07-02-load-error` | Order details could not load | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4193-1833) | [PNG](../UC07/S07-02-load-error.png) |
| `S08-01-edit` | Edit order VL-0101 | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-1575) | [PNG](../UC08/S08-01-edit.png) |
| `S08-01-saving` | Saving changes | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-1674) | [PNG](../UC08/S08-01-saving.png) |
| `S08-02-updated` | Order updated | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-1771) | [PNG](../UC08/S08-02-updated.png) |
| `S08-03-cancel-confirm` | Cancel order VL-0101 | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-1851) | [PNG](../UC08/S08-03-cancel-confirm.png) |
| `S08-03-cancel-confirm-filled` | Cancel order VL-0101 | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-1891) | [PNG](../UC08/S08-03-cancel-confirm-filled.png) |
| `S08-04-cancelled` | Order cancelled | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-1931) | [PNG](../UC08/S08-04-cancelled.png) |
| `S08-01-error` | Edit order VL-0101 | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2014) | [PNG](../UC08/S08-01-error.png) |
| `S08-01-identity-error` | Edit request rejected | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2122) | [PNG](../UC08/S08-01-identity-error.png) |
| `S08-03-reason-error` | Cancel order VL-0101 | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2164) | [PNG](../UC08/S08-03-reason-error.png) |
| `S08-05-status-blocked` | This action is unavailable | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2204) | [PNG](../UC08/S08-05-status-blocked.png) |
| `S08-06-conflict` | The order changed | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2250) | [PNG](../UC08/S08-06-conflict.png) |
| `S08-07-not-found` | Order not found | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2285) | [PNG](../UC08/S08-07-not-found.png) |
| `S08-01-auth` | Sign in required | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2312) | [PNG](../UC08/S08-01-auth.png) |
| `S08-01-denied` | Access restricted | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2343) | [PNG](../UC08/S08-01-denied.png) |
| `S08-08-failure` | Could not confirm the change | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4196-2370) | [PNG](../UC08/S08-08-failure.png) |
| `S08-01-edit-changed` | Edit order VL-0101 | [Figma](https://www.figma.com/design/RBd5qiERPNz1yXRgkYVcwP/?node-id=4197-2132) | [PNG](../UC08/S08-01-edit-changed.png) |

## Reproduce F02 checks
Performed by: Codex (AI-assisted publication). Reviewed by: Pending — Phạm Công Khánh. Edited by: Codex; human editor pending.

## Reproduce publication checks
Performed by: Codex (AI-assisted documentation repair and verification). Reviewed by: Pending — Phạm Công Khánh. Edited by: Codex; human editor pending.

From repository root, with Python 3/Pillow, Pandoc and Poppler available:

```bash
python3 docs/test/f02-order-intake/csv/validate_samples.py
python3 docs/test/f02-order-intake/verify_deliverables.py
```

The CSV checker prints results without changing its saved report. It checks five valid rows, eight invalid-case rows with seven field errors, zero inserted rows for the invalid batch and an unchanged synthetic store; this is in-memory evidence, not a database transaction test. For intentional PDF regeneration, additionally use a separate WeasyPrint 70.0 environment:

```bash
python3 docs/test/f02-order-intake/export_documents.py
python3 docs/test/f02-order-intake/verify_deliverables.py
```

The exporter regenerates only the UC and handoff PDFs and metadata; the verifier checks all three published document PDFs, PNG hashes, local references, preserved HTTPS targets, lossless screenshot pixels, CSV results and current provenance. It updates verification metadata. [Source provenance](../../../../test/f02-order-intake/integration-manifest.json) preserves the audited-source hashes; [publication results](../../../../test/f02-order-intake/integration-verification.json) distinguish historical records from final checks. Local README reports and their paired PDFs are deliberately excluded from this PR at the user's request. No fresh Figma, backend, database, browser or human acceptance claim is made.
