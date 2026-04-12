<script lang="ts">
	import { page } from '$app/state';
	import type { SidebarNode } from '$lib/content/types';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import Icon from './Icon.svelte';

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let { items = [] }: { items: SidebarNode[] } = $props();

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function isNodeActive(node: SidebarNode): boolean {
		if (node.href && page.url.pathname === node.href) {
			return true;
		}
		return node.items?.some((child) => isNodeActive(child)) ?? false;
	}

	let collapsedSections = $state<Record<string, boolean>>({});

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function getNodeKey(label: string, parentKey?: string) {
		const current = label.trim().toLowerCase();
		return parentKey ? `${parentKey}/${current}` : current;
	}

	function isCollapsed(node: SidebarNode, key: string, collapsedByDefault = false) {
		const explicitState = collapsedSections[key];
		if (explicitState !== undefined) {
			return explicitState;
		}

		return collapsedByDefault && !isNodeActive(node);
	}

	function toggleSection(node: SidebarNode, key: string, collapsedByDefault = false) {
		collapsedSections[key] = !isCollapsed(node, key, collapsedByDefault);
	}

	const badgeClasses = {
		primary: 'bg-blue-500/16 text-blue-200',
		secondary: 'bg-emerald-500/16 text-emerald-200',
		accent: 'bg-cyan-500/16 text-cyan-200'
	} as const;

	function getBadgeTone(variant?: string) {
		return badgeClasses[(variant as keyof typeof badgeClasses) ?? 'secondary'] ?? badgeClasses.secondary;
	}

	function getLinkClasses(active: boolean) {
		return `flex items-center justify-between rounded-[0.55rem] border-l-2 px-[0.8rem] py-[0.55rem] text-[0.83rem] leading-[1.45] tracking-[0.01em] transition-all hover:bg-white/4 hover:text-slate-50 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${active ? 'border-blue-500 bg-blue-500/10 font-medium text-blue-400' : 'border-transparent text-slate-400'}`;
	}
</script>

<aside class="sticky top-[4.25rem] max-h-[calc(100vh-4.5rem)] overflow-auto border-r border-white/6 pr-4 pt-6 max-[860px]:static max-[860px]:max-h-72 max-[860px]:border-r-0 max-[860px]:border-b max-[860px]:pb-4 max-[860px]:pr-0">
	{#each items as item}
		{@const sectionKey = getNodeKey(item.label)}
		<section class="[&+&]:mt-[0.85rem]">
			<button
				type="button"
				class="flex w-full items-center justify-between bg-transparent py-2 text-left text-slate-50 transition-colors hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				onclick={() => toggleSection(item, sectionKey)}
				aria-expanded={!isCollapsed(item, sectionKey)}
			>
				<h2 class="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-slate-50">
					<span>{item.label}</span>
					{#if item.badge}
						<span class={`inline-flex items-center rounded-full px-[0.6rem] py-[0.32rem] text-[0.68rem] font-medium uppercase tracking-[0.05em] ${getBadgeTone(item.badge.variant)}`}>{item.badge.text}</span>
					{/if}
				</h2>
				<Icon name={isCollapsed(item, sectionKey) ? 'chevron-down' : 'chevron-up'} size={14} />
			</button>
			{#if item.items && !isCollapsed(item, sectionKey)}
				<ul class="mt-1 grid gap-[0.2rem] overflow-hidden transition-[max-height] duration-300 ease-in-out">
					{#each item.items as child}
						<li>
							{#if child.items}
								{@const groupKey = getNodeKey(child.label, sectionKey)}
								<button
									type="button"
									class={`mt-2 flex w-full items-center justify-between rounded-[0.8rem] border px-[0.75rem] py-[0.58rem] text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${isNodeActive(child) ? 'border-blue-500/18 bg-blue-500/8 text-slate-100' : 'border-white/6 bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.05]'}`}
									onclick={() => toggleSection(child, groupKey, true)}
									aria-expanded={!isCollapsed(child, groupKey, true)}
								>
									<span class="flex min-w-0 items-center gap-2">
										<span class="text-[0.66rem] font-semibold uppercase tracking-[0.14em]">{child.label}</span>
										{#if child.badge}
											<span class={`inline-flex items-center rounded-full px-[0.52rem] py-[0.25rem] text-[0.62rem] font-medium uppercase tracking-[0.05em] ${getBadgeTone(child.badge.variant)}`}>{child.badge.text}</span>
										{/if}
									</span>
									<span class={`ml-3 inline-flex size-5 shrink-0 items-center justify-center rounded-full border ${isNodeActive(child) ? 'border-blue-400/30 bg-blue-500/14 text-blue-200' : 'border-white/8 bg-white/[0.04] text-slate-400'}`}>
										<Icon name={isCollapsed(child, groupKey, true) ? 'chevron-right' : 'chevron-down'} size={11} />
									</span>
								</button>
								{#if !isCollapsed(child, groupKey, true)}
									<ul class="mt-1 grid gap-[0.15rem] pl-[0.55rem]">
									{#each child.items as grandchild}
										<li>
											<a class={getLinkClasses(page.url.pathname === grandchild.href)} href={grandchild.href}>
												<span>{grandchild.label}</span>
												{#if grandchild.badge}
													<span class={`inline-flex items-center rounded-full px-[0.6rem] py-[0.32rem] text-[0.68rem] font-medium uppercase tracking-[0.05em] ${getBadgeTone(grandchild.badge.variant)}`}>{grandchild.badge.text}</span>
												{/if}
											</a>
										</li>
									{/each}
									</ul>
								{/if}
							{:else if child.href}
								<a class={getLinkClasses(page.url.pathname === child.href)} href={child.href}>
									<span>{child.label}</span>
									{#if child.badge}
										<span class={`inline-flex items-center rounded-full px-[0.6rem] py-[0.32rem] text-[0.68rem] font-medium uppercase tracking-[0.05em] ${getBadgeTone(child.badge.variant)}`}>{child.badge.text}</span>
									{/if}
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</aside>
