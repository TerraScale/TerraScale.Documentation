import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BUILD_DIR = path.resolve(process.cwd(), 'build');
const LOCALE_PREFIXES = new Set(['en', 'es', 'pt-br']);
const EXCLUDED_DIRECTORIES = new Set(['pagefind']);

function walkForIndexHtml(directory, relativeDirectory = '') {
	const entries = fs.readdirSync(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		if (entry.isDirectory()) {
			if (EXCLUDED_DIRECTORIES.has(entry.name)) {
				continue;
			}

			const nextRelativeDirectory = path.posix.join(relativeDirectory, entry.name);
			files.push(...walkForIndexHtml(path.join(directory, entry.name), nextRelativeDirectory));
			continue;
		}

		if (entry.name !== 'index.html') {
			continue;
		}

		files.push(path.posix.join(relativeDirectory, entry.name));
	}

	return files;
}

function normalizeRoute(indexFilePath) {
	const segments = indexFilePath.split('/').filter(Boolean);
	const directorySegments = segments.slice(0, -1);

	if (directorySegments.length === 0) {
		return { locale: 'default', route: '/' };
	}

	const [firstSegment, ...rest] = directorySegments;

	if (LOCALE_PREFIXES.has(firstSegment)) {
		const routeSegments = [firstSegment, ...rest];
		return {
			locale: firstSegment,
			route: `/${routeSegments.join('/')}/`
		};
	}

	return {
		locale: 'default',
		route: `/${directorySegments.join('/')}/`
	};
}

export function getRoutes(buildDir = BUILD_DIR) {
	if (!fs.existsSync(buildDir)) {
		throw new Error(`Build directory not found: ${buildDir}`);
	}

	const groupedRoutes = {
		default: [],
		en: [],
		es: [],
		'pt-br': []
	};
	const indexFiles = walkForIndexHtml(buildDir);

	for (const indexFile of indexFiles) {
		const { locale, route } = normalizeRoute(indexFile);
		const localeRoutes = groupedRoutes[locale] ?? [];
		localeRoutes.push(route);
		groupedRoutes[locale] = localeRoutes;
	}

	for (const locale of Object.keys(groupedRoutes)) {
		groupedRoutes[locale] = [...new Set(groupedRoutes[locale])].sort((left, right) =>
			left.localeCompare(right)
		);
	}

	return groupedRoutes;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	process.stdout.write(`${JSON.stringify(getRoutes(), null, 2)}\n`);
}
