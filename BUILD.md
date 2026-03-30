# BUILD.md

## Decision

**Target frontend:** web-only.

This repo should migrate to **TypeScript + Bun + Astro + Vue**. Do **not** add an OpenTUI surface. dunamismax.com is a public site, portfolio, and writing surface. It does not have a real operator workflow that would justify a second terminal frontend.

**Backend call:** no dedicated backend in the target baseline. If a server-side feature later earns one, prefer **Python** over Go for this repo. Do not keep FastAPI around out of nostalgia.

## Why

- The new global web lane is Astro + Vue on Bun.
- This product is content-first, browser-first, and public-facing.
- Current interactivity is low. Astro can own the pages and delivery.
- A TUI would be ceremonial and would not improve the product.
- Go is not justified here. If a thin backend appears later, Python fits content tooling and simple site services better.

## Status snapshot as of 2026-03-30

- [x] The live site in this repo is still the **Python 3.12 + FastAPI + Jinja2** app under `src/app/`.
- [x] **Phase 0** is complete. The current route, metadata, content, and styling contract is frozen in `docs/frontend-contract-inventory.md`.
- [x] **Phase 1** is complete. A sibling **Bun + Astro + Vue** scaffold exists under `frontend/` with static Astro output, centralized site config, content schemas, shared layout shell, and frontend CI checks.
- [ ] **Phases 4 through 6** are not complete. Content ownership and public page parity now live in the frontend, but machine surfaces are not restored in Astro and deployment still serves the Python app.

## Current state summary

Today the repo is a **Python 3.12 + FastAPI + Jinja2** server-rendered site with a separate **Phase 3 Astro frontend migration app**.

What exists now:

- [x] Public pages: `/`, `/projects`, `/blog`, `/blog/{slug}`, `/about`, `/contact`, `404`
- [x] Machine surfaces: `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/health`
- [x] Blog posts and project roster data now live under `frontend/src/content/`
  - The live Python app still consumes that frontend-owned content during the migration.
- [x] Templates live under `src/app/templates/`
- [x] Styling is hand-written CSS under `src/app/static/css/`
- [x] No database, no CMS, no analytics scripts, no cookie banner
- [x] Self-hosted fonts and static assets in the live Python app
- [x] Docker + Caddy deploy path for the live Python app
- [x] Python quality gates: Ruff, Pyright, pytest, smoke script
- [x] Frontend migration contract inventory in `docs/frontend-contract-inventory.md`
- [x] Astro frontend migration app in `frontend/` with Astro, Vue, Biome, Bun tests, static build output, and frontend-owned content collections
- [x] Frontend parity site in Astro
  - The Astro frontend now ships the public HTML route set with shared layout, metadata, content rendering, and the ported CSS system.
- [x] Frontend-owned blog content files
- [x] Frontend-owned project roster data
- [ ] Astro versions of RSS, sitemap, robots, and health
- [ ] Bun/Astro-native deployment as the default serving path

What matters about the current build:

- [x] Route and content shape are already good enough to preserve.
- [x] The repo is static-ish in behavior even though it currently runs through FastAPI.
- [x] The Python runtime mostly exists to render templates and generate machine-readable outputs.
- [x] The migration now has a frozen contract and a real frontend scaffold, so later phases should port against known behavior instead of re-deciding the site.

## Target state summary

The target repo should be an **Astro-first site on Bun** with **Vue only for earned interactivity**.

Target shape:

- [ ] Astro owns routing, layouts, metadata, feed generation, sitemap, and static delivery
- [ ] Vue is optional and used only for components that actually need client state
- [x] Blog posts move out of Python constants into repo-native content files
- [x] Project data becomes typed frontend-owned content, not Python module data
- [x] The site builds as a static or mostly-static web app unless a real server feature appears
- [x] Existing public URLs stay stable
- [x] The design language stays dark, fast, minimal, and self-hosted
- [x] Privacy rules stay intact: no third-party scripts, no analytics, no cookie theater

## Backend notes

### Baseline

The migration should assume **no dedicated backend**.

That means:

- [x] no FastAPI replacement by default
- [x] no Go service
- [x] no database
- [x] no CMS
- [x] no contact form backend unless there is a deliberate later decision

### If server logic becomes necessary later

Choose **Python**, not Go, for this repo's first backend addition.

Valid reasons would be:

- [ ] authenticated admin or draft workflow
- [ ] contact form handling that cannot stay mailto-only
- [ ] build-time or on-demand content ingestion that Astro alone should not own
- [ ] search or feed generation needs that stop being clean build-time work

Invalid reasons:

- [x] preserving the current FastAPI shape because it already exists
- [x] adding an API for a mostly static site
- [x] introducing server complexity before the public site actually needs it

## Data and runtime constraints

Do not break these during migration:

- [x] **No database** in the baseline migration
- [x] **No CMS**
- [x] **No third-party scripts**
- [x] **Self-hosted fonts and assets**
- [x] **Existing route slugs remain stable**
  - The Astro frontend now builds the frozen public route set at `/`, `/projects`, `/blog`, `/blog/{slug}`, `/about`, `/contact`, and `404`.
- [ ] **RSS, sitemap, robots, and health surfaces remain available**
  - They remain available in the live Python app, but not yet in the Astro frontend.
- [x] **Home, projects, blog, about, and contact stay first-class pages**
- [x] **Content remains repo-owned and reviewable in git**
- [x] **Deployment stays self-hostable and boring**

Preferred content direction:

- [x] blog posts: Markdown or MDX in-repo, frontmatter-backed
- [x] project roster: typed data file in TypeScript or JSON validated at build time
- [x] site metadata: centralized config, not scattered across pages

## Risks

1. **Content-model churn**
   - The current blog and project data live in Python modules.
   - Migrating them carelessly can change slugs, dates, reading-time behavior, or metadata.

2. **SEO and metadata regression**
   - Canonical URLs, Open Graph metadata, RSS, sitemap, and robots are already present.
   - Astro must reproduce them before cutover.

3. **Over-hydration**
   - The point of this migration is the new web lane, not a client-heavy rewrite.
   - Vue should stay island-sized.

4. **Deployment drift**
   - The current deploy path assumes a Python container.
   - The cutover should simplify deployment, not invent a more complex runtime.

5. **Scope creep**
   - This is a frontend migration, not a redesign and not a content rewrite.

## Phase checklist

### [x] Phase 0: freeze the current contract

Goal: capture what must survive the rewrite.

Checklist:

- [x] inventory every public route and machine-readable endpoint
- [x] record current metadata behavior and route titles/descriptions
- [x] record blog content, project data shape, and URL slugs
- [x] identify which CSS tokens and layout rules should carry forward unchanged
- [x] decide static versus server-rendered Astro mode based on real needs, not habit
- [x] make the migration acceptance checklist explicit
- [x] leave enough detail that a future subagent can port the site without guessing what matters

Notes:

- Evidence lives in `docs/frontend-contract-inventory.md`.
- The current frontend scaffold already reflects the static-output decision in `frontend/astro.config.mjs`.

### [x] Phase 1: scaffold the Astro + Vue web lane

Goal: create the new frontend shell on Bun.

Checklist:

- [x] initialize Astro with TypeScript on Bun
- [x] add Vue integration, but use it only where interaction is justified
  - Vue is installed and wired in, but no client island behavior ships yet.
- [x] add Biome, `astro check`, and `bun test`
- [x] create the target directory shape for pages, layouts, components, content, and styles
- [x] centralize site metadata and canonical URL configuration
- [x] leave the repo with a clean Astro entrypoint and frontend quality bar
- [x] ensure no Python runtime is required to render the basic page shell in the new frontend

Notes:

- `frontend/package.json`, `frontend/astro.config.mjs`, `frontend/src/config/site.ts`, and the frontend CI job confirm this phase is complete.
- The scaffold is intentionally not the parity site yet.

### [x] Phase 2: move content ownership into the frontend

Goal: stop treating content as Python application code.

Checklist:

- [x] migrate blog posts from Python constants to Markdown or MDX content files
  - Blog content now lives in `frontend/src/content/blog/hello-world.md`.
- [x] migrate project roster from `projects.py` to typed frontend-owned data
  - Project entries now live as typed JSON files under `frontend/src/content/projects/`.
- [x] preserve slugs, dates, descriptions, tags, and ordering rules
  - Slugs stay filename-backed, blog dates and tags moved intact, and project ordering is preserved with explicit `order` metadata plus category ordering utilities.
- [x] re-create reading-time and publish filtering logic in TypeScript or Astro content utilities
- [x] move all public-site content into frontend-owned repo files
- [x] make content changes possible without touching Python modules

Notes:

- `frontend/src/content/config.ts` now validates the migrated content collections.
- The live Python app currently reads the frontend-owned Markdown and JSON files so content stays single-sourced before the Astro page cutover.

### [x] Phase 3: port the public pages with visual parity first

Goal: ship page parity before adding new ideas.

Checklist:

- [x] port home, projects, blog index, blog post, about, contact, and 404
- [x] move the existing design tokens and CSS system into the Astro frontend
- [x] preserve the dark visual language and mobile-first layout
- [x] keep JavaScript near zero unless a page genuinely needs interaction
- [x] serve the same public information architecture from the Astro build
- [x] make the migrated site at least as fast and as readable as the current one

Notes:

- `frontend/src/pages/` now covers the full public HTML route set, including the blog slug route and `404`.
- `frontend/src/styles/tokens.css` and `frontend/src/styles/global.css` now carry the live site's typography, layout shell, page styling, and self-hosted font usage into the Astro frontend.
- Verification for this phase currently consists of `bun run lint`, `bun run check`, `bun run test`, and `bun run build` in `frontend/`, with the build output confirming the expected static routes.

### [ ] Phase 4: restore machine-readable and operational surfaces

Goal: regain non-HTML correctness before cutover.

Checklist:

- [ ] reimplement RSS generation
- [ ] reimplement sitemap generation
- [ ] preserve `robots.txt`
- [ ] provide a cheap `/health` endpoint or static equivalent in the deploy layer
- [x] preserve canonical metadata, Open Graph tags, and article metadata
  - `frontend/src/layouts/BaseLayout.astro` now covers canonical URLs, Open Graph defaults, Twitter card values, theme color, and article metadata fields for blog posts.
- [ ] make every current machine surface exist in the new frontend path
- [ ] reach SEO and uptime-probe parity with the Python build

### [ ] Phase 5: cut deployment over to the new runtime

Goal: replace the Python web runtime with the Astro build output.

Checklist:

- [x] choose the simplest deploy shape: static output behind Caddy if possible
  - The scaffold already uses `output: 'static'` in `frontend/astro.config.mjs`.
- [x] use a tiny runtime only if Astro mode genuinely requires it
  - Nothing in the scaffold currently justifies a frontend runtime beyond static hosting.
- [ ] remove Python web-serving requirements from Docker and compose files once parity is proven
- [ ] update CI to the Bun/Astro quality bar and any targeted smoke coverage
  - Partial: CI already runs frontend lint, check, test, and build, but the live deploy path and smoke script are still Python-first.
- [ ] make the default local and deploy path Bun/Astro-native
- [ ] remove FastAPI and Jinja2 from the serving path

### [ ] Phase 6: clean up and retire legacy web code

Goal: leave one obvious stack behind.

Checklist:

- [ ] remove unused Python web app files, templates, and dependencies
- [ ] update README and deployment docs to current truth
  - README is already honest about the live Python app and the Phase 1 frontend scaffold, but the post-cutover cleanup does not apply yet.
- [ ] verify there is no stale documentation claiming FastAPI + Jinja2 is still the live path
- [ ] run final smoke and route checks
- [ ] leave the repo reading like one stack, not two
- [ ] remove BUILD.md or collapse the still-useful parts into stable docs once the migration is finished

## Recommended execution order

1. Phase 2 before any serious page-port work.
2. Phase 3 before deployment work.
3. Phase 4 before cutover.
4. Phase 5 before deleting Python web code.
5. Phase 6 last.

Do **not** combine content migration, deploy cutover, and legacy deletion in one pass.

## Acceptance checklist

The migration is done when all of the following are true:

- [ ] the repo's primary frontend is **TypeScript + Bun + Astro + Vue**
- [x] the repo remains **web-only**
- [x] there is **no TUI plan** and no leftover ambiguity about that
- [x] the public route set matches current behavior in the migrated frontend
- [x] blog posts and project data are no longer stored as Python app code
- [ ] RSS, sitemap, robots, and health still work from the migrated stack
- [x] self-hosted assets, privacy posture, and no-CMS rules are preserved today
- [ ] deployment is at least as simple as the current Docker + Caddy path after cutover
- [x] README describes current truth
- [ ] BUILD.md is no longer needed as a migration tracker once cutover is complete

## Small verification rule for doc-only planning changes

For changes to this file only, run the smallest useful check:

- [x] verify the decision matches the tech-stacks guidance
- [x] verify the plan matches the repo's actual current surfaces
- [x] verify README still describes the current live implementation, not the target stack

If the plan and the repo diverge later, fix BUILD.md again or remove it once the migration is complete.
