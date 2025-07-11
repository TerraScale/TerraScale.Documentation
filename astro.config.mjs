// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator'
import starlightBlog from 'starlight-blog'
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi'
import starlightVersions from 'starlight-versions'
import starlightHeadingBadges from 'starlight-heading-badges'
import starlightAutoSidebar from 'starlight-auto-sidebar'

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.terrascale.tech',

	integrations: [
		starlight({
			title: 'TerraScale Documentation',
			plugins: [
				starlightLinksValidator(),
				starlightBlog(),
				// starlightOpenAPI([
				// 	{
				// 		base: 'api',
				// 		schema: '../schemas/api-schema.yaml',
				// 	},
				// ]),
				// starlightVersions({
				// 	versions: [{ slug: '1.0' }],
				// }),
				starlightHeadingBadges(),
				// starlightAutoSidebar()
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
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
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