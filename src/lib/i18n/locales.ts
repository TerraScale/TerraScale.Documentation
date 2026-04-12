export type LocaleConfig = {
	prefix: string;
	label: string;
	htmlLang: string;
};

const localeRegistry = [
	{
		prefix: 'en',
		label: 'English',
		htmlLang: 'en'
	},
	{
		prefix: 'pt-br',
		label: 'Português (Brasil)',
		htmlLang: 'pt-BR'
	},
	{
		prefix: 'es',
		label: 'Español',
		htmlLang: 'es'
	}
] as const satisfies readonly LocaleConfig[];

export type LocalePrefix = (typeof localeRegistry)[number]['prefix'];

const defaultLocalePrefix: LocalePrefix = 'en';

export function getLocales(): LocaleConfig[] {
	return [...localeRegistry];
}

export function getLocale(prefix: string): LocaleConfig | undefined {
	return localeRegistry.find((locale) => locale.prefix === prefix);
}

export function getDefaultLocale(): LocaleConfig {
	return getLocale(defaultLocalePrefix) ?? localeRegistry[0];
}

export function isValidLocale(prefix: string): prefix is LocalePrefix {
	return getLocale(prefix) !== undefined;
}

export function toLocalePath(pathname: string, prefix = getDefaultLocale().prefix): string {
	const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');

	if (!normalizedPath) {
		return `/${prefix}/`;
	}

	return `/${prefix}/${normalizedPath}/`;
}
