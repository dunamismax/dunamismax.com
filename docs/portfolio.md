# Portfolio evidence

The site's portfolio is the typed inventory in `src/lib/projects.ts`. Recheck
a project's running service, its repository documentation and its public
HTTPS response before changing a status, stack or description, and record the
evidence here. Sections below are dated; older ones are history, not the
current state.

## November 27, 2026 change

The owner retired two game projects and took them off the host. Their cards,
their places among the home page's featured cards and their mentions in Home,
About and Projects copy are removed. The Games & play group now holds
RiverMind Poker alone, and the home page features RustDesk remote support,
RiverMind Poker, vincentsawyer.org, Grace & Footnotes, Dunamis Status and
C From The Ground Up. Every other card is unchanged from the review below.

## November 21, 2026 review

Reviewed on `root@ubuntu-vm` after every site moved to the host's web platform
contract: running units and their release revisions (`bin/web-live`),
`/healthz` and page responses through Caddy, the Caddy site files, and each
project's README and BUILD. Where this section differs from the November 20
one below, this one is current.

### Host

Ubuntu 26.04.1 LTS. Caddy 2.11.9, PostgreSQL 18, and Node 26.13.1
(`/opt/node-26`) for every Node service; Node 24 was removed this day. Caddy
serves thirteen site files, two of them since retired: dunamismax.com,
graceandfootnotes.com, status.dunamismax.com, vincentsawyer.org,
rivermindpoker.com, cfromthegroundup.com,
xrayservice.net, demo.xrayservice.net, data.xrayservice.net (email images),
daybyword.com and fieldcadence.app. The demo, daybyword.com and
fieldcadence.app answer `noindex`. No site runs in a container and no site
has a rollback: deploys fix forward after a candidate check.

### Changed entries

| Card | Evidence | Public boundary |
| --- | --- | --- |
| RiverMind Poker | `rivermind-poker-web.service` (Node, 127.0.0.1:4320) is the only table server, serving release `58c9c0b`; its README and BUILD (D-14, P4B.8) say the table server, engine and bots run in the SvelteKit Node service with Drizzle on PostgreSQL, and that the Python table server is retired; Python remains for MCCFR training and as the reference the TypeScript engine is checked against; `LICENSE` is GPL-3.0; rivermindpoker.com 200 | As before: play money only, bots always labelled. |
| Grace & Footnotes | Every page carries one script, `/assets/js/theme.js` (2.6 kB, the theme switch); its README says every page reads fully without JavaScript and that this is the only browser script; release `6e4bb2e` | Do not claim zero JavaScript for it. |
| Field Cadence | Private repo; `fieldcadence.service` active; fieldcadence.app 200 from release `409283b` with `X-Robots-Tag: noindex, nofollow`; the page says it is in development and not yet open to other dealers; BUILD: the Phase 2 shells are deployed, no sign-in mail, the domain model is next | In development, deployed as a preview. Private source; no link on the card. |
| Day by Word | Public repo; `daybyword-web.service` active; daybyword.com 200 from release `8bc9d7d`, noindex; BUILD: the three plans are listed from PostgreSQL 18 and a plan cannot be started yet; no App Store release | In development, not released. |
| C From The Ground Up | 38 lesson files in six `Part` directories; README "Browse all 38 lessons" and AGENTS "38 lessons in six parts" (the README's opening line and the GitHub description still say 35); lessons compile under C17 and again under C23; 174 stars; release `4112094` | Teaching workbook, not an application suite. |

The other ten cards were rechecked against the same sources and left as they
were. Two statements outside the cards are no longer true and were left for
the owner, because Home and About copy is an owner gate: Home says "eight
public websites" (Caddy now serves thirteen site files: nine public
websites, three `noindex` previews and an asset host) and "a Python poker
table server",
and About says RiverMind runs its tables "in Python" and lists Alembic.

## November 20, 2026 review

Reviewed against the MacBook's `~/github` checkouts (README, BUILD and latest
commits), `root@ubuntu-vm` (running systemd services, timers, Docker
containers, Caddy site files, release symlinks) and the public GitHub account.
This is an editorial inventory, not a live health report or a security audit.

### Host

Ubuntu 26.04.1 LTS. Caddy 2.11.9 (`/usr/local/lib/caddy/caddy`), PostgreSQL
18.6, Node 24.22.3 (`/opt/node-runtime`), Go 1.27.4, Docker 29.10, Tailscale,
fail2ban and a Lynis timer. PHP-FPM and MySQL are no longer running, so no
portfolio copy may describe them as current. Caddy serves ten site files, two of them since retired:
dunamismax.com, graceandfootnotes.com, status.dunamismax.com, vincentsawyer.org,
rivermindpoker.com, xrayservice.net,
demo.xrayservice.net and data.xrayservice.net (email images). The eight public
websites named on the home page are the first eight; the demo is noindex.

A later recheck the same day found twelve site files: the ten above plus
cfromthegroundup.com (the C course site) and daybyword.com, which returned 200
from release `52126aa`. The Day by Word card and its entry below were not
changed in that recheck; describing the web version as released is the owner's call.

Backup timers: dunamismax, graceandfootnotes, status-dunamismax,
vincentsawyer, rustdesk and the host-wide ubuntu-vm-backup (age-encrypted,
with isolated PostgreSQL and application restore checks). Other timers: status
collector (five minutes), Cloudflare DDNS (five minutes), RustDesk installer
build, disk cleanup.

### Verified entries

| Card | Evidence | Public boundary |
| --- | --- | --- |
| RiverMind Poker | Public GPL repo; `rivermind-poker serve-nl` running behind Caddy; rivermindpoker.com 200 | Play money only, bots always labelled. Credit its open-source origins. |
| vincentsawyer.org | Private repo; `vincentsawyer-web` SvelteKit (adapter-node) release `4de8492`; 200 | Live. Admin and store are not public features; do not describe them. |
| Grace & Footnotes | Private repo; SvelteKit release `1a17b1e` running; 200 | Personal Christian writing site. |
| dunamismax.com | This repository; `dunamismax.service` active from SvelteKit release `eeeb06d` (rechecked 2026-11-20); later releases are in BUILD.md | No browser JavaScript. |
| Imaging Services website | Private repo; `imagingservices.service` active; demo `current` and `/healthz` both at release `a176d39`, which includes the SvelteKit port `3958955`; `astro-imagingservices` inactive (rechecked 2026-11-20) | Thirteen pages. Omit the demo link; main site not cut over. |
| Field Cadence | Private repo; Phase S0 foundation built and tested on SvelteKit; no Caddy site | In development, nothing deployed. Private source. |
| Day by Word | Public repo; Swift/SwiftUI app and SvelteKit web workspace; daybyword.com does not resolve | In development, not released. |
| RustDesk remote support | `hbbs`/`hbbr` containers up; installer build and RustDesk backup timers; xrayservice.net 200 from `xrayservice-web.service` (prerendered SvelteKit on 127.0.0.1:4319), release `ed19680`; its stylesheet is a Tailwind CSS 4.3.5 build (rechecked 2026-11-20) | Operation, not authorship, of RustDesk. No keys or direct installer links. |
| Dunamis Status | Public repo; SvelteKit release `8c72b37`; collector timer | Portfolio is not an uptime feed. |
| Server backup & recovery | Timers above; private ubuntu-vm-backup repo | No repo links, locations, inventory or keys. |
| Dynamic DNS automation | `cloudflare-ddns.timer`, TypeScript updater in the private xrayservice repo | No addresses, zones, tokens or record IDs. |
| MTG Card Bot | Public repo at 5.0.0; `mtg-card-bot` Python service running | No claim of an end-to-end Discord test in this review. |
| C From The Ground Up | Public repo (173 stars, the account's most-starred); `cfromthegroundup.service` (SvelteKit) active from release `a14e994`; cfromthegroundup.com 200 and the GitHub Pages book mirror 200 (rechecked 2026-11-20) | Teaching workbook, not an application suite. |

Not listed: toolworks (server cleanup and deploy helpers), imagingservices_work
(private company office automation, summarized only as Python/QuickBooks
tooling on About), the Redemption Paid in Full site (cPanel-hosted for a
friend's group), and older or private experiments on GitHub with no running
deployment. Add any of them only with fresh evidence and the owner's approval.

## October 17, 2026 review (historical)

Reviewed 2026-10-17 against the server's running services, Docker container
state, Caddy site definitions, scheduled jobs, sibling repository documentation,
and public HTTPS responses. This is a dated editorial inventory, not a live
health report or a security audit.

### Verified work

| Portfolio entry | Evidence | Public boundary |
| --- | --- | --- |
| RustDesk remote support | Both server and relay containers running; xrayservice repository documents the preconfigured Windows client and checksum/signature verification; installer-build and backup timers present with successful last exit statuses; website and download HEAD return 200 | Stephen supplied company-wide usage. Describe deployment and operations of RustDesk, not authorship of the upstream product. Link the support landing page, never embed connection keys or link directly to installers. |
| Dunamis Status | PHP-FPM/Caddy deployment, active collector timer, status repository README, public homepage returns 200 | PHP/MySQL monitoring with a separate collector and read-only web identity. Link only public status and existing public source. |
| Server backup & recovery | ubuntu-vm-backup README, daily timer, successful last exit status; site and RustDesk backup jobs also report success | Describe encrypted backups and documented rebuild procedures. Do not publish backup repository links, inventory, keys, locations, or imply a complete recovery drill was performed in this review. |
| Grace & Footnotes | Repository README, dedicated PHP-FPM/Caddy deployment, public homepage returns 200 | Personal Christian publishing website. Link the public site; do not copy private drafts or personal background into the portfolio. |
| Imaging Services website | Private repository README and deployment runbook, separate demo Caddy/PHP-FPM deployment, demo homepage returns 200 | Hosted demo of a twelve-page PHP/MySQL replacement, pending main-domain cutover. Keep source private and omit the demo link from this portfolio. |
| dunamismax.com | This repository, dedicated PHP-FPM/Caddy deployment, public homepage returns 200 | PHP/MySQL portfolio with no JavaScript. Homepage checks describe the existing release, not deployment of this refresh. |
| MTG Card Bot | Running mtg-card-bot systemd service; repository README describes Python, discord.py, httpx, and Scryfall integration | Describe the running bot and documented capabilities. No claim of an end-to-end Discord interaction test during this review. |
| Dynamic DNS automation | xrayservice README and updater documentation, five-minute timer, successful last exit status | PHP CLI and Cloudflare API, with an explicit record allowlist and dry-run mode. No addresses, tokens, or DNS-account details. |

### Host review

The host reports Ubuntu 26.04.1 LTS. Caddy, PHP 8.5 FPM, MySQL, Docker,
containerd, Tailscale, fail2ban, and the MTG bot were running. Caddy has five
site definitions: the portfolio, Grace & Footnotes, Dunamis Status, the
support website, and the Imaging Services demo. All five returned HTTP 200
over public HTTPS. These five sites are represented by the portfolio entries
above; xrayservice.net is included in the RustDesk entry.

Scheduled jobs include monitoring, dynamic DNS, application and RustDesk
backups, the host backup, installer rebuilding, disk cleanup, and system
maintenance. Backup exit statuses establish that jobs reported success;
they do not establish restore correctness. Monitoring remains separate from
the static portfolio so a green portfolio label cannot imply current uptime.

Toolworks was removed from the featured inventory because this review found
no local checkout or running deployment establishing it as active on this
server. This is not a claim that its public repository is retired.

The inventory review did not change other sites, services, databases, server
settings, or production releases. The portfolio refresh was deployed as e3f991f. The Astro migration is a separate
release through the locked deploy/cutover.sh; see docs/migration.md.
No uptime, user-count, cost-saving, employment-date,
certification, or compliance claims were inferred from the inventory.

### Updating the portfolio

Recheck runtime state and relevant project documentation before changing a
status or stack. Keep the home and projects summaries aligned with the shared
cards and the expectations in `tests/http.ts`. Preserve project anchors used
by the experience links. Update this inventory when the demo launches or a
service is retired.

The Astro migration updates only this application’s stack card to match its new
runtime. Other project descriptions above remain a dated editorial inventory.


### October 22 migration verification

All six sites now use Astro and strict TypeScript. Portfolio, Grace & Footnotes,
Imaging Services demo and status use PostgreSQL with separate runtime roles.
Hodie and XrayService serve static output through Caddy. Status and Cloudflare
DDNS use TypeScript; the bot remains Python. Public stack descriptions reflect
these verified project handoffs; the company demo remains unlaunched and private.
The October 17 review above is historical evidence, not the current stack.
