import type { Handle } from '@sveltejs/kit';
import { getDefaultLocale, getLocale } from '$lib/i18n/locales';

function getHtmlLang(pathname: string) {
	const firstSegment = pathname.split('/')[1] ?? '';
	return (getLocale(firstSegment) ?? getDefaultLocale()).htmlLang;
}

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', getHtmlLang(event.url.pathname))
	});
};
