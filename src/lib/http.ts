// One definition of the read-only HTTP boundary, shared by bin/server.ts (every
// response, including static and prerendered files) and src/hooks.server.ts (SSR
// responses), so the two cannot drift. Changing a value here changes public headers.
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
} as const;
export const ALLOWED_METHODS = ['GET', 'HEAD'] as const;
export const ALLOW_HEADER = ALLOWED_METHODS.join(', ');
export const READ_ONLY_MESSAGE = 'This page is for reading. The site accepts GET and HEAD requests only.';
export const readOnlyMethod = (method: string | undefined): boolean => (ALLOWED_METHODS as readonly string[]).includes(method ?? '');
