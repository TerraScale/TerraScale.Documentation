import { stripLocalePrefix } from '$lib/i18n/links';
import type { UIStrings } from '$lib/i18n/strings';

export interface NavItem {
	href: string;
	label: string;
	icon?: string;
	primary?: boolean;
}

export interface SocialLink {
	href: string;
	label: string;
	icon?: string;
}

export function getNavItems(strings: UIStrings): NavItem[] {
	return [
		{ href: '/guides/getting-started/', label: strings.navigation.docs, icon: 'book-open' },
		{ href: '/roadmap/', label: strings.navigation.roadmap, icon: 'map' },
		{ href: '/blog/', label: strings.navigation.blog, icon: 'pencil-line' },
		{
			href: '/guides/getting-started/',
			label: strings.navigation.getStarted,
			primary: true,
			icon: 'rocket'
		}
	];
}

export function getStatusLink(strings: UIStrings): SocialLink {
	return {
		href: 'https://status.terrascale.tech',
		label: strings.navigation.status
	};
}

export function getSocialLinks(strings: UIStrings): SocialLink[] {
	return [
		{ href: 'https://discord.gg/terrascale', label: strings.navigation.discord, icon: 'discord' },
		{ href: 'https://github.com/TerraScale', label: strings.navigation.github, icon: 'github' }
	];
}

export function isActive(href: string, pathname: string): boolean {
	const pathWithoutLocale = stripLocalePrefix(pathname);

	if (href === '/blog/') {
		return pathWithoutLocale.startsWith('/blog/');
	}

	if (href === '/roadmap/') {
		return pathWithoutLocale === '/roadmap' || pathWithoutLocale.startsWith('/roadmap/');
	}

	if (href === '/guides/getting-started/') {
		return (
			pathWithoutLocale.startsWith('/reference/') ||
			pathWithoutLocale.startsWith('/guides/') ||
			pathWithoutLocale.startsWith('/dashboard/')
		);
	}

	return pathWithoutLocale.startsWith(href);
}
