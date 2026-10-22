import pg from 'pg';
export interface Post { slug: string; title: string; excerpt: string; body: string; published_at: Date }
let pool: pg.Pool | undefined;
export function websitePool(): pg.Pool | null {
  if (!process.env.PGDATABASE) {
    if (process.env.APP_ENV === 'local' || process.env.APP_ENV === 'test') return null;
    throw new Error('Website PostgreSQL configuration missing');
  }
  if (!pool) { pool = new pg.Pool({ max: 4, connectionTimeoutMillis: 2000, idleTimeoutMillis: 10000, statement_timeout: 5000, application_name: 'dunamismax-web' });
  pool.on('error', () => console.error('PostgreSQL connection unavailable')); }
  return pool;
}
export const posts = {
  async latest(limit = 10, offset = 0): Promise<Post[]> { return (await websitePool()?.query<Post>('SELECT * FROM app.public_posts ORDER BY published_at DESC, id DESC LIMIT $1 OFFSET $2', [limit, offset]))?.rows ?? []; },
  async count(): Promise<number> { return Number((await websitePool()?.query<{count: string}>('SELECT count(*) FROM app.public_posts'))?.rows[0]?.count ?? 0); },
  async find(slug: string): Promise<Post | null> { return (await websitePool()?.query<Post>('SELECT * FROM app.public_posts WHERE slug = $1', [slug]))?.rows[0] ?? null; }
};
export async function closeWebsitePool(): Promise<void> { await pool?.end(); pool = undefined; }
