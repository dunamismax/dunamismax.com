import { posts } from '#lib/posts.ts';
import type { Post } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';
// The home page stays 200 during database outages and says so honestly.
export const load: PageServerLoad = async () => {
  let latest: Post | null = null;
  let postCount: number | null = null;
  try { latest = (await posts.latest(1))[0] ?? null; postCount = await posts.count(); } catch { console.error('Home writing unavailable'); }
  return { latest, postCount, meta: { title: 'dunamismax', description: 'Stephen Sawyer: full-stack developer and sysadmin. SvelteKit, TypeScript, and PostgreSQL web apps, Go and Python game servers, company-wide RustDesk support, and self-hosted Ubuntu infrastructure.', path: '/' } };
};
