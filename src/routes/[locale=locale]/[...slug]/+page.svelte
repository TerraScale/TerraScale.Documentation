<script lang="ts">
	// biome-ignore-all assist/source/organizeImports: wrapper imports are grouped for markup usage
	// biome-ignore-all lint/correctness/noUnusedImports: referenced in component markup
	import { page } from '$app/state';
	import DocsPage from '../../[...slug]/+page.svelte';
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

<DocsPage {data} locale={page.data.localeConfig?.prefix ?? 'en'} />
