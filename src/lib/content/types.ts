export type ContentKind = 'docs' | 'blog';

export interface HeadingLink {
	depth: number;
	slug: string;
	text: string;
}

export interface BadgeMeta {
	text: string;
	variant?: string;
}

export interface SidebarMeta {
	order?: number;
	group?: string;
	badge?: BadgeMeta;
	hidden?: boolean;
}

export interface HeroAction {
	text: string;
	link: string;
	icon?: string;
	variant?: string;
}

export interface HeroMeta {
	tagline?: string;
	actions?: HeroAction[];
}

export interface OpenApiMeta {
	spec?: string;
	tag?: string;
}

export interface SeoMeta {
	title?: string;
	description?: string;
	image?: string;
	noindex?: boolean;
}

export interface ContentMetadata {
	title: string;
	description?: string;
	draft?: boolean;
	unlisted?: boolean;
	section?: string;
	sidebar?: SidebarMeta;
	headingBadge?: BadgeMeta;
	template?: string;
	hero?: HeroMeta;
	date?: string;
	authors?: Array<{ name: string; title?: string; url?: string }>;
	tags?: string[];
	excerpt?: string;
	order?: number;
	openapi?: OpenApiMeta;
	canonical?: string;
	seo?: SeoMeta;
}

export interface ContentEntry {
	id: string;
	route: string;
	slug: string[];
	segmentPath: string[];
	sourcePath: string;
	sourceDirectory: string;
	title: string;
	description: string;
	kind: ContentKind;
	date?: string;
	authors?: Array<{ name: string; title?: string; url?: string }>;
	tags: string[];
	excerpt?: string;
	template?: string;
	hero?: HeroMeta;
	section?: string;
	sidebarOrder?: number;
	sidebarGroup?: string;
	sidebarBadge?: BadgeMeta;
	sidebarHidden?: boolean;
	headingBadge?: BadgeMeta;
	draft?: boolean;
	unlisted?: boolean;
	openapi?: OpenApiMeta;
	canonical?: string;
	seo?: SeoMeta;
	metadata: ContentMetadata;
	raw: string;
	content: string;
	html: string;
	plainText: string;
	headings: HeadingLink[];
	readingTime: string;
}

export interface SidebarNode {
	label: string;
	href?: string;
	items?: SidebarNode[];
	badge?: BadgeMeta;
}
