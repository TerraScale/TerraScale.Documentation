import { allBlogEntries } from '$lib/content';

export const prerender = true;

function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

export function GET() {
	const baseUrl = 'https://docs.terrascale.tech';
	const items = allBlogEntries
		.map((entry) => {
			const title = escapeXml(entry.title);
			const description = escapeXml(entry.description || entry.excerpt || '');
			const link = `${baseUrl}${entry.route}`;
			const pubDate = entry.date ? new Date(entry.date).toUTCString() : undefined;

			return `<item><title>${title}</title><link>${link}</link><guid>${link}</guid>${description ? `<description>${description}</description>` : ''}${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}</item>`;
		})
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>TerraScale Blog</title><link>${baseUrl}/blog/</link><description>Engineering stories, tutorials, and product updates from TerraScale.</description>${items}</channel></rss>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/rss+xml; charset=utf-8'
		}
	});
}
