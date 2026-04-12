<script lang="ts">
	import { page } from '$app/state';
	import type { ContentEntry } from '$lib/content/types';
	import { getStrings } from '$lib/i18n/strings';
	import Icon from './Icon.svelte';

	let {
		prev,
		next
	}: {
		prev?: ContentEntry;
		next?: ContentEntry;
	} = $props();
	const strings = $derived(getStrings(page.data.localeConfig?.prefix ?? 'en'));
</script>

<nav class="mt-8 grid max-w-full grid-cols-1 gap-4 md:grid-cols-2">
	{#if prev}
		<a class="flex items-center justify-between rounded-lg border border-white/10 bg-white/6 p-4 shadow-[0_8px_4px_rgba(0,0,0,0.03),0_5px_2px_rgba(0,0,0,0.03),0_3px_2px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.06)] transition-colors hover:border-blue-400/45 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={prev.route}>
			<Icon name="chevron-left" size={16} />
			<div>
				<span class="block text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-400">{strings.prevNext.previous}</span>
				<strong class="mt-1 block text-[0.98rem] font-semibold leading-[1.45] tracking-[0.01em] text-slate-50">{prev.title}</strong>
			</div>
		</a>
	{/if}
	{#if next}
		<a class="flex items-center justify-between rounded-lg border border-white/10 bg-white/6 p-4 shadow-[0_8px_4px_rgba(0,0,0,0.03),0_5px_2px_rgba(0,0,0,0.03),0_3px_2px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.06)] transition-colors hover:border-blue-400/45 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={next.route}>
			<div>
				<span class="block text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-400">{strings.prevNext.next}</span>
				<strong class="mt-1 block text-[0.98rem] font-semibold leading-[1.45] tracking-[0.01em] text-slate-50">{next.title}</strong>
			</div>
			<Icon name="chevron-right" size={16} />
		</a>
	{/if}
</nav>
