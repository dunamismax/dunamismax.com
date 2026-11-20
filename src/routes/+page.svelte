<script lang="ts">
    import ProjectCard from '#lib/components/ProjectCard.svelte';
    import LatestCard from '#lib/components/LatestCard.svelte';
    import { featuredProjects, allProjects } from '#lib/projects.js';
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
    const { latest, postCount } = $derived(data);
</script>

<section class="hero-section" aria-labelledby="home-title">
    <div class="hero-background" aria-hidden="true"></div>
    <div class="section-inner hero-grid">
        <div class="hero-copy">
            <p class="eyebrow">Stephen Sawyer · dunamismax</p>
            <h1 id="home-title">I build the software.<br>I run the servers.</h1>
            <p class="lede lede--strong">I’m Stephen Sawyer: a full-stack developer and hands-on sysadmin. I build web applications with SvelteKit, TypeScript, and PostgreSQL, and reach for Go, Python, and Swift when a project calls for a game server, a poker AI, or an iPhone app.</p>
            <p class="lede">Everything I ship runs on Ubuntu infrastructure I operate myself: eight public websites, a multiplayer game server, company-wide RustDesk support, monitoring, and encrypted backups. I take responsibility for the code and for the service people actually use.</p>
            <div class="hero-actions">
                <a href="/projects" class="button button-primary">View projects</a>
                <a href="/about" class="button button-secondary">Experience &amp; skills</a>
            </div>
            <ul class="stack-row" aria-label="Primary stack">
                <li class="stack-chip stack-chip--strong">SvelteKit</li>
                <li class="stack-chip stack-chip--strong">TypeScript</li>
                <li class="stack-chip stack-chip--strong">PostgreSQL</li>
                <li class="stack-chip stack-chip--strong">Go</li>
                <li class="stack-chip stack-chip--strong">Python</li>
                <li class="stack-chip">Swift</li>
                <li class="stack-chip">Tailwind CSS</li>
                <li class="stack-chip">Drizzle</li>
                <li class="stack-chip">Ubuntu</li>
                <li class="stack-chip">Caddy</li>
                <li class="stack-chip">Docker</li>
            </ul>
            <p class="fine-print">Code lives on <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">GitHub</a> and mirrors to <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">Codeberg</a>.</p>
        </div>
        <aside class="hero-aside" aria-label="Infrastructure I operate">
            <section class="system-panel" aria-label="Self-hosted infrastructure">
                <div class="system-panel__header">
                    <span class="system-panel__label">On my server</span>
                    <span class="status-dot">Self-hosted</span>
                </div>
                <dl class="system-panel__rows">
                    <div>
                        <dt>Web applications</dt>
                        <dd>SvelteKit apps on Node and static Astro sites behind Caddy, with separate service accounts and least-privilege PostgreSQL 18 roles.</dd>
                    </div>
                    <div>
                        <dt>Long-running services</dt>
                        <dd>A Go game server, a Python poker table server, a Discord bot, and the company’s RustDesk server and relay.</dd>
                    </div>
                    <div>
                        <dt>Operations</dt>
                        <dd>Five-minute monitoring, scheduled DNS updates, nightly age-encrypted backups, and immutable release directories.</dd>
                    </div>
                </dl>
                <p class="system-panel__link"><a href="/projects#group-infrastructure">See the infrastructure work <span aria-hidden="true">→</span></a></p>
            </section>
<LatestCard {latest} {postCount} />
        </aside>
    </div>
</section>
<section class="signal-bar" aria-label="At a glance">
    <div class="section-inner">
        <div class="signal-grid">
            <article class="signal-card"><p>Stack</p><strong>SvelteKit, TypeScript, PostgreSQL, Go, Python</strong></article>
            <article class="signal-card"><p>Portfolio</p><strong>{allProjects.length} projects &amp; services</strong></article>
            <article class="signal-card"><p>Writing</p><strong>{postCount === null ? 'Notes on the blog' : postCount === 1 ? '1 published note' : `${postCount} published notes`}</strong></article>
            <article class="signal-card"><p>Responsibility</p><strong>First commit through operations</strong></article>
        </div>
    </div>
</section>
<section class="page-section page-section--tight" aria-label="How I work">
    <div class="section-inner">
        <div class="workflow-grid">
            <article class="workflow-card">
                <p class="workflow-card__title">Web</p>
                <p>SvelteKit, Svelte 5, strict TypeScript, Tailwind CSS, and PostgreSQL with Drizzle. Server-rendered, accessible pages that work without JavaScript.</p>
            </article>
            <article class="workflow-card">
                <p class="workflow-card__title">Games &amp; realtime</p>
                <p>An authoritative Go MMO server with Protocol Buffers, and a Python poker engine streaming tables to the browser over WebSockets.</p>
            </article>
            <article class="workflow-card">
                <p class="workflow-card__title">Apps &amp; scripting</p>
                <p>Swift and SwiftUI for iPhone and iPad clients; Python with uv and Ruff for bots, AI training, and office automation; Bash for server glue.</p>
            </article>
            <article class="workflow-card">
                <p class="workflow-card__title">Operations</p>
                <p>Ubuntu, Caddy, systemd services and timers, Docker, PostgreSQL roles, Tailscale, monitoring, and encrypted backups with restore checks.</p>
            </article>
        </div>
    </div>
</section>
<section class="page-section" aria-labelledby="featured-title">
    <div class="section-inner">
        <div class="section-heading section-heading--split">
            <div>
                <p class="eyebrow">Selected work</p>
                <h2 id="featured-title">Built, hosted, and maintained.</h2>
            </div>
            <p>Games, websites, and company IT, all running on infrastructure I operate. The full portfolio also covers apps in development, automation, and an open-source C book.</p>
        </div>
        <ul class="card-list card-list--projects">
            {#each featuredProjects as project (project.id)}<ProjectCard {project} />{/each}
        </ul>
        <p class="section-foot"><a href="/projects" class="section-link">See all {allProjects.length} projects by area of work</a></p>
    </div>
</section>
<section class="page-section page-section--quiet" aria-labelledby="contact-title">
    <div class="section-inner">
        <div class="section-heading section-heading--split">
            <div>
                <p class="eyebrow">Get in touch</p>
                <h2 id="contact-title">Let’s talk about the work.</h2>
            </div>
            <p>Web applications, game servers, self-hosted services, automation, or systems administration. Start with the problem you need to solve.</p>
        </div>
        <div class="hero-actions">
            <a href="/contact" class="button button-primary">Contact Stephen</a>
            <a href="/about" class="button button-secondary">Read my professional profile</a>
        </div>
    </div>
</section>
