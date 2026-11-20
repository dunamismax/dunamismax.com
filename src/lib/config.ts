export function configuration(env: NodeJS.ProcessEnv) {
  const mode = env.APP_ENV ?? 'production';
  if (!['local', 'test', 'production'].includes(mode)) throw new Error('Invalid APP_ENV');
  const origin = env.APP_URL ?? 'https://dunamismax.com';
  const url = new URL(origin);
  if (url.origin !== origin || url.username || url.password || (mode === 'production' && url.protocol !== 'https:') || !['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid canonical origin');
  return { origin, production: mode === 'production', description: 'Stephen Sawyer: full-stack developer and sysadmin. SvelteKit, TypeScript, and PostgreSQL web apps, Go and Python game servers, company-wide RustDesk support, and self-hosted Ubuntu infrastructure.' };
}
export const config = configuration(process.env);
