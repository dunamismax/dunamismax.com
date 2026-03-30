export const CATEGORY_LABELS = {
  apps: 'Apps',
  infrastructure: 'Infrastructure',
  'developer-tools': 'Developer Tools',
  reference: 'Reference',
} as const

export const CATEGORY_ORDER = ['apps', 'infrastructure', 'developer-tools', 'reference'] as const

export const PROJECT_STATUSES = ['active', 'shipped', 'phase-0', 'legacy'] as const

export const STATUS_LABELS = {
  active: 'Active',
  shipped: 'Shipped',
  'phase-0': 'Phase 0',
  legacy: 'Legacy',
} as const

export type ProjectCategory = (typeof CATEGORY_ORDER)[number]
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export type ProjectRecord = {
  id: string
  order: number
  name: string
  tagline: string
  category: ProjectCategory
  status: ProjectStatus
  repo: string
  stack: string[]
  url?: string
}

export type ProjectGroup = {
  category: ProjectCategory
  label: (typeof CATEGORY_LABELS)[ProjectCategory]
  projects: ProjectRecord[]
}

export function groupProjects(projects: ProjectRecord[]): ProjectGroup[] {
  return CATEGORY_ORDER.reduce<ProjectGroup[]>((groups, category) => {
    const groupedProjects = projects
      .filter((project) => project.category === category)
      .sort((left, right) => left.order - right.order)

    if (groupedProjects.length === 0) {
      return groups
    }

    groups.push({
      category,
      label: CATEGORY_LABELS[category],
      projects: groupedProjects,
    })

    return groups
  }, [])
}
