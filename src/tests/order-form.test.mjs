import assert from "node:assert/strict";
import test from "node:test";
import { formValue, orderPayload, orderIssues } from "../app/orders/order-form.mjs";
import { parseLocalDateTime } from "../lib/orders/validation.ts";

test("serializes local windows and omits blank optional coordinates", () => {
  const result = orderPayload({ order_code: " A-1 ", window_start: "2026-11-19T08:00", weight_kg: "1.2", latitude: "", longitude: "" });
  assert.deepEqual(result, { order_code: "A-1", window_start: "2026-11-19 08:00", weight_kg: 1.2 });
});

test("editing sends the version without changing order identity", () => {
  assert.deepEqual(orderPayload({ order_code: "A-1", recipient_name: " Demo " }, 3), { recipient_name: "Demo", version: 3 });
});

test("separates API field errors from CSV record errors", () => {
  const row = { row: 2, field: "order_code", message: "Duplicate" };
  assert.deepEqual(orderIssues([{ field: "file", message: "Invalid CSV" }, row]), {
    fieldErrors: { file: "Invalid CSV" }, rowErrors: [row],
  });
});

test("saved windows round-trip through UI values and edit payloads across accepted years", () => {
  for (const window of ["0001-01-01 07:00", "2026-11-20 09:00", "9999-12-31 23:59"]) {
    const date = parseLocalDateTime(window);
    assert.ok(date);
    const input = formValue("window_start", { window_start: date.toISOString() });
    assert.equal(input, window.replace(" ", "T"));
    const payload = orderPayload({ window_start: input }, 1);
    assert.equal(payload.window_start, window);
    assert.equal(parseLocalDateTime(payload.window_start).toISOString(), date.toISOString());
  }
  assert.equal(formValue("priority"), "NORMAL");
  assert.equal(formValue("window_start"), "");
  assert.equal(formValue("weight_kg", { weight_kg: 1.5 }), "1.5");
  assert.equal(formValue("window_start", { window_start: "2026-11-20 09:00" }), "2026-11-20T09:00");
  assert.equal(formValue("window_start", { window_start: "invalid" }), "invalid");
});
