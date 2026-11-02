import { eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { posts } from '../db/schema.js';
import { validatePost, validateSlug, timestamp } from './validation.js';
import type { EditablePost } from './validation.js';
export type Fields = Partial<Pick<EditablePost, 'title' | 'excerpt' | 'body'>>;
class ValidatedOnly extends Error {}
export async function changePost(db: NodePgDatabase, command: string, slug: string, fields: Fields = {}, at?: string): Promise<EditablePost> {
  validateSlug(slug);
  let result: EditablePost | undefined;
  try {
    await db.transaction(async tx => {
      let post: EditablePost;
      if (command === 'create') {
        post = {slug, title: '', excerpt: '', body: '', status: 'draft', published_at: null, ...fields};
        validatePost(post);
        await tx.insert(posts).values({slug, title: post.title, excerpt: post.excerpt, body: post.body});
      } else {
        const [found] = await tx.select({slug: posts.slug, title: posts.title, excerpt: posts.excerpt, body: posts.body, status: posts.status, published_at: posts.published_at}).from(posts).where(eq(posts.slug, slug)).for('update');
        if (!found) throw new Error('Post not found. Use list to inspect available slugs.');
        post = {...found, ...fields};
        const dated = command === 'publish' || command === 'schedule';
        if (dated) {
          const [clock] = await tx.select({now: sql<Date>`clock_timestamp()`.mapWith(posts.published_at)}).from(sql`(SELECT 1) AS clock`);
          const now = clock!.now;
          post.status = 'published';
          post.published_at = command === 'publish' ? now : timestamp(at ?? '');
          if (command === 'schedule' && post.published_at <= now) throw new Error('Schedule must be in the future.');
        } else if (command === 'unpublish') post.status = 'draft';
        else if (!['edit','validate'].includes(command)) throw new Error('Invalid command');
        validatePost(post);
        if (command === 'validate') { result = post; throw new ValidatedOnly(); }
        // Only publish/schedule set the instant, so edits never round-trip stored timestamps.
        await tx.update(posts).set({title: post.title, excerpt: post.excerpt, body: post.body, status: post.status, ...(dated ? {published_at: post.published_at} : {}), updated_at: sql`clock_timestamp()`}).where(eq(posts.slug, slug));
      }
      result = post;
    });
  } catch (error) { if (!(error instanceof ValidatedOnly)) throw error; }
  return result!;
}
