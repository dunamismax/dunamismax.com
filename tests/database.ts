import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { changePost } from '../src/lib/publisher.js';
if (!process.env.PGDATABASE?.endsWith('_test')) throw new Error('Dedicated _test database required.');
const admin=new pg.Client();await admin.connect();
const directory=mkdtempSync(join(tmpdir(),'dunamismax-db-'));
const run=(args: string[],extra: Record<string,string>={}) => spawnSync(process.execPath,['--import','tsx','bin/posts.ts',...args],{env:{...process.env,POSTS_CONFIG:join(directory,'publishing.env'),...extra},encoding:'utf8',input:'Plain <script> & café 🌲\n\nSecond paragraph.'});
const credentials=(user: string) => ({host:process.env.PGHOST ?? '127.0.0.1',port:Number(process.env.PGPORT ?? '5432'),database:process.env.PGDATABASE!,user,password:'synthetic-test-password'});
try {
 await admin.query("CREATE ROLE dunamismax_owner NOLOGIN; CREATE ROLE dunamismax_web LOGIN PASSWORD 'synthetic-test-password'; CREATE ROLE dunamismax_publishing LOGIN PASSWORD 'synthetic-test-password'; CREATE ROLE dunamismax_migration LOGIN NOINHERIT PASSWORD 'synthetic-test-password'; GRANT dunamismax_owner TO dunamismax_migration; CREATE SCHEMA app AUTHORIZATION dunamismax_owner; REVOKE ALL ON SCHEMA public FROM PUBLIC; GRANT USAGE ON SCHEMA app TO dunamismax_web,dunamismax_publishing");
 await admin.query(readFileSync('database/schema.sql','utf8'));
 await admin.query(readFileSync('database/schema.sql','utf8'));
 // Rehearse nonempty import, stable IDs/Unicode/UTC, idempotence and overwrite refusal.
 const migrationConfig=join(directory,'migration.env');
 writeFileSync(migrationConfig,Object.entries({PGHOST:credentials('').host,PGPORT:String(credentials('').port),PGDATABASE:process.env.PGDATABASE!,PGUSER:'dunamismax_migration',PGPASSWORD:'synthetic-test-password'}).map(([k,v])=>k+'='+v).join('\n'),{mode:0o600});
 const source=join(directory,'migration.json');
 const rows=[{id:'42',slug:'import-public',title:'café 🌲 & <literal>',excerpt:'é',body:'First\r\n\r\nSecond',status:'published',published_at:'2026-01-02 03:04:05',created_at:'2025-12-01 00:00:00',updated_at:'2026-01-03 04:05:06'},{id:'500',slug:'import-draft',title:'Draft',excerpt:'',body:'PRIVATE',status:'draft',published_at:null,created_at:'2026-01-01 00:00:00',updated_at:'2026-01-01 00:00:00'}];
 writeFileSync(source,JSON.stringify(rows),{mode:0o600});
 const migrate=(mode:string) => spawnSync(process.execPath,['--import','tsx','bin/migrate-data.ts',mode,source],{env:{...process.env,MIGRATION_CONFIG:migrationConfig},encoding:'utf8'});
 for(const mode of ['import','import','reconcile']) {const result=migrate(mode);assert.equal(result.status,0,result.stderr);}
 assert.equal((await admin.query("SELECT nextval('app.posts_id_seq') AS next")).rows[0].next,'501');
 rows[0]!.title='Changed';writeFileSync(source,JSON.stringify(rows));assert.notEqual(migrate('import').status,0);assert.notEqual(migrate('reconcile').status,0);
 await admin.query('TRUNCATE app.posts RESTART IDENTITY');
 const publisher=new pg.Client(credentials('dunamismax_publishing'));const web=new pg.Client(credentials('dunamismax_web'));
 await publisher.connect();await web.connect();
 try {
  for(let i=0;i<25;i++) {await changePost(publisher,'create','synthetic-public-'+i,{title:'Public '+i,body:'Public plain text '+i,excerpt:'Excerpt '+i});await changePost(publisher,'publish','synthetic-public-'+i);}
  await changePost(publisher,'create','synthetic-draft',{title:'Private draft',body:'DRAFT-PRIVATE-SENTINEL'});
  await changePost(publisher,'create','synthetic-future',{title:'Private future',body:'FUTURE-PRIVATE-SENTINEL'});await changePost(publisher,'schedule','synthetic-future',{},'2099-01-01T00:00:00Z');
  assert.equal((await web.query('SELECT * FROM app.public_posts')).rows.length,25);
  assert.equal((await web.query('SELECT * FROM app.public_posts WHERE slug = $1',["synthetic-draft' OR 1=1 --"])).rows.length,0);
  for(const sql of ['SELECT * FROM app.posts',"INSERT INTO app.posts(slug,title,body) VALUES ('attack','Attack','x')",'DELETE FROM app.posts','TRUNCATE app.posts','CREATE TABLE app.attack(id int)','SET ROLE dunamismax_owner']) await assert.rejects(web.query(sql));
  await web.query('SET default_transaction_read_only=off');await assert.rejects(web.query("UPDATE app.posts SET title='attack'"));
  for(const sql of ['DELETE FROM app.posts','TRUNCATE app.posts','CREATE TABLE app.attack(id int)','SET ROLE dunamismax_owner']) await assert.rejects(publisher.query(sql));
  writeFileSync(join(directory,'publishing.env'),Object.entries({PGHOST:credentials('').host,PGPORT:String(credentials('').port),PGDATABASE:process.env.PGDATABASE!,PGUSER:'dunamismax_publishing',PGPASSWORD:'synthetic-test-password'}).map(([k,v])=>k+'='+v).join('\n'),{mode:0o600});
  let result=run(['create','cli-lifecycle','--title','CLI café 🌲','--body-file','-']);assert.equal(result.status,0,result.stderr);
  for(const args of [['validate','cli-lifecycle'],['edit','cli-lifecycle','--excerpt','Edited'],['schedule','cli-lifecycle','--at','2099-01-01T00:00:00Z'],['show','cli-lifecycle'],['publish','cli-lifecycle'],['unpublish','cli-lifecycle']]) {result=run(args);assert.equal(result.status,0,result.stderr);}
  const cli=(await publisher.query('SELECT * FROM app.posts WHERE slug=$1',['cli-lifecycle'])).rows[0];assert.equal(cli.status,'draft');assert.ok(cli.published_at);assert.equal(cli.excerpt,'Edited');assert.equal(cli.body,'Plain <script> & café 🌲\n\nSecond paragraph.');
  const before=cli.updated_at;assert.equal(run(['validate','cli-lifecycle','--title','Unwritten']).status,0);assert.deepEqual((await publisher.query('SELECT updated_at FROM app.posts WHERE slug=$1',['cli-lifecycle'])).rows[0].updated_at,before);
  for(const args of [['edit','cli-lifecycle'],['edit','cli-lifecycle','--status','published'],['list','--limit','0'],['list','--limit','1','--limit','2'],['schedule','cli-lifecycle','--at','2000-01-01T00:00:00Z'],['create','cli-lifecycle','--title','duplicate','--body-file','-']]) assert.notEqual(run(args).status,0,args.join(' '));
  chmodSync(join(directory,'publishing.env'),0o640);assert.notEqual(run(['list']).status,0);chmodSync(join(directory,'publishing.env'),0o600);
  assert.equal(run(['--help'],{POSTS_CONFIG:'/missing-config'}).status,0);assert.notEqual(run(['list'],{POSTS_CONFIG:'/missing-config'}).status,0);
  // Scheduling advances without rebuilding or a scheduler. Use the database clock.
  await changePost(publisher,'create','clock-transition',{title:'Clock',body:'Clock body'});
  await publisher.query("UPDATE app.posts SET status='published',published_at=clock_timestamp()+interval '1 second' WHERE slug='clock-transition'");
  assert.equal((await web.query("SELECT * FROM app.public_posts WHERE slug='clock-transition'")).rowCount,0);
  await publisher.query('SELECT pg_sleep(1.1)');assert.equal((await web.query("SELECT * FROM app.public_posts WHERE slug='clock-transition'")).rowCount,1);
  await changePost(publisher,'unpublish','clock-transition');
  console.log('Passed PostgreSQL privilege, visibility, scheduling, binding, schema and CLI lifecycle checks.');
 } finally {await publisher.end();await web.end();}
} finally {await admin.end();rmSync(directory,{recursive:true});}
