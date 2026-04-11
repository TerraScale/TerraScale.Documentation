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
	<div class="my-6">
		<div class="mb-3 flex flex-wrap gap-3 border-b border-white/6 pb-2" role="tablist" aria-label="Tabbed code and examples">
			{#each items as item, index}
				<button
					type="button"
					class={`cursor-pointer border-0 bg-transparent px-0 py-[0.15rem] text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${$active === item.label || (!$active && index === 0) ? 'text-blue-500' : ''}`}
					on:click={() => active.set(item.label)}
					role="tab"
					aria-selected={$active === item.label || (!$active && index === 0)}
				>
					{item.label}
				</button>
			{/each}
		</div>
		<div>
			{#each items as item, index}
				<section
					class={$active === item.label || (!$active && index === 0) ? 'block' : 'hidden'}
					role="tabpanel"
				>
					{@html item.content}
				</section>
			{/each}
		</div>
	</div>
{:else}
	<div class="my-6">
		<div class="mb-3 flex flex-wrap gap-3 border-b border-white/6 pb-2" role="tablist" aria-label="Tabbed code and examples">
			{#each $tabs as tab}
				<button
					type="button"
					class={`cursor-pointer border-0 bg-transparent px-0 py-[0.15rem] text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${$active === tab.id ? 'text-blue-500' : ''}`}
					on:click={() => active.set(tab.id)}
					role="tab"
					aria-selected={$active === tab.id}
				>
					{tab.label}
				</button>
			{/each}
		</div>
		<div>
			<slot />
		</div>
	</div>
{/if}
