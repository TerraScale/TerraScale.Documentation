import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import { directiveAdmonitions } from './scripts/mdsvex/directive-admonitions.mjs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.mdx', '.svx'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md', '.mdx', '.svx'],
			remarkPlugins: [remarkGfm, remarkDirective, directiveAdmonitions],
			rehypePlugins: [
				rehypeSlug,
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
		})
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
