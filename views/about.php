<section class="page-hero" aria-labelledby="about-title">
    <div class="section-inner">
        <p class="eyebrow">About</p>
        <h1 id="about-title">Stephen Sawyer.</h1>
        <p class="lede">PHP-first web development, Python scripting, and practical systems administration.</p>
    </div>
</section>
<section class="page-section">
    <div class="section-inner">
        <article class="prose">
            <p><strong>I build for the web with plain tools:</strong> bespoke, object-oriented PHP; MySQL for durable content; semantic HTML; and hand-written CSS. JavaScript shows up only when a feature earns it, and most pages send none at all. Python handles the scripting: automation, bots, data cleanup, and the glue that keeps routine work repeatable.</p>

            <p>I am a sysadmin as much as a developer. My sites run on an Ubuntu server I administer myself: Caddy in front for HTTPS, a dedicated PHP-FPM pool and system user for each site, MySQL on localhost, systemd timers for backups, and SSH that stays off the public internet.</p>

            <p>The work I like best has a clear owner, a clear data model, and an operating story that can be understood without a vendor diagram. A small program on infrastructure you control is still one of the fastest ways to turn an idea into something durable.</p>

            <h2>What I care about</h2>

            <p><strong>Vanilla first.</strong> Frameworks, package managers, and build steps all carry a lifetime cost. I add a dependency only when a concrete need justifies it, and I would rather read fifty lines of my own PHP than debug someone else's abstraction.</p>

            <p><strong>Security as architecture.</strong> Prepared SQL, escaped output, least-privilege database accounts, secrets kept out of the web root and out of Git, and trust boundaries decided before the first line of code.</p>

            <p><strong>Ownership.</strong> I like software that can run on hardware you control, with data you can inspect, back up, restore, and move when you need to.</p>

            <p><strong>Explicit data.</strong> Schemas, migrations, records, validation, and SQL should make the system easier to reason about, not harder. If you cannot trace a value through the system, the system is too clever.</p>

            <p><strong>Operational discipline.</strong> I value iteration, but not chaos. The goal is useful software with complexity that has earned its place.</p>

            <h2>The stack</h2>

            <p><strong>PHP</strong> is the center: a small front controller, readable classes, templates that output semantic HTML, and plain-PHP tests. No framework, ORM, CMS, or Composer dependency unless one clearly pays for itself.</p>

            <p><strong>MySQL</strong> is the data layer. Published writing, drafts, and durable records live in explicit schemas behind prepared statements, with separate read-only and writer accounts.</p>

            <p><strong>HTML, CSS, and JavaScript</strong> stay vanilla. Pages are rendered on the server and work without scripts, styles are hand-written and responsive, and any enhancement is small, local, and deferred.</p>

            <p><strong>Python</strong> is for scripting: automation, prototypes, data scripts, bots, operational glue, and one-off tooling. New Python work uses <code>uv</code>, project-local virtual environments, Ruff, pytest, and a checked-in <code>pyproject.toml</code>.</p>

            <p><strong>Operations</strong> stay practical: macOS for local work, Ubuntu LTS for servers, Caddy for TLS, PHP-FPM and systemd for long-running services, SSH deploys, MySQL backups with restore checks, Bash and zsh on Unix, and PowerShell where Windows administration is the right tool.</p>
        </article>
    </div>
</section>
