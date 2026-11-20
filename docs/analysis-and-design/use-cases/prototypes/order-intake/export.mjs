import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { screenshotPath } from "./deliverable-paths.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const reportRoot = resolve(root, "../..");
const screens = JSON.parse(await readFile(join(root, "screens.json"), "utf8"));
const mode = process.argv[2];
assert(["--sample", "--png", "--pdf"].includes(mode), "Use --sample, --png, or --pdf.");
const browser = await chromium.launch();
console.log(`Playwright Chromium ${browser.version()}`);

try {
  if (mode === "--pdf") {
    await exportPdf();
  } else {
    const captures = mode === "--sample" ? [screens.find(({ id }) => id === "S07-01")] : screens;
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, offline: true });
    try {
      const page = await context.newPage();
      for (const screen of captures.filter(({ id }) => id !== "S08-03")) {
        const output = join(reportRoot, screenshotPath(screen));
        await mkdir(dirname(output), { recursive: true });
        await captureScreen(page, screen.id, output);
      }
      console.log(`Captured ${captures.length} light PNG(s) at 2880 × 1800`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

async function captureScreen(page, id, output) {
  const awaitScreen = (screenId) => page.locator(`#stage[data-screen="${screenId}"] h1`).waitFor();
  const fileEvidence = {
    "S06-01-file-header": "orders-header-missing.csv",
    "S06-02": "orders-valid.csv",
    "S06-02-row-errors": "orders-invalid.csv",
    "S07-01-import-cancelled": "orders-valid.csv",
  };
  const filename = fileEvidence[id];
  const url = pathToFileURL(join(root, "index.html"));
  url.search = new URLSearchParams({ screen: filename ? "S06-01" : id, standalone: "1" });
  await page.goto(url.href);
  if (filename) {
    await page.locator("#csv-file").setInputFiles(join(reportRoot, "fixtures/order-intake", filename));
    await page.getByRole("button", { name: "Check CSV", exact: true }).click();
    if (id === "S07-01-import-cancelled") {
      await page.getByRole("button", { name: "Cancel import", exact: true }).click();
    }
  }
  await awaitScreen(id);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: output, animations: "disabled" });
  if (id === "S08-02") {
    const code = await page.locator(".page-subtitle").innerText();
    const reason = await page.locator("#reason").inputValue();
    await page.getByRole("button", { name: "Confirm cancellation", exact: true }).click();
    await awaitScreen("S08-03");
    assert.equal(code, (await page.locator("h1").innerText()) + " · Demo Hub");
    assert.equal(await page.locator(".detail-grid div").filter({ hasText: "Cancellation reason" }).locator("dd").innerText(), reason);
    assert.equal(await page.locator(".f02-card .badge").innerText(), "CANCELLED");
    const result = screens.find((screen) => screen.id === "S08-03");
    await page.screenshot({ path: join(reportRoot, screenshotPath(result)), animations: "disabled" });
  }
}

async function exportPdf() {
  const temp = await mkdtemp(join(tmpdir(), "veylo-f02-pdf-"));
  try {
    const markdown = join(reportRoot, "UC-F02-Orders.md");
    const base = pathToFileURL(reportRoot + "/").href;
    const stylesheet = pathToFileURL(join(root, "print.css")).href;
    const ast = JSON.parse(execFileSync("pandoc", ["--from=gfm+implicit_figures", "--to=json", markdown], {
      encoding: "utf8", maxBuffer: 8 * 1024 * 1024,
    }));
    resolveAssets(ast, base);
    const html = execFileSync("pandoc", ["--from=json", "--to=html5"], {
      input: JSON.stringify(ast), encoding: "utf8", maxBuffer: 8 * 1024 * 1024,
    });
    const file = join(temp, "report.html");
    await writeFile(file, `<!doctype html><html lang="en"><meta charset="utf-8"><title>Veylo · F02 Order Intake</title><link rel="stylesheet" href="${stylesheet}"><body>${html}</body></html>`);
    const page = await browser.newPage({ offline: true });
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => document.fonts.ready);
    const images = await page.locator("img").evaluateAll((items) =>
      items.map((img) => ({ file: img.getAttribute("src"), ready: img.complete && img.naturalWidth > 0 })));
    assert.equal(images.length, screens.length, "Each state should have one evidence figure.");
    assert.deepEqual(images.filter((img) => !img.ready), [], "Every report image must load.");
    await page.pdf({
      path: join(reportRoot, "UC-F02-Orders.pdf"), format: "A4", printBackground: true,
      preferCSSPageSize: true, tagged: true, outline: true,
    });
    console.log(`A4 PDF exported with ${images.length} loaded figures.`);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

function resolveAssets(node, base) {
  if (!node || typeof node !== "object") return;
  if (node.t === "Image" || node.t === "Link") {
    const target = node.c[2];
    if (!target[0].startsWith("#")) target[0] = new URL(target[0], base).href;
  }
  for (const child of Object.values(node)) resolveAssets(child, base);
}
