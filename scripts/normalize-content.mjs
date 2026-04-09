import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const root = path.join(process.cwd(), 'src/content/docs');

function walk(dir, files = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(full, files);
		} else if (/\.(md|mdx)$/.test(entry.name)) {
			files.push(full);
		}
	}

	return files;
}

function toHtml(markdown) {
	return marked.parse(markdown.trim(), {
		gfm: true,
		breaks: false
	}).trim();
}

function transformTabs(source) {
	return source.replace(/<Tabs>\s*([\s\S]*?)<\/Tabs>/g, (_, block) => {
		const items = [];
		for (const match of block.matchAll(/<TabItem label="([^"]+)">\s*([\s\S]*?)\s*<\/TabItem>/g)) {
			items.push({
				label: match[1],
				content: toHtml(match[2])
			});
		}

		if (!items.length) {
			return _;
		}

		return `<Tabs items={${JSON.stringify(items)}} />`;
	});
}

function transformCardGrids(source) {
	return source.replace(/<CardGrid>\s*([\s\S]*?)<\/CardGrid>/g, (_, block) => {
		const items = [];
		for (const match of block.matchAll(/<Card title="([^"]+)" icon="([^"]+)">\s*([\s\S]*?)\s*<\/Card>/g)) {
			items.push({
				title: match[1],
				icon: match[2],
				content: toHtml(match[3])
			});
		}

		if (!items.length) {
			return _;
		}

		return `<CardGrid items={${JSON.stringify(items)}} />`;
	});
}

for (const file of walk(root)) {
	const original = fs.readFileSync(file, 'utf8');
	const next = transformCardGrids(transformTabs(original));
	if (next !== original) {
		fs.writeFileSync(file, next);
	}
}
