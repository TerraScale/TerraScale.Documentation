import { error } from '@sveltejs/kit';
import { getLocale, getLocales } from '$lib/i18n/locales';
import { getSeoHeadContent } from '$lib/i18n/seo';
import type { LayoutLoad } from './$types';

function toSeoRoute(pathname: string, locale: string) {
	const localePrefix = `/${locale}`;
	const route = pathname.startsWith(`${localePrefix}/`) ? pathname.slice(localePrefix.length) : '/';

	if (!route || route === '/') {
		return '/';
	}

	return `/${route.replace(/^\/+|\/+$/g, '')}/`;
}

export const load: LayoutLoad = ({ params, url }) => {
	const localeConfig = getLocale(params.locale);

	if (!localeConfig) {
		throw error(404, 'Locale not found');
	}

	const route = toSeoRoute(url.pathname, localeConfig.prefix);

	return {
		localeConfig,
		locales: getLocales(),
		seo: getSeoHeadContent(localeConfig.prefix, route)
	};
};
