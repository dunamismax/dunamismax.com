import type { CollectionEntry } from 'astro:content'

export const WORDS_PER_MINUTE = 230

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

export function getReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return `${minutes} min read`
}

export function formatDate(date: Date): string {
  return shortDateFormatter.format(date)
}

export function formatDateLong(date: Date): string {
  return longDateFormatter.format(date)
}

export function isPublishedPost(entry: CollectionEntry<'blog'>): boolean {
  return !entry.data.draft
}

export function sortPosts(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return [...posts].sort((left, right) => right.data.date.getTime() - left.data.date.getTime())
}
