<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { contentIconMap } from '$lib/ui/icons';

	export let items: Array<{ title: string; icon: string; content: string }> = [];
</script>

{#if items.length}
	<div class="ts-card-grid">
		{#each items as item}
			<article class="ts-card">
				<header>
					<div class="ts-card-icon">
						<Icon name={contentIconMap[item.icon] ?? 'file-text'} size={18} />
					</div>
					<h3>{item.title}</h3>
				</header>
				<div class="ts-card-body">
					{@html item.content}
				</div>
			</article>
		{/each}
	</div>
{:else}
	<div class="ts-card-grid">
		<slot />
	</div>
{/if}
