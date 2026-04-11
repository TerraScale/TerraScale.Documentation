<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { contentIconMap } from '$lib/ui/icons';

	export let title = '';
	export let icon = 'file-text';
</script>

<article class="rounded-[0.45rem] border border-white/6 bg-white/4 p-4">
	<header class="flex items-center gap-3">
		<div class="inline-flex size-8 items-center justify-center rounded-[0.4rem] border border-blue-300/22 bg-blue-500/15">
			<Icon name={contentIconMap[icon] ?? 'file-text'} size={18} />
		</div>
		<h3 class="m-0 text-base">{title}</h3>
	</header>
	<div class="text-[0.9rem] leading-[1.65] text-slate-400 [&_p]:text-[0.9rem] [&_p]:leading-[1.65] [&_p]:text-slate-400">
		<slot />
	</div>
</article>
