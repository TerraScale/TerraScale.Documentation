<script lang="ts">
	import { page } from '$app/state';
	import type { BadgeMeta, SidebarNode } from '$lib/content/types';
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

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function getBadgeClass(badge?: BadgeMeta) {
		return badge?.variant ? `ts-badge ts-badge-${badge.variant}` : 'ts-badge ts-badge-secondary';
	}

	let collapsedSections = $state<Record<string, boolean>>({});

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function toggleSection(label: string) {
		collapsedSections[label] = !collapsedSections[label];
	}
</script>

<aside class="docs-sidebar">
	{#each items as item}
		<section class="sidebar-section">
			<button
				type="button"
				class="section-header"
				onclick={() => toggleSection(item.label)}
				aria-expanded={!collapsedSections[item.label]}
			>
				<h2>
					<span>{item.label}</span>
					{#if item.badge}
						<span class={getBadgeClass(item.badge)}>{item.badge.text}</span>
					{/if}
				</h2>
				<Icon name={collapsedSections[item.label] ? 'chevron-down' : 'chevron-up'} size={14} />
			</button>
			{#if item.items && !collapsedSections[item.label]}
				<ul class="section-items">
					{#each item.items as child}
						<li class="sidebar-item" class:active={isNodeActive(child)}>
							{#if child.items}
								<div class="sidebar-group-label">
									<strong>
										<span>{child.label}</span>
										{#if child.badge}
											<span class={getBadgeClass(child.badge)}>{child.badge.text}</span>
										{/if}
									</strong>
								</div>
								<ul class="sidebar-subitems">
									{#each child.items as grandchild}
										<li class="sidebar-subitem" class:active={page.url.pathname === grandchild.href}>
											<a href={grandchild.href}>
												<span>{grandchild.label}</span>
												{#if grandchild.badge}
													<span class={getBadgeClass(grandchild.badge)}>{grandchild.badge.text}</span>
												{/if}
											</a>
										</li>
									{/each}
								</ul>
							{:else if child.href}
								<a href={child.href}>
									<span>{child.label}</span>
									{#if child.badge}
										<span class={getBadgeClass(child.badge)}>{child.badge.text}</span>
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
