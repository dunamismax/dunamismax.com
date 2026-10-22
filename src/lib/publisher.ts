import type pg from 'pg';
import { validatePost, validateSlug, timestamp } from './validation.js';
import type { EditablePost } from './validation.js';
export type Fields = Partial<Pick<EditablePost, 'title' | 'excerpt' | 'body'>>;
export async function changePost(client: pg.Client | pg.PoolClient, command: string, slug: string, fields: Fields = {}, at?: string): Promise<EditablePost> {
  validateSlug(slug);
  await client.query('BEGIN');
  try {
    let post: EditablePost;
    if (command === 'create') {
      post = {slug, title: '', excerpt: '', body: '', status: 'draft', published_at: null, ...fields};
      validatePost(post);
      await client.query('INSERT INTO app.posts (slug,title,excerpt,body) VALUES ($1,$2,$3,$4)', [slug,post.title,post.excerpt,post.body]);
    } else {
      const found = (await client.query<EditablePost>('SELECT * FROM app.posts WHERE slug=$1 FOR UPDATE', [slug])).rows[0];
      if (!found) throw new Error('Post not found. Use list to inspect available slugs.');
      post = {...found, ...fields};
      if (command === 'publish' || command === 'schedule') {
        const now = (await client.query<{now: Date}>('SELECT clock_timestamp() AS now')).rows[0]!.now;
        post.status = 'published';
        post.published_at = command === 'publish' ? now : timestamp(at ?? '');
        if (command === 'schedule' && post.published_at <= now) throw new Error('Schedule must be in the future.');
      } else if (command === 'unpublish') post.status = 'draft';
      else if (!['edit','validate'].includes(command)) throw new Error('Invalid command');
      validatePost(post);
      if (command !== 'validate') await client.query('UPDATE app.posts SET title=$2, excerpt=$3, body=$4, status=$5, published_at=$6, updated_at=clock_timestamp() WHERE slug=$1', [slug,post.title,post.excerpt,post.body,post.status,post.published_at]);
    }
    await client.query(command === 'validate' ? 'ROLLBACK' : 'COMMIT');
    return post;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
}
