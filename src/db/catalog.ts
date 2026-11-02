import type pg from 'pg';
// Normalized description of everything in schema app: columns, constraints, indexes,
// view definition/options, identity sequence, owners and expanded ACLs. Run as the owner.
const CATALOG = `
WITH rel AS (SELECT c.oid, c.relname, c.relkind FROM pg_class c WHERE c.relnamespace = 'app'::regnamespace)
SELECT jsonb_build_object(
 'schema', (SELECT jsonb_build_object('owner', pg_get_userbyid(nspowner), 'acl', (SELECT coalesce(jsonb_agg(a ORDER BY a), '[]') FROM (SELECT jsonb_build_array(pg_get_userbyid(x.grantee), x.privilege_type, x.is_grantable) a FROM aclexplode(coalesce(nspacl, acldefault('n', nspowner))) x) s)) FROM pg_namespace WHERE nspname = 'app'),
 'relations', (SELECT coalesce(jsonb_agg(jsonb_build_object('name', r.relname, 'kind', r.relkind, 'owner', pg_get_userbyid(c.relowner), 'options', c.reloptions, 'rls', c.relrowsecurity,
   'acl', (SELECT coalesce(jsonb_agg(a ORDER BY a), '[]') FROM (SELECT jsonb_build_array(pg_get_userbyid(x.grantee), x.privilege_type, x.is_grantable) a FROM aclexplode(coalesce(c.relacl, acldefault((CASE WHEN r.relkind = 'S' THEN 's' ELSE 'r' END)::"char", c.relowner))) x) s),
   'view', CASE WHEN r.relkind = 'v' THEN pg_get_viewdef(r.oid, true) END,
   'index', CASE WHEN r.relkind = 'i' THEN pg_get_indexdef(r.oid) END,
   'triggers', (SELECT count(*) FROM pg_trigger t WHERE t.tgrelid = r.oid),
   'policies', (SELECT count(*) FROM pg_policy p WHERE p.polrelid = r.oid)) ORDER BY r.relname), '[]') FROM rel r JOIN pg_class c ON c.oid = r.oid),
 'columns', (SELECT coalesce(jsonb_agg(jsonb_build_array(r.relname, a.attnum, a.attname, format_type(a.atttypid, a.atttypmod), a.attnotnull, co.collname, pg_get_expr(d.adbin, d.adrelid), a.attidentity, a.attgenerated) ORDER BY r.relname, a.attnum), '[]')
   FROM rel r JOIN pg_attribute a ON a.attrelid = r.oid AND a.attnum > 0 AND NOT a.attisdropped
   LEFT JOIN pg_collation co ON co.oid = a.attcollation AND a.attcollation <> 0 LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE r.relkind IN ('r', 'v')),
 'constraints', (SELECT coalesce(jsonb_agg(jsonb_build_array(r.relname, k.conname, k.contype, pg_get_constraintdef(k.oid)) ORDER BY r.relname, k.conname), '[]') FROM rel r JOIN pg_constraint k ON k.conrelid = r.oid AND k.contype <> 'n'),
 'sequences', (SELECT coalesce(jsonb_agg(jsonb_build_array(r.relname, format_type(s.seqtypid, NULL), s.seqstart, s.seqincrement, s.seqmin, s.seqmax, s.seqcache, s.seqcycle, (SELECT dr.relname || '.' || da.attname FROM pg_depend dp JOIN pg_class dr ON dr.oid = dp.refobjid JOIN pg_attribute da ON da.attrelid = dp.refobjid AND da.attnum = dp.refobjsubid WHERE dp.objid = r.oid AND dp.deptype IN ('a', 'i'))) ORDER BY r.relname), '[]') FROM rel r JOIN pg_sequence s ON s.seqrelid = r.oid),
 'other', (SELECT count(*) FROM pg_proc WHERE pronamespace = 'app'::regnamespace) + (SELECT count(*) FROM pg_type WHERE typnamespace = 'app'::regnamespace AND typrelid = 0 AND typcategory <> 'A')
) AS catalog`;
export async function catalog(client: pg.Client): Promise<unknown> {
  // Definitions are deparsed relative to search_path; pin it so every session sees qualified names.
  const previous = (await client.query<{ search_path: string }>('SHOW search_path')).rows[0]!.search_path;
  await client.query("SELECT set_config('search_path', 'pg_catalog', false)");
  try { return (await client.query<{ catalog: unknown }>(CATALOG)).rows[0]!.catalog; }
  finally { await client.query("SELECT set_config('search_path', $1, false)", [previous]); }
}
// Ordered SHA256 over every stored field at full precision plus identity state; never returns content.
export async function contentState(client: pg.Client): Promise<{ rows: number; maxId: string; sequence: string; sha256: string }> {
  await client.query("SET TIME ZONE 'UTC'");
  const row = (await client.query<{ rows: string; max_id: string; sequence: string; sha256: string }>(`SELECT count(*)::text AS rows, coalesce(max(id), 0)::text AS max_id,
   (SELECT last_value::text || CASE WHEN is_called THEN ':called' ELSE ':unused' END FROM app.posts_id_seq) AS sequence,
   encode(sha256(convert_to(coalesce(string_agg(jsonb_build_array(id::text, slug, title, excerpt, body, status, published_at, created_at, updated_at)::text, E'\\n' ORDER BY id), ''), 'UTF8')), 'hex') AS sha256 FROM app.posts`)).rows[0]!;
  return { rows: Number(row.rows), maxId: row.max_id, sequence: row.sequence, sha256: row.sha256 };
}
