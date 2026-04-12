import { getLocaleEntryByRoute } from '$lib/content';
import { getLocales } from '$lib/i18n/locales';
import type { EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getLocales()
		.filter(({ prefix }) => Boolean(getLocaleEntryByRoute('/roadmap/', prefix)))
		.map(({ prefix }) => ({
			locale: prefix
		}));
