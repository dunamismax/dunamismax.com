import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
// Use the adapter's static + SSR handler, with a uniform read-only boundary.
process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const entry = await import(new URL('../../server/entry.mjs', import.meta.url).href) as { handler: (request: IncomingMessage, response: ServerResponse) => void };
if (process.env.HOST && process.env.HOST !== '127.0.0.1') throw new Error('Only loopback binding is supported');
const port = Number(process.env.PORT ?? '4311');
const routes = new Set(['/', '/about', '/contact', '/projects', '/blog', '/feed.xml', '/robots.txt', '/manifest.webmanifest', '/healthz', '/css/site.css', '/icon.svg']);
const server = createServer((req,res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control','no-store');
  if (process.env.APP_ENV && process.env.APP_ENV !== 'production') res.setHeader('X-Robots-Tag','noindex');
  if (!['GET','HEAD'].includes(req.method ?? '')) {
    res.writeHead(405, {Allow:'GET, HEAD','Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':'noindex'});
    res.end('This page is for reading. The site accepts GET and HEAD requests only.');return;
  }
  const path = (req.url ?? '/').split('?')[0]!;
  if (!routes.has(path) && !/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)) req.url='/not-found';
  if(path === '/css/site.css') res.setHeader('Cache-Control','public, max-age=300, must-revalidate');
  if(path === '/icon.svg') res.setHeader('Cache-Control','public, max-age=86400');
  Promise.resolve(entry.handler(req,res)).catch(() => {
    console.error('Request failed');
    if (!res.headersSent) res.writeHead(500, {'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':'noindex'});
    res.end('Please try again shortly.');
  });
});
server.listen(port,'127.0.0.1', () => console.log(`dunamismax listening on 127.0.0.1:${port}`));
for(const signal of ['SIGTERM','SIGINT'] as const) process.on(signal,() => { server.close(() => process.exit(0));setTimeout(() => process.exit(1),25000).unref(); });
