import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { config } from './lib/config.js';
import { ALLOW_HEADER, READ_ONLY_MESSAGE, SECURITY_HEADERS, readOnlyMethod } from './lib/http.js';
// Prerendered files bypass this hook in production; bin/server.ts applies the same headers to every response.
export const handle: Handle = async ({ event, resolve }) => {
  const method = event.request.method;
  let response: Response;
  if (!readOnlyMethod(method)) response = new Response(READ_ONLY_MESSAGE, { status: 405, headers: { Allow: ALLOW_HEADER, 'Content-Type': 'text/plain; charset=utf-8' } });
  else response = await resolve(event);
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  if (!config.production || response.status >= 400) headers.set('X-Robots-Tag', 'noindex');
  if (response.status === 503) headers.set('Retry-After', '60');
  return new Response(method === 'HEAD' ? null : response.body, { status: response.status, headers });
};
// Routine 404s arrive as framework errors; log only unexpected faults, and never
// the raw error, which may carry connection details.
export const handleError: HandleServerError = (caught) => {
  if (caught.kind === 'unknown') { console.error('Request failed'); return { message: 'Internal Error' }; }
  return { message: caught.error.message };
};
