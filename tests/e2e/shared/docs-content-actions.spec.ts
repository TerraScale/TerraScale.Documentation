import { expect, test, type Locator, type Page } from '@playwright/test';

import { strings, type LocalePrefix } from '../support/locale-strings';
import { assertNoPageErrors, attachPageErrorListeners } from '../support/page-guards';

const locales = ['en', 'es', 'pt-br'] as const satisfies readonly LocalePrefix[];
const docsRoutes: Record<LocalePrefix, { withCode: string; withoutCode: string }> = {
	en: {
		withCode: '/en/guides/querying/',
		withoutCode: '/en/about/support/'
	},
	es: {
		withCode: '/es/guides/querying/',
		withoutCode: '/es/about/support/'
	},
	'pt-br': {
		withCode: '/pt-br/guides/querying/',
		withoutCode: '/pt-br/about/support/'
	}
};

test.describe.configure({ mode: 'parallel' });

function getViewportTier(projectName: string): 'mobile' | 'tablet' | 'desktop' {
	if (projectName === 'desktop-chromium') {
		return 'desktop';
	}

	if (projectName === 'tablet-chromium') {
		return 'tablet';
	}

	return 'mobile';
}

async function expectInViewport(locator: Locator): Promise<void> {
	await expect(locator).toBeInViewport();

	const box = await locator.boundingBox();
	expect(box).not.toBeNull();
	if (!box) {
		return;
	}

	expect(box.width).toBeGreaterThan(0);
	expect(box.height).toBeGreaterThan(0);
	expect(box.x).toBeGreaterThanOrEqual(0);
	expect(box.y).toBeGreaterThanOrEqual(0);
	const viewportSize = locator.page().viewportSize();
	expect(viewportSize).not.toBeNull();
	if (!viewportSize) {
		return;
	}

	expect(box.x + box.width).toBeLessThanOrEqual(viewportSize.width);
	expect(box.y + box.height).toBeLessThanOrEqual(viewportSize.height);
}

async function expectCopyAction(page: Page, locale: LocalePrefix): Promise<void> {
	const article = page.locator('article[data-prose]');
	const codeBlocks = article.locator('[data-code-block]');
	const firstCodeBlock = article.locator('[data-code-block]').first();
	const copyButton = firstCodeBlock.locator('[data-copy-button]');
	const renderedCode = firstCodeBlock.locator('code').first();
	const ui = strings[locale];

	await expect(article).toBeVisible();
	await expect.poll(async () => codeBlocks.count()).toBeGreaterThan(0);
	await expect(firstCodeBlock).toBeVisible();
	await firstCodeBlock.scrollIntoViewIfNeeded();
	await firstCodeBlock.hover();
	await expect(copyButton).toBeVisible();
	await expect(copyButton).toHaveAttribute('aria-label', ui.copy.ariaLabel);
	await expect(copyButton).toHaveAttribute('title', ui.copy.title);
	await expectInViewport(copyButton);

	const visibleCodeText = (await renderedCode.innerText()).trim();
	expect(visibleCodeText.length).toBeGreaterThan(0);

	await copyButton.click();
	await expect(page.getByText(ui.copy.success, { exact: true })).toBeVisible();

	await expect
		.poll(async () => page.evaluate(() => navigator.clipboard.readText()))
		.toBe(visibleCodeText);
	await expect
		.poll(async () => copyButton.evaluate((element) => getComputedStyle(element).opacity))
		.not.toBe('0');
}

async function expectArticleControls(page: Page, locale: LocalePrefix, viewportTier: 'mobile' | 'tablet' | 'desktop'): Promise<void> {
	const ui = strings[locale];
	const prevNextNav = page.locator('article[data-prose] + nav');
	const toc = page.locator('aside').filter({
		has: page.getByRole('heading', { name: ui.toc.heading, exact: true })
	});

	await expect(prevNextNav).toBeVisible();
	await expect(prevNextNav.getByRole('link')).toHaveCount(2);
	await expect(prevNextNav).toContainText(ui.prevNext.previous);
	await expect(prevNextNav).toContainText(ui.prevNext.next);

	if (viewportTier === 'desktop') {
		await expect(toc).toBeVisible();
		await expect(toc.getByRole('link').first()).toBeVisible();
	} else {
		await expect(toc).toBeHidden();
	}
}

for (const locale of locales) {
	test(`docs content actions behave correctly for ${locale}`, async ({ page, context }, testInfo) => {
		const guards = attachPageErrorListeners(page);
		const viewportTier = getViewportTier(testInfo.project.name);

		try {
			await context.grantPermissions(['clipboard-read', 'clipboard-write']);
			await page.goto(docsRoutes[locale].withCode);

			await expectCopyAction(page, locale);
			await expectArticleControls(page, locale, viewportTier);
			assertNoPageErrors(guards);
		} finally {
			guards.cleanup();
		}
	});

	test(`docs pages without code blocks stay copy-button free for ${locale}`, async ({ page }) => {
		await page.goto(docsRoutes[locale].withoutCode);

		const article = page.locator('article[data-prose]');
		await expect(article).toBeVisible();

		const codeBlockCount = await article.locator('[data-code-block]').count();
		if (codeBlockCount === 0) {
			await expect(article.locator('[data-copy-button]')).toHaveCount(0);
		}
	});
}
