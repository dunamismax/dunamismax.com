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

## Current state summary

Today the repo is a **Python 3.12 + FastAPI + Jinja2** server-rendered site.

What exists now:

- Public pages: `/`, `/projects`, `/blog`, `/blog/{slug}`, `/about`, `/contact`, `404`
- Machine surfaces: `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/health`
- Content lives in repo-local Python data files under `src/app/content/`
- Templates live under `src/app/templates/`
- Styling is hand-written CSS under `src/app/static/css/`
- No database, no CMS, no analytics scripts, no cookie banner
- Self-hosted fonts and static assets
- Docker + Caddy deploy path
- Python quality gates: Ruff, Pyright, pytest, smoke script

What matters about the current build:

- Route and content shape are already good enough to preserve
- The repo is static-ish in behavior even though it currently runs through FastAPI
- The Python runtime mostly exists to render templates and generate machine-readable outputs

## Target state summary

The target repo should be an **Astro-first site on Bun** with **Vue only for earned interactivity**.

Target shape:

- Astro owns routing, layouts, metadata, feed generation, sitemap, and static delivery
- Vue is optional and used only for components that actually need client state
- Blog posts move out of Python constants into repo-native content files
- Project data becomes typed frontend-owned content, not Python module data
- The site builds as a static or mostly-static web app unless a real server feature appears
- Existing public URLs stay stable
- The design language stays dark, fast, minimal, and self-hosted
- Privacy rules stay intact: no third-party scripts, no analytics, no cookie theater

## Backend notes

### Baseline

The migration should assume **no dedicated backend**.

That means:

- no FastAPI replacement by default
- no Go service
- no database
- no CMS
- no contact form backend unless there is a deliberate later decision

### If server logic becomes necessary later

Choose **Python**, not Go, for this repo's first backend addition.

Valid reasons would be:

- authenticated admin or draft workflow
- contact form handling that cannot stay mailto-only
- build-time or on-demand content ingestion that Astro alone should not own
- search or feed generation needs that stop being clean build-time work

Invalid reasons:

- preserving the current FastAPI shape because it already exists
- adding an API for a mostly static site
- introducing server complexity before the public site actually needs it

## Data and runtime constraints

Do not break these during migration:

- **No database** in the baseline migration
- **No CMS**
- **No third-party scripts**
- **Self-hosted fonts and assets**
- **Existing route slugs remain stable**
- **RSS, sitemap, robots, and health surfaces remain available**
- **Home, projects, blog, about, and contact stay first-class pages**
- **Content remains repo-owned and reviewable in git**
- **Deployment stays self-hostable and boring**

Preferred content direction:

- blog posts: Markdown or MDX in-repo, frontmatter-backed
- project roster: typed data file in TypeScript or JSON validated at build time
- site metadata: centralized config, not scattered across pages

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

## Phase plan

### Phase 0: freeze the current contract

Goal: capture what must survive the rewrite.

Tasks:

- inventory every public route and machine-readable endpoint
- record current metadata behavior and route titles/descriptions
- record blog content, project data shape, and URL slugs
- identify which CSS tokens and layout rules should carry forward unchanged
- decide static versus server-rendered Astro mode based on real needs, not habit

Done when:

- the migration acceptance checklist is explicit
- the future subagent can port the site without guessing what matters

### Phase 1: scaffold the Astro + Vue web lane

Goal: create the new frontend shell on Bun.

Tasks:

- initialize Astro with TypeScript on Bun
- add Vue integration, but use it only where interaction is justified
- add Biome, `astro check`, and `bun test`
- create the target directory shape for pages, layouts, components, content, and styles
- centralize site metadata and canonical URL configuration

Done when:

- the repo has a clean Astro entrypoint and quality bar
- no Python runtime is required to render the basic page shell in the new frontend

### Phase 2: move content ownership into the frontend

Goal: stop treating content as Python application code.

Tasks:

- migrate blog posts from Python constants to Markdown or MDX content files
- migrate project roster from `projects.py` to typed frontend-owned data
- preserve slugs, dates, descriptions, tags, and ordering rules
- re-create reading-time and publish filtering logic in TypeScript or Astro content utilities

Done when:

- all content needed for the public site lives in frontend-owned repo files
- content changes no longer require touching Python modules

### Phase 3: port the public pages with visual parity first

Goal: ship page parity before adding new ideas.

Tasks:

- port home, projects, blog index, blog post, about, contact, and 404
- move the existing design tokens and CSS system into the Astro frontend
- preserve the dark visual language and mobile-first layout
- keep JavaScript near zero unless a page genuinely needs interaction

Done when:

- the Astro build serves the same public information architecture
- the migrated site is at least as fast and as readable as the current one

### Phase 4: restore machine-readable and operational surfaces

Goal: regain non-HTML correctness before cutover.

Tasks:

- reimplement RSS generation
- reimplement sitemap generation
- preserve `robots.txt`
- provide a cheap `/health` endpoint or static equivalent in the deploy layer
- preserve canonical metadata, Open Graph tags, and article metadata

Done when:

- every current machine surface exists in the new frontend path
- SEO and uptime probes have parity with the Python build

### Phase 5: cut deployment over to the new runtime

Goal: replace the Python web runtime with the Astro build output.

Tasks:

- choose the simplest deploy shape: static output behind Caddy if possible
- use a tiny runtime only if Astro mode genuinely requires it
- remove Python web-serving requirements from Docker and compose files once parity is proven
- update CI to the Bun/Astro quality bar and any targeted smoke coverage

Done when:

- the default local and deploy path are Bun/Astro-native
- FastAPI and Jinja2 are no longer in the serving path

### Phase 6: clean up and retire legacy web code

Goal: leave one obvious stack behind.

Tasks:

- remove unused Python web app files, templates, and dependencies
- update README and deployment docs to current truth
- verify there is no stale documentation claiming FastAPI + Jinja2 is still the live path
- run final smoke and route checks

Done when:

- the repo reads like one stack, not two
- BUILD.md can be removed or collapsed into stable docs once the migration is finished

## Recommended execution order

1. Phase 0 before any scaffolding
2. Phase 1 before any content migration
3. Phase 2 before visual porting of blog and projects
4. Phase 3 before deployment work
5. Phase 4 before cutover
6. Phase 5 before deleting Python web code
7. Phase 6 last

Do **not** combine content migration, deploy cutover, and legacy deletion in one pass.

## Acceptance criteria

The migration is done when all of the following are true:

- the repo's primary frontend is **TypeScript + Bun + Astro + Vue**
- the repo remains **web-only**
- there is **no TUI plan** and no leftover ambiguity about that
- the public route set matches current behavior
- blog posts and project data are no longer stored as Python app code
- RSS, sitemap, robots, and health still work
- self-hosted assets, privacy posture, and no-CMS rules are preserved
- deployment is at least as simple as the current Docker + Caddy path
- README describes current truth
- BUILD.md is no longer needed as a migration tracker once cutover is complete

## Small verification rule for doc-only planning changes

For changes to this file only, run the smallest useful check:

- verify the decision matches the tech-stacks guidance
- verify the plan matches the repo's actual current surfaces
- verify README still describes the current live implementation, not the target stack

If the plan and the repo diverge later, fix BUILD.md again or remove it once the migration is complete.
