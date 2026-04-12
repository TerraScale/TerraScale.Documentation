import { getLocaleBlogEntries } from '$lib/content';
import { getLocales } from '$lib/i18n/locales';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getLocales().map(({ prefix }) => ({
		locale: prefix
	}));

export const load: PageServerLoad = ({ params }) => {
	return {
		posts: getLocaleBlogEntries(params.locale)
	};
};
