<script lang="ts">
	import { getContext } from 'svelte';

	let { label = 'Tab' } = $props<{ label?: string }>();

	const tabsContext = getContext<{
		getActiveTab: () => string;
		setActiveTab: (value: string) => void;
		registerTab: (getLabel: () => string) => string;
	}>('tabs');

	const id = tabsContext.registerTab(() => label);
	const isActive = $derived(tabsContext.getActiveTab() === id);
</script>

<section class={isActive ? 'block' : 'hidden'} role="tabpanel">
	<slot />
</section>
