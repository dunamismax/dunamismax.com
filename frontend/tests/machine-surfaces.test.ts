import { describe, expect, test } from 'bun:test'

import {
  buildRobotsTxt,
  buildRssFeed,
  buildSitemap,
  formatRssDate,
  type MachineSurfacePost,
  sitemapPagePaths,
} from '../src/lib/machine-surfaces'

const posts: MachineSurfacePost[] = [
  {
    slug: 'hello-world',
    data: {
      title: 'Building this site',
      description:
        'Why I built dunamismax.com with a server-rendered approach and hand-written CSS, and what to expect from this blog.',
      date: new Date('2026-03-23T00:00:00.000Z'),
      tags: ['self-hosting', 'meta'],
    },
  },
]

describe('machine surface helpers', () => {
  test('keeps the sitemap page set aligned with the public route contract', () => {
    expect(sitemapPagePaths).toEqual(['/', '/projects', '/blog', '/about', '/contact'])
  })

  test('formats RSS dates in UTC RFC 2822 form', () => {
    expect(formatRssDate(new Date('2026-03-23T00:00:00.000Z'))).toBe(
      'Mon, 23 Mar 2026 00:00:00 +0000',
    )
  })

  test('builds robots.txt with the production sitemap location', () => {
    expect(buildRobotsTxt()).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://dunamismax.com/sitemap.xml\n',
    )
  })

  test('builds the RSS feed for published posts', () => {
    const feed = buildRssFeed(posts)

    expect(feed).toContain('<rss version="2.0"')
    expect(feed).toContain('<title>Building this site</title>')
    expect(feed).toContain('<link>https://dunamismax.com/blog/hello-world</link>')
    expect(feed).toContain('<category>self-hosting</category>')
    expect(feed).toContain('<category>meta</category>')
    expect(feed).toContain('<lastBuildDate>Mon, 23 Mar 2026 00:00:00 +0000</lastBuildDate>')
  })

  test('builds the sitemap for public pages and blog posts', () => {
    const sitemap = buildSitemap(posts)

    expect(sitemap).toContain('https://dunamismax.com/')
    expect(sitemap).toContain('https://dunamismax.com/projects')
    expect(sitemap).toContain('https://dunamismax.com/blog/hello-world')
    expect(sitemap).toContain('<lastmod>2026-03-23</lastmod>')
  })
})
