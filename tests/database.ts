import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { changePost } from '../src/lib/publisher.js';
import { catalog, contentState } from '../src/db/catalog.js';
if (!process.env.PGDATABASE?.endsWith('_test')) throw new Error('Dedicated _test database required.');
const fresh=process.env.PGDATABASE, adopted='dunamismax_adopt_test', restored='dunamismax_restore_test', drifted='dunamismax_drift_test';
const admin=new pg.Client();await admin.connect();
const directory=mkdtempSync(join(tmpdir(),'dunamismax-db-'));
const run=(args: string[],extra: Record<string,string>={}) => spawnSync(process.execPath,['--import','tsx','bin/posts.ts',...args],{env:{...process.env,POSTS_CONFIG:join(directory,'publishing.env'),...extra},encoding:'utf8',input:'Plain <script> & café 🌲\n\nSecond paragraph.'});
const credentials=(user: string,database=fresh) => ({host:process.env.PGHOST ?? '127.0.0.1',port:Number(process.env.PGPORT ?? '5432'),database,user,password:'synthetic-test-password'});
const config=(user: string,database: string) => { const path=join(directory,user+'-'+database+'.env'); const c=credentials(user,database); writeFileSync(path,Object.entries({PGHOST:c.host,PGPORT:String(c.port),PGDATABASE:database,PGUSER:user,PGPASSWORD:c.password}).map(([k,v])=>k+'='+v).join('\n'),{mode:0o600}); return path; };
const schema=(database: string) => spawnSync(process.execPath,['--import','tsx','bin/schema.ts'],{env:{...process.env,MIGRATION_CONFIG:config('dunamismax_migration',database)},encoding:'utf8'});
const superuser=async <T>(database: string,work: (client: pg.Client) => Promise<T>): Promise<T> => { const client=new pg.Client({database});await client.connect();try {return await work(client);} finally {await client.end();} };
// Mirror the host bootstrap: NOINHERIT logins, owner-owned database/schema and owner default privileges in app.
const bootstrap=(database: string) => superuser(database,client => client.query(`ALTER DATABASE ${database} OWNER TO dunamismax_owner; REVOKE ALL ON DATABASE ${database} FROM PUBLIC; GRANT CONNECT ON DATABASE ${database} TO dunamismax_web,dunamismax_publishing,dunamismax_migration;
 REVOKE ALL ON SCHEMA public FROM PUBLIC; CREATE SCHEMA app AUTHORIZATION dunamismax_owner; GRANT USAGE ON SCHEMA app TO dunamismax_web,dunamismax_publishing;
 ALTER DEFAULT PRIVILEGES FOR ROLE dunamismax_owner IN SCHEMA app GRANT SELECT,INSERT,UPDATE ON TABLES TO dunamismax_publishing; ALTER DEFAULT PRIVILEGES FOR ROLE dunamismax_owner IN SCHEMA app GRANT USAGE ON SEQUENCES TO dunamismax_publishing;
 ALTER DEFAULT PRIVILEGES FOR ROLE dunamismax_owner IN SCHEMA app GRANT USAGE ON TYPES TO dunamismax_web,dunamismax_publishing; ALTER DEFAULT PRIVILEGES FOR ROLE dunamismax_owner REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC; ALTER DEFAULT PRIVILEGES FOR ROLE dunamismax_owner REVOKE USAGE ON TYPES FROM PUBLIC`));
const report=(result: ReturnType<typeof schema>) => { assert.equal(result.status,0,result.stderr); return JSON.parse(result.stdout) as {adopted: boolean; migrations: number; rows: number; sha256: string}; };
const journal=(database: string) => superuser(database,async client => (await client.query<{hash: string; created_at: string}>('SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY id')).rows);
const baselineCatalog: unknown=JSON.parse(readFileSync('database/baseline-catalog.json','utf8'));
const [baseline]=readMigrationFiles({migrationsFolder:'drizzle'});
try {
 await admin.query("CREATE ROLE dunamismax_owner NOLOGIN; CREATE ROLE dunamismax_web LOGIN NOINHERIT PASSWORD 'synthetic-test-password'; CREATE ROLE dunamismax_publishing LOGIN NOINHERIT PASSWORD 'synthetic-test-password'; CREATE ROLE dunamismax_migration LOGIN NOINHERIT PASSWORD 'synthetic-test-password'; GRANT dunamismax_owner TO dunamismax_migration");
 for(const database of [adopted,restored,drifted]) await admin.query('CREATE DATABASE '+database);
 for(const database of [fresh,adopted,drifted]) await bootstrap(database);
 await superuser(restored,client => client.query(`ALTER DATABASE ${restored} OWNER TO dunamismax_owner; REVOKE ALL ON DATABASE ${restored} FROM PUBLIC; GRANT CONNECT ON DATABASE ${restored} TO dunamismax_web,dunamismax_publishing,dunamismax_migration; REVOKE ALL ON SCHEMA public FROM PUBLIC`));
 // Fresh installation from reviewed Drizzle migrations; a repeated run is a no-op.
 let result=report(schema(fresh));assert.deepEqual([result.adopted,result.migrations,result.rows],[false,1,0]);
 result=report(schema(fresh));assert.deepEqual([result.adopted,result.migrations,result.rows],[false,1,0]);
 assert.deepEqual(await superuser(fresh,catalog),baselineCatalog,'fresh schema matches the production baseline catalog');
 assert.deepEqual(await journal(fresh),[{hash:baseline!.hash,created_at:String(baseline!.folderMillis)}]);
 // Pre-Drizzle database: legacy additive schema, nonempty import with stable IDs/Unicode/UTC, overwrite refusal.
 const legacy=readFileSync('tests/legacy-schema.sql','utf8');
 await superuser(adopted,async client => {await client.query(legacy);await client.query(legacy);});
 const source=join(directory,'migration.json');
 const rows=[{id:'42',slug:'import-public',title:'café 🌲 & <literal>',excerpt:'é',body:'First\r\n\r\nSecond',status:'published',published_at:'2026-01-02 03:04:05',created_at:'2025-12-01 00:00:00',updated_at:'2026-01-03 04:05:06'},{id:'500',slug:'import-draft',title:'Draft',excerpt:'',body:'PRIVATE',status:'draft',published_at:null,created_at:'2026-01-01 00:00:00',updated_at:'2026-01-01 00:00:00'}];
 writeFileSync(source,JSON.stringify(rows),{mode:0o600});
 const migrate=(mode:string) => spawnSync(process.execPath,['--import','tsx','bin/migrate-data.ts',mode,source],{env:{...process.env,MIGRATION_CONFIG:config('dunamismax_migration',adopted)},encoding:'utf8'});
 for(const mode of ['import','import','reconcile']) {const imported=migrate(mode);assert.equal(imported.status,0,imported.stderr);}
 rows[0]!.title='Changed';writeFileSync(source,JSON.stringify(rows));assert.notEqual(migrate('import').status,0);assert.notEqual(migrate('reconcile').status,0);
 await superuser(adopted,client => client.query("INSERT INTO app.posts (slug,title,body,status,published_at,created_at,updated_at) VALUES ('precise','Precise','Body','published','2026-03-04 05:06:07.123456+00','2026-03-04 05:06:07.654321+00','2026-03-04 05:06:07.000001+00')"));
 assert.deepEqual(await superuser(adopted,catalog),baselineCatalog,'legacy fixture reproduces the production baseline catalog');
 const before=await superuser(adopted,contentState);assert.equal(before.rows,3);assert.equal(before.sequence,'501:called');
 // Restore a backup of the populated pre-Drizzle database (schema, ACLs, default privileges, data) and adopt it too.
 const dump=join(directory,'pre-drizzle.dump'),pgbin=(name: string) => join(process.env.PGBIN ?? '',name);
 for(const [command,...args] of [[pgbin('pg_dump'),'-Fc','-f',dump,adopted],[pgbin('pg_restore'),'--exit-on-error','-d',restored,dump]] as const) {const step=spawnSync(command,args,{encoding:'utf8'});assert.equal(step.status,0,step.stderr);}
 assert.deepEqual(await superuser(restored,catalog),baselineCatalog,'restored backup reproduces the production baseline catalog');
 assert.deepEqual(await superuser(restored,contentState),before);
 result=report(schema(restored));assert.deepEqual([result.adopted,result.migrations,result.sha256],[true,1,before.sha256]);
 assert.deepEqual(await superuser(restored,contentState),before);
 // Adoption records the baseline without replaying CREATE; data, IDs, sequence and full-precision instants are unchanged.
 result=report(schema(adopted));assert.deepEqual([result.adopted,result.migrations,result.rows,result.sha256],[true,1,3,before.sha256]);
 result=report(schema(adopted));assert.deepEqual([result.adopted,result.migrations,result.sha256],[false,1,before.sha256]);
 assert.deepEqual(await superuser(adopted,contentState),before);
 assert.deepEqual(await superuser(adopted,catalog),baselineCatalog);
 assert.deepEqual(await journal(adopted),await journal(fresh));
 assert.equal((await superuser(adopted,client => client.query("SELECT nextval('app.posts_id_seq') AS next"))).rows[0].next,'502');
 // A schema that differs in any reviewed respect is refused before any journal entry is recorded.
 await superuser(drifted,async client => {await client.query(legacy);await client.query('GRANT DELETE ON app.posts TO dunamismax_publishing');});
 const refused=schema(drifted);assert.notEqual(refused.status,0);assert.match(refused.stderr,/differs from the reviewed baseline/);
 assert.equal((await superuser(drifted,client => client.query("SELECT to_regnamespace('drizzle') AS journal"))).rows[0].journal,null);
 const publisherClient=new pg.Client(credentials('dunamismax_publishing'));const web=new pg.Client(credentials('dunamismax_web'));
 await publisherClient.connect();await web.connect();
 const publisher=drizzle(publisherClient);
 // Website reads go through the Drizzle view queries with the read-only role.
 Object.assign(process.env,{PGUSER:'dunamismax_web',PGPASSWORD:'synthetic-test-password',PGDATABASE:fresh});
 const { posts }=await import('../src/lib/posts.js');const { closeWebsiteDatabase }=await import('../src/db/web.js');
 try {
  for(let i=0;i<25;i++) {await changePost(publisher,'create','synthetic-public-'+i,{title:'Public '+i,body:'Public plain text '+i,excerpt:'Excerpt '+i});await changePost(publisher,'publish','synthetic-public-'+i);}
  await changePost(publisher,'create','synthetic-draft',{title:'Private draft',body:'DRAFT-PRIVATE-SENTINEL'});
  await changePost(publisher,'create','synthetic-future',{title:'Private future',body:'FUTURE-PRIVATE-SENTINEL'});await changePost(publisher,'schedule','synthetic-future',{},'2099-01-01T00:00:00Z');
  assert.equal((await web.query('SELECT * FROM app.public_posts')).rows.length,25);
  assert.equal(await posts.count(),25);
  const latest=await posts.latest(10,20);assert.deepEqual(latest.map(p => p.slug),['synthetic-public-4','synthetic-public-3','synthetic-public-2','synthetic-public-1','synthetic-public-0']);assert.ok(latest[0]!.published_at instanceof Date);
  assert.equal(await posts.find("synthetic-draft' OR 1=1 --"),null);assert.equal(await posts.find('synthetic-future'),null);assert.equal((await posts.find('synthetic-public-7'))?.title,'Public 7');
  for(const sql of ['SELECT * FROM app.posts',"INSERT INTO app.posts(slug,title,body) VALUES ('attack','Attack','x')",'DELETE FROM app.posts','TRUNCATE app.posts','CREATE TABLE app.attack(id int)','SET ROLE dunamismax_owner','SELECT * FROM drizzle.__drizzle_migrations','CREATE TABLE drizzle.attack(id int)']) await assert.rejects(web.query(sql),sql);
  await web.query('SET default_transaction_read_only=off');await assert.rejects(web.query("UPDATE app.posts SET title='attack'"));
  for(const sql of ['DELETE FROM app.posts','TRUNCATE app.posts','CREATE TABLE app.attack(id int)','SET ROLE dunamismax_owner','SELECT * FROM drizzle.__drizzle_migrations','DELETE FROM drizzle.__drizzle_migrations','CREATE TABLE drizzle.attack(id int)']) await assert.rejects(publisherClient.query(sql),sql);
  writeFileSync(join(directory,'publishing.env'),readFileSync(config('dunamismax_publishing',fresh)),{mode:0o600});
  let cli=run(['create','cli-lifecycle','--title','CLI café 🌲','--body-file','-']);assert.equal(cli.status,0,cli.stderr);
  for(const args of [['validate','cli-lifecycle'],['edit','cli-lifecycle','--excerpt','Edited'],['schedule','cli-lifecycle','--at','2099-01-01T00:00:00Z'],['show','cli-lifecycle'],['publish','cli-lifecycle'],['unpublish','cli-lifecycle']]) {cli=run(args);assert.equal(cli.status,0,cli.stderr);}
  const shown=JSON.parse(run(['show','cli-lifecycle']).stdout);assert.equal(typeof shown.id,'string');assert.equal(shown.state,'draft');assert.equal(JSON.parse(run(['list','--limit','1']).stdout)[0].slug,'cli-lifecycle');
  const stored=(await publisherClient.query('SELECT * FROM app.posts WHERE slug=$1',['cli-lifecycle'])).rows[0];assert.equal(stored.status,'draft');assert.ok(stored.published_at);assert.equal(stored.excerpt,'Edited');assert.equal(stored.body,'Plain <script> & café 🌲\n\nSecond paragraph.');
  const before=stored.updated_at;assert.equal(run(['validate','cli-lifecycle','--title','Unwritten']).status,0);assert.deepEqual((await publisherClient.query('SELECT updated_at FROM app.posts WHERE slug=$1',['cli-lifecycle'])).rows[0].updated_at,before);
  for(const args of [['edit','cli-lifecycle'],['edit','cli-lifecycle','--status','published'],['list','--limit','0'],['list','--limit','1','--limit','2'],['schedule','cli-lifecycle','--at','2000-01-01T00:00:00Z'],['edit','missing-post','--title','Missing']]) assert.notEqual(run(args).status,0,args.join(' '));
  // Database errors never echo SQL parameters (post bodies) to the terminal.
  const duplicate=run(['create','cli-lifecycle','--title','duplicate','--body-file','-']);assert.notEqual(duplicate.status,0);assert.ok(!duplicate.stderr.includes('Plain <script>')&&!duplicate.stderr.includes('insert'),duplicate.stderr);
  chmodSync(join(directory,'publishing.env'),0o640);assert.notEqual(run(['list']).status,0);chmodSync(join(directory,'publishing.env'),0o600);
  assert.equal(run(['--help'],{POSTS_CONFIG:'/missing-config'}).status,0);assert.notEqual(run(['list'],{POSTS_CONFIG:'/missing-config'}).status,0);
  // Edits and unpublish never round-trip stored instants through JavaScript dates.
  await publisherClient.query("UPDATE app.posts SET published_at='2026-05-06 07:08:09.123456+00' WHERE slug='cli-lifecycle'");
  for(const args of [['edit','cli-lifecycle','--title','Precise'],['unpublish','cli-lifecycle']]) assert.equal(run(args).status,0);
  assert.equal((await publisherClient.query("SELECT published_at = '2026-05-06 07:08:09.123456+00' AS same FROM app.posts WHERE slug='cli-lifecycle'")).rows[0].same,true);
  // Scheduling advances without rebuilding or a scheduler; unpublish is immediate on count/detail/list.
  await changePost(publisher,'create','clock-transition',{title:'Clock',body:'Clock body'});
  await publisherClient.query("UPDATE app.posts SET status='published',published_at=clock_timestamp()+interval '1 second' WHERE slug='clock-transition'");
  assert.equal(await posts.find('clock-transition'),null);assert.equal(await posts.count(),25);
  await publisherClient.query('SELECT pg_sleep(1.1)');assert.equal((await posts.find('clock-transition'))?.slug,'clock-transition');assert.equal(await posts.count(),26);assert.equal((await posts.latest(1))[0]?.slug,'clock-transition');
  await changePost(publisher,'unpublish','clock-transition');
  assert.equal(await posts.find('clock-transition'),null);assert.equal(await posts.count(),25);assert.notEqual((await posts.latest(1))[0]?.slug,'clock-transition');
  console.log('Passed PostgreSQL fresh/adopted/restored Drizzle schema, drift refusal, journal privacy, privilege, visibility, scheduling, binding and CLI lifecycle checks.');
 } finally {await closeWebsiteDatabase();await publisherClient.end();await web.end();}
} finally {await admin.end();rmSync(directory,{recursive:true});}
