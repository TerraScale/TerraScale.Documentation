<script lang="ts">
	import { LinkCard, RoadmapGrid, RoadmapLegend, RoadmapStageBand } from '$lib/mdx';
	import {
		exploringItems,
		liveNowItems,
		nextUpItems,
		roadmapLegend,
		roadmapStages,
		stableReleaseGoalItems
	} from '$lib/content/roadmap';
</script>

<svelte:head>
	<title>Public Roadmap | TerraScale</title>
	<meta
		name="description"
		content="What TerraScale supports in Public Alpha, what is prioritized next, and what stable release needs before it earns broader trust."
	/>
	<meta property="og:title" content="Public Roadmap" />
	<meta
		property="og:description"
		content="What TerraScale supports in Public Alpha, what is prioritized next, and what stable release needs before it earns broader trust."
	/>
	<meta property="og:type" content="website" />
	<meta name="twitter:title" content="Public Roadmap" />
	<meta
		name="twitter:description"
		content="What TerraScale supports in Public Alpha, what is prioritized next, and what stable release needs before it earns broader trust."
	/>
	<meta name="twitter:card" content="summary" />
</svelte:head>

<section class="mx-auto w-[calc(100%-1.25rem)] max-w-[88rem] px-0 pb-16 pt-7 sm:w-[calc(100%-3rem)] md:pb-20">
	<div class="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.16),rgba(8,145,178,0.06)_38%,rgba(255,255,255,0.04)_100%)] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:px-8 sm:py-8">
		<div class="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl"></div>
		<div class="pointer-events-none absolute right-0 top-8 h-40 w-40 rounded-full bg-cyan-500/12 blur-3xl"></div>
		<div class="relative">
			<div class="flex flex-wrap items-center gap-3">
				<span class="inline-flex items-center rounded-full border border-emerald-400/28 bg-emerald-500/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-emerald-200">
					Public Alpha
				</span>
				<span class="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-300">
					Public roadmap
				</span>
			</div>

			<h1 class="mb-0 mt-5 text-[2.35rem] leading-[1.08] tracking-[0.01em] text-slate-50 sm:text-[3.4rem]">
				One roadmap, no parent docs category, just the current truth about TerraScale.
			</h1>

			<p class="mb-0 mt-5 max-w-3xl text-[1.06rem] leading-[1.9] tracking-[0.01em] text-slate-200">
				This page is the canonical source for what TerraScale supports today, what is prioritized next,
				and what the platform still needs before a stable release deserves broad production trust.
			</p>

			<div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<div class="rounded-[1rem] border border-white/10 bg-black/16 p-4">
					<p class="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-slate-500">Current stage</p>
					<p class="mb-0 text-[1rem] leading-[1.5] text-slate-100">Public Alpha</p>
				</div>
				<div class="rounded-[1rem] border border-white/10 bg-black/16 p-4">
					<p class="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-slate-500">Primary focus</p>
					<p class="mb-0 text-[1rem] leading-[1.5] text-slate-100">Performance automation</p>
				</div>
				<div class="rounded-[1rem] border border-white/10 bg-black/16 p-4">
					<p class="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-slate-500">Current guardrail</p>
					<p class="mb-0 text-[1rem] leading-[1.5] text-slate-100">100 GB per database</p>
				</div>
				<div class="rounded-[1rem] border border-white/10 bg-black/16 p-4">
					<p class="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-slate-500">Feedback loop</p>
					<p class="mb-0 text-[1rem] leading-[1.5] text-slate-100">Discord-driven priorities</p>
				</div>
			</div>

			<div class="mt-7 flex flex-wrap gap-3">
				<a
					href="https://discord.gg/8Zr2Nw9g"
					class="inline-flex items-center justify-center rounded-[0.7rem] border border-transparent bg-linear-to-b from-blue-600 to-blue-700 px-4 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-blue-50 shadow-[0_12px_28px_rgba(37,99,235,0.28)] transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				>
					Join Discord
				</a>
				<a
					href="/guides/getting-started/"
					class="inline-flex items-center justify-center rounded-[0.7rem] border border-white/10 bg-white/6 px-4 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-slate-200 transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				>
					Start Building
				</a>
			</div>
		</div>
	</div>

	<div class="mt-10">
		<div class="max-w-3xl">
			<p class="mb-0 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-blue-300">How to read it</p>
			<h2 class="mb-0 mt-3 text-[2rem] leading-[1.14] tracking-[0.01em] text-slate-50 sm:text-[2.5rem]">
				Confidence comes before calendar promises.
			</h2>
			<p class="mb-0 mt-4 text-[1rem] leading-[1.85] tracking-[0.01em] text-slate-300">
				The roadmap is grouped by status, not by arbitrary dates. That keeps the page honest while still making direction clear.
			</p>
		</div>

		<RoadmapLegend items={roadmapLegend} />
	</div>

	<div class="mt-12">
		<div class="max-w-3xl">
			<p class="mb-0 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-blue-300">Release path</p>
			<h2 class="mb-0 mt-3 text-[2rem] leading-[1.14] tracking-[0.01em] text-slate-50 sm:text-[2.5rem]">
				From Public Alpha to stable release.
			</h2>
			<p class="mb-0 mt-4 text-[1rem] leading-[1.85] tracking-[0.01em] text-slate-300">
				The path is straightforward: ship performance automation, tighten operational trust, and only call the product stable when reliability and daily operator experience both hold up.
			</p>
		</div>

		<RoadmapStageBand stages={roadmapStages} />
	</div>

	<div class="mt-12">
		<div class="max-w-3xl">
			<p class="mb-0 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-emerald-300">Live now</p>
			<h2 class="mb-0 mt-3 text-[2rem] leading-[1.14] tracking-[0.01em] text-slate-50 sm:text-[2.5rem]">
				What you can evaluate today.
			</h2>
			<p class="mb-0 mt-4 text-[1rem] leading-[1.85] tracking-[0.01em] text-slate-300">
				These capabilities define the real Public Alpha surface today. They are the baseline for evaluating the platform, not marketing placeholders.
			</p>
		</div>

		<RoadmapGrid items={liveNowItems} tone="live" statusLabel="Live now" />
	</div>

	<div class="mt-12">
		<div class="max-w-3xl">
			<p class="mb-0 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-blue-300">Next up</p>
			<h2 class="mb-0 mt-3 text-[2rem] leading-[1.14] tracking-[0.01em] text-slate-50 sm:text-[2.5rem]">
				What is prioritized next.
			</h2>
			<p class="mb-0 mt-4 text-[1rem] leading-[1.85] tracking-[0.01em] text-slate-300">
				This is the near-term work intended to make TerraScale faster and easier to trust without forcing every team to hand-tune the platform first.
			</p>
		</div>

		<RoadmapGrid items={nextUpItems} tone="next" statusLabel="Next up" />
	</div>

	<div class="mt-12">
		<div class="max-w-3xl">
			<p class="mb-0 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-cyan-300">Exploring</p>
			<h2 class="mb-0 mt-3 text-[2rem] leading-[1.14] tracking-[0.01em] text-slate-50 sm:text-[2.5rem]">
				What matters, but is not a commitment yet.
			</h2>
			<p class="mb-0 mt-4 text-[1rem] leading-[1.85] tracking-[0.01em] text-slate-300">
				These directions are important, but they still need more usage data before they should be treated like promises.
			</p>
		</div>

		<RoadmapGrid items={exploringItems} tone="exploring" statusLabel="Exploring" />
	</div>

	<div class="mt-12">
		<div class="max-w-3xl">
			<p class="mb-0 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-amber-300">Stable release goals</p>
			<h2 class="mb-0 mt-3 text-[2rem] leading-[1.14] tracking-[0.01em] text-slate-50 sm:text-[2.5rem]">
				What “stable” actually has to mean.
			</h2>
			<p class="mb-0 mt-4 text-[1rem] leading-[1.85] tracking-[0.01em] text-slate-300">
				Stable release is not a feature bucket. It is the point where data safety, failover behavior, recovery, and operator experience all feel dependable enough for broader production use.
			</p>
		</div>

		<RoadmapGrid items={stableReleaseGoalItems} tone="goal" statusLabel="Stable release goal" />
	</div>

	<div class="mt-14 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.26)] sm:p-8">
		<div class="max-w-3xl">
			<p class="mb-0 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-blue-300">Help shape it</p>
			<h2 class="mb-0 mt-3 text-[2rem] leading-[1.14] tracking-[0.01em] text-slate-50 sm:text-[2.5rem]">
				Real workloads should shape the next roadmap decisions.
			</h2>
			<p class="mb-0 mt-4 text-[1rem] leading-[1.85] tracking-[0.01em] text-slate-300">
				If you have a feature request, a query pattern that needs to be faster, or a reliability requirement that should move higher, bring it directly into the loop.
			</p>
		</div>

		<div class="mt-8 grid gap-4 md:grid-cols-2">
			<LinkCard href="https://discord.gg/8Zr2Nw9g" title="Join the Discord">
				Bring feature requests, edge cases, and performance pain points directly into the feedback loop.
			</LinkCard>
			<LinkCard href="/guides/getting-started/" title="Try the current platform">
				Use the existing docs and APIs first, then compare that experience against the roadmap direction above.
			</LinkCard>
		</div>
	</div>
</section>
