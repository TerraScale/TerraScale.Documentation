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

<section class="mx-auto block w-[calc(100%-1.25rem)] max-w-none px-0 pb-16 pt-7 sm:w-[calc(100%-3rem)] md:pb-20">
	<div class="w-full max-w-[min(1100px,100%)] px-8 pb-8 pt-6 max-[860px]:px-0 max-[860px]:pt-5">
		<div class="mb-5">
			<p class="mb-[0.85rem] text-[0.72rem] font-medium uppercase tracking-[0.12em] text-blue-300">Deferred explorer</p>
			<h1 class="text-[2rem] leading-[1.14] tracking-[0.01em] text-slate-50 sm:text-[2.5rem]">API Explorer</h1>
			<p class="text-[1rem] leading-[1.85] tracking-[0.01em] text-slate-400">
				Interactive OpenAPI browser for the checked-in TerraScale spec at
				<code>/openapi/terrascale.yaml</code>.
			</p>
		</div>

		<div class="grid gap-5 pt-1">
			{#if Explorer}
				<Explorer />
			{:else}
				<p class="m-0 rounded-[0.875rem] border border-white/8 bg-white/4 px-5 py-4 text-slate-400">Loading explorer...</p>
			{/if}
		</div>
	</div>
</section>
