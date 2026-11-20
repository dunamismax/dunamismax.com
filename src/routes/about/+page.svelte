<section class="page-hero" aria-labelledby="about-title">
    <div class="section-inner">
        <p class="eyebrow">Professional profile · dunamismax</p>
        <h1 id="about-title">Stephen Sawyer.</h1>
        <p class="lede">Full-stack developer, sysadmin, and the person responsible for keeping the service running.</p>
        <p class="profile-intro">SvelteKit and TypeScript web development, Go and Python on the server, Swift for Apple clients, and practical Ubuntu systems administration. I connect application work with company IT, remote support, and the infrastructure I operate myself.</p>
        <p class="profile-contact"><a href="mailto:dunamismax@tutamail.com" rel="me">dunamismax@tutamail.com</a></p>
        <div class="hero-actions">
            <a href="/contact" class="button button-primary">Get in touch</a>
            <a href="/projects" class="button button-secondary">Explore my work</a>
        </div>
    </div>
</section>
<section class="page-section" aria-labelledby="experience-title">
    <div class="section-inner profile-grid">
        <div class="section-heading">
            <p class="eyebrow">Practical experience</p>
            <h2 id="experience-title">What I take responsibility for.</h2>
            <p>My work combines building applications with the everyday work of hosting, supporting, monitoring, and maintaining them.</p>
        </div>
        <div class="experience-list">
            <article class="experience-item">
                <h3>Company remote support</h3>
                <p>I self-host RustDesk for my entire company. I operate its server and relay, maintain the customer support website and preconfigured Windows download, and automate verified installer builds and service backups.</p>
                <a href="/projects#rustdesk">RustDesk &amp; xrayservice.net <span aria-hidden="true">→</span></a>
            </article>
            <article class="experience-item">
                <h3>Web applications &amp; publishing</h3>
                <p>I build bespoke SvelteKit applications with strict TypeScript, PostgreSQL, and Drizzle, server-rendered with semantic HTML and Tailwind CSS. My work includes this portfolio, Grace &amp; Footnotes, my father’s ministry archive at vincentsawyer.org, and an Imaging Services website replacement currently hosted as a demo.</p>
                <a href="/projects#group-apps">Websites &amp; publishing <span aria-hidden="true">→</span></a>
            </article>
            <article class="experience-item">
                <h3>Games &amp; realtime systems</h3>
                <p>Lorehallow is a multiplayer game with an authoritative Go server and a Protocol Buffers protocol, built to be measured before it makes any claim about scale. RiverMind Poker runs no-limit hold’em tables in Python over WebSockets, with bots trained by counterfactual regret minimization. Azeroth Trail is a live, source-checked WoW leveling guide.</p>
                <a href="/projects#group-games">Games &amp; play <span aria-hidden="true">→</span></a>
            </article>
            <article class="experience-item">
                <h3>Product development</h3>
                <p>I plan and build products end to end, from decision records and build plans to tested code. Field Cadence is a field-service platform for imaging dealers with a SwiftUI technician app; Day by Word is a Bible reading companion for iPhone, iPad, and the web.</p>
                <a href="/projects#group-in-development">Apps in development <span aria-hidden="true">→</span></a>
            </article>
            <article class="experience-item">
                <h3>Ubuntu systems administration</h3>
                <p>I administer the shared server: Caddy for HTTPS, dedicated Node, Go, and Python services under systemd, PostgreSQL 18 with separate least-privilege roles, Docker, and scheduled jobs. Operations include Tailscale access, fail2ban, Lynis audits, monitoring, and age-encrypted backups with restore checks and rebuild procedures.</p>
                <a href="/projects#group-infrastructure">Infrastructure &amp; recovery <span aria-hidden="true">→</span></a>
            </article>
            <article class="experience-item">
                <h3>Automation, bots &amp; teaching</h3>
                <p>I use Python for bots and business automation, TypeScript for monitoring and scheduled DNS updates, and Bash for deployment glue. The MTG Card Bot connects Discord to Scryfall, and C From The Ground Up teaches C from first principles to systems programming.</p>
                <a href="/projects#group-developer-tools">Bots, tools &amp; teaching <span aria-hidden="true">→</span></a>
            </article>
        </div>
    </div>
</section>
<section class="page-section page-section--quiet" aria-labelledby="skills-title">
    <div class="section-inner">
        <div class="section-heading">
            <p class="eyebrow">Technical skills</p>
            <h2 id="skills-title">The tools behind the work.</h2>
        </div>
        <dl class="skills-grid">
            <div><dt>Web applications</dt><dd>SvelteKit 3, Svelte 5, strict TypeScript, Tailwind CSS 4, PostgreSQL 18, Drizzle ORM, Better Auth, Astro for static sites, semantic HTML, and accessible, script-free server rendering.</dd></div>
            <div><dt>Languages</dt><dd>TypeScript, Go, Python, Swift, SQL, C, and Bash.</dd></div>
            <div><dt>Games &amp; realtime</dt><dd>Authoritative Go servers, goroutine-per-zone design, Protocol Buffers with Buf, WebSockets, fuzz-tested game engines, and MCCFR poker training.</dd></div>
            <div><dt>Python &amp; automation</dt><dd>uv, Ruff, pytest, Alembic, discord.py, httpx, the Scryfall and Cloudflare APIs, and QuickBooks reconciliation tooling.</dd></div>
            <div><dt>Apple platforms</dt><dd>Swift 6, SwiftUI, and Xcode for iPhone and iPad clients that share HTTPS APIs with the web apps.</dd></div>
            <div><dt>Hosting &amp; operations</dt><dd>Ubuntu, Caddy, Node.js, systemd services and timers, Docker, Git with GitHub and Codeberg mirrors, GitHub Actions, and immutable, versioned releases.</dd></div>
            <div><dt>Security &amp; recovery</dt><dd>Least-privilege service and database accounts, Tailscale, fail2ban, Lynis, strict CSP headers, age-encrypted backups, and isolated restore checks.</dd></div>
            <div><dt>Support</dt><dd>RustDesk server and relay, Windows client builds with Authenticode verification, and the customer-facing support flow.</dd></div>
        </dl>
    </div>
</section>
<section class="page-section" aria-labelledby="approach-title">
    <div class="section-inner profile-grid">
        <div class="section-heading">
            <p class="eyebrow">Working approach</p>
            <h2 id="approach-title">Keep it understandable.</h2>
        </div>
        <article class="prose">
            <p><strong>Choose simple tools deliberately.</strong> I standardize on one web stack and reach for Go, Python, or Swift only when a project needs them. I prefer readable TypeScript, explicit schemas, and pages that work without scripts. Dependencies need to justify their ongoing maintenance cost.</p>
            <p><strong>Make security part of the design.</strong> Parameterized queries, escaped output, separate publishing and read-only database roles, and credentials outside the release directory give each component a clear boundary.</p>
            <p><strong>Plan in writing, then own the operating work.</strong> Each project carries its build plan and decision records in the repository. Shipping includes deployment, monitoring, backups, and recovery documentation; I want to understand how a service behaves and how to put it back together.</p>
            <p><strong>Be precise about what is ready.</strong> A working demo, a running service, and a verified recovery are different milestones. I describe the work according to what has actually been done.</p>
            <p>For project questions or work conversations, <a href="/contact">get in touch</a>. Source for my public code is on <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">GitHub</a> and <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">Codeberg</a>.</p>
        </article>
    </div>
</section>
