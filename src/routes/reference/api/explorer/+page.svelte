<script lang="ts">
	import { onMount } from 'svelte';

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let Explorer = $state<(typeof import('$lib/components/ApiExplorer.svelte').default) | null>(null);

	onMount(async () => {
		const module = await import('$lib/components/ApiExplorer.svelte');
		Explorer = module.default;
	});
</script>

<svelte:head>
	<title>API Explorer | TerraScale</title>
	<meta
		name="description"
		content="Optional interactive explorer for the TerraScale OpenAPI specification."
	/>
</svelte:head>

<section class="shell docs-shell docs-page explorer-page">
	<div class="article-main docs-article explorer-article">
		<div class="article-header">
			<p class="eyebrow">Deferred explorer</p>
			<h1>API Explorer</h1>
			<p class="article-description">
				Interactive OpenAPI browser for the checked-in TerraScale spec at
				<code>/openapi/terrascale.yaml</code>.
			</p>
		</div>

		<div class="explorer-container">
			{#if Explorer}
				<Explorer />
			{:else}
				<p class="explorer-loading">Loading explorer...</p>
			{/if}
		</div>
	</div>
</section>

<style>
	.explorer-page {
		display: block;
	}

	.explorer-article {
		max-width: min(1100px, 100%);
		width: 100%;
	}

	.explorer-container {
		display: grid;
		gap: 1.25rem;
		padding-top: 0.25rem;
	}

	.explorer-loading {
		margin: 0;
		padding: 1rem 1.25rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.875rem;
		background: rgba(255, 255, 255, 0.04);
		color: var(--ts-color-text-muted);
	}
</style>
