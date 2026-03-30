import { getCollection } from 'astro:content'

import { isPublishedPost, sortPosts } from '../lib/blog'
import { buildRssFeed } from '../lib/machine-surfaces'

export async function GET() {
  const posts = sortPosts(await getCollection('blog', isPublishedPost))

  return new Response(buildRssFeed(posts), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
