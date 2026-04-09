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
	badge?: BadgeMeta;
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

export interface ContentMetadata {
	title: string;
	description?: string;
	sidebar?: SidebarMeta;
	template?: string;
	hero?: HeroMeta;
	date?: string;
	authors?: Array<{ name: string; title?: string; url?: string }>;
	tags?: string[];
	excerpt?: string;
	order?: number;
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
	sidebarOrder?: number;
	sidebarBadge?: BadgeMeta;
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
}
