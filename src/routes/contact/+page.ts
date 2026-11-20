import type { PageLoad } from './$types';
export const prerender = true;
export const load: PageLoad = () => ({ meta: { title: 'Contact', description: 'How to reach Stephen Sawyer by email, Signal, GitHub, Codeberg, or public source.', path: '/contact' } });
