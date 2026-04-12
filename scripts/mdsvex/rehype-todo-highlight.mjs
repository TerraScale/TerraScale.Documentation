import { visit } from 'unist-util-visit';

const TODO_RE = /todo/i;
const BLOCK_TAGS = new Set(['p', 'li', 'td', 'th', 'dd', 'div', 'blockquote']);

function hasClassName(node, className) {
	const classes = node.properties?.className;

	if (Array.isArray(classes)) {
		return classes.includes(className);
	}

	if (typeof classes === 'string') {
		return classes.split(/\s+/).includes(className);
	}

	return false;
}

function markElement(node) {
	node.properties ||= {};
	node.properties.dataTodoLine = '';
}

export function rehypeTodoHighlight() {
	return (tree) => {
		visit(tree, 'text', (node, index, parent) => {
			if (!parent || !node.value.trim() || !TODO_RE.test(node.value)) {
				return;
			}

			let current = parent;

			while (current) {
				if (
					current.type === 'element' &&
					current.tagName === 'span' &&
					hasClassName(current, 'line')
				) {
					markElement(current);
					return;
				}

				if (current.type === 'element' && BLOCK_TAGS.has(current.tagName)) {
					markElement(current);
					return;
				}

				current = current.parent;
			}
		});
	};
}
