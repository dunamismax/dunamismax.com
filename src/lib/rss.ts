import { config } from './config.js';
import { xml, escapeHtml, paragraphs } from './text.js';
import type { Post } from './posts.js';
export function rss(posts: Post[]): string {
  const origin = config.origin;
  const date = (value: Date) => value.toUTCString().replace('GMT', '+0000');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>
<title>dunamismax · Blog</title><link>${xml(origin + '/')}</link><description>${xml(config.description)}</description>
<atom:link href="${xml(origin + '/feed.xml')}" rel="self" type="application/rss+xml"/><language>en</language>
<lastBuildDate>${date(posts[0]?.published_at ?? new Date())}</lastBuildDate>
${posts.map(p => { const url = xml(origin + '/blog/' + p.slug); return `<item><title>${xml(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${date(p.published_at)}</pubDate>${p.excerpt ? `<description>${xml(escapeHtml(p.excerpt))}</description>` : ''}<content:encoded>${xml(paragraphs(p.body))}</content:encoded></item>`; }).join('\n')}
</channel></rss>\n`;
}
