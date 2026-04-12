<script lang="ts">
	// biome-ignore-all assist/source/organizeImports: template usage keeps import order intentional
	// biome-ignore-all lint/correctness/noUnusedImports: referenced in component markup
	// biome-ignore-all lint/correctness/noUnusedVariables: referenced in component markup
	import { page } from '$app/state';
	import { getNavItems, getSocialLinks, getStatusLink, isActive } from '$lib/navigation';
	import Icon from './Icon.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import { toLocaleHref } from '$lib/i18n/links';
	import type { LocaleConfig } from '$lib/i18n/locales';
	import { getStrings } from '$lib/i18n/strings';

	let {
		openSearch,
		mobileNavOpen = false,
		toggleMobileNav
	}: {
		openSearch: () => void;
		mobileNavOpen?: boolean;
		toggleMobileNav: () => void;
	} = $props();

	const currentLocale = $derived((page.data.localeConfig as LocaleConfig | undefined)?.prefix ?? 'en');
	const strings = $derived(getStrings(currentLocale));
	const navItems = $derived(getNavItems(strings));
	const statusLink = $derived(getStatusLink(strings));
	const socialLinks = $derived(getSocialLinks(strings));
</script>

<header class="sticky top-0 z-50 border-b border-white/6 bg-[rgba(12,12,16,0.9)] backdrop-blur-[18px]">
	<div class="mx-auto flex min-h-[4.2rem] w-[calc(100%-1.25rem)] max-w-none items-center gap-4 sm:w-[calc(100%-3rem)]">
		<a class="inline-flex items-center gap-3 whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={toLocaleHref('/', currentLocale)} aria-label={strings.header.homeAriaLabel}>
			<img
				src="/logo-principal.svg"
				alt=""
				aria-hidden="true"
				class="h-6 w-auto sm:h-7"
			/>
			<span class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-200 sm:text-[0.65rem]">
				{strings.header.documentation}
			</span>
		</a>

		<button type="button" class="hidden min-w-48 items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-[0.55rem] text-left text-[0.82rem] tracking-[0.01em] text-slate-300 transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 max-[860px]:hidden sm:inline-flex" onclick={openSearch}>
			<Icon name="search" size={14} />
			<span>{strings.header.search}</span>
			<span class="ml-auto inline-flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.08em] text-slate-400" aria-hidden="true">
				<span class="inline-flex min-w-[1.55rem] items-center justify-center rounded-[0.3rem] border border-white/6 bg-white/5 px-[0.3rem] py-[0.08rem]">Ctrl</span>
				<span class="inline-flex min-w-[1.55rem] items-center justify-center rounded-[0.3rem] border border-white/6 bg-white/5 px-[0.3rem] py-[0.08rem]">K</span>
			</span>
		</button>

		<div class="ml-auto flex items-center gap-2">
			<div class="flex items-center gap-2 max-[860px]:hidden">
				{#each socialLinks as link}
					<a href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} class={link.icon
						? 'inline-flex min-h-8 items-center justify-center rounded-md px-[0.35rem] py-[0.3rem] text-[0.8rem] text-blue-500 transition-colors hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400'
						: 'inline-flex min-h-8 items-center justify-center rounded-md px-[0.45rem] py-[0.3rem] text-[0.8rem] text-blue-500 transition-colors hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400'}>
						{#if link.icon}
							<Icon name={link.icon} size={14} />
							<span class="sr-only">{link.label}</span>
						{:else}
							<span>{link.label}</span>
						{/if}
					</a>
				{/each}
			</div>

			<div class="h-[1.2rem] w-px bg-white/8 max-[860px]:hidden" aria-hidden="true"></div>

			<nav class="hidden items-center gap-[0.15rem] max-[860px]:hidden min-[861px]:flex" aria-label={strings.header.primaryNav}>
				<a
					href={statusLink.href}
					target="_blank"
					rel="noreferrer"
					class="group inline-flex items-center gap-2 rounded-[0.45rem] px-[0.9rem] py-[0.6rem] text-[0.8rem] font-medium uppercase tracking-[0.05em] text-slate-300 transition-[color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white/4 hover:text-slate-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				>
					<span class="inline-flex size-2 rounded-[0.2rem] bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.55)] animate-pulse"></span>
					<span>{statusLink.label}</span>
				</a>

				{#each navItems as item}
					<a
						class={`relative flex items-center gap-1.5 rounded-[0.45rem] px-[0.9rem] py-[0.6rem] text-[0.8rem] font-medium uppercase tracking-[0.05em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${item.primary ? 'bg-linear-to-b from-emerald-400 to-emerald-500 text-[#04130d]' : isActive(item.href, page.url.pathname) ? 'bg-white/4 text-slate-50' : 'text-slate-300 hover:bg-white/4 hover:text-slate-50'}`}
						href={toLocaleHref(item.href, currentLocale)}
					>
						{#if item.icon}
							<Icon name={item.icon} size={item.primary ? 14 : 13} />
						{/if}
						{item.label}
						{#if isActive(item.href, page.url.pathname) && !item.primary}
							<span class="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-blue-500" aria-hidden="true"></span>
						{/if}
					</a>
				{/each}

				<div class="ml-2 flex items-center">
					<LanguageSwitcher />
				</div>
			</nav>

			<button
				type="button"
				class="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 p-3 text-slate-50 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 min-[861px]:hidden"
				onclick={toggleMobileNav}
				aria-expanded={mobileNavOpen}
				aria-controls="mobile-nav"
				aria-label={mobileNavOpen ? strings.header.closeNav : strings.header.openNav}
			>
				<Icon name={mobileNavOpen ? 'close' : 'menu'} size={18} />
			</button>
		</div>
	</div>
</header>
