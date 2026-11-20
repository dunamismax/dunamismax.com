import type { RequestHandler } from './$types';
export const GET: RequestHandler = () => new Response('{"status":"ok"}', { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
