import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { config } from './lib/config.js';
// Prerendered files bypass this hook in production; bin/server.ts applies the same headers to every response.
export const handle: Handle = async ({ event, resolve }) => {
  const method = event.request.method;
  let response: Response;
  if (!['GET', 'HEAD'].includes(method)) response = new Response('This page is for reading. The site accepts GET and HEAD requests only.', { status: 405, headers: { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' } });
  else response = await resolve(event);
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  if (!config.production || response.status >= 400) headers.set('X-Robots-Tag', 'noindex');
  if (response.status === 503) headers.set('Retry-After', '60');
  return new Response(method === 'HEAD' ? null : response.body, { status: response.status, headers });
};
// Never log raw errors: they may carry connection details.
export const handleError: HandleServerError = () => { console.error('Request failed'); return { message: 'Internal Error' }; };
