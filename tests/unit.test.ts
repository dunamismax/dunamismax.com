import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { paragraphs, readingMinutes } from '../src/lib/text.js';
import { validatePost, timestamp, BODY_BYTES } from '../src/lib/validation.js';
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
