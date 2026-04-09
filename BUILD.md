# BUILD.md

## Purpose

This file is the living execution manual for `dunamismax.com` while the site is being realigned to Stephen Sawyer's current portfolio direction.

If you are a future agent working in this repo, start here.

1. Read `README.md`, `frontend/README.md`, `docs/frontend-contract-inventory.md`, and this file before making changes.
2. Work through the phases in order unless current repo reality clearly justifies a different sequence.
3. Keep this file current as the repo changes.
4. Check boxes only after the work is actually done in the repo and verified.
5. Leave aspirational, partial, or debated work unchecked.
6. If a phase item becomes wrong, rewrite or remove it instead of letting this file drift.

This file is temporary by design. Once the site exits this active realignment phase, fold any enduring guidance into stable docs and remove `BUILD.md`.

## Decision

`dunamismax.com` remains a **static-first Astro site** unless a concrete product need proves otherwise.

Stephen's broader full-stack web lane is Bun + TypeScript + Astro + Vue, with Elysia + Zod + PostgreSQL when a product genuinely needs backend logic and durable state.

This repo should align with that stack honestly, not theatrically.

For this repo, alignment means:

- keep the public site fast, static-first, and frontend-owned
- use Bun, TypeScript, Astro, and selective Vue where they improve the site without turning it into an app-shaped costume
- keep the existing Tailwind v4 plus token-driven styling system coherent instead of churning it for fashion
- make the portfolio and copy accurately reflect Stephen's current build lanes and active project mix
- keep deployment boring with Docker and Caddy

Alignment does **not** mean forcing this repo into a fake full-stack rewrite.

Right now, adding a Bun API, Elysia service, auth layer, PostgreSQL database, CMS, or admin backend would be cargo-cult architecture for a portfolio site.

## Current repo truth

The shipped repo today is:

- a Bun-managed Astro frontend rooted at `frontend/`
- repo-owned blog and project content under `frontend/src/content/`
- Tailwind CSS v4 utilities layered on top of local design tokens in `frontend/src/styles/`
- static HTML pages plus RSS, sitemap, robots, and health surfaces
- a root `bun run verify` wrapper that runs the frontend checks and Python smoke pass
- Docker plus Caddy serving the built static output
- no auth, no private admin surface, no analytics scripts, no CMS, and no database

### Current repo shape

```text
dunamismax.com/
  BUILD.md
  README.md
  docs/
    frontend-contract-inventory.md
  frontend/
    astro.config.mjs
    package.json
    src/
      components/
      config/
      content/
        blog/
        projects/
      layouts/
      pages/
      styles/
  scripts/
    smoke.py
    verify.sh
  Caddyfile
  Dockerfile
  docker-compose.yml
  package.json
```

### Current verification commands

The repo already has a root verification entrypoint:

```bash
bun run verify
```

Equivalent manual commands today:

```bash
bun --cwd frontend install --frozen-lockfile
bun --cwd frontend run lint
bun --cwd frontend run check
bun --cwd frontend run test
bun --cwd frontend run build
python3 scripts/smoke.py
```

## Fit boundary with Stephen's current stack

This repo is a public portfolio and writing surface, not a product app with inherent backend state.

### What should stay as-is unless there is a strong reason to change it

- Astro owns page routing, layouts, page rendering, RSS, sitemap, robots, health, and first response.
- Content stays repo-owned in Markdown and JSON under `frontend/src/content/`.
- Tailwind v4 and local tokens remain the current styling system unless a specific problem earns a change.
- Docker plus Caddy remain the default shipping path.
- The site stays fast, readable, and low-JavaScript.
- No third-party analytics, trackers, or cookie-banner theater.

### What can evolve within the current static-first boundary

- project roster accuracy
- project ordering and featured presentation
- page copy and metadata
- project content schema fields such as featured state, screenshots, or richer status notes
- tighter content and metadata validation
- small Vue islands for earned interaction such as filters or lightweight inspectors

### What must be earned before adding backend state

- authenticated private content or admin workflows
- dynamic ingestion that should not be flattened into checked-in content
- stateful search or filtering that cannot be handled well at build time
- a contact or intake workflow that truly needs server-side ownership in this repo
- a documented product reason that static output cannot satisfy cleanly

If one of those becomes real, document the need here first and compare a static-first solution against one simple Bun API service before changing architecture.

## Current portfolio direction to reflect

Source-of-truth references:

- `/Users/sawyer/github/dunamismax/README.md`
- `/Users/sawyer/github/dunamismax/tech-stacks/web-fullstack-tech-stack.md`

The current public direction should foreground:

- **TypeScript + Bun + Astro + Vue** as the default web lane
- **Go** for networking, daemons, systems tooling, and operator products
- **Python** for automation, scripting, APIs, and glue where it fits best
- **Rust** as a dedicated existing-repo or maintenance lane, not the default forward path for new portfolio emphasis

The current repo already reflects part of that direction through `DebugPath`, `MyLifeRPG`, `ElChess`, `GitPulse`, `Scrybase`, `Wirescope`, `bore`, `toolworks`, and the site itself.

The remaining portfolio work is mostly curation and emphasis, not an architectural rewrite.

Likely gaps to review first:

- whether `flowhook` and `patchworks` should now be represented on the public projects roster
- whether the flagship active web and operator-facing projects are visually prominent enough
- whether older shipped references or maintenance-lane work need clearer positioning so they do not pull the site's center of gravity backward

## Target state

The target end state for this repo is:

- a fast static Astro site that still feels deliberate and current
- a portfolio that honestly highlights Stephen's active build lanes and current flagship projects
- page copy and metadata that match the parent portfolio README closely enough to avoid mixed-era drift
- repo-owned content that is easy to review and update in git
- stable docs that describe the actual current repo shape, including the Tailwind v4 token setup and root verification flow
- no backend or database unless a specific site need justifies it

## Non-goals

Do not do these by default:

- do not split this repo into frontend and backend services just to mirror the broader full-stack template
- do not add SSR, auth, a database, or an API for brochure-style content
- do not add a CMS for content that already works well as repo-owned files
- do not turn the site into a client-heavy SPA
- do not rewrite the styling system just to chase a different aesthetic or stack fashion
- do not add third-party analytics, cookie banners, or unnecessary client scripts
- do not migrate frameworks out of habit or ecosystem FOMO

## Phase 0 - Reconfirm the boundary before changing architecture

### Work items

- [ ] Re-read the parent portfolio README and the current web full-stack stack document before making structural changes.
- [ ] Audit the local repo docs, metadata, and public copy for where they drift from Stephen's current stack and portfolio direction.
- [ ] Record any newly discovered mismatch in this file before expanding scope.
- [ ] Confirm that the requested change can stay inside the current static Astro boundary.
- [ ] If a requested feature appears to need a backend, stop and document the justification test here before implementing it.

### Acceptance criteria

- [ ] A future agent can explain in two or three sentences why this repo is static-first today.
- [ ] A future agent can explain what alignment with Stephen's broader web lane means for this repo without claiming it should become a full-stack app by default.
- [ ] Any proposal to add backend state has a written reason in this file.

## Phase 1 - Close project-roster gaps and sharpen emphasis

### Work items

- [ ] Audit `frontend/src/content/projects/` against the current project list in `/Users/sawyer/github/dunamismax/README.md`.
- [ ] Decide whether `flowhook` and `patchworks` now belong on the public project roster.
- [ ] Review whether flagship current work such as `DebugPath`, `MyLifeRPG`, `ElChess`, `GitPulse`, and `Scrybase` is ordered and labeled strongly enough.
- [ ] Reclassify categories and statuses only where the current taxonomy no longer tells the truth.
- [ ] Remove, demote, or de-emphasize entries that no longer represent the current portfolio direction.
- [ ] Keep every tagline, stack label, and visibility flag current enough that the roster can stand on its own.

### Acceptance criteria

- [ ] The projects page reflects current active work more accurately than the parent README's raw list alone.
- [ ] The site clearly surfaces the current web-app and operator-tool direction.
- [ ] No project status overstates maturity, activity, or completeness.
- [ ] A reader can infer Stephen's current build lanes from the portfolio data without outside context.

## Phase 2 - Tighten public narrative and metadata

### Work items

- [ ] Keep the home page focused on Stephen's actual product, systems, and local-first posture.
- [ ] Keep the about page aligned with the current stack philosophy and deployment bias.
- [ ] Refresh blog framing when needed so it continues to match Bun and Astro web apps, Go systems work, Python automation, self-hosting, and operational discipline.
- [ ] Review shared metadata in `frontend/src/config/site.ts` whenever the public narrative shifts.
- [ ] Keep contact, navigation, route paths, structured data, and machine-readable surfaces stable while copy evolves.

### Acceptance criteria

- [ ] Home, projects, blog, and about read like one current portfolio instead of a mix of old eras.
- [ ] Shared metadata does not materially contradict Stephen's current public README.
- [ ] Rust is framed honestly as part of the body of work, not the default forward lane.
- [ ] Public copy stays short, direct, and operator-friendly.

## Phase 3 - Deepen content structure without adding backend sprawl

### Work items

- [ ] Keep blog posts and project data repo-owned under `frontend/src/content/`.
- [ ] Add richer project fields such as featured state, screenshots, or short status notes only if they make the current portfolio easier to understand.
- [ ] Reuse existing screenshots only when they improve clarity and remain easy to maintain.
- [ ] Add schema checks or helper utilities only where they reduce drift and duplication.
- [ ] Update `docs/frontend-contract-inventory.md` whenever route, metadata, content, or asset contracts materially change.

### Acceptance criteria

- [ ] Content remains easy to audit in git.
- [ ] The content model stays simple enough for a future agent to understand quickly.
- [ ] Stable docs continue to describe current repo truth rather than stale intentions.
- [ ] No new content system introduces hidden operational cost.

## Phase 4 - Preserve verification and docs hygiene

### Work items

- [ ] Keep `bun run verify` aligned with the actual frontend commands and smoke script.
- [ ] Keep `README.md`, `frontend/README.md`, and `docs/frontend-contract-inventory.md` in agreement on the deployment shape, styling system, and ownership boundaries.
- [ ] Keep Docker and Caddy docs aligned with the real static deployment path.
- [ ] Add or tighten narrow tests only where they catch actual regressions in routes, content, metadata, or structured data.
- [ ] Remove stale documentation details as soon as the repo shape changes.

### Acceptance criteria

- [ ] A fresh contributor can run the documented verification flow from the repo root without guesswork.
- [ ] Docs agree on where the site lives, how it builds, how it ships, and how styling is organized.
- [ ] Verification catches broken routes or machine-readable surfaces before deploy.
- [ ] The repo stays easy to operate without adding ceremony.

## Phase 5 - Use Vue only where it earns itself

### Work items

- [ ] Keep Astro as the page owner for all public routes.
- [ ] Add Vue islands only for clearly valuable interaction such as filters, inspectors, or lightweight portfolio affordances.
- [ ] Keep any Vue code island-scoped and avoid moving whole pages into client-side app mode.
- [ ] Keep the JavaScript budget modest and intentional.
- [ ] Verify that any added client-side behavior still respects the site's performance goals.

### Acceptance criteria

- [ ] The site still feels static-first and fast.
- [ ] Any Vue usage is easy to justify in one sentence.
- [ ] No new interaction requires cookies, analytics, or server state by accident.
- [ ] JavaScript payload stays modest and intentional.

## Phase 6 - Earned dynamic expansion, only if reality forces it

### Work items

- [ ] Document the exact user or operator need that static output can no longer satisfy.
- [ ] Compare static-first alternatives before reaching for a backend.
- [ ] If a backend is truly needed, define one clear boundary for it and keep the public site architecture coherent.
- [ ] If persistence is required, justify PostgreSQL with the actual state model that needs to exist.
- [ ] Update this file, the root README, and the contract inventory before landing the structural change.

### Acceptance criteria

- [ ] No backend lands in this repo without written justification.
- [ ] Any added backend follows Stephen's current preferred web lane instead of ad hoc stack drift.
- [ ] Astro still owns the public page shell unless a documented exception replaces that model.
- [ ] The repo remains explainable to a future agent in a single pass.

## Working rules for future agents

- Update this file when phases, boundaries, or success criteria materially change.
- Keep stable docs current-state oriented.
- Do not mark a box complete because the work seems close.
- If you intentionally reject a phase item, rewrite or remove it so the file stays truthful.
- If the repo exits this active realignment phase, fold the enduring guidance into stable docs and remove `BUILD.md` rather than letting it rot.
