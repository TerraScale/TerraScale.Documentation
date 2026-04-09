<script lang="ts">
	import { page } from '$app/state';
	import type { SidebarNode } from '$lib/content/types';

	export let items: SidebarNode[] = [];

	function isNodeActive(node: SidebarNode): boolean {
		if (node.href && page.url.pathname === node.href) {
			return true;
		}
		return node.items?.some((child) => isNodeActive(child)) ?? false;
	}
</script>

<aside class="docs-sidebar ts-glass">
	{#each items as item}
		<section>
			<h2>{item.label}</h2>
			{#if item.items}
				<ul>
					{#each item.items as child}
						<li class:active={isNodeActive(child)}>
							{#if child.items}
								<strong>{child.label}</strong>
								<ul>
									{#each child.items as grandchild}
										<li class:active={page.url.pathname === grandchild.href}>
											<a href={grandchild.href}>{grandchild.label}</a>
										</li>
									{/each}
								</ul>
							{:else if child.href}
								<a href={child.href}>{child.label}</a>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</aside>
