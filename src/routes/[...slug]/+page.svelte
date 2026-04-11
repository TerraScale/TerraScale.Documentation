<script lang="ts">
	// biome-ignore assist/source/organizeImports: local ordering keeps markup imports grouped.
	import { unmount, mount } from 'svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import PrevNextNav from '$lib/components/PrevNextNav.svelte';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import type { BadgeMeta, ContentEntry, SidebarNode } from '$lib/content/types';

	let { data }: { data: { entry: ContentEntry; sidebar: SidebarNode[]; prev?: ContentEntry; next?: ContentEntry } } = $props();

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function getBadgeClass(badge?: BadgeMeta) {
		return badge?.variant ? `ts-badge ts-badge-${badge.variant}` : 'ts-badge ts-badge-secondary';
	}

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function formatDate(dateStr?: string) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	$effect(() => {
		// This runs whenever data.entry.html changes and the DOM is updated
		const preElements = document.querySelectorAll('.prose-shell pre');
		const mountedButtons: Record<string, ReturnType<typeof mount>> = {};
		
		preElements.forEach((pre, index) => {
			if (pre.querySelector('.copy-button')) return;

			const codeElement = pre.querySelector('code');
			const text = codeElement ? codeElement.textContent || '' : pre.textContent || '';

			const instance = mount(CopyButton, {
				target: pre,
				props: { text }
			});
			
			mountedButtons[index] = instance;

			const title = pre.getAttribute('data-title');
			if (title && !pre.parentElement?.classList.contains('code-block-wrapper')) {
				const titleDiv = document.createElement('div');
				titleDiv.className = 'code-title';
				titleDiv.textContent = title;
				
				const wrapper = document.createElement('div');
				wrapper.className = 'code-block-wrapper';
				pre.parentNode?.insertBefore(wrapper, pre);
				wrapper.appendChild(titleDiv);
				wrapper.appendChild(pre);
			}
		});

		return () => {
			// Cleanup mounted components
			Object.values(mountedButtons).forEach((instance) => {
				try {
					unmount(instance);
				} catch {
					// Ignore unmount errors if DOM is already gone
				}
			});
		};
	});
</script>

<svelte:head>
	<title>{data.entry.title} | TerraScale</title>
	<meta name="description" content={data.entry.description} />
	{#if data.entry.canonical}
		<link rel="canonical" href={data.entry.canonical} />
	{/if}
	<meta property="og:title" content={data.entry.title} />
	<meta property="og:description" content={data.entry.description} />
	<meta property="og:type" content="article" />
	{#if data.entry.date}
		<meta property="article:published_time" content={data.entry.date} />
	{/if}
</svelte:head>

{#if data.entry.kind === 'blog'}
	<section class="shell article-shell article-shell-blog">
		<div class="article-main ts-glass">
			<div class="article-header">
				<p class="eyebrow">Blog</p>
				<h1>{data.entry.title}</h1>
				{#if data.entry.description}
					<p class="article-description">{data.entry.description}</p>
				{/if}
				<div class="article-meta">
					<time datetime={data.entry.date}>{formatDate(data.entry.date)}</time>
					<span class="meta-separator">•</span>
					<span>{data.entry.readingTime}</span>
				</div>
				{#if data.entry.authors && data.entry.authors.length > 0}
					<div class="article-authors">
						{#each data.entry.authors as author}
							<div class="author-card">
								<div class="author-info">
									<span class="author-name">
										{#if author.url}
											<a href={author.url}>{author.name}</a>
										{:else}
											{author.name}
										{/if}
									</span>
									{#if author.title}
										<span class="author-title">{author.title}</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<article class="prose-shell">
				{@html data.entry.html}
			</article>
			<PrevNextNav prev={data.prev} next={data.next} />
		</div>
	</section>
{:else}
	<section class="shell docs-shell docs-page">
		<DocsSidebar items={data.sidebar} />
		<div class="article-main docs-article">
			<div class="article-header">
				<h1>
					<span>{data.entry.title}</span>
					{#if data.entry.headingBadge}
						<span class={getBadgeClass(data.entry.headingBadge)}>{data.entry.headingBadge.text}</span>
					{/if}
				</h1>
				{#if data.entry.description}
					<p class="article-description">{data.entry.description}</p>
				{/if}
			</div>
			<article class="prose-shell">
				{@html data.entry.html}
			</article>
			<PrevNextNav prev={data.prev} next={data.next} />
		</div>
		<TableOfContents items={data.entry.headings} />
	</section>
{/if}

<style>
	.meta-separator {
		margin: 0 0.5rem;
		opacity: 0.5;
	}

	.article-authors {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.author-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.author-info {
		display: flex;
		flex-direction: column;
	}

	.author-name {
		font-weight: 600;
		color: var(--ts-color-text);
	}

	.author-name a {
		color: inherit;
		text-decoration: none;
	}

	.author-name a:hover {
		text-decoration: underline;
		color: var(--ts-color-primary-light);
	}

	.author-title {
		font-size: 0.875rem;
		color: var(--ts-color-text-muted);
	}
</style>
