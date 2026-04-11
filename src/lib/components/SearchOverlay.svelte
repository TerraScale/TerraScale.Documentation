<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import Icon from './Icon.svelte';

	export let open = false;

	type SearchResult = {
		url: string;
		title: string;
		description: string;
		kind: string;
		section: string;
	};

	type PagefindModule = {
		init: () => Promise<void>;
		search: (query: string) => Promise<{
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

	let query = '';
	let inputEl: HTMLInputElement | null = null;
	let pagefind: PagefindModule | null = null;
	let pagefindReady: Promise<PagefindModule> | null = null;
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let results: SearchResult[] = [];
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let loading = false;
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let loadError = false;
	let searchToken = 0;

	$: if (open) {
		void prepareOverlay();
	}

	$: if (open) {
		void runSearch(query);
	}

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
			const search = await searchApi.search(trimmed);
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
		class="search-overlay"
		role="dialog"
		aria-modal="true"
		aria-label="Search"
		tabindex="-1"
		on:keydown={onKeydown}
	>
		<button type="button" class="search-backdrop" aria-label="Close search" on:click={close}></button>
		<div class="search-panel ts-glass-frosted shadow-offset">
			<div class="search-panel-header">
				<div class="search-input-wrap">
					<Icon name="search" size={18} />
					<input
						bind:this={inputEl}
						bind:value={query}
						aria-label="Search documentation"
						placeholder="Search docs, guides, reference, blog..."
					/>
				</div>
				<button type="button" class="icon-button" on:click={close} aria-label="Close search">
					<Icon name="close" size={18} />
				</button>
			</div>

			<div class="search-results">
				{#if loading}
					<div class="search-result">
						<strong>{query.trim() ? 'Searching…' : 'Loading search…'}</strong>
					</div>
				{:else if loadError}
					<div class="search-result">
						<strong>Search is unavailable right now.</strong>
						<p>Please try again in a moment.</p>
					</div>
				{:else if !query.trim()}
					<div class="search-result">
						<strong>Search docs, blog, and API pages</strong>
						<p>Start typing to search across the full site index.</p>
					</div>
				{:else if !results.length}
					<div class="search-result">
						<strong>No results found</strong>
						<p>Try a different term or browse a broader topic.</p>
					</div>
				{/if}
				{#each results as result}
					<a class="search-result" href={result.url} on:click={close}>
						<div class="search-result-meta">
							<span>{result.kind}</span>
							<span>{result.section}</span>
						</div>
						<strong>{result.title}</strong>
						<p>{result.description}</p>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}
