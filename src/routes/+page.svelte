<script lang="ts">
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import Icon from '$lib/components/Icon.svelte';

	let { data }: { data: { entry: { title: string; description: string; html: string } } } = $props();

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

</script>

<svelte:head>
	<title>{data.entry.title}</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>


<section class="mx-auto w-[calc(100%-1.25rem)] max-w-none px-0 pb-16 pt-8 sm:w-[calc(100%-3rem)] sm:pt-7 md:pb-20">
	<div class="grid gap-5 border-b border-white/6 py-[2.2rem] pb-[3.6rem] max-[640px]:py-6 max-[640px]:pb-8">
		<div class="max-w-[35rem]">
			<h1>{data.entry.title}</h1>
			<p class="m-0 max-w-[34rem] leading-7 text-slate-400">
				{data.entry.description}
			</p>
		</div>
		<div class="flex flex-wrap gap-3">
			<a class="inline-flex items-center justify-center gap-2 rounded-[0.45rem] border border-transparent bg-linear-to-b from-blue-600 to-blue-700 px-5 py-3 text-[0.9rem] leading-[1.2] font-semibold text-blue-50 shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href="/guides/getting-started/">
				<span>Start Building</span>
				<Icon name="arrow-right" size={16} />
			</a>
			<a class="inline-flex items-center justify-center gap-2 rounded-[0.45rem] border border-white/8 bg-white/5 px-5 py-3 text-[0.9rem] leading-[1.2] font-semibold text-slate-300 transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href="/reference/api/">
				<span>View API Reference</span>
				<Icon name="arrow-up-right" size={16} />
			</a>
		</div>
	</div>

	<div class="mt-0">
		<article data-prose class={`${proseShellClasses} max-w-[48rem] pt-8 max-[640px]:pt-4`}>{@html data.entry.html}</article>
	</div>
</section>
