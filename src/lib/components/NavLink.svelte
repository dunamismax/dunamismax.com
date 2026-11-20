<script lang="ts">
    let { href, label, section }: { href: string; label: string; section: string } = $props();
    const current = $derived(section === href);
</script>

<a {href} class={current ? 'is-current' : undefined} aria-current={current ? 'page' : undefined}>{label}</a>
