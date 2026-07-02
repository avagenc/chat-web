import { redirect } from '@sveltejs/kit';

export const ssr = true;
export const prerender = true;

export function load() {
	throw redirect(307, '/legal#ketentuan');
}
