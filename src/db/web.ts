import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
// Read-only website connection: lazy, bounded, deadline-limited; credentials come from web.env.
let pool: pg.Pool | undefined;
let database: NodePgDatabase | undefined;
export function websiteDatabase(): NodePgDatabase | null {
  if (!process.env.PGDATABASE) {
    if (process.env.APP_ENV === 'local' || process.env.APP_ENV === 'test') return null;
    throw new Error('Website PostgreSQL configuration missing');
  }
  if (!pool) { pool = new pg.Pool({ max: 4, connectionTimeoutMillis: 2000, idleTimeoutMillis: 10000, statement_timeout: 5000, application_name: 'dunamismax-web' });
  pool.on('error', () => console.error('PostgreSQL connection unavailable')); }
  database ??= drizzle(pool);
  return database;
}
export async function closeWebsiteDatabase(): Promise<void> { await pool?.end(); pool = undefined; database = undefined; }
