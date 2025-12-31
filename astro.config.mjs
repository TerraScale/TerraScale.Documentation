// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator'
import starlightBlog from 'starlight-blog'
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi'
import starlightHeadingBadges from 'starlight-heading-badges'

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
			],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/TerraScale'
				}
			],
			sidebar: [
				{
					label: 'Guides',
					autogenerate: { directory: 'guides' },
				},
				{
					label: 'Account',
					autogenerate: { directory: 'account' },
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Authentication', link: '/reference/authentication/' },
						{ label: 'Multi-Factor Authentication', link: '/reference/mfa/' },
						{ label: 'Organizations', link: '/reference/organizations/' },
						{
							label: 'API Reference',
							autogenerate: { directory: 'reference/api' },
						},
						{
							label: 'Management API',
							autogenerate: { directory: 'reference/management' },
						},
						{ label: 'Regions', link: '/reference/regions/' },
						{ label: 'Plans', link: '/reference/plans/' },
						{ label: 'Billing', link: '/reference/billing/' },
						{ label: 'Rate Limits', link: '/reference/rate-limits/' },
						{ label: 'Error Handling', link: '/reference/error-handling/' },
						{ label: 'Data Models', link: '/reference/data-models/' },
						{ label: 'Best Practices', link: '/reference/best-practices/' },
					],
				},
				{
					label: 'Dashboard',
					autogenerate: { directory: 'dashboard' },
				},
				{
					label: 'Roadmap',
					autogenerate: { directory: 'roadmap' },
				},
				{
					label: 'About',
					autogenerate: { directory: 'about' },
				}
				// ...openAPISidebarGroups,
			],
			customCss: [
				'./src/styles/global.css'
			],
			components: {
				Header: './src/components/overrides/Header.astro',
			}
		}),
	],

	vite: {
		plugins: [
			tailwindcss()
		],
	},
});