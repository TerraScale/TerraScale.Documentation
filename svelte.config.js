import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import { directiveAdmonitions } from './scripts/mdsvex/directive-admonitions.mjs';
import { rehypeTodoHighlight } from './scripts/mdsvex/rehype-todo-highlight.mjs';
import { shikiHighlighter } from './scripts/mdsvex/shiki.mjs';

const CONTENT_EXTENSIONS_RE = /\.(md|svx)$/;
const FRONTMATTER_RE = /^---\s*\n[\s\S]*?\n---\s*\n?/;
const LEADING_IMPORTS_RE = /^(?:\s*import[^\n]+\n)+/;

function liftMdxImports() {
	return {
		markup({ content, filename }) {
			if (!filename || !CONTENT_EXTENSIONS_RE.test(filename)) {
				return;
			}

			const normalizedContent = content.replace(/\\\{([^{}\n]+)\\\}/g, '`{$1}`');

			const frontmatter = normalizedContent.match(FRONTMATTER_RE)?.[0] ?? '';
			const remainder = normalizedContent.slice(frontmatter.length);
			const imports = remainder.match(LEADING_IMPORTS_RE)?.[0];

			if (!imports) {
				return {
					code: normalizedContent
				};
			}

			const body = remainder.slice(imports.length).replace(/^\s+/, '');

			return {
				code: `${frontmatter}<script>\n${imports.trim()}\n<\/script>\n\n${body}`
			};
		}
	};
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		liftMdxImports(),
		mdsvex({
			extensions: ['.md', '.svx'],
			highlight: {
				highlighter: shikiHighlighter
			},
			remarkPlugins: [remarkGfm, remarkDirective, directiveAdmonitions],
			rehypePlugins: [
				rehypeSlug,
				rehypeTodoHighlight,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'append',
						properties: {
							ariaLabel: 'Link to section',
							className: ['heading-anchor']
						},
						content: {
							type: 'text',
							value: '#'
						}
					}
				]
			]
		}),
		vitePreprocess()
	],
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		prerender: {
			handleHttpError: 'warn'
		},
		alias: {
			$components: 'src/lib/components',
			$content: 'src/content',
			$lib: 'src/lib'
		}
	}
};

export default config;
