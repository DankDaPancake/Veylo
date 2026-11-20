import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { assertDemoDatabaseUrl } from "../prisma/seed-demo-accounts.ts";
import { csvHeader } from "../lib/orders/csv.ts";

// This suite writes synthetic data only to the explicitly opted-in local demo database.
assertDemoDatabaseUrl(process.env.DATABASE_URL ?? "");
const base = process.env.VEYLO_TEST_URL ?? "http://127.0.0.1:3000";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const prefix = `CHECK-${Date.now()}`;
const valid = (code) => ({ order_code: code, recipient_name: "Synthetic Recipient", recipient_phone: "0900000001", delivery_address: "Synthetic Test Street", window_start: "2026-11-20 00:00", window_end: "2026-11-20 23:59", weight_kg: "1.25" });
const csv = (codes, invalid = false) => csvHeader + "\n" + codes.map((code, i) => `${code},Synthetic Recipient,0900000001,Synthetic Street,2026-11-20 09:00,2026-11-20 11:00,${invalid && i === 1 ? -1 : 1},NORMAL,,,`).join("\n") + "\n";
async function call(path, cookie = "", method = "GET", body) {
  const headers = { cookie, origin: base };
  if (body !== undefined && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const response = await fetch(base + path, { method, headers, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
async function signIn(email) {
  const request = () => fetch(base + "/api/auth/sign-in/email", { method: "POST", headers: { "Content-Type": "application/json", origin: base }, body: JSON.stringify({ email, password: "Veylo-PA3-demo-only!" }) });
  let response = await request();
  if (response.status === 429) {
    const delay = Number(response.headers.get("retry-after") ?? "10");
    assert.ok(Number.isFinite(delay) && delay >= 0 && delay <= 60);
    await response.body?.cancel();
    await new Promise((resolve) => setTimeout(resolve, (delay + 1) * 1000));
    response = await request();
  }
  assert.equal(response.status, 200, "Real Better Auth sign-in must succeed");
  return response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
}
async function upload(text, cookie, name = "orders.csv", path = "/api/orders/import") {
  const form = new FormData();
  form.append("file", new File([text], name, { type: "text/csv" }));
  return call(path, cookie, "POST", form);
}

test("combined F02 database/auth/API/CSV verification", async (t) => {
  try {
    const [database] = await prisma.$queryRaw`SELECT current_database() AS name`;
    assert.equal(database.name, "veylo_demo");
    const hubA = await prisma.hub.findUniqueOrThrow({ where: { code: "hub-a" } });
    const hubB = await prisma.hub.findUniqueOrThrow({ where: { code: "hub-b" } });
    await t.test("migration fixtures and seed replay preserve rows", async () => {
      assert.equal(await prisma.hub.count(), 2);
      assert.equal(await prisma.user.count(), 4);
      assert.equal(await prisma.account.count(), 4);
      assert.equal(await prisma.order.count({ where: { order_code: { startsWith: "DEMO-" } } }), 50);
      const count = await prisma.order.count();
      const replay = spawnSync(process.execPath, ["prisma/seed.ts"], { encoding: "utf8", env: process.env });
      assert.equal(replay.status, 0, "Seed replay must succeed");
      assert.equal(await prisma.order.count(), count);
    });
    let cookieA = await signIn("dispatcher-a@example.test");
    const cookieB = await signIn("dispatcher-b@example.test");
    const admin = await signIn("admin@example.test");
    const rider = await signIn("rider@example.test");
    const serverScope = await call("/api/orders", cookieA);
    assert.equal(serverScope.status, 200);
    assert.ok(serverScope.data.orders.length > 0);
    assert.ok(serverScope.data.orders.every((order) => order.hubId === hubA.id), "Test server must use the same disposable database");
    const sample = await prisma.order.findFirstOrThrow({ where: { hubId: hubB.id } });
    const paths = [["/api/orders", "GET"], ["/api/orders", "POST"], [`/api/orders/${sample.id}`, "GET"], [`/api/orders/${sample.id}`, "PATCH"], [`/api/orders/${sample.id}/cancel`, "POST"], ["/api/orders/import", "POST"], ["/api/orders/import/preview", "POST"], ["/api/orders/template", "GET"]];
    await t.test("every route denies absent sessions, Admin and Rider", async () => {
      for (const [path, method] of paths) {
        for (const [cookie, expected] of [["", 401], [admin, 403], [rider, 403]]) {
          const result = await fetch(base + path, { method, headers: { cookie, origin: base } });
          assert.equal(result.status, expected, `${method} ${path}`);
          assert.ok(!(await result.text()).includes("Synthetic"));
        }
      }
    });
    await t.test("create/detail reject invalid fields, preserve values and enforce per-hub codes", async () => {
      const bad = await call("/api/orders", cookieA, "POST", { ...valid(`${prefix}-BAD`), recipient_phone: "bad", weight_kg: 0 });
      assert.equal(bad.status, 400);
      assert.ok(bad.data.errors.some((error) => error.field === "recipient_phone"));
      assert.equal(await prisma.order.count({ where: { order_code: `${prefix}-BAD` } }), 0);
      assert.equal((await call("/api/orders", cookieA, "POST", { ...valid(`${prefix}-BAD`), hub_id: hubB.id })).status, 400);
      for (const [field, overrides] of [["window_start", { window_start: "0000-01-01 09:00" }], ["window_start", { window_start: "0001-01-01 00:00" }], ["window_end", { window_end: "0000-01-01 11:00" }], ["recipient_name", { recipient_name: "Bad\u0000Name" }], ["delivery_address", { delivery_address: "Bad\u0000Address" }], ["note", { note: "Bad\u0000Note" }]]) {
        const invalidDate = await call("/api/orders", cookieA, "POST", { ...valid(`${prefix}-DATE-BAD`), ...overrides });
        assert.equal(invalidDate.status, 400);
        assert.ok(invalidDate.data.errors.some((error) => error.field === field));
        assert.equal(await prisma.order.count({ where: { order_code: `${prefix}-DATE-BAD` } }), 0);
      }
      const created = await call("/api/orders", cookieA, "POST", { ...valid(`${prefix}-ONE`), priority: " HIGH " });
      assert.equal(created.status, 201);
      assert.equal(created.data.status, "NEW");
      assert.equal(created.data.priority, "HIGH");
      assert.equal(created.data.weight_kg, "1.25");
      assert.equal(created.data.window_start, "2026-11-19T17:00:00.000Z");
      assert.equal((await call(`/api/orders/${created.data.id}`, cookieA)).data.order_code, `${prefix}-ONE`);
      assert.equal((await call("/api/orders", cookieA, "POST", valid(` ${prefix.toLowerCase()}-one `))).status, 409);
      assert.equal((await call("/api/orders", cookieB, "POST", valid(`${prefix}-ONE`))).status, 201);
    });
    await t.test("cross-hub reads, edits and cancellations return 404 without changes", async () => {
      assert.equal((await call(`/api/orders/${sample.id}`, cookieA)).status, 404);
      assert.equal((await call(`/api/orders/${sample.id}`, cookieA, "PATCH", { version: sample.version, note: "Synthetic edit" })).status, 404);
      assert.equal((await call(`/api/orders/${sample.id}/cancel`, cookieA, "POST", { version: sample.version, reason: "Synthetic cancellation" })).status, 404);
      assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: sample.id } })).version, sample.version);
    });
    await t.test("combined filters, inclusive local dates, stable pages and literal keywords", async () => {
      const first = await call("/api/orders?page=1", cookieA);
      const second = await call("/api/orders?page=2", cookieA);
      assert.equal(first.data.orders.length, 20);
      assert.ok(first.data.orders.every((order) => order.hubId === hubA.id));
      assert.ok(!second.data.orders.some((order) => first.data.orders.some((item) => item.id === order.id)));
      const sort = [...first.data.orders, ...second.data.orders].map((order) => `${order.window_start} ${order.order_code}`);
      assert.deepEqual(sort, [...sort].sort());
      const filtered = await call(`/api/orders?q=${prefix}&status=NEW&from=2026-11-20&to=2026-11-20&page=999`, cookieA);
      assert.equal(filtered.data.total, 1);
      assert.equal(filtered.data.page, 1);
      const literalPct = await call("/api/orders?q=%25", cookieA);
      assert.equal(literalPct.status, 200);
      assert.ok(literalPct.data.total < first.data.total);
      assert.ok(literalPct.data.orders.every((order) => [order.order_code, order.recipient_name, order.recipient_phone].some((value) => value.includes("%"))));
      assert.equal((await call("/api/orders?from=2026-02-30", cookieA)).status, 400);
      for (const [field, query] of [["from", "from=0000-01-01"], ["from", "from=0001-01-01"], ["to", "to=0000-01-01"], ["to", "to=0000-12-31"], ["to", "from=0001-01-02&to=0001-01-01"], ["q", "q=abc%00"]]) {
        const badQuery = await call(`/api/orders?${query}`, cookieA);
        assert.equal(badQuery.status, 400);
        assert.ok(badQuery.data.errors.some((error) => error.field === field));
      }
      const earliestOrder = await call("/api/orders", cookieA, "POST", { ...valid(`${prefix}-EARLIEST`), window_start: "0001-01-01 07:00", window_end: "0001-01-01 08:00" });
      assert.equal(earliestOrder.status, 201);
      assert.equal(earliestOrder.data.window_start, "0001-01-01T00:00:00.000Z");
      const earliestTo = await call(`/api/orders?q=${prefix}-EARLIEST&to=0001-01-01`, cookieA);
      assert.equal(earliestTo.status, 200);
      assert.equal(earliestTo.data.total, 1);
      assert.equal(earliestTo.data.orders[0].order_code, `${prefix}-EARLIEST`);
      assert.equal((await call("/api/orders?q=0900000001", cookieA)).data.total > 0, true);
      assert.equal((await call("/api/orders?q=synthetic", cookieA)).data.total > 0, true);
    });
    await t.test("edits preserve identity; stale/concurrent edits conflict; cancellation persists", async () => {
      const { data: order } = await call("/api/orders", cookieA, "POST", valid(`${prefix}-EDIT`));
      for (const field of ["order_code", "hub_id", "status", "createdAt", "normalized_code"]) {
        assert.equal((await call(`/api/orders/${order.id}`, cookieA, "PATCH", { version: 1, [field]: "forbidden" })).status, 400);
      }
      const overflowEdit = await call(`/api/orders/${order.id}`, cookieA, "PATCH", { version: 2147483648, note: "Overflow" });
      assert.equal(overflowEdit.status, 400);
      assert.ok(overflowEdit.data.errors.some((error) => error.field === "version"));
      const overflowCancel = await call(`/api/orders/${order.id}/cancel`, cookieA, "POST", { version: 2147483648, reason: "Overflow cancel" });
      assert.equal(overflowCancel.status, 400);
      assert.ok(overflowCancel.data.errors.some((error) => error.field === "version"));
      const zeroYearEdit = await call(`/api/orders/${order.id}`, cookieA, "PATCH", { version: 1, window_start: "0000-01-01 09:00" });
      assert.equal(zeroYearEdit.status, 400);
      assert.ok(zeroYearEdit.data.errors.some((error) => error.field === "window_start"));
      const nulEdit = await call(`/api/orders/${order.id}`, cookieA, "PATCH", { version: 1, note: "Bad\u0000Note" });
      assert.equal(nulEdit.status, 400);
      assert.ok(nulEdit.data.errors.some((error) => error.field === "note"));
      const nulCancel = await call(`/api/orders/${order.id}/cancel`, cookieA, "POST", { version: 1, reason: "Bad\u0000Reason" });
      assert.equal(nulCancel.status, 400);
      assert.ok(nulCancel.data.errors.some((error) => error.field === "reason"));
      assert.equal((await call("/api/orders/bad%00id", cookieA)).status, 404);
      assert.equal((await call("/api/orders/bad%00id", cookieA, "PATCH", { version: 1, note: "Ok" })).status, 404);
      assert.equal((await call("/api/orders/bad%00id/cancel", cookieA, "POST", { version: 1, reason: "Valid reason" })).status, 404);
      assert.equal((await call(`/api/orders/${order.id}`, cookieA, "PATCH", { version: 2147483647, note: "Max int stale" })).status, 409);
      const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
      assert.equal(unchanged.version, 1);
      assert.equal(unchanged.status, "NEW");
      assert.equal(unchanged.note, null);
      assert.equal(unchanged.window_start.toISOString(), order.window_start);
      const edits = await Promise.all(["First change", "Second change"].map((note) => call(`/api/orders/${order.id}`, cookieA, "PATCH", { version: 1, note })));
      assert.deepEqual(edits.map((result) => result.status).sort(), [200, 409]);
      assert.equal((await call(`/api/orders/${order.id}`, cookieA, "PATCH", { version: 1, note: "Stale" })).status, 409);
      assert.equal((await call(`/api/orders/${order.id}/cancel`, cookieA, "POST", { version: 2147483647, reason: "Max int stale cancel" })).status, 409);
      assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status, "NEW");
      assert.equal((await call(`/api/orders/${order.id}/cancel`, cookieA, "POST", { version: 2, reason: " x " })).status, 400);
      const cancelled = await call(`/api/orders/${order.id}/cancel`, cookieA, "POST", { version: 2, reason: " Synthetic reason " });
      assert.equal(cancelled.status, 200);
      const reloaded = await call(`/api/orders/${order.id}`, cookieA);
      assert.equal(reloaded.data.status, "CANCELLED");
      assert.equal(reloaded.data.cancellation_reason, "Synthetic reason");
      assert.equal(reloaded.data.order_code, order.order_code);
      assert.equal(reloaded.data.version, 3);
      assert.equal((await call(`/api/orders/${order.id}`, cookieA, "PATCH", { version: 3, note: "Blocked" })).status, 409);
      assert.equal((await call(`/api/orders/${order.id}/cancel`, cookieA, "POST", { version: 3, reason: "Another reason" })).status, 409);
    });
    await t.test("CSV template, atomic 20-row import, mixed errors and duplicate races", async () => {
      const template = await fetch(base + "/api/orders/template", { headers: { cookie: cookieA } });
      assert.equal(template.status, 200);
      assert.ok((await template.text()).startsWith(csvHeader));
      const codes = Array.from({ length: 20 }, (_, i) => `${prefix}-CSV-${i}`);
      assert.deepEqual(await upload(csv(codes), cookieA), { status: 201, data: { imported: 20 } });
      assert.equal((await call(`/api/orders?q=${prefix}-CSV-`, cookieA)).data.total, 20);
      const mixed = [`${prefix}-MIX-0`, `${prefix}-MIX-1`];
      const bad = await upload(csv(mixed, true), cookieA);
      assert.equal(bad.status, 400);
      assert.ok(bad.data.errors.some((item) => item.row === 3 && item.field === "weight_kg"));
      assert.equal(await prisma.order.count({ where: { hubId: hubA.id, order_code: { in: mixed } } }), 0);
      const duplicate = await upload(csv([`${prefix}-DUP`, `${prefix.toLowerCase()}-dup`]), cookieA);
      assert.equal(duplicate.status, 400);
      assert.deepEqual(duplicate.data.errors.map((item) => item.row), [2, 3]);
      const existing = await upload(csv([codes[0], `${prefix}-ROLLBACK`]), cookieA);
      assert.equal(existing.status, 409);
      assert.equal(existing.data.errors[0].row, 2);
      assert.equal(await prisma.order.count({ where: { order_code: `${prefix}-ROLLBACK` } }), 0);
      const sharedCode = `${prefix}-RACE`;
      const raceCodes = [`${prefix}-RACE-A`, `${prefix}-RACE-B`];
      const races = await Promise.all(raceCodes.map((code) => upload(csv([code, sharedCode]), cookieA)));
      assert.deepEqual(races.map((item) => item.status).sort(), [201, 409]);
      const loser = races.findIndex((item) => item.status === 409);
      assert.deepEqual(races[loser].data.errors.map((item) => item.row), [3]);
      assert.equal(await prisma.order.count({ where: { hubId: hubA.id, order_code: raceCodes[loser] } }), 0);
      assert.equal(await prisma.order.count({ where: { hubId: hubA.id, order_code: { in: [...raceCodes, sharedCode] } } }), 2);
      assert.equal((await upload(csv([`${prefix}-TYPE`]), cookieA, "bad.txt")).status, 400);
      assert.equal((await upload(csvHeader + "\n", cookieA)).status, 400);
      const zeroYearCsv = csvHeader + `\n${prefix}-CSV-ZERO,Synthetic Recipient,0900000001,Synthetic Street,0000-01-01 09:00,2026-11-20 11:00,1,NORMAL,,,\n`;
      const zeroYearImport = await upload(zeroYearCsv, cookieA);
      assert.equal(zeroYearImport.status, 400);
      assert.ok(zeroYearImport.data.errors.some((error) => error.row === 2 && error.field === "window_start"));
      assert.equal(await prisma.order.count({ where: { hubId: hubA.id, order_code: `${prefix}-CSV-ZERO` } }), 0);
      const nulCsv = csvHeader + `\n${prefix}-CSV-NUL,Synthetic Recipient,0900000001,Synthetic Street,2026-11-20 09:00,2026-11-20 11:00,1,NORMAL,Bad\u0000Note,,\n`;
      const nulImport = await upload(nulCsv, cookieA);
      assert.equal(nulImport.status, 400);
      assert.ok(nulImport.data.errors.some((error) => error.row === 2 && error.field === "note"));
      assert.equal(await prisma.order.count({ where: { hubId: hubA.id, order_code: `${prefix}-CSV-NUL` } }), 0);
      const manyEmptyImport = await upload(csvHeader + "\n" + "\n".repeat(900_000), cookieA);
      assert.equal(manyEmptyImport.status, 400);
      assert.ok(manyEmptyImport.data.errors.some((error) => error.field === "file"));
    });
    await t.test("read-only CSV preview, complete diagnostics, hub isolation and confirmation races", async () => {
      const preview = (text, cookie = cookieA, name = "orders.csv") => upload(text, cookie, name, "/api/orders/import/preview");
      const codes = Array.from({ length: 20 }, (_, i) => `${prefix}-PRE-${i}`);
      const count = await prisma.order.count();
      const checked = await preview(csv(codes));
      assert.equal(checked.status, 200);
      assert.equal(checked.data.orders.length, 20);
      assert.equal(checked.data.total, 20);
      assert.equal(checked.data.valid, 20);
      assert.equal(checked.data.saved, 0);
      assert.equal(checked.data.orders[0].row, 2);
      assert.equal(checked.data.orders[0].order_code, codes[0]);
      assert.equal(checked.data.orders[0].window_start, "2026-11-20 09:00");
      assert.equal(checked.data.orders[0].window_end, "2026-11-20 11:00");
      assert.equal(await prisma.order.count(), count, "Preview must never write orders");
      assert.equal((await preview(csv(codes))).status, 200);
      assert.equal(await prisma.order.count(), count, "Repeated preview/dismissal leaves data unchanged");
      assert.equal((await upload(csv(codes), cookieA)).status, 201);
      assert.equal(await prisma.order.count(), count + 20);
      const sameHub = `${prefix}-PRE-EXIST`;
      const foreignOnly = `${prefix}-PRE-FOREIGN`;
      assert.equal((await call("/api/orders", cookieA, "POST", valid(sameHub))).status, 201);
      assert.equal((await call("/api/orders", cookieB, "POST", valid(foreignOnly))).status, 201);
      assert.equal((await preview(csv([foreignOnly]))).status, 200, "Foreign-hub code must not collide or disclose foreign details");
      const mixedCodes = [`${prefix}-PRE-DUP`, `${prefix.toLowerCase()}-pre-dup`, sameHub];
      const beforeMixed = await prisma.order.count();
      const mixed = await preview(csv(mixedCodes, true));
      assert.equal(await prisma.order.count(), beforeMixed, "Mixed diagnostic preview must not write any orders");
      assert.equal(mixed.status, 400);
      assert.ok(mixed.data.errors.some(e => e.row === 3 && e.field === "weight_kg"));
      for (const row of [2, 3]) assert.ok(mixed.data.errors.some(e => e.row === row && e.field === "order_code"));
      assert.ok(mixed.data.errors.some(e => e.row === 4 && e.field === "order_code"));
      const beforeBad = await prisma.order.count();
      assert.equal((await preview(csv(codes), cookieA, "bad.txt")).status, 400);
      assert.equal((await preview(csvHeader + "\n")).status, 400);
      const width = await preview(csvHeader + "\nshort,row\n");
      assert.equal(width.status, 400);
      assert.ok(width.data.errors.some(e => e.row === 2));
      assert.equal(await prisma.order.count(), beforeBad);
      const claimed = [`${prefix}-PRE-CLAIM`, `${prefix}-PRE-LOSER`];
      assert.equal((await preview(csv(claimed))).status, 200);
      assert.equal((await call("/api/orders", cookieA, "POST", valid(claimed[0]))).status, 201);
      const afterClaim = await prisma.order.count();
      const conflict = await upload(csv(claimed), cookieA);
      assert.equal(conflict.status, 409);
      assert.ok(conflict.data.errors.some(e => e.row === 2 && e.field === "order_code"));
      assert.equal(await prisma.order.count(), afterClaim);
      assert.equal(await prisma.order.count({ where: { hubId: hubA.id, order_code: claimed[1] } }), 0);
    });
    await t.test("database uniqueness races and invalid numeric values cannot bypass the API", async () => {
      const data = { hubId: hubA.id, ...valid(`${prefix}-DB-RACE`), normalized_code: `${prefix.toLowerCase()}-db-race`, window_start: new Date("2026-11-20T02:00:00Z"), window_end: new Date("2026-11-20T04:00:00Z") };
      const race = await Promise.allSettled([prisma.order.create({ data }), prisma.order.create({ data })]);
      assert.equal(race.filter((item) => item.status === "fulfilled").length, 1);
      for (const weight_kg of ["0", "-1", "NaN", "Infinity"]) await assert.rejects(prisma.order.create({ data: { ...data, order_code: `${prefix}-INVALID`, normalized_code: `${prefix.toLowerCase()}-invalid`, weight_kg } }));
    });
    await t.test("current hub assignment, expired session, reload and server-side sign-out", async () => {
      const user = await prisma.user.findUniqueOrThrow({ where: { email: "dispatcher-a@example.test" } });
      try {
        await prisma.user.update({ where: { id: user.id }, data: { hubId: null } });
        assert.equal((await call("/api/orders", cookieA)).status, 403);
        assert.equal((await upload(csv([`${prefix}-NOHUB`]), cookieA, "orders.csv", "/api/orders/import/preview")).status, 403);
      } finally { await prisma.user.update({ where: { id: user.id }, data: { hubId: hubA.id } }); }
      assert.equal((await call("/api/orders", cookieA)).status, 200);
      await prisma.session.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
      assert.equal((await call("/api/orders", cookieA)).status, 401);
      const beforeExpired = await prisma.order.count();
      assert.equal((await upload(csv([`${prefix}-EXPIRED`]), cookieA, "orders.csv", "/api/orders/import/preview")).status, 401);
      assert.equal(await prisma.order.count(), beforeExpired);
      cookieA = await signIn("dispatcher-a@example.test");
      assert.equal((await call("/api/orders", cookieA)).status, 200);
      assert.equal((await call("/api/auth/sign-out", cookieA, "POST", {})).status, 200);
      assert.equal((await call("/api/orders", cookieA)).status, 401);
    });
  } finally { await prisma.$disconnect(); }
});
