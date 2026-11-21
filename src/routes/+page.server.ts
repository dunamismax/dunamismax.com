import { config } from '#lib/config.ts';
import { posts } from '#lib/posts.ts';
import type { Post } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';
// The home page stays 200 during database outages and says so honestly.
export const load: PageServerLoad = async () => {
  let latest: Post | null = null;
  let postCount: number | null = null;
  try { [latest, postCount] = await Promise.all([posts.latest(1).then(rows => rows[0] ?? null), posts.count()]); } catch { console.error('Home writing unavailable'); }
  return { latest, postCount, meta: { title: 'dunamismax', description: config.description, path: '/' } };
};
