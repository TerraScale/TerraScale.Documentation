<script lang="ts">
	import type { RoadmapLegendItem, RoadmapTone } from '$lib/content/roadmap';

	let { items = [] }: { items?: RoadmapLegendItem[] } = $props();

	const toneClasses: Record<RoadmapTone, string> = {
		live: 'border-emerald-400/28 bg-emerald-500/10 text-emerald-200',
		next: 'border-blue-400/28 bg-blue-500/10 text-blue-200',
		exploring: 'border-cyan-400/28 bg-cyan-500/10 text-cyan-200',
		goal: 'border-amber-400/28 bg-amber-500/10 text-amber-200'
	};
</script>

<div class="my-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
	{#each items as item}
		<article class="rounded-[1rem] border border-white/10 bg-white/4 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)]">
			<span
				class={`inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] ${toneClasses[item.tone]}`}
			>
				{item.label}
			</span>
			<p class="mb-0 mt-4 text-[0.92rem] leading-[1.75] tracking-[0.01em] text-slate-300">
				{item.description}
			</p>
		</article>
	{/each}
</div>
