import type { PageLoad } from './$types';
export const prerender = true;
export const load: PageLoad = () => ({ meta: { title: 'About', description: 'Stephen Sawyer’s experience and skills in SvelteKit web development, Go and Python game servers, Swift apps, company remote support, and Ubuntu systems administration.', path: '/about' } });
