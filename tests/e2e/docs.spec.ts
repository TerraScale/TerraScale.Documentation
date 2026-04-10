import { expect, test } from '@playwright/test';

test('homepage renders key TerraScale navigation', async ({ page, isMobile }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /TerraScale Documentation/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Get Started/i }).first()).toBeVisible();
	if (!isMobile) {
		await expect(page.getByLabel('Primary').getByRole('link', { name: 'Blog' })).toBeVisible();
	}
});

test('docs article route renders sidebar and content', async ({ page }) => {
	await page.goto('/guides/getting-started/');
	await expect(page.getByRole('heading', { name: 'Getting Started' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Guides' })).toBeVisible();
	await expect(page.locator('.docs-sidebar').getByRole('link', { name: 'API Strategy' })).toBeVisible();
	await expect(page.locator('.prose-shell')).toContainText('Step 1: Create an Account');
});

test('blog index and article route render', async ({ page }) => {
	await page.goto('/blog/');
	await expect(page.getByRole('heading', { name: 'TerraScale Blog' })).toBeVisible();
	await page.getByRole('link', { name: /Introducing TerraScale/i }).click();
	await expect(page.getByRole('heading', { name: /Introducing TerraScale/i })).toBeVisible();
	await expect(page.locator('.article-meta')).toContainText(/read/i);
});

test('search overlay returns docs results', async ({ page, isMobile }) => {
	await page.goto('/');
	if (isMobile) {
		await page.getByRole('button', { expanded: false }).click();
	}
	await page.getByRole('button', { name: /Search/i }).first().click();
	await page.getByPlaceholder(/Search docs/i).fill('mfa');
	await expect(page.locator('.search-result').filter({ hasText: /mfa|Multi-Factor/i }).first()).toBeVisible();
});

test('mobile navigation opens and closes', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'mobile-only navigation test');
	await page.goto('/');
	await page.getByRole('button', { expanded: false }).click();
	await expect(page.getByRole('link', { name: 'Docs' })).toBeVisible();
	await page.getByRole('link', { name: 'Docs' }).click();
	await expect(page).toHaveURL(/\/reference\/api\/?$/);
});

test('mobile search is reachable through the menu', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'mobile-only search test');
	await page.goto('/');
	await page.getByRole('button', { expanded: false }).click();
	await page.getByRole('button', { name: /Search/i }).click();
	await page.getByPlaceholder(/Search docs/i).fill('regions');
	await expect(page.locator('.search-result').filter({ hasText: /Regions/i }).first()).toBeVisible();
});
