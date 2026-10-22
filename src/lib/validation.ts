export const BODY_BYTES = 16777215;
export interface EditablePost { slug: string; title: string; excerpt: string; body: string; status: string; published_at: Date | null }
export function validateSlug(slug: string): void { if (slug.length > 180 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Slug must be 1–180 lowercase ASCII letters/digits separated by single hyphens.'); }
export function timestamp(input: string): Date {
  const match = /^([1-9][0-9]{3}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})(Z|[+-](?:0[0-9]|1[0-3]):[0-5][0-9]|[+-]14:00)$/.exec(input);
  if (!match || input.endsWith('-00:00')) throw new Error('Use a valid timestamp with a known explicit UTC offset up to ±14:00.');
  const local = new Date(match[1] + 'Z');
  const date = new Date(input);
  if (!Number.isFinite(local.getTime()) || local.toISOString().slice(0,19) !== match[1] || !Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1000 || date.getUTCFullYear() > 9999) throw new Error('Invalid calendar date or publication time.');
  return date;
}
export function validatePost(post: EditablePost): void {
  validateSlug(post.slug);
  for (const [field, limit] of [['title',240],['excerpt',600],['body',null]] as const) {
    const value = post[field];
    if (!value.isWellFormed() || (field !== 'excerpt' && !/[^\s\p{Z}]/u.test(value)) || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFE\uFFFF]/u.test(value) || (limit !== null && [...value].length > limit)) throw new Error('Invalid ' + field + ': check required text, Unicode limits and control characters.');
  }
  if (Buffer.byteLength(post.body) > BODY_BYTES) throw new Error('Body exceeds 16777215 UTF-8 bytes.');
  if (!['draft','published'].includes(post.status) || (post.status === 'published' && !post.published_at) || (post.published_at && (!Number.isFinite(post.published_at.getTime()) || post.published_at.getUTCFullYear() < 1000 || post.published_at.getUTCFullYear() > 9999))) throw new Error('Invalid publication status or date.');
}
