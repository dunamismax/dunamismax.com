import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ALLOW_HEADER, READ_ONLY_MESSAGE, SECURITY_HEADERS, readOnlyMethod } from '../src/lib/http.js';
import { SLUG_PATTERN } from '../src/lib/validation.js';
// Use adapter-node's static + prerendered + SSR handler, with a uniform read-only boundary.
const entry = await import(new URL('../../web/handler.js', import.meta.url).href) as { handler: (request: IncomingMessage, response: ServerResponse) => unknown };
if (process.env.HOST && process.env.HOST !== '127.0.0.1') throw new Error('Only loopback binding is supported');
const port = Number(process.env.PORT ?? '4311');
const routes = new Set(['/', '/about', '/contact', '/projects', '/blog', '/feed.xml', '/robots.txt', '/manifest.webmanifest', '/healthz', '/css/site.css', '/icon.svg']);
// Prerendered files are served as static assets, so headers their endpoints declare never
// reach the client; the cache policy for every cacheable path is therefore set here.
const brief = 'public, max-age=300, must-revalidate';
const cachePolicy: Record<string,string> = {'/css/site.css': brief, '/robots.txt': brief, '/manifest.webmanifest': brief, '/icon.svg': 'public, max-age=86400'};
const server = createServer((req,res) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
  res.setHeader('Cache-Control','no-store');
  if (process.env.APP_ENV && process.env.APP_ENV !== 'production') res.setHeader('X-Robots-Tag','noindex');
  if (!readOnlyMethod(req.method)) {
    res.writeHead(405, {Allow:ALLOW_HEADER,'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':'noindex'});
    res.end(READ_ONLY_MESSAGE);return;
  }
  const path = (req.url ?? '/').split('?')[0]!;
  if (!routes.has(path) && !(path.startsWith('/blog/') && SLUG_PATTERN.test(path.slice(6)))) req.url='/not-found';
  if (Object.hasOwn(cachePolicy, path)) res.setHeader('Cache-Control', cachePolicy[path]!);
  Promise.resolve(entry.handler(req,res)).catch(() => {
    console.error('Request failed');
    if (!res.headersSent) res.writeHead(500, {'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':'noindex'});
    res.end('Please try again shortly.');
  });
});
server.listen(port,'127.0.0.1', () => console.log(`dunamismax listening on 127.0.0.1:${port}`));
for(const signal of ['SIGTERM','SIGINT'] as const) process.on(signal,() => { server.close(() => process.exit(0));setTimeout(() => process.exit(1),25000).unref(); });
