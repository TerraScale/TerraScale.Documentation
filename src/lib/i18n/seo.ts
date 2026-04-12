import { getLocaleEntryByRoute } from '$lib/content';
import { getLocale, getLocales } from '$lib/i18n/locales';

const siteUrl = 'https://docs.terrascale.tech';
const staticLocalizedRoutes = new Set(['/', '/blog/', '/roadmap/', '/reference/api/explorer/']);

export type HreflangTag = {
	locale: string;
	hreflang: string;
	href: string;
};

export type SeoHeadContent = {
	canonicalUrl: string;
	hreflangTags: HreflangTag[];
	ogLocale: string;
};

function normalizeRoute(route: string) {
	if (route === '/') {
		return route;
	}

	return `/${route.replace(/^\/+|\/+$/g, '')}/`.replace(/\/\/+/, '/');
}

function hasLocalizedRoute(locale: string, route: string) {
	const normalizedRoute = normalizeRoute(route);

	if (staticLocalizedRoutes.has(normalizedRoute)) {
		return true;
	}

	return Boolean(getLocaleEntryByRoute(normalizedRoute, locale));
}

function toOgLocale(htmlLang: string) {
	return htmlLang.replace('-', '_');
}

export function buildCanonicalUrl(locale: string, route: string) {
	return `${siteUrl}/${locale}${normalizeRoute(route)}`;
}

export function buildHreflangTags(route: string) {
	const normalizedRoute = normalizeRoute(route);

	return getLocales()
		.filter(({ prefix }) => hasLocalizedRoute(prefix, normalizedRoute))
		.map((locale): HreflangTag => ({
			locale: locale.prefix,
			hreflang: locale.htmlLang,
			href: buildCanonicalUrl(locale.prefix, normalizedRoute)
		}));
}

export function getSeoHeadContent(locale: string, route: string) {
	const localeConfig = getLocale(locale);

	if (!localeConfig) {
		throw new Error(`Unknown locale: ${locale}`);
	}

	return {
		canonicalUrl: buildCanonicalUrl(locale, route),
		hreflangTags: buildHreflangTags(route),
		ogLocale: toOgLocale(localeConfig.htmlLang)
	} satisfies SeoHeadContent;
}
