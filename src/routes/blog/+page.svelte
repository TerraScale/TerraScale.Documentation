<script lang="ts">
	import type { ContentEntry } from '$lib/content/types';

	let { data }: { data: { posts: ContentEntry[] } } = $props();

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

<section class="mx-auto w-[calc(100%-1.25rem)] max-w-none px-0 pb-32 pt-16 sm:w-[calc(100%-3rem)] max-[640px]:pt-8">
	<div class="mb-16 grid max-w-[800px] gap-4 border-b border-white/6 py-[2.2rem] pb-11 max-[640px]:mb-10 max-[640px]:py-6 max-[640px]:pb-8">
		<p class="mb-[0.85rem] text-[0.8rem] uppercase tracking-[0.16em] text-blue-300">Engineering Notes</p>
		<h1>TerraScale Blog</h1>
		<p class="mt-4 text-[1.25rem] leading-8 text-slate-400">Product updates, architecture deep dives, and practical tutorials from the team building TerraScale.</p>
	</div>

	{#if data.posts.length}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-8 max-[640px]:grid-cols-1">
			{#each data.posts as post}
				<article>
					<a class="flex h-full flex-col rounded-2xl border border-white/8 bg-white/6 p-8 text-inherit no-underline shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-[14px] transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-blue-400/45 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={post.route}>
						<div>
							<div class="mb-4 flex items-center gap-2 text-[0.875rem] text-slate-400">
								<time datetime={post.date}>{formatDate(post.date)}</time>
								<span class="meta-separator">•</span>
								<span>{post.readingTime}</span>
							</div>

							<h2 class="mb-4 text-2xl font-bold leading-[1.3] text-slate-50">{post.title}</h2>

							{#if post.description}
								<p class="mb-6 line-clamp-3 text-base leading-[1.6] text-slate-400">{post.description}</p>
							{/if}

							{#if post.authors && post.authors.length > 0}
								<div class="mb-6 text-[0.875rem] font-medium">
									{#each post.authors as author}
										<span class="text-slate-50">{author.name}</span>
									{/each}
								</div>
							{/if}

							<div class="mt-auto flex flex-wrap gap-2">
								{#each post.tags.slice(0, 3) as tag}
									<span class="inline-flex items-center rounded-full bg-cyan-500/16 px-[0.65rem] py-[0.35rem] font-[var(--font-display)] text-[0.72rem] uppercase tracking-[0.08em] text-cyan-200">{tag}</span>
								{/each}
							</div>
						</div>
					</a>
				</article>
			{/each}
		</div>
	{:else}
		<div class="max-w-[44rem] rounded-2xl border border-white/10 bg-white/6 p-8 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-[14px]">
			<h2>No public posts yet</h2>
			<p class="m-0 leading-7 text-slate-400">Draft entries stay hidden until they are ready to publish. Check back soon for new engineering updates.</p>
		</div>
	{/if}
</section>
