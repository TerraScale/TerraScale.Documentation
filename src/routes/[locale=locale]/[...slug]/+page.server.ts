import { error } from '@sveltejs/kit';
import {
	getLocaleEntryByRoute,
	getLocalePrevNext,
	getLocalePrerenderEntries,
	getLocaleSidebar
} from '$lib/content';
import { getLocales } from '$lib/i18n/locales';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getLocales().flatMap(({ prefix }) =>
		getLocalePrerenderEntries(prefix).map(({ slug }) => ({
			locale: prefix,
			slug
		}))
	);

export const load: PageServerLoad = ({ params }) => {
	const route = `/${(params.slug ?? '').replace(/^\/|\/$/g, '')}/`;
	const entry = getLocaleEntryByRoute(route, params.locale);

	if (!entry) {
		throw error(404, 'Page not found');
	}

	return {
		entry,
		sidebar: getLocaleSidebar(params.locale),
		...getLocalePrevNext(entry, params.locale)
	};
};
