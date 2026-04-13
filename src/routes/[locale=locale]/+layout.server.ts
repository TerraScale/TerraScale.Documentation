import { error } from '@sveltejs/kit';
import { getLocaleSidebar } from '$lib/content';
import { getLocale, getLocales } from '$lib/i18n/locales';
import { getSeoHeadContent } from '$lib/i18n/seo';
import type { LayoutServerLoad } from './$types';

function toSeoRoute(pathname: string, locale: string) {
	const localePrefix = `/${locale}`;
	let route: string;
	if (pathname === localePrefix || pathname === `${localePrefix}/`) {
		route = '/';
	} else if (pathname.startsWith(`${localePrefix}/`)) {
		route = pathname.slice(localePrefix.length);
	} else {
		route = pathname;
	}
	if (!route || route === '/') {
		return '/';
	}
	return `/${route.replace(/^\/+|\/+$/g, '')}/`;
}

export const load: LayoutServerLoad = ({ params, url }) => {
	const localeConfig = getLocale(params.locale);

	if (!localeConfig) {
		throw error(404, 'Locale not found');
	}

	const seoHeadContent = getSeoHeadContent(params.locale, toSeoRoute(url.pathname, params.locale));

	return {
		localeConfig,
		locales: getLocales(),
		seo: seoHeadContent,
		seoHeadContent,
		sidebar: getLocaleSidebar(params.locale)
	};
};
