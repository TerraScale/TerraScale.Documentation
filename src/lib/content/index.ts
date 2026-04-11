import readingTime from 'reading-time';
import { render } from 'svelte/server';
import type { Component } from 'svelte';
import type { ContentEntry, ContentMetadata, HeadingLink, SidebarNode } from './types';

type FrontmatterData = Record<string, unknown>;

type CompiledContentModule = {
	default: Component;
	metadata?: FrontmatterData;
	headings?: unknown;
};

const moduleMap = import.meta.glob('/src/content/docs/**/*.{md,svx}', {
	eager: true
}) as Record<string, CompiledContentModule>;

const sourceMap = import.meta.glob('/src/content/docs/**/*.{md,svx}', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

// Keep the placeholder source ignored so /reference/api/ resolves from
// src/content/docs/reference/api/index.svx without duplicate route collisions.
const IGNORED_SOURCE_PATHS = new Set(['/src/content/docs/reference/api.md']);

const SECTION_LABELS = {
	guides: 'Guides',
	account: 'Account',
	reference: 'Reference',
	dashboard: 'Dashboard',
	roadmap: 'Roadmap',
	about: 'About'
} as const;

type SectionKey = keyof typeof SECTION_LABELS;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown) {
	return typeof value === 'string' ? value : undefined;
}

function getBoolean(value: unknown) {
	return typeof value === 'boolean' ? value : undefined;
}

function getNumber(value: unknown) {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function titleCase(value: string) {
	return value
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function deriveTitle(rawSegments: string[], sourcePath: string) {
	const fileName = sourcePath.replace(/^.*\//, '').replace(/\.(md|svx)$/, '');
	const candidate = rawSegments.at(-1) ?? (fileName === 'index' ? rawSegments.at(-2) : fileName) ?? 'untitled';
	return titleCase(candidate);
}

function getBadgeMeta(value: unknown) {
	if (!isRecord(value)) {
		return undefined;
	}

	const text = getString(value.text);
	if (!text) {
		return undefined;
	}

	return {
		text,
		variant: getString(value.variant)
	};
}

function getSidebarMeta(value: unknown) {
	if (!isRecord(value)) {
		return undefined;
	}

	const order = getNumber(value.order);
	const group = getString(value.group);
	const badge = getBadgeMeta(value.badge);
	const hidden = getBoolean(value.hidden);

	if (order === undefined && group === undefined && badge === undefined && hidden === undefined) {
		return undefined;
	}

	return {
		order,
		group,
		badge,
		hidden
	};
}

function getHeroMeta(value: unknown) {
	if (!isRecord(value)) {
		return undefined;
	}

	const actions = Array.isArray(value.actions)
		? value.actions
				.map((action) => {
					if (!isRecord(action)) {
						return undefined;
					}

					const text = getString(action.text);
					const link = getString(action.link);
					if (!text || !link) {
						return undefined;
					}

					return {
						text,
						link,
						icon: getString(action.icon),
						variant: getString(action.variant)
					};
				})
				.filter((action): action is NonNullable<typeof action> => Boolean(action))
		: undefined;

	const tagline = getString(value.tagline);
	if (tagline === undefined && (!actions || actions.length === 0)) {
		return undefined;
	}

	return {
		tagline,
		actions
	};
}

function getAuthors(value: unknown) {
	if (!Array.isArray(value)) {
		return undefined;
	}

	return value
		.map((author) => {
			if (!isRecord(author)) {
				return undefined;
			}

			const name = getString(author.name);
			if (!name) {
				return undefined;
			}

			return {
				name,
				title: getString(author.title),
				url: getString(author.url)
			};
		})
		.filter((author): author is NonNullable<typeof author> => Boolean(author));
}

function getTags(value: unknown) {
	if (!Array.isArray(value)) {
		return undefined;
	}

	const tags = value.filter((tag): tag is string => typeof tag === 'string');
	return tags.length > 0 ? tags : undefined;
}

function getOpenApiMeta(value: unknown) {
	if (!isRecord(value)) {
		return undefined;
	}

	const spec = getString(value.spec);
	const tag = getString(value.tag);
	if (spec === undefined && tag === undefined) {
		return undefined;
	}

	return { spec, tag };
}

function getSeoMeta(value: unknown) {
	if (!isRecord(value)) {
		return undefined;
	}

	const title = getString(value.title);
	const description = getString(value.description);
	const image = getString(value.image);
	const noindex = getBoolean(value.noindex);
	if (title === undefined && description === undefined && image === undefined && noindex === undefined) {
		return undefined;
	}

	return { title, description, image, noindex };
}

function getContentMetadata(data: FrontmatterData, rawSegments: string[], sourcePath: string): ContentMetadata {
	return {
		title: getString(data.title) ?? deriveTitle(rawSegments, sourcePath),
		description: getString(data.description),
		draft: getBoolean(data.draft),
		unlisted: getBoolean(data.unlisted),
		section: getString(data.section),
		sidebar: getSidebarMeta(data.sidebar),
		headingBadge: getBadgeMeta(data.headingBadge),
		template: getString(data.template),
		hero: getHeroMeta(data.hero),
		date: getString(data.date),
		authors: getAuthors(data.authors),
		tags: getTags(data.tags),
		excerpt: getString(data.excerpt),
		order: getNumber(data.order),
		openapi: getOpenApiMeta(data.openapi),
		canonical: getString(data.canonical),
		seo: getSeoMeta(data.seo)
	};
}

function routeFromFile(filePath: string) {
	const rel = filePath.replace('/src/content/docs/', '').replace(/\.(md|svx)$/, '');
	const rawSegments = rel === 'index' ? [] : rel.replace(/\/index$/, '').split('/');
	const normalizedSegments = rawSegments.filter(Boolean).map((segment) => segment.toLowerCase());
	const route = normalizedSegments.length ? `/${normalizedSegments.join('/')}/` : '/';

	return {
		route,
		rawSegments,
		normalizedSegments,
		directory: normalizedSegments.slice(0, -1).join('/')
	};
}

function extractBodySource(rawSource: string) {
	if (!rawSource.startsWith('---')) {
		return rawSource.trim();
	}

	const match = rawSource.match(/^---\s*\n[\s\S]*?\n---\s*\n?/);
	return (match ? rawSource.slice(match[0].length) : rawSource).trim();
}

function decodeHtmlEntities(text: string) {
	return text
		.replaceAll('&nbsp;', ' ')
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'");
}

function stripHtml(html: string) {
	return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractHeadingsFromHtml(html: string): HeadingLink[] {
	const headings: HeadingLink[] = [];

	for (const match of html.matchAll(/<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gis)) {
		const depth = Number(match[1]);
		const slug = match[2];
		const text = stripHtml(match[3].replace(/<a\b[^>]*class="[^"]*heading-anchor[^"]*"[^>]*>[\s\S]*?<\/a>/gi, ''));

		if (!slug || !text) {
			continue;
		}

		headings.push({ depth, slug, text });
	}

	return headings;
}

function sortEntries(a: ContentEntry, b: ContentEntry, indexRoute?: string) {
	const isIndexA = indexRoute !== undefined && a.route === indexRoute;
	const isIndexB = indexRoute !== undefined && b.route === indexRoute;
	if (isIndexA !== isIndexB) {
		return isIndexA ? -1 : 1;
	}

	const orderA = a.sidebarOrder ?? a.metadata.order ?? Number.MAX_SAFE_INTEGER;
	const orderB = b.sidebarOrder ?? b.metadata.order ?? Number.MAX_SAFE_INTEGER;
	if (orderA !== orderB) {
		return orderA - orderB;
	}
	return a.title.localeCompare(b.title);
}

export function isPublicEntry(entry: ContentEntry) {
	return entry.metadata.draft !== true;
}

export function isListedEntry(entry: ContentEntry) {
	return isPublicEntry(entry) && entry.metadata.unlisted !== true;
}

function isSidebarVisibleEntry(entry: ContentEntry) {
	return isListedEntry(entry) && entry.metadata.sidebar?.hidden !== true;
}

function createSidebarLeaf(entry: ContentEntry): SidebarNode {
	return {
		label: entry.title,
		badge: entry.sidebarBadge,
		href: entry.route
	};
}

function getFilesystemGroupPath(entry: ContentEntry) {
	const sourceSegments = entry.sourcePath
		.replace('/src/content/docs/', '')
		.replace(/\.(md|svx)$/, '')
		.split('/');

	return sourceSegments.slice(1, -1).map((segment) => titleCase(segment));
}

function getSidebarGroupPath(entry: ContentEntry, fallbackSection?: string) {
	const section = entry.metadata.section?.trim();
	const group = entry.metadata.sidebar?.group?.trim();
	const labels = [
		...getFilesystemGroupPath(entry),
		section && section !== fallbackSection ? section : undefined,
		group
	].filter((label): label is string => Boolean(label));

	return labels.filter((label, index) => label !== labels[index - 1]);
}

function appendSidebarLeaf(nodes: SidebarNode[], entry: ContentEntry, fallbackSection?: string) {
	const groupPath = getSidebarGroupPath(entry, fallbackSection);

	if (groupPath.length === 0) {
		nodes.push(createSidebarLeaf(entry));
		return;
	}

	let items = nodes;
	for (const label of groupPath) {
		let node = items.find((candidate) => candidate.label === label && candidate.href === undefined);
		if (!node) {
			node = { label, items: [] };
			items.push(node);
		}
		if (!node.items) {
			node.items = [];
		}
		items = node.items;
	}

	items.push(createSidebarLeaf(entry));
}

function createSidebarItems(entries: ContentEntry[], fallbackSection?: string) {
	const nodes: SidebarNode[] = [];
	for (const entry of entries) {
		appendSidebarLeaf(nodes, entry, fallbackSection);
	}
	return nodes;
}

const entries = Object.entries(moduleMap)
	.filter(([sourcePath]) => !IGNORED_SOURCE_PATHS.has(sourcePath))
	.map(([sourcePath, module]) => {
		const raw = sourceMap[sourcePath];
		if (typeof raw !== 'string') {
			throw new Error(`Missing raw source for ${sourcePath}`);
		}

		const { route, rawSegments, normalizedSegments, directory } = routeFromFile(sourcePath);
		const metadata = getContentMetadata(
			isRecord(module.metadata) ? module.metadata : {},
			rawSegments,
			sourcePath
		);
		const content = extractBodySource(raw);
		const kind = route.startsWith('/blog/') ? 'blog' : 'docs';
		const html = render(module.default).body;
		return {
			id: route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-|-$/g, ''),
			route,
			slug: normalizedSegments,
			segmentPath: rawSegments,
			sourcePath,
			sourceDirectory: directory,
			title: metadata.title,
			description: metadata.description ?? '',
			kind,
			date: metadata.date,
			authors: metadata.authors ?? [],
			tags: metadata.tags ?? [],
			excerpt: metadata.excerpt,
			template: metadata.template,
			hero: metadata.hero,
			section: metadata.section,
			sidebarOrder: metadata.sidebar?.order,
			sidebarGroup: metadata.sidebar?.group,
			sidebarBadge: metadata.sidebar?.badge,
			sidebarHidden: metadata.sidebar?.hidden,
			headingBadge: metadata.headingBadge,
			draft: metadata.draft,
			unlisted: metadata.unlisted,
			openapi: metadata.openapi,
			canonical: metadata.canonical,
			seo: metadata.seo,
			metadata,
			raw,
			content,
			html,
			plainText: stripHtml(html),
			headings: extractHeadingsFromHtml(html),
			readingTime: readingTime(content).text
		} satisfies ContentEntry;
	})
	.sort((a, b) => {
		if (a.kind === 'blog' && b.kind === 'blog') {
			return new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime();
		}
		return a.route.localeCompare(b.route);
	});

const publicEntries = entries.filter(isPublicEntry);
const listedEntries = publicEntries.filter(isListedEntry);
const routeMap = new Map(publicEntries.map((entry) => [entry.route, entry]));
const docsEntries = listedEntries.filter((entry) => entry.kind === 'docs' && entry.route !== '/');
const blogEntries = listedEntries.filter((entry) => entry.kind === 'blog');

function getSectionKey(entry: ContentEntry): SectionKey | undefined {
	const sectionKey = entry.slug[0];
	if (!sectionKey || !(sectionKey in SECTION_LABELS)) {
		return undefined;
	}

	return sectionKey as SectionKey;
}

function buildAutoSidebar() {
	const sectionEntries = docsEntries.reduce<Map<SectionKey, ContentEntry[]>>((map, entry) => {
		if (!isSidebarVisibleEntry(entry)) {
			return map;
		}

		const sectionKey = getSectionKey(entry);
		if (!sectionKey) {
			return map;
		}

		const entries = map.get(sectionKey);
		if (entries) {
			entries.push(entry);
		} else {
			map.set(sectionKey, [entry]);
		}

		return map;
	}, new Map());

	return (Object.entries(SECTION_LABELS) as Array<[SectionKey, string]>).flatMap(([sectionKey, label]) => {
		const items = sectionEntries
			.get(sectionKey)
			?.sort((a, b) => sortEntries(a, b, `/${sectionKey}/`));

		if (!items || items.length === 0) {
			return [];
		}

		return [
			{
				label,
				items: createSidebarItems(items, label)
			}
		];
	});
}

function flattenSidebar(nodes: SidebarNode[]): string[] {
	const flat: string[] = [];
	for (const node of nodes) {
		if (node.href) {
			flat.push(node.href);
		}
		if (node.items) {
			flat.push(...flattenSidebar(node.items));
		}
	}
	return flat;
}

const sidebarNodes = buildAutoSidebar();
const orderedDocsRoutes = flattenSidebar(sidebarNodes);

export const allEntries = publicEntries;
export const allDocsEntries = docsEntries;
export const allBlogEntries = blogEntries;
export const sidebar = sidebarNodes;
export const searchableEntries = listedEntries.filter((entry) => entry.route !== '/');

export function getEntryByRoute(route: string) {
	if (route === '/') {
		return routeMap.get(route);
	}

	const normalized = `/${route.replace(/^\/|\/$/g, '')}/`.replace(/\/\/+/, '/');
	return routeMap.get(normalized);
}

export function getHomeEntry() {
	const entry = routeMap.get('/');
	if (!entry) {
		throw new Error('Home entry not found');
	}
	return entry;
}

export function getPrevNext(entry: ContentEntry) {
	if (entry.kind === 'blog') {
		const index = blogEntries.findIndex((candidate) => candidate.route === entry.route);
		return {
			prev: index >= 0 ? blogEntries[index + 1] : undefined,
			next: index > 0 ? blogEntries[index - 1] : undefined
		};
	}

	const index = orderedDocsRoutes.findIndex((route) => route === entry.route);
	return {
		prev: index > 0 ? getEntryByRoute(orderedDocsRoutes[index - 1]) : undefined,
		next:
			index >= 0 && index < orderedDocsRoutes.length - 1
				? getEntryByRoute(orderedDocsRoutes[index + 1])
				: undefined
	};
}

export function getPrerenderEntries() {
	return publicEntries
		.filter((entry) => entry.route !== '/')
		.map((entry) => ({
			slug: entry.slug.join('/')
		}));
}

export function getBlogHighlights(limit = 6) {
	return blogEntries.slice(0, limit);
}
