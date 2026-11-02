import { count, desc, eq } from 'drizzle-orm';
import { websiteDatabase } from '../db/web.js';
import { publicPosts } from '../db/schema.js';
export interface Post { slug: string; title: string; excerpt: string; body: string; published_at: Date }
// Web reads only the publication view; visibility is decided by the database clock per query.
const columns = { slug: publicPosts.slug, title: publicPosts.title, excerpt: publicPosts.excerpt, body: publicPosts.body, published_at: publicPosts.published_at };
export const posts = {
  async latest(limit = 10, offset = 0): Promise<Post[]> { return await websiteDatabase()?.select(columns).from(publicPosts).orderBy(desc(publicPosts.published_at), desc(publicPosts.id)).limit(limit).offset(offset) ?? []; },
  async count(): Promise<number> { return (await websiteDatabase()?.select({ count: count() }).from(publicPosts))?.[0]?.count ?? 0; },
  async find(slug: string): Promise<Post | null> { return (await websiteDatabase()?.select(columns).from(publicPosts).where(eq(publicPosts.slug, slug)))?.[0] ?? null; }
};
