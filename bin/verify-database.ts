import assert from 'node:assert/strict';
import pg from 'pg';
import { protectedEnv, pgConfig } from '../src/lib/credentials.js';
async function denied(client: pg.Client, sql: string): Promise<void> {
  await client.query('BEGIN');
  try { await client.query('SET TRANSACTION READ WRITE'); await assert.rejects(client.query(sql), (error: unknown) => !!error && typeof error === 'object' && 'code' in error && error.code === '42501'); }
  finally { await client.query('ROLLBACK'); }
}
async function main() {
  const web=new pg.Client(pgConfig(protectedEnv('/etc/astro-apps/dunamismax/web.env'),'dunamismax_web'));
  const publisher=new pg.Client(pgConfig(protectedEnv('/etc/astro-apps/dunamismax/publishing.env'),'dunamismax_publishing'));
  try {
    await web.connect();await publisher.connect();
    await web.query('SELECT count(*) FROM app.public_posts');
    for(const sql of ['SELECT * FROM app.posts LIMIT 0', 'UPDATE app.posts SET title=title WHERE false', 'DELETE FROM app.posts WHERE false', 'SET ROLE dunamismax_publishing', 'CREATE TABLE app.permission_probe(id integer)']) await denied(web,sql);
    await publisher.query('SELECT count(*) FROM app.posts');
    for(const sql of ['DELETE FROM app.posts WHERE false','CREATE TABLE app.permission_probe(id integer)','SET ROLE dunamismax_owner']) await denied(publisher,sql);
    const privileges=(await publisher.query<{can_insert:boolean;can_update:boolean}>("SELECT has_table_privilege(current_user,'app.posts','INSERT') AS can_insert,has_table_privilege(current_user,'app.posts','UPDATE') AS can_update")).rows[0]!;
    assert.ok(privileges.can_insert&&privileges.can_update);
    console.log('Production roles verified: public-view-only web; independent bounded publisher.');
  } finally {await web.end();await publisher.end();}
}
main().catch(() => {console.error('Production privilege verification failed; no credentials or content logged.');process.exitCode=1;});
