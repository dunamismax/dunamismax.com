import { describe, expect, test } from 'bun:test'

import { siteConfig, toAbsoluteUrl } from '../src/config/site'
import {
  buildBlogPostingStructuredData,
  buildPersonStructuredData,
  buildWebsiteStructuredData,
  PERSON_SCHEMA_ID,
  WEBSITE_SCHEMA_ID,
} from '../src/lib/structured-data'

describe('structured data helpers', () => {
  test('builds site identity JSON-LD from the current config', () => {
    const website = buildWebsiteStructuredData()
    const person = buildPersonStructuredData()

    expect(website['@type']).toBe('WebSite')
    expect(website['@id']).toBe(WEBSITE_SCHEMA_ID)
    expect(website.url).toBe(toAbsoluteUrl('/'))
    expect(website.author).toEqual({ '@id': PERSON_SCHEMA_ID })

    expect(person['@type']).toBe('Person')
    expect(person['@id']).toBe(PERSON_SCHEMA_ID)
    expect(person.email).toBe(`mailto:${siteConfig.email}`)
    expect(person.sameAs).toEqual([...siteConfig.sameAs])
    expect(person.knowsAbout).toContain('Astro')
  })

  test('builds blog posting JSON-LD for published posts', () => {
    const structuredData = buildBlogPostingStructuredData({
      title: 'Building this site',
      description: 'Why the site is static-first.',
      path: '/blog/hello-world',
      publishedTime: '2026-03-23T00:00:00.000Z',
      tags: ['self-hosting', 'meta'],
    })

    expect(structuredData['@type']).toBe('BlogPosting')
    expect(structuredData.url).toBe('https://dunamismax.com/blog/hello-world')
    expect(structuredData.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://dunamismax.com/blog/hello-world',
    })
    expect(structuredData.author).toEqual({ '@id': PERSON_SCHEMA_ID })
    expect(structuredData.isPartOf).toEqual({ '@id': WEBSITE_SCHEMA_ID })
    expect(structuredData.keywords).toEqual(['self-hosting', 'meta'])
  })
})
