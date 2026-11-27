<script lang="ts">
    import ProjectCard from '#lib/components/ProjectCard.svelte';
    import { projectGroups, allProjects } from '#lib/projects.js';
</script>

<section class="page-hero" aria-labelledby="projects-title">
    <div class="section-inner">
        <p class="eyebrow">Portfolio</p>
        <h1 id="projects-title">Games, websites, apps, and the systems behind them.</h1>
        <p class="lede">A poker AI you can play against, the websites I build for my family and my company, and the infrastructure I run for all of it. I own each project from the first commit through deployment, monitoring, and backups.</p>
        <ul class="hero-summary" aria-label="Project summary">
            <li>{allProjects.length} projects &amp; services</li>
            <li>{projectGroups.length} areas of work</li>
            <li>Self-hosted on Ubuntu</li>
        </ul>
        <nav class="section-nav" aria-label="Project categories">
            {#each projectGroups as group (group.id)}<a href={'#' + group.id}>{group.title}</a>{/each}
        </nav>
    </div>
</section>
<section class="page-section">
    <div class="section-inner">
        {#each projectGroups as group (group.id)}
            <section class="project-group" aria-labelledby={group.id}>
                <header class="project-group__heading">
                    <h2 id={group.id}>{group.title}</h2>
                    <p>{group.summary}</p>
                </header>
                <ul class="card-list card-list--projects">
                    {#each group.projects as project (project.id)}<ProjectCard {project} />{/each}
                </ul>
            </section>
        {/each}
        <p class="fine-print">This is a portfolio, not a live availability feed. For current service checks, visit <a href="https://status.dunamismax.com" rel="noopener noreferrer" target="_blank">Dunamis Status</a>. The Imaging Services replacement is a demo pending launch, and apps marked in development have not been released.</p>
    </div>
</section>
<section class="page-section page-section--quiet" aria-labelledby="portfolio-contact">
    <div class="section-inner">
        <div class="section-heading">
            <p class="eyebrow">Behind the projects</p>
            <h2 id="portfolio-contact">One person, from application to operations.</h2>
            <p>I work across the interface, the server, the database, and the machine it all runs on. Read more about my responsibilities and technical skills, or get in touch about the work.</p>
        </div>
        <div class="hero-actions">
            <a href="/about" class="button button-secondary">Experience &amp; skills</a>
            <a href="/contact" class="button button-primary">Contact Stephen</a>
        </div>
    </div>
</section>
