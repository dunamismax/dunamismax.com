import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// SvelteKit 3 reads its configuration here (svelte.config.js is no longer used).
// bin/server.ts imports dist/web/handler.js behind the read-only HTTP boundary.
export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter({ out: 'dist/web', precompress: false }),
      prerender: { handleHttpError: 'fail', handleMissingId: 'fail' }
    })
  ],
  server: { host: '127.0.0.1', port: 8000 }
});
