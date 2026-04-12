import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const publicDir = path.join(repoRoot, 'public');
const staticDir = path.join(repoRoot, 'static');

const managedEntries = [
	'_redirects',
	'robots.txt',
	'favicon.svg',
	'icon-black.svg',
	'icon-blue.svg',
	'icon-white.svg',
	'logo-black.svg',
	'logo-blue.svg',
	'logo-principal.svg',
	'logo-white.svg',
	'fonts',
	'icons'
];

async function pathExists(target) {
	try {
		await fs.access(target);
		return true;
	} catch {
		return false;
	}
}

async function removeTarget(target) {
	if (await pathExists(target)) {
		await fs.rm(target, { recursive: true, force: true });
	}
}

async function syncFile(source, target) {
	await fs.mkdir(path.dirname(target), { recursive: true });
	await fs.copyFile(source, target);
}

async function syncDirectory(source, target) {
	await fs.mkdir(target, { recursive: true });

	const [sourceEntries, targetEntries] = await Promise.all([
		fs.readdir(source, { withFileTypes: true }),
		fs.readdir(target, { withFileTypes: true })
	]);

	const sourceNames = new Set(sourceEntries.map((entry) => entry.name));

	for (const entry of targetEntries) {
		if (!sourceNames.has(entry.name)) {
			await fs.rm(path.join(target, entry.name), { recursive: true, force: true });
		}
	}

	for (const entry of sourceEntries) {
		const sourcePath = path.join(source, entry.name);
		const targetPath = path.join(target, entry.name);

		if (entry.isDirectory()) {
			await syncDirectory(sourcePath, targetPath);
			continue;
		}

		await syncFile(sourcePath, targetPath);
	}
}

for (const entry of managedEntries) {
	const sourcePath = path.join(publicDir, entry);
	const targetPath = path.join(staticDir, entry);

	if (!(await pathExists(sourcePath))) {
		await removeTarget(targetPath);
		continue;
	}

	const stats = await fs.stat(sourcePath);
	if (stats.isDirectory()) {
		await syncDirectory(sourcePath, targetPath);
		continue;
	}

	await syncFile(sourcePath, targetPath);
}
