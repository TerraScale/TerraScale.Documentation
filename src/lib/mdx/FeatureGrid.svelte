<script lang="ts">
	export let features: Array<{
		icon: string;
		title: string;
		description: string;
	}> = [];

	import Icon from '$lib/components/Icon.svelte';
	import { contentIconMap } from '$lib/ui/icons';
</script>

<div class="feature-grid">
	{#each features as feature}
		<article class="feature-card">
			<div class="feature-icon">
				<Icon name={contentIconMap[feature.icon] ?? 'database'} size={22} />
			</div>
			<h3>{feature.title}</h3>
			<p>{feature.description}</p>
		</article>
	{/each}
</div>
