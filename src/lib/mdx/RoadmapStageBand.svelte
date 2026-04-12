<script lang="ts">
	import type { RoadmapStage } from '$lib/content/roadmap';

	let { stages = [] }: { stages?: RoadmapStage[] } = $props();

	const stateClasses = {
		completed: {
			panel: 'border-emerald-400/30 bg-emerald-500/10',
			dot: 'bg-emerald-300',
			label: 'text-emerald-200'
		},
		current: {
			panel: 'border-blue-400/40 bg-blue-500/12 shadow-[0_18px_45px_rgba(37,99,235,0.16)]',
			dot: 'bg-blue-300',
			label: 'text-blue-100'
		},
		upcoming: {
			panel: 'border-white/10 bg-white/4',
			dot: 'bg-slate-500',
			label: 'text-slate-200'
		}
	} as const;
</script>

<div class="my-10 rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 sm:p-5">
	<div class="grid gap-3 lg:grid-cols-3">
		{#each stages as stage, index}
			{@const state = stateClasses[stage.state]}
			<div class={`rounded-[1.1rem] border p-5 ${state.panel}`}>
				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<span class={`inline-flex size-3 shrink-0 rounded-full ${state.dot}`}></span>
						<span class={`text-[0.78rem] font-semibold uppercase tracking-[0.1em] ${state.label}`}>
							{stage.label}
						</span>
					</div>
					<span class="text-[0.72rem] uppercase tracking-[0.08em] text-slate-500">
						Step {index + 1}
					</span>
				</div>
				<p class="mb-0 mt-4 text-[0.95rem] leading-[1.8] tracking-[0.01em] text-slate-300">
					{stage.detail}
				</p>
			</div>
		{/each}
	</div>
</div>
