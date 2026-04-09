<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let label = 'Tab';

	const tabsContext = getContext<{
		tabs: Writable<Array<{ id: string; label: string }>>;
		active: Writable<string>;
		registerTab: (label: string) => string;
	}>('tabs');

	const id = tabsContext.registerTab(label);
	const active = tabsContext.active;
</script>

<section class:active={$active === id} class="ts-tab-panel" role="tabpanel">
	<slot />
</section>
