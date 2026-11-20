# Design

## Context

See [proposal.md](proposal.md) and the [prototype delta](specs/order-intake-prototype/spec.md). This package is the clean Section D handoff for [BOOYAH-20](https://thaikiet291006.atlassian.net/browse/BOOYAH-20). Section D and the PA3 submission guidelines require complete English use cases, visible alternatives, embedded screen evidence, attribution and a matching PDF.

Use only these inputs for design and traceability:

| Source | Use |
| --- | --- |
| Live BOOYAH-20 description and PA3-2026 rubric, pp. 2–4 | Scope, alternative flows, AC1–AC5 and submission format |
| Kiệt's BOOYAH-24 `UseCaseModel.md`, §§2–4 and 5–7 | Actors, UC IDs and names, FR coverage, glossary, state reconciliation and UC structure |
| Kiệt's BOOYAH-26 `VisionDocument.md`, §§3.2–3.3, 5.1, 5.3 and 6, and `Changes.md` | FR/SRC provenance, desktop baseline, NFRs and open product decisions |
| [BOOYAH-13](https://thaikiet291006.atlassian.net/browse/BOOYAH-13) and [BOOYAH-19](https://thaikiet291006.atlassian.net/browse/BOOYAH-19) | Downstream Section E handoff and shared CSV, permissions and state expectations |
| Công Khánh's original `PrototypeKit` in `docs/draft/3/Công Khánh - PA3 - ProtoypeKit-20261119T103921Z-1-001/Công Khánh - PA3 - ProtoypeKit/PrototypeKit/` | Sole design, desktop layout, assets, screen conventions and export-format source |

Keep `docs/draft/` read-only. Exclude the previous BOOYAH-20 implementation, branches, PRs, commits, screenshots, specifications, generated artifacts and historical logs as design inputs. Exclude Kiệt's Figma prototype and assets. Use the completed clean exploration as the planning input.

## Goals / Non-Goals

- Give a reviewer a navigable local desktop simulation with reproducible evidence for each main and alternative flow.
- Keep one source for screen IDs, one CSV contract and one decision record in the Section D Markdown. Generate the PDF from that Markdown.
- Keep simulation inputs synthetic and local. Section E code, schema, runtime authentication, persistence, deployments and later Order/DeliveryAttempt transitions belong to their own work.

## Decisions

### Output paths

All paths below are repository-relative. Prototype paths start at `docs/analysis-and-design/use-cases/prototypes/order-intake/`.

| Path | Role |
| --- | --- |
| `docs/analysis-and-design/use-cases/UC-F02-Orders.md` | English UC05–UC08, decision log, traceability, embedded screenshots and reviewer handoff |
| `docs/analysis-and-design/use-cases/UC-F02-Orders.pdf` | A4 export of the same Markdown, with readable images and links |
| `docs/analysis-and-design/use-cases/prototypes/order-intake/index.html`, `order-intake.css`, `order-intake.js` | Local gallery, desktop walkthrough and state fixtures |
| `docs/analysis-and-design/use-cases/prototypes/order-intake/kit.css`, `docs/analysis-and-design/use-cases/prototypes/kit/tokens.css`, `docs/analysis-and-design/use-cases/prototypes/kit/assets/fonts/` | F02's original component rules plus shared tokens and fonts. The gallery loads the team kit assets in place. |
| `docs/analysis-and-design/use-cases/prototypes/order-intake/kit-graphics.js`, `contract.js`, `screens.js` | Original kit graphics, shared prototype validation and file-preview mirror of the manifest |
| `docs/analysis-and-design/use-cases/fixtures/order-intake/` containing `orders-valid.csv`, `orders-invalid.csv`, `orders-template.csv` | 20-order demo, mixed-error demo and header-only downloadable template, respectively |
| `docs/analysis-and-design/use-cases/prototypes/order-intake/screens.json` and `deliverable-paths.mjs` | Canonical screen IDs, titles, groups and path mapping used by the exporter and verifier |
| `docs/analysis-and-design/use-cases/prototypes/UC05/` through `UC08/` | Light `<screen-id>.png` files at the UC root. Captures are 1440×900 at 2× raster scale. |
| `docs/analysis-and-design/use-cases/prototypes/order-intake/README.md`, `package.json`, `package-lock.json`, `export.mjs`, `verify.mjs`, `print.css` | Reproduction instructions, pinned Playwright tooling, export and verification commands |
| `docs/ai-log/PA3/thepenguinguy123.md`, `docs/ai-log/README.md` | Append-only AI usage and index, with a cross-reference to the clean exploration in `PA3/unassigned.md` |

During apply, check that intended destinations can be written without replacing unrelated or excluded files. If a prohibited artifact occupies an exact destination, use a clean authorized worktree when available or surface the collision without reading the artifact.

Place images according to their manifest UC group. The shared `S07-01-denied`, `S07-01-session-expired` and `S07-01-not-found` states are stored once under `UC07/` and referenced from the shared access section.

### Decision register

In the final Section D Markdown, include one record per rule with exact values, examples, source, review authority, reviewer/date when evidenced and status. The values below follow the BOOYAH-13 contract locally confirmed by Khánh on 19 November and the six corrections requested on PR #16 on 20 November. Independent acceptance and corrected revision review remain pending.

| ID | Proposed behavior and validation example | Basis and review |
| --- | --- | --- |
| D-F02-1 | Require `order_code`, `recipient_name`, `recipient_phone`, `delivery_address`, `window_start`, `window_end` and `weight_kg`. Trim code, name and address. Code uses 1–40 ASCII letters, digits, underscores or hyphens, e.g. `_A-01`. Name uses 1–100 Unicode characters and delivery address 5–255. Phone is exactly 10 digits starting with 0, e.g. `0900000001`. Use valid `YYYY-MM-DD HH:mm` in `Asia/Ho_Chi_Minh`, end after start and positive finite weight. Optional priority is `NORMAL` by default or `HIGH`. Note is optional. Coordinates are both absent or both within latitude [−90, 90] and longitude [−180, 180]. | BOOYAH-13 and BOOYAH-19 validator. PR #16 finding 1. |
| D-F02-2 | Keep the trimmed display code and compare lowercase keys within the authorized hub. `F02-001` and ` f02-001 ` conflict in a file and against records in that hub. A code used in another hub remains available. | BOOYAH-13 and BOOYAH-19 parser and service. PR #16 finding 3. |
| D-F02-3 | Preview is read-only. Explicit confirmation starts the atomic import and rechecks the batch. Report record, column and reason, including every duplicate occurrence. Twenty valid records create 20. Mixed errors, a confirmation-time conflict and dismissal create zero. The prototype simulates both preview and commit. | BOOYAH-13 and BOOYAH-19 import route and service. PR #16 finding 3. |
| D-F02-4 | Accept `.csv`, UTF-8 with optional BOM, LF or CRLF, quoted commas and line breaks and escaped quotes. Require all seven required columns in any order. Optional columns are `priority`, `note`, `latitude` and `longitude`. Reject missing, duplicate and unknown names and wrong-width records. Accept 1–500 data records and at most 1,000,000 bytes. Header is record 1. | BOOYAH-13 and BOOYAH-19 parser and template. PR #16 finding 2. |
| D-F02-5 | Edit or cancel a current `NEW` order with a matching version. Code is read-only and omitted from edit submission. Hub, status and audit fields are protected. Cancel with 5–300 characters after trim, retain the same order as `CANCELLED` and show the saved reason. A stale or repeat request preserves the current record and saved reason. | BOOYAH-13 and BOOYAH-19 service. PR #16 findings 1, 5 and 6. |
| D-F02-6 | Create/import yield `NEW`. Edits retain `NEW`. Confirmed cancellation transitions `NEW → CANCELLED` with no reversal. Order and DeliveryAttempt lifecycles are separate. | BOOYAH-13 and BOOYAH-24 state reconciliation. |
| D-F02-7 | Only Dispatchers with a trusted hub assignment can access F02. Respond `401` for missing or expired session, `403` for denied role or missing hub authorization and `404` for a missing or different-hub Order. The last two cases show no Order details. Signing in does not replay the request. | BOOYAH-13 and BOOYAH-19 access wrapper and service. PR #16 finding 4. |
| D-F02-8 | Combine status, inclusive hub-local window-start dates and a case-insensitive literal keyword in displayed code, recipient name or phone. Sort by window start then displayed code ascending. Page size is 20. Reset an out-of-range page to page 1 and retain current filters. | BOOYAH-13 and BOOYAH-19 list service. PR #16 finding 4. |

### Prototype transitions and traceability

Use the shared kit's desktop shell, glass tokens, local fonts, forms, banners, tables and badges in light mode. Adapt styles only in the working copy. Retain `?screen=<id>&standalone=1` for direct deterministic capture. Use local fixtures and simulated actions; gallery links provide direct access to failure states that cannot arise in a standalone prototype. State IDs are dot-free and consistent across viewport sizes.

For each numbered step, write an actor action or an observable response. Name alternatives with IDs such as `06.A2`, record the exact branch-from step, give a screen ID at each visible step and state the outcome and resume or termination point. Internal checks link to the next visible feedback. Include captions for each screenshot and reuse shared states by explicit anchor or embedded image. The table fixes the minimum inventory and expected coverage.

| UC, requirements and steps | Screen IDs and states |
| --- | --- |
| UC05 · FR-02-1 / SRC-02-01, FR-02-3 / SRC-02-03 · 05.1 open, 05.2 fill, 05.3 save, 05.4 read new detail | `S07-01` entry, `S05-01` form, `S07-02-created` NEW detail. From 05.3 use `S05-01-error` for missing destination, invalid phone, inverted/equal window and nonpositive weight, and `S05-01-duplicate` for duplicate code. Both keep input for retry. Leaving the form returns to `S07-01` without creating an Order. |
| UC06 · FR-02-2 / SRC-02-02, FR-02-3 / SRC-02-03 · 06.1 open/download, 06.2 select/validate, 06.3 preview/confirm, 06.4 result | `S06-01` picker/template, `S06-02` preview, `S06-03` success. From 06.2 use `S06-01-file-type`, `S06-01-file-empty`, `S06-01-file-header`, `S06-01-file-limit`, `S06-01-file-format` and `S06-02-row-errors`. Size and count variants must be reachable within the limit screen and explicit in the report, as must invalid UTF-8 and malformed CSV within the format screen. From 06.3 cancel to `S07-01`. From 06.4 a confirmation-time duplicate shows `S06-02-conflict` with zero imported. |
| UC07 · FR-02-4 / SRC-02-04 · 07.1 list, 07.2 filter/page, 07.3 open detail | `S07-01`, `S07-01-filtered`, `S07-01-page-2`, `S07-02`. From 07.1 use `S07-01-empty` for a new hub. From 07.2 use `S07-01-no-results` for a valid query with zero matches and `S07-01-filter-error` for an inverted date range. From 07.3 use `S07-01-not-found` for an absent or out-of-hub order. |
| UC08 · FR-02-3 / SRC-02-03, FR-02-5 / SRC-02-05 · 08.1 open detail, 08.2 edit or request cancellation, 08.3 submit, 08.4 view result | `S07-02` detail, `S08-01` edit, `S08-02` cancel and reason, `S07-02-updated` saved, `S08-03` cancelled. From 08.1 use `S08-01-blocked` when a non-NEW order is opened for editing. From 08.2 dismiss the confirmation back to detail. From 08.3 use `S08-01-error` for edit validation, `S08-02-error` for invalid reason, `S08-01-conflict` for stale edits/cancellations and `S08-03-already-cancelled` for repeated cancellation. |
| UC05–UC08 · FR-01-2 / SRC-01-02 · enter or submit | `S07-01-session-expired` for 401, `S07-01-denied` for 403 and `S07-01-not-found` for 404. Use Sign In, safe exit and Orders recovery, respectively. |

Within any file-feedback state that reuses the same layout, include every distinct user-visible cause in the walkthrough and embedded evidence. If a single frame cannot clearly show both variants, add stable suffix IDs to the manifest and traceability rows. For 1280×720, verify every state at that viewport rather than assigning new screen IDs. Incorporate the relevant Vision NFRs as special requirements: N05 roles and resource boundaries, N06 synthetic data, and N16 focus, labels, keyboard navigation and contrast at prototype level. Record N01/N17 runtime or cross-browser checks separately if actual evidence is available.

The working copy retains the 38 states from the previous revision and adds one independent HTTP 404 state. `S06-01-file-empty-header`, `S06-01-file-limit-bytes`, `S06-01-file-format-encoding` and `S06-01-file-format-width` distinguish file errors. `S07-01-import-cancelled` shows the zero-order result after dismissing confirmation, and `S08-01-conflict-cancel` shows the stale cancellation message. Both use the recovery paths specified in the table.

### Fixture design and Section E compatibility

Match the Section E template including its example. The valid fixture has codes `F02-001` through `F02-020` and hub-local times `2026-11-21 09:00` to `2026-11-21 11:00`. The mixed fixture produces seven simulated preview diagnostics across records 2–4, including both duplicate rows and a seed collision. The Section E parser raises six input errors before the existing-code lookup. Dedicated fixtures cover missing, duplicate and unknown headers. Check reordered required columns and omitted optional columns.

At PR #16 review, the BOOYAH-13 contract was on `origin/dev` at `84bc0d8`. The available BOOYAH-19 validator, CSV parser, service and API routes were read at `c0906d0`. Inspect those sources and run the isolated parser against fixtures. Separately verify the browser demo and record AC4 as pending for actual API, guard, persistence, and transaction integration.

### Export and machine verification

Adapt Khánh's documented standalone capture and A4 approach to Playwright Chromium. The working copy pins Playwright 1.61.0 with its matching Chromium, using the available BOOYAH-14 browser cache. The prototype stays runnable from local files with no service credentials, and the fixture download works across the local static preview. Record the Node, Pandoc, Playwright and Chromium versions used at apply. Commands from the repository root:

```sh
prototype=docs/analysis-and-design/use-cases/prototypes/order-intake
npm --prefix "$prototype" ci
npm --prefix "$prototype" exec -- playwright install --only-shell chromium
node "$prototype/export.mjs" --png
# The Markdown must contain the final screenshot embeds before this command.
node "$prototype/export.mjs" --pdf
node "$prototype/verify.mjs"
pdfinfo docs/analysis-and-design/use-cases/UC-F02-Orders.pdf
pdftotext docs/analysis-and-design/use-cases/UC-F02-Orders.pdf -
git diff --check
```

Use Playwright's `chromium.launch()` with 1440×900 CSS viewport and deviceScaleFactor 2. Wait for `document.fonts.ready` and visible screen-state content, disable animations, and capture 2880×1800 PNGs. Run light-mode 1280×720 checks with temporary diagnostic screenshots and assertions for body horizontal overflow, readable visible content, reachable primary actions, and fetch/console errors. Verify keyboard access to main actions and focus/linkage of validation feedback. Capture screenshots before checking that all manifest entries, UC step references and Markdown image paths match, and that each PNG has the expected geometry. Spot-check rendered states including the longest error list, cancellation, conflict and empty/denied screens.

For the PDF, have `export.mjs --pdf` invoke Pandoc to convert Markdown to standalone HTML using `gfm`, then print via Playwright with `format: "A4"`, print backgrounds, local assets and the planned `print.css`. Build temporary HTML outside the tracked deliverables and set the source base URL to the Markdown directory so relative image paths resolve. Verify each image is loaded before printing. Confirm A4 dimensions, extract all UC headings and representative text with `pdftotext`, check link and image presence and visually inspect page breaks, caption placement and legibility. Check UTF-8, whitespace and relative links in newly created files directly because `git diff --check` alone omits untracked files.

## Risks / Trade-offs

- Proposed rule values may diverge from a Section E decision → Keep one row per mismatch with source, owner and review status. Finish the draft package while values are pending, and rerun fixtures, screenshots and PDF after a rule changes.
- Existing kit sample labels include `Pending` and `Assigned` → Reuse visual assets and styles, and show the proposed F02 labels `NEW` and `CANCELLED` in the remake. Leave later lifecycle vocabulary to the owning tasks.
- A prototype can represent session expiry, duplicate races and conflicts only as simulations → Record these as screen evidence. Real concurrency, persistence and guard acceptance stay with Section E and human review.
- Export tooling can depend on Chromium availability → Bootstrap the pinned Playwright version locally, report the exact install or execution result, and retain the reproducible command. Treat clipping or unreadable evidence as a failed local check.
- Reviewer requested light evidence only → Publish one light PNG for every state. Store each shared access image once.

## Migration Plan

The review package is additive documentation and standalone prototype evidence. Release and rollback are repository review operations. No database or deployment step is part of this change.
