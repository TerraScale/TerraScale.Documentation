<script lang="ts">
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import BlogPage from '../../blog/+page.svelte';
	import type { SeoHeadContent } from '$lib/i18n/seo';
	import type { PageData } from './$types';

	type LocalizedPageData = PageData & { seo: SeoHeadContent };

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let { data }: { data: LocalizedPageData } = $props();
</script>

<svelte:head>
	<link rel="canonical" href={data.seo.canonicalUrl} />
	{#each data.seo.hreflangTags as tag}
		<link rel="alternate" hreflang={tag.hreflang} href={tag.href} />
	{/each}
	<meta property="og:locale" content={data.seo.ogLocale} />
</svelte:head>

<BlogPage {data} />
