import { readFileSync } from 'node:fs';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { strings } from '../support/locale-strings';
import { assertNoPageErrors, attachPageErrorListeners } from '../support/page-guards';

const openApiSpec = readFileSync(new URL('../../../static/openapi/terrascale.yaml', import.meta.url), 'utf8');
const allowedAxeViolationIds = new Set(['color-contrast', 'region', 'landmark-complementary-is-top-level']);

async function expectNoAxeViolations(page: Page): Promise<void> {
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations.map((violation) => violation.id).sort()).toEqual(
		results.violations
			.map((violation) => violation.id)
			.filter((id) => allowedAxeViolationIds.has(id))
			.sort()
	);
}

async function fulfillOpenApiSpec(page: Page): Promise<void> {
	await page.route('**/openapi/terrascale.yaml', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/yaml; charset=utf-8',
			body: openApiSpec
		});
	});
}

test.describe('representative accessibility coverage', () => {
	test('home page supports search and locale-switcher focus flows', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

		const guards = attachPageErrorListeners(page);
		const ui = strings.en;

		try {
			await page.goto('/en/');
			await expect(page.getByRole('heading', { name: /Scale Your Database/i, level: 1 })).toBeVisible();
			await expectNoAxeViolations(page);

			await page.getByRole('button', { name: ui.header.search, exact: true }).click();

			const dialog = page.getByRole('dialog', { name: ui.search.dialogLabel });
			const input = page.getByRole('textbox', { name: ui.search.inputAriaLabel });
			const closeButton = dialog.getByRole('button', { name: ui.search.closeSearch }).last();

			await expect(dialog).toBeVisible();
			await expect(input).toBeFocused();
			await page.keyboard.press('Tab');
			await expect(closeButton).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(dialog).toBeHidden();

			const localeButton = page
				.getByRole('navigation', { name: ui.header.primaryNav })
				.locator('button[aria-haspopup="true"]');
			await localeButton.focus();
			await expect(localeButton).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(page.getByRole('menu')).toBeVisible();
			await page.keyboard.press('Tab');
			await expect(page.getByRole('menuitem', { name: 'English' })).toBeFocused();

			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});

	test('shared docs page supports toc and copy-button keyboard flows', async ({ page, context }, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

		const guards = attachPageErrorListeners(page);
		const ui = strings.en;

		try {
			await context.grantPermissions(['clipboard-read', 'clipboard-write']);
			await page.goto('/en/guides/querying/');

			await expect(page.locator('article[data-prose]')).toBeVisible();
			await expectNoAxeViolations(page);

			const toc = page.locator('aside').filter({
				has: page.getByRole('heading', { name: ui.toc.heading, exact: true })
			});
			const tocLink = toc.getByRole('link').first();
			await tocLink.focus();
			await expect(tocLink).toBeFocused();

			const firstCodeBlock = page.locator('[data-code-block]').first();
			const copyButton = firstCodeBlock.locator('[data-copy-button]');
			await firstCodeBlock.scrollIntoViewIfNeeded();
			await copyButton.focus();
			await expect(copyButton).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(page.getByText(ui.copy.success, { exact: true })).toBeVisible();

			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});

	test('blog index stays accessible with keyboard-focusable post cards', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

		const guards = attachPageErrorListeners(page);

		try {
			await page.goto('/en/blog/');
			await expect(page.getByRole('heading', { name: 'TerraScale Blog', level: 1 })).toBeVisible();
			await expectNoAxeViolations(page);

			const firstPostLink = page.locator('article a[href]').first();
			await firstPostLink.focus();
			await expect(firstPostLink).toBeFocused();

			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});

	test('roadmap page keeps primary cta focusable after axe scan', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

		const guards = attachPageErrorListeners(page);

		try {
			await page.goto('/en/roadmap/');
			await expect(page.getByRole('heading', { name: 'Roadmap', level: 1 })).toBeVisible();
			await expectNoAxeViolations(page);

			const getStartedLink = page.getByRole('main').getByRole('link', { name: 'Get Started' });
			await getStartedLink.focus();
			await expect(getStartedLink).toBeFocused();

			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});

	test('api explorer page stays accessible and keyboard-expandable', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

		const guards = attachPageErrorListeners(page);

		try {
			await fulfillOpenApiSpec(page);
			await page.goto('/en/reference/api/explorer/');

			await expect(page).toHaveURL(/\/en\/reference\/api\/explorer\/$/);
			await expect(page.getByRole('banner')).toBeVisible();
			await expect(page.getByRole('heading', { name: 'TerraScale API', level: 2 })).toBeVisible();
			await expectNoAxeViolations(page);

			const firstOperationToggle = page.getByRole('button', { name: /Health check/i }).first();
			await firstOperationToggle.focus();
			await expect(firstOperationToggle).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(page.locator('article').filter({ has: firstOperationToggle }).getByText('Responses', { exact: true })).toBeVisible();

			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});

	test('mobile navigation trigger and close button keep focus control', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name === 'desktop-chromium', 'Mobile and tablet Chromium only');

		const guards = attachPageErrorListeners(page);
		const ui = strings.en;

		try {
			await page.goto('/en/guides/getting-started/');
			await expectNoAxeViolations(page);

			const trigger = page.locator('button[aria-controls="mobile-nav"]');
			await trigger.focus();
			await expect(trigger).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(page.locator('#mobile-nav[role="dialog"]')).toBeVisible();

			const closeButton = page
				.locator('#mobile-nav > div')
				.getByRole('button', { name: ui.mobile.closeNavigationMenu });
			await expect(closeButton).toBeFocused();
			await page.keyboard.press('Escape');
			await expect(page.locator('#mobile-nav[role="dialog"]')).toBeHidden();
			await expect(trigger).toBeFocused();

			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});
});
