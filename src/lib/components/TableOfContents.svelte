<script lang="ts">
	import type { HeadingLink } from '$lib/content/types';

	export let items: HeadingLink[] = [];
</script>

{#if items.length}
	<aside class="sticky top-[4.25rem] max-h-[calc(100vh-4.5rem)] border-l border-white/6 pl-4 pt-6 max-[1100px]:hidden">
		<h2 class="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-slate-50">On This Page</h2>
		<ul class="mt-0 grid gap-[0.1rem]">
			{#each items as item}
				<li>
					<a class={`block rounded-[0.35rem] px-[0.45rem] py-[0.38rem] text-[0.8rem] leading-[1.45] tracking-[0.01em] text-slate-400 transition-colors hover:bg-white/4 hover:text-slate-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${item.depth === 3 ? 'pl-[0.85rem]' : ''}`} href={`#${item.slug}`}>{item.text}</a>
				</li>
			{/each}
		</ul>
	</aside>
{/if}
