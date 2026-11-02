import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { protectedEnv } from '../src/lib/credentials.js';
import { operatorConnection, safeMessage } from '../src/db/operator.js';
import { catalog, contentState } from '../src/db/catalog.js';
// Operator-only: applies reviewed drizzle/ migrations as dunamismax_owner under the deployment lock.
// A pre-Drizzle database is adopted only when its catalog exactly matches the reviewed baseline.
const folder = 'drizzle', journal = { migrationsFolder: folder, migrationsSchema: 'drizzle', migrationsTable: '__drizzle_migrations' };
let connection: Awaited<ReturnType<typeof operatorConnection>> | undefined;
try {
  connection = await operatorConnection(protectedEnv(process.env.MIGRATION_CONFIG ?? '/etc/astro-apps/dunamismax/migration.env'), 'dunamismax_migration');
  const { client, db } = connection;
  await client.query('SET ROLE dunamismax_owner');
  await client.query("SELECT pg_advisory_lock(hashtext('dunamismax.com schema migrations'))");
  const migrations = readMigrationFiles({ migrationsFolder: folder });
  const baseline = migrations[0];
  if (!baseline) throw new Error('No reviewed migrations found.');
  await client.query('BEGIN');
  let adopted = false, before: Awaited<ReturnType<typeof contentState>> | null = null;
  try {
    // The journal lives outside schema app so app default privileges never reach it.
    await client.query('CREATE SCHEMA IF NOT EXISTS drizzle');
    await client.query('REVOKE ALL ON SCHEMA drizzle FROM PUBLIC');
    await client.query('CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)');
    const recorded = Number((await client.query<{ count: string }>('SELECT count(*) FROM drizzle.__drizzle_migrations')).rows[0]!.count);
    const existing = (await client.query<{ posts: string | null }>("SELECT to_regclass('app.posts')::text AS posts")).rows[0]!.posts !== null;
    if (existing) {
      await client.query('LOCK TABLE app.posts IN SHARE MODE');
      before = await contentState(client);
    }
    if (!recorded && existing) {
      const expected: unknown = JSON.parse(readFileSync('database/baseline-catalog.json', 'utf8'));
      if (!isDeepStrictEqual(await catalog(client), expected)) throw new Error('Existing schema differs from the reviewed baseline; refusing adoption.');
      await client.query('INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)', [baseline.hash, baseline.folderMillis]);
      adopted = true;
    }
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  await migrate(db, journal);
  const applied = Number((await client.query<{ count: string }>('SELECT count(*) FROM drizzle.__drizzle_migrations')).rows[0]!.count);
  if (applied !== migrations.length) throw new Error('Migration journal does not match the reviewed migrations.');
  const after = await contentState(client);
  // Schema migrations must never rewrite, drop or renumber authoritative posts.
  if (before && !isDeepStrictEqual(before, after)) throw new Error('Post content or identity changed during migration.');
  console.log(JSON.stringify({ operation: 'schema', adopted, migrations: applied, available: migrations.length, rows: after.rows, sha256: after.sha256 }));
} catch (error) {
  console.error('Schema migration failed: ' + safeMessage(error, 'database error; no credentials or content logged.'));
  process.exitCode = 1;
} finally { await connection?.client.end(); }
