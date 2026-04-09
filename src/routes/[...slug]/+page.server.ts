import { error } from '@sveltejs/kit';
import { getEntryByRoute, getPrevNext, getPrerenderEntries, sidebar } from '$lib/content';

export function entries() {
	return getPrerenderEntries();
}

export function load({ params }) {
	const route = `/${(params.slug ?? '').replace(/^\/|\/$/g, '')}/`;
	const entry = getEntryByRoute(route);

	if (!entry) {
		throw error(404, 'Page not found');
	}

	return {
		entry,
		sidebar,
		...getPrevNext(entry)
	};
}
