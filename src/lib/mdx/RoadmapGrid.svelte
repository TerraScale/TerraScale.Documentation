<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { RoadmapItem, RoadmapTone } from '$lib/content/roadmap';

	let {
		items = [],
		tone = 'live',
		statusLabel = 'Live now'
	}: {
		items?: RoadmapItem[];
		tone?: RoadmapTone;
		statusLabel?: string;
	} = $props();

	const toneClasses: Record<RoadmapTone, { badge: string; iconWrap: string }> = {
		live: {
			badge: 'border-emerald-400/28 bg-emerald-500/10 text-emerald-200',
			iconWrap: 'border-emerald-400/25 bg-emerald-500/12 text-emerald-100'
		},
		next: {
			badge: 'border-blue-400/28 bg-blue-500/10 text-blue-200',
			iconWrap: 'border-blue-400/25 bg-blue-500/12 text-blue-100'
		},
		exploring: {
			badge: 'border-cyan-400/28 bg-cyan-500/10 text-cyan-200',
			iconWrap: 'border-cyan-400/25 bg-cyan-500/12 text-cyan-100'
		},
		goal: {
			badge: 'border-amber-400/28 bg-amber-500/10 text-amber-200',
			iconWrap: 'border-amber-400/25 bg-amber-500/12 text-amber-100'
		}
	};

	let currentTone = $derived(toneClasses[tone]);
</script>

<div class="my-8 grid gap-5 xl:grid-cols-2">
	{#each items as item}
		<article class="rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_16px_42px_rgba(0,0,0,0.24)]">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div class={`inline-flex size-11 items-center justify-center rounded-[0.9rem] border ${currentTone.iconWrap}`}>
					<Icon name={item.icon} size={20} />
				</div>
				<span
					class={`inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] ${currentTone.badge}`}
				>
					{statusLabel}
				</span>
			</div>

			<h3 class="mb-0 mt-5 text-[1.22rem] font-semibold leading-[1.35] tracking-[0.01em] text-slate-50">
				{item.title}
			</h3>
			<p class="mb-0 mt-3 text-[0.98rem] leading-[1.8] tracking-[0.01em] text-slate-300">
				{item.summary}
			</p>

			<div class="mt-5 grid gap-3">
				<div class="rounded-[0.95rem] border border-white/8 bg-black/15 p-4">
					<p class="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-slate-500">
						Why it matters
					</p>
					<p class="mb-0 text-[0.92rem] leading-[1.75] tracking-[0.01em] text-slate-300">
						{item.customerValue}
					</p>
				</div>

				<div class="rounded-[0.95rem] border border-white/8 bg-black/15 p-4">
					<p class="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-slate-500">
						What it changes
					</p>
					<p class="mb-0 text-[0.92rem] leading-[1.75] tracking-[0.01em] text-slate-300">
						{item.technicalNote}
					</p>
				</div>

				{#if item.scopeNote}
					<div class="rounded-[0.95rem] border border-dashed border-white/10 bg-white/3 p-4">
						<p class="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-slate-500">
							Scope note
						</p>
						<p class="mb-0 text-[0.9rem] leading-[1.75] tracking-[0.01em] text-slate-400">
							{item.scopeNote}
						</p>
					</div>
				{/if}
			</div>
		</article>
	{/each}
</div>
