# dunamismax.com

**The personal site, portfolio, and writing surface for Stephen Sawyer.**

dunamismax.com is the public-facing home for everything I build. It is a single-page application that ships fast, stays small, and proves the stack by being built with it.

The site itself is the portfolio entry. If the page loads in under a second, looks good on a phone, and does not ask for cookies — that is the pitch.

> **Status:** Implemented. The React + Vite SPA, tests, CI, and Docker/Caddy deploy path all exist in-repo today. Public availability depends on the deployed container being current and healthy.

## Stack

- **Bun** for toolchain, installs, scripts, and local development
- **TypeScript** in strict mode
- **Vite** for build and dev server
- **React** for the UI framework
- **TanStack Router** for type-safe file-based routing
- **Tailwind CSS** alongside hand-written CSS design tokens
- **Biome** for lint and formatting
- **Vitest** for tests
- **Static output** — Vite builds to `dist/`, served by any static file server with SPA catch-all

No database. No CMS. No analytics scripts. No cookie banners. No framework theater.

## Domain strategy

| Domain | Role |
| --- | --- |
| `dunamismax.com` | Primary personal site: home, portfolio, blog, about, contact, and links to active projects. |

## Product Surfaces

### Home

The landing page. One screen that communicates who I am, what I build, and where to go next. No hero animations. No scroll-jacking. Fast, sharp, memorable.

### Portfolio

The active project roster. Each entry links to the repo. Projects are grouped by category: apps, infrastructure, security, developer tooling. Status is honest: if it is Phase 0, it says Phase 0.

### Blog

Long-form technical writing. Posts live as data in the repo, rendered with react-markdown. No CMS, no database, no comment system. Topics: systems design, self-hosting, Go/Rust craft, operational discipline, product thinking, and lessons from shipping.

### About

Who I am. What I care about. The stack philosophy and why it exists. Short, direct, no resume theater.

### Contact

How to reach me. Channels listed clearly, no contact form.

- Email: dunamismax@tutamail.com
- Signal: [signal.me link](https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph)
- GitHub: [dunamismax](https://github.com/dunamismax)
- Twitter: [DunamisMax](https://x.com/DunamisMax)
- Reddit: [DunamisMax](https://www.reddit.com/user/DunamisMax/)

## Repository Layout

```text
dunamismax.com/
├── public/
│   ├── fonts/
│   └── og/
├── src/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   │   └── blog/
│   ├── styles/
│   └── main.tsx
├── tests/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── biome.json
├── package.json
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
bun run check    # biome check . && vitest run
bun run lint     # biome check .
bun run test     # vitest run
bun run format   # biome format . --write
```

## Design direction

Dark by default. The site should feel like a terminal that learned typography.

- High-contrast dark palette with one accent color
- Monospace for code and headings where it fits; clean sans-serif for body text
- Generous whitespace, tight line lengths, no visual clutter
- Subtle motion only — no parallax, no scroll hijacking, no entrance animations
- Fast enough that the network tab is boring
- Mobile-first layout that does not feel like a concession

The aesthetic target: if a senior engineer opened the site at 2am while debugging something, they would not close the tab.

## Development rules

1. Blog posts are data in the repo, not a database.
2. Project data is a TypeScript data file, not a CMS.
3. No third-party analytics. If traffic data matters later, use server-side access logs.
4. No cookie banner because there are no cookies.
5. Keep the dependency count low enough to audit in five minutes.
6. Fonts are self-hosted. No Google Fonts CDN call.
7. If the docs and the site disagree, fix both.

## License

MIT
