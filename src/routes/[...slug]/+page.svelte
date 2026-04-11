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

	const proseShellClasses = [
		'font-[var(--font-body)] text-slate-200',
		'[&_p]:text-[0.92rem] [&_p]:leading-7 [&_p]:text-slate-400',
		'[&_li]:text-[0.92rem] [&_li]:leading-7 [&_li]:text-slate-400',
		'[&_td]:text-[0.92rem] [&_td]:leading-7 [&_td]:text-slate-400',
		'[&_th]:text-[0.92rem] [&_th]:leading-7 [&_th]:text-slate-400',
		'[&_h1]:font-[var(--font-display)] [&_h1]:text-slate-50',
		'[&_h2]:mt-[2.4rem] [&_h2]:mb-4 [&_h2]:font-[var(--font-display)] [&_h2]:text-[1.65rem] [&_h2]:leading-[1.1] [&_h2]:text-slate-50',
		'[&_h3]:mt-[2.4rem] [&_h3]:mb-4 [&_h3]:font-[var(--font-display)] [&_h3]:text-[1.15rem] [&_h3]:leading-[1.1] [&_h3]:text-slate-50',
		'[&_hr]:my-8 [&_hr]:h-px [&_hr]:border-0 [&_hr]:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]',
		'[&_a]:text-blue-500 [&_a]:underline [&_a]:decoration-blue-500/35',
		'[&_ul]:pl-5 [&_ol]:pl-5',
		'[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:bg-white/3',
		'[&_th]:border [&_th]:border-white/8 [&_th]:p-3 [&_th]:align-top',
		'[&_td]:border [&_td]:border-white/8 [&_td]:p-3 [&_td]:align-top',
		'[&_blockquote]:my-6 [&_blockquote]:border-l-[3px] [&_blockquote]:border-l-blue-400/50 [&_blockquote]:pl-4 [&_blockquote]:text-blue-200',
		'[&_.heading-anchor]:ml-2 [&_.heading-anchor]:text-blue-400 [&_.heading-anchor]:opacity-0 [&_.heading-anchor]:no-underline',
		'[&_h2:hover_.heading-anchor]:opacity-100 [&_h3:hover_.heading-anchor]:opacity-100',
		'[&_code]:font-[ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation_Mono,Courier_New,monospace]',
		'[&_[data-code-wrapper]]:relative [&_[data-code-wrapper]]:my-6',
		'[&_[data-code-wrapper]_[data-code-block]]:m-0',
		'[&_[data-code-title]]:mb-0 [&_[data-code-title]]:inline-block [&_[data-code-title]]:rounded-tl-[0.35rem] [&_[data-code-title]]:rounded-tr-[0.35rem] [&_[data-code-title]]:rounded-br-[0.35rem] [&_[data-code-title]]:border [&_[data-code-title]]:border-b-0 [&_[data-code-title]]:border-white/8 [&_[data-code-title]]:bg-white/4 [&_[data-code-title]]:px-4 [&_[data-code-title]]:py-2 [&_[data-code-title]]:font-[var(--font-display)] [&_[data-code-title]]:text-[0.8rem] [&_[data-code-title]]:text-slate-400',
		'[&_[data-code-block]]:relative [&_[data-code-block]]:max-w-full [&_[data-code-block]]:overflow-auto [&_[data-code-block]]:rounded-[0.35rem] [&_[data-code-block]]:border [&_[data-code-block]]:border-white/8 [&_[data-code-block]]:!bg-[#050508] [&_[data-code-block]]:p-5 [&_[data-code-block]]:shadow-none',
		'[&_[data-code-block][data-title]]:mt-0 [&_[data-code-block][data-title]]:rounded-tl-none [&_[data-code-block][data-title]]:rounded-tr-none',
		'[&_[data-code-block]_.line]:inline-block [&_[data-code-block]_.line]:w-full [&_[data-code-block]_.line]:px-2 [&_[data-code-block]_.line]:mx-[-0.5rem]',
		'[&_[data-code-block]_.line.highlighted]:border-l-2 [&_[data-code-block]_.line.highlighted]:border-l-blue-500 [&_[data-code-block]_.line.highlighted]:bg-blue-500/15 [&_[data-code-block]_.line.highlighted]:pl-[calc(0.5rem-2px)]',
		'[&_[data-code-block]_.line.diff.add]:border-l-2 [&_[data-code-block]_.line.diff.add]:border-l-emerald-500 [&_[data-code-block]_.line.diff.add]:bg-emerald-500/15 [&_[data-code-block]_.line.diff.add]:pl-[calc(0.5rem-2px)]',
		'[&_[data-code-block]_.line.diff.remove]:border-l-2 [&_[data-code-block]_.line.diff.remove]:border-l-rose-500 [&_[data-code-block]_.line.diff.remove]:bg-rose-500/15 [&_[data-code-block]_.line.diff.remove]:pl-[calc(0.5rem-2px)] [&_[data-code-block]_.line.diff.remove]:opacity-70',
		'[&_[data-code-block].has-focused_.line:not(.focused)]:opacity-40 [&_[data-code-block].has-focused_.line:not(.focused)]:blur-[0.095rem] [&_[data-code-block].has-focused_.line:not(.focused)]:transition-[filter,opacity] [&_[data-code-block].has-focused_.line:not(.focused)]:duration-300',
		'[&_[data-code-block].has-focused:hover_.line:not(.focused)]:opacity-100 [&_[data-code-block].has-focused:hover_.line:not(.focused)]:blur-none',
		'[&_.admonition]:my-6 [&_.admonition]:rounded-2xl [&_.admonition]:border [&_.admonition]:border-white/12 [&_.admonition]:bg-white/4 [&_.admonition]:px-4 [&_.admonition]:pt-4 [&_.admonition]:pb-4 [&_.admonition]:pl-[1.15rem]',
		'[&_.admonition-title]:mb-[0.45rem] [&_.admonition-title]:font-[var(--font-display)] [&_.admonition-title]:text-[0.8rem] [&_.admonition-title]:uppercase [&_.admonition-title]:tracking-[0.12em] [&_.admonition-title]:text-slate-50',
		'[&_.admonition-note]:border-blue-400/28 [&_.admonition-note]:bg-blue-600/8',
		'[&_.admonition-tip]:border-emerald-400/28 [&_.admonition-tip]:bg-emerald-500/8',
		'[&_.admonition-caution]:border-amber-400/28 [&_.admonition-caution]:bg-amber-400/8 [&_.admonition-warning]:border-amber-400/28 [&_.admonition-warning]:bg-amber-400/8',
		'[&_.ts-badge]:inline-flex [&_.ts-badge]:items-center [&_.ts-badge]:rounded-full [&_.ts-badge]:px-[0.65rem] [&_.ts-badge]:py-[0.35rem] [&_.ts-badge]:font-[var(--font-display)] [&_.ts-badge]:text-[0.72rem] [&_.ts-badge]:uppercase [&_.ts-badge]:tracking-[0.08em] [&_.ts-badge]:text-slate-50',
		'[&_.ts-badge-primary]:bg-blue-600/16 [&_.ts-badge-primary]:text-blue-200',
		'[&_.ts-badge-secondary]:bg-emerald-500/16 [&_.ts-badge-secondary]:text-emerald-200',
		'[&_.ts-badge-accent]:bg-cyan-600/16 [&_.ts-badge-accent]:text-cyan-200',
		'[&_.ts-tabs-static]:my-6',
		'[&_.ts-tabs-static-trigger]:mr-2 [&_.ts-tabs-static-trigger]:mb-3 [&_.ts-tabs-static-trigger]:cursor-pointer [&_.ts-tabs-static-trigger]:rounded-full [&_.ts-tabs-static-trigger]:border [&_.ts-tabs-static-trigger]:border-white/8 [&_.ts-tabs-static-trigger]:bg-white/4 [&_.ts-tabs-static-trigger]:px-4 [&_.ts-tabs-static-trigger]:py-3 [&_.ts-tabs-static-trigger]:text-slate-400',
		'[&_.ts-tabs-static-trigger.active]:border-blue-400/40 [&_.ts-tabs-static-trigger.active]:bg-blue-600/18 [&_.ts-tabs-static-trigger.active]:text-slate-50',
		'[&_.ts-tabs-static-panel]:hidden [&_.ts-tabs-static-panel.active]:block'
	].join(' ');

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
