import { defineMiddleware } from 'astro:middleware';
import { config } from './lib/config.js';
export const onRequest = defineMiddleware(async (context, next) => {
  const method = context.request.method;
  let response: Response;
  if (!['GET', 'HEAD'].includes(method)) response = new Response('This page is for reading. The site accepts GET and HEAD requests only.', { status: 405, headers: { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' } });
  else response = await next();
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  if (!config.production || response.status >= 400) headers.set('X-Robots-Tag', 'noindex');
  if (response.status === 503) headers.set('Retry-After', '60');
  return new Response(method === 'HEAD' ? null : response.body, { status: response.status, headers });
});
