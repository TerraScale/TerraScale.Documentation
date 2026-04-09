<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	export let data: {
		entry: {
			title: string;
			description: string;
			html: string;
		};
		blogHighlights: Array<{
			route: string;
			title: string;
			description: string;
			date?: string;
			readingTime: string;
		}>;
	};

</script>

<svelte:head>
	<title>{data.entry.title}</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>

<section class="home-shell shell">
	<div class="hero-panel ts-glass-frosted shadow-offset-blue">
		<div class="hero-copy">
			<p class="eyebrow">TerraScale Documentation</p>
			<h1>Prerendered docs with product-speed navigation.</h1>
			<p>
				Browse guides, reference material, dashboard flows, and release roadmap content in a
				TerraScale-branded Svelte documentation experience.
			</p>
			<div class="hero-actions">
				<a class="ts-btn-primary" href="/guides/getting-started/">
					Start Building
					<Icon name="arrow-right" size={16} />
				</a>
				<a class="ts-btn-glass" href="/reference/api/">Explore API</a>
			</div>
		</div>
		<div class="hero-rail">
			<div class="ts-stats-card">
				<strong>74</strong>
				<span>Docs Pages Migrated</span>
			</div>
			<div class="ts-stats-card">
				<strong>19</strong>
				<span>Global Regions Documented</span>
			</div>
			<div class="ts-stats-card">
				<strong>SPA-fast</strong>
				<span>With Static Prerender</span>
			</div>
		</div>
	</div>

	<div class="home-content">
		<article class="prose-shell">{@html data.entry.html}</article>
	</div>

	<section class="home-blog-preview">
		<div class="section-heading">
			<p class="eyebrow">Latest Posts</p>
			<h2>From the TerraScale blog</h2>
		</div>
		<div class="blog-grid">
			{#each data.blogHighlights as post}
				<a class="blog-card ts-glass" href={post.route}>
					<div class="blog-meta">
						<span>{post.date}</span>
						<span>{post.readingTime}</span>
					</div>
					<h3>{post.title}</h3>
					<p>{post.description}</p>
				</a>
			{/each}
		</div>
	</section>
</section>
