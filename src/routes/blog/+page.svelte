<script lang="ts">
	import type { ContentEntry } from '$lib/content/types';

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let { data }: {
		posts: ContentEntry[];
	} = $props();

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function formatDate(dateStr?: string) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog | TerraScale</title>
	<meta name="description" content="Engineering stories, tutorials, and product updates from the team building TerraScale." />
	<meta property="og:title" content="TerraScale Blog" />
	<meta property="og:description" content="Engineering stories, tutorials, and product updates from the team building TerraScale." />
	<meta property="og:type" content="website" />
</svelte:head>

<section class="shell blog-index">
	<div class="page-hero">
		<p class="eyebrow">Engineering Notes</p>
		<h1>TerraScale Blog</h1>
		<p class="hero-description">Product updates, architecture deep dives, and practical tutorials from the team building TerraScale.</p>
	</div>

	{#if data.posts.length}
		<div class="blog-grid">
			{#each data.posts as post}
				<article>
					<a class="blog-card ts-glass" href={post.route}>
						<div class="blog-card-content">
							<div class="blog-meta">
								<time datetime={post.date}>{formatDate(post.date)}</time>
								<span class="meta-separator">•</span>
								<span>{post.readingTime}</span>
							</div>

							<h2 class="blog-title">{post.title}</h2>

							{#if post.description}
								<p class="blog-description">{post.description}</p>
							{/if}

							{#if post.authors && post.authors.length > 0}
								<div class="blog-authors">
									{#each post.authors as author}
										<span class="author-name">{author.name}</span>
									{/each}
								</div>
							{/if}

							<div class="blog-tags">
								{#each post.tags.slice(0, 3) as tag}
									<span class="ts-badge ts-badge-accent">{tag}</span>
								{/each}
							</div>
						</div>
					</a>
				</article>
			{/each}
		</div>
	{:else}
		<div class="empty-state ts-glass">
			<h2>No public posts yet</h2>
			<p>Draft entries stay hidden until they are ready to publish. Check back soon for new engineering updates.</p>
		</div>
	{/if}
</section>

<style>
	.blog-index {
		padding-top: 4rem;
		padding-bottom: 8rem;
	}

	.page-hero {
		margin-bottom: 4rem;
		max-width: 800px;
	}

	.hero-description {
		font-size: 1.25rem;
		color: var(--ts-color-text-muted);
		margin-top: 1rem;
		line-height: 1.6;
	}

	.blog-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
	}

	.blog-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 2rem;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s ease, border-color 0.2s ease;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.blog-card:hover {
		transform: translateY(-4px);
		border-color: rgba(96, 165, 250, 0.45);
	}

	.blog-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--ts-color-text-muted);
		margin-bottom: 1rem;
	}

	.meta-separator {
		opacity: 0.5;
	}

	.blog-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
		line-height: 1.3;
		color: var(--ts-color-text);
	}

	.blog-description {
		font-size: 1rem;
		color: var(--ts-color-text-muted);
		margin-bottom: 1.5rem;
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.blog-authors {
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.author-name {
		color: var(--ts-color-text);
	}

	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: auto;
	}

	.empty-state {
		padding: 2rem;
		max-width: 44rem;
	}

	.empty-state h2 {
		margin: 0 0 0.75rem;
		font-size: 1.4rem;
	}

	.empty-state p {
		margin: 0;
		color: var(--ts-color-text-muted);
		line-height: 1.7;
	}

	@media (max-width: 640px) {
		.blog-grid {
			grid-template-columns: 1fr;
		}
		
		.blog-index {
			padding-top: 2rem;
		}
	}
</style>
