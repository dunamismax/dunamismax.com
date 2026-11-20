// Portfolio inventory. Every claim here is grounded in the dated evidence in
// docs/portfolio.md; recheck the project's runtime and documentation before
// changing a status, stack or description. Anchor ids are public URLs: keep them.

export type StatusTone = 'active' | 'shipped' | 'phase-0';

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  tone: StatusTone;
  role: string;
  tagline: string;
  detail: string;
  stack: readonly string[];
  links: readonly ProjectLink[];
  note?: string;
  featured?: boolean;
}

export interface ProjectGroup {
  id: string;
  title: string;
  summary: string;
  projects: readonly Project[];
}

const gh = (repo: string) => `https://github.com/dunamismax/${repo}`;

const lorehallow: Project = {
  id: 'lorehallow',
  name: 'Lorehallow',
  status: 'Pre-alpha',
  tone: 'phase-0',
  role: 'Multiplayer game · Design, server & hosting',
  tagline: 'A small pixel-art fantasy MMO built around a shared, persistent world, in the spirit of early World of Warcraft: zones, quests, grouping, and other people already there when you log in.',
  detail: 'The authoritative game server is Go, with each zone owned by a single goroutine and a versioned Protocol Buffers protocol. It targets hundreds to thousands of connected players, and no number is claimed until it is measured. lorehallow.com publishes the full build plan, a live progress tracker, and a devlog; an early Phaser browser prototype is open at play.lorehallow.com.',
  stack: ['Go', 'Protocol Buffers', 'TypeScript', 'SvelteKit', 'Caddy'],
  links: [
    { label: 'Website', href: 'https://lorehallow.com' },
    { label: 'Source', href: gh('lorehallow') },
  ],
};

const rivermind: Project = {
  id: 'rivermind-poker',
  name: 'RiverMind Poker',
  status: 'Live',
  tone: 'active',
  role: 'Poker AI · Development & hosting',
  tagline: 'Free no-limit Texas hold’em in the browser, at tables of two to nine seats against bots that are always labelled as bots. Play money only.',
  detail: 'A Python table server with a fuzz-tested no-limit engine and hand histories streams play over WebSockets to a SvelteKit client that works on desktop and mobile. A separate training pipeline uses Monte Carlo counterfactual regret minimization to build stronger bots. It grew out of an open-source, Pluribus-inspired codebase and stays GPL-licensed.',
  stack: ['Python', 'SvelteKit', 'TypeScript', 'PostgreSQL', 'WebSockets'],
  links: [
    { label: 'Play', href: 'https://rivermindpoker.com' },
    { label: 'Source', href: gh('rivermind-poker') },
  ],
};

const azerothtrail: Project = {
  id: 'azeroth-trail',
  name: 'Azeroth Trail',
  status: 'Live',
  tone: 'active',
  role: 'Game guide · Development & hosting',
  tagline: 'A World of Warcraft leveling guide for Paladins and Druids that answers one question for every spec: what should I do at my level?',
  detail: 'Levels 1 to 60 with zones, quests, training, talent order, and dungeons, sourced and dated. A verifier fails the build if a talent build drifts from its source. Static pages work with JavaScript off, and a small Node service tracks server status in every region and sends Web Push alerts when servers come back.',
  stack: ['Astro', 'TypeScript', 'Node.js', 'Web Push', 'Caddy'],
  links: [
    { label: 'Website', href: 'https://azerothtrail.com' },
    { label: 'Source', href: gh('azerothtrail') },
  ],
};

const vincentsawyer: Project = {
  id: 'vincent-sawyer',
  name: 'vincentsawyer.org',
  status: 'Live',
  tone: 'active',
  role: 'Ministry archive · Development & hosting',
  tagline: 'The website and permanent archive of my father’s ministry: sermons, Bible studies, and pastoral training from decades of preaching and teaching.',
  detail: 'More than thirty courses with syllabi and teaching notes, Scripture-indexed resources, and featured sermons, served by SvelteKit and PostgreSQL with Drizzle. Original files are preserved byte-for-byte behind a validated, checksummed content catalog.',
  stack: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Drizzle'],
  links: [{ label: 'Visit website', href: 'https://vincentsawyer.org' }],
};

const grace: Project = {
  id: 'grace-and-footnotes',
  name: 'Grace & Footnotes',
  status: 'Live',
  tone: 'active',
  role: 'Publishing · Development & hosting',
  tagline: 'My Christian writing website, built around a readable, accessible publishing experience and content I host myself.',
  detail: 'SvelteKit and PostgreSQL with Drizzle serve essays, scheduled publication, RSS, study dates, and downloadable resources, with no browser JavaScript. A shell-based publishing workflow uses its own database identity, kept apart from the public website.',
  stack: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Drizzle'],
  links: [{ label: 'Visit website', href: 'https://graceandfootnotes.com' }],
};

const site: Project = {
  id: 'personal-website',
  name: 'dunamismax.com',
  status: 'Live',
  tone: 'active',
  role: 'Portfolio · Development & hosting',
  tagline: 'This portfolio and blog: SvelteKit, Svelte, strict TypeScript, PostgreSQL with Drizzle ORM, semantic HTML, and Tailwind CSS. No browser JavaScript.',
  detail: 'Prerendered pages, server-rendered posts and RSS, a read-only public database account, and immutable, versioned releases behind Caddy keep the application small and inspectable.',
  stack: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Node.js', 'Caddy'],
  links: [{ label: 'Source', href: gh('dunamismax.com') }],
};

const imaging: Project = {
  id: 'imaging-services',
  name: 'Imaging Services website',
  status: 'Hosted demo',
  tone: 'phase-0',
  role: 'Business website · Development & deployment',
  tagline: 'A bespoke replacement for an existing WordPress website, covering company services, equipment, practice specialties, and contact information.',
  detail: 'Thirteen approved pages run as a review demo on Astro, strict TypeScript, and PostgreSQL with a typed Drizzle data layer. A SvelteKit port is approved to go live on the demo before launch; the company’s main website has not been cut over.',
  stack: ['Astro', 'SvelteKit', 'TypeScript', 'PostgreSQL', 'Drizzle'],
  links: [],
  note: 'Demo under review · Private source',
};

const fieldcadence: Project = {
  id: 'field-cadence',
  name: 'Field Cadence',
  status: 'In development',
  tone: 'phase-0',
  role: 'Field-service platform · Product & engineering',
  tagline: 'Service-desk software for x-ray and imaging dealers that knows when every machine is due: customers, sites, equipment by serial number, tickets, and recurring requirements.',
  detail: 'Next due dates are computed, never typed. A nightly run proposes who should do the work and when, the office dispatches from a web board, and technicians close tickets from their phones, even with no signal. SvelteKit, PostgreSQL, Drizzle, and Better Auth, with a SwiftUI iPhone app on the same API. The foundation is built and tested; nothing is deployed yet.',
  stack: ['SvelteKit', 'TypeScript', 'PostgreSQL', 'Better Auth', 'SwiftUI'],
  links: [],
  note: 'Private source · Not yet deployed',
};

const daybyword: Project = {
  id: 'day-by-word',
  name: 'Day by Word',
  status: 'In development',
  tone: 'phase-0',
  role: 'Bible reading app · iPhone, iPad & web',
  tagline: 'A Bible reading companion: find a plan that fits, see today’s reading at a glance, keep an honest record, and get a welcoming way back after missed days.',
  detail: 'A native iPhone and iPad app in Swift and SwiftUI, with reminders and widgets, plus a web version moving to SvelteKit and PostgreSQL. It never shows Bible text itself; you keep reading in your own Bible or app. Not yet released.',
  stack: ['Swift', 'SwiftUI', 'SvelteKit', 'TypeScript', 'PostgreSQL'],
  links: [{ label: 'Source', href: gh('daybyword') }],
};

const rustdesk: Project = {
  id: 'rustdesk',
  name: 'RustDesk remote support',
  status: 'In service',
  tone: 'active',
  role: 'Company IT · Deployment & operations',
  tagline: 'I self-host RustDesk for my entire company, with the server and relay running on Ubuntu in Docker. The customer-facing support site at xrayservice.net provides a preconfigured Windows client.',
  detail: 'I maintain the download flow, weekly installer builds with checksum, Authenticode, and certificate verification, monitoring, and daily service backups. Customers get connected without entering any server settings.',
  stack: ['RustDesk', 'Docker', 'Ubuntu', 'Caddy', 'Astro', 'Windows'],
  links: [{ label: 'Support website', href: 'https://xrayservice.net' }],
  featured: true,
};

const status: Project = {
  id: 'status',
  name: 'Dunamis Status',
  status: 'Live',
  tone: 'active',
  role: 'Monitoring · Development & operations',
  tagline: 'A self-hosted operations dashboard for website health, services, backups, incidents, deployments, and repository status.',
  detail: 'A five-minute TypeScript collector records bounded checks in PostgreSQL. The SvelteKit site reads those snapshots through a separate, read-only account and marks stale data instead of presenting it as current.',
  stack: ['SvelteKit', 'TypeScript', 'PostgreSQL', 'Drizzle', 'systemd'],
  links: [
    { label: 'View status', href: 'https://status.dunamismax.com' },
    { label: 'Source', href: gh('status.dunamismax') },
  ],
};

const backups: Project = {
  id: 'backups',
  name: 'Server backup & recovery',
  status: 'Scheduled',
  tone: 'active',
  role: 'Infrastructure · Recovery planning',
  tagline: 'Daily backup automation for the Ubuntu server, its PostgreSQL databases, and the RustDesk service.',
  detail: 'Nightly PostgreSQL dumps, configuration, and service inventory are encrypted with age and kept off the server, restores are checked in an isolated PostgreSQL instance, and rebuild instructions stay current. Recovery planning is part of operating the service.',
  stack: ['Ubuntu', 'PostgreSQL', 'age', 'systemd', 'Bash'],
  links: [],
  note: 'Private operational tooling',
};

const ddns: Project = {
  id: 'dns-automation',
  name: 'Dynamic DNS automation',
  status: 'Scheduled',
  tone: 'active',
  role: 'Network operations · Automation',
  tagline: 'A TypeScript command-line updater keeps selected Cloudflare DNS records aligned with the server’s public address.',
  detail: 'A systemd timer runs every five minutes. It manages an explicit list of records by exact ID, checks for drift even when the address has not changed, and has a dry-run mode so changes can be inspected before they are applied.',
  stack: ['TypeScript', 'Cloudflare API', 'Node.js', 'systemd'],
  links: [],
  note: 'Part of the support infrastructure',
};

const mtg: Project = {
  id: 'mtg-card-bot',
  name: 'MTG Card Bot',
  status: 'In service',
  tone: 'active',
  role: 'Community tooling · Development & operations',
  tagline: 'A Discord bot that brings Magic: The Gathering card search, pricing, legality, and rulings into the conversation using Scryfall data.',
  detail: 'Inline [[card]] lookups, prefix commands, and slash commands with live autocomplete, plus typo-tolerant matching and composite images for multi-card requests. Python 3.13, discord.py, and httpx respect Scryfall’s rate limits and cache responses; it runs as a systemd service on Ubuntu.',
  stack: ['Python', 'discord.py', 'httpx', 'uv', 'systemd'],
  links: [{ label: 'Source', href: gh('mtg-card-bot') }],
};

const cbook: Project = {
  id: 'c-from-the-ground-up',
  name: 'C From The Ground Up',
  status: 'Published',
  tone: 'shipped',
  role: 'Open-source book · Writing & teaching',
  tagline: 'A progressive C workbook, from Hello World to sockets, processes, threads, and an ncurses text adventure, readable online as a book.',
  detail: 'Five parts of short, runnable lessons with the explanation in the comments and the code inline, built against C23 with a C17 fallback. It is my most-starred public repository.',
  stack: ['C', 'POSIX', 'ncurses', 'Make', 'mdBook'],
  links: [
    { label: 'Read online', href: 'https://dunamismax.github.io/c-from-the-ground-up/' },
    { label: 'Source', href: gh('c-from-the-ground-up') },
  ],
};

export const projectGroups: readonly ProjectGroup[] = [
  {
    id: 'group-games',
    title: 'Games & play',
    summary: 'Multiplayer and game projects with real servers behind them, from an MMO backend in Go to a poker AI you can sit down against.',
    projects: [lorehallow, rivermind, azerothtrail],
  },
  {
    id: 'group-apps',
    title: 'Websites & publishing',
    summary: 'Purpose-built SvelteKit, TypeScript, and PostgreSQL applications, from family and personal publishing to a business website replacement.',
    projects: [vincentsawyer, grace, site, imaging],
  },
  {
    id: 'group-in-development',
    title: 'Apps in development',
    summary: 'Products under active construction, built in the open where the source is public and described only as far as they actually go.',
    projects: [fieldcadence, daybyword],
  },
  {
    id: 'group-infrastructure',
    title: 'Infrastructure & support',
    summary: 'Services I operate: remote access for the company, visibility into system health, DNS, and recovery workflows.',
    projects: [rustdesk, status, backups, ddns],
  },
  {
    id: 'group-developer-tools',
    title: 'Bots, tools & teaching',
    summary: 'Small, focused programs and open-source teaching material that other people actually use.',
    projects: [mtg, cbook],
  },
];

export const allProjects: readonly Project[] = projectGroups.flatMap((group) => group.projects);

/** Shown on the home page, in this order. */
export const featuredProjects: readonly Project[] = [rustdesk, lorehallow, rivermind, azerothtrail, vincentsawyer, status];
