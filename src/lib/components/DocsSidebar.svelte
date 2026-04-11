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
	function toggleSection(label: string) {
		collapsedSections[label] = !collapsedSections[label];
	}

	const badgeClasses = {
		primary: 'bg-blue-500/16 text-blue-200',
		secondary: 'bg-emerald-500/16 text-emerald-200',
		accent: 'bg-cyan-500/16 text-cyan-200'
	} as const;

	function getBadgeTone(variant?: string) {
		return badgeClasses[(variant as keyof typeof badgeClasses) ?? 'secondary'] ?? badgeClasses.secondary;
	}
</script>

<aside class="sticky top-[4.25rem] max-h-[calc(100vh-4.5rem)] overflow-auto border-r border-white/6 pr-4 pt-6 max-[860px]:static max-[860px]:max-h-72 max-[860px]:border-r-0 max-[860px]:border-b max-[860px]:pb-4 max-[860px]:pr-0">
	{#each items as item}
		<section class="[&+&]:mt-[0.85rem]">
			<button
				type="button"
				class="flex w-full items-center justify-between bg-transparent py-2 text-left text-slate-50 transition-colors hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				onclick={() => toggleSection(item.label)}
				aria-expanded={!collapsedSections[item.label]}
			>
				<h2 class="flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.08em] text-slate-50">
					<span>{item.label}</span>
					{#if item.badge}
						<span class={`inline-flex items-center rounded-full px-[0.65rem] py-[0.35rem] font-[var(--font-display)] text-[0.72rem] uppercase tracking-[0.08em] ${getBadgeTone(item.badge.variant)}`}>{item.badge.text}</span>
					{/if}
				</h2>
				<Icon name={collapsedSections[item.label] ? 'chevron-down' : 'chevron-up'} size={14} />
			</button>
			{#if item.items && !collapsedSections[item.label]}
				<ul class="overflow-hidden transition-[max-height] duration-300 ease-in-out">
					{#each item.items as child}
						<li>
							{#if child.items}
								<div class="flex items-center justify-between px-[0.45rem] py-[0.28rem]">
									<strong class={`block rounded-md px-[0.45rem] py-[0.28rem] text-[0.78rem] leading-[1.35] ${isNodeActive(child) ? 'bg-blue-500/18 text-blue-50' : 'font-semibold text-slate-300'}`}>
										<span>{child.label}</span>
										{#if child.badge}
											<span class={`ml-2 inline-flex items-center rounded-full px-[0.65rem] py-[0.35rem] font-[var(--font-display)] text-[0.72rem] uppercase tracking-[0.08em] ${getBadgeTone(child.badge.variant)}`}>{child.badge.text}</span>
										{/if}
									</strong>
								</div>
								<ul class="mt-[0.15rem] grid gap-[0.1rem] pl-[0.65rem]">
									{#each child.items as grandchild}
										<li>
											<a class={`flex items-center justify-between rounded-[0.35rem] border-l-2 px-2 py-[0.35rem] text-[0.82rem] leading-[1.4] transition-all hover:bg-white/4 hover:text-slate-50 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${page.url.pathname === grandchild.href ? 'border-blue-500 bg-blue-500/10 font-medium text-blue-400' : 'border-transparent text-slate-400'}`} href={grandchild.href}>
												<span>{grandchild.label}</span>
												{#if grandchild.badge}
													<span class={`inline-flex items-center rounded-full px-[0.65rem] py-[0.35rem] font-[var(--font-display)] text-[0.72rem] uppercase tracking-[0.08em] ${getBadgeTone(grandchild.badge.variant)}`}>{grandchild.badge.text}</span>
												{/if}
											</a>
										</li>
									{/each}
								</ul>
							{:else if child.href}
								<a class={`flex items-center justify-between rounded-[0.35rem] border-l-2 px-2 py-[0.35rem] text-[0.82rem] leading-[1.4] transition-all hover:bg-white/4 hover:text-slate-50 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${page.url.pathname === child.href ? 'border-blue-500 bg-blue-500/10 font-medium text-blue-400' : 'border-transparent text-slate-400'}`} href={child.href}>
									<span>{child.label}</span>
									{#if child.badge}
										<span class={`inline-flex items-center rounded-full px-[0.65rem] py-[0.35rem] font-[var(--font-display)] text-[0.72rem] uppercase tracking-[0.08em] ${getBadgeTone(child.badge.variant)}`}>{child.badge.text}</span>
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
