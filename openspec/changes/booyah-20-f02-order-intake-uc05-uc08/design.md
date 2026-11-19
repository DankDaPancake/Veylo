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
| `docs/analysis-and-design/use-cases/prototypes/UC05/` through `UC08/` | Light `<screen-id>.png` files at the UC root and dark `<screen-id>.png` files under `dark/`. Captures are 1440×900 at 2× raster scale. |
| `docs/analysis-and-design/use-cases/prototypes/order-intake/README.md`, `package.json`, `package-lock.json`, `export.mjs`, `verify.mjs`, `print.css` | Reproduction instructions, pinned Playwright tooling, export and verification commands |
| `docs/ai-log/PA3/thepenguinguy123.md`, `docs/ai-log/README.md` | Append-only AI usage and index, with a cross-reference to the clean exploration in `PA3/unassigned.md` |

During apply, check that intended destinations can be written without replacing unrelated or excluded files. If a prohibited artifact occupies an exact destination, use a clean authorized worktree when available or surface the collision without reading the artifact.

Place images according to their manifest UC group. The shared `S07-01-denied` and `S07-01-session-expired` states are stored once per theme under `UC07/` and referenced from the shared access section.

### Decision register

In the final Section D Markdown, include one record per rule with exact values, examples, source, review authority, reviewer/date when evidenced and status. Every detailed value below is **Proposed / Pending PR Review**. The baseline FR text and glossary are sourced from Kiệt's review drafts. Product confirmation and downstream alignment need review evidence.

| ID | Proposed behavior and validation example | Basis and review |
| --- | --- | --- |
| D-F02-1 | Required fields in header order are `order_code,recipient_name,recipient_phone,destination_address,window_start,window_end,weight_kg`. Optional `note` is last and may be blank. Trim boundary whitespace. Code is 1–32 ASCII letters/digits/hyphens and starts alphanumeric, e.g. `F02-001`. Name is 1–100 characters and free-text address 1–250 characters. Phone accepts the syntax `0` plus nine digits or `+84` plus nine digits. Use fictional values only. CSV timestamps use `YYYY-MM-DDTHH:mm+07:00` with real dates and end strictly after start. Weight is a finite, positive decimal in kg with a dot decimal separator, e.g. `1.25`. Note is at most 500 characters. Priority and coordinates are outside this proposed demo field set. | FR-02-3 and BOOYAH-20 D-F02-1, with concrete demo limits from clean exploration. Check with Kiệt and BOOYAH-13/19 reviewers. |
| D-F02-2 | Trim and compare code case-insensitively per hub. `F02-001` and ` f02-001 ` conflict in the same hub and in the same file. A different hub may use the same code. Apply to manual creation and both import checks, including confirmation. | BOOYAH-20 D-F02-2 and BOOYAH-24 Hub glossary. Confirm with Kiệt and reconcile downstream. |
| D-F02-3 | Validate the entire batch before confirmation and validate again at confirmation. Any row failure or newly conflicting code yields zero new Orders for the whole batch. Show record number, column and reason. Leaving confirmation also creates zero Orders. | BOOYAH-20 D-F02-3 and BOOYAH-19 AC2–AC3. Confirm atomic policy with Kiệt. |
| D-F02-4 | Comma-delimited UTF-8 CSV with optional BOM and a single header in D-F02-1 order. The trailing `note` column may be omitted from the entire file. Allow quoted embedded commas, escaped double quotes and LF/CRLF. Reject unknown, duplicate, missing or out-of-order headers, wrong row width, invalid UTF-8, unsupported file type and empty data including header-only. Count parsed records, with header numbered 1, and cap at 500 data records and 1,000,000 raw bytes. Use a downloadable template containing the canonical header. | BOOYAH-20 D-F02-4 and clean exploration. Header shape, CSV error boundaries and byte definition are draft refinements for review. |
| D-F02-5 | Only current `NEW` can be edited or cancelled. Code and hub are fixed in the edit demo. Cancellation requires a trimmed 1–250 character reason, changes state to `CANCELLED` and retains the Order. Stale writes prompt reload of the latest version and never overwrite it. An already cancelled order displays the original reason. | FR-02-5, BOOYAH-20 D-F02-5 and BOOYAH-19 AC3. Confirm with Kiệt and compare with Section E. |
| D-F02-6 | Use `NEW` after create/import and `NEW → CANCELLED` on cancellation. A valid edit stays `NEW`. Order is the delivery request, and DeliveryAttempt is a separate execution record with its own timestamps and outcome. Keep later status labels open. | BOOYAH-24 State Reconciliation Register and BOOYAH-20 D-F02-6. Reconcile with Kiệt and the BOOYAH-13 contract owner. |
| D-F02-7 | Permit only Hub Dispatcher in the hub from the authenticated session. The role boundary is sourced from BOOYAH-24/26. Administrator and Delivery Rider have separate goals. Use generic forbidden UI for other-hub URLs or disallowed roles with no resource detail. Expired session leads to Sign In without replay. Document `403` for authenticated denial and `401` for expired or absent authentication per N05; simulate those states locally. | FR-01-2 and N05, BOOYAH-24 §2, and BOOYAH-20 D-F02-7. Log the specific hub and recovery choices for review. |
| D-F02-8 | Filter by `NEW`/`CANCELLED`, inclusive hub-local window-start date range, and case-insensitive keyword substring in code, recipient name or address. Apply filters together. Default to 20 per page, sort by window start ascending then normalized order code ascending, and reset to page 1 when filters change. Reject inverted dates with a field hint. | FR-02-4 and BOOYAH-20 D-F02-8. Date semantics, tie-break and invalid-date feedback are draft refinements for review. |

### Prototype transitions and traceability

Use the shared kit's desktop shell, glass tokens, local fonts, forms, banners, tables, badges and light/dark modes. Adapt styles only in the working copy. Retain `?screen=<id>&theme=light|dark&standalone=1` for direct deterministic capture. Use local fixtures and simulated actions; gallery links provide direct access to failure states that cannot arise in a standalone prototype. State IDs are dot-free and shared across themes and viewport sizes.

For each numbered step, write an actor action or an observable response. Name alternatives with IDs such as `06.A2`, record the exact branch-from step, give a screen ID at each visible step and state the outcome and resume or termination point. Internal checks link to the next visible feedback. Include captions for each screenshot and reuse shared states by explicit anchor or embedded image. The table fixes the minimum inventory and expected coverage.

| UC, requirements and steps | Screen IDs and states |
| --- | --- |
| UC05 · FR-02-1 / SRC-02-01, FR-02-3 / SRC-02-03 · 05.1 open, 05.2 fill, 05.3 save, 05.4 read new detail | `S07-01` entry, `S05-01` form, `S07-02-created` NEW detail. From 05.3 use `S05-01-error` for missing destination, invalid phone, inverted/equal window and nonpositive weight, and `S05-01-duplicate` for duplicate code. Both keep input for retry. Leaving the form returns to `S07-01` without creating an Order. |
| UC06 · FR-02-2 / SRC-02-02, FR-02-3 / SRC-02-03 · 06.1 open/download, 06.2 select/validate, 06.3 preview/confirm, 06.4 result | `S06-01` picker/template, `S06-02` preview, `S06-03` success. From 06.2 use `S06-01-file-type`, `S06-01-file-empty`, `S06-01-file-header`, `S06-01-file-limit`, `S06-01-file-format` and `S06-02-row-errors`. Size and count variants must be reachable within the limit screen and explicit in the report, as must invalid UTF-8 and malformed CSV within the format screen. From 06.3 cancel to `S07-01`. From 06.4 a confirmation-time duplicate shows `S06-02-conflict` with zero imported. |
| UC07 · FR-02-4 / SRC-02-04 · 07.1 list, 07.2 filter/page, 07.3 open detail | `S07-01`, `S07-01-filtered`, `S07-01-page-2`, `S07-02`. From 07.1 use `S07-01-empty` for a new hub. From 07.2 use `S07-01-no-results` for a valid query with zero matches and `S07-01-filter-error` for an inverted date range. From 07.3 use `S07-01-denied` for a disallowed hub. |
| UC08 · FR-02-3 / SRC-02-03, FR-02-5 / SRC-02-05 · 08.1 open detail, 08.2 edit or request cancellation, 08.3 submit, 08.4 view result | `S07-02` detail, `S08-01` edit, `S08-02` cancel and reason, `S07-02-updated` saved, `S08-03` cancelled. From 08.1 use `S08-01-blocked` when a non-NEW order is opened for editing. From 08.2 dismiss the confirmation back to detail. From 08.3 use `S08-01-error` for edit validation, `S08-02-error` for invalid reason, `S08-01-conflict` for stale edits/cancellations and `S08-03-already-cancelled` for repeated cancellation. |
| UC05–UC08 · FR-01-2 / SRC-01-02 · enter or submit | `S07-01-denied` for role or cross-hub denial, and `S07-01-session-expired` for expired-session recovery. Use a permitted exit for denied users and a Sign In action for expiration. |

Within any file-feedback state that reuses the same layout, include every distinct user-visible cause in the walkthrough and embedded evidence. If a single frame cannot clearly show both variants, add stable suffix IDs to the manifest and traceability rows. For 1280×720, verify every state at that viewport rather than assigning new screen IDs. Incorporate the relevant Vision NFRs as special requirements: N05 roles and resource boundaries, N06 synthetic data, and N16 focus, labels, keyboard navigation and contrast at prototype level. Record N01/N17 runtime or cross-browser checks separately if actual evidence is available.

The working copy adds six visible variants to the 32 planned state IDs. `S06-01-file-empty-header`, `S06-01-file-limit-bytes`, `S06-01-file-format-encoding` and `S06-01-file-format-width` distinguish file errors. `S07-01-import-cancelled` shows the zero-order result after dismissing confirmation, and `S08-01-conflict-cancel` shows the stale cancellation message. Both use the recovery paths specified in the table.

### Fixture design and Section E compatibility

Use `F02-001` through `F02-020` with fictional recipients, a quoted synthetic address containing a comma, `2026-11-21T09:00+07:00` through `2026-11-21T11:00+07:00`, and `1.25` kg. Generate the downloadable template with just the canonical header. Record 2 of the invalid sample is valid. Record 3 uses ` f02-001 `, `abc`, blank address, equal times and zero weight. Record 4 uses `F02-500` with valid field values, seeded in the same hub in the fixture oracle. Expected diagnostics are record 3 code, phone, address, end time and weight plus record 4 code. Verify expected outcomes of 20 and 0 using the proposed contract. Use a clean fixture hub for the valid import test.

Compare column names/order, required values, representation of phone/time/weight, case-insensitive uniqueness and hub boundary, row numbering, error shape, limits, atomicity, status/reason, concurrent confirmation and sort/page behavior. Cite source, revision and observed evidence for each dimension as `Aligned`, `Mismatch` or `Unverified`. Use live Jira descriptions and specifically authorized BOOYAH-13/19 evidence with clean-remake provenance. Where Section E source cannot be used without crossing the exclusion, record the evidence gap and let the designated review verify parity later. AC4 stays open pending those checks. BOOYAH-13 AC1 needs a WHEN/THEN scenario per rule, and BOOYAH-19 AC2–AC4 needs real 20/0 persistence and role-guard evidence. Preserve the separate data-model approval and dedicated disposable database gates in those tickets.

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

Use Playwright's `chromium.launch()` with 1440×900 CSS viewport and deviceScaleFactor 2. Wait for `document.fonts.ready` and visible screen-state content, disable animations, and capture 2880×1800 PNGs. Run 1280×720 checks for both themes with temporary diagnostic screenshots and assertions for body horizontal overflow, readable visible content, reachable primary actions, and fetch/console errors. Verify keyboard access to main actions and focus/linkage of validation feedback. Capture screenshots before checking that all manifest entries, UC step references and Markdown image paths match, and that each PNG has the expected geometry. Spot-check rendered states in both themes, including the longest error list, cancellation, conflict and empty/denied screens.

For the PDF, have `export.mjs --pdf` invoke Pandoc to convert Markdown to standalone HTML using `gfm`, then print via Playwright with `format: "A4"`, print backgrounds, local assets and the planned `print.css`. Build temporary HTML outside the tracked deliverables and set the source base URL to the Markdown directory so relative image paths resolve. Verify each image is loaded before printing. Confirm A4 dimensions, extract all UC headings and representative text with `pdftotext`, check link and image presence and visually inspect page breaks, caption placement and legibility. Check UTF-8, whitespace and relative links in newly created files directly because `git diff --check` alone omits untracked files.

## Risks / Trade-offs

- Proposed rule values may diverge from a Section E decision → Keep one row per mismatch with source, owner and review status. Finish the draft package while values are pending, and rerun fixtures, screenshots and PDF after a rule changes.
- Existing kit sample labels include `Pending` and `Assigned` → Reuse visual assets and styles, and show the proposed F02 labels `NEW` and `CANCELLED` in the remake. Leave later lifecycle vocabulary to the owning tasks.
- A prototype can represent session expiry, duplicate races and conflicts only as simulations → Record these as screen evidence. Real concurrency, persistence and guard acceptance stay with Section E and human review.
- Export tooling can depend on Chromium availability → Bootstrap the pinned Playwright version locally, report the exact install or execution result, and retain the reproducible command. Treat clipping or unreadable evidence as a failed local check.
- Theme variants increase artifact size → Embed the light PNGs for each flow and keep dark exports alongside them for review. Use equivalent PNGs for shared states rather than duplicating captures across UCs.

## Migration Plan

The review package is additive documentation and standalone prototype evidence. Release and rollback are repository review operations. No database or deployment step is part of this change.
