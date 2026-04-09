import { getBlogHighlights, getHomeEntry } from '$lib/content';

export function load() {
	return {
		entry: getHomeEntry(),
		blogHighlights: getBlogHighlights(3)
	};
}
