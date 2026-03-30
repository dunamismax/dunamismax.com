<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span class="phase-pill">{{ label }}</span>
</template>

<style scoped>
.phase-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 999px;
  background: rgb(91 138 245 / 10%);
  color: var(--accent-hover);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: 0.35rem 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
