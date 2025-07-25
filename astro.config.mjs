// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator'
import starlightBlog from 'starlight-blog'
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi'
import starlightHeadingBadges from 'starlight-heading-badges'
import starlightAutoSidebar from 'starlight-auto-sidebar'
import starlightThemeObsidian from 'starlight-theme-obsidian'

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.terrascale.tech',

	integrations: [
		starlight({
			title: 'TerraScale Documentation',
			plugins: [
				// starlightLinksValidator(),
				starlightBlog(),
				// starlightOpenAPI([
				// 	{
				// 		base: 'api',
				// 		schema: '../schemas/api-schema.yaml',
				// 	},
				// ]),
				starlightHeadingBadges(),
				starlightAutoSidebar(),
				starlightThemeObsidian(
					{
						graph: false,
						backlinks: false,
					}
				)
			],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/withastro/starlight'
				}
			],
			sidebar: [
				{
					label: 'Guides',
					autogenerate: { directory: 'guides' },
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
				// ...openAPISidebarGroups,
			],
			customCss: [
				'./src/styles/global.css'
			]
		}),
	],

	vite: {
		plugins: [
			tailwindcss()
		],
	},
});