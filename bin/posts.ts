import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { protectedEnv } from '../src/lib/credentials.js';
import { operatorConnection, safeMessage } from '../src/db/operator.js';
import { posts } from '../src/db/schema.js';
import { changePost } from '../src/lib/publisher.js';
import type { Fields } from '../src/lib/publisher.js';
import { validateSlug, timestamp, BODY_BYTES } from '../src/lib/validation.js';
const HELP = `dunamismax.com publishing (plain text; no HTML or Markdown interpretation)
Usage: npm run posts -- COMMAND [SLUG] [options]
  create SLUG --title TEXT --body-file FILE [--excerpt TEXT]
  edit SLUG [--title TEXT] [--body-file FILE] [--excerpt TEXT]
  validate SLUG [edit options]        Validate without writes
  list [--limit 50] [--offset 0]      JSON; includes private drafts
  show SLUG                          JSON; includes private fields
  publish SLUG                       Publish now using database time
  schedule SLUG --at TIMESTAMP        Future explicit-offset timestamp
  unpublish SLUG                      Draft; retains publication date
Body FILE is UTF-8 plain text, or - for stdin. Slugs cannot change.
POSTS_CONFIG: absolute owner-only 0600 configuration outside the checkout.
Production: sudo /usr/local/sbin/dunamismax-posts COMMAND ...
Credentials are /etc/astro-apps/dunamismax/publishing.env; never use web.env.
`;
async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help') || args[0] === 'help') { process.stdout.write(HELP); return; }
  const command = args.shift()!;
  const allowed: Record<string,string[]> = {create:['title','excerpt','body-file'],edit:['title','excerpt','body-file'],validate:['title','excerpt','body-file'],list:['limit','offset'],show:[],publish:[],schedule:['at'],unpublish:[]};
  if (!allowed[command]) throw new Error('Unknown command. See --help.');
  const slug = command === 'list' ? undefined : args.shift();
  if (command !== 'list') validateSlug(slug ?? '');
  const {values,tokens} = parseArgs({ args, options: Object.fromEntries(allowed[command]!.map(k => [k,{type:'string' as const}])), strict:true, tokens:true });
  const used = tokens.filter(t => t.kind === 'option').map(t => t.name);
  if (new Set(used).size !== used.length) throw new Error('Repeated option.');
  if (command === 'create' && (values.title === undefined || values['body-file'] === undefined)) throw new Error('Create requires title and body-file.');
  if (command === 'edit' && !Object.keys(values).length) throw new Error('Specify at least one field to edit.');
  if (command === 'schedule') timestamp(values.at ?? '');
  const fields: Fields = {};
  if (values.title !== undefined) fields.title = values.title;
  if (values.excerpt !== undefined) fields.excerpt = values.excerpt;
  if (values['body-file'] !== undefined) {
    const data = readFileSync(values['body-file'] === '-' ? 0 : values['body-file']);
    if (data.length > BODY_BYTES) throw new Error('Body file is too large.');
    fields.body = new TextDecoder('utf-8', {fatal:true}).decode(data);
  }
  const integer = (value: string, min: number, max: number) => { const n = Number(value); if (!/^(0|[1-9][0-9]*)$/.test(value) || !Number.isSafeInteger(n) || n < min || n > max) throw new Error('Invalid pagination argument'); return n; };
  const limit = integer(values.limit ?? '50',1,500), offset = integer(values.offset ?? '0',0,2147483647);
  const env = process.env.POSTS_CONFIG ? protectedEnv(process.env.POSTS_CONFIG) : process.env.POSTS_TRUSTED_WRAPPER === '1' ? process.env as Record<string,string> : protectedEnv('/etc/astro-apps/dunamismax/publishing.env');
  const { client, db } = await operatorConnection(env, 'dunamismax_publishing');
  try {
    if (command === 'list' || command === 'show') {
      const state = sql<string>`CASE WHEN ${posts.status} = 'published' AND ${posts.published_at} > clock_timestamp() THEN 'scheduled' ELSE ${posts.status} END`;
      const output = command === 'list'
        ? await db.select({slug: posts.slug, title: posts.title, status: posts.status, published_at: posts.published_at, state}).from(posts).orderBy(desc(posts.id)).limit(limit).offset(offset)
        : (await db.select({...getTableColumns(posts), state}).from(posts).where(eq(posts.slug, slug!))).map(row => ({...row, id: String(row.id)}))[0];
      if (!output) throw new Error('Post not found.');
      process.stdout.write(JSON.stringify(output,null,2) + '\n');
    } else { await changePost(db,command,slug!,fields,values.at); process.stdout.write(`${command === 'validate' ? 'Valid; no changes saved' : command + ' completed'}: ${slug}.\n`); }
  } finally { await client.end(); }
}
main().catch(error => { console.error('Error: ' + safeMessage(error, 'Database operation failed; no credentials or content logged.')); process.exitCode=1; });
