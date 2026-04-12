<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { contentIconMap } from '$lib/ui/icons';

	export let items: Array<{ title: string; icon: string; content: string }> = [];
</script>

{#if items.length}
	<div class="my-6 grid grid-cols-4 gap-4 max-[640px]:grid-cols-1">
		{#each items as item}
			<article class="rounded-[0.45rem] border border-white/6 bg-white/4 p-4">
				<header class="flex items-center gap-3">
					<div class="inline-flex size-8 items-center justify-center rounded-[0.4rem] border border-blue-300/22 bg-blue-500/15">
						<Icon name={contentIconMap[item.icon] ?? 'file-text'} size={18} />
					</div>
					<h3 class="m-0 text-[1rem] font-semibold tracking-[0.01em] text-slate-50">{item.title}</h3>
				</header>
				<div class="text-[0.94rem] leading-[1.75] tracking-[0.01em] text-slate-400 [&_p]:text-[0.94rem] [&_p]:leading-[1.75] [&_p]:tracking-[0.01em] [&_p]:text-slate-400">
					{@html item.content}
				</div>
			</article>
		{/each}
	</div>
{:else}
	<div class="my-6 grid grid-cols-4 gap-4 max-[640px]:grid-cols-1">
		<slot />
	</div>
{/if}
