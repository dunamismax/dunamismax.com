<script lang="ts">
    import { page } from '$app/state';
    import ErrorPanel from '#lib/components/ErrorPanel.svelte';
</script>

<ErrorPanel code={page.status === 503 ? 503 : 404} />
