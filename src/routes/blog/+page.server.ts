import { allBlogEntries } from '$lib/content';

export function load() {
	return {
		posts: allBlogEntries
	};
}
