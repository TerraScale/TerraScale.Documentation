import { visit } from 'unist-util-visit';

const TODO_RE = /\b(?:\/\/\s*TODO|TODO)\b/i;
const BLOCK_TAGS = new Set(['p', 'li', 'td', 'th', 'dd', 'div', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

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
		const ancestors = [];

		visit(tree, (node, index, parent) => {
			if (node.type === 'element') {
				ancestors.push(node);
			}
		});

		visit(tree, 'text', (node) => {
			if (!node.value.trim() || !TODO_RE.test(node.value)) {
				return;
			}

			const stack = [];
			let current = tree;

			while (current) {
				stack.push(current);
				if (current.children) {
					let found = false;
					for (const child of current.children) {
						if (child === node || (child.children && containsNode(child, node))) {
							stack.push(child);
							current = child;
							found = true;
							break;
						}
					}
					if (!found) break;
				} else {
					break;
				}
			}

			for (let i = stack.length - 1; i >= 0; i--) {
				const el = stack[i];
				if (el.type !== 'element') continue;

				if (el.tagName === 'span' && hasClassName(el, 'line')) {
					markElement(el);
					return;
				}

				if (BLOCK_TAGS.has(el.tagName)) {
					markElement(el);
					return;
				}
			}
		});
	};
}

function containsNode(parent, target) {
	if (parent === target) return true;
	if (!parent.children) return false;
	for (const child of parent.children) {
		if (containsNode(child, target)) return true;
	}
	return false;
}
