import type { APIRoute } from 'astro';
export const GET: APIRoute = () => new Response("{\"status\":\"ok\"}", { headers: { 'Content-Type': "application/json", 'Cache-Control': "no-store", "X-Robots-Tag": "noindex" } });
