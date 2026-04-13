import { expect, test, type Locator, type Page } from '@playwright/test';

import { strings } from '../support/locale-strings';
import { assertNoPageErrors, attachPageErrorListeners } from '../support/page-guards';

const localePaths = {
	en: '/en/guides/getting-started/',
	es: '/es/guides/getting-started/',
	'pt-br': '/pt-br/guides/getting-started/'
} as const;

const localeLabels = ['English', 'Español', 'Português (Brasil)'] as const;

test.describe.configure({ mode: 'parallel' });

function getMobileNavTrigger(page: Page): Locator {
	return page.locator('button[aria-controls="mobile-nav"]');
}

function getMobileNavDialog(page: Page): Locator {
	return page.locator('#mobile-nav[role="dialog"]');
}

function getPanelFocusableElements(page: Page): Locator {
	return page
		.locator('#mobile-nav > div')
		.locator('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
}

async function openMobileNav(page: Page): Promise<{ trigger: Locator; dialog: Locator }> {
	const trigger = getMobileNavTrigger(page);
	const dialog = getMobileNavDialog(page);

	await expect(trigger).toBeVisible();
	await trigger.click();
	await expect(dialog).toBeVisible();

	return { trigger, dialog };
}

for (const locale of Object.keys(localePaths) as Array<keyof typeof localePaths>) {
	const ui = strings[locale];

	test(`mobile nav dialog behavior stays correct for ${locale}`, async ({ page }) => {
		const guards = attachPageErrorListeners(page);

		try {
			await page.goto(localePaths[locale]);
			const { trigger, dialog } = await openMobileNav(page);
			const closeButton = page
				.locator('#mobile-nav > div')
				.getByRole('button', { name: ui.mobile.closeNavigationMenu });
			const backdrop = page.locator('#mobile-nav > button');
			const searchButton = dialog.getByRole('button', { name: ui.mobile.searchDocumentation });
			const focusables = getPanelFocusableElements(page);
			const docsTree = dialog.locator('section').filter({ hasText: ui.mobile.documentation });

			await expect(closeButton).toBeFocused();
			await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

			await expect(searchButton).toBeVisible();
			await expect(dialog.getByRole('link', { name: ui.navigation.docs }).first()).toBeVisible();
			await expect(dialog.getByRole('link', { name: ui.navigation.roadmap })).toBeVisible();
			await expect(dialog.getByRole('link', { name: ui.navigation.blog })).toBeVisible();
			await expect(dialog.getByRole('link', { name: ui.navigation.getStarted })).toBeVisible();
			await expect(dialog.getByRole('link', { name: ui.navigation.status })).toBeVisible();
			await expect(dialog.getByRole('link', { name: ui.navigation.discord })).toBeVisible();
			await expect(dialog.getByRole('link', { name: ui.navigation.github })).toBeVisible();
			await expect(docsTree.getByRole('link').first()).toBeVisible();

			for (const localeLabel of localeLabels) {
				await expect(dialog.getByRole('link', { name: localeLabel })).toBeVisible();
			}

			const firstFocusable = focusables.first();
			const lastFocusable = focusables.last();

			await firstFocusable.focus();
			await page.keyboard.press('Shift+Tab');
			await expect(lastFocusable).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(firstFocusable).toBeFocused();

			await page.keyboard.press('Escape');
			await expect(dialog).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');

			await openMobileNav(page);
			await page.locator('#mobile-nav > button').dispatchEvent('click');
			await expect(dialog).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');

			await expect(backdrop).toBeHidden();
			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});
}
