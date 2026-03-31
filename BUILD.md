# BUILD.md

This file is the living execution manual for `dunamismax.com` while the site is being realigned to Stephen Sawyer's current portfolio direction.

If you are a future agent working in this repo, do not treat this as optional reading.

1. Read `README.md`, `frontend/README.md`, `docs/frontend-contract-inventory.md`, and this file before making changes.
2. Work through the phases in order unless a later phase is explicitly unblocked by current repo state.
3. Keep this file current as the repo changes.
4. Check boxes only after the work is actually done in the repo and verified.
5. Leave aspirational or partially finished work unchecked.

## What this repo is

`dunamismax.com` is Stephen's public site, portfolio, and writing surface.

Current repo truth:

- the shipped app is the Astro site under `frontend/`
- Bun is the package manager, runtime, and script runner for the frontend
- Astro owns routing, layouts, page rendering, and machine-readable surfaces
- Vue is available for earned client islands, not page ownership by default
- content is repo-owned under `frontend/src/content/`
- Docker + Caddy serve static output
- Python remains only for the smoke check script
- there is no CMS, no analytics script, no auth surface, and no database

## Fit boundary with Stephen's current web stack

Stephen's preferred full-stack web lane is Bun + TypeScript + Astro + Vue, with Elysia + Zod + PostgreSQL when a product genuinely needs backend logic and persisted application state.

This repo should align with that direction honestly, not theatrically.

For this site, alignment means:

- keep the public site fast, static-first, and frontend-owned
- use Astro as the page owner and Vue only where interaction clearly earns it
- keep styling simple, hand-written, and token-driven
- make the portfolio and copy accurately reflect Stephen's current active stack and project mix
- keep deployment boring with Docker + Caddy

Alignment does **not** mean forcing this repo into a fake full-stack rewrite just because the wider stack document exists.

Right now, a Bun API, Elysia service, auth layer, PostgreSQL database, or CMS would be cargo cult architecture for a portfolio site. If a real dynamic need appears later, that decision must be earned and documented first.

## Current portfolio gap

The current site architecture is mostly correct.

The main gap is portfolio truth, not framework choice.

Today the public site content and project roster skew more heavily toward older Go/Rust work than Stephen's current public direction in `/Users/sawyer/github/dunamismax/README.md` and `/Users/sawyer/github/dunamismax/tech-stacks/web-fullstack-tech-stack.md`.

The site should evolve to foreground:

- TypeScript + Bun + Astro + Vue as the active web lane
- Go for networking, daemons, and systems work
- Python for automation, scripting, and backend glue where it fits
- Rust as a maintenance or repo-specific lane, not the default direction for new portfolio emphasis
- active full-stack and operator-facing products that represent current work more honestly

## Target state

The target end state for this repo is:

- a fast static Astro site that still feels deliberate and current
- a portfolio that honestly highlights Stephen's active projects and present build lanes
- repo-owned content that is easy to review and update in git
- a documented verification flow that is easy to run from the repo root
- no added backend or database unless a specific product need justifies it

## Non-goals

Do not do these by default:

- do not split this repo into frontend and backend services just to mirror the broader full-stack template
- do not add SSR, auth, a database, or an API for brochure-style content
- do not add a CMS for content that already works well as repo-owned files
- do not turn the site into a client-heavy SPA
- do not add third-party analytics, cookie banners, or unnecessary client scripts
- do not migrate to a different web framework out of fashion or habit

## Decision rule for any future dynamic backend

Only consider adding a backend when the static-first model is materially failing to serve a real need such as:

- authenticated private content or admin workflows
- stateful search or filtering that cannot be handled well at build time
- contact or intake workflows that truly require server-side handling owned by this repo
- dynamic project ingestion from an internal source of truth that should not be flattened into checked-in content

If that day comes:

- document the concrete need in this file first
- compare a static-first solution against one Bun API service
- keep Astro as the page shell unless there is a documented reason not to
- prefer one Bun API with Elysia + Zod + PostgreSQL over ad hoc framework sprawl

## Phase 0 - Reconfirm the boundary before changing architecture

### Work items

- [ ] Re-read the parent portfolio README and the current web full-stack stack document before making structural changes.
- [ ] Audit the local repo docs and site content for where the public narrative drifts from Stephen's current stack and portfolio direction.
- [ ] Write down any newly discovered mismatch in this file before expanding scope.
- [ ] Confirm that the requested change can stay inside the current static Astro boundary.
- [ ] If a requested feature appears to need a backend, stop and document the justification test here before implementing it.

### Acceptance criteria

- [ ] A future agent can explain in two or three sentences why this repo is static-first today.
- [ ] A future agent can explain what "alignment with the full-stack web lane" means for this repo without claiming it should become a full-stack app by default.
- [ ] Any proposal to add backend state has a written reason in this file.

## Phase 1 - Reset portfolio truth

### Work items

- [ ] Audit `frontend/src/content/projects/` against the current source-of-truth project list in `/Users/sawyer/github/dunamismax/README.md`.
- [ ] Add or update project entries so the roster reflects Stephen's active full-stack web apps, operator products, Go systems work, and current Python automation lane.
- [ ] Reclassify project categories and statuses only where the current taxonomy no longer tells the truth.
- [ ] Remove, demote, or de-emphasize stale entries that no longer represent the current portfolio direction.
- [ ] Ensure project ordering makes flagship current work visible without burying durable shipped work.

### Acceptance criteria

- [ ] The projects page reflects current active work more accurately than the older site roster.
- [ ] The site clearly surfaces the current web-app direction instead of mostly older Rust-era emphasis.
- [ ] No project status overstates maturity, activity, or completeness.
- [ ] A reader can infer Stephen's current build lanes from the portfolio data without needing outside context.

## Phase 2 - Align page copy and metadata

### Work items

- [ ] Update home-page copy to foreground the current web lane, Go systems work, Python automation, and self-hostable product bias.
- [ ] Update `about` page copy so it describes the current stack philosophy without pretending every repo follows the exact same stack.
- [ ] Refresh `blog` framing so it supports current topics such as Bun/Astro/Vue web apps, Go systems work, Python automation, self-hosting, and operational discipline.
- [ ] Review shared metadata in `frontend/src/config/site.ts` so descriptions and labels stay consistent with the portfolio direction.
- [ ] Keep contact, navigation, and machine-readable surfaces stable while copy evolves.

### Acceptance criteria

- [ ] Home, projects, blog, and about read like one current portfolio, not a mix of old eras.
- [ ] Shared metadata does not materially contradict Stephen's current public README.
- [ ] Rust is framed honestly as part of the body of work, not the default forward lane.
- [ ] The public copy stays short, direct, and operator-friendly.

## Phase 3 - Improve content structure without adding backend sprawl

### Work items

- [ ] Keep blog posts and project data repo-owned under `frontend/src/content/`.
- [ ] Add richer project summaries, featured sections, or case-study paths only if they improve the portfolio's ability to explain current work.
- [ ] Add content schema checks or helper utilities only where they reduce drift and duplication.
- [ ] Preserve simple file formats and reviewability over CMS-style abstraction.
- [ ] Update `docs/frontend-contract-inventory.md` whenever route, metadata, or content contracts materially change.

### Acceptance criteria

- [ ] Content remains easy to audit in git.
- [ ] The content model stays simple enough for a future agent to understand quickly.
- [ ] Stable docs continue to describe current repo truth rather than stale intentions.
- [ ] No new content system introduces hidden operational cost.

## Phase 4 - Use Vue only where it earns itself

### Work items

- [ ] Keep Astro as the page owner for all public routes.
- [ ] Add Vue islands only for clearly valuable interaction such as filters, inspectors, or small client-side portfolio affordances.
- [ ] Keep any Vue code island-scoped and avoid moving whole pages into client-side app mode.
- [ ] Preserve plain CSS tokens and avoid unnecessary UI framework or utility-class sprawl.
- [ ] Verify that any added client-side behavior still respects the site's performance goals.

### Acceptance criteria

- [ ] The site still feels static-first and fast.
- [ ] Any Vue usage is easy to justify in one sentence.
- [ ] No new interaction requires cookies, analytics, or server state by accident.
- [ ] JavaScript payload stays modest and intentional.

## Phase 5 - Normalize repo ergonomics and verification

### Work items

- [ ] Add a repo-root verification entrypoint or wrapper so the default checks are obvious from the root of the repo.
- [ ] Keep the documented verify flow aligned with the actual frontend commands and smoke script.
- [ ] Ensure `README.md`, `frontend/README.md`, and `docs/frontend-contract-inventory.md` agree on the deployment shape and ownership boundaries.
- [ ] Keep Docker/Caddy docs aligned with the real static deployment path.
- [ ] Add or tighten narrow tests only where they catch actual regressions in routes, content, or metadata.

### Acceptance criteria

- [ ] A fresh contributor can run the documented verification flow from the repo root without guesswork.
- [ ] Docs agree on where the site lives, how it builds, and how it ships.
- [ ] Verification catches broken routes or machine surfaces before deploy.
- [ ] The repo stays easy to operate without adding ceremony.

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
