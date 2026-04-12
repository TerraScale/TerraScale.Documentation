import { expect, test } from '@playwright/test';

test('homepage title includes TerraScale', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/TerraScale/);
});
