<section class="hero-section" aria-labelledby="home-title">
    <div class="hero-background" aria-hidden="true"></div>
    <div class="section-inner hero-grid">
        <div class="hero-copy">
            <p class="eyebrow">Stephen Sawyer · dunamismax</p>
            <h1 id="home-title">PHP-first web work and hands-on systems administration.</h1>
            <p class="lede lede--strong">I build bespoke, object-oriented PHP on MySQL with semantic HTML and hand-written CSS, script the routine work in Python, and run the Ubuntu servers it all lives on.</p>
            <p class="lede">Vanilla by default: no frameworks, no build steps, and no JavaScript unless a feature truly needs it. Readable code, owned infrastructure, and pages that load fast.</p>
            <div class="hero-actions">
                <a href="/projects" class="button button-primary">View projects</a>
                <a href="/about" class="button button-secondary">Read about Stephen</a>
            </div>
            <ul class="stack-row" aria-label="Primary stack">
                <li class="stack-chip stack-chip--strong">PHP</li>
                <li class="stack-chip stack-chip--strong">MySQL</li>
                <li class="stack-chip stack-chip--strong">Python</li>
                <li class="stack-chip">HTML</li>
                <li class="stack-chip">CSS</li>
                <li class="stack-chip">JavaScript</li>
                <li class="stack-chip">Ubuntu</li>
                <li class="stack-chip">Caddy</li>
                <li class="stack-chip">PHP-FPM</li>
                <li class="stack-chip">systemd</li>
                <li class="stack-chip">Bash</li>
                <li class="stack-chip">uv</li>
                <li class="stack-chip">Ruff</li>
            </ul>
            <p class="fine-print">Code lives on <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">GitHub</a> and mirrors to <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">Codeberg</a>.</p>
        </div>
        <aside class="hero-aside" aria-label="Site snapshot">
            <section class="system-panel" aria-label="Current focus">
                <div class="system-panel__header">
                    <span class="system-panel__label">Current direction</span>
                    <span class="status-dot">Live</span>
                </div>
                <dl class="system-panel__rows">
                    <div>
                        <dt>Web</dt>
                        <dd>Bespoke PHP 8.5 · MySQL · semantic HTML · vanilla CSS</dd>
                    </div>
                    <div>
                        <dt>Scripts</dt>
                        <dd>Python · uv · Ruff · Bash</dd>
                    </div>
                    <div>
                        <dt>Ops</dt>
                        <dd>Ubuntu LTS · Caddy · PHP-FPM · systemd · backups</dd>
                    </div>
                </dl>
            </section>
<?php if ($latest !== null): ?>
            <a href="/blog/<?= e($latest['slug']) ?>" class="latest-card">
                <span class="latest-card__kicker">Latest post</span>
                <span class="latest-card__title"><?= e($latest['title']) ?></span>
                <span class="latest-card__meta"><?= e(short_date($latest['published_at'])) ?> · <?= e(reading_minutes($latest['body'])) ?> min read</span>
<?php if ($latest['excerpt'] !== ''): ?>
                <span class="latest-card__description"><?= e($latest['excerpt']) ?></span>
<?php endif; ?>
            </a>
<?php elseif ($postCount === 0): ?>
            <a href="/blog" class="latest-card latest-card--empty">
                <span class="latest-card__kicker">Blog</span>
                <span class="latest-card__title">Writing is ready for build notes.</span>
                <span class="latest-card__meta">RSS and draft filtering are in place</span>
                <span class="latest-card__description">Published posts will appear here automatically, while drafts stay out of public pages and the feed.</span>
            </a>
<?php else: ?>
            <a href="/blog" class="latest-card latest-card--empty">
                <span class="latest-card__kicker">Blog</span>
                <span class="latest-card__title">Build logs and server notes.</span>
                <span class="latest-card__description">Read the latest writing on the blog.</span>
            </a>
<?php endif; ?>
        </aside>
    </div>
</section>
<section class="signal-bar" aria-label="At a glance">
    <div class="section-inner">
        <div class="signal-grid">
            <article class="signal-card"><p>Stack</p><strong>PHP, MySQL, Python</strong></article>
            <article class="signal-card"><p>Work</p><strong>4 public projects</strong></article>
            <article class="signal-card"><p>Writing</p><strong><?= $postCount === null ? 'Notes on the blog' : e($postCount === 1 ? '1 published note' : $postCount . ' published notes') ?></strong></article>
            <article class="signal-card"><p>Deploy</p><strong>Self-hosted behind Caddy</strong></article>
        </div>
    </div>
</section>
<section class="page-section page-section--tight" aria-label="How I work">
    <div class="section-inner">
        <div class="workflow-grid">
            <article class="workflow-card">
                <p class="workflow-card__title">Web</p>
                <p>Bespoke object-oriented PHP, prepared SQL, server-rendered semantic HTML, and hand-written CSS.</p>
            </article>
            <article class="workflow-card">
                <p class="workflow-card__title">Data</p>
                <p>MySQL for published content and durable records, with explicit schemas and least-privilege accounts.</p>
            </article>
            <article class="workflow-card">
                <p class="workflow-card__title">Scripting</p>
                <p>Python, uv, and Ruff for automation, bots, and one-off tooling; Bash for deploy and server glue.</p>
            </article>
            <article class="workflow-card">
                <p class="workflow-card__title">Operations</p>
                <p>Ubuntu servers, Caddy, PHP-FPM pools, systemd services and timers, and backups with restore checks.</p>
            </article>
        </div>
    </div>
</section>
<section class="page-section" aria-labelledby="featured-title">
    <div class="section-inner">
        <div class="section-heading section-heading--split">
            <div>
                <p class="eyebrow">Featured projects</p>
                <h2 id="featured-title">Current public work.</h2>
            </div>
            <p>Python bots and automation, self-hosted operations tooling, and this site.</p>
        </div>
        <ul class="card-list card-list--projects">
<?php require __DIR__ . '/partials/projects/apps.php'; ?>
<?php require __DIR__ . '/partials/projects/infrastructure.php'; ?>
<?php require __DIR__ . '/partials/projects/developer-tools.php'; ?>
        </ul>
        <p class="section-foot"><a href="/projects" class="section-link">See every project</a></p>
    </div>
</section>
<section class="page-section page-section--quiet" aria-labelledby="navigate-title">
    <div class="section-inner">
        <div class="section-heading section-heading--split">
            <div>
                <p class="eyebrow">Navigate</p>
                <h2 id="navigate-title">Find the useful surface.</h2>
            </div>
            <p>A compact route map for projects, writing, background, and contact paths.</p>
        </div>
        <nav class="nav-card-grid" aria-label="Quick navigation">
            <a href="/projects" class="nav-card">
                <span class="nav-card__title">Projects</span>
                <span class="nav-card__detail">Python automation and operations tooling grouped by category.</span>
            </a>
            <a href="/blog" class="nav-card">
                <span class="nav-card__title">Blog</span>
                <span class="nav-card__detail">Build logs, server notes, and practical decisions from real systems.</span>
            </a>
            <a href="/about" class="nav-card">
                <span class="nav-card__title">About</span>
                <span class="nav-card__detail">Stephen's working style, stack priorities, and operating habits.</span>
            </a>
            <a href="/contact" class="nav-card">
                <span class="nav-card__title">Contact</span>
                <span class="nav-card__detail">Email, Signal, GitHub, Codeberg, Reddit, and the source for this site.</span>
            </a>
        </nav>
    </div>
</section>
