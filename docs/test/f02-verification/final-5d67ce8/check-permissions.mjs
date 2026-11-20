// Run with the isolated demo environment and VEYLO_DEMO_PASSWORD; never log cookies.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { PrismaClient } from "../../../../src/generated/prisma/client.ts";
import { assertDemoDatabaseUrl } from "../../../../src/prisma/seed-demo-accounts.ts";

const require = createRequire(new URL("../../../../src/package.json", import.meta.url));
const { PrismaPg } = require("@prisma/adapter-pg");
assertDemoDatabaseUrl(process.env.DATABASE_URL ?? "");
const base = process.env.VEYLO_TEST_URL;
assert.equal(base, "http://127.0.0.1:3017");
assert.ok(process.env.VEYLO_DEMO_PASSWORD, "Set the documented local demo password");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const results = [];
async function signIn(email) {
  const send = () => fetch(base + "/api/auth/sign-in/email", {
    method: "POST", headers: { "Content-Type": "application/json", origin: base },
    body: JSON.stringify({ email, password: process.env.VEYLO_DEMO_PASSWORD }),
  });
  let r = await send();
  if (r.status === 429) {
    const delay = Number(r.headers.get("retry-after") ?? "10");
    assert.ok(Number.isFinite(delay) && delay >= 0 && delay <= 60);
    await r.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, (delay + 1) * 1000));
    r = await send();
  }
  assert.equal(r.status, 200);
  return r.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
}
async function denied(actor, cookie, method, path, expected, payload) {
  const r = await fetch(base + path, { method, headers: { cookie, origin: base, ...(payload ? { "Content-Type": "application/json" } : {}) }, body: payload ? JSON.stringify(payload) : undefined });
  const body = await r.json();
  assert.equal(r.status, expected, `${actor} ${method} ${path}`);
  assert.ok(!JSON.stringify(body).includes("Synthetic"));
  results.push({ actor, method, route: path, expected, actual: r.status, response: body });
}
try {
  const beforeCount = await prisma.order.count();
  const hubB = await prisma.hub.findUniqueOrThrow({ where: { code: "hub-b" } });
  const other = await prisma.order.findFirstOrThrow({ where: { hubId: hubB.id } });
  const before = JSON.stringify(other);
  const paths = [["GET", "/api/orders"], ["POST", "/api/orders"], ["GET", `/api/orders/${other.id}`], ["PATCH", `/api/orders/${other.id}`], ["POST", `/api/orders/${other.id}/cancel`], ["POST", "/api/orders/import"], ["POST", "/api/orders/import/preview"], ["GET", "/api/orders/template"]];
  for (const [actor, email, status] of [["anonymous", null, 401], ["Administrator", "admin@example.test", 403], ["Rider", "rider@example.test", 403]]) {
    const cookie = email ? await signIn(email) : "";
    for (const [method, path] of paths) await denied(actor, cookie, method, path, status);
  }
  const cookie = await signIn("dispatcher-a@example.test");
  for (const [method, path] of paths.slice(2, 5)) await denied("other-hub Dispatcher", cookie, method, path, 404, method === "PATCH" ? { version: other.version, note: "Synthetic forbidden edit" } : method === "POST" ? { version: other.version, reason: "Synthetic forbidden cancellation" } : undefined);
  assert.equal(JSON.stringify(await prisma.order.findUniqueOrThrow({ where: { id: other.id } })), before);
  const user = await prisma.user.findUniqueOrThrow({ where: { email: "dispatcher-a@example.test" } });
  try {
    await prisma.user.update({ where: { id: user.id }, data: { hubId: null } });
    for (const [method, path] of paths) await denied("Dispatcher without current hub", cookie, method, path, 403);
  } finally {
    await prisma.user.update({ where: { id: user.id }, data: { hubId: user.hubId } });
  }
  await prisma.session.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  for (const [method, path] of paths) await denied("expired Dispatcher", cookie, method, path, 401);
  assert.equal(await prisma.order.count(), beforeCount);
  assert.equal(JSON.stringify(await prisma.order.findUniqueOrThrow({ where: { id: other.id } })), before);
  writeFileSync(new URL("permissions.json", import.meta.url), JSON.stringify({ timestamp: new Date().toISOString(), applicationCommit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: new URL("../../../../", import.meta.url), encoding: "utf8" }).trim(), ordersUnchanged: true, otherHubRecordUnchanged: true, hubRestored: true, results }, null, 2) + "\n");
  console.log(`PASS: ${results.length} permission responses; no order changes; hub restored.`);
} finally {
  await prisma.$disconnect();
}
