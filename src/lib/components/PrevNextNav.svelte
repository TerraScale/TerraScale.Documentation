<script lang="ts">
	import type { ContentEntry } from '$lib/content/types';
	import Icon from './Icon.svelte';

	export let prev: ContentEntry | undefined;
	export let next: ContentEntry | undefined;
</script>

<nav class="prev-next">
	{#if prev}
		<a class="ts-glass" href={prev.route}>
			<Icon name="chevron-left" size={16} />
			<div>
				<span>Previous</span>
				<strong>{prev.title}</strong>
			</div>
		</a>
	{/if}
	{#if next}
		<a class="ts-glass" href={next.route}>
			<div>
				<span>Next</span>
				<strong>{next.title}</strong>
			</div>
			<Icon name="chevron-right" size={16} />
		</a>
	{/if}
</nav>
