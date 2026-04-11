<script lang="ts">
	import { setContext } from 'svelte';

	let { items = [] } = $props<{ items?: Array<{ label: string; content: string }> }>();

	let tabs = $state<Array<{ id: string; label: string }>>([]);
	let active = $state('');
	let count = 0;

	function registerTab(getLabel: () => string) {
		const label = getLabel();
		count += 1;
		const id = `tab-${count}`;
		tabs = [...tabs, { id, label }];
		if (!active) {
			active = id;
		}
		return id;
	}

	function setActiveTab(value: string) {
		active = value;
	}

	function getActiveTab() {
		return active;
	}

	setContext('tabs', {
		getActiveTab,
		setActiveTab,
		registerTab
	});
</script>

{#if items.length}
	<div class="my-6">
		<div class="mb-3 flex flex-wrap gap-3 border-b border-white/6 pb-2" role="tablist" aria-label="Tabbed code and examples">
			{#each items as item, index}
				<button
					type="button"
					class={`cursor-pointer border-0 bg-transparent px-0 py-[0.15rem] text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${active === item.label || (!active && index === 0) ? 'text-blue-500' : ''}`}
					onclick={() => setActiveTab(item.label)}
					role="tab"
					aria-selected={active === item.label || (!active && index === 0)}
				>
					{item.label}
				</button>
			{/each}
		</div>
		<div>
			{#each items as item, index}
				<section
					class={active === item.label || (!active && index === 0) ? 'block' : 'hidden'}
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
			{#each tabs as tab}
				<button
					type="button"
					class={`cursor-pointer border-0 bg-transparent px-0 py-[0.15rem] text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${active === tab.id ? 'text-blue-500' : ''}`}
					onclick={() => setActiveTab(tab.id)}
					role="tab"
					aria-selected={active === tab.id}
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
