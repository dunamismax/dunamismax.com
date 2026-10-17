<li>
    <article class="project-card" id="mtg-card-bot">
        <div class="project-card__head">
            <h3 class="project-card__name">MTG Card Bot</h3>
            <span class="project-status project-status--active">In service</span>
        </div>
        <p class="project-card__role">Community tooling · Development &amp; operations</p>
        <p class="project-card__tagline">A Discord bot that brings Magic: The Gathering card search, pricing, legality, and rulings into the conversation using Scryfall data.</p>
        <p class="project-card__detail">Python, discord.py, and httpx handle card lookups and API requests. It runs as a systemd service on Ubuntu, with structured logging, duplicate suppression, and graceful shutdown.</p>
        <div class="project-card__foot">
            <div class="project-card__stack"><span class="stack-chip">Python</span><span class="stack-chip">discord.py</span><span class="stack-chip">httpx</span><span class="stack-chip">systemd</span></div>
            <div class="project-card__links"><a href="https://github.com/dunamismax/mtg-card-bot" rel="noopener noreferrer" target="_blank" aria-label="MTG Card Bot: Source">Source <span aria-hidden="true">↗</span></a></div>
        </div>
    </article>
</li>
<li>
    <article class="project-card" id="dns-automation">
        <div class="project-card__head">
            <h3 class="project-card__name">Dynamic DNS automation</h3>
            <span class="project-status project-status--active">Scheduled</span>
        </div>
        <p class="project-card__role">Network operations · Automation</p>
        <p class="project-card__tagline">A PHP command-line updater keeps selected Cloudflare DNS records aligned with the server’s public address.</p>
        <p class="project-card__detail">A systemd timer runs every five minutes. An explicit record allowlist and a dry-run mode keep the scope clear and let changes be inspected before they are applied.</p>
        <div class="project-card__foot">
            <div class="project-card__stack"><span class="stack-chip">PHP CLI</span><span class="stack-chip">Cloudflare API</span><span class="stack-chip">systemd</span></div>
            <span class="project-card__note">Part of the support infrastructure</span>
        </div>
    </article>
</li>
