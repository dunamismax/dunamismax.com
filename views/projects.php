<section class="page-hero" aria-labelledby="projects-title">
    <div class="section-inner">
        <p class="eyebrow">Projects</p>
        <h1 id="projects-title">Live projects.</h1>
        <p class="lede">Python automation, self-hosted operations tooling, a programming-language reference, and this PHP site.</p>
        <ul class="hero-summary" aria-label="Project summary">
            <li>5 public projects</li>
            <li>4 active categories</li>
            <li>Hand-written HTML, no CMS</li>
        </ul>
    </div>
</section>
<section class="page-section">
    <div class="section-inner">
        <section class="project-group" aria-labelledby="group-apps">
            <header class="project-group__heading">
                <h2 id="group-apps">Applications</h2>
                <p>Products and services with clear data models and owned infrastructure.</p>
            </header>
            <ul class="card-list card-list--projects">
<?php require __DIR__ . '/partials/projects/apps.php'; ?>
            </ul>
        </section>
        <section class="project-group" aria-labelledby="group-infrastructure">
            <header class="project-group__heading">
                <h2 id="group-infrastructure">Infrastructure</h2>
                <p>Self-hosted services, networking, and operations work.</p>
            </header>
            <ul class="card-list card-list--projects">
<?php require __DIR__ . '/partials/projects/infrastructure.php'; ?>
            </ul>
        </section>
        <section class="project-group" aria-labelledby="group-developer-tools">
            <header class="project-group__heading">
                <h2 id="group-developer-tools">Developer tools</h2>
                <p>Tooling, automation, and operator-facing utilities.</p>
            </header>
            <ul class="card-list card-list--projects">
<?php require __DIR__ . '/partials/projects/developer-tools.php'; ?>
            </ul>
        </section>
        <section class="project-group" aria-labelledby="group-reference">
            <header class="project-group__heading">
                <h2 id="group-reference">Reference</h2>
                <p>Open references that explain languages, ecosystems, and practical engineering choices.</p>
            </header>
            <ul class="card-list card-list--projects">
<?php require __DIR__ . '/partials/projects/reference.php'; ?>
            </ul>
        </section>
    </div>
</section>
