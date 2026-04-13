import { getLocaleSidebar, getLocaleBlogEntries } from '$lib/content';
import { getLocales } from '$lib/i18n/locales';
import type { SidebarNode } from '$lib/content/types';

export const prerender = true;

export function GET() {
	const baseUrl = 'https://docs.terrascale.tech';
	const locales = getLocales();

	let output = '# TerraScale Documentation\n\n';
	output += '> Documentation for TerraScale, a globally distributed NoSQL database.\n\n';

	for (const locale of locales) {
		const sidebar = getLocaleSidebar(locale.prefix);
		const blogEntries = getLocaleBlogEntries(locale.prefix);

		output += `## ${locale.label} (/${locale.prefix}/)\n\n`;

		for (const section of sidebar) {
			if (section.label === 'Reference') continue;

			output += `### ${section.label}\n\n`;
			const entries = flattenSection(section);
			for (const entry of entries) {
				const href = `/${locale.prefix}${entry.route === '/' ? '/' : entry.route}`;
				const desc = entry.description ? `: ${entry.description}` : '';
				output += `- [${entry.title}](${baseUrl}${href})${desc}\n`;
			}
			output += '\n';
		}

		if (blogEntries.length > 0) {
			output += '### Blog\n\n';
			for (const entry of blogEntries) {
				const href = `/${locale.prefix}${entry.route}`;
				const desc = entry.description ? `: ${entry.description}` : '';
				output += `- [${entry.title}](${baseUrl}${href})${desc}\n`;
			}
			output += '\n';
		}

		const referenceSection = sidebar.find((s) => s.label === 'Reference');
		if (referenceSection) {
			output += '### API Reference\n\n';
			const entries = flattenSection(referenceSection);
			for (const entry of entries) {
				const href = `/${locale.prefix}${entry.route}`;
				const desc = entry.description ? `: ${entry.description}` : '';
				output += `- [${entry.title}](${baseUrl}${href})${desc}\n`;
			}
			output += '\n';
		}
	}

	return new Response(output.trim() + '\n', {
		headers: {
			'content-type': 'text/plain'
		}
	});
}

interface FlatEntry {
	title: string;
	route: string;
	description?: string;
}

function flattenSection(node: SidebarNode): FlatEntry[] {
	const entries: FlatEntry[] = [];
	if (node.href) {
		entries.push({
			title: node.label,
			route: node.href,
			description: undefined
		});
	}
	if (node.items) {
		for (const item of node.items) {
			entries.push(...flattenSection(item));
		}
	}
	return entries;
}
