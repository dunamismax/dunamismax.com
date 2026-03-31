import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://dunamismax.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [vue()],
})
