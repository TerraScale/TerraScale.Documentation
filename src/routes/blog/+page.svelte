<script lang="ts">
	export let data: {
		posts: Array<{
			route: string;
			title: string;
			description: string;
			date?: string;
			readingTime: string;
			tags: string[];
		}>;
	};
</script>

<svelte:head>
	<title>TerraScale Blog</title>
	<meta name="description" content="Engineering stories, tutorials, and product updates from TerraScale." />
</svelte:head>

<section class="shell blog-index">
	<div class="page-hero">
		<p class="eyebrow">Engineering Notes</p>
		<h1>TerraScale Blog</h1>
		<p>Product updates, architecture deep dives, and practical tutorials from the team building TerraScale.</p>
	</div>

	<div class="blog-grid">
		{#each data.posts as post}
			<a class="blog-card ts-glass" href={post.route}>
				<div class="blog-meta">
					<span>{post.date}</span>
					<span>{post.readingTime}</span>
				</div>
				<h2>{post.title}</h2>
				<p>{post.description}</p>
				<div class="blog-tags">
					{#each post.tags.slice(0, 3) as tag}
						<span class="ts-badge ts-badge-accent">{tag}</span>
					{/each}
				</div>
			</a>
		{/each}
	</div>
</section>
