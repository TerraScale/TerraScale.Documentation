<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { contentIconMap } from '$lib/ui/icons';

	export let title = '';
	export let icon = 'file-text';
</script>

<article class="ts-card">
	<header>
		<div class="ts-card-icon">
			<Icon name={contentIconMap[icon] ?? 'file-text'} size={18} />
		</div>
		<h3>{title}</h3>
	</header>
	<div class="ts-card-body">
		<slot />
	</div>
</article>
