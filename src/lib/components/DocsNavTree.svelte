<script lang="ts">
	// biome-ignore-all lint/correctness/noUnusedImports: referenced in component markup
	// biome-ignore-all lint/correctness/noUnusedVariables: referenced in component markup
	import { page } from '$app/state';
	import type { SidebarNode } from '$lib/content/types';
	import { toLocaleHref } from '$lib/i18n/links';
	import Icon from './Icon.svelte';

	let {
		items = [],
		locale = 'en',
		onNavigate = () => {}
	}: { items: SidebarNode[]; locale?: string; onNavigate?: () => void } = $props();

	function getNodeHref(node: SidebarNode): string | undefined {
		return node.href ? toLocaleHref(node.href, locale) : undefined;
	}

	function isNodeActive(node: SidebarNode): boolean {
		const nodeHref = getNodeHref(node);

		if (nodeHref && page.url.pathname === nodeHref) {
			return true;
		}
		return node.items?.some((child) => isNodeActive(child)) ?? false;
	}

	let collapsedSections = $state<Record<string, boolean>>({});

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

{#snippet renderLeaf(node: SidebarNode)}
	{@const nodeHref = getNodeHref(node)}
	{#if nodeHref}
		<a class={getLinkClasses(page.url.pathname === nodeHref)} href={nodeHref} onclick={onNavigate}>
			<span>{node.label}</span>
			{#if node.badge}
				<span class={`inline-flex items-center rounded-full px-[0.6rem] py-[0.32rem] text-[0.68rem] font-medium uppercase tracking-[0.05em] ${getBadgeTone(node.badge.variant)}`}>{node.badge.text}</span>
			{/if}
		</a>
	{/if}
{/snippet}

{#snippet renderGroup(node: SidebarNode, nodeKey: string)}
	{#if node.items}
		<button
			type="button"
			class={`mt-1.5 flex w-full items-center justify-between bg-transparent pl-3 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${isNodeActive(node) ? 'text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
			onclick={() => toggleSection(node, nodeKey, false)}
			aria-expanded={!isCollapsed(node, nodeKey, false)}
		>
			<h3 class="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.1em]">
				<span class="h-px w-3 shrink-0 bg-current opacity-25"></span>
				<span>{node.label}</span>
				{#if node.badge}
					<span class={`inline-flex items-center rounded-full px-[0.52rem] py-[0.25rem] text-[0.62rem] font-medium uppercase tracking-[0.05em] ${getBadgeTone(node.badge.variant)}`}>{node.badge.text}</span>
				{/if}
			</h3>
			<Icon name={isCollapsed(node, nodeKey, false) ? 'chevron-down' : 'chevron-up'} size={12} />
		</button>
		{#if !isCollapsed(node, nodeKey, false)}
			<ul class="mt-0.5 grid gap-[0.15rem] pl-5">
				{#each node.items as child}
					{@const childKey = getNodeKey(child.label, nodeKey)}
					<li>
						{#if child.items}
							{@render renderGroup(child, childKey)}
						{:else}
							{@render renderLeaf(child)}
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
{/snippet}

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
					{@const childKey = getNodeKey(child.label, sectionKey)}
					<li>
						{#if child.items}
							{@render renderGroup(child, childKey)}
						{:else}
							{@render renderLeaf(child)}
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/each}
