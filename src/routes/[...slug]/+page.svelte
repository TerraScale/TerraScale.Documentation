<script lang="ts">
	// biome-ignore assist/source/organizeImports: local ordering keeps markup imports grouped.
	import { unmount, mount } from 'svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import PrevNextNav from '$lib/components/PrevNextNav.svelte';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import { proseShellClasses } from '$lib/styles/prose-shell';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import type { BadgeMeta, ContentEntry, SidebarNode } from '$lib/content/types';

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let { data }: { data: { entry: ContentEntry; sidebar: SidebarNode[]; prev?: ContentEntry; next?: ContentEntry } } = $props();

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function getBadgeClass(badge?: BadgeMeta) {
		const tones = {
			primary: 'bg-blue-500/16 text-blue-200',
			secondary: 'bg-emerald-500/16 text-emerald-200',
			accent: 'bg-cyan-500/16 text-cyan-200'
		} as const;

		const tone = tones[(badge?.variant as keyof typeof tones) ?? 'secondary'] ?? tones.secondary;
		return `inline-flex items-center rounded-full px-[0.65rem] py-[0.35rem] font-[var(--font-display)] text-[0.72rem] uppercase tracking-[0.08em] ${tone}`;
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
		const preElements = document.querySelectorAll('[data-code-block]');
		const mountedButtons: Record<string, ReturnType<typeof mount>> = {};
		
		preElements.forEach((pre, index) => {
			if (pre.querySelector('[data-copy-button]')) return;

			const codeElement = pre.querySelector('code');
			const text = codeElement ? codeElement.textContent || '' : pre.textContent || '';

			const instance = mount(CopyButton, {
				target: pre,
				props: { text }
			});
			
			mountedButtons[index] = instance;

			const title = pre.getAttribute('data-title');
			if (title && !pre.parentElement?.hasAttribute('data-code-wrapper')) {
				const titleDiv = document.createElement('div');
				titleDiv.setAttribute('data-code-title', '');
				titleDiv.textContent = title;
				
				const wrapper = document.createElement('div');
				wrapper.setAttribute('data-code-wrapper', '');
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
	<section class="mx-auto w-[calc(100%-1.25rem)] max-w-none px-0 pb-16 pt-7 sm:w-[calc(100%-3rem)] md:pb-20">
		<div class="rounded-2xl border border-white/10 bg-white/6 p-7 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-[14px] max-[640px]:p-5">
			<div class="mb-6 border-b border-white/6 pb-5">
				<p class="mb-[0.85rem] text-[0.8rem] uppercase tracking-[0.16em] text-blue-300">Blog</p>
				<h1>{data.entry.title}</h1>
				{#if data.entry.description}
					<p class="m-0 text-[0.95rem] leading-7 text-slate-400">{data.entry.description}</p>
				{/if}
				<div class="mt-4 flex flex-wrap items-center gap-3 text-[0.8rem] uppercase tracking-[0.08em] text-slate-300">
					<time datetime={data.entry.date}>{formatDate(data.entry.date)}</time>
					<span class="mx-2 opacity-50">•</span>
					<span>{data.entry.readingTime}</span>
				</div>
				{#if data.entry.authors && data.entry.authors.length > 0}
					<div class="mt-6 flex flex-wrap gap-6 pt-6 border-t border-white/8">
						{#each data.entry.authors as author}
							<div class="flex items-center gap-3">
								<div class="flex flex-col">
									<span class="font-semibold text-slate-50 [&_a]:text-inherit [&_a]:no-underline [&_a:hover]:underline [&_a:hover]:text-blue-400">
										{#if author.url}
											<a href={author.url}>{author.name}</a>
										{:else}
											{author.name}
										{/if}
									</span>
									{#if author.title}
										<span class="text-sm text-slate-400">{author.title}</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<article data-prose class={proseShellClasses}>
				{@html data.entry.html}
			</article>
			<PrevNextNav prev={data.prev} next={data.next} />
		</div>
	</section>
{:else}
	<section class="mx-auto grid w-[calc(100%-1.25rem)] max-w-none grid-cols-[16rem_minmax(0,1fr)_14rem] items-start gap-0 px-0 pb-16 pt-0 sm:w-[calc(100%-3rem)] md:pb-20 max-[1100px]:grid-cols-[14rem_minmax(0,1fr)] max-[860px]:grid-cols-1">
		<DocsSidebar items={data.sidebar} />
		<div class="min-w-0 px-8 pb-8 pt-6 max-[860px]:px-0 max-[860px]:pt-5">
			<div class="mb-5">
				<h1>
					<span>{data.entry.title}</span>
					{#if data.entry.headingBadge}
						<span class={getBadgeClass(data.entry.headingBadge)}>{data.entry.headingBadge.text}</span>
					{/if}
				</h1>
				{#if data.entry.description}
					<p class="text-[0.95rem] leading-7 text-slate-400">{data.entry.description}</p>
				{/if}
			</div>
			<article data-prose class={proseShellClasses}>
				{@html data.entry.html}
			</article>
			<PrevNextNav prev={data.prev} next={data.next} />
		</div>
		<TableOfContents items={data.entry.headings} />
	</section>
{/if}
