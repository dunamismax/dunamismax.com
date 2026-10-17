# Portfolio evidence

Reviewed 2026-10-17 against the server's running services, Docker container
state, Caddy site definitions, scheduled jobs, sibling repository documentation,
and public HTTPS responses. This is a dated editorial inventory, not a live
health report or a security audit.

## Verified work

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

## Host review

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
settings, or production releases. Deployment of the portfolio refresh is a
separate step through `deploy/03-deploy.sh`.
No uptime, user-count, cost-saving, employment-date,
certification, or compliance claims were inferred from the inventory.

## Updating the portfolio

Recheck runtime state and relevant project documentation before changing a
status or stack. Keep the home and projects summaries aligned with the shared
cards and the expectations in `tests/run.php`. Preserve project anchors used
by the experience links. Update this inventory when the demo launches or a
service is retired.
