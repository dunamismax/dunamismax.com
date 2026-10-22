import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
export default defineConfig({ site: 'https://dunamismax.com', output: 'server', adapter: node({ mode: 'standalone', staticHeaders: true }), trailingSlash: 'never', build: { inlineStylesheets: 'never' }, server: { host: '127.0.0.1', port: 8000 }, devToolbar: { enabled: false } });
