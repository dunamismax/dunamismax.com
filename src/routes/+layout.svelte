<script lang="ts">
    import type { Snippet } from 'svelte';
    import { page } from '$app/state';
    import NavLink from '#lib/components/NavLink.svelte';
    import type { LayoutProps } from './$types';
    let { data, children }: LayoutProps & { children: Snippet } = $props();
    const { origin, production, cssVersion } = $derived(data.site);
    const status = $derived(page.status);
    const meta = $derived(status === 200 ? page.data.meta : undefined);
    const title = $derived(meta?.title ?? (status === 200 ? 'dunamismax' : status === 503 ? 'Temporarily unavailable' : 'Not found'));
    const fullTitle = $derived(title === 'dunamismax' ? title : `${title} · dunamismax`);
    const description = $derived(meta?.description ?? data.site.description);
    const canonical = $derived(origin + (meta?.path ?? '/'));
    const pathname = $derived(page.url.pathname);
    const section = $derived(pathname.startsWith('/blog') ? '/blog' : pathname);
    const noindex = $derived(status !== 200 || !production);
    const links = [['/projects', 'Projects'], ['/blog', 'Blog'], ['/about', 'About'], ['/contact', 'Contact']] as const;
</script>

<svelte:head>
    <title>{fullTitle}</title>
    <meta name="description" content={description}>
    <meta name="theme-color" content="#0d1117" media="(prefers-color-scheme: dark)">
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="color-scheme" content="dark light">
    <meta name="application-name" content="dunamismax">
    {#if noindex}<meta name="robots" content="noindex">{/if}
    {#if status === 200}
    <link rel="canonical" href={canonical}>
    <meta property="og:site_name" content="dunamismax">
    <meta property="og:type" content={meta?.ogType ?? 'website'}>
    <meta property="og:title" content={fullTitle}>
    <meta property="og:description" content={description}>
    <meta property="og:url" content={canonical}>
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content={fullTitle}>
    <meta name="twitter:description" content={description}>
    {/if}
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="alternate" type="application/rss+xml" title="dunamismax · Blog" href={origin + '/feed.xml'}>
    <link rel="stylesheet" href={'/css/site.css?v=' + cssVersion}>
</svelte:head>

<a href="#main-content" class="skip-link">Skip to content</a>
<header class="site-header">
    <nav class="primary-nav" aria-label="Primary navigation">
        <a href="/" class="brand-link" aria-label="dunamismax home">
            <span class="brand-mark" aria-hidden="true">DM</span>
            <span class="brand-word">dunamismax</span>
        </a>
        <div class="desktop-nav">
            {#each links as [href, label] (href)}<NavLink {href} {label} {section} />{/each}
        </div>
    </nav>
    <nav class="mobile-nav" aria-label="Section navigation">
        {#each links as [href, label] (href)}<NavLink {href} {label} {section} />{/each}
    </nav>
</header>
<main id="main-content" tabindex="-1">
{@render children()}
</main>
<footer class="site-footer">
    <div class="footer-inner">
        <div class="footer-brand-block">
            <a href="/" class="footer-brand-link">
                <span class="brand-mark brand-mark--footer" aria-hidden="true">DM</span>
                <span>dunamismax</span>
            </a>
            <p class="footer-copy">Stephen Sawyer · Web development, company remote support, and systems administration. Astro, TypeScript, PostgreSQL, Python, and the Ubuntu infrastructure I operate myself.</p>
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
            <p>&copy; {new Date().getUTCFullYear()} Stephen Sawyer.</p>
            <p class="footer-meta__claim">SvelteKit · TypeScript · Tailwind CSS · PostgreSQL · Served behind Caddy</p>
        </div>
    </div>
</footer>
