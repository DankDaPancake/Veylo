// Read-only checks for the synthetic data and the standalone HTML registration.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { screens as manifest } from "./export.mjs";

const local = (name) => new URL(name, import.meta.url);
const read = (name) => readFileSync(local(name), "utf8");
const { calculate, fixture, percent } = createRequire(import.meta.url)("./report.js");

const base = calculate(fixture.base);
assert.deepEqual([base.orders, base.delivered, base.open], [2, 1, 1]);
assert.deepEqual([base.finalized, base.successful, base.failed, base.average], [3, 1, 2, 15]);
assert.equal(percent(base.delivered, base.orders), "50%");
assert.equal(percent(base.successful, base.finalized), "33.3%");
assert.deepEqual(base.byShift.map(({ worked, total }) => [worked, total]), [[2, 2], [1, 1]]);
assert.deepEqual(base.reasons, [["Recipient unreachable", 1], ["Unsafe access", 1]]);

const original = calculate(fixture.base, { shift: "D-110", rider: "R-17" });
const retry = calculate(fixture.base, { shift: "D-111", rider: "R-23" });
assert.deepEqual([original.orders, original.delivered, original.finalized, original.successful], [2, 1, 2, 0]);
assert.deepEqual([retry.orders, retry.delivered, retry.finalized, retry.successful], [0, 0, 1, 1]);

const boundary = calculate(fixture.boundary);
assert.deepEqual([boundary.orders, boundary.delivered, boundary.finalized, boundary.active], [2, 0, 2, 1]);
const closed = calculate(fixture.closed);
assert.deepEqual([closed.delivered, closed.terminal, closed.open], [1, 1, 0]);
assert.equal(percent(closed.delivered + closed.terminal, closed.orders), "100%");
const incomplete = calculate(fixture.incomplete);
assert.deepEqual([incomplete.active, incomplete.aborted, incomplete.finalized, incomplete.average], [1, 1, 0, null]);
assert.equal(percent(0, 0), "—");
const quality = calculate(fixture.quality);
assert.deepEqual([quality.finalized, quality.included, quality.excluded, quality.invalidEnd, quality.average], [4, 2, 2, 1, 17.5]);
assert.equal(calculate(fixture.missing).missingReason, 1);
assert.equal(calculate(fixture.empty).orders, 0);
assert.deepEqual(retry.reasons, []);
console.log("Synthetic metric checks passed: cohorts, closure, attempt rates, progress, range edges, timing quality, and failure groups.");

const manifestIds = new Set(manifest.map(({ id }) => id));
const html = read("index.html");
const scriptNames = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);
const inline = html.match(/<script>([\s\S]+?)<\/script>/)[1];
const preview = scriptNames.map(read).join("\n") + inline;

function render(id, params = {}) {
  const elements = new Map();
  const node = () => ({ dataset: {}, add() {}, addEventListener() {}, setAttribute() {}, querySelector() { return null; } });
  const document = {
    body: { classList: { add() {}, remove() {} } },
    documentElement: node(),
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, node());
      return elements.get(id);
    },
    querySelectorAll() { return []; },
  };
  const query = { screen: id, standalone: "1", ...params };
  const location = { search: "?" + new URLSearchParams(query).toString() };
  runInNewContext(preview, { document, window: { location }, location, URLSearchParams, Option: class {} });
  const stage = elements.get("stage-frame");
  assert.equal(stage.dataset.renderedScreen, id);
  assert.match(stage.innerHTML, /<h1 /);
  for (const match of stage.innerHTML.matchAll(/href="\?screen=(S[0-9a-z-]+)/g)) {
    assert.ok(manifestIds.has(match[1]), `Unknown target ${match[1]} in ${id}`);
  }
  return stage.innerHTML;
}

for (const { id } of manifest) render(id);
assert.match(render("S12-06-success-saved"), /Next assigned stop/);
assert.match(render("S12-06-failure-saved"), /Awaiting dispatcher resolution/);
assert.match(render("S12-06-success-saved", { stop: "202" }), /Finish shift/);
assert.match(render("S12-01-start-attempt", { stop: "202" }), /DEMO-202/);
assert.match(render("S13-04-redispatch-confirmed"), /redispatch=1/);
assert.match(render("S11-01-assigned-work", { redispatch: "1" }), /No new attempt until Start/);
assert.match(render("S12-02-started", { redispatch: "1" }), /AT-201-02/);
assert.match(render("S13-01-monitoring"), /No decision required/);
assert.match(render("S19-02-report-results"), /33\.3%/);
assert.match(render("S19-02-report-results", { from: "2026-11-20", to: "2026-11-20", shift: "D-111" }), /1 \/ 1 · 100%/);
assert.match(render("S19-02-report-results", { from: "2026-11-20", to: "2026-11-20", shift: "OTHER-HUB" }), /Report data was withheld/);
assert.match(render("S19-08-metric-definitions"), /minutes|Min|Date range/);
console.log(`${manifest.length} preview states registered and rendered in Node's minimal DOM harness; local navigation targets resolve.`);
