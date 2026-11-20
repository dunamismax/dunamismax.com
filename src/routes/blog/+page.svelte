<script lang="ts">
    import { shortDate, readingMinutes } from '#lib/text.ts';
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
    const { page, pages, items } = $derived(data);
</script>

<section class="page-hero" aria-labelledby="blog-title"><div class="section-inner"><p class="eyebrow">Blog</p><h1 id="blog-title">Notes from shipping software.</h1><p class="lede">Build logs, design notes, and server notes from SvelteKit web apps, Go and Python game servers, and self-hosted operations.</p></div></section>
<section class="page-section"><div class="section-inner">
{#if items.length === 0}<section class="empty-state" aria-labelledby="empty-title"><p class="eyebrow">No posts yet.</p><h2 id="empty-title">The blog route is ready.</h2><p>Published posts will render here and in the RSS feed. Drafts stay private until they are published.</p><a href="/projects" class="section-link">Browse current projects</a></section>{:else}<ul class="card-list">{#each items as item (item.slug)}<li><a href={'/blog/' + item.slug} class="post-card"><span class="post-card__meta"><time datetime={item.published_at.toISOString().slice(0,10)}>{shortDate(item.published_at)}</time> · {readingMinutes(item.body)} min read</span><span class="post-card__title">{item.title}</span>{#if item.excerpt}<span class="post-card__description">{item.excerpt}</span>{/if}</a></li>{/each}</ul>{/if}
{#if pages > 1}<nav class="pagination" aria-label="Blog pages">{#if page > 1}<a href={'/blog' + (page > 2 ? '?page=' + (page - 1) : '')} class="section-link">Newer posts</a>{/if}<span>Page {page} of {pages}</span>{#if page < pages}<a href={'/blog?page=' + (page + 1)} class="section-link">Older posts</a>{/if}</nav>{/if}
</div></section>
