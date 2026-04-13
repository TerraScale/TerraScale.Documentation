import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

import { assertNoOverflow, assertNoPageErrors, attachPageErrorListeners } from '../support/page-guards';

type LocaleVariant = 'default' | 'en' | 'es' | 'pt-br';
type PageFamily = 'home' | 'blog' | 'roadmap';

type PageFamilyCase = {
	family: PageFamily;
	route: '/' | '/blog/' | '/roadmap/';
	locales: LocaleVariant[];
	getReadyLocator: (page: Page) => Locator;
	getActionableLocators: (page: Page) => Promise<Locator[]>;
	getEmptyStateLocator?: (page: Page) => Locator;
	getMobileWrapGroups?: (page: Page) => Promise<Array<{ name: string; group: Locator; links: Locator[] }>>;
};

const locales: LocaleVariant[] = ['default', 'en', 'es', 'pt-br'];

const pageFamilyCases: PageFamilyCase[] = [
	{
		family: 'home',
		route: '/',
		locales,
		getReadyLocator: (page) => page.getByRole('heading', { name: /Scale Your Database/i }),
		getActionableLocators: async (page) => {
			const exploreSection = page
				.locator('section')
				.filter({ has: page.getByRole('heading', { name: 'Explore the Documentation' }) })
				.first();

			return [
				page.getByRole('link', { name: 'Get Started Free' }),
				page.getByRole('link', { name: 'View Documentation' }),
				exploreSection.getByRole('link', { name: /^Getting Started/i }),
				exploreSection.getByRole('link', { name: /^Roadmap/i }),
				exploreSection.getByRole('link', { name: /^API Reference/i }),
				exploreSection.getByRole('link', { name: /^SDKs & Libraries/i }),
				page.getByRole('link', { name: 'Start Building Today' }),
				page.getByRole('link', { name: 'View Pricing' })
			];
		},
		getMobileWrapGroups: async (page) => {
			const heroPrimary = page.getByRole('link', { name: 'Get Started Free' });
			const heroSecondary = page.getByRole('link', { name: 'View Documentation' });
			const footerPrimary = page.getByRole('link', { name: 'Start Building Today' });
			const footerSecondary = page.getByRole('link', { name: 'View Pricing' });

			return [
				{
					name: 'home hero CTA group',
					group: heroPrimary.locator('xpath=ancestor::div[1]'),
					links: [heroPrimary, heroSecondary]
				},
				{
					name: 'home footer CTA group',
					group: footerPrimary.locator('xpath=ancestor::div[1]'),
					links: [footerPrimary, footerSecondary]
				}
			];
		}
	},
	{
		family: 'blog',
		route: '/blog/',
		locales: ['en', 'es', 'pt-br'],
		getReadyLocator: (page) => page.getByRole('heading', { name: 'TerraScale Blog' }),
		getEmptyStateLocator: (page) => page.getByRole('heading', { name: 'No public posts yet' }),
		getActionableLocators: async (page) => {
			const cards = page.locator('article > a[href]:visible');
			const count = await cards.count();

			return Array.from({ length: count }, (_, index) => cards.nth(index));
		}
	},
	{
		family: 'roadmap',
		route: '/roadmap/',
		locales: ['en', 'es', 'pt-br'],
		getReadyLocator: (page) => page.getByRole('heading', { name: 'Roadmap' }),
		getActionableLocators: async (page) => [
			page.getByRole('main').getByRole('link', { name: 'Join Discord' }),
			page.getByRole('main').getByRole('link', { name: 'Get Started' })
		],
		getMobileWrapGroups: async (page) => {
			const primary = page.getByRole('main').getByRole('link', { name: 'Join Discord' });
			const secondary = page.getByRole('main').getByRole('link', { name: 'Get Started' });

			return [
				{
					name: 'roadmap CTA group',
					group: primary.locator('xpath=ancestor::div[1]'),
					links: [primary, secondary]
				}
			];
		}
	}
];

test.describe.configure({ mode: 'parallel' });

function toRoute(locale: LocaleVariant, route: PageFamilyCase['route']): string {
	if (locale === 'default') {
		return route;
	}

	return route === '/' ? `/${locale}/` : `/${locale}${route}`;
}

function shouldCheckNoOverflow(testInfo: TestInfo): boolean {
	return testInfo.project.name === 'mobile-chromium' || testInfo.project.name === 'tablet-chromium';
}

function shouldCheckMobileWrap(testInfo: TestInfo): boolean {
	return testInfo.project.name === 'mobile-chromium';
}

async function expectInsideViewport(page: Page, locator: Locator, label: string): Promise<void> {
	const viewportTolerance = 2;

	await locator.scrollIntoViewIfNeeded();
	await expect(locator, `${label} should be visible`).toBeVisible();

	const box = await locator.boundingBox();
	const viewport = page.viewportSize();

	expect(box, `${label} should have a bounding box`).not.toBeNull();
	expect(viewport, 'Viewport size should be available').not.toBeNull();

	if (!box || !viewport) {
		return;
	}

	expect(box.x, `${label} should stay inside the left viewport edge`).toBeGreaterThanOrEqual(0);
	expect(box.y, `${label} should stay inside the top viewport edge`).toBeGreaterThanOrEqual(0);
	expect(box.x + box.width, `${label} should stay inside the right viewport edge`).toBeLessThanOrEqual(
		viewport.width + viewportTolerance
	);
	expect(box.y + box.height, `${label} should stay inside the bottom viewport edge`).toBeLessThanOrEqual(
		viewport.height + viewportTolerance
	);
}

async function expectActionableLinks(
	page: Page,
	links: Locator[],
	label: string,
	emptyStateLocator?: Locator
): Promise<void> {
	if (links.length === 0) {
		expect(emptyStateLocator, `${label} should expose actionable links or an empty state`).toBeDefined();

		if (emptyStateLocator) {
			await expect(emptyStateLocator).toBeVisible();
		}

		return;
	}

	for (const [index, link] of links.entries()) {
		await expectInsideViewport(page, link, `${label} link ${index + 1}`);
		await link.click({ trial: true });
	}
}

async function expectWrapGroupClean(group: Locator, links: Locator[], name: string): Promise<void> {
	await group.scrollIntoViewIfNeeded();
	await expect(group, `${name} should be visible`).toBeVisible();
	expect(await group.evaluate((element) => getComputedStyle(element).flexWrap)).toBe('wrap');

	for (const [index, link] of links.entries()) {
		await link.scrollIntoViewIfNeeded();
		const box = await link.boundingBox();
		const groupBox = await group.boundingBox();

		expect(box, `${name} link ${index + 1} should have a bounding box`).not.toBeNull();
		expect(groupBox, `${name} should have a bounding box`).not.toBeNull();

		if (!box || !groupBox) {
			continue;
		}

		expect(box.x, `${name} link ${index + 1} should not clip on the left`).toBeGreaterThanOrEqual(
			groupBox.x - 1
		);
		expect(
			box.x + box.width,
			`${name} link ${index + 1} should not clip on the right`
		).toBeLessThanOrEqual(groupBox.x + groupBox.width + 1);
	}
}

for (const pageCase of pageFamilyCases) {
	for (const locale of pageCase.locales) {
		test(`${pageCase.family} page family stays responsive for ${locale}`, async ({ page }, testInfo) => {
			const guards = attachPageErrorListeners(page);
			const route = toRoute(locale, pageCase.route);

			try {
				await page.goto(route);
				await expect(pageCase.getReadyLocator(page)).toBeVisible();

				const actionableLinks = await pageCase.getActionableLocators(page);
				await expectActionableLinks(
					page,
					actionableLinks,
					`${locale} ${pageCase.family}`,
					pageCase.getEmptyStateLocator?.(page)
				);

				if (shouldCheckNoOverflow(testInfo)) {
					await assertNoOverflow(page);
				}

				if (shouldCheckMobileWrap(testInfo) && pageCase.getMobileWrapGroups) {
					const groups = await pageCase.getMobileWrapGroups(page);

					for (const { group, links, name } of groups) {
						await expectWrapGroupClean(group, links, name);
					}

					await assertNoOverflow(page);
				}

				assertNoPageErrors(guards);
			} finally {
				guards.cleanup();
			}
		});
	}
}
