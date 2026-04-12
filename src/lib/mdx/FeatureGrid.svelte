<script lang="ts">
	export let features: Array<{
		icon: string;
		title: string;
		description: string;
	}> = [];

	import Icon from '$lib/components/Icon.svelte';
	import { contentIconMap } from '$lib/ui/icons';
</script>

<div class="my-6 grid grid-cols-4 gap-4 max-[640px]:grid-cols-1">
	{#each features as feature}
		<article class="rounded-[0.45rem] border border-white/6 bg-white/4 p-4">
			<div class="inline-flex size-8 items-center justify-center rounded-[0.4rem] border border-blue-300/22 bg-blue-500/15">
				<Icon name={contentIconMap[feature.icon] ?? 'database'} size={22} />
			</div>
			<h3 class="mb-2 mt-[0.85rem] text-[1rem] font-semibold tracking-[0.01em] text-slate-50">{feature.title}</h3>
			<p class="text-[0.94rem] leading-[1.75] tracking-[0.01em] text-slate-400">{feature.description}</p>
		</article>
	{/each}
</div>
