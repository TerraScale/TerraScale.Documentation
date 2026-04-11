import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import { marked } from 'marked';
import readingTime from 'reading-time';
import { getIconMarkup } from '$lib/icons';
import { contentIconMap } from '$lib/ui/icons';
import type { ContentEntry, ContentMetadata, HeadingLink, SidebarNode } from './types';

type FrontmatterData = Record<string, unknown>;

const rawMap = import.meta.glob('/src/content/docs/**/*.{md,mdx,svx}', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const IGNORED_SOURCE_PATHS = new Set(['/src/content/docs/reference/api.mdx']);

const sidebarDefinition = [
	{ label: 'Guides', directory: 'guides' },
	{ label: 'Account', directory: 'account' },
	{
		label: 'Reference',
		items: [
			{ label: 'Authentication', href: '/reference/authentication/' },
			{ label: 'Multi-Factor Authentication', href: '/reference/mfa/' },
			{ label: 'Organizations', href: '/reference/organizations/' },
			{ label: 'API Reference', directory: 'reference/api' },
			{ label: 'Management API', directory: 'reference/management' },
			{ label: 'Regions', href: '/reference/regions/' },
			{ label: 'Plans', href: '/reference/plans/' },
			{ label: 'Billing', href: '/reference/billing/' },
			{ label: 'Rate Limits', href: '/reference/rate-limits/' },
			{ label: 'Error Handling', href: '/reference/error-handling/' },
			{ label: 'Data Models', href: '/reference/data-models/' },
			{ label: 'Best Practices', href: '/reference/best-practices/' }
		]
	},
	{ label: 'Dashboard', directory: 'dashboard' },
	{ label: 'Roadmap', directory: 'roadmap' },
	{ label: 'About', directory: 'about' }
] as const;

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
	const fileName = sourcePath.replace(/^.*\//, '').replace(/\.(md|mdx|svx)$/, '');
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
	const rel = filePath.replace('/src/content/docs/', '').replace(/\.(md|mdx|svx)$/, '');
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

function stripMarkdown(text: string) {
	return text
		.replace(/^import\s.+$/gm, '')
		.replace(/<style[\s\S]*?<\/style>/g, ' ')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/^:::.+$/gm, ' ')
		.replace(/^---$/gm, ' ')
		.replace(/[*_>#-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function escapeHtml(text: string) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

function parseExpression<T>(expression: string): T {
	return Function(`return (${expression});`)() as T;
}

function renderStaticTabs(expression: string) {
	const items = parseExpression<Array<{ label: string; content: string }>>(expression);
	const group = `group-${Math.random().toString(36).slice(2)}`;
	return `<div class="ts-tabs-static">${items
		.map(
			(item, index) =>
				`<button type="button" class="ts-tabs-static-trigger${index === 0 ? ' active' : ''}" data-tab-group="${group}" data-tab-index="${index}">${escapeHtml(item.label)}</button>`
		)
		.join('')}<div class="ts-tabs-static-panels" data-tab-group="${group}">${items
		.map(
			(item, index) =>
				`<section class="ts-tabs-static-panel${index === 0 ? ' active' : ''}" data-tab-index="${index}">${item.content}</section>`
		)
		.join('')}</div></div>`;
}

function renderStaticCardGrid(expression: string) {
	const items = parseExpression<Array<{ title: string; icon: string; content: string }>>(expression);
	return `<div class="ts-card-grid">${items
		.map(
			(item) => {
				const content = item.content.replace(
					/<pre><code>\[([^\]]+)\]\(([^)]+)\)\s*<\/code><\/pre>/g,
					'<p><a href="$2">$1</a></p>'
				);
				return `<article class="ts-card"><header><div class="ts-card-icon">${getIconMarkup(contentIconMap[item.icon] ?? 'file-text')}</div><h3>${escapeHtml(item.title)}</h3></header><div class="ts-card-body">${content}</div></article>`;
			}
		)
		.join('')}</div>`;
}

function renderFeatureGrid(expression: string) {
	const items = parseExpression<Array<{ icon: string; title: string; description: string }>>(expression);
	return `<div class="feature-grid">${items
		.map(
			(item) =>
				`<article class="feature-card"><div class="feature-icon">${getIconMarkup(contentIconMap[item.icon] ?? 'database')}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`
		)
		.join('')}</div>`;
}

function createBlockToken(index: number) {
	return `TS_BLOCK_${index}__`;
}

function transformMarkdown(content: string) {
	let next = content.replace(/^import\s.+$/gm, '').replace(/<style[\s\S]*?<\/style>/g, '');
	const blocks: string[] = [];
	const addBlock = (html: string) => {
		const token = createBlockToken(blocks.length);
		blocks.push(html);
		return token;
	};

	next = next.replace(/<Tabs items=\{([\s\S]*?)\}\s*\/>/g, (_, expression) =>
		addBlock(renderStaticTabs(expression))
	);
	next = next.replace(/<CardGrid items=\{([\s\S]*?)\}\s*\/>/g, (_, expression) =>
		addBlock(renderStaticCardGrid(expression))
	);
	next = next.replace(/<FeatureGrid features=\{([\s\S]*?)\}\s*\/>/g, (_, expression) =>
		addBlock(renderFeatureGrid(expression))
	);
	next = next.replace(/:::([a-z]+)(?:\[([^\]]+)\])?\n([\s\S]*?)\n:::/g, (_, kind, title, body) => {
		const html = String(marked.parse(body.trim(), { gfm: true })).trim();
		return `<div class="admonition admonition-${kind}"><p class="admonition-title">${escapeHtml(title || kind)}</p>${html}</div>`;
	});

	return { markdown: next, blocks };
}

function renderMarkdown(content: string) {
	const slugger = new GithubSlugger();
	const renderer = new marked.Renderer();

	renderer.heading = ({ tokens, depth }) => {
		const raw = tokens.map((token) => token.raw).join('');
		const text = raw.replace(/<[^>]+>/g, '').replace(/[*_`[\]]/g, '').trim();
		const slug = slugger.slug(text);
		const html = marked.parseInline(raw);
		return `<h${depth} id="${slug}">${html}<a aria-label="Link to section" class="heading-anchor" href="#${slug}">#</a></h${depth}>`;
	};

	renderer.link = ({ href, title, tokens }) => {
		const text = marked.parseInline(tokens.map((token) => token.raw).join(''));
		const attrs = title ? ` title="${escapeHtml(title)}"` : '';
		return `<a href="${href ?? '#'}"${attrs}>${text}</a>`;
	};

	const transformed = transformMarkdown(content);
	let html = marked.parse(transformed.markdown, {
		gfm: true,
		renderer
	}) as string;

	for (const [index, block] of transformed.blocks.entries()) {
		const token = createBlockToken(index);
		html = html.replace(new RegExp(`<p>${token}</p>`, 'g'), block).replace(new RegExp(token, 'g'), block);
	}

	return html;
}

function extractHeadings(markdown: string): HeadingLink[] {
	const slugger = new GithubSlugger();
	const headings: HeadingLink[] = [];

	for (const match of markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
		const depth = match[1].length;
		const text = match[2].replace(/<[^>]+>/g, '').replace(/[*_`[\]]/g, '').trim();
		headings.push({
			depth,
			slug: slugger.slug(text),
			text
		});
	}

	return headings;
}

function sortEntries(a: ContentEntry, b: ContentEntry) {
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
		href: entry.route
	};
}

function appendSidebarLeaf(nodes: SidebarNode[], entry: ContentEntry, fallbackSection?: string) {
	const section = entry.metadata.section?.trim();
	const group = entry.metadata.sidebar?.group?.trim();
	const groupPath = [section && section !== fallbackSection ? section : undefined, group].filter(
		(label): label is string => Boolean(label)
	);

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

const entries = Object.entries(rawMap)
	.filter(([sourcePath]) => !IGNORED_SOURCE_PATHS.has(sourcePath))
	.map(([sourcePath, raw]) => {
		const { data, content } = matter(raw);
		const { route, rawSegments, normalizedSegments, directory } = routeFromFile(sourcePath);
		const metadata = getContentMetadata((isRecord(data) ? data : {}) as FrontmatterData, rawSegments, sourcePath);
		const kind = route.startsWith('/blog/') ? 'blog' : 'docs';

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
			html: renderMarkdown(content),
			plainText: stripMarkdown(content),
			headings: extractHeadings(content),
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

function listDirectoryEntries(directory: string) {
	return docsEntries
		.filter(
			(entry) =>
				entry.route.startsWith(`/${directory.toLowerCase()}/`) && isSidebarVisibleEntry(entry)
		)
		.sort(sortEntries);
}

function buildSidebarNodes(
	definition: ReadonlyArray<
		| { label: string; directory: string }
		| {
				label: string;
				items: ReadonlyArray<{ label: string; href: string } | { label: string; directory: string }>;
		  }
	>
): SidebarNode[] {
	return definition.map((item) => {
		if ('directory' in item) {
			const items = createSidebarItems(listDirectoryEntries(item.directory), item.label);
			return {
				label: item.label,
				items
			};
		}

		return {
			label: item.label,
			items: item.items.map((child) => {
				if ('directory' in child) {
					const items = createSidebarItems(listDirectoryEntries(child.directory), child.label);
					return {
						label: child.label,
						items
					};
				}

				return {
					label: child.label,
					href: child.href
				};
			})
		};
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

const sidebarNodes = buildSidebarNodes(sidebarDefinition);
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

	const normalized = `/${route.replace(/^\/|\/$/g, '')}/`.replace(/\/\/+/g, '/');
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
