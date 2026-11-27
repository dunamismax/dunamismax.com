import type { PageLoad } from './$types';
export const prerender = true;
export const load: PageLoad = () => ({ meta: { title: 'Projects', description: 'Projects by Stephen Sawyer: RiverMind Poker, SvelteKit websites, apps in development, company RustDesk support, monitoring, and backup automation.', path: '/projects' } });
