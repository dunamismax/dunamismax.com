import type { RequestHandler } from './$types';
export const prerender = true;
export const GET: RequestHandler = () => new Response('User-agent: *\nAllow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300, must-revalidate' } });
