import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../lib/auth/password.mjs";

test("password hashes round-trip, use independent salts, and reject wrong passwords", async () => {
  const password = "synthetic-demo-password";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.match(first, /^scrypt\$v1\$[\w-]{22}\$[\w-]{86}$/);
  assert.notEqual(first.split("$")[2], second.split("$")[2]);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("wrong-password", first), false);
});

test("malformed and unknown stored hash versions are rejected", async () => {
  const stored = await hashPassword("synthetic-demo-password");
  for (const invalid of ["", stored + "$extra", stored.slice(0, -1), stored.replace("$v1$", "$v2$"), stored.replace("$v1$", "$v1$=")]) {
    assert.equal(await verifyPassword("synthetic-demo-password", invalid), false);
  }
});
