import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { validateDatabaseUrl } from './validate-db-url.mjs';

try {
  validateDatabaseUrl(process.env.DATABASE_URL);
  const require = createRequire(import.meta.url);
  const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'execute', '--file', 'prisma/check.sql'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, CHECKPOINT_DISABLE: '1' },
    encoding: 'utf8', timeout: 20_000, windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    // Prisma may include the connection string in diagnostics. Never forward raw output.
    console.error('Database check failed. Verify the server, port, database and credentials in your local .env. No schema changes were requested.');
    process.exitCode = 1;
  } else {
    console.log('PostgreSQL connection verified through Prisma (SELECT 1). No schema changes were requested.');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Database configuration is invalid.');
  process.exitCode = 1;
}
