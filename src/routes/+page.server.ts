import { getHomeEntry } from '$lib/content';

export function load() {
	return {
		entry: getHomeEntry()
	};
}
