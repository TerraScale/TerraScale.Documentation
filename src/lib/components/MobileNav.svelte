<script lang="ts">
	import { page } from '$app/state';
	import { sidebar } from '$lib/content';
	import { getNavItems, getSocialLinks, getStatusLink, isActive } from '$lib/navigation';
	import { getStrings } from '$lib/i18n/strings';
	import { tick } from 'svelte';
	import DocsNavTree from './DocsNavTree.svelte';
	import Icon from './Icon.svelte';
	import { switchLocalePath, toLocaleHref } from '$lib/i18n/links';
	import type { LocaleConfig } from '$lib/i18n/locales';

	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let {
		open = false,
		onClose,
		openSearch
	}: {
		open: boolean;
		onClose: () => void;
		openSearch: () => void;
	} = $props();

	let panelEl: HTMLElement | null = $state(null);
	let closeButtonEl: HTMLButtonElement | null = $state(null);

	const currentLocale = $derived(page.data.localeConfig as LocaleConfig);
	const locales = $derived(page.data.locales as LocaleConfig[]);
	const strings = $derived(getStrings(currentLocale?.prefix ?? 'en'));
	const navItems = $derived(getNavItems(strings));
	const statusLink = $derived(getStatusLink(strings));
	const socialLinks = $derived(getSocialLinks(strings));

	function getFocusableElements(): HTMLElement[] {
		if (!panelEl) {
			return [];
		}

		return Array.from(
			panelEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
	}

	function focusTrigger() {
		if (typeof document === 'undefined') {
			return;
		}

		const trigger = document.querySelector<HTMLButtonElement>('button[aria-controls="mobile-nav"]');
		trigger?.focus();
	}

	async function focusCloseButton() {
		await tick();
		closeButtonEl?.focus();
	}

	function handleClose() {
		onClose();
		focusTrigger();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClose();
			return;
		}

		if (event.key !== 'Tab') {
			return;
		}

		const focusable = getFocusableElements();
		if (!focusable.length) {
			event.preventDefault();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
			return;
		}

		if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}

	$effect(() => {
		if (!open || typeof document === 'undefined') {
			return;
		}

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = originalOverflow;
		};
	});

	$effect(() => {
		if (!open) {
			return;
		}

		void focusCloseButton();
	});
</script>

{#if open}
	<div
		id="mobile-nav"
		class="fixed inset-0 z-50"
		role="dialog"
		aria-modal="true"
		aria-label={strings.mobile.navigationMenu}
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<button
			type="button"
			class="absolute inset-0 bg-black/70 backdrop-blur-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
			aria-label={strings.mobile.closeNavigationMenu}
			onclick={handleClose}
		></button>

		<div
			bind:this={panelEl}
			class="relative flex h-full flex-col bg-[rgba(12,12,16,0.98)] text-slate-50 backdrop-blur-[18px]"
		>
			<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.11),transparent_22rem),radial-gradient(circle_at_80%_78%,rgba(16,185,129,0.09),transparent_20rem)]"></div>

			<div class="relative flex min-h-0 flex-1 flex-col">
				<div class="sticky top-0 z-10 border-b border-white/8 bg-[rgba(12,12,16,0.98)] backdrop-blur-[18px]">
					<div class="mx-auto flex min-h-[4.2rem] w-[calc(100%-1.25rem)] max-w-none items-center gap-4 sm:w-[calc(100%-3rem)]">
						<a
							class="inline-flex items-center gap-3 whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
							href={toLocaleHref('/', currentLocale?.prefix || 'en')}
							aria-label={strings.header.homeAriaLabel}
							onclick={handleClose}
						>
							<img src="/logo-principal.svg" alt="" aria-hidden="true" class="h-6 w-auto sm:h-7" />
							<span class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-200 sm:text-[0.65rem]">
								{strings.mobile.documentation}
							</span>
						</a>

						<button
							bind:this={closeButtonEl}
							type="button"
							class="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 p-3 text-slate-50 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
							onclick={handleClose}
							aria-label={strings.mobile.closeNavigationMenu}
						>
							<Icon name="close" size={18} />
						</button>
					</div>
				</div>

				<div class="mx-auto flex min-h-0 w-[calc(100%-1.25rem)] flex-1 flex-col sm:w-[calc(100%-3rem)]">
					<div class="flex-1 overflow-y-auto overscroll-contain scroll-smooth pb-6 pt-5">
						<div class="grid gap-4">
							<button
								type="button"
								class="flex min-h-12 items-center justify-start gap-[0.75rem] rounded-xl border border-white/8 bg-white/4 px-4 py-[0.95rem] text-left text-[0.92rem] tracking-[0.01em] text-slate-200 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
								onclick={openSearch}
							>
								<Icon name="search" size={17} />
								<div class="flex flex-1 items-center justify-between gap-3">
									<span>{strings.mobile.searchDocumentation}</span>
									<span class="text-[0.68rem] uppercase tracking-[0.08em] text-slate-400">Ctrl K</span>
								</div>
							</button>

							<nav class="grid gap-2" aria-label={strings.mobile.primaryNavigation}>
								{#each navItems as item}
									<a
										class={`relative flex min-h-11 items-center gap-[0.7rem] rounded-xl border px-4 py-[0.95rem] text-[0.82rem] font-medium uppercase tracking-[0.05em] transition-[transform,border-color,background-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${item.primary ? 'border-transparent bg-linear-to-b from-emerald-400 to-emerald-500 text-[#04130d] hover:-translate-y-0.5' : isActive(item.href, page.url.pathname) ? 'border-white/10 bg-white/6 text-slate-50' : 'border-white/8 bg-white/4 text-slate-300 hover:-translate-y-0.5 hover:bg-white/6 hover:text-slate-50'}`}
										href={toLocaleHref(item.href, currentLocale?.prefix || 'en')}
										onclick={handleClose}
									>
										{#if item.icon}
											<Icon name={item.icon} size={15} />
										{/if}
										<span>{item.label}</span>
										{#if isActive(item.href, page.url.pathname) && !item.primary}
											<span class="ml-auto h-0.5 w-6 rounded-full bg-blue-500" aria-hidden="true"></span>
										{/if}
									</a>
								{/each}
							</nav>

							<section class="border-t border-white/8 pt-5">
								<div class="mb-3 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-slate-300">
									<span class="h-px w-4 bg-white/20"></span>
									<span>{strings.mobile.documentation}</span>
								</div>
								<div class="rounded-xl border border-white/8 bg-white/4 p-3">
									<DocsNavTree items={sidebar} locale={currentLocale?.prefix || 'en'} onNavigate={handleClose} />
								</div>
							</section>

							<div class="grid gap-2 border-t border-white/8 pt-5">
								<a
									class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[0.82rem] uppercase tracking-[0.05em] text-slate-300 transition-[transform,border-color,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-white/6 hover:text-slate-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
									href={statusLink.href}
									target="_blank"
									rel="noreferrer"
									onclick={handleClose}
								>
									<span class="inline-flex size-2 rounded-[0.2rem] bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.55)] animate-pulse"></span>
									<span>{statusLink.label}</span>
								</a>

								<div class="grid grid-cols-2 gap-2">
									{#each socialLinks as link}
										<a
											class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[0.82rem] uppercase tracking-[0.05em] text-slate-300 transition-[transform,border-color,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-white/6 hover:text-slate-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
											href={link.href}
											target="_blank"
											rel="noreferrer"
											onclick={handleClose}
										>
											{#if link.icon}
												<Icon name={link.icon} size={15} />
											{/if}
											<span>{link.label}</span>
										</a>
									{/each}
								</div>
							</div>

							<div class="grid gap-2 border-t border-white/8 pt-5">
								<div class="mb-1 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-slate-300">
									<span class="h-px w-4 bg-white/20"></span>
									<span>{strings.mobile.language}</span>
								</div>
								<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
									{#each locales as locale}
										<a
											class={`inline-flex min-h-11 items-center justify-between gap-2 rounded-xl border px-4 py-3 text-[0.82rem] uppercase tracking-[0.05em] transition-[transform,border-color,background-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${currentLocale?.prefix === locale.prefix ? 'border-white/10 bg-white/6 text-slate-50' : 'border-white/8 bg-white/4 text-slate-300 hover:-translate-y-0.5 hover:bg-white/6 hover:text-slate-50'}`}
											href={switchLocalePath(page.url.pathname, locale.prefix)}
											onclick={handleClose}
										>
											<span>{locale.label}</span>
											{#if currentLocale?.prefix === locale.prefix}
												<Icon name="check" size={14} className="text-blue-500" />
											{/if}
										</a>
									{/each}
								</div>
							</div>
						</div>
					</div>

					<div class="border-t border-white/8 py-4 text-center text-[0.72rem] uppercase tracking-[0.08em] text-slate-500">
						{strings.mobile.footerLabel}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
