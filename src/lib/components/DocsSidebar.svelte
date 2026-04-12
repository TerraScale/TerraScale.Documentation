<script lang="ts">
	import type { SidebarNode } from '$lib/content/types';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import DocsNavTree from './DocsNavTree.svelte';

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let { items = [], locale = 'en' }: { items: SidebarNode[]; locale?: string } = $props();
</script>

<aside class="sticky top-[4.25rem] max-h-[calc(100vh-4.5rem)] overflow-auto border-r border-white/6 pr-4 pt-6 max-[860px]:hidden">
	<DocsNavTree items={items} {locale} />
</aside>
