<script lang="ts">
	import type { HeadingLink } from '$lib/content/types';

	export let items: HeadingLink[] = [];
</script>

{#if items.length}
	<aside class="toc ts-glass">
		<h2>On This Page</h2>
		<ul>
			{#each items as item}
				<li class:deep={item.depth === 3}>
					<a href={`#${item.slug}`}>{item.text}</a>
				</li>
			{/each}
		</ul>
	</aside>
{/if}
