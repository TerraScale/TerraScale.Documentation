<script lang="ts">
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import Icon from '$lib/components/Icon.svelte';

	let { data }: { data: { entry: { title: string; description: string; html: string } } } = $props();

</script>

<svelte:head>
	<title>{data.entry.title}</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>


<section class="mx-auto w-[calc(100%-1.25rem)] max-w-none px-0 pb-16 pt-8 sm:w-[calc(100%-3rem)] sm:pt-7 md:pb-20">
	<div class="grid gap-5 border-b border-white/6 py-[2.2rem] pb-[3.6rem] max-[640px]:py-6 max-[640px]:pb-8">
		<div class="max-w-[35rem]">
			<h1>{data.entry.title}</h1>
			<p class="m-0 max-w-[34rem] leading-7 text-slate-400">
				{data.entry.description}
			</p>
		</div>
		<div class="flex flex-wrap gap-3">
			<a class="inline-flex items-center justify-center gap-2 rounded-[0.45rem] border border-transparent bg-linear-to-b from-blue-600 to-blue-700 px-5 py-3 text-[0.9rem] leading-[1.2] font-semibold text-blue-50 shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href="/guides/getting-started/">
				<span>Start Building</span>
				<Icon name="arrow-right" size={16} />
			</a>
			<a class="inline-flex items-center justify-center gap-2 rounded-[0.45rem] border border-white/8 bg-white/5 px-5 py-3 text-[0.9rem] leading-[1.2] font-semibold text-slate-300 transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href="/reference/api/">
				<span>View API Reference</span>
				<Icon name="arrow-up-right" size={16} />
			</a>
		</div>
	</div>

	<div class="mt-0">
		<article class="prose-shell max-w-[48rem] pt-8 max-[640px]:pt-4">{@html data.entry.html}</article>
	</div>
</section>
