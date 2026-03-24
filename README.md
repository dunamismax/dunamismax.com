# dunamismax.com

**The personal site, portfolio, and writing surface for Stephen Sawyer.**

dunamismax.com is the public-facing home for everything I build. It is a single Astro site that ships fast, stays small, and proves the stack by being built with it.

The site itself is the portfolio entry. If the page loads in under a second, renders without JavaScript, looks good on a phone, and does not ask for cookies — that is the pitch.

## Stack

- **Bun** for toolchain, installs, scripts, and local development
- **TypeScript** in strict mode
- **Astro** for static-first rendering with SSR only where it earns its keep
- **Alpine.js** for the small interaction layer
- **CSS variables and hand-written CSS** — no Tailwind, no utility pile, no design-token build machinery
- **Astro content collections** for blog posts and project entries
- **Biome** for lint and formatting
- **Vitest** for tests
- **Static output by default** — SSR only if auth, previews, or request-scoped data later require it

No React. No Vue. No Svelte. No SPA router. No client state library. No GraphQL. No CMS. No analytics scripts. No cookie banners. No framework theater.

## Status

**Phase 0 — not yet implemented.**

The repo exists. This README and [BUILD.md](BUILD.md) describe the target architecture and product shape. Nothing ships today.

## Domain strategy

| Domain | Role |
| --- | --- |
| `dunamismax.com` | Primary personal site: home, portfolio, blog, about, contact, and links to active projects. |

## What the site covers

### Home

The landing page. One screen that communicates who I am, what I build, and where to go next. No hero animations. No scroll-jacking. Fast, sharp, memorable.

### Portfolio

The active project roster. Each entry links to the repo and — when the product ships a browser surface — to the live product. Projects are grouped the same way the profile README groups them: browser-first products, infrastructure and observability, security and custody, developer tooling, and systems work. Status is honest: if it is Phase 0, it says Phase 0.

### Blog

Long-form technical writing. Markdown files in Astro content collections, rendered at build time. No CMS, no database, no comment system in v1. Topics: systems design, self-hosting, Go/Zig/C craft, operational discipline, product thinking, and lessons from shipping.

### About

Who I am. What I care about. The stack philosophy and why it exists. Short, direct, no resume theater.

### Contact

How to reach me. Channels listed clearly, no contact form in v1 unless it earns its keep later.

- Email: dunamismax@tutamail.com
- Signal: [signal.me link](https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph)
- GitHub: [dunamismax](https://github.com/dunamismax)
- Twitter: [DunamisMax](https://x.com/DunamisMax)
- Reddit: [DunamisMax](https://www.reddit.com/user/DunamisMax/)

## Intended repo layout

```text
dunamismax.com/
├── public/
│   ├── fonts/
│   └── og/
├── src/
│   ├── components/
│   ├── content/
│   │   ├── blog/
│   │   └── projects/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   │   ├── blog/
│   │   └── projects/
│   └── styles/
│       ├── base.css
│       └── tokens.css
├── scripts/
├── tests/
├── astro.config.mjs
├── biome.json
├── package.json
├── tsconfig.json
├── BUILD.md
└── README.md
```

## Build and run

### Prerequisites

- Bun 1.3+

### Local development

```bash
bun install
bun run dev
```

### Build

```bash
bun run build
```

### Quality checks

```bash
bun run check    # biome check . && astro check
bun run test     # vitest run
bun run format   # biome format . --write
```

## Design direction

Dark by default. The site should feel like a terminal that learned typography.

- High-contrast dark palette with one accent color
- Monospace for code and headings where it fits; clean sans-serif for body text
- Generous whitespace, tight line lengths, no visual clutter
- Subtle motion only — no parallax, no scroll hijacking, no entrance animations
- Every page useful without JavaScript
- Fast enough that the network tab is boring
- Mobile-first layout that does not feel like a concession

The aesthetic target: if a senior engineer opened the site at 2am while debugging something, they would not close the tab.

## Development rules

1. Ship static HTML first. Add SSR only when a page genuinely needs request-scoped data.
2. Keep Alpine interactions small. If a component needs more than ~30 lines of Alpine, reconsider the approach.
3. Blog posts are Markdown in content collections, not a database.
4. Project data is a content collection or a simple TypeScript data file, not a CMS.
5. No client-side routing. Every page is a full page load. That is a feature.
6. No third-party analytics. If traffic data matters later, use server-side access logs.
7. No cookie banner because there are no cookies.
8. Keep the dependency count low enough to audit in five minutes.
9. Fonts are self-hosted. No Google Fonts CDN call.
10. Images are optimized at build time. No lazy-load library.
11. If the docs and the site disagree, fix both.

## License

MIT
