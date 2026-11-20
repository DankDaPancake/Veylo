// Adapted from Phạm Công Khánh's BOOYAH-25 PrototypeKit/export.mjs.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(root, "index.html");

const states = {
  "S11-01": ["assigned-work", "suggestion-only", "no-suggestion"],
  "S11-02": ["stop-details", "guide-only", "neither-context", "guide-unavailable"],
  "S11-03": ["no-published-work"],
  "S11-04": ["sign-in", "access-denied"],
  "S11-05": ["load-failed"],
  "S11-06": ["stop-unavailable"],
  "S11-07": ["no-eligible-stops"],
  "S12-01": ["start-attempt"],
  "S12-02": ["started", "resume-active", "pre-arrival-failure"],
  "S12-03": ["arrived"],
  "S12-04": ["photo-proof", "photo-missing"],
  "S12-05": ["failure-form", "reason-required", "comment-required", "form-dismissed"],
  "S12-06": ["success-saved", "failure-saved"],
  "S12-07": ["abort-confirmation", "attempt-aborted"],
  "S12-08": ["stale-assignment", "active-attempt-conflict"],
  "S12-09": ["photo-too-large", "photo-unsupported", "photo-unreadable", "upload-failed"],
  "S12-10": ["duplicate-action", "action-unsent", "result-unknown", "result-recovered"],
  "S12-11": ["sign-in", "access-denied"],
  "S13-01": ["monitoring", "monitoring-min"],
  "S13-02": ["failed-order-history", "already-resolved"],
  "S13-03": ["redispatch-confirmation"],
  "S13-04": ["redispatch-confirmed", "terminal-confirmed"],
  "S13-05": ["terminal-confirmation", "terminal-reason-required"],
  "S13-06": ["empty-shift", "empty-failure-queue"],
  "S13-07": ["load-failed"],
  "S13-08": ["sign-in", "access-denied"],
  "S13-09": ["active-attempt-lock", "no-eligible-destination", "retry-limit", "confirmation-dismissed"],
  "S13-10": ["concurrent-decision", "result-unknown", "result-recovered"],
  "S19-01": ["report-filters"],
  "S19-02": ["report-results", "report-results-min"],
  "S19-03": ["invalid-range"],
  "S19-04": ["sign-in", "access-denied"],
  "S19-05": ["no-data"],
  "S19-06": ["incomplete-attempts", "invalid-timestamps"],
  "S19-07": ["load-failed"],
  "S19-08": ["metric-definitions", "cross-shift-retry", "zero-denominator", "no-failures", "missing-reasons", "tied-reasons"],
};

export const screens = Object.entries(states).flatMap(([base, variants]) => {
  const uc = base.slice(1, 3);
  const rider = uc === "11" || uc === "12";
  return variants.map((variant) => {
    const id = `${base}-${variant}`;
    const minimum = variant.endsWith("-min");
    const [width, height] = rider ? [360, 800] : minimum ? [1280, 720] : [1440, 900];
    return { id, width, height, png: `UC${uc}/${id}.png` };
  });
});

export function assertPngDimensions(buffer, screen) {
  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature)
    || buffer.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error(`${screen.id}: capture is not a PNG with an IHDR chunk.`);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== screen.width || height !== screen.height) {
    throw new Error(`${screen.id}: got ${width}×${height}, expected ${screen.width}×${screen.height}.`);
  }
}

function loadChromium() {
  const installRoot = process.env.BOOYAH14_PLAYWRIGHT_ROOT;
  const require = createRequire(installRoot ? path.resolve(installRoot, "package.json") : import.meta.url);
  try {
    return require("playwright").chromium;
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    throw new Error("Playwright is not available. Set BOOYAH14_PLAYWRIGHT_ROOT to its local installation directory.", { cause: error });
  }
}

async function capture(page, screen) {
  const url = pathToFileURL(indexPath);
  url.search = new URLSearchParams({ screen: screen.id, theme: "light", standalone: "1" }).toString();
  const errors = [];
  const onError = (error) => errors.push(error.message);
  page.on("pageerror", onError);
  try {
    await page.setViewportSize({ width: screen.width, height: screen.height });
    await page.goto(url.href, { waitUntil: "load" });
    const stage = page.locator(`#stage-frame[data-rendered-screen="${screen.id}"]`);
    await stage.locator("h1").waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    if (errors.length) throw new Error(`${screen.id}: ${errors.join("; ")}`);
    const title = (await stage.locator("h1").innerText()).trim();
    if (!title) throw new Error(`${screen.id}: heading is empty.`);

    const buffer = await page.screenshot({ type: "png", animations: "disabled", scale: "css" });
    assertPngDimensions(buffer, screen);
    const output = path.join(root, screen.png);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, buffer);
    console.log(`Captured ${screen.png} (${screen.width}×${screen.height}) · ${title}`);
  } finally {
    page.off("pageerror", onError);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--list") {
    console.log(JSON.stringify(screens, null, 2));
    return;
  }
  if (args.length && !(args.length === 1 && ["--check-browser", "--sample"].includes(args[0]))) {
    throw new Error("Usage: node export.mjs [--list | --check-browser | --sample]");
  }
  const source = fs.readFileSync(path.join(root, "frames.js"), "utf8");
  const registered = new Set([...source.matchAll(/^\s+["'](S\d\d-\d\d-[a-z0-9-]+)["']:\s*\{/gm)].map((match) => match[1]));
  const missing = screens.filter(({ id }) => !registered.has(id));
  if (missing.length) {
    throw new Error(`${missing.length} planned frames are missing from frames.js, starting with ${missing[0].id}.`);
  }

  const chromium = loadChromium();
  const browser = await chromium.launch({ headless: true, chromiumSandbox: true, timeout: 20000 });
  try {
    console.log(`Playwright Chromium ${browser.version()} · browser sandbox enabled`);
    if (args[0] === "--check-browser") return;
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    page.setDefaultTimeout(10000);
    for (const screen of args[0] === "--sample" ? screens.slice(0, 1) : screens) {
      await capture(page, screen);
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    if (error.stderr && !error.message.includes(String(error.stderr).trim())) console.error(String(error.stderr).trim());
    process.exitCode = 1;
  }
}
