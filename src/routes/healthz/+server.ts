import { health } from '#lib/health.ts';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async () => {
  const { status, body } = await health();
  return new Response(body, { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
};
