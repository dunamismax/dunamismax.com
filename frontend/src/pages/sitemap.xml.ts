import { getCollection } from 'astro:content'

import { isPublishedPost, sortPosts } from '../lib/blog'
import { buildSitemap } from '../lib/machine-surfaces'

export async function GET() {
  const posts = sortPosts(await getCollection('blog', isPublishedPost))

  return new Response(buildSitemap(posts), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
