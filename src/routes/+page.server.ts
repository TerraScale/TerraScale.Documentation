import { getHomeEntry } from '$lib/content';

export function load() {
	const entry = getHomeEntry();
	return {
		entry: {
			title: entry.title,
			description: entry.description
		}
	};
}
