export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'}[c]!));
export const xml = (text: string): string => escapeHtml(text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/gu, '\uFFFD'));
export function paragraphs(text: string): string {
  return text.trim().split(/(?:\r\n|[\n\r\u0085\u2028\u2029])\s*(?:\r\n|[\n\r\u0085\u2028\u2029])/u).map(p => '<p>' + escapeHtml(p).replace(/\r\n|[\n\r\u0085\u2028\u2029]/g, '<br>\n') + '</p>').join('\n');
}
export const readingMinutes = (text: string): number => Math.max(1, Math.ceil((text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0) / 220));
export const shortDate = (date: Date): string => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
