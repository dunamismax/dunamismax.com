import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
})

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    category: z.enum(['apps', 'infrastructure', 'developer-tools', 'reference']),
    status: z.enum(['active', 'shipped', 'phase-0', 'legacy']),
    repo: z.string().url(),
    stack: z.array(z.string()),
    url: z.string().url().optional(),
  }),
})

export const collections = { blog, projects }
