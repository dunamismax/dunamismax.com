import type { PageLoad } from './$types';
export const prerender = true;
export const load: PageLoad = () => ({ meta: { title: 'Projects', description: 'Projects by Stephen Sawyer: company RustDesk support, Astro websites, monitoring, backup automation, and a Python Discord bot.', path: '/projects' } });
