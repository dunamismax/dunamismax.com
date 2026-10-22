import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';
import mysql from 'mysql2/promise';
import pg from 'pg';
import { protectedEnv, pgConfig } from '../src/lib/credentials.js';
type RecordRow = { id: string; slug: string; title: string; excerpt: string; body: string; status: string; published_at: string | null; created_at: string; updated_at: string };
const fields = ['id','slug','title','excerpt','body','status','published_at','created_at','updated_at'] as const;
export function digest(rows: RecordRow[]): string { return createHash('sha256').update(JSON.stringify(rows.map(r => fields.map(f => r[f])))).digest('hex'); }
async function source(): Promise<RecordRow[]> {
  // Read only this known legacy file. Never inherit MySQL credentials or log rows.
  const env = process.env.MYSQL_CONFIG ? protectedEnv(process.env.MYSQL_CONFIG) : parseEnv(readFileSync('/etc/dunamismax/site.env','utf8'));
  const db = await mysql.createConnection({ host: env.DB_HOST ?? '127.0.0.1', port:Number(env.DB_PORT ?? '3306'), database:env.DB_NAME!, user:env.DB_USER!, password:env.DB_PASSWORD!, dateStrings:true, supportBigNumbers:true, bigNumberStrings:true, charset:'utf8mb4' });
  try { await db.query("SET time_zone = '+00:00'"); await db.query('SET TRANSACTION READ ONLY'); await db.beginTransaction(); const [rows] = await db.query('SELECT id,slug,title,excerpt,body,status,published_at,created_at,updated_at FROM posts ORDER BY id'); await db.commit(); return rows as RecordRow[]; } finally { await db.end(); }
}
function parseRows(path: string): RecordRow[] {
  const input: unknown = JSON.parse(readFileSync(path,'utf8'));
  if (!Array.isArray(input)) throw new Error('Invalid migration snapshot');
  for (const row of input) {
    if (typeof row !== 'object' || row === null || fields.some(f => f === 'published_at' ? row[f] !== null && typeof row[f] !== 'string' : typeof row[f] !== 'string') || !/^[1-9][0-9]*$/.test(row.id) || !['draft','published'].includes(row.status)) throw new Error('Invalid migration record');
  }
  return input as RecordRow[];
}
async function target(client: pg.Client): Promise<RecordRow[]> {
  const columns = fields.map(f => ['published_at','created_at','updated_at'].includes(f) ? `CASE WHEN date_trunc('second',${f})=${f} THEN to_char(${f} AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI:SS') ELSE to_char(${f} AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI:SS.US') END AS ${f}` : f === 'id' ? 'id::text' : f).join(',');
  return (await client.query<RecordRow>('SELECT ' + columns + ' FROM app.posts ORDER BY id')).rows;
}
async function main() {
 const [mode,path] = process.argv.slice(2);
 if (!mode || !['export','import','reconcile'].includes(mode) || !path || !path.startsWith('/')) throw new Error('Usage: migrate-data.ts export|import|reconcile /absolute/private/snapshot.json');
 if (mode === 'export') { const rows = await source(); writeFileSync(path,JSON.stringify(rows),{ mode:0o600, flag:'wx' }); console.log(JSON.stringify({operation:'export',rows:rows.length,sha256:digest(rows)})); return; }
 const rows = parseRows(path);
 const env = protectedEnv(process.env.MIGRATION_CONFIG ?? '/etc/astro-apps/dunamismax/migration.env');
 const client = new pg.Client(pgConfig(env,'dunamismax_migration'));
 try {
  await client.connect();
  await client.query('SET ROLE dunamismax_owner');
  if (mode === 'import') {
   await client.query('BEGIN');
   try {
    await client.query('SET LOCAL ROLE dunamismax_owner');
    await client.query('LOCK TABLE app.posts IN ACCESS EXCLUSIVE MODE');
    const existing = await target(client);
    if (existing.length && digest(existing) !== digest(rows)) throw new Error('Destination is nonempty and differs; refusing overwrite. Reconcile writers deliberately.');
    if (!existing.length) {
     for (const row of rows) await client.query('INSERT INTO app.posts (' + fields.join(',') + ') VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',fields.map(f => ['published_at','created_at','updated_at'].includes(f) && row[f] ? row[f] + '+00' : row[f]));
     await client.query("SELECT setval('app.posts_id_seq', COALESCE((SELECT max(id)+1 FROM app.posts),1), false)");
    }
    const migrated = await target(client);
    if (digest(rows) !== digest(migrated)) throw new Error('Migration content digest mismatch');
    await client.query('COMMIT');
   } catch(error) { await client.query('ROLLBACK'); throw error; }
  } else await client.query('SET ROLE dunamismax_owner');
  const migrated = await target(client);
  if (rows.length !== migrated.length || digest(rows) !== digest(migrated)) throw new Error('Reconciliation failed');
  console.log(JSON.stringify({operation:mode,rows:rows.length,sha256:digest(migrated),verified:true}));
 } finally { await client.end(); }
}
if (process.argv[1]?.endsWith('migrate-data.ts') || process.argv[1]?.endsWith('migrate-data.js')) main().catch((error: unknown) => { const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'validation'; console.error('Migration failed (' + code + '); no credentials or post bodies logged.');process.exitCode=1;});
