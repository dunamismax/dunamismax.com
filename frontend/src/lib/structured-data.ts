import { siteConfig, toAbsoluteUrl } from '../config/site'

export const WEBSITE_SCHEMA_ID = toAbsoluteUrl('/#website')
export const PERSON_SCHEMA_ID = toAbsoluteUrl('/#person')

export type BlogPostingStructuredDataInput = {
  title: string
  description: string
  path: string
  publishedTime: string
  tags: string[]
}

export function buildWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_SCHEMA_ID,
    name: siteConfig.name,
    alternateName: 'dunamismax',
    url: toAbsoluteUrl('/'),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    author: {
      '@id': PERSON_SCHEMA_ID,
    },
    publisher: {
      '@id': PERSON_SCHEMA_ID,
    },
  }
}

export function buildPersonStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_SCHEMA_ID,
    name: siteConfig.author,
    alternateName: 'dunamismax',
    url: toAbsoluteUrl('/'),
    email: `mailto:${siteConfig.email}`,
    sameAs: [...siteConfig.sameAs],
    knowsAbout: [...siteConfig.knowsAbout],
  }
}

export function buildBlogPostingStructuredData(input: BlogPostingStructuredDataInput) {
  const url = toAbsoluteUrl(input.path)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: toAbsoluteUrl(siteConfig.socialImagePath),
    inLanguage: siteConfig.language,
    datePublished: input.publishedTime,
    dateModified: input.publishedTime,
    keywords: [...input.tags],
    author: {
      '@id': PERSON_SCHEMA_ID,
    },
    publisher: {
      '@id': PERSON_SCHEMA_ID,
    },
    isPartOf: {
      '@id': WEBSITE_SCHEMA_ID,
    },
  }
}
