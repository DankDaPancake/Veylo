import assert from "node:assert/strict";
import test from "node:test";
import { orderPayload, orderIssues } from "../app/orders/order-form.mjs";

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
