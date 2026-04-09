import { visit } from 'unist-util-visit';

const KINDS = new Set(['note', 'tip', 'caution', 'warning']);

function getLabel(node) {
	if (!Array.isArray(node.attributes)) {
		return '';
	}

	return '';
}

export function directiveAdmonitions() {
	return (tree) => {
		visit(tree, (node, index, parent) => {
			if (!parent || typeof index !== 'number') {
				return;
			}

			const name = node.name;
			if (!name || !KINDS.has(name)) {
				return;
			}

			const title = node.attributes?.label || node.label || name;
			const children = node.children || [];
			parent.children[index] = {
				type: 'mdxJsxFlowElement',
				name: 'div',
				attributes: [
					{
						type: 'mdxJsxAttribute',
						name: 'class',
						value: `admonition admonition-${name}`
					}
				],
				children: [
					{
						type: 'mdxJsxFlowElement',
						name: 'p',
						attributes: [
							{
								type: 'mdxJsxAttribute',
								name: 'class',
								value: 'admonition-title'
							}
						],
						children: [{ type: 'text', value: String(title) }]
					},
					...children
				]
			};
		});
	};
}
