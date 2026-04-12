<script lang="ts">
	import { getContext, type Snippet } from 'svelte';

	let { label = 'Tab', children } = $props<{ label?: string; children?: Snippet }>();

	const tabsContext = getContext<{
		getActiveTab: () => string;
		setActiveTab: (value: string) => void;
		registerTab: (getLabel: () => string) => string;
	}>('tabs');

	const id = tabsContext.registerTab(() => label);
	const isActive = $derived(tabsContext.getActiveTab() === id);
</script>

<section class={isActive ? 'block' : 'hidden'} role="tabpanel">
	{@render children?.()}
</section>
