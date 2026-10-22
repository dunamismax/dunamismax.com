import { readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
import { parseEnv } from 'node:util';
import type { ClientConfig } from 'pg';
export function protectedEnv(path: string): Record<string,string> {
  if (!isAbsolute(path)) throw new Error('Configuration requires an absolute file path.');
  const resolved = realpathSync(path);
  const info = statSync(resolved);
  const rel = relative(process.cwd(), resolved);
  if (!info.isFile() || (info.mode & 0o777) !== 0o600 || info.uid !== process.geteuid?.() || (!rel.startsWith('../') && rel !== '..')) throw new Error('Configuration must be a mode 0600 file owned by this user outside the checkout.');
  return Object.fromEntries(Object.entries(parseEnv(readFileSync(resolved, 'utf8'))).filter((entry): entry is [string,string] => entry[1] !== undefined));
}
export function pgConfig(env: Record<string,string>, expected: string): ClientConfig {
  for (const key of ['PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD']) if (!env[key]) throw new Error('Incomplete PostgreSQL configuration');
  if (env.PGUSER !== expected) throw new Error('Wrong PostgreSQL role for this operation');
  return { host: env.PGHOST!, port: Number(env.PGPORT), database: env.PGDATABASE!, user: env.PGUSER!, password: env.PGPASSWORD!, options: '-c search_path=app,pg_catalog', connectionTimeoutMillis: 3000, statement_timeout: 30000 };
}
