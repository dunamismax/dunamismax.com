import { error } from '@sveltejs/kit';
import { posts } from '#lib/posts.ts';
import type { Post } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params }) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.slug)) error(404, 'Not found');
  let post: Post | null;
  try { post = await posts.find(params.slug); } catch { console.error('Post database unavailable'); error(503, 'Temporarily unavailable'); }
  if (!post) error(404, 'Not found');
  return { post, meta: { title: post.title, ...(post.excerpt ? { description: post.excerpt } : {}), path: '/blog/' + params.slug, ogType: 'article' as const } };
};
