import { sql } from 'drizzle-orm';
import { bigint, check, customType, index, pgSchema, text, timestamp, varchar } from 'drizzle-orm/pg-core';
// Authoritative TypeScript schema; reviewed SQL in drizzle/ adds grants Drizzle cannot express.
export const app = pgSchema('app');
// Byte-ordered slug uniqueness, independent of the database's default collation.
const slugText = customType<{ data: string; driverData: string }>({ dataType: () => 'varchar(180) COLLATE "C"' });
export const posts = app.table('posts', {
  id: bigint('id', { mode: 'bigint' }).primaryKey().generatedByDefaultAsIdentity(),
  slug: slugText('slug').notNull().unique('posts_slug_key'),
  title: varchar('title', { length: 240 }).notNull(),
  excerpt: varchar('excerpt', { length: 600 }).notNull().default(''),
  body: text('body').notNull(),
  status: text('status').notNull().default('draft'),
  published_at: timestamp('published_at', { withTimezone: true, mode: 'date' }),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`)
}, t => [
  check('posts_slug_check', sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  check('posts_body_check', sql`octet_length(${t.body}) <= 16777215`),
  check('posts_status_check', sql`${t.status} IN ('draft', 'published')`),
  check('posts_check', sql`${t.status} <> 'published' OR ${t.published_at} IS NOT NULL`),
  index('posts_publication').on(t.status, t.published_at.desc().nullsFirst(), t.id.desc().nullsFirst())
]);
// Owner-controlled publication boundary: visibility follows the database clock on every query.
export const publicPosts = app.view('public_posts', {
  id: bigint('id', { mode: 'bigint' }).notNull(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  body: text('body').notNull(),
  published_at: timestamp('published_at', { withTimezone: true, mode: 'date' }).notNull()
}).with({ securityBarrier: true }).as(sql`SELECT id, slug, title, excerpt, body, published_at FROM app.posts WHERE status = 'published' AND published_at <= CURRENT_TIMESTAMP`);
