import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const outputDir = path.join(rootDir, 'static', 'images', 'blog');

const canvases = {
	wide: { width: 1600, height: 900 },
	square: { width: 1200, height: 1200 }
};

const posts = [
	{
		slug: 'introducing-terrascale',
		motif: 'horizon',
		accent: '#60a5fa',
		accentSoft: '#22d3ee',
		finalVariant: 2,
		alt: 'Illuminated horizon lines and a rising beacon suggesting a new global data platform emerging from darkness.'
	},
	{
		slug: 'why-we-built-terrascale',
		motif: 'fracture',
		accent: '#93c5fd',
		accentSoft: '#38bdf8',
		finalVariant: 3,
		alt: 'Two dark structural plates split and rejoined by a precise electric seam, evoking a painful infrastructure redesign.'
	},
	{
		slug: 'getting-started-5-minutes',
		motif: 'steps',
		accent: '#60a5fa',
		accentSoft: '#34d399',
		finalVariant: 1,
		alt: 'A sequence of clean illuminated steps leading toward a ready-state portal, representing a fast getting-started path.'
	},
	{
		slug: 'understanding-partition-keys',
		motif: 'shelves',
		accent: '#7dd3fc',
		accentSoft: '#60a5fa',
		finalVariant: 0,
		alt: 'Ordered shelves and compartments with one highlighted retrieval path, visualizing partition and sort key logic.'
	},
	{
		slug: 'migrating-from-dynamodb',
		motif: 'bridge',
		accent: '#60a5fa',
		accentSoft: '#2dd4bf',
		finalVariant: 2,
		alt: 'Two structured data systems connected by a calm transfer bridge, representing migration from one platform to another.'
	},
	{
		slug: 'building-realtime-leaderboard',
		motif: 'pillars',
		accent: '#38bdf8',
		accentSoft: '#60a5fa',
		finalVariant: 1,
		alt: 'Tall ranked pillars with disciplined motion streaks, suggesting a fast real-time gaming leaderboard.'
	},
	{
		slug: 'how-we-achieve-global-latency',
		motif: 'globe',
		accent: '#60a5fa',
		accentSoft: '#22d3ee',
		finalVariant: 0,
		alt: 'A sparse abstract globe with a few bright low-latency routes connecting distant regions.'
	},
	{
		slug: 'announcing-csharp-sdk',
		motif: 'sdk',
		accent: '#93c5fd',
		accentSoft: '#22d3ee',
		finalVariant: 2,
		alt: 'Precise bracketed engineering forms and modular nodes, evoking a polished new SDK release.'
	},
	{
		slug: 'sql-api-for-everyone',
		motif: 'sql',
		accent: '#7dd3fc',
		accentSoft: '#60a5fa',
		finalVariant: 3,
		alt: 'Architectural table planes and elegant query lines that suggest structured access through SQL.'
	},
	{
		slug: 'cost-optimization-tips',
		motif: 'compression',
		accent: '#34d399',
		accentSoft: '#60a5fa',
		finalVariant: 1,
		alt: 'Compressed layers and trimmed bands balancing neatly around a core, representing database cost optimization.'
	},
	{
		slug: 'transactions-deep-dive',
		motif: 'atomic',
		accent: '#60a5fa',
		accentSoft: '#34d399',
		finalVariant: 2,
		alt: 'Two bright atomic forms locked in a balanced frame, expressing precise all-or-nothing transactions.'
	},
	{
		slug: 'multi-region-setup',
		motif: 'replication',
		accent: '#60a5fa',
		accentSoft: '#22d3ee',
		finalVariant: 0,
		alt: 'Mirrored region clusters connected by measured replication lines, illustrating a multi-region setup.'
	},
	{
		slug: 'security-best-practices',
		motif: 'shield',
		accent: '#93c5fd',
		accentSoft: '#34d399',
		finalVariant: 3,
		alt: 'Layered shield geometry and guarded perimeter nodes, conveying enterprise-grade database security.'
	}
];

const variants = ['a', 'b', 'c', 'd'];

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function hash(input) {
	let value = 1779033703 ^ input.length;
	for (let index = 0; index < input.length; index += 1) {
		value = Math.imul(value ^ input.charCodeAt(index), 3432918353);
		value = (value << 13) | (value >>> 19);
	}

	return () => {
		value = Math.imul(value ^ (value >>> 16), 2246822507);
		value = Math.imul(value ^ (value >>> 13), 3266489909);
		value ^= value >>> 16;
		return value >>> 0;
	};
}

function createRandom(seed) {
	let state = hash(seed)();
	return () => {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let result = Math.imul(state ^ (state >>> 15), 1 | state);
		result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
		return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
	};
}

function round(value) {
	return Number(value.toFixed(2));
}

function point(x, y) {
	return `${round(x)} ${round(y)}`;
}

function polygon(points, attrs = '') {
	return `<polygon points="${points.map(([x, y]) => point(x, y)).join(' ')}" ${attrs}/>`;
}

function polyline(points, attrs = '') {
	return `<polyline points="${points.map(([x, y]) => point(x, y)).join(' ')}" ${attrs}/>`;
}

function line(x1, y1, x2, y2, attrs = '') {
	return `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" ${attrs}/>`;
}

function rect(x, y, width, height, attrs = '') {
	return `<rect x="${round(x)}" y="${round(y)}" width="${round(width)}" height="${round(height)}" ${attrs}/>`;
}

function circle(cx, cy, radius, attrs = '') {
	return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(radius)}" ${attrs}/>`;
}

function ellipse(cx, cy, rx, ry, attrs = '') {
	return `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(rx)}" ry="${round(ry)}" ${attrs}/>`;
}

function pathElement(d, attrs = '') {
	return `<path d="${d}" ${attrs}/>`;
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
	const start = polar(cx, cy, radius, startAngle);
	const end = polar(cx, cy, radius, endAngle);
	const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
	const sweepFlag = endAngle > startAngle ? 1 : 0;
	return `M ${point(start.x, start.y)} A ${round(radius)} ${round(radius)} 0 ${largeArcFlag} ${sweepFlag} ${point(end.x, end.y)}`;
}

function polar(cx, cy, radius, angle) {
	const radians = ((angle - 90) * Math.PI) / 180;
	return {
		x: cx + radius * Math.cos(radians),
		y: cy + radius * Math.sin(radians)
	};
}

function wavePath(width, baseline, amplitude, offset, peaks = 4) {
	let d = `M 0 ${round(baseline)}`;
	for (let index = 0; index < peaks; index += 1) {
		const step = width / peaks;
		const startX = index * step;
		const endX = startX + step;
		const midX = startX + step / 2;
		const swing = amplitude * (index % 2 === 0 ? 1 : -1);
		d += ` C ${round(startX + step * 0.25)} ${round(baseline + swing * 0.65 + offset)} ${round(midX - step * 0.12)} ${round(baseline + swing + offset)} ${round(midX)} ${round(baseline + swing + offset)}`;
		d += ` C ${round(midX + step * 0.12)} ${round(baseline + swing + offset)} ${round(endX - step * 0.25)} ${round(baseline - swing * 0.65 + offset)} ${round(endX)} ${round(baseline)}`;
	}
	return d;
}

function buildDefs(key, post, canvas, variantIndex, finalImage) {
	const glowX = [0.2, 0.78, 0.52, 0.35][variantIndex] * canvas.width;
	const glowY = [0.18, 0.24, 0.7, 0.5][variantIndex] * canvas.height;
	const glowRadius = finalImage ? 0.56 : 0.48;

	return `
<defs>
	<linearGradient id="bg-${key}" x1="0%" y1="0%" x2="100%" y2="100%">
		<stop offset="0%" stop-color="#04070c"/>
		<stop offset="42%" stop-color="#07111d"/>
		<stop offset="100%" stop-color="#030509"/>
	</linearGradient>
	<radialGradient id="glow-${key}" cx="${round(glowX / canvas.width)}" cy="${round(glowY / canvas.height)}" r="${glowRadius}">
		<stop offset="0%" stop-color="${post.accent}" stop-opacity="${finalImage ? 0.22 : 0.18}"/>
		<stop offset="48%" stop-color="${post.accentSoft}" stop-opacity="${finalImage ? 0.12 : 0.08}"/>
		<stop offset="100%" stop-color="#05070c" stop-opacity="0"/>
	</radialGradient>
	<linearGradient id="panel-${key}" x1="0%" y1="0%" x2="100%" y2="100%">
		<stop offset="0%" stop-color="#0d1726" stop-opacity="0.94"/>
		<stop offset="100%" stop-color="#08101b" stop-opacity="0.58"/>
	</linearGradient>
	<linearGradient id="edge-${key}" x1="0%" y1="0%" x2="100%" y2="0%">
		<stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
		<stop offset="50%" stop-color="#ffffff" stop-opacity="${finalImage ? 0.18 : 0.12}"/>
		<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
	</linearGradient>
	<pattern id="grid-${key}" width="${round(canvas.width / 12)}" height="${round(canvas.height / 10)}" patternUnits="userSpaceOnUse">
		<path d="M ${round(canvas.width / 12)} 0 L 0 0 0 ${round(canvas.height / 10)}" fill="none" stroke="${post.accent}" stroke-opacity="0.08" stroke-width="1"/>
	</pattern>
</defs>`;
}

function buildFrame(canvas, key) {
	const inset = Math.min(canvas.width, canvas.height) * 0.035;
	const tick = inset * 0.7;

	return `
	${rect(0, 0, canvas.width, canvas.height, `fill="url(#bg-${key})"`)}
	${rect(0, 0, canvas.width, canvas.height, `fill="url(#glow-${key})"`)}
	${rect(0, 0, canvas.width, canvas.height, `fill="url(#grid-${key})" opacity="0.42"`)}
	${rect(inset, inset, canvas.width - inset * 2, canvas.height - inset * 2, `rx="${round(inset * 0.9)}" fill="none" stroke="rgba(148,163,184,0.16)" stroke-width="1.5"`)}
	${line(inset, inset + tick, inset, inset, `stroke="rgba(255,255,255,0.24)" stroke-width="2"`)}
	${line(inset, inset, inset + tick, inset, `stroke="rgba(255,255,255,0.24)" stroke-width="2"`)}
	${line(canvas.width - inset - tick, inset, canvas.width - inset, inset, `stroke="rgba(255,255,255,0.24)" stroke-width="2"`)}
	${line(canvas.width - inset, inset, canvas.width - inset, inset + tick, `stroke="rgba(255,255,255,0.24)" stroke-width="2"`)}
	${line(inset, canvas.height - inset - tick, inset, canvas.height - inset, `stroke="rgba(255,255,255,0.24)" stroke-width="2"`)}
	${line(inset, canvas.height - inset, inset + tick, canvas.height - inset, `stroke="rgba(255,255,255,0.24)" stroke-width="2"`)}
	${line(canvas.width - inset - tick, canvas.height - inset, canvas.width - inset, canvas.height - inset, `stroke="rgba(255,255,255,0.24)" stroke-width="2"`)}
	${line(canvas.width - inset, canvas.height - inset - tick, canvas.width - inset, canvas.height - inset, `stroke="rgba(255,255,255,0.24)" stroke-width="2"`)}
	${rect(inset * 1.45, inset * 1.45, canvas.width - inset * 2.9, canvas.height - inset * 2.9, `rx="${round(inset * 0.75)}" fill="none" stroke="url(#edge-${key})" stroke-width="1"`)}
`;
}

function buildNoise(canvas, seed, post, finalImage) {
	const random = createRandom(seed);
	const count = finalImage ? 22 : 16;
	let shapes = '';

	for (let index = 0; index < count; index += 1) {
		const x = random() * canvas.width;
		const y = random() * canvas.height;
		const radius = 1 + random() * (finalImage ? 2.4 : 1.8);
		const opacity = 0.08 + random() * 0.16;
		shapes += circle(x, y, radius, `fill="${index % 3 === 0 ? post.accentSoft : '#f8fafc'}" opacity="${round(opacity)}"`);
	}

	return `<g>${shapes}</g>`;
}

function drawHorizon(canvas, post, variantIndex, finalImage) {
	const baseline = canvas.height * [0.7, 0.62, 0.72, 0.66][variantIndex];
	const amplitude = canvas.height * (finalImage ? 0.058 : 0.046);
	const beaconX = canvas.width * [0.24, 0.76, 0.5, 0.36][variantIndex];
	let content = '';

	for (let index = 0; index < 5; index += 1) {
		const y = baseline + index * canvas.height * 0.04;
		content += pathElement(
			`${wavePath(canvas.width, y, amplitude + index * 8, index * -2)} L ${canvas.width} ${canvas.height} L 0 ${canvas.height} Z`,
			`fill="${index === 0 ? 'rgba(10,17,28,0.76)' : '#09101a'}" fill-opacity="${round(0.1 + index * 0.06)}" stroke="${post.accent}" stroke-opacity="${round(0.22 - index * 0.03)}" stroke-width="${round(1.4 - index * 0.12)}"`
		);
	}

	content += line(beaconX, baseline - canvas.height * 0.16, beaconX, baseline + canvas.height * 0.08, `stroke="${post.accentSoft}" stroke-width="${finalImage ? 4 : 3}" stroke-linecap="round" opacity="0.95"`);
	content += circle(beaconX, baseline - canvas.height * 0.16, finalImage ? 10 : 8, `fill="${post.accentSoft}" opacity="0.95"`);
	content += circle(beaconX, baseline - canvas.height * 0.16, finalImage ? 34 : 26, `fill="none" stroke="${post.accent}" stroke-opacity="0.38" stroke-width="1.4"`);
	return content;
}

function drawFracture(canvas, post, variantIndex, finalImage) {
	const gapX = canvas.width * [0.54, 0.47, 0.6, 0.5][variantIndex];
	const split = [
		[gapX - 88, canvas.height * 0.18],
		[gapX - 18, canvas.height * 0.33],
		[gapX - 58, canvas.height * 0.5],
		[gapX + 12, canvas.height * 0.67],
		[gapX - 24, canvas.height * 0.83]
	];
	const leftPanel = [
		[canvas.width * 0.12, canvas.height * 0.16],
		[gapX - 130, canvas.height * 0.2],
		...split.map(([x, y]) => [x - 18, y]),
		[canvas.width * 0.18, canvas.height * 0.86]
	];
	const rightPanel = [
		[gapX + 124, canvas.height * 0.18],
		[canvas.width * 0.87, canvas.height * 0.14],
		[canvas.width * 0.82, canvas.height * 0.86],
		...split.slice().reverse().map(([x, y]) => [x + 18, y])
	];

	let content = polygon(leftPanel, `fill="rgba(10,17,28,0.72)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"`);
	content += polygon(rightPanel, `fill="rgba(10,17,28,0.72)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"`);
	content += polyline(split, `fill="none" stroke="${post.accentSoft}" stroke-width="${finalImage ? 5 : 4}" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"`);
	content += polyline(split.map(([x, y], index) => [x + (index % 2 === 0 ? 18 : -18), y]), `fill="none" stroke="${post.accent}" stroke-width="1.5" stroke-dasharray="10 10" stroke-opacity="0.48"`);
	return content;
}

function drawSteps(canvas, post, variantIndex, finalImage) {
	const depth = canvas.height * [0.75, 0.7, 0.74, 0.78][variantIndex];
	const left = canvas.width * [0.16, 0.2, 0.12, 0.18][variantIndex];
	const right = canvas.width * [0.82, 0.76, 0.86, 0.79][variantIndex];
	const portalY = canvas.height * 0.22;
	let content = '';

	for (let index = 0; index < 5; index += 1) {
		const inset = index * 56;
		const topY = depth - index * 82;
		content += polygon(
			[
				[left + inset, topY],
				[right - inset, topY],
				[right - inset - 46, topY + 42],
				[left + inset + 46, topY + 42]
			],
			`fill="rgba(10,17,28,0.72)" stroke="rgba(255,255,255,0.1)" stroke-width="1.25"`
		);
	}

	content += rect(canvas.width * 0.41, portalY, canvas.width * 0.18, canvas.height * 0.2, `rx="24" fill="none" stroke="${post.accentSoft}" stroke-width="${finalImage ? 4 : 3}" opacity="0.9"`);
	content += pathElement(`M ${point(canvas.width * 0.5, portalY + canvas.height * 0.2)} L ${point(canvas.width * 0.5, depth - 12)}`, `fill="none" stroke="${post.accent}" stroke-width="2" stroke-dasharray="8 12" stroke-opacity="0.6"`);
	return content;
}

function drawShelves(canvas, post, variantIndex, finalImage) {
	const columns = 5;
	const rows = 4;
	const frameX = canvas.width * [0.16, 0.12, 0.2, 0.18][variantIndex];
	const frameY = canvas.height * [0.18, 0.14, 0.2, 0.22][variantIndex];
	const frameWidth = canvas.width * 0.68;
	const frameHeight = canvas.height * 0.56;
	let content = rect(frameX, frameY, frameWidth, frameHeight, `rx="28" fill="rgba(9,16,26,0.55)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"`);

	for (let column = 1; column < columns; column += 1) {
		const x = frameX + (frameWidth / columns) * column;
		content += line(x, frameY, x, frameY + frameHeight, `stroke="rgba(148,163,184,0.22)" stroke-width="1"`);
	}

	for (let row = 1; row < rows; row += 1) {
		const y = frameY + (frameHeight / rows) * row;
		content += line(frameX, y, frameX + frameWidth, y, `stroke="rgba(148,163,184,0.22)" stroke-width="1"`);
	}

	const pathPoints = [
		[frameX + frameWidth * 0.1, frameY + frameHeight * 0.2],
		[frameX + frameWidth * 0.1, frameY + frameHeight * 0.72],
		[frameX + frameWidth * 0.53, frameY + frameHeight * 0.72],
		[frameX + frameWidth * 0.53, frameY + frameHeight * 0.42],
		[frameX + frameWidth * 0.84, frameY + frameHeight * 0.42]
	];

	content += polyline(pathPoints, `fill="none" stroke="${post.accentSoft}" stroke-width="${finalImage ? 5 : 4}" stroke-linecap="round" stroke-linejoin="round"`);
	pathPoints.forEach(([x, y], index) => {
		content += circle(x, y, index === pathPoints.length - 1 ? 8 : 6, `fill="${index === pathPoints.length - 1 ? post.accentSoft : post.accent}" opacity="0.95"`);
	});
	return content;
}

function drawBridge(canvas, post, variantIndex, finalImage) {
	const leftX = canvas.width * [0.1, 0.08, 0.14, 0.12][variantIndex];
	const rightX = canvas.width * [0.68, 0.7, 0.64, 0.66][variantIndex];
	const topY = canvas.height * 0.25;
	const blockWidth = canvas.width * 0.22;
	const blockHeight = canvas.height * 0.42;
	let content = rect(leftX, topY, blockWidth, blockHeight, `rx="26" fill="rgba(10,17,28,0.72)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"`);
	content += rect(rightX, topY, blockWidth, blockHeight, `rx="26" fill="rgba(10,17,28,0.72)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"`);

	for (let index = 0; index < 3; index += 1) {
		const y = topY + 74 + index * 86;
		content += line(leftX + 48, y, leftX + blockWidth - 48, y, `stroke="${post.accent}" stroke-opacity="0.24" stroke-width="2"`);
		content += line(rightX + 48, y, rightX + blockWidth - 48, y, `stroke="${post.accent}" stroke-opacity="0.24" stroke-width="2"`);
	}

	const transfer = `M ${point(leftX + blockWidth, topY + blockHeight * 0.48)} C ${point(canvas.width * 0.46, topY + blockHeight * 0.2)} ${point(canvas.width * 0.54, topY + blockHeight * 0.76)} ${point(rightX, topY + blockHeight * 0.48)}`;
	content += pathElement(transfer, `fill="none" stroke="${post.accentSoft}" stroke-width="${finalImage ? 6 : 5}" stroke-linecap="round" opacity="0.95"`);
	content += pathElement(transfer, `fill="none" stroke="${post.accent}" stroke-width="12" stroke-opacity="0.08" stroke-linecap="round"`);
	return content;
}

function drawPillars(canvas, post, variantIndex, finalImage) {
	const originX = canvas.width * [0.18, 0.14, 0.2, 0.22][variantIndex];
	const baseY = canvas.height * 0.76;
	const width = canvas.width * 0.08;
	const gap = canvas.width * 0.06;
	const heights = [
		[0.18, 0.32, 0.58, 0.44, 0.72],
		[0.2, 0.48, 0.66, 0.38, 0.56],
		[0.28, 0.52, 0.46, 0.7, 0.36],
		[0.16, 0.44, 0.62, 0.54, 0.76]
	][variantIndex];
	let content = '';

	heights.forEach((heightFactor, index) => {
		const x = originX + index * (width + gap);
		const height = canvas.height * heightFactor;
		content += rect(x, baseY - height, width, height, `rx="22" fill="rgba(8,16,28,0.76)" stroke="rgba(255,255,255,0.1)" stroke-width="1.25"`);
		content += rect(x + 10, baseY - height + 12, width - 20, height - 24, `rx="16" fill="${index === 2 ? post.accentSoft : post.accent}" opacity="${index === 2 ? 0.24 : 0.12}"`);
		if (index >= 2 || finalImage) {
			content += line(x + width * 0.5, baseY - height - 18, x + width * 0.5 + canvas.width * 0.09, baseY - height - canvas.height * 0.12, `stroke="${post.accentSoft}" stroke-width="2" stroke-opacity="0.55" stroke-linecap="round"`);
		}
	});

	return content;
}

function drawGlobe(canvas, post, variantIndex, finalImage) {
	const cx = canvas.width * [0.52, 0.5, 0.46, 0.58][variantIndex];
	const cy = canvas.height * [0.48, 0.5, 0.52, 0.46][variantIndex];
	const radius = Math.min(canvas.width, canvas.height) * 0.22;
	let content = circle(cx, cy, radius, `fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1.4"`);
	content += ellipse(cx, cy, radius * 0.62, radius, `fill="none" stroke="rgba(148,163,184,0.18)" stroke-width="1"`);
	content += ellipse(cx, cy, radius * 0.28, radius, `fill="none" stroke="rgba(148,163,184,0.18)" stroke-width="1"`);
	content += line(cx - radius, cy, cx + radius, cy, `stroke="rgba(148,163,184,0.18)" stroke-width="1"`);
	content += line(cx, cy - radius, cx, cy + radius, `stroke="rgba(148,163,184,0.18)" stroke-width="1"`);

	const arcs = [
		[cx - radius * 0.72, cy + radius * 0.18, cx + radius * 0.52, cy - radius * 0.5],
		[cx - radius * 0.22, cy + radius * 0.72, cx + radius * 0.84, cy - radius * 0.12],
		[cx - radius * 0.86, cy - radius * 0.08, cx + radius * 0.08, cy + radius * 0.78]
	];

	arcs.forEach(([x1, y1, x2, y2], index) => {
		content += pathElement(`M ${point(x1, y1)} Q ${point(cx + (index - 1) * radius * 0.2, cy - radius * 0.92)} ${point(x2, y2)}`, `fill="none" stroke="${index === 1 ? post.accentSoft : post.accent}" stroke-width="${finalImage ? 4 : 3}" stroke-linecap="round" opacity="0.88"`);
		content += circle(x1, y1, 5, `fill="${post.accent}" opacity="0.92"`);
		content += circle(x2, y2, 6, `fill="${post.accentSoft}" opacity="0.95"`);
	});

	return content;
}

function drawSdk(canvas, post, variantIndex, finalImage) {
	const cx = canvas.width * [0.5, 0.56, 0.46, 0.52][variantIndex];
	const cy = canvas.height * [0.5, 0.48, 0.54, 0.46][variantIndex];
	const size = Math.min(canvas.width, canvas.height) * 0.22;
	let content = rect(cx - size * 1.05, cy - size * 0.9, size * 0.65, size * 1.8, `rx="28" fill="rgba(8,16,28,0.6)" stroke="${post.accent}" stroke-opacity="0.22" stroke-width="1.4"`);
	content += rect(cx + size * 0.4, cy - size * 0.9, size * 0.65, size * 1.8, `rx="28" fill="rgba(8,16,28,0.6)" stroke="${post.accent}" stroke-opacity="0.22" stroke-width="1.4"`);
	content += rect(cx - size * 0.22, cy - size * 0.22, size * 0.44, size * 0.44, `rx="22" fill="${post.accentSoft}" opacity="0.18" stroke="${post.accentSoft}" stroke-opacity="0.5" stroke-width="2"`);
	content += line(cx - size * 0.34, cy, cx + size * 0.34, cy, `stroke="${post.accentSoft}" stroke-width="${finalImage ? 4 : 3}" stroke-linecap="round"`);
	content += line(cx, cy - size * 0.34, cx, cy + size * 0.34, `stroke="${post.accent}" stroke-width="2" stroke-dasharray="8 10" stroke-linecap="round" opacity="0.7"`);
	return content;
}

function drawSql(canvas, post, variantIndex, finalImage) {
	const left = canvas.width * [0.18, 0.12, 0.22, 0.16][variantIndex];
	const top = canvas.height * [0.24, 0.18, 0.28, 0.22][variantIndex];
	const width = canvas.width * 0.62;
	const rowHeight = canvas.height * 0.1;
	let content = '';

	for (let index = 0; index < 4; index += 1) {
		const inset = index * 34;
		const y = top + index * (rowHeight + 18);
		content += polygon(
			[
				[left + inset, y],
				[left + width - inset, y],
				[left + width - inset - 58, y + rowHeight],
				[left + inset - 58, y + rowHeight]
			],
			`fill="rgba(10,17,28,0.68)" stroke="rgba(255,255,255,0.1)" stroke-width="1.2"`
		);
		content += line(left + inset + 42, y + rowHeight * 0.5, left + width - inset - 110, y + rowHeight * 0.5, `stroke="${index === 1 ? post.accentSoft : post.accent}" stroke-opacity="${index === 1 ? 0.78 : 0.3}" stroke-width="${index === 1 && finalImage ? 3.5 : 2}" stroke-linecap="round"`);
	}

	content += pathElement(`M ${point(left + width * 0.18, top - 24)} L ${point(left + width * 0.28, top - 54)} L ${point(left + width * 0.62, top - 54)}`, `fill="none" stroke="${post.accentSoft}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"`);
	return content;
}

function drawCompression(canvas, post, variantIndex, finalImage) {
	const cx = canvas.width * [0.52, 0.48, 0.54, 0.5][variantIndex];
	const cy = canvas.height * 0.5;
	let content = '';

	for (let index = 0; index < 5; index += 1) {
		const width = canvas.width * (0.62 - index * 0.09);
		const height = canvas.height * 0.085;
		const y = cy - canvas.height * 0.22 + index * (height + 26);
		content += rect(cx - width / 2, y, width, height, `rx="24" fill="rgba(9,16,26,0.72)" stroke="rgba(255,255,255,0.1)" stroke-width="1.2"`);
		content += rect(cx - width / 2 + 16, y + 12, width - 32, height - 24, `rx="18" fill="${index === 2 ? post.accentSoft : post.accent}" opacity="${index === 2 ? 0.2 : 0.1}"`);
	}

	content += line(cx, cy - canvas.height * 0.28, cx, cy + canvas.height * 0.28, `stroke="${post.accentSoft}" stroke-width="${finalImage ? 4 : 3}" stroke-linecap="round" opacity="0.9"`);
	return content;
}

function drawAtomic(canvas, post, variantIndex, finalImage) {
	const cx = canvas.width * [0.5, 0.54, 0.46, 0.5][variantIndex];
	const cy = canvas.height * 0.5;
	const gap = canvas.width * 0.08;
	const radius = Math.min(canvas.width, canvas.height) * 0.1;
	let content = rect(cx - canvas.width * 0.24, cy - canvas.height * 0.18, canvas.width * 0.48, canvas.height * 0.36, `rx="40" fill="rgba(8,16,28,0.42)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"`);
	content += circle(cx - gap, cy, radius, `fill="rgba(9,16,26,0.64)" stroke="${post.accent}" stroke-opacity="0.4" stroke-width="2"`);
	content += circle(cx + gap, cy, radius, `fill="rgba(9,16,26,0.64)" stroke="${post.accentSoft}" stroke-opacity="0.52" stroke-width="2"`);
	content += line(cx - gap + radius, cy, cx + gap - radius, cy, `stroke="${post.accentSoft}" stroke-width="${finalImage ? 5 : 4}" stroke-linecap="round" opacity="0.92"`);
	content += circle(cx - gap, cy, radius * 0.38, `fill="${post.accent}" opacity="0.22"`);
	content += circle(cx + gap, cy, radius * 0.38, `fill="${post.accentSoft}" opacity="0.22"`);
	return content;
}

function drawReplication(canvas, post, variantIndex, finalImage) {
	const clusterY = canvas.height * [0.48, 0.42, 0.52, 0.5][variantIndex];
	const leftX = canvas.width * 0.28;
	const rightX = canvas.width * 0.72;
	const offsets = [
		[-82, -54],
		[-34, 42],
		[24, -12],
		[78, 58]
	];
	let content = '';

	offsets.forEach(([dx, dy]) => {
		content += circle(leftX + dx, clusterY + dy, 24, `fill="rgba(9,16,26,0.72)" stroke="${post.accent}" stroke-opacity="0.34" stroke-width="1.6"`);
		content += circle(rightX + dx, clusterY + dy, 24, `fill="rgba(9,16,26,0.72)" stroke="${post.accent}" stroke-opacity="0.34" stroke-width="1.6"`);
		content += line(leftX + dx, clusterY + dy, rightX + dx, clusterY + dy, `stroke="${post.accentSoft}" stroke-opacity="${finalImage ? 0.4 : 0.28}" stroke-width="1.8" stroke-dasharray="9 12"`);
	});

	content += circle(leftX, clusterY, 30, `fill="${post.accent}" opacity="0.18"`);
	content += circle(rightX, clusterY, 30, `fill="${post.accentSoft}" opacity="0.18"`);
	return content;
}

function drawShield(canvas, post, variantIndex, finalImage) {
	const cx = canvas.width * [0.5, 0.46, 0.54, 0.5][variantIndex];
	const cy = canvas.height * 0.48;
	const shield = [
		[cx, cy - canvas.height * 0.22],
		[cx + canvas.width * 0.14, cy - canvas.height * 0.1],
		[cx + canvas.width * 0.1, cy + canvas.height * 0.15],
		[cx, cy + canvas.height * 0.28],
		[cx - canvas.width * 0.1, cy + canvas.height * 0.15],
		[cx - canvas.width * 0.14, cy - canvas.height * 0.1]
	];
	let content = polygon(shield, `fill="rgba(8,16,28,0.6)" stroke="${post.accent}" stroke-opacity="0.34" stroke-width="2"`);
	content += polygon(shield.map(([x, y]) => [cx + (x - cx) * 0.72, cy + (y - cy) * 0.72]), `fill="none" stroke="${post.accentSoft}" stroke-opacity="0.42" stroke-width="2"`);
	content += pathElement(`M ${point(cx - canvas.width * 0.05, cy + canvas.height * 0.02)} L ${point(cx - canvas.width * 0.01, cy + canvas.height * 0.07)} L ${point(cx + canvas.width * 0.06, cy - canvas.height * 0.02)}`, `fill="none" stroke="${post.accentSoft}" stroke-width="${finalImage ? 5 : 4}" stroke-linecap="round" stroke-linejoin="round"`);

	[
		[cx, cy - canvas.height * 0.32],
		[cx + canvas.width * 0.2, cy],
		[cx, cy + canvas.height * 0.34],
		[cx - canvas.width * 0.2, cy]
	].forEach(([x, y]) => {
		content += circle(x, y, 8, `fill="${post.accent}" opacity="0.82"`);
	});

	return content;
}

const motifRenderers = {
	horizon: drawHorizon,
	fracture: drawFracture,
	steps: drawSteps,
	shelves: drawShelves,
	bridge: drawBridge,
	pillars: drawPillars,
	globe: drawGlobe,
	sdk: drawSdk,
	sql: drawSql,
	compression: drawCompression,
	atomic: drawAtomic,
	replication: drawReplication,
	shield: drawShield
};

function buildSvg(post, format, variantIndex, finalImage = false) {
	const canvas = canvases[format];
	const key = `${post.slug}-${format}-${variantIndex}${finalImage ? '-final' : ''}`;
	const renderer = motifRenderers[post.motif];

	if (!renderer) {
		throw new Error(`No renderer registered for motif "${post.motif}"`);
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" fill="none">
${buildDefs(key, post, canvas, variantIndex, finalImage)}
<title>${post.slug} ${format} ${finalImage ? 'final' : `variant ${variantIndex + 1}`}</title>
<desc>${post.alt}</desc>
${buildFrame(canvas, key)}
${buildNoise(canvas, `${post.slug}-${format}-${variantIndex}`, post, finalImage)}
<g>
${renderer(canvas, post, variantIndex, finalImage)}
</g>
</svg>`;
}

mkdirSync(outputDir, { recursive: true });

const manifest = posts.map((post) => {
	const postDir = path.join(outputDir, post.slug);
	const variantsDir = path.join(postDir, 'variants');
	mkdirSync(variantsDir, { recursive: true });

	variants.forEach((label, variantIndex) => {
		writeFileSync(path.join(variantsDir, `variant-${label}-wide.svg`), buildSvg(post, 'wide', variantIndex), 'utf8');
		writeFileSync(path.join(variantsDir, `variant-${label}-square.svg`), buildSvg(post, 'square', variantIndex), 'utf8');
	});

	writeFileSync(path.join(postDir, 'cover-wide.svg'), buildSvg(post, 'wide', post.finalVariant, true), 'utf8');
	writeFileSync(path.join(postDir, 'cover-square.svg'), buildSvg(post, 'square', post.finalVariant, true), 'utf8');

	return {
		slug: post.slug,
		wide: `/images/blog/${post.slug}/cover-wide.svg`,
		square: `/images/blog/${post.slug}/cover-square.svg`,
		finalVariant: variants[post.finalVariant],
		alt: post.alt
	};
});

writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated ${manifest.length} blog cover sets in ${outputDir}`);
