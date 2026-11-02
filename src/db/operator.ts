import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleQueryError } from 'drizzle-orm/errors';
import { pgConfig } from '../lib/credentials.js';
// One dedicated session per operator command, from that identity's protected configuration.
export interface OperatorConnection { client: pg.Client; db: NodePgDatabase }
export async function operatorConnection(env: Record<string,string>, role: 'dunamismax_publishing' | 'dunamismax_migration'): Promise<OperatorConnection> {
  const client = new pg.Client(pgConfig(env, role));
  await client.connect();
  return { client, db: drizzle(client) };
}
// Drizzle query errors embed SQL parameters (post bodies); report only validation messages.
export function safeMessage(error: unknown, fallback: string): string {
  return error instanceof Error && !(error instanceof DrizzleQueryError) && !('code' in error) && error.cause === undefined ? error.message : fallback;
}
