import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4321';
const outage=process.env.TEST_OUTAGE === '1';
const populated=process.env.TEST_POPULATED === '1';
let checks=0;
function check(value: unknown, message: string) {assert.ok(value,message);checks++;}
const pageText: Record<string,string>={'/':'I build the websites.','/about':'PHP-first web development','/projects':'Websites, support, and systems.','/contact':'dunamismax@tutamail.com'};
for(const [path,text] of Object.entries(pageText)) {
 const res=await fetch(base+path);const html=await res.text();check(res.status===200,path+' status');check(html.includes(text),path+' copy');check((html.match(/<h1[ >]/g)??[]).length===1,path+' heading');check(html.includes('id="main-content"')&&html.includes('href="#main-content"'),path+' landmarks');check(!/<script| on[a-z]+=|javascript:|style=/i.test(html),path+' no scripts or inline styles');check(html.includes('rel="canonical" href="https://dunamismax.com'+path+'"'),path+' canonical');check(html.includes('property="og:title"')&&html.includes('name="twitter:card"'),path+' metadata');check(html.includes('/feed.xml')&&html.includes('/manifest.webmanifest'),path+' feed and manifest');
 if(path==='/'||path==='/projects') {check((html.match(/class="project-card__name"/g)??[]).length===8,'project count');for(const term of ['RustDesk remote support','Dunamis Status','Server backup &amp; recovery','Grace &amp; Footnotes','Imaging Services website','dunamismax.com','MTG Card Bot','Dynamic DNS automation']) check(html.includes(term),term);}
 const head=await fetch(base+path,{method:'HEAD'});check(head.status===200&&(await head.text())==='',path+' HEAD');
}
for(const path of ['/missing','/.env','/.git/config','/database/schema.sql','/src/pages/about.astro','/node_modules/pg/package.json','/dist/server/entry.mjs','/storage/drafts/test.txt','/index.php','/js/theme.js','/blog/Invalid','/blog?page=0','/blog?page=no','/blog?page=100001']) {
 const res=await fetch(base+path);const html=await res.text();check(res.status===404,path+' private/invalid 404');check(!html.includes('rel="canonical"'),path+' error canonical');check(res.headers.get('x-robots-tag')==='noindex',path+' noindex');
}
for(const path of ['/blog','/feed.xml','/blog/synthetic-public-0']) {const res=await fetch(base+path);check(res.status===(outage?503: path==='/blog/synthetic-public-0'&&!populated?404:200),path+' database behavior');if(outage) check(res.headers.get('retry-after')==='60',path+' retry');}
const home=await (await fetch(base+'/')).text();if(outage) check(home.includes('Build logs and server notes.')&&!home.includes('No posts yet.'),'honest home outage');
for(const [path,type] of [['/healthz','application/json'],['/feed.xml','application/xml'],['/robots.txt','text/plain'],['/manifest.webmanifest','application/manifest+json'],['/css/site.css','text/css'],['/icon.svg','image/svg+xml']]) {
 const res=await fetch(base+path);if(path==='/feed.xml'&&outage)continue;check(res.headers.get('content-type')?.includes(type!),path+' content type');
}
for(const path of ['/','/blog','/feed.xml','/healthz']) {const res=await fetch(base+path,{method:'POST'});check(res.status===405&&res.headers.get('allow')==='GET, HEAD',path+' methods');}
if(populated&&!outage) {
 const page2=await (await fetch(base+'/blog?page=2')).text();check(page2.includes('Page 2 of 3')&&page2.includes('https://dunamismax.com/blog?page=2'),'pagination metadata');
 check((await fetch(base+'/blog?page=4')).status===404,'past last page');
 for(const slug of ['synthetic-draft','synthetic-future']) check((await fetch(base+'/blog/'+slug)).status===404,'private '+slug);
 const feed=await (await fetch(base+'/feed.xml')).text();check((feed.match(/<item>/g)??[]).length===20,'RSS limit');check(!feed.includes('synthetic-draft')&&!feed.includes('synthetic-future'),'RSS privacy');
}
console.log(`Passed ${checks} HTTP checks (${outage?'outage':populated?'populated':'empty'}).`);
