import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import F02 from "./contract.js";
import { screenshotPath } from "./deliverable-paths.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const reportRoot = resolve(root, "../..");
const fixtures = join(reportRoot, "fixtures", "order-intake");
const fixtureKinds = ["valid", "invalid", "template"];
const manifest = JSON.parse(await readFile(join(root, "screens.json"), "utf8"));
const sourceManifest = await readFile(join(root, "screens.js"), "utf8");
assert.deepEqual(JSON.parse(sourceManifest.slice(sourceManifest.indexOf("[")).trim().slice(0, -1)), manifest);
const ids = manifest.map(({ id }) => id);
assert.equal(ids.length, new Set(ids).size);

const [valid, invalid, template] = await Promise.all(fixtureKinds.map((kind) => readFile(join(fixtures, `orders-${kind}.csv`))));
const filename = "orders.csv";
const check = (bytes, existing = []) => F02.csvCheck(filename, bytes, existing);
const buffer = (text) => Buffer.from(text, "utf8");
const validRows = valid.toString().trimEnd().split("\n").slice(1);
const example = F02.example;

verifyContract();
console.log("CSV check: canonical headers, 20/0 counts, six diagnostics, UTF-8/BOM, quoting and both limit boundaries.");

if (process.argv.includes("--csv")) process.exit(0);
const browser = await chromium.launch();
const diagnostics = await mkdtemp(join(tmpdir(), "veylo-f02-layout-"));
const browserIssues = [];
const previewIds = new Set([
  "S05-01-error", "S06-01-file-limit", "S06-01-file-limit-bytes", "S06-01-file-format-encoding",
  "S06-01-file-format", "S06-02-row-errors", "S07-01-empty", "S07-01-denied",
  "S08-02", "S08-01-conflict", "S08-01-conflict-cancel", "S07-01-import-cancelled",
]);

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const context = await browser.newContext({ viewport, offline: true, acceptDownloads: true });
    try {
      const page = await context.newPage();
      watch(page);
      for (const theme of ["light", "dark"]) {
        for (const id of ids) {
          await open(page, id, { standalone: "1", theme });
          const layout = await page.evaluate(() => {
            const stage = document.querySelector("#stage");
            const workspace = stage.querySelector(".workspace");
            const main = stage.querySelector("h1");
            const controls = Array.from(workspace.querySelectorAll("button:not(.code-link), a.btn"));
            const bottom = Math.max(...controls.map((item) => item.getBoundingClientRect().bottom), 0);
            return {
              overflow: document.documentElement.scrollWidth > innerWidth,
              workspaceOverflow: workspace.scrollWidth > workspace.clientWidth,
              heading: main.textContent.trim(),
              bottom,
              height: innerHeight,
              font: document.fonts.check('700 16px "Plus Jakarta Sans"'),
              monospace: document.fonts.check('700 16px "JetBrains Mono"') && Array.from(document.fonts).some((font) => font.family.includes("JetBrains Mono")),
              clippedTables: Array.from(workspace.querySelectorAll(".f02-table")).some((el) => el.scrollWidth > el.clientWidth),
            };
          });
          assert(layout.heading && !layout.overflow && !layout.workspaceOverflow && !layout.clippedTables, `${id} ${theme}: ${JSON.stringify(layout)}`);
          assert(layout.font && layout.monospace && layout.bottom <= layout.height, `${id} ${theme}: ${JSON.stringify(layout)}`);
          if (viewport.width === 1280 && previewIds.has(id)) {
            await page.screenshot({ path: join(diagnostics, `${theme}-${id}.png`), animations: "disabled" });
          }
        }
      }
      for (const theme of ["light", "dark"]) {
        await walk(page, theme);
      }
    } finally {
      await context.close();
    }
    console.log(`${viewport.width}×${viewport.height}: ${ids.length * 2} layouts and keyboard/mouse walkthroughs passed.`);
  }
  assert.deepEqual(browserIssues, []);
  if (!process.argv.includes("--browser")) {
    await verifyPngs();
    await verifyMarkdown();
    verifyPdf();
  }
  console.log(`Verified with Chromium ${browser.version()}.`);
} finally {
  await browser.close();
  if (process.env.VEYLO_KEEP_DIAGNOSTICS) {
    console.log(`Diagnostic screenshots: ${diagnostics}`);
  } else {
    await rm(diagnostics, { recursive: true, force: true });
  }
}

function verifyContract() {
  assert.equal(template.toString(), F02.header + "\n");
  const data = check(valid);
  assert.deepEqual(data.report, []);
  assert.equal(data.created, 20);
  assert.deepEqual(Object.keys(data.orders[0]), F02.columns);
  assert.equal(data.orders[0].destination_address, "100 Example Lane, Demo Ward");
  assert.equal(data.orders[0].recipient_phone, "0000000001");
  assert.equal(check(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), valid])).created, 20);
  assert.equal(check(buffer(valid.toString().replaceAll("\n", "\r\n"))).created, 20);
  const withoutNotes = [F02.columns.slice(0, -1).join(","), validRows[0].slice(0, -1)].join("\n") + "\n";
  assert.equal(check(buffer(withoutNotes)).created, 1);
  assert.equal(check(buffer(valid.toString().replace("100 Example Lane, Demo Ward", '100 ""Example"" Lane,\nDemo Ward'))).orders[0].destination_address,
    '100 "Example" Lane,\nDemo Ward');
  assert.equal(F02.csvCheck("orders.txt", valid).issue, "type");
  assert.equal(check(Buffer.alloc(0)).issue, "empty");
  assert.equal(check(template).issue, "empty-header");
  assert.equal(check(buffer("unknown,recipient_name\nF02-001,A\n")).issue, "header");
  assert.equal(check(buffer(F02.header.replace("note", "order_code") + "\n" + validRows[0])).issue, "header");
  assert.equal(check(buffer('"' + F02.header + '"\n"x"\n')).issue, "header");
  assert.equal(check(buffer(F02.header + '\n"F02-001,unclosed\n')).issue, "format");
  assert.equal(check(Buffer.concat([template, Buffer.from([0xff])])).issue, "format-encoding");
  assert.deepEqual(check(buffer(F02.header + "\nF02-001\n")), { issue: "format-width", record: 2 });
  const maximal = Array.from({ length: 501 }, (_, i) => validRows[0].replace("F02-001", `MAX-${i}`));
  const boundary = (count) => buffer([F02.header, ...maximal.slice(0, count)].join("\n") + "\n");
  assert.equal(check(boundary(500)).created, 500);
  assert.equal(check(boundary(501)).issue, "limit");
  const exact = Buffer.concat([buffer(valid.toString().trimEnd()), Buffer.alloc(1_000_000 - valid.toString().trimEnd().length, 0x20)]);
  assert.equal(exact.length, 1_000_000);
  assert.equal(check(exact).created, 20);
  assert.equal(check(Buffer.concat([exact, buffer(" ")])).issue, "limit-bytes");

  const mixed = check(invalid, ["  f02-500 "]);
  assert.equal(mixed.created, 0);
  assert.deepEqual(mixed.report.map(({ record, column }) => [record, column]), [
    [3, "recipient_phone"], [3, "destination_address"], [3, "window_end"],
    [3, "weight_kg"], [3, "order_code"], [4, "order_code"],
  ]);
  assert.match(mixed.report.at(-2).reason, /this file/);
  assert.match(mixed.report.at(-1).reason, /this hub/);
  assert.equal(check(invalid).report.length, 5);
  assert.equal(check(valid, [" f02-001 "]).created, 0);
  assert.deepEqual(F02.orderErrors({ ...example, recipient_phone: "+84000000001" }), {});
  assert(F02.orderErrors({ ...example, window_start: "2026-02-29T09:00+07:00" }).window_start);
  assert(F02.orderErrors({ ...example, weight_kg: "1e3" }).weight_kg);
  assert(F02.orderErrors({ ...example, order_code: "-A" }).order_code);
}

function watch(page) {
  page.on("pageerror", (error) => browserIssues.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserIssues.push(message.text());
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText;
    const fonts = pathToFileURL(resolve(root, "../kit/assets/fonts") + "/").href;
    const fixtureUrls = fixtureKinds.map((kind) => pathToFileURL(join(fixtures, `orders-${kind}.csv`)).href);
    // Chromium aborts the navigation when transferring it to the download manager.
    // It can also cancel an in-flight font fetch as the current page unloads.
    // Download bytes and local font loads are asserted separately.
    const cancelledLocalRequest = error === "net::ERR_ABORTED"
      && (fixtureUrls.includes(request.url()) || request.url().startsWith(fonts) && request.resourceType() === "font");
    if (!cancelledLocalRequest) browserIssues.push(`${request.url()} ${error}`);
  });
}

async function open(page, id = "S07-01", additional = {}) {
  const url = pathToFileURL(join(root, "index.html"));
  url.search = new URLSearchParams({ screen: id, ...additional });
  await page.goto(url.href);
  await page.locator("#stage h1").waitFor();
  await page.evaluate(async () => {
    await document.fonts.load('700 16px "Plus Jakarta Sans"', "Veylo");
    await document.fonts.load('700 16px "JetBrains Mono"', "F02-001");
    await document.fonts.load('500 16px "JetBrains Mono"', "F02-001");
    await document.fonts.ready;
  });
  await at(page, additional.hub || additional.role ? "S07-01-denied" : additional.expired ? "S07-01-session-expired" : id);
}

async function at(page, id) {
  await page.locator(`#stage[data-screen="${id}"] h1`).waitFor({ timeout: 3500 });
}

async function walk(page, theme) {
  const begin = (id = "S07-01", extra = {}) => open(page, id, { theme, ...extra });
  const press = (name) => page.getByRole("button", { name, exact: true }).click();
  const content = () => page.locator("#stage").innerText();
  const fill = async (data) => {
    for (const [id, value] of Object.entries(data)) await page.locator(`#${id}`).fill(value);
  };
  const choose = (mode) => page.selectOption("#simulate", mode);
  const upload = async (name, bytes) => {
    await page.locator("#csv-file").setInputFiles({ name, mimeType: "text/csv", buffer: bytes });
    await press("Check CSV");
  };

  await begin();
  assert.equal(await page.locator("#gallery-screen option").count(), ids.length);
  const originalTheme = await page.locator("html").getAttribute("data-theme");
  await page.locator("#toggle-theme").click();
  assert.notEqual(await page.locator("html").getAttribute("data-theme"), originalTheme);
  await page.locator("#toggle-theme").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), originalTheme);
  await page.getByRole("button", { name: "Create order" }).focus();
  await page.keyboard.press("Enter");
  await at(page, "S05-01");
  const { note, ...required } = example;
  assert.equal(await page.locator("#order-form [required]").count(), Object.keys(required).length);
  await fill({ ...required, recipient_phone: "abc", destination_address: "", window_end: example.window_start, weight_kg: "0" });
  await press("Save order");
  await at(page, "S05-01-error");
  assert.equal(await page.locator('[role="alert"]:focus').count(), 1);
  await page.getByRole("link", { name: "Recipient phone", exact: true }).press("Enter");
  assert.equal(await page.locator("#recipient_phone:focus").getAttribute("aria-describedby"), "recipient_phone-error");
  assert.equal(await page.locator("#recipient_name").inputValue(), example.recipient_name);
  await fill({ order_code: " f02-500 ", recipient_phone: example.recipient_phone, destination_address: example.destination_address,
    window_end: example.window_end, weight_kg: example.weight_kg });
  await press("Save order");
  await at(page, "S05-01-duplicate");
  await fill({ order_code: example.order_code, note: "<img src=invalid> synthetic note" });
  await press("Save order");
  await at(page, "S07-02-created");
  assert.match(await content(), /F02-001[\s\S]*Order created[\s\S]*NEW/);
  assert.equal(await page.locator("#stage img").count(), 0);
  await press("Back to orders");
  assert.equal(await page.locator('button[data-code="F02-001"]').count(), 1);
  await press("Create order");
  await press("Discard and return");
  assert.equal(await page.locator('button[data-code="F02-001"]').count(), 1);

  await begin();
  await press("Import CSV");
  for (const [kind, label, expectedBytes] of [
    ["template", "Download CSV template", template],
    ["valid", "Download valid sample", valid],
    ["invalid", "Download invalid sample", invalid],
  ]) {
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("link", { name: label, exact: true }).click();
    const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), `orders-${kind}.csv`);
    assert.deepEqual(await readFile(await download.path()), expectedBytes);
  }
  await upload("orders-valid.csv", valid);
  await at(page, "S06-02");
  assert.equal(await page.locator("tbody tr").count(), 20);
  await press("Cancel import");
  await at(page, "S07-01-import-cancelled");
  assert.match(await content(), /Import cancelled · 0 orders imported/);
  assert.equal(await page.locator('button[data-code="F02-001"]').count(), 0);
  await press("Import CSV");
  await upload("orders-valid.csv", valid);
  await press("Import 20 orders");
  await at(page, "S06-03");
  assert.match(await content(), /20 orders imported/);
  await press("View orders");
  assert.match(await content(), /of 45 orders/);
  assert.equal(await page.locator('button[data-code="F02-020"]').count(), 1);

  const repeated = Array.from({ length: 501 }, () => validRows[0]).join("\n");
  const cases = [
    ["file-type", "orders.txt", valid],
    ["file-empty", filename, Buffer.alloc(0)],
    ["file-empty-header", filename, template],
    ["file-header", filename, buffer("order_code\nF02-001\n")],
    ["file-limit", filename, buffer(F02.header + "\n" + repeated)],
    ["file-limit-bytes", filename, Buffer.alloc(1_000_001)],
    ["file-format", filename, buffer(F02.header + '\n"unclosed')],
    ["file-format-encoding", filename, buffer("\uFEFF" + F02.header).map((value, i) => i === 4 ? 0xff : value)],
    ["file-format-width", filename, buffer(F02.header + "\nF02-001\n")],
  ];
  await begin("S06-01");
  for (const [suffix, name, bytes] of cases) {
    await upload(name, bytes);
    await at(page, `S06-01-${suffix}`);
    assert.equal(await page.locator('[role="alert"]:focus').count(), 1);
    assert.equal(await page.getByRole("button", { name: "Check CSV" }).count(), 1);
  }
  await upload("orders-invalid.csv", invalid);
  await at(page, "S06-02-row-errors");
  assert.equal(await page.locator("tbody tr").count(), 6);
  assert.match(await content(), /0 orders imported/);
  await press("Choose a replacement CSV");
  await upload("orders-valid.csv", valid);
  await choose("duplicate");
  await press("Import 20 orders");
  await at(page, "S06-02-conflict");
  assert.match(await content(), /claimed after preview[\s\S]*0 orders imported/);
  assert.equal(await page.locator("tbody tr").count(), 1);
  await press("Back to orders");
  assert.match(await content(), /of 26 orders/);
  assert.equal(await page.locator('button[data-code="F02-020"]').count(), 0);

  await begin();
  assert.equal(await page.locator("tbody tr").count(), 20);
  assert.equal(await page.locator("tbody .code-link").first().innerText(), "F02-101");
  await press("Next page");
  await at(page, "S07-01-page-2");
  assert.equal(await page.locator("tbody tr").count(), 5);
  await fill({ keyword: "f02-10", from: "2026-11-21", to: "2026-11-21" });
  await page.selectOption("#filter-status", "NEW");
  await press("Apply filters");
  await at(page, "S07-01-filtered");
  assert.match(await content(), /of 8 orders · Page 1 of 1/);
  await fill({ from: "2026-11-22" });
  await press("Apply filters");
  await at(page, "S07-01-filter-error");
  await fill({ from: "2026-11-21", keyword: "no matches" });
  await press("Apply filters");
  await at(page, "S07-01-no-results");
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await at(page, "S07-01");
  await press("F02-101");
  await at(page, "S07-02");
  await begin("S07-02", { code: "f02-103" });
  assert.equal(await page.locator("#stage h1").innerText(), "F02-103");
  const unknown = new URL(page.url());
  unknown.searchParams.set("code", "unavailable");
  await page.goto(unknown.href);
  await at(page, "S07-01-denied");
  await begin("S07-01-empty");
  assert.match(await content(), /No orders yet/);

  await begin("S07-02");
  await press("Edit order");
  assert(await page.locator("#order_code").evaluate((el) => el.readOnly));
  await fill({ destination_address: "" });
  await press("Save changes");
  await at(page, "S08-01-error");
  await fill({ destination_address: "140 Changed Lane, Demo Ward" });
  await press("Save changes");
  await at(page, "S07-02-updated");
  assert.match(await content(), /F02-101[\s\S]*NEW[\s\S]*140 Changed Lane/);
  await press("Cancel order");
  await press("Keep order");
  await at(page, "S07-02");
  assert.match(await content(), /NEW/);
  await press("Cancel order");
  await press("Confirm cancellation");
  await at(page, "S08-02-error");
  await fill({ reason: "X".repeat(251) });
  await press("Confirm cancellation");
  await at(page, "S08-02-error");
  await fill({ reason: "  Synthetic cancellation reason. " });
  await press("Confirm cancellation");
  await at(page, "S08-03");
  assert.match(await content(), /CANCELLED[\s\S]*Synthetic cancellation reason\./);
  await press("Check edit availability");
  await at(page, "S08-01-blocked");
  await press("View order details");
  assert.match(await content(), /Synthetic cancellation reason\./);

  await begin("S08-01");
  await fill({ destination_address: "A stale address" });
  await choose("stale");
  await press("Save changes");
  await at(page, "S08-01-conflict");
  await press("Reload order");
  assert.match(await content(), /125 Example Lane/);
  assert.doesNotMatch(await content(), /A stale address/);
  await press("Cancel order");
  await fill({ reason: "A stale reason" });
  await choose("stale");
  await press("Confirm cancellation");
  await at(page, "S08-01-conflict-cancel");
  assert.match(await content(), /cancellation was not saved/);
  await press("Reload order");
  await press("Cancel order");
  await fill({ reason: "Do not replace the original" });
  await choose("cancelled");
  await press("Confirm cancellation");
  await at(page, "S08-03-already-cancelled");
  assert.match(await content(), /Original reason: Synthetic recipient requested cancellation/);
  assert.doesNotMatch(await content(), /Do not replace the original/);

  for (const constraint of [{ hub: "other" }, { role: "administrator" }, { role: "rider" }]) {
    await begin("S07-02", constraint);
    assert.doesNotMatch(await content(), /F02-|Demo Hub/);
    await page.getByRole("button", { name: "Return to staff workspace" }).press("Enter");
    assert.match(await content(), /Returned to workspace/);
    assert.equal(await page.locator("#stage [data-action]").count(), 0);
  }
  await begin("S05-01");
  await choose("expired");
  await press("Save order");
  await at(page, "S07-01-session-expired");
  await page.keyboard.press("Tab");
  assert.equal(await page.getByRole("button", { name: "Sign in" }).evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press("Enter");
  await at(page, "S07-01");
  assert.equal(await page.locator('button[data-code="F02-001"]').count(), 0);
}

async function verifyPngs() {
  const fingerprints = new Set();
  const page = await browser.newPage();
  try {
    for (const theme of ["light", "dark"]) {
      for (const screen of manifest) {
        const { id } = screen;
        const bytes = await readFile(join(reportRoot, screenshotPath(screen, theme)));
        assert(bytes.length > 10_000);
        assert.equal(bytes.subarray(1, 4).toString(), "PNG");
        assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [2880, 1800]);
        const fingerprint = createHash("sha256").update(bytes).digest("hex");
        assert(!fingerprints.has(fingerprint), `Duplicate capture: ${id} ${theme}`);
        fingerprints.add(fingerprint);
        const samples = await page.evaluate(async (encoded) => {
          const image = new Image();
          image.src = "data:image/png;base64," + encoded;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 20;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, 32, 20);
          const rgba = ctx.getImageData(0, 0, 32, 20).data;
          return new Set(Array.from({ length: 640 }, (_, i) => rgba.slice(i * 4, i * 4 + 3).join(","))).size;
        }, bytes.toString("base64"));
        assert(samples > 24, `Blank or nearly flat raster: ${id} ${theme}`);
      }
    }
  } finally {
    await page.close();
  }
  console.log(`${fingerprints.size} distinct PNGs decoded; dimensions and nonempty content passed.`);
}

async function verifyMarkdown() {
  const report = await readFile(join(reportRoot, "UC-F02-Orders.md"), "utf8");
  const html = execFileSync("pandoc", ["--from=gfm+implicit_figures", "--to=html5"], { input: report, encoding: "utf8" });
  const figures = Array.from(report.matchAll(/!\[[^\]]+\]\(([^)]+\.png)\)/g), (match) => match[1]);
  assert.deepEqual(figures.sort(), manifest.map((screen) => screenshotPath(screen, "light")).sort(),
    "Markdown evidence does not match the manifest");
  const references = Array.from(report.matchAll(/\x60(S\d\d-\d\d(?:-[a-z\d]+)*)\x60/g), (match) => match[1]);
  assert.deepEqual([...new Set(references)].sort(), [...ids].sort(), "Flow references do not match the manifest");
  for (const heading of report.matchAll(/^#{1,3} .+\n(.+)/gm)) assert(heading[1].startsWith("Performed by: "), heading[0]);
  for (const match of report.matchAll(/\]\(([^ )]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (target && !/^https?:/.test(target)) assert((await stat(resolve(reportRoot, target))).isFile(), target);
    if (match[1].startsWith("#")) assert(html.includes(`id="${match[1].slice(1)}"`), match[1]);
  }
  for (const token of ["FR-01-2", "FR-02-1", "FR-02-2", "FR-02-3", "FR-02-4", "FR-02-5", "AC1", "AC2", "AC3", "AC4", "AC5"]) {
    assert(report.includes(token));
  }
  for (let rule = 1; rule <= 8; rule += 1) assert(report.includes(`D-F02-${rule}`));
  console.log(`Markdown attestation, local links, ${ids.length} embeds and screen references passed.`);
}

function verifyPdf() {
  const report = resolve(root, "../../UC-F02-Orders.pdf");
  const read = (command, options) => execFileSync(command, [...options, report], { encoding: "utf8" });
  assert.match(read("pdfinfo", []), /Page size:\s+[^\n]+\(A4\)/);
  const images = read("pdfimages", ["-list"]).split("\n").filter((line) => /^\s*\d+\s+\d+\s+image\s/.test(line));
  assert.equal(images.length, ids.length);
  for (const image of images) assert.match(image, /image\s+2880\s+1800\s/);
  const text = execFileSync("pdftotext", ["-layout", report, "-"], { encoding: "utf8" });
  const pages = text.split("\f").filter((page) => page.trim());
  assert(pages.every((page) => page.trim().split("\n").length > 1), "The PDF has a page with only a page number.");
  for (const title of ["UC05 — Create Order Manually", "UC06 — Import Orders from CSV", "UC07 — Search and View Orders", "UC08 — Update or Cancel Order", "Verification and reviewer handoff"]) {
    assert(text.includes(title), title);
  }
  assert.match(read("pdfinfo", ["-dests"]), /shared-access-recovery/);
  assert.match(read("pdfinfo", ["-url"]), /https:\/\/thaikiet291006\.atlassian\.net\/browse\/BOOYAH-20/);
  console.log(`A4 PDF: ${pages.length} pages, ${images.length} figures, UC headings and link destinations passed.`);
}
