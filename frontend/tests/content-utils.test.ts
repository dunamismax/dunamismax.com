import { describe, expect, test } from 'bun:test'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { getReadingTime } from '../src/lib/blog'
import {
  CATEGORY_ORDER,
  groupProjects,
  type ProjectRecord,
  STATUS_LABELS,
} from '../src/lib/projects'

describe('blog utilities', () => {
  test('matches the current reading-time contract', () => {
    expect(getReadingTime('hello world')).toBe('1 min read')
    expect(getReadingTime('word '.repeat(460))).toBe('2 min read')
  })

  test('frontend-owned blog content exists', () => {
    const blogDir = join(import.meta.dir, '..', 'src', 'content', 'blog')
    const posts = readdirSync(blogDir).filter((file) => file.endsWith('.md'))

    expect(posts).toContain('hello-world.md')
  })
})

describe('project utilities', () => {
  test('groups projects by contract order and preserves per-category order', () => {
    const projects: ProjectRecord[] = [
      {
        id: 'wirescope',
        order: 20,
        name: 'wirescope',
        tagline: 'Network observability.',
        category: 'infrastructure',
        status: 'shipped',
        repo: 'https://github.com/dunamismax/wirescope',
        stack: ['Go'],
      },
      {
        id: 'scrybase',
        order: 10,
        name: 'Scrybase',
        tagline: 'Commander intelligence workbench.',
        category: 'apps',
        status: 'active',
        repo: 'https://github.com/dunamismax/scrybase',
        stack: ['Go'],
      },
      {
        id: 'patchworks',
        order: 20,
        name: 'Patchworks',
        tagline: 'SQLite diffs.',
        category: 'apps',
        status: 'active',
        repo: 'https://github.com/dunamismax/patchworks',
        stack: ['Go'],
      },
    ]

    const groups = groupProjects(projects)

    expect(groups.map((group) => group.category)).toEqual(CATEGORY_ORDER.slice(0, 2))
    expect(groups[0]?.projects.map((project) => project.name)).toEqual(['Scrybase', 'Patchworks'])
  })

  test('keeps status labels explicit', () => {
    expect(STATUS_LABELS['phase-0']).toBe('Phase 0')
  })

  test('frontend-owned project data exists', () => {
    const projectsDir = join(import.meta.dir, '..', 'src', 'content', 'projects')
    const projectFiles = readdirSync(projectsDir).filter((file) => file.endsWith('.json'))

    expect(projectFiles.length).toBe(8)
  })
})
