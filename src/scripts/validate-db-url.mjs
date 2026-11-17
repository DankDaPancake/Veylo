export function validateDatabaseUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('DATABASE_URL is required. Copy .env.example to .env and configure your local database.');
  }
  let url;
  try { url = new URL(value); } catch { /* Report a fixed message without the raw URL. */ }
  if (!url || !['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length < 2) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL with a host and database name.');
  }
  return value;
}
