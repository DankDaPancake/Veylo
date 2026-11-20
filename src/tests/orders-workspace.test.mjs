import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const workspacePath = fileURLToPath(new URL("../app/orders/workspace.tsx", import.meta.url));
const localRequire = createRequire(workspacePath);
const jsxRuntime = localRequire("react/jsx-runtime");
const source = await readFile(workspacePath, "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
} }).outputText;

const order = { id: "order-1", order_code: "VY-1", recipient_name: "A. Rider", status: "NEW", version: 3 };
const list = { orders: [order], total: 1, page: 1, pageSize: 20 };
const preview = { orders: [{ row: 2, order_code: "VY-2" }], total: 1, valid: 1, saved: 0 };
const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const success = body => response(200, body);
const settle = () => new Promise(resolve => setImmediate(resolve));
const elementText = node => Array.isArray(node) ? node.map(elementText).join("") :
  node && typeof node === "object" && node.props ? elementText(node.props.children) :
    node == null || typeof node === "boolean" ? "" : String(node);

function elements(node, result = []) {
  if (Array.isArray(node)) for (const child of node) elements(child, result);
  else if (node && typeof node === "object" && node.props) {
    result.push(node);
    elements(node.props.children, result);
  }
  return result;
}

function workspace({ mode = "list", selected, error, fetch: fetcher = async () => success(list) } = {}) {
  const slots = [];
  Object.assign(slots, [mode, { q: "", status: "", from: "", to: "" },
    { q: "", status: "", from: "", to: "", page: 1 }, list, selected, false, false, error,
    "", {}, "pick", undefined, undefined, 0]);
  let cursor = 0;
  let refCursor = 0;
  const refs = [];
  const requests = [];
  class MockFormData {
    constructor(form) { this.values = form?.values ?? {}; this.entries = []; }
    append(name, value) { this.entries.push([name, value]); }
    get(name) { return this.values[name] ?? null; }
  }
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useCallback: callback => callback,
    useEffect() {},
    useRef(initial) { const index = refCursor++; return refs[index] ??= { current: initial }; },
  };
  const styles = new Proxy({}, { get: (_target, key) => String(key) });
  const customRequire = id => {
    if (id === "react") return react;
    if (id === "react/jsx-runtime") return jsxRuntime;
    if (id === "next/link") return { __esModule: true, default: "a" };
    if (id === "./workspace.module.css") return styles;
    if (id === "../account-control") return { AccountControl: () => null };
    return localRequire(id);
  };
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: customRequire, fetch: async (url, init = {}) => {
    requests.push({ url, init });
    return fetcher(url, init, requests.length);
  }, FormData: MockFormData });
  const render = () => { cursor = 0; refCursor = 0; return exports.OrdersWorkspace(); };
  const find = (tree, predicate) => elements(tree).find(predicate);
  const button = (tree, label) => find(tree, node => node.type === "button" && elementText(node).trim() === label);
  const submit = (form, values = {}) => form.props.onSubmit({ preventDefault() {}, currentTarget: { values } });
  return { render, find, button, submit, requests };
}

async function beginImport(app, file) {
  let tree = app.render();
  app.button(tree, "Import CSV").props.onClick();
  tree = app.render();
  app.find(tree, node => node.type === "input" && node.props.type === "file")
    .props.onChange({ target: { files: [file] } });
  tree = app.render();
  const form = app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV"));
  await app.submit(form);
  return app.render();
}

async function confirmImport(app, tree) {
  const form = app.find(tree, node => node.type === "form" && elementText(node).includes("Import 1 orders"));
  await app.submit(form);
  return app.render();
}

for (const status of [401, 403]) {
  test(`cancel ${status} keeps denied order details hidden`, async () => {
    const app = workspace({ mode: "detail", selected: order,
      fetch: async () => response(status, {}) });
    let tree = app.render();
    app.button(tree, "Cancel order").props.onClick();
    tree = app.render();
    await app.submit(app.find(tree, node => node.type === "form" && node.props["data-screen-id"] === "S08-02"), { reason: "Duplicate" });
    tree = app.render();
    assert.ok(app.find(tree, node => node.type === "a" && elementText(node).includes(status === 401 ? "Sign in" : "Return to staff workspace")));
    assert.equal(app.button(tree, "Back to detail"), undefined);
    assert.equal(app.find(tree, node => node.type === "section" && node.props["data-screen-id"] === "S07-02"), undefined);
    assert.equal(app.button(tree, "Edit order"), undefined);
    assert.equal(app.button(tree, "Cancel order"), undefined);
    assert.equal(app.requests.length, 1);
  });
}

test("ordinary cancellation dismissal returns to cached detail", () => {
  const app = workspace({ mode: "detail", selected: order });
  let tree = app.render();
  app.button(tree, "Cancel order").props.onClick();
  tree = app.render();
  app.button(tree, "Keep order").props.onClick();
  tree = app.render();
  assert.ok(app.find(tree, node => node.type === "section" && node.props["data-screen-id"] === "S07-02"));
  assert.ok(app.button(tree, "Edit order"));
  assert.ok(app.button(tree, "Cancel order"));
});

test("404 keeps the separate Back to orders recovery", async () => {
  const app = workspace({ fetch: async () => response(404, {}) });
  let tree = app.render();
  app.find(tree, node => node.type === "button" && node.props["aria-label"] === "Open order VY-1").props.onClick();
  await settle();
  tree = app.render();
  assert.ok(app.button(tree, "Back to orders"));
  assert.equal(app.find(tree, node => node.type === "section" && node.props["data-screen-id"] === "S07-02"), undefined);
});

test("409 offers cancellation dismissal and reload; success shows saved cancellation", async () => {
  let detailCalls = 0;
  const app = workspace({ mode: "detail", selected: order, fetch: async url => {
    if (url.endsWith("/cancel")) return response(409, { code: "ORDER_CONFLICT" });
    detailCalls++;
    return success({ ...order, status: "CANCELLED", cancellation_reason: "Already cancelled" });
  } });
  let tree = app.render();
  app.button(tree, "Cancel order").props.onClick();
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && node.props["data-screen-id"] === "S08-02"), { reason: "Duplicate" });
  tree = app.render();
  assert.ok(app.button(tree, "Keep order"));
  assert.ok(app.button(tree, "Back to detail"));
  assert.ok(app.button(tree, "Reload order"));
  app.button(tree, "Reload order").props.onClick();
  await settle();
  tree = app.render();
  assert.equal(detailCalls, 1);
  assert.match(elementText(tree), /Already cancelled/);
});

test("successful cancellation shows saved CANCELLED detail and reason", async () => {
  const app = workspace({ mode: "detail", selected: order, fetch: async () => success({
    ...order, status: "CANCELLED", cancellation_reason: "Recipient unavailable",
  }) });
  let tree = app.render();
  app.button(tree, "Cancel order").props.onClick();
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && node.props["data-screen-id"] === "S08-02"), { reason: "Recipient unavailable" });
  tree = app.render();
  assert.match(elementText(tree), /Status: CANCELLED/);
  assert.match(elementText(tree), /Recipient unavailable/);
});

for (const failure of ["network", 500, 400]) {
  test(`failed preview confirmation (${failure}) resets upload and empty Check CSV sends no request`, async () => {
    const oldFile = { name: "old.csv" };
    const app = workspace({ fetch: async (_url, _init, call) => {
      if (call === 1) return success(preview);
      if (failure === "network") throw new Error("offline");
      return response(failure, failure === 400 ? { errors: [{ field: "file", message: "Invalid CSV" }] } : {});
    } });
    let tree = await beginImport(app, oldFile);
    tree = await confirmImport(app, tree);
    assert.ok(app.find(tree, node => node.type === "input" && node.props.type === "file"));
    const requestCount = app.requests.length;
    await app.submit(app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV")));
    tree = app.render();
    assert.equal(app.requests.length, requestCount, "empty picker must not resend the retained file");
    assert.match(elementText(tree), /Choose a CSV file/);
  });
}

test("missing file does not make an upload request", async () => {
  const app = workspace();
  let tree = app.render();
  app.button(tree, "Import CSV").props.onClick();
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV")));
  tree = app.render();
  assert.equal(app.requests.length, 0);
  assert.match(elementText(tree), /Choose a CSV file/);
});

test("replacement selection checks the replacement file after confirmation failure", async () => {
  const oldFile = { name: "old.csv" };
  const newFile = { name: "replacement.csv" };
  const app = workspace({ fetch: async (_url, _init, call) => call === 2 ? response(500, {}) : success(preview) });
  let tree = await beginImport(app, oldFile);
  tree = await confirmImport(app, tree);
  app.find(tree, node => node.type === "input" && node.props.type === "file")
    .props.onChange({ target: { files: [newFile] } });
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV")));
  assert.equal(app.requests[2].init.body.entries[0][1], newFile);
});

test("picker-origin failure preserves selection for deliberate retry", async () => {
  const file = { name: "keep.csv" };
  const app = workspace({ fetch: async (_url, _init, call) => call === 1 ? response(500, {}) : success(preview) });
  let tree = app.render();
  app.button(tree, "Import CSV").props.onClick();
  tree = app.render();
  app.find(tree, node => node.type === "input" && node.props.type === "file")
    .props.onChange({ target: { files: [file] } });
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV")));
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV")));
  assert.equal(app.requests[1].init.body.entries[0][1], file);
});

test("row report keeps diagnostics and replacement clears the previous file", async () => {
  const oldFile = { name: "bad.csv" };
  const newFile = { name: "good.csv" };
  const app = workspace({ fetch: async (_url, _init, call) => call === 1
    ? response(400, { errors: [{ field: "order_code", message: "Duplicate", row: 2 }] })
    : success(preview) });
  let tree = app.render();
  app.button(tree, "Import CSV").props.onClick();
  tree = app.render();
  app.find(tree, node => node.type === "input" && node.props.type === "file")
    .props.onChange({ target: { files: [oldFile] } });
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV")));
  tree = app.render();
  assert.match(elementText(tree), /Duplicate/);
  app.button(tree, "Choose a replacement CSV").props.onClick();
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV")));
  tree = app.render();
  assert.equal(app.requests.length, 1, "replacement picker without a file must not upload the old file");
  assert.ok(app.find(tree, node => node.type === "input" && node.props.type === "file"));
  app.find(tree, node => node.type === "input" && node.props.type === "file")
    .props.onChange({ target: { files: [newFile] } });
  tree = app.render();
  await app.submit(app.find(tree, node => node.type === "form" && elementText(node).includes("Check CSV")));
  assert.equal(app.requests[1].init.body.entries[0][1], newFile);
});

test("successful import reaches completion and clears the selected file", async () => {
  const file = { name: "ready.csv" };
  const app = workspace({ fetch: async (_url, _init, call) => call === 2 ? success({ imported: 1 }) : success(preview) });
  const tree = await beginImport(app, file);
  const complete = await confirmImport(app, tree);
  assert.match(elementText(complete), /1 orders imported/);
  assert.ok(app.button(complete, "View orders"));
});
