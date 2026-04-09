import { searchableEntries } from '$lib/content';

export const prerender = true;

export function GET() {
	return Response.json(
		searchableEntries.map((entry) => ({
			id: entry.id,
			route: entry.route,
			title: entry.title,
			description: entry.description,
			kind: entry.kind,
			section: entry.slug[0] ?? 'home',
			excerpt: entry.plainText.slice(0, 220),
			body: entry.plainText.toLowerCase()
		}))
	);
}
