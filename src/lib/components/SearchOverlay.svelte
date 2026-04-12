<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import { page } from '$app/state';
	import { getStrings } from '$lib/i18n/strings';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import Icon from './Icon.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	type SearchResult = {
		url: string;
		title: string;
		description: string;
		kind: string;
		section: string;
	};

	type PagefindModule = {
		init: () => Promise<void>;
		search: (
			query: string,
			options?: {
				filters?: Record<string, string | string[]>;
			}
		) => Promise<{
			results: Array<{
				data: () => Promise<{
					url: string;
					title: string;
					excerpt?: string;
					meta?: Record<string, string>;
				}>;
			}>;
		}>;
	};

	const dispatch = createEventDispatcher<{ close: undefined }>();
	const RESULT_LIMIT = 12;

	let query = $state('');
	let inputEl: HTMLInputElement | null = $state(null);
	let pagefind: PagefindModule | null = null;
	let pagefindReady: Promise<PagefindModule> | null = null;
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let results: SearchResult[] = $state([]);
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let loading = $state(false);
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let loadError = $state(false);
	let searchToken = 0;

	function getCurrentLocale() {
		return page.data.localeConfig?.prefix ?? 'en';
	}

	const strings = $derived(getStrings(getCurrentLocale()));

	$effect(() => {
		if (open) {
			void prepareOverlay();
		}
	});

	$effect(() => {
		if (open) {
			void runSearch(query);
		}
	});

	async function prepareOverlay() {
		await tick();
		inputEl?.focus();
		loadError = false;
		await ensurePagefind();
	}

	async function ensurePagefind() {
		if (pagefind) {
			return pagefind;
		}

		if (!pagefindReady) {
			const pagefindModulePath = new URL('/pagefind/pagefind.js', window.location.origin).href;
			pagefindReady = import(/* @vite-ignore */ pagefindModulePath)
				.then(async (module) => {
					await module.init();
					pagefind = module as PagefindModule;
					return pagefind;
				})
				.catch((error) => {
					pagefindReady = null;
					throw error;
				});
		}

		return pagefindReady;
	}

	async function runSearch(value: string) {
		const currentToken = ++searchToken;
		const trimmed = value.trim();

		if (!trimmed) {
			results = [];
			loading = false;
			loadError = false;
			return;
		}

		loading = true;
		loadError = false;

		try {
			const searchApi = await ensurePagefind();
			const search = await searchApi.search(trimmed, {
				filters: {
					locale: getCurrentLocale()
				}
			});
			const entries = await Promise.all(
				search.results.slice(0, RESULT_LIMIT).map(async (result) => mapResult(await result.data()))
			);

			if (currentToken !== searchToken) {
				return;
			}

			results = entries;
		} catch (error) {
			if (currentToken !== searchToken) {
				return;
			}

			results = [];
			loadError = true;
			console.error('Pagefind search failed', error);
		} finally {
			if (currentToken === searchToken) {
				loading = false;
			}
		}
	}

	function mapResult(result: {
		url: string;
		title: string;
		excerpt?: string;
		meta?: Record<string, string>;
	}): SearchResult {
		const pathname = toPathname(result.url);
		const segments = pathname.split('/').filter(Boolean);
		const [primary = 'docs', secondary = 'home'] = segments;
		const meta = result.meta ?? {};

		return {
			url: result.url,
			title: result.title,
			description: sanitizeExcerpt(meta.description || result.excerpt || ''),
			kind: formatKind(meta.kind || primary),
			section: formatSection(meta.section || secondary || primary)
		};
	}

	function toPathname(url: string) {
		try {
			return new URL(url, 'https://docs.terrascale.tech').pathname;
		} catch {
			return url;
		}
	}

	function sanitizeExcerpt(value: string) {
		return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	}

	function formatKind(value: string) {
		if (value.toLowerCase() === 'reference') {
			return 'API';
		}

		return value
			.split(/[-_\s]+/)
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function formatSection(value: string) {
		return value
			.split(/[-_\s]+/)
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function close() {
		query = '';
		results = [];
		loading = false;
		loadError = false;
		dispatch('close');
	}

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-60"
		role="dialog"
		aria-modal="true"
		aria-label={strings.search.dialogLabel}
		tabindex="-1"
		onkeydown={onKeydown}
	>
		<button type="button" class="absolute inset-0 bg-black/60 backdrop-blur-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" aria-label={strings.search.closeSearch} onclick={close}></button>
		<div class="relative mx-auto mt-[12vh] grid w-[min(880px,calc(100%-2rem))] gap-4 rounded-2xl border border-white/15 bg-white/7 p-4 shadow-[4px_4px_0_rgba(0,0,0,0.6)] backdrop-blur-[14px] max-[640px]:p-4">
			<div class="flex items-center gap-3">
				<div class="flex flex-1 items-center gap-[0.6rem] rounded-full border border-white/10 bg-white/6 px-4 py-[0.9rem] focus-within:border-blue-400/45 focus-within:shadow-[0_0_0_1px_rgba(96,165,250,0.18)]">
					<Icon name="search" size={18} />
					<input
						bind:this={inputEl}
						bind:value={query}
						class="flex-1 border-0 bg-transparent text-[0.98rem] tracking-[0.01em] text-slate-50 outline-none"
						aria-label={strings.search.inputAriaLabel}
						placeholder={strings.search.placeholder}
					/>
				</div>
				<button type="button" class="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 p-[0.85rem] text-slate-50 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" onclick={close} aria-label={strings.search.closeSearch}>
					<Icon name="close" size={18} />
				</button>
			</div>

			<div class="mt-4 grid max-h-[60vh] gap-3 overflow-auto">
				{#if loading}
					<div class="rounded-2xl border border-white/8 bg-white/4 p-4 transition-[transform,border-color,background-color] duration-200">
						<strong class="text-[0.98rem] font-semibold tracking-[0.01em] text-slate-50">{query.trim() ? strings.search.searching : strings.search.loading}</strong>
					</div>
				{:else if loadError}
					<div class="rounded-2xl border border-white/8 bg-white/4 p-4 transition-[transform,border-color,background-color] duration-200">
						<strong class="text-[0.98rem] font-semibold tracking-[0.01em] text-slate-50">{strings.search.unavailableTitle}</strong>
						<p class="mt-2 text-[0.92rem] leading-[1.75] tracking-[0.01em] text-slate-400">{strings.search.unavailableBody}</p>
					</div>
				{:else if !query.trim()}
					<div class="rounded-2xl border border-white/8 bg-white/4 p-4 transition-[transform,border-color,background-color] duration-200">
						<strong class="text-[0.98rem] font-semibold tracking-[0.01em] text-slate-50">{strings.search.emptyTitle}</strong>
						<p class="mt-2 text-[0.92rem] leading-[1.75] tracking-[0.01em] text-slate-400">{strings.search.emptyBody}</p>
					</div>
				{:else if !results.length}
					<div class="rounded-2xl border border-white/8 bg-white/4 p-4 transition-[transform,border-color,background-color] duration-200">
						<strong class="text-[0.98rem] font-semibold tracking-[0.01em] text-slate-50">{strings.search.noResultsTitle}</strong>
						<p class="mt-2 text-[0.92rem] leading-[1.75] tracking-[0.01em] text-slate-400">{strings.search.noResultsBody}</p>
					</div>
				{/if}
				{#each results as result}
					<a class="block rounded-2xl border border-white/8 bg-white/4 p-4 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:border-blue-400/40 focus-visible:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={result.url} onclick={close}>
						<div class="flex gap-2 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-slate-300">
							<span>{result.kind}</span>
							<span>{result.section}</span>
						</div>
						<strong class="mt-2 block text-[1rem] font-semibold leading-[1.4] tracking-[0.01em] text-slate-50">{result.title}</strong>
						<p class="mt-2 text-[0.92rem] leading-[1.75] tracking-[0.01em] text-slate-400">{result.description}</p>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}
