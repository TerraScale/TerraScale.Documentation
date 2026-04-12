import { getLocales } from './locales';

export function isInternalHref(href: string): boolean {
	return href.startsWith('/');
}

export function toLocaleHref(path: string, locale: string): string {
	if (!isInternalHref(path)) {
		return path;
	}

	const normalizedPath = path.replace(/^\/+/, '');
	return `/${locale}/${normalizedPath}`;
}

export function stripLocalePrefix(pathname: string): string {
	const locales = getLocales();
	const segments = pathname.split('/').filter(Boolean);

	if (segments.length > 0) {
		const firstSegment = segments[0];
		const isLocale = locales.some((l) => l.prefix === firstSegment);

		if (isLocale) {
			const rest = segments.slice(1).join('/');
			return rest ? `/${rest}${pathname.endsWith('/') ? '/' : ''}` : '/';
		}
	}

	return pathname;
}

export function switchLocalePath(currentPathname: string, targetLocale: string): string {
	const pathWithoutLocale = stripLocalePrefix(currentPathname);
	const normalizedPath = pathWithoutLocale.replace(/^\/+/, '');
	
	if (!normalizedPath) {
		return `/${targetLocale}/`;
	}
	
	return `/${targetLocale}/${normalizedPath}${normalizedPath.endsWith('/') ? '' : '/'}`;
}
