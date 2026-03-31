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

- [x] The repo default serving path is now the **Bun + Astro + Vue** static site under `frontend/`, built into the Docker image and served by Caddy.
- [x] **Phase 0** is complete. The current route, metadata, content, and styling contract is frozen in `docs/frontend-contract-inventory.md`.
- [x] **Phase 1** is complete. A sibling **Bun + Astro + Vue** scaffold exists under `frontend/` with static Astro output, centralized site config, content schemas, shared layout shell, and frontend CI checks.
- [ ] **Phase 6** is not complete. Deployment cutover is now done in repo configuration, but legacy Python web code and cleanup still remain.
- [ ] Real local Docker verification is still blocked on this machine. `docker pull oven/bun:1.3.10-alpine` and `docker pull caddy:2.10-alpine` currently hang inside the Docker Desktop engine before layer transfer, even though direct host HTTPS probes to Docker Hub succeed.

## Current state summary

Today the repo's default site path is the **Astro static build** from `frontend/`, served through Docker + Caddy, while the legacy **Python 3.12 + FastAPI + Jinja2** app still remains in-tree for cleanup.

What exists now:

- [x] Public pages: `/`, `/projects`, `/blog`, `/blog/{slug}`, `/about`, `/contact`, `404`
- [x] Machine surfaces: `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/health`
- [x] Blog posts and project roster data now live under `frontend/src/content/`
- [x] Legacy templates still live under `src/app/templates/` until cleanup
- [x] Legacy styling still lives under `src/app/static/css/` until cleanup, while the Astro frontend carries the ported CSS system in `frontend/src/styles/`
- [x] No database, no CMS, no analytics scripts, no cookie banner
- [x] Self-hosted fonts and static assets ship from the Astro build output
- [x] Docker + Caddy deploy path now serves the Astro static build by default
- [x] Frontend quality gates now cover lint, type check, tests, build, and a built-site smoke script
- [x] Frontend migration contract inventory in `docs/frontend-contract-inventory.md`
- [x] Astro frontend migration app in `frontend/` with Astro, Vue, Biome, Bun tests, static build output, and frontend-owned content collections
- [x] Frontend parity site in Astro
  - The Astro frontend now ships the public HTML route set with shared layout, metadata, content rendering, and the ported CSS system.
- [x] Frontend-owned blog content files
- [x] Frontend-owned project roster data
- [x] Astro versions of RSS, sitemap, robots, and health
  - `frontend/src/pages/feed.xml.ts`, `frontend/src/pages/sitemap.xml.ts`, `frontend/src/pages/robots.txt.ts`, and `frontend/src/pages/health.ts` now emit the machine-readable route set from the Astro build.
- [x] Bun/Astro-native deployment is now the default serving path in repo configuration

What matters about the current build:

- [x] Route and content shape are already good enough to preserve.
- [x] The repo now serves as a static site by default with no dedicated backend in the baseline path.
- [x] The remaining Python runtime is legacy cleanup scope, not an active serving requirement.
- [x] The migration contract is frozen, the Astro frontend is live in repo configuration, and the remaining work is cleanup rather than parity porting.

## Target state summary

The target repo should be an **Astro-first site on Bun** with **Vue only for earned interactivity**.

Target shape:

- [x] Astro owns routing, layouts, metadata, feed generation, sitemap, and static delivery
- [x] Vue remains optional and is only used where client state is justified
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
- [x] **RSS, sitemap, robots, and health surfaces remain available**
  - The Astro frontend now emits and serves the full machine surface set from the default repo deploy path.
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

### [x] Phase 4: restore machine-readable and operational surfaces

Goal: regain non-HTML correctness before cutover.

Checklist:

- [x] reimplement RSS generation
- [x] reimplement sitemap generation
- [x] preserve `robots.txt`
- [x] provide a cheap `/health` endpoint or static equivalent in the deploy layer
- [x] preserve canonical metadata, Open Graph tags, and article metadata
  - `frontend/src/layouts/BaseLayout.astro` now covers canonical URLs, Open Graph defaults, Twitter card values, theme color, and article metadata fields for blog posts.
- [x] make every current machine surface exist in the new frontend path
- [x] reach SEO and uptime-probe parity with the Python build

### [x] Phase 5: cut deployment over to the new runtime

Goal: replace the Python web runtime with the Astro build output.

Checklist:

- [x] choose the simplest deploy shape: static output behind Caddy if possible
  - The scaffold already uses `output: 'static'` in `frontend/astro.config.mjs`.
- [x] use a tiny runtime only if Astro mode genuinely requires it
  - Nothing in the scaffold currently justifies a frontend runtime beyond static hosting.
- [x] remove Python web-serving requirements from Docker and compose files once parity is proven
  - `Dockerfile` now builds `frontend/` with Bun and serves `frontend/dist` from Caddy, while `docker-compose.yml` publishes the static container directly.
- [x] update CI to the Bun/Astro quality bar and any targeted smoke coverage
  - `.github/workflows/ci.yml` now runs the frontend lint, check, test, build, and built-site smoke path as the default CI lane.
- [x] make the default local and deploy path Bun/Astro-native
  - `README.md`, `frontend/README.md`, and `scripts/smoke.py` now describe and verify the Astro-first workflow.
- [x] remove FastAPI and Jinja2 from the serving path
  - The legacy Python app remains in-tree for cleanup, but it is no longer part of the default container or CI serving path.

### [ ] Phase 6: clean up and retire legacy web code

Goal: leave one obvious stack behind.

Current blocker:

- Real container verification is not yet repeatably green on this machine.
- As of 2026-03-30, `docker compose build --no-cache web` stalls while resolving remote metadata for `oven/bun:1.3.10-alpine` and `caddy:2.10-alpine`.
- Direct `curl` probes to `https://registry-1.docker.io/v2/` and `https://auth.docker.io/token` succeed from the host, so the blocker currently looks like the Docker engine pull path or its proxy configuration rather than the repo's Dockerfile or compose wiring.

Checklist:

- [ ] remove unused Python web app files, templates, and dependencies
- [x] update README and deployment docs to current truth
  - `README.md`, `frontend/README.md`, `Dockerfile`, `docker-compose.yml`, `Caddyfile`, and the new `deploy/static-site.Caddyfile` now document the Astro-first serving path and legacy cleanup status honestly.
- [x] verify there is no stale documentation claiming FastAPI + Jinja2 is still the live path
  - Targeted doc search now leaves only this cleanup checklist referring to the old live path.
- [x] run final smoke and route checks
  - Verification now includes `bun run lint`, `bun run check`, `bun run test`, `bun run build`, and `python3 scripts/smoke.py` against the built frontend artifact.
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

- [x] the repo's primary frontend is **TypeScript + Bun + Astro + Vue**
- [x] the repo remains **web-only**
- [x] there is **no TUI plan** and no leftover ambiguity about that
- [x] the public route set matches current behavior in the migrated frontend
- [x] blog posts and project data are no longer stored as Python app code
- [x] RSS, sitemap, robots, and health still work from the migrated stack
- [x] self-hosted assets, privacy posture, and no-CMS rules are preserved today
- [x] deployment is at least as simple as the current Docker + Caddy path after cutover
- [x] README describes current truth
- [ ] BUILD.md is no longer needed as a migration tracker once cutover is complete

## Small verification rule for doc-only planning changes

For changes to this file only, run the smallest useful check:

- [x] verify the decision matches the tech-stacks guidance
- [x] verify the plan matches the repo's actual current surfaces
- [x] verify README still describes the current repo-default implementation, not an outdated migration target

If the plan and the repo diverge later, fix BUILD.md again or remove it once the migration is complete.
