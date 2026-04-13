import { expect, test } from '@playwright/test';

import { strings, type LocalePrefix } from '../support/locale-strings';
import { assertNoPageErrors, attachPageErrorListeners } from '../support/page-guards';

const locales = ['en', 'es', 'pt-br'] as const satisfies readonly LocalePrefix[];
const localeLabels: Record<LocalePrefix, string> = {
	en: 'English',
	es: 'Español',
	'pt-br': 'Português (Brasil)'
};
const localeSwitchTargets: Record<LocalePrefix, LocalePrefix> = {
	en: 'es',
	es: 'pt-br',
	'pt-br': 'en'
};
const sharedRoutes = ['/', '/blog/', '/roadmap/', '/reference/api/explorer/'] as const;
const searchRoutesByLocale: Record<LocalePrefix, (typeof sharedRoutes)[number]> = {
	en: '/',
	es: '/blog/',
	'pt-br': '/'
};

function toLocalizedRoute(locale: LocalePrefix, route: (typeof sharedRoutes)[number]) {
	return route === '/' ? `/${locale}/` : `/${locale}${route}`;
}

test.describe('desktop header, search, and locale switching', () => {
	for (const locale of locales) {
		test(`search overlay works for ${locale}`, async ({ page }, testInfo) => {
			test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

			const guards = attachPageErrorListeners(page);
			const ui = strings[locale];

			try {
				await page.goto(toLocalizedRoute(locale, searchRoutesByLocale[locale]));

				await expect(page.getByRole('banner')).toBeVisible();
				await expect(page.getByRole('link', { name: ui.header.homeAriaLabel })).toBeVisible();
				await expect(
					page.getByRole('navigation', { name: ui.header.primaryNav })
				).toBeVisible();
				await expect(page.getByRole('button', { name: ui.header.search, exact: true })).toBeVisible();
				await expect(page.getByRole('button', { name: ui.header.openNav })).toBeHidden();

				await page.getByRole('button', { name: ui.header.search, exact: true }).click();

				const dialog = page.getByRole('dialog', { name: ui.search.dialogLabel });
				const input = page.getByRole('textbox', { name: ui.search.inputAriaLabel });

				await expect(dialog).toBeVisible();
				await expect(input).toBeFocused();
				await expect(dialog.getByText(ui.search.emptyTitle, { exact: true })).toBeVisible();
				await expect(dialog.getByText(ui.search.emptyBody, { exact: true })).toBeVisible();

				await input.fill('roadmap');
				await expect(dialog.locator(`a[href*="${toLocalizedRoute(locale, '/roadmap/')}"]`).first()).toBeVisible();

				await input.fill('zzzzzzzzzz-terrascale');
				await expect(dialog.getByText(ui.search.noResultsTitle, { exact: true })).toBeVisible();
				await expect(dialog.getByText(ui.search.noResultsBody, { exact: true })).toBeVisible();

				await page.getByRole('button', { name: ui.search.closeSearch }).last().click();
				await expect(dialog).toBeHidden();
				assertNoPageErrors(guards);
			} finally {
				guards.cleanup();
			}
		});
	}

	for (const locale of locales) {
		for (const route of ['/blog/', '/roadmap/'] as const) {
			test(`locale switch preserves ${route} from ${locale}`, async ({ page }, testInfo) => {
				test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

				const guards = attachPageErrorListeners(page);
				const currentUi = strings[locale];
				const targetLocale = localeSwitchTargets[locale];
				const targetUi = strings[targetLocale];
				const currentRoute = toLocalizedRoute(locale, route);
				const targetRoute = toLocalizedRoute(targetLocale, route);

				try {
					await page.goto(currentRoute);

					const desktopNav = page.getByRole('navigation', { name: currentUi.header.primaryNav });
					const localeButton = desktopNav.locator('button[aria-haspopup="true"]');

					await expect(page.getByRole('banner')).toBeVisible();
					await expect(desktopNav).toBeVisible();
					await expect(page.getByRole('button', { name: currentUi.header.openNav })).toBeHidden();
					await expect(localeButton).toContainText(locale);

					await localeButton.click();
					await expect(page.getByRole('menu')).toBeVisible();

					await Promise.all([
						page.waitForURL(`**${targetRoute}`),
						page.getByRole('menuitem', { name: localeLabels[targetLocale] }).click()
					]);

					await expect(page).toHaveURL(new RegExp(`${targetRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
					await expect(page.getByRole('navigation', { name: targetUi.header.primaryNav })).toBeVisible();
					await expect(page.getByRole('link', { name: targetUi.header.homeAriaLabel })).toBeVisible();
					assertNoPageErrors(guards);
				} finally {
					guards.cleanup();
				}
			});
		}
	}

	test('locale menu preserves root locale hrefs', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

		const guards = attachPageErrorListeners(page);

		try {
			await page.goto('/en/');

			const desktopNav = page.getByRole('navigation', { name: strings.en.header.primaryNav });
			const localeButton = desktopNav.locator('button[aria-haspopup="true"]');

			await expect(page.getByRole('banner')).toBeVisible();
			await expect(localeButton).toContainText('en');

			await localeButton.click();
			await expect(page.getByRole('menuitem', { name: localeLabels.es })).toHaveAttribute('href', '/es/');
			await expect(page.getByRole('menuitem', { name: localeLabels['pt-br'] })).toHaveAttribute('href', '/pt-br/');
			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});

	test('locale menu preserves explorer locale hrefs', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

		const guards = attachPageErrorListeners(page);

		try {
			await page.goto('/en/reference/api/explorer/');

			const desktopNav = page.getByRole('navigation', { name: strings.en.header.primaryNav });
			const localeButton = desktopNav.locator('button[aria-haspopup="true"]');

			await expect(page.getByRole('banner')).toBeVisible();
			await expect(localeButton).toContainText('en');

			await localeButton.click();
			await expect(page.getByRole('menuitem', { name: localeLabels.es })).toHaveAttribute(
				'href',
				'/es/reference/api/explorer/'
			);
			await expect(page.getByRole('menuitem', { name: localeLabels['pt-br'] })).toHaveAttribute(
				'href',
				'/pt-br/reference/api/explorer/'
			);
			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});
});
