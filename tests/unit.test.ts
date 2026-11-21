import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { paragraphs, readingMinutes, shortDate, xml } from '../src/lib/text.js';
import { validatePost, validateSlug, timestamp, BODY_BYTES, SLUG_PATTERN } from '../src/lib/validation.js';
import { allProjects, featuredProjects, projectGroups } from '../src/lib/projects.js';
import { ALLOW_HEADER, SECURITY_HEADERS, readOnlyMethod } from '../src/lib/http.js';
import { configuration } from '../src/lib/config.js';
import { protectedEnv } from '../src/lib/credentials.js';
import { rss } from '../src/lib/rss.js';
const post = {slug:'synthetic-test',title:'Synthetic title',excerpt:'',body:'Synthetic body.',status:'draft',published_at:null};
test('plain text escaping and Unicode reading time', () => {
 assert.equal(paragraphs('First\r\n\r\nSecond'),'<p>First</p>\n<p>Second</p>');
 assert.equal(paragraphs('# Heading\n*emphasis*'),'<p># Heading<br>\n*emphasis*</p>');
 assert.equal(paragraphs('<script>"&'),'<p>&lt;script&gt;&quot;&amp;</p>');
 assert.equal(readingMinutes('word '.repeat(221)),2);assert.equal(readingMinutes('café'),1);
});
test('explicit timezone and calendar validation', () => {
 assert.equal(timestamp('2099-10-01T09:00:00-04:00').toISOString(),'2099-10-01T13:00:00.000Z');
 assert.equal(timestamp('2099-10-01T09:00:00+14:00').toISOString(),'2099-09-30T19:00:00.000Z');
 for(const value of ['tomorrow','2099-01-01 10:00:00','2099-01-01T10:00:00','2099-02-29T00:00:00Z','2099-04-31T00:00:00Z','2099-01-01T24:00:00Z','2099-01-01T00:00:60Z','2099-01-01T00:00:00-00:00','2099-01-01T00:00:00+14:01','1000-01-01T00:00:00+01:00','9999-12-31T23:59:59-01:00']) assert.throws(() => timestamp(value),value);
});
test('post limits count Unicode and reject invalid content', () => {
 validatePost(post);validatePost({...post,title:'é'.repeat(240),excerpt:'🌲'.repeat(600)});
 for(const [key,value] of [['title',''],['body',' \n\t\u00a0'],['slug','Upper'],['slug','a--b'],['slug','a'.repeat(181)],['title','é'.repeat(241)],['excerpt','🌲'.repeat(601)],['body','x'.repeat(BODY_BYTES+1)],['body','x\0'],['body','x\uFFFF'],['title','\uD800'],['status','scheduled'],['status','published']]) assert.throws(() => validatePost({...post,[key as string]:value}));
});
test('canonical configuration ignores untrusted origins', () => {
 for(const env of [{APP_ENV:'staging'},{APP_URL:'https://example.com/subdir'},{APP_URL:'http://example.com'},{APP_URL:'https://user:password@example.com'}]) assert.throws(() => configuration(env));
 assert.equal(configuration({}).origin,'https://dunamismax.com');
});
test('publishing credential boundary', () => {
 const dir = mkdtempSync(join(tmpdir(),'dunamismax-config-'));const path=join(dir,'publishing.env');
 try {writeFileSync(path,"PGPASSWORD='literal # dollar $HOME'\n",{mode:0o600});assert.equal(protectedEnv(path).PGPASSWORD,'literal # dollar $HOME');chmodSync(path,0o640);assert.throws(() => protectedEnv(path));assert.throws(() => protectedEnv('relative.env'));} finally {rmSync(dir,{recursive:true});}
});
test('RSS layers keep stored markup literal and XML valid', () => {
 const xml=rss([{...post,title:'A & <B> — café 🌲\x01\uFFFF',excerpt:'<img src=x onerror=alert(1)> & café',body:'First <b>para</b>.\n\nSecond.',published_at:new Date('2026-01-02T03:04:05Z')}]);
 assert.match(xml,/A &amp; &lt;B&gt; — café 🌲��/);assert.match(xml,/&amp;lt;img/);assert.match(xml,/&lt;p&gt;First &amp;lt;b&amp;gt;para/);assert.match(xml,/Fri, 02 Jan 2026 03:04:05 \+0000/);assert.match(xml,/<guid isPermaLink="true">https:\/\/dunamismax.com\/blog\/synthetic-test<\/guid>/);
});
test('dates render in UTC and XML text drops forbidden characters', () => {
 assert.equal(shortDate(new Date('2026-01-01T00:30:00-05:00')),'Jan 1, 2026');assert.equal(shortDate(new Date('2025-12-31T23:59:59Z')),'Dec 31, 2025');
 assert.equal(xml('a\x00b\x0Bc\td\ne'),'a�b�c\td\ne');assert.equal(xml(`<&>"'`),'&lt;&amp;&gt;&quot;&#039;');
 assert.equal(paragraphs('  one\n\n\n\ntwo three  '),'<p>one</p>\n<p>two<br>\nthree</p>');assert.equal(readingMinutes(''),1);
});
test('one slug grammar for the CLI, the post route and the path allowlist', () => {
 for(const slug of ['a','a1','first-note','2026-build-log','a'.repeat(180)]) {assert.ok(SLUG_PATTERN.test(slug),slug);validateSlug(slug);}
 for(const slug of ['','-a','a-','a--b','A','a_b','a.b','a/b','a b','é','a\n','a'.repeat(181)]) assert.throws(() => validateSlug(slug),JSON.stringify(slug));
 assert.equal(SLUG_PATTERN.global||SLUG_PATTERN.sticky,false,'a stateful pattern would alternate results between calls');
});
test('read-only boundary constants', () => {
 assert.equal(ALLOW_HEADER,'GET, HEAD');for(const method of ['GET','HEAD']) assert.ok(readOnlyMethod(method));
 for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS','TRACE','CONNECT','get','',undefined]) assert.ok(!readOnlyMethod(method),String(method));
 const csp=SECURITY_HEADERS['Content-Security-Policy'];assert.ok(csp.startsWith("default-src 'self'")&&!/unsafe-inline|unsafe-eval|\*|data:|https?:/.test(csp),'CSP stays same-origin with no inline or remote sources');
});
test('portfolio inventory is structurally sound', () => {
 const anchor=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
 const ids=[...projectGroups.map(group => group.id),...allProjects.map(project => project.id)];
 assert.equal(new Set(ids).size,ids.length,'card and group anchors are unique on the page');
 for(const id of ids) assert.match(id,anchor);
 assert.equal(allProjects.length,projectGroups.reduce((sum,group) => sum+group.projects.length,0));
 assert.equal(new Set(allProjects).size,allProjects.length,'no project is listed in two groups');
 for(const group of projectGroups) {assert.ok(group.projects.length>0&&group.title.trim()&&group.summary.trim(),group.id);}
 assert.equal(new Set(featuredProjects).size,featuredProjects.length);for(const project of featuredProjects) assert.ok(allProjects.includes(project),project.id+' is featured but not in a group');
 for(const project of allProjects) {
  for(const field of ['name','status','role','tagline','detail'] as const) assert.ok(project[field].trim()===project[field]&&project[field].length>0,project.id+' '+field);
  assert.ok(['active','shipped','phase-0'].includes(project.tone),project.id+' tone');
  // ProjectCard keys its each blocks on these values; a duplicate key fails the render.
  assert.ok(project.stack.length>0&&new Set(project.stack).size===project.stack.length,project.id+' stack');
  assert.equal(new Set(project.links.map(link => link.href)).size,project.links.length,project.id+' links');
  for(const link of project.links) {const url=new URL(link.href);assert.ok(url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&link.label.trim().length>0,project.id+' '+link.href);}
  // A card shows its links or, failing that, a note saying why there are none.
  assert.ok(project.links.length>0?project.note===undefined:Boolean(project.note?.trim()),project.id+' needs links or a note, not both');
 }
});
