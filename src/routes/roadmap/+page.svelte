<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import {
		exploringItems,
		liveNowItems,
		nextUpItems,
		roadmapStages,
		stableReleaseGoalItems
	} from '$lib/content/roadmap';

	const sections = [
		{ items: liveNowItems, label: 'Live Now', dot: 'bg-emerald-400', icon: 'text-emerald-400' },
		{ items: nextUpItems, label: 'Next Up', dot: 'bg-blue-400', icon: 'text-blue-400' },
		{ items: exploringItems, label: 'Exploring', dot: 'bg-cyan-400', icon: 'text-cyan-400' },
		{ items: stableReleaseGoalItems, label: 'Stable Release Goals', dot: 'bg-amber-400', icon: 'text-amber-400' }
	];
</script>

<svelte:head>
	<title>Roadmap | TerraScale</title>
	<meta name="description" content="What TerraScale supports today, what is coming next, and what stable release requires." />
</svelte:head>

<section class="mx-auto w-[calc(100%-1.25rem)] max-w-4xl px-4 py-20 sm:w-[calc(100%-3rem)]">
	<div class="text-center">
		<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-emerald-300">
			<span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
			Public Alpha
		</div>
		<h1 class="text-[2.4rem] leading-[1.1] tracking-[0.01em] text-ts-text sm:text-[3rem]">Roadmap</h1>
		<p class="mx-auto mt-5 max-w-2xl text-[1rem] leading-[1.85] tracking-[0.01em] text-ts-text-muted">
			What TerraScale supports today, what is prioritized next, and what the platform needs before stable release.
		</p>
	</div>

	<div class="mt-12 flex flex-wrap items-center justify-center gap-2">
		{#each roadmapStages as stage, i}
			{@const isActive = stage.state === 'current'}
			{@const isPast = stage.state === 'completed'}
			<div class="flex items-center gap-2">
				<span
					class="rounded-lg border px-4 py-2 text-[0.8rem] font-medium {isPast
						? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
						: isActive
							? 'border-blue-400/30 bg-blue-500/15 text-blue-300'
							: 'border-white/8 bg-white/[0.03] text-slate-500'}"
				>
					{stage.label}
				</span>
				{#if i < roadmapStages.length - 1}
					<Icon name="chevron-right" size={14} className="text-slate-600" />
				{/if}
			</div>
		{/each}
	</div>

	{#each sections as section}
		<div class="mt-14">
			<div class="mb-5 flex items-center gap-2.5">
				<span class="inline-flex size-2 rounded-full {section.dot}"></span>
				<h2 class="text-[1.15rem] font-semibold tracking-[0.01em] text-slate-100">{section.label}</h2>
			</div>
			<div class="grid gap-3 sm:grid-cols-2">
				{#each section.items as item}
					<div class="rounded-xl border border-ts-divider bg-ts-surface p-5 transition-[border-color] duration-200 hover:border-white/[0.12]">
						<div class="mb-2 flex items-center gap-2.5">
							<Icon name={item.icon} size={16} className={section.icon} />
							<h3 class="text-[0.9rem] font-semibold text-slate-100">{item.title}</h3>
						</div>
						<p class="text-[0.84rem] leading-[1.7] text-ts-text-muted">{item.summary}</p>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	<div class="mt-16 flex flex-wrap items-center justify-center gap-4">
		<a
			href="https://discord.gg/8Zr2Nw9g"
			class="inline-flex items-center justify-center gap-2 rounded-ts-md border border-transparent bg-linear-to-b from-ts-primary to-blue-700 px-6 py-3.5 text-[0.84rem] font-medium uppercase tracking-[0.06em] text-blue-50 shadow-ts-brutal-blue transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.4)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
		>
			<Icon name="message-circle" size={16} />
			Join Discord
		</a>
		<a
			href="/guides/getting-started/"
			class="inline-flex items-center justify-center gap-2 rounded-ts-md border border-ts-divider bg-ts-surface px-6 py-3.5 text-[0.84rem] font-medium uppercase tracking-[0.06em] text-slate-300 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-white/15 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
		>
			Get Started
			<Icon name="arrow-right" size={16} />
		</a>
	</div>
</section>
