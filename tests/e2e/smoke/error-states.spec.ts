import { expect, test } from '@playwright/test';

import { assertNoPageErrors, attachPageErrorListeners } from '../support/page-guards';

const missingRoute = '/definitely-not-a-real-doc/';

test('smoke: missing route shows a not-found state', async ({ page }) => {
	const guards = attachPageErrorListeners(page);

	try {
		const response = await page.goto(missingRoute);
		const body = page.locator('body');

		if (response) {
			expect(response).not.toBeNull();
		} else {
			await expect(body).toBeVisible();
		}

		if (response) {
			const status = response.status();
			const bodyText = await body.innerText();

			expect(
				status !== 200 || /404|not found|missing|could not find|does not exist|error/i.test(bodyText),
				`Expected ${missingRoute} to return a non-200 response or show an error state`
			).toBe(true);
		} else {
			await expect(body).toContainText(/404|not found|missing|could not find|does not exist|error/i);
		}

		assertNoPageErrors({
			pageErrors: guards.pageErrors,
			consoleErrors: guards.consoleErrors.filter((error) => !error.includes('File not found'))
		});
	} finally {
		guards.cleanup();
	}
});
