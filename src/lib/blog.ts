export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	draft: boolean;
	content: string;
}

export const posts: BlogPost[] = [
	{
		slug: "hello-world",
		title: "Building this site",
		description:
			"Why I built dunamismax.com with a static-first approach and hand-written CSS, and what to expect from this blog.",
		date: "2026-03-23",
		tags: ["self-hosting", "meta"],
		draft: false,
		content: `This site exists because I needed a home for the work.

I've been building self-hostable systems software for a while now — file transfer relays, network observability tools, crypto toolkits, incident command systems, repo health daemons. The code lives on GitHub. The ideas live in my head. Neither of those is a great place for someone else to understand what I'm actually doing or why.

So: dunamismax.com. A portfolio, a blog, and a contact page. Nothing more until something earns its spot.

## The stack

The site is built with **React** and **Vite**, rendered as a single-page application with **TanStack Router** for type-safe routing. The styling uses **Tailwind CSS** alongside hand-written CSS with design tokens — keeping the dark, minimal aesthetic that feels like a terminal that learned typography.

Fonts are self-hosted. There are no third-party scripts, no analytics, no tracking pixels, no cookie banner (because there are no cookies). The entire home page transfers under 100KB.

The broader product stack uses **TanStack Router**, **TanStack Query**, **shadcn/ui**, and **Zod** — and this site now runs on the same foundation.

## Why an SPA

Every URL on this site resolves to the same clean, fast experience. The site is built as static assets — a single \`index.html\` entry point with code-split route bundles. Deployment is just "anything that serves files with a catch-all fallback." Caddy, Nginx, S3 — the choice is reversible because the output is just files.

The build is fast. Vite handles code splitting, tree shaking, and asset hashing. No server process at runtime. No database. No CMS. Blog posts live in the repo as data.

## What to expect

The blog will cover what I'm building and how I think about it:

- **Build logs** — honest accounts of shipping a product or feature. What worked, what broke, what I learned.
- **Systems thinking** — architecture decisions, storage tradeoffs, operational discipline.
- **Craft** — Go patterns, Rust systems work, SQLite tricks. Short, specific, useful.
- **Stack philosophy** — why boring infrastructure wins, why self-hosting matters, why the data layer is the truth layer.

No listicles. No engagement bait. No "10 things I learned" titles. I'll write like I'm explaining a decision to a colleague who will call me on it if the reasoning doesn't hold up.

Cadence target: one post every week or two. Quality over quantity.

The code for this site is open: [github.com/dunamismax/dunamismax.com](https://github.com/dunamismax/dunamismax.com).`,
	},
];

export function getPublishedPosts(): BlogPost[] {
	return posts
		.filter((p) => !p.draft)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
	return posts.find((p) => p.slug === slug && !p.draft);
}
