import { readFileSync } from 'node:fs';
import pg from 'pg';
import { protectedEnv, pgConfig } from '../src/lib/credentials.js';
const env=protectedEnv(process.env.MIGRATION_CONFIG ?? '/etc/astro-apps/dunamismax/migration.env');
const client=new pg.Client(pgConfig(env,'dunamismax_migration'));
try {await client.connect();await client.query(readFileSync('database/schema.sql','utf8'));console.log('PostgreSQL schema applied as dunamismax_owner.');} catch {console.error('Schema application failed.');process.exitCode=1;} finally {await client.end();}
