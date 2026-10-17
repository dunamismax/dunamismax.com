<section class="hero-section" aria-labelledby="home-title">
    <div class="hero-background" aria-hidden="true"></div>
    <div class="section-inner hero-grid">
        <div class="hero-copy">
            <p class="eyebrow">Stephen Sawyer · dunamismax</p>
            <h1 id="home-title">I build the websites.<br>I run the systems.</h1>
            <p class="lede lede--strong">I’m Stephen Sawyer: a PHP-first web developer and hands-on sysadmin. I build with PHP and MySQL, automate with Python, and operate the Ubuntu infrastructure behind my work.</p>
            <p class="lede">From self-hosted RustDesk for my entire company to public websites, monitoring, and backups, I take responsibility for the code and the service people actually use.</p>
            <div class="hero-actions">
                <a href="/projects" class="button button-primary">View projects</a>
                <a href="/about" class="button button-secondary">Experience &amp; skills</a>
            </div>
            <ul class="stack-row" aria-label="Primary stack">
                <li class="stack-chip stack-chip--strong">PHP</li>
                <li class="stack-chip stack-chip--strong">MySQL</li>
                <li class="stack-chip stack-chip--strong">Python</li>
                <li class="stack-chip">HTML</li>
                <li class="stack-chip">CSS</li>
                <li class="stack-chip">Ubuntu</li>
                <li class="stack-chip">Caddy</li>
                <li class="stack-chip">Docker</li>
            </ul>
            <p class="fine-print">Code lives on <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">GitHub</a> and mirrors to <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">Codeberg</a>.</p>
        </div>
        <aside class="hero-aside" aria-label="Featured operations work">
            <section class="system-panel" aria-label="Company remote support">
                <div class="system-panel__header">
                    <span class="system-panel__label">In practice</span>
                    <span class="status-dot">Self-hosted</span>
                </div>
                <dl class="system-panel__rows">
                    <div>
                        <dt>Company-wide remote support</dt>
                        <dd>RustDesk server and relay, operated on my own Ubuntu infrastructure.</dd>
                    </div>
                    <div>
                        <dt>Customer experience</dt>
                        <dd>A preconfigured Windows download at xrayservice.net connects customers to the support service.</dd>
                    </div>
                    <div>
                        <dt>Ongoing operations</dt>
                        <dd>Scheduled installer verification, service monitoring, and daily backups.</dd>
                    </div>
                </dl>
                <p class="system-panel__link"><a href="/projects#rustdesk">Explore the remote support work <span aria-hidden="true">→</span></a></p>
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
                <span class="latest-card__title">Build notes are on the way.</span>
                <span class="latest-card__description">No posts yet. This is where I’ll share decisions and lessons from the systems I build and run.</span>
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
            <article class="signal-card"><p>Portfolio</p><strong>8 projects &amp; services</strong></article>
            <article class="signal-card"><p>Writing</p><strong><?= $postCount === null ? 'Notes on the blog' : e($postCount === 1 ? '1 published note' : $postCount . ' published notes') ?></strong></article>
            <article class="signal-card"><p>Responsibility</p><strong>Development through operations</strong></article>
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
                <p class="workflow-card__title">Remote support</p>
                <p>Company-wide RustDesk hosting, customer downloads, and repeatable Windows client setup.</p>
            </article>
            <article class="workflow-card">
                <p class="workflow-card__title">Scripting</p>
                <p>Python, uv, and Ruff for automation, bots, and one-off tooling; Bash for deploy and server glue.</p>
            </article>
            <article class="workflow-card">
                <p class="workflow-card__title">Operations</p>
                <p>Ubuntu, Caddy, isolated PHP-FPM pools, systemd services, monitoring, and encrypted backups.</p>
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
            <p>Practical work across company IT, public websites, and the automation that keeps them running.</p>
        </div>
        <ul class="card-list card-list--projects">
<?php require __DIR__ . '/partials/projects/infrastructure.php'; ?>
<?php require __DIR__ . '/partials/projects/apps.php'; ?>
<?php require __DIR__ . '/partials/projects/developer-tools.php'; ?>
        </ul>
        <p class="section-foot"><a href="/projects" class="section-link">Browse by area of work</a></p>
    </div>
</section>
<section class="page-section page-section--quiet" aria-labelledby="contact-title">
    <div class="section-inner">
        <div class="section-heading section-heading--split">
            <div>
                <p class="eyebrow">Get in touch</p>
                <h2 id="contact-title">Let’s talk about the work.</h2>
            </div>
            <p>Web development, self-hosted services, automation, or systems administration. Start with the problem you need to solve.</p>
        </div>
        <div class="hero-actions">
            <a href="/contact" class="button button-primary">Contact Stephen</a>
            <a href="/about" class="button button-secondary">Read my professional profile</a>
        </div>
    </div>
</section>
