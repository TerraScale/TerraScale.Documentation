import { error } from '@sveltejs/kit';
import { getLocaleHomeEntry } from '$lib/content';
import { getLocales } from '$lib/i18n/locales';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getLocales()
		.filter(({ prefix }) => Boolean(getLocaleHomeEntry(prefix)))
		.map(({ prefix }) => ({
			locale: prefix
		}));

export const load: PageServerLoad = ({ params }) => {
	const entry = getLocaleHomeEntry(params.locale);

	if (!entry) {
		throw error(404, 'Page not found');
	}

	return {
		entry: {
			title: entry.title,
			description: entry.description
		}
	};
};
