import { error, redirect } from '@sveltejs/kit';
import { getPrerenderEntries } from '$lib/content';
import { toLocalePath } from '$lib/i18n/locales';

const legacySectionPrefixes = new Set(['guides', 'blog', 'roadmap', 'reference', 'account', 'about']);

export function entries() {
	return getPrerenderEntries();
}

export function load({ params }) {
	const slug = (params.slug ?? '').replace(/^\/|\/$/g, '');
	const [section] = slug.split('/');

	if (!section || !legacySectionPrefixes.has(section)) {
		throw error(404, 'Page not found');
	}

	redirect(308, toLocalePath(slug));
}
