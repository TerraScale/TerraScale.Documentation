import { allDocsEntries, allBlogEntries, sidebar } from '$lib/content';
import type { ContentEntry, SidebarNode } from '$lib/content/types';

export const prerender = true;

export function GET() {
	const baseUrl = 'https://docs.terrascale.tech';

	let output = '# TerraScale Documentation\n\n';
	output += '> Documentation for TerraScale, a globally distributed NoSQL database.\n\n';

	output += '## Docs\n\n';
	for (const section of sidebar) {
		if (section.label === 'Reference') continue;

		output += `### ${section.label}\n\n`;
		const entries = flattenSection(section);
		for (const entry of entries) {
			const desc = entry.description ? `: ${entry.description}` : '';
			output += `- [${entry.title}](${baseUrl}${entry.route})${desc}\n`;
		}
		output += '\n';
	}

	if (allBlogEntries.length > 0) {
		output += '## Blog\n\n';
		for (const entry of allBlogEntries) {
			const desc = entry.description ? `: ${entry.description}` : '';
			output += `- [${entry.title}](${baseUrl}${entry.route})${desc}\n`;
		}
		output += '\n';
	}

	const referenceSection = sidebar.find((s) => s.label === 'Reference');
	if (referenceSection) {
		output += '## API Reference\n\n';
		const entries = flattenSection(referenceSection);
		for (const entry of entries) {
			const desc = entry.description ? `: ${entry.description}` : '';
			output += `- [${entry.title}](${baseUrl}${entry.route})${desc}\n`;
		}
		output += '\n';
	}

	return new Response(output.trim() + '\n', {
		headers: {
			'content-type': 'text/plain'
		}
	});
}

function flattenSection(node: SidebarNode): ContentEntry[] {
	const entries: ContentEntry[] = [];
	if (node.href) {
		const entry = allDocsEntries.find((e) => e.route === node.href);
		if (entry) {
			entries.push(entry);
		}
	}
	if (node.items) {
		for (const item of node.items) {
			entries.push(...flattenSection(item));
		}
	}
	return entries;
}
