import assert from "node:assert/strict";
import test from "node:test";
import { OrderError, parseListQuery, requireVersion, validateOrder } from "../lib/orders/validation.ts";
import { csvHeader, csvTemplate, parseOrdersCsv } from "../lib/orders/csv.ts";

const valid = { order_code: " Test-1 ", recipient_name: " Người nhận thử ", recipient_phone: "0900000001", delivery_address: "Địa chỉ giả lập", window_start: "2026-11-20 09:00", window_end: "2026-11-20 11:00", weight_kg: "1.25" };
const bytes = (text) => new TextEncoder().encode(text);
const csvRow = (code, weight = "1") => `${code},Synthetic Recipient,0900000001,Synthetic Street,2026-11-20 09:00,2026-11-20 11:00,${weight},NORMAL,,,`;
const invalid = (action, field) => assert.throws(action, (error) => error instanceof OrderError && error.status === 400 && error.errors.some((item) => item.field === field));

test("shared validation trims, normalizes ASCII, preserves decimals and interprets hub time", () => {
  const order = validateOrder(valid);
  assert.equal(order.order_code, "Test-1");
  assert.equal(order.normalized_code, "test-1");
  assert.equal(order.recipient_name, "Người nhận thử");
  assert.equal(order.window_start.toISOString(), "2026-11-20T02:00:00.000Z");
  assert.equal(order.weight_kg, "1.25");
  assert.equal(order.priority, "NORMAL");
  assert.equal(validateOrder({ ...valid, priority: " HIGH " }).priority, "HIGH");
  assert.equal(validateOrder({ ...valid, priority: " ", latitude: " ", longitude: " " }).latitude, null);
  assert.equal(validateOrder({ ...valid, recipient_name: "😀".repeat(100) }).recipient_name.length, 200);
  assert.equal(validateOrder({ ...valid, latitude: -90, longitude: 180 }).longitude, 180);
});

test("field errors reject invalid numbers, calendar dates, windows and coordinates", () => {
  for (const value of [undefined, 0, -1, "abc", "Infinity", NaN, true, "0x10", ""]) invalid(() => validateOrder({ ...valid, weight_kg: value }), "weight_kg");
  for (const value of ["2026-02-30 09:00", "2026-11-20T09:00", "2026-11-20 24:00"]) invalid(() => validateOrder({ ...valid, window_start: value }), "window_start");
  invalid(() => validateOrder({ ...valid, window_end: valid.window_start }), "window_end");
  invalid(() => validateOrder({ ...valid, latitude: 1 }), "longitude");
  invalid(() => validateOrder({ ...valid, longitude: 1 }), "latitude");
  invalid(() => validateOrder({ ...valid, latitude: 91, longitude: 1 }), "latitude");
  for (const [field, value] of Object.entries({ order_code: "đơn-1", recipient_name: "😀".repeat(101), recipient_phone: "1234567890", delivery_address: "x", priority: "LOW", note: 123 })) invalid(() => validateOrder({ ...valid, [field]: value }), field);
  for (const [field, value] of Object.entries({ recipient_name: "A\u0000B", delivery_address: "12345\u0000Street", note: "note\u0000text" })) invalid(() => validateOrder({ ...valid, [field]: value }), field);
  invalid(() => validateOrder({ ...valid, hub_id: "client-hub" }), "hub_id");
  for (const value of [0, -1, 1.5, "1", 2147483648, Number.MAX_SAFE_INTEGER]) invalid(() => requireVersion(value), "version");
  assert.equal(requireVersion(1), 1);
  assert.equal(requireVersion(2147483647), 2147483647);
});

test("rejects year 0000 and timestamps outside PostgreSQL representable UTC range", () => {
  for (const value of ["0000-01-01 09:00", "0001-01-01 00:00", "0001-01-01 06:59"]) invalid(() => validateOrder({ ...valid, window_start: value }), "window_start");
  invalid(() => validateOrder({ ...valid, window_end: "0000-01-01 11:00" }), "window_end");
  invalid(() => validateOrder({ ...valid, window_start: "0001-01-01 07:00", window_end: "0001-01-01 07:00" }), "window_end");
  const earliest = validateOrder({ ...valid, window_start: "0001-01-01 07:00", window_end: "0001-01-01 08:00" });
  assert.equal(earliest.window_start.toISOString(), "0001-01-01T00:00:00.000Z");
  for (const [field, value] of [["from", "0000-01-01"], ["from", "0001-01-01"], ["to", "0000-01-01"], ["to", "0000-12-31"]]) invalid(() => parseListQuery(new URLSearchParams({ [field]: value })), field);
  assert.equal(parseListQuery(new URLSearchParams({ to: "0001-01-01" })).until.toISOString(), "0001-01-01T17:00:00.000Z");
  invalid(() => parseListQuery(new URLSearchParams({ from: "0001-01-02", to: "0001-01-01" })), "to");
  const wide = parseListQuery(new URLSearchParams({ from: "0001-01-02", to: "9999-12-31" }));
  assert.equal(wide.from.toISOString(), "0001-01-01T17:00:00.000Z");
  assert.equal(wide.until.toISOString(), "9999-12-31T17:00:00.000Z");
});

test("list dates include local end day and reject malformed filters", () => {
  const query = parseListQuery(new URLSearchParams({ from: "2026-11-20", to: "2026-11-20", page: "2", status: "NEW", q: " a%_ " }));
  assert.equal(query.from.toISOString(), "2026-11-19T17:00:00.000Z");
  assert.equal(query.until.toISOString(), "2026-11-20T17:00:00.000Z");
  assert.equal(query.q, "a%_");
  for (const [field, value] of Object.entries({ from: "2026-02-30", to: "no", status: "FAILED", page: "1.5", q: "a\u0000b" })) invalid(() => parseListQuery(new URLSearchParams({ [field]: value })), field);
});

test("CSV accepts template, 20 rows, BOM, CRLF and quoted commas/quotes/newlines", () => {
  assert.equal(parseOrdersCsv(bytes(csvTemplate), "template.csv").length, 1);
  const text = csvHeader + "\r\n" + Array.from({ length: 20 }, (_, i) => csvRow(`CSV-${i}`)).join("\r\n") + "\r\n";
  assert.equal(parseOrdersCsv(bytes("\uFEFF" + text), "orders.csv").length, 20);
  const quoted = csvHeader + '\nQ-1,"Recipient, ""Demo""\nSecond line",0900000001,Synthetic Street,2026-11-20 09:00,2026-11-20 11:00,1,NORMAL,,,\n';
  assert.equal(parseOrdersCsv(bytes(quoted), "x.csv")[0].data.recipient_name, 'Recipient, "Demo"\nSecond line');
  const columns = csvHeader.split(",");
  const cells = csvRow("REORDERED").split(",");
  assert.equal(parseOrdersCsv(bytes(columns.toReversed().join(",") + "\n" + cells.toReversed().join(",")), "x.csv").length, 1);
  const maxWithNewlines = csvHeader + "\n" + Array.from({ length: 500 }, (_, i) => `NL-${i},"Line1\nLine2",0900000001,Synthetic Street,2026-11-20 09:00,2026-11-20 11:00,1,NORMAL,,,`).join("\n") + "\n";
  assert.equal(parseOrdersCsv(bytes(maxWithNewlines), "x.csv").length, 500);
});

test("CSV rejects invalid encoding, structure, file limits and record limits", () => {
  for (const text of ["", csvHeader, csvHeader + "\n", csvHeader + ",unknown\n" + csvRow("A") + ",x", csvHeader.replace("note", "priority") + "\n" + csvRow("A"), csvHeader + '\n"unterminated', csvHeader + '\n"a"x,b', csvHeader + "\nwrong,count", csvHeader + "\r" + csvRow("A"), csvHeader + "\n" + Array.from({ length: 501 }, (_, i) => csvRow(`X-${i}`)).join("\n"), csvHeader + "\n" + "\n".repeat(900_000)]) invalid(() => parseOrdersCsv(bytes(text), "x.csv"), "file");
  invalid(() => parseOrdersCsv(new Uint8Array([0xff]), "x.csv"), "file");
  invalid(() => parseOrdersCsv(new Uint8Array(1_000_001), "x.csv"), "file");
  invalid(() => parseOrdersCsv(bytes(csvTemplate), "x.xlsx"), "file");
});

test("CSV reports both duplicate occurrences and record numbers across quoted newlines without raw data", () => {
  const text = csvHeader + '\nA,"Synthetic\nRecipient",0900000001,Synthetic Street,2026-11-20 09:00,2026-11-20 11:00,1,NORMAL,,,\n' + csvRow(" a ") + "\n" + csvRow("B", "-1");
  assert.throws(() => parseOrdersCsv(bytes(text), "x.csv"), (error) => {
    assert.deepEqual(error.errors.filter((item) => item.field === "order_code").map((item) => item.row), [2, 3]);
    assert.equal(error.errors.find((item) => item.field === "weight_kg").row, 4);
    assert.ok(!JSON.stringify(error.errors).includes("Synthetic"));
    return true;
  });
});
