import { getLocales } from '$lib/i18n/locales';
import type { EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getLocales().map(({ prefix }) => ({
		locale: prefix
	}));
