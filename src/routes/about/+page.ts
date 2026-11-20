import type { PageLoad } from './$types';
export const prerender = true;
export const load: PageLoad = () => ({ meta: { title: 'About', description: 'Stephen Sawyer’s experience and skills in web development, company remote support, Python automation, and Ubuntu systems administration.', path: '/about' } });
