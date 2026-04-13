import { readFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import { strings, type LocalePrefix } from '../support/locale-strings';
import { assertNoPageErrors, attachPageErrorListeners } from '../support/page-guards';

const locales = ['en', 'es', 'pt-br'] as const satisfies readonly LocalePrefix[];
const localeLabels: Record<LocalePrefix, string> = {
	en: 'English',
	es: 'Español',
	'pt-br': 'Português (Brasil)'
};
const openApiSpec = readFileSync(new URL('../../../static/openapi/terrascale.yaml', import.meta.url), 'utf8');

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function explorerRoute(locale: LocalePrefix): string {
	return `/${locale}/reference/api/explorer/`;
}

async function fulfillOpenApiSpec(page: Page, status = 200, delayMs = 150): Promise<void> {
	await page.route('**/openapi/terrascale.yaml', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, delayMs));
		await route.fulfill({
			status,
			contentType: 'application/yaml; charset=utf-8',
			body: status >= 400 ? 'upstream unavailable' : openApiSpec
		});
	});
}

async function openLocalizedExplorer(page: Page, locale: LocalePrefix): Promise<void> {
	if (locale === 'en') {
		await page.goto(explorerRoute(locale));
		return;
	}

	await page.goto(explorerRoute('en'));
	const localeButton = page
		.getByRole('navigation', { name: strings.en.header.primaryNav })
		.locator('button[aria-haspopup="true"]');
	await localeButton.click();
	await Promise.all([
		page.waitForURL(new RegExp(`${explorerRoute(locale).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)),
		page.getByRole('menuitem', { name: localeLabels[locale] }).click()
	]);
}

test.describe.configure({ mode: 'parallel' });

for (const locale of locales) {
	test(`api explorer loads localized explorer content for ${locale}`, async ({ page }) => {
		test.skip(locale !== 'en' && test.info().project.name !== 'desktop-chromium', 'Locale-switcher explorer coverage is desktop only for non-en locales.');

		const guards = attachPageErrorListeners(page);
		const ui = strings[locale];
		const loadingState = page.getByText(
			new RegExp(`${escapeRegex(ui.explorer.loading)}|Loading explorer…|Loading explorer\.\.\.`)
		);

	try {
			await fulfillOpenApiSpec(page, 200, locale === 'en' ? 600 : 150);
			await openLocalizedExplorer(page, locale);

			await expect(page).toHaveURL(new RegExp(`${explorerRoute(locale).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
			await expect(page.getByRole('heading', { name: ui.explorer.title, level: 1 })).toBeVisible();
			if (locale === 'en') {
				await expect(loadingState.first()).toBeVisible();
			}

			await expect(page.getByRole('heading', { name: 'TerraScale API', level: 2 })).toBeVisible();
			await expect(page.getByText('OpenAPI source', { exact: true })).toBeVisible();
			await expect(page.getByText('https://api.terrascale.io', { exact: true })).toBeVisible();
			if (locale === 'en') {
				await expect(loadingState).toHaveCount(0);
			}

			const firstOperationCard = page.locator('article').filter({ has: page.getByRole('button', { name: /Health check/i }) }).first();
			const operationToggle = firstOperationCard.getByRole('button', { name: /Health check/i });

			await expect(firstOperationCard.getByText('GET', { exact: true })).toBeVisible();
			await expect(firstOperationCard.getByText('/health', { exact: true })).toBeVisible();

			await operationToggle.click();

			await expect(firstOperationCard.getByText('Overall health check for the API. No authentication required.', { exact: true })).toBeVisible();
			await expect(firstOperationCard.locator('p').filter({ hasText: 'Auth:' })).toContainText('None');
			await expect(firstOperationCard.getByText('Responses', { exact: true })).toBeVisible();
			await expect(firstOperationCard.getByText('200', { exact: true })).toBeVisible();
			await expect(firstOperationCard.getByText('API is healthy.', { exact: true })).toBeVisible();

			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});

	test(`api explorer shows inline fetch error without uncaught errors for ${locale}`, async ({ page }) => {
		const guards = attachPageErrorListeners(page);

		try {
			test.skip(locale !== 'en', 'Deterministic direct-load failure path is only available for prerendered en route.');
			await fulfillOpenApiSpec(page, 503);
			await page.goto(explorerRoute(locale));

			await expect(page).toHaveURL(new RegExp(`${explorerRoute(locale).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
			await expect(page.getByRole('heading', { name: strings.en.explorer.title, level: 1 })).toBeVisible();
			await expect(page.getByText('Failed to load spec (503)', { exact: true })).toBeVisible();
			await expect(page.getByRole('heading', { name: 'TerraScale API', level: 2 })).toHaveCount(0);

			expect(guards.pageErrors).toEqual([]);
			expect(guards.consoleErrors.filter((error) => !error.includes('Failed to load resource'))).toEqual([]);
		} finally {
			guards.cleanup();
		}
	});
}
