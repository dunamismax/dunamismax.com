# Portfolio evidence

The site's portfolio is the typed inventory in `src/lib/projects.ts`. Recheck
a project's running service, its repository documentation and its public
HTTPS response before changing a status, stack or description, and record the
evidence here. Sections below are dated; older ones are history, not the
current state.

## November 20, 2026 review

Reviewed against the MacBook's `~/github` checkouts (README, BUILD and latest
commits), `root@ubuntu-vm` (running systemd services, timers, Docker
containers, Caddy site files, release symlinks) and the public GitHub account.
This is an editorial inventory, not a live health report or a security audit.

### Host

Ubuntu 26.04.1 LTS. Caddy 2.11.9 (`/usr/local/lib/caddy/caddy`), PostgreSQL
18.6, Node 24.22.3 (`/opt/node-runtime`), Go 1.27.4, Docker 29.10, Tailscale,
fail2ban and a Lynis timer. PHP-FPM and MySQL are no longer running, so no
portfolio copy may describe them as current. Caddy serves ten site files:
dunamismax.com, graceandfootnotes.com, status.dunamismax.com, vincentsawyer.org,
azerothtrail.com, lorehallow.com (with play.lorehallow.com, which serves the browser
game prototype), rivermindpoker.com, xrayservice.net,
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
| Lorehallow | Public repo; `lorehallow-server` (Go binary) running; lorehallow.com 200 from the script-free SvelteKit release `9c4a1c7`; play.lorehallow.com serves the Phaser client and a named connection joins the shared map (checked 2026-11-20); BUILD.md Phase 2 current | Pre-alpha. An open prototype with no accounts; no v0.2.0 release yet. Scale is a target, never a claim. |
| RiverMind Poker | Public GPL repo; `rivermind-poker serve-nl` running behind Caddy; rivermindpoker.com 200 | Play money only, bots always labelled. Credit its open-source origins. |
| Azeroth Trail | Public repo; `azerothtrail.service` (SvelteKit, adapter-node on 127.0.0.1:4315) active from release `1bbe241`, which includes the SvelteKit, PostgreSQL 18 and Drizzle move `9740b04`; Caddy serves the prerendered pages and proxies the tracker API; the old `azerothtrail-status` service is inactive; azerothtrail.com 200 (rechecked 2026-11-20) | Paladin and Druid only; Web Push status alerts. |
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
