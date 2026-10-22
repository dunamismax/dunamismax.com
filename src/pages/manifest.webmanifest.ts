import type { APIRoute } from 'astro';
import { config } from '../lib/config.js';
export const prerender = true;
export const GET: APIRoute = () => new Response(JSON.stringify({ name: 'dunamismax', short_name: 'dunamismax', icons: [{ src: '/icon.svg', type: 'image/svg+xml', sizes: '512x512' }, { src: '/icon.svg', type: 'image/svg+xml', sizes: '512x512', purpose: 'maskable' }], start_url: '/', display: 'standalone', scope: '/', description: config.description, theme_color: '#0d1117', background_color: '#0d1117' }), { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=300, must-revalidate' } });
