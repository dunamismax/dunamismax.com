export type PageContract = {
  id: 'home' | 'projects' | 'blog' | 'about' | 'contact' | 'not-found'
  label: string
  path: string
  title: string
  description: string
  ogType?: 'website' | 'article'
}

export type MachineSurfaceContract = {
  path: string
  kind: 'rss' | 'sitemap' | 'robots' | 'health'
  notes: string
}

export const siteConfig = {
  name: 'dunamismax.com',
  author: 'Stephen Sawyer',
  siteUrl: 'https://dunamismax.com',
  title: 'Stephen Sawyer',
  description: 'Building self-hostable systems software. Python, Go, Rust, and the web.',
  language: 'en',
  themeColor: '#0a0a0b',
  socialImagePath: '/og/default.png',
  faviconPath: '/favicon.svg',
  rssPath: '/feed.xml',
  twitterSite: '@DunamisMax',
} as const

export const pageContracts: PageContract[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    title: 'Stephen Sawyer -- dunamismax',
    description:
      'Building self-hostable systems software. Python, Go, Rust, and the web. Local-first, operator-friendly, relational data.',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    title: 'Projects -- Stephen Sawyer',
    description:
      'Active project roster. Self-hostable systems software in Python, Go, Rust, and the web.',
  },
  {
    id: 'blog',
    label: 'Blog',
    path: '/blog',
    title: 'Blog -- Stephen Sawyer',
    description:
      'Technical writing on systems design, self-hosting, Go, Rust, and operational discipline.',
  },
  {
    id: 'about',
    label: 'About',
    path: '/about',
    title: 'About -- Stephen Sawyer',
    description: 'Who I am, what I care about, and how I build durable software.',
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    title: 'Contact -- Stephen Sawyer',
    description: 'How to reach Stephen Sawyer. Email, Signal, GitHub, Twitter, Reddit.',
  },
  {
    id: 'not-found',
    label: '404',
    path: '/404',
    title: '404 -- Not Found',
    description: 'Page not found.',
  },
] as const

export const machineSurfaceContracts: MachineSurfaceContract[] = [
  {
    path: '/feed.xml',
    kind: 'rss',
    notes: 'RSS 2.0 feed for published blog posts.',
  },
  {
    path: '/sitemap.xml',
    kind: 'sitemap',
    notes: 'Sitemap for static public pages and published blog posts.',
  },
  {
    path: '/robots.txt',
    kind: 'robots',
    notes: 'Crawler policy and sitemap location.',
  },
  {
    path: '/health',
    kind: 'health',
    notes: 'Static-equivalent or deploy-layer health probe.',
  },
] as const

export const socialLinks = [
  {
    label: 'Email',
    href: 'mailto:dunamismax@tutamail.com',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/dunamismax',
  },
  {
    label: 'Twitter',
    href: 'https://x.com/DunamisMax',
  },
  {
    label: 'Signal',
    href: 'https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph',
  },
] as const

export function toAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.siteUrl}${normalizedPath}`
}

export function getPageContract(id: PageContract['id']): PageContract {
  const page = pageContracts.find((entry) => entry.id === id)

  if (!page) {
    throw new Error(`Unknown page contract: ${id}`)
  }

  return page
}
