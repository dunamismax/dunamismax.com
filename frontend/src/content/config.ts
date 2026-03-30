import { defineCollection, z } from 'astro:content'

import { CATEGORY_ORDER, PROJECT_STATUSES } from '../lib/projects'

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
    order: z.number().int().min(0),
    name: z.string(),
    tagline: z.string(),
    category: z.enum(CATEGORY_ORDER),
    status: z.enum(PROJECT_STATUSES),
    repo: z.string().url(),
    stack: z.array(z.string()),
    url: z.string().url().optional(),
  }),
})

export const collections = { blog, projects }
