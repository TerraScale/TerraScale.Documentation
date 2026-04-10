<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	export let data: {
		entry: {
			title: string;
			description: string;
			html: string;
		};
	};

</script>

<svelte:head>
	<title>{data.entry.title}</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>

<section class="home-shell shell">
	<div class="home-lead">
		<div class="home-lead-copy">
			<h1>{data.entry.title}</h1>
			<p>
				{data.entry.description}
			</p>
		</div>
		<div class="home-lead-actions">
			<a class="sl-link-button primary" href="/guides/getting-started/">
				<span>Start Building</span>
				<Icon name="arrow-right" size={16} />
			</a>
			<a class="sl-link-button minimal" href="/reference/api/">
				<span>View API Reference</span>
				<Icon name="arrow-up-right" size={16} />
			</a>
		</div>
	</div>

	<div class="home-content">
		<article class="prose-shell home-prose">{@html data.entry.html}</article>
	</div>
</section>
