import { createHighlighter } from 'shiki';
import {
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerMetaHighlight
} from '@shikijs/transformers';

const highlighter = await createHighlighter({
	themes: ['github-dark-default', 'github-light-default'],
	langs: [
		'javascript',
		'typescript',
		'python',
		'json',
		'bash',
		'html',
		'css',
		'sql',
		'http',
		'yaml',
		'toml',
		'diff',
		'svelte',
		'markdown',
		'csharp'
	]
});

const escapeSvelte = (str) =>
	str.replace(/[{}`]/g, (c) => ({ '{': '&#123;', '}': '&#125;', '`': '&#96;' }[c]));

export async function shikiHighlighter(code, lang, meta) {
	const language = lang || 'text';

	try {
		const html = highlighter.codeToHtml(code, {
			lang: language,
			themes: {
				light: 'github-light-default',
				dark: 'github-dark-default'
			},
			meta: { __raw: meta },
			transformers: [
				transformerNotationDiff(),
				transformerNotationFocus(),
				transformerNotationHighlight(),
				transformerMetaHighlight(),
				{
					name: 'add-title',
					pre(node) {
						delete node.properties.tabindex;

						if (meta) {
							const titleMatch = meta.match(/title="([^"]+)"/) || meta.match(/title=([^\s]+)/);
							if (titleMatch) {
								node.properties['data-title'] = titleMatch[1];
							}
						}
					}
				}
			]
		});

		return escapeSvelte(html);
	} catch (e) {
		console.error('Error highlighting code:', e);
		return `<pre><code>${escapeSvelte(code)}</code></pre>`;
	}
}
