import { error } from '@sveltejs/kit';
import { posts } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ url }) => {
  const raw = url.searchParams.get('page') ?? '1';
  const page = Number(raw);
  if (!/^(?:[1-9][0-9]*)$/.test(raw) || page > 100000) error(404, 'Not found');
  let state: { pages: number; items: Awaited<ReturnType<typeof posts.latest>> } | null;
  try {
    const pages = Math.max(1, Math.ceil(await posts.count() / 10));
    state = page > pages ? null : { pages, items: await posts.latest(10, (page - 1) * 10) };
  } catch { console.error('Blog database unavailable'); error(503, 'Temporarily unavailable'); }
  if (!state) error(404, 'Not found');
  return { page, ...state, meta: { title: 'Blog', description: 'Build logs, design notes, and server notes from Stephen Sawyer.', path: '/blog' + (page > 1 ? '?page=' + page : '') } };
};
