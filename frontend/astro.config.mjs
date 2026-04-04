import vue from '@astrojs/vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://dunamismax.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
})
