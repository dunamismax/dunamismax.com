import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import { websiteDatabase } from '../db/web.js';
// The release's commit: deploy/build.sh writes REVISION into the release, which is the
// service's working directory. A checkout or dev server has none.
function readRevision(): string {
  try { return readFileSync(join(process.cwd(), 'REVISION'), 'utf8').trim() || 'unrecorded'; } catch { return 'unrecorded'; }
}
export const revision = readRevision();
// Readiness for the deploy's candidate check and for monitoring: one real query through the
// website pool as the web role; 503 when PostgreSQL cannot answer. Never echoes the error.
export async function health(): Promise<{ status: 200 | 503; body: string }> {
  try {
    const db = websiteDatabase();
    if (!db) return { status: 200, body: JSON.stringify({ status: 'ok', revision }) };
    await db.execute(sql`select 1`);
    return { status: 200, body: JSON.stringify({ status: 'ok', revision, database: 'ok' }) };
  } catch {
    console.error('Health check: PostgreSQL unavailable');
    return { status: 503, body: JSON.stringify({ status: 'unavailable', revision, database: 'unavailable' }) };
  }
}
