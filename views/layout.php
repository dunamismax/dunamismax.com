<?php $fullTitle = $title === 'dunamismax' ? $title : $title . ' · dunamismax'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($fullTitle) ?></title>
    <meta name="description" content="<?= e($description) ?>">
    <meta name="theme-color" content="#0d1117" media="(prefers-color-scheme: dark)">
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="color-scheme" content="dark light">
    <meta name="application-name" content="dunamismax">
    <?php if ($noindex): ?><meta name="robots" content="noindex"><?php endif; ?>
    <?php if ($status === 200): ?>
    <link rel="canonical" href="<?= e($config->url . $path) ?>">
    <meta property="og:site_name" content="dunamismax">
    <meta property="og:type" content="<?= e($ogType) ?>">
    <meta property="og:title" content="<?= e($fullTitle) ?>">
    <meta property="og:description" content="<?= e($description) ?>">
    <meta property="og:url" content="<?= e($config->url . $path) ?>">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="<?= e($fullTitle) ?>">
    <meta name="twitter:description" content="<?= e($description) ?>">
    <?php endif; ?>
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="alternate" type="application/rss+xml" title="dunamismax · Blog" href="<?= e($config->url . '/feed.xml') ?>">
    <link rel="stylesheet" href="/css/site.css?v=<?= e($cssVersion) ?>">
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to content</a>
    <header class="site-header">
        <nav class="primary-nav" aria-label="Primary navigation">
            <a href="/" class="brand-link" aria-label="dunamismax home">
                <span class="brand-mark" aria-hidden="true">DM</span>
                <span class="brand-word">dunamismax</span>
            </a>
            <div class="desktop-nav">
                <?= nav_link('/projects', 'Projects', $section) ?>
                <?= nav_link('/blog', 'Blog', $section) ?>
                <?= nav_link('/about', 'About', $section) ?>
                <?= nav_link('/contact', 'Contact', $section) ?>
            </div>
        </nav>
        <nav class="mobile-nav" aria-label="Section navigation">
            <?= nav_link('/projects', 'Projects', $section) ?>
            <?= nav_link('/blog', 'Blog', $section) ?>
            <?= nav_link('/about', 'About', $section) ?>
            <?= nav_link('/contact', 'Contact', $section) ?>
        </nav>
    </header>
    <main id="main-content" tabindex="-1">
<?= $content ?>
    </main>
    <footer class="site-footer">
        <div class="footer-inner">
            <div class="footer-brand-block">
                <a href="/" class="footer-brand-link">
                    <span class="brand-mark brand-mark--footer" aria-hidden="true">DM</span>
                    <span>dunamismax</span>
                </a>
                <p class="footer-copy">Stephen Sawyer. PHP-first web developer, Python scripter, and sysadmin who prefers plain tools, private data, careful security, and servers he runs himself.</p>
            </div>
            <nav class="footer-columns" aria-label="Footer">
                <div class="footer-column">
                    <p class="footer-column__title">Site</p>
                    <a href="/">Home</a>
                    <a href="/projects">Projects</a>
                    <a href="/blog">Blog</a>
                    <a href="/about">About</a>
                    <a href="/contact">Contact</a>
                </div>
                <div class="footer-column">
                    <p class="footer-column__title">Code</p>
                    <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">GitHub</a>
                    <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">Codeberg</a>
                    <a href="https://github.com/dunamismax/dunamismax.com" rel="noopener noreferrer me" target="_blank">Site source</a>
                    <a href="/feed.xml">RSS feed</a>
                </div>
                <div class="footer-column">
                    <p class="footer-column__title">Elsewhere</p>
                    <a href="mailto:dunamismax@tutamail.com" rel="me">Email</a>
                    <a href="https://www.reddit.com/user/DunamisMax/" rel="noopener noreferrer me" target="_blank">Reddit</a>
                </div>
            </nav>
        </div>
        <div class="footer-meta">
            <div class="footer-meta__inner">
                <p>&copy; <?= date('Y') ?> Stephen Sawyer.</p>
                <p class="footer-meta__claim">PHP · MySQL · Python · Served behind Caddy</p>
            </div>
        </div>
    </footer>
</body>
</html>
