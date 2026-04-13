import { getLocaleListedEntries } from '$lib/content';
import { getLocales } from '$lib/i18n/locales';

export const prerender = true;

export function GET() {
	const baseUrl = 'https://docs.terrascale.tech';
	const locales = getLocales();

	const urls = locales
		.flatMap((locale) => {
			const entries = getLocaleListedEntries(locale.prefix);
			return entries
				.filter((entry) => entry.route !== '/')
				.map((entry) => {
					const href = `/${locale.prefix}${entry.route}`;
					return `<url><loc>${baseUrl}${href}</loc><xhtml:link rel="alternate" hreflang="${locale.htmlLang}" href="${baseUrl}${href}"/></url>`;
				});
		})
		.join('');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
		{
			headers: {
				'content-type': 'application/xml'
			}
		}
	);
}
