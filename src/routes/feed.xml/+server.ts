import { posts } from '#lib/posts.ts';
import { rss } from '#lib/rss.ts';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async () => {
  try { return new Response(rss(await posts.latest(20)), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' } }); }
  catch { console.error('Feed database unavailable'); return new Response('Writing is briefly unavailable. Please try again in a little while.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '60' } }); }
};
