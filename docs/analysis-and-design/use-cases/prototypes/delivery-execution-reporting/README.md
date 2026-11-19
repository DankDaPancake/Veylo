# BOOYAH-14 prototype working copy

This workspace is copied from Phạm Công Khánh's BOOYAH-25 PrototypeKit at `docs/draft/3/Công Khánh - PA3 - ProtoypeKit-20261119T103921Z-1-001/Công Khánh - PA3 - ProtoypeKit/PrototypeKit/`. The source in `docs/draft` is a local, ignored reference. Keep it read-only.

`index.html` links the fresh BOOYAH-14 walkthrough and retains the shared kit samples in separate gallery tabs. `tokens.css`, `kit.css` and the local fonts preserve the kit's visual conventions. Choose a named state in the walkthrough selector or follow the actions and local forms. The states simulate operations using new synthetic data. The prototype has no backend or storage. Keep rejected BOOYAH-14 material outside the source set.

## Capture and embed

With Node.js 22, install Playwright 1.61.0 and its Chromium headless shell in a local, writable directory:

```sh
export BOOYAH14_PLAYWRIGHT_ROOT=/tmp/veylo-booyah14-playwright
export PLAYWRIGHT_BROWSERS_PATH="$BOOYAH14_PLAYWRIGHT_ROOT/browsers"
npm install --prefix "$BOOYAH14_PLAYWRIGHT_ROOT" --cache "$BOOYAH14_PLAYWRIGHT_ROOT/npm-cache" --no-save --no-package-lock --ignore-scripts playwright@1.61.0
node "$BOOYAH14_PLAYWRIGHT_ROOT/node_modules/playwright/cli.js" install --only-shell chromium
```

Run the browser check and sample capture from the repository root:

```sh
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs --list
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs --check-browser
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs --sample
```

The exporter launches Playwright Chromium with its browser sandbox enabled. The sample is `UC11/S11-01-assigned-work.png` at 360×800 pixels. After visually checking it, run the batch and embed:

```sh
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export.mjs
node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/embed.mjs
```

The exporter matches the manifest keys against `frames.js` and waits for the requested state and local fonts. It uses `page.screenshot()` to capture Light Glass at the manifest dimensions. The embedder checks the PNG dimensions and rejects duplicate file hashes before replacing any evidence placeholder. Inspect the images visually before exporting the PDF.

PNGs go to `UC11/`, `UC12/`, `UC13/`, and `UC19/` in this directory, named `S<UC>-<nn>-<state>.png`. The [UC specification](../../UC-F04-F08-Delivery-Reporting.md) embeds them with relative links. Generate the PDF alongside the completed Markdown with `python3 docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/export-review-pdf.py` in an environment with markdown-it-py and WeasyPrint. The wrapper uses the shared PA3 exporter and keeps each screenshot caption with its image. Inspect each embedded screenshot.

At PR handoff, check all source and output paths with `git check-ignore --no-index` (no matches expected). Verify the files are tracked with `git ls-files --error-unmatch` and present in the PR file list.

## Verification

Run `node docs/analysis-and-design/use-cases/prototypes/delivery-execution-reporting/verify.mjs` from the repository root. The script executes the report and compares it to independently specified expectations, and renders the 77 frame keys using a minimal Node DOM harness. This checks registration, contents and navigation targets. Browser layout and PNG evidence require separate checks.

| Case | Hand calculation and expected results |
| --- | --- |
| Base sample | DEMO-201 fails in D-110 and succeeds in D-111. DEMO-202 fails and stays open. Order success and closure are 1/2 = 50%. Attempt success is 1/3 = 33.3%. Duration is (15 + 20 + 10) / 3 = 15 min. D-110 shows 2/2 stops and D-111 shows 1/1. Both failure reasons occur once. |
| Cross-shift retry | D-110/R-17 owns both first Starts and receives credit for the delivered order at cutoff, so order success is 1/2 and attempt success is 0/2. D-111/R-23 has no first Starts, but attempt success is 1/1. |
| Closure and cutoff | Closing DEMO-202 by cutoff changes closure to 2/2. The boundary fixture includes a Start at the opening midnight, excludes the success ending at the closing midnight, and counts a duplicated failure once. |
| Incomplete and invalid data | Active and Aborted each count once in the incomplete fixture with no final attempts. The quality fixture has four attributable final attempts, two valid durations averaging 17.5 min, two excluded durations and one separately flagged missing outcome time. Missing failure reasons are counted separately. |
