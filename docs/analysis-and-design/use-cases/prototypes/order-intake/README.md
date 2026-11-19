# Veylo · Order Intake prototype
Performed by: Codex for task owner Trần Lê Hải. Reviewed by: Pending (Phạm Công Khánh). Edited by: Codex.

The prototype shares the desktop shell, glass components, fonts, icons and decorative map from Công Khánh's original kit in `docs/draft/3/Công Khánh - PA3 - ProtoypeKit-20261119T103921Z-1-001/Công Khánh - PA3 - ProtoypeKit/PrototypeKit/`. It loads [shared tokens](../kit/tokens.css) and [shared fonts](../kit/assets/fonts/fonts.css) from the team kit. Its local [component stylesheet](kit.css) retains the original rules used by the F02 screens, and [kit-graphics.js](kit-graphics.js) contains the original SVG definitions. All data is synthetic. Reload resets the demo.

Open [index.html](index.html) locally. The gallery's **Screen** menu opens any of the 38 states. **Next action** triggers one simulated denial, stale write, cancelled order or confirmation-time code conflict. Use `?screen=S07-01&theme=dark&standalone=1` to invoke the kit's frameless view. For unauthorized-resource examples, `?screen=S07-02&hub=other` opens the access-restricted state. The list table can scroll within the desktop frame, then paginate to additional results. The [Section D specification](../../UC-F02-Orders.md) links the flows and figures.

UC06 downloads the [CSV template](../../fixtures/order-intake/orders-template.csv), [valid sample](../../fixtures/order-intake/orders-valid.csv) and [invalid sample](../../fixtures/order-intake/orders-invalid.csv) from the Section D fixture directory.

## Reproduce the evidence
Performed by: Codex for task owner Trần Lê Hải. Reviewed by: Pending (Phạm Công Khánh). Edited by: Codex.

Use Node.js 22, the locked Playwright dependency, its Chromium headless shell, Pandoc and Poppler. This prototype was checked using Playwright **1.61.0** and Chromium **149.0.7827.55**, matching the existing local BOOYAH-14 tools. The planning pin was 1.56.1. The commands use Chromium installed through Playwright or a matching local browser cache supplied via `PLAYWRIGHT_BROWSERS_PATH`.

From the repository root:

```sh
prototype=docs/analysis-and-design/use-cases/prototypes/order-intake
npm --prefix "$prototype" ci
npm --prefix "$prototype" exec -- playwright install --only-shell chromium
node "$prototype/verify.mjs" --csv
node "$prototype/export.mjs" --sample
# Inspect docs/analysis-and-design/use-cases/prototypes/UC07/S07-01.png before the complete batch.
node "$prototype/export.mjs" --png
node "$prototype/export.mjs" --pdf
node "$prototype/verify.mjs"
pdfinfo docs/analysis-and-design/use-cases/UC-F02-Orders.pdf
pdfimages -list docs/analysis-and-design/use-cases/UC-F02-Orders.pdf
```

The batch exports light PNGs directly to `prototypes/UC05/` through `prototypes/UC08/` and dark PNGs under each UC's `dark/` directory. Both themes use 1440×900 CSS pixels at device scale factor 2. Each screen follows its UC group in `screens.json`, with the two shared access states stored once under UC07. The verifier checks every theme and state at 1440×900 and 1280×720, the browser walkthroughs, all manifest PNGs and the report. Set `VEYLO_KEEP_DIAGNOSTICS=1` to retain temporary 1280×720 inspection screenshots. Keep `screens.js` synchronized with `screens.json` for preview from local files. The verifier checks equivalence.
