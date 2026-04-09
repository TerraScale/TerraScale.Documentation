import { allEntries } from '$lib/content';

export const prerender = true;

export function GET() {
	const baseUrl = 'https://docs.terrascale.tech';
	const urls = allEntries
		.map((entry) => `<url><loc>${baseUrl}${entry.route}</loc></url>`)
		.join('');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
		{
			headers: {
				'content-type': 'application/xml'
			}
		}
	);
}
