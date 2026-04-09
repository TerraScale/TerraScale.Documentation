<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	export let items: Array<{ label: string; content: string }> = [];

	const tabs = writable<Array<{ id: string; label: string }>>([]);
	const active = writable('');
	let count = 0;

	function registerTab(label: string) {
		count += 1;
		const id = `tab-${count}`;
		tabs.update((list) => [...list, { id, label }]);
		active.update((current) => current || id);
		return id;
	}

	setContext('tabs', {
		tabs,
		active,
		registerTab
	});
</script>

{#if items.length}
	<div class="ts-tabs">
		<div class="ts-tabs-list" role="tablist" aria-label="Tabbed code and examples">
			{#each items as item, index}
				<button
					type="button"
					class:active={$active === item.label || (!$active && index === 0)}
					on:click={() => active.set(item.label)}
					role="tab"
					aria-selected={$active === item.label || (!$active && index === 0)}
				>
					{item.label}
				</button>
			{/each}
		</div>
		<div class="ts-tabs-panels">
			{#each items as item, index}
				<section
					class:active={$active === item.label || (!$active && index === 0)}
					class="ts-tab-panel"
					role="tabpanel"
				>
					{@html item.content}
				</section>
			{/each}
		</div>
	</div>
{:else}
	<div class="ts-tabs">
		<div class="ts-tabs-list" role="tablist" aria-label="Tabbed code and examples">
			{#each $tabs as tab}
				<button
					type="button"
					class:active={$active === tab.id}
					on:click={() => active.set(tab.id)}
					role="tab"
					aria-selected={$active === tab.id}
				>
					{tab.label}
				</button>
			{/each}
		</div>
		<div class="ts-tabs-panels">
			<slot />
		</div>
	</div>
{/if}
