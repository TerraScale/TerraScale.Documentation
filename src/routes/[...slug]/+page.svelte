<script lang="ts">
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	import PrevNextNav from '$lib/components/PrevNextNav.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import type { ContentEntry, SidebarNode } from '$lib/content/types';

	export let data: {
		entry: {
			title: string;
			description: string;
			kind: 'docs' | 'blog';
			date?: string;
			readingTime: string;
			html: string;
			headings: Array<{ depth: number; slug: string; text: string }>;
		};
		sidebar: SidebarNode[];
		prev?: ContentEntry;
		next?: ContentEntry;
	};

</script>

<svelte:head>
	<title>{data.entry.title} | TerraScale</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>

{#if data.entry.kind === 'blog'}
	<section class="shell article-shell article-shell-blog">
		<div class="article-main ts-glass">
			<div class="article-header">
				<p class="eyebrow">Blog</p>
				<h1>{data.entry.title}</h1>
				<p>{data.entry.description}</p>
			<div class="article-meta">
				<span>{data.entry.date}</span>
				<span>{data.entry.readingTime}</span>
			</div>
		</div>
		<article class="prose-shell">
			{@html data.entry.html}
		</article>
		<PrevNextNav prev={data.prev} next={data.next} />
	</div>
	</section>
{:else}
	<section class="shell docs-shell">
		<DocsSidebar items={data.sidebar} />
		<div class="article-main ts-glass">
			<div class="article-header">
				<p class="eyebrow">Documentation</p>
				<h1>{data.entry.title}</h1>
				{#if data.entry.description}
					<p>{data.entry.description}</p>
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
