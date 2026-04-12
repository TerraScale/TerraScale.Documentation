import { redirect } from '@sveltejs/kit';

export function load() {
	redirect(308, '/en/reference/api/explorer/');
}
