import stylesheet from '../../../app.css?inline';
import type { RequestHandler } from './$types';
// Tailwind compiles src/app.css at build time; the stable public URL stays /css/site.css.
export const prerender = true;
export const GET: RequestHandler = () => new Response(stylesheet, { headers: { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'public, max-age=300, must-revalidate' } });
