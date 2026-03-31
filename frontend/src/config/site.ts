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

export type NavLink = {
  href: string
  label: string
  matches: (path: string) => boolean
}

export type ContactChannel = {
  label: string
  href: string
  display: string
  external: boolean
}

export const siteConfig = {
  name: 'dunamismax.com',
  author: 'Stephen Sawyer',
  siteUrl: 'https://dunamismax.com',
  title: 'Stephen Sawyer',
  description: 'Building self-hostable software in Python, Go, and TypeScript.',
  language: 'en',
  themeColor: '#0a0a0b',
  socialImagePath: '/og/default.png',
  faviconPath: '/favicon.svg',
  rssPath: '/feed.xml',
  twitterSite: '@DunamisMax',
  email: 'dunamismax@tutamail.com',
  sameAs: [
    'https://github.com/dunamismax',
    'https://x.com/DunamisMax',
    'https://www.reddit.com/user/DunamisMax/',
  ],
  knowsAbout: ['Python', 'Go', 'TypeScript', 'Bun', 'Astro', 'Vue', 'PostgreSQL', 'self-hosting'],
} as const

export const pageContracts: PageContract[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    title: 'Stephen Sawyer -- dunamismax',
    description:
      'Building self-hostable software in Python, Go, and TypeScript. Astro-first web apps, local-first bias, relational data.',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    title: 'Projects -- Stephen Sawyer',
    description:
      'Active project roster across full-stack web apps, Go systems work, Python automation, and selective Rust maintenance.',
  },
  {
    id: 'blog',
    label: 'Blog',
    path: '/blog',
    title: 'Blog -- Stephen Sawyer',
    description:
      'Technical writing on Bun and Astro web apps, Go systems work, Python automation, self-hosting, and operational discipline.',
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

export const navLinks: NavLink[] = [
  {
    href: '/',
    label: 'Home',
    matches: (path) => path === '/',
  },
  {
    href: '/projects',
    label: 'Projects',
    matches: (path) => path === '/projects',
  },
  {
    href: '/blog',
    label: 'Blog',
    matches: (path) => path === '/blog' || path.startsWith('/blog/'),
  },
  {
    href: '/about',
    label: 'About',
    matches: (path) => path === '/about',
  },
] as const

export const socialLinks = [
  {
    label: 'Email',
    href: `mailto:${siteConfig.email}`,
    rel: 'me',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/dunamismax',
    rel: 'noopener noreferrer me',
  },
  {
    label: 'Twitter',
    href: 'https://x.com/DunamisMax',
    rel: 'noopener noreferrer me',
  },
] as const

export const contactChannels: ContactChannel[] = [
  {
    label: 'Email',
    href: `mailto:${siteConfig.email}`,
    display: siteConfig.email,
    external: false,
  },
  {
    label: 'Signal',
    href: 'https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph',
    display: 'Signal',
    external: true,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/dunamismax',
    display: 'dunamismax',
    external: true,
  },
  {
    label: 'Twitter',
    href: 'https://x.com/DunamisMax',
    display: '@DunamisMax',
    external: true,
  },
  {
    label: 'Reddit',
    href: 'https://www.reddit.com/user/DunamisMax/',
    display: 'u/DunamisMax',
    external: true,
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
