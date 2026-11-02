import { defineConfig } from 'drizzle-kit';
// Generation and checks only; no database credentials. Apply with bin/schema.ts.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  schemaFilter: ['app'],
  strict: true,
  verbose: true
});
