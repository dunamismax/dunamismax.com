<script lang="ts">
    import { shortDate, readingMinutes, paragraphs } from '#lib/text.ts';
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
    const post = $derived(data.post);
</script>

<!-- paragraphs() escapes the plain-text body before adding <p>/<br> markup. -->
<article aria-labelledby="post-title"><header class="page-hero"><div class="section-inner"><div class="post-detail"><p class="eyebrow"><a href="/blog">Blog</a></p><h1 id="post-title">{post.title}</h1>{#if post.excerpt}<p class="lede">{post.excerpt}</p>{/if}<p class="post-detail__meta"><time datetime={post.published_at.toISOString().slice(0,10)}>{shortDate(post.published_at)}</time><span>{readingMinutes(post.body)} min read</span></p></div></div></header><div class="page-section"><div class="section-inner"><div class="post-detail"><div class="post-body">{@html paragraphs(post.body)}</div><p class="section-foot"><a href="/blog" class="section-link">Back to all posts</a></p></div></div></div></article>
