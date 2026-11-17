import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDatabaseUrl } from '../scripts/validate-db-url.mjs';

test('rejects absent and blank configuration', () => {
  for (const value of [undefined, '', '   ']) assert.throws(() => validateDatabaseUrl(value), /DATABASE_URL is required/);
});
test('rejects malformed, wrong protocol and missing database URLs without leaking credentials', () => {
  const secret = 'do-not-print-this-password';
  for (const value of [`broken:${secret}`, `https://user:${secret}@localhost/db`, `postgresql://user:${secret}@localhost/`]) {
    assert.throws(() => validateDatabaseUrl(value), error => {
      assert.match(error.message, /valid PostgreSQL URL/);
      assert.ok(!error.message.includes(secret));
      assert.ok(!error.message.includes(value));
      return true;
    });
  }
});
test('accepts both PostgreSQL URL schemes and preserves query configuration', () => {
  for (const scheme of ['postgresql', 'postgres']) {
    const value = `${scheme}://veylo:local@127.0.0.1:54339/veylo?schema=public`;
    assert.equal(validateDatabaseUrl(value), value);
  }
});
