import type { APIRoute } from 'astro';
import { posts } from '../lib/posts.js';
import { rss } from '../lib/rss.js';
export const GET: APIRoute = async () => {
  try { return new Response(rss(await posts.latest(20)), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' } }); }
  catch { console.error('Feed database unavailable'); return new Response('Writing is briefly unavailable. Please try again in a little while.', { status: 503, headers: { 'Retry-After': '60' } }); }
};
