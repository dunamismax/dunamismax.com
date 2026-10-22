export function configuration(env: NodeJS.ProcessEnv) {
  const mode = env.APP_ENV ?? 'production';
  if (!['local', 'test', 'production'].includes(mode)) throw new Error('Invalid APP_ENV');
  const origin = env.APP_URL ?? 'https://dunamismax.com';
  const url = new URL(origin);
  if (url.origin !== origin || url.username || url.password || (mode === 'production' && url.protocol !== 'https:') || !['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid canonical origin');
  return { origin, production: mode === 'production', description: 'Stephen Sawyer: Astro, TypeScript, and PostgreSQL web development, Python automation, company-wide RustDesk support, and self-hosted Ubuntu systems.' };
}
export const config = configuration(process.env);
