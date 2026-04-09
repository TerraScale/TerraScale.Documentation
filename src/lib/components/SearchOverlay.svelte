<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { tick } from 'svelte';
	import Icon from './Icon.svelte';

	export let open = false;

	const dispatch = createEventDispatcher<{ close: void }>();
	let query = '';
	let inputEl: HTMLInputElement | null = null;
	let docs: Array<{
		id: string;
		route: string;
		title: string;
		description: string;
		kind: string;
		section: string;
		excerpt: string;
		body: string;
	}> = [];
	let loading = false;

	$: results = !query.trim()
		? docs.slice(0, 12)
		: docs
				.filter((doc) =>
					[doc.title, doc.description, doc.section, doc.body].some((field) =>
						field.toLowerCase().includes(query.toLowerCase())
					)
				)
				.slice(0, 12);
	$: if (open) {
		if (!docs.length && !loading) {
			loading = true;
			fetch('/search-index.json')
				.then((response) => response.json())
				.then((payload) => {
					docs = payload;
				})
				.finally(() => {
					loading = false;
				});
		}
		tick().then(() => inputEl?.focus());
	}

	function close() {
		query = '';
		dispatch('close');
	}

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
						<strong>Loading search index...</strong>
					</div>
				{/if}
				{#each results as result}
					<a class="search-result" href={result.route} on:click={close}>
						<div class="search-result-meta">
							<span>{result.kind}</span>
							<span>{result.section}</span>
						</div>
						<strong>{result.title}</strong>
						<p>{result.description || result.excerpt}</p>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}
