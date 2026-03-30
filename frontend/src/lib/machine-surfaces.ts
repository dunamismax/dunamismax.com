import { pageContracts, siteConfig, toAbsoluteUrl } from '../config/site'

export type MachineSurfacePost = {
  slug: string
  data: {
    title: string
    description: string
    date: Date
    tags: string[]
  }
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

export const sitemapPagePaths = pageContracts
  .filter((page) => page.id !== 'not-found')
  .map((page) => page.path)

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => XML_ESCAPES[character] ?? character)
}

export function formatRssDate(date: Date): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const day = dayNames[date.getUTCDay()]
  const dayOfMonth = String(date.getUTCDate()).padStart(2, '0')
  const month = monthNames[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${day}, ${dayOfMonth} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`
}

export function buildRobotsTxt(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${toAbsoluteUrl('/sitemap.xml')}`, ''].join(
    '\n',
  )
}

export function buildRssFeed(posts: MachineSurfacePost[]): string {
  const lastBuildDate = posts[0] ? formatRssDate(posts[0].data.date) : formatRssDate(new Date())
  const items = posts.map((post) => {
    const postUrl = toAbsoluteUrl(`/blog/${post.slug}`)
    const categories = post.data.tags
      .map((tag) => `      <category>${escapeXml(tag)}</category>`)
      .join('\n')

    return [
      '    <item>',
      `      <title>${escapeXml(post.data.title)}</title>`,
      `      <link>${postUrl}</link>`,
      `      <guid isPermaLink="true">${postUrl}</guid>`,
      `      <pubDate>${formatRssDate(post.data.date)}</pubDate>`,
      `      <description>${escapeXml(post.data.description)}</description>`,
      ...(categories ? [categories] : []),
      '    </item>',
    ].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(siteConfig.name)}</title>`,
    `    <link>${toAbsoluteUrl('/')}</link>`,
    `    <description>${escapeXml(siteConfig.description)}</description>`,
    '    <language>en-us</language>',
    `    <atom:link href="${toAbsoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml" />`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}

export function buildSitemap(posts: MachineSurfacePost[]): string {
  const staticEntries = sitemapPagePaths.map((path) =>
    ['  <url>', `    <loc>${toAbsoluteUrl(path)}</loc>`, '  </url>'].join('\n'),
  )
  const blogEntries = posts.map((post) =>
    [
      '  <url>',
      `    <loc>${toAbsoluteUrl(`/blog/${post.slug}`)}</loc>`,
      `    <lastmod>${post.data.date.toISOString().slice(0, 10)}</lastmod>`,
      '  </url>',
    ].join('\n'),
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...blogEntries,
    '</urlset>',
    '',
  ].join('\n')
}
