import { describe, expect, test } from 'bun:test'

import {
  getPageContract,
  machineSurfaceContracts,
  pageContracts,
  siteConfig,
  toAbsoluteUrl,
} from '../src/config/site'

describe('site config', () => {
  test('builds absolute URLs from bare paths', () => {
    expect(toAbsoluteUrl('blog')).toBe('https://dunamismax.com/blog')
    expect(toAbsoluteUrl('/projects/')).toBe('https://dunamismax.com/projects/')
  })

  test('freezes current public page contracts', () => {
    expect(pageContracts.map((page) => page.path)).toEqual([
      '/',
      '/projects/',
      '/blog/',
      '/about/',
      '/contact/',
      '/404/',
    ])
    expect(getPageContract('home').title).toBe('Stephen Sawyer -- dunamismax')
  })

  test('keeps machine surfaces explicit', () => {
    expect(machineSurfaceContracts.map((surface) => surface.path)).toEqual([
      '/feed.xml',
      '/sitemap.xml',
      '/robots.txt',
      '/health',
    ])
    expect(siteConfig.rssPath).toBe('/feed.xml')
  })
})
