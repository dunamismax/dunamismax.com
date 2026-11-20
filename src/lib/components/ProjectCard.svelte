<script lang="ts">
    import type { Project } from '../projects.js';
    let { project }: { project: Project } = $props();
</script>

<li>
    <article class={project.featured ? 'project-card project-card--featured' : 'project-card'} id={project.id}>
        <div class="project-card__head">
            <h3 class="project-card__name">{project.name}</h3>
            <span class={'project-status project-status--' + project.tone}>{project.status}</span>
        </div>
        <p class="project-card__role">{project.role}</p>
        <p class="project-card__tagline">{project.tagline}</p>
        <p class="project-card__detail">{project.detail}</p>
        <div class="project-card__foot">
            <div class="project-card__stack">{#each project.stack as tool (tool)}<span class="stack-chip">{tool}</span>{/each}</div>
            {#if project.links.length > 0}
                <div class="project-card__links">{#each project.links as link (link.href)}<a href={link.href} rel="noopener noreferrer" target="_blank" aria-label={`${project.name}: ${link.label}`}>{link.label} <span aria-hidden="true">↗</span></a>{/each}</div>
            {:else if project.note}
                <span class="project-card__note">{project.note}</span>
            {/if}
        </div>
    </article>
</li>
