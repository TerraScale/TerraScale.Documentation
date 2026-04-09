import fs from 'node:fs/promises';
import path from 'node:path';
import { iconManifest } from './icons-manifest.mjs';

const repoRoot = process.cwd();
const publicDir = path.join(repoRoot, 'public/icons');
const staticDir = path.join(repoRoot, 'static/icons');
const generatedFile = path.join(repoRoot, 'src/lib/icons.generated.ts');

async function loadCollection(prefix) {
	const file = path.join(repoRoot, 'node_modules/@iconify/json/json', `${prefix}.json`);
	return JSON.parse(await fs.readFile(file, 'utf8'));
}

function renderSvg(iconSet, name) {
	const icon = iconSet.icons[name];
	if (!icon) {
		throw new Error(`Icon ${name} not found in ${iconSet.prefix}`);
	}

	const width = icon.width ?? iconSet.width ?? 24;
	const height = icon.height ?? iconSet.height ?? 24;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${icon.body}</svg>`;
}

const collections = new Map();
const generated = [];

await fs.mkdir(publicDir, { recursive: true });
await fs.mkdir(staticDir, { recursive: true });

for (const entry of iconManifest) {
	const [prefix, iconName] = entry.source.split(':');
	if (!collections.has(prefix)) {
		collections.set(prefix, await loadCollection(prefix));
	}

	const svg = renderSvg(collections.get(prefix), iconName)
		.replace(/\s+/g, ' ')
		.replace(/>\s+</g, '><')
		.trim();

	await fs.writeFile(path.join(publicDir, `${entry.name}.svg`), `${svg}\n`);
	await fs.writeFile(path.join(staticDir, `${entry.name}.svg`), `${svg}\n`);
	generated.push(`\t'${entry.name}': ${JSON.stringify(svg)}`);
}

const fileContents = `export const icons = {\n${generated.join(',\n')}\n} as const;\n\nexport type IconName = keyof typeof icons;\n`;
await fs.writeFile(generatedFile, fileContents);
