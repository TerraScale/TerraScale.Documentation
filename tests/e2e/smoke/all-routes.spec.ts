import { expect, test } from '@playwright/test';

import {
	assertNoOverflow,
	assertNoPageErrors,
	attachPageErrorListeners,
	checkControlsActionable
} from '../support/page-guards';
import { getRoutes } from '../support/route-inventory.mjs';

type LocaleGroup = 'default' | 'en' | 'es' | 'pt-br';

const groupedRoutes = getRoutes();
const routes = (Object.entries(groupedRoutes) as Array<[LocaleGroup, string[]]>).flatMap(
	([locale, localeRoutes]) => localeRoutes.map((route) => ({ locale, route }))
);

test.describe.configure({ mode: 'parallel' });

for (const { locale, route } of routes) {
	test(`smoke: ${route} (${locale})`, async ({ page }) => {
		const guards = attachPageErrorListeners(page);

		try {
			const response = await page.goto(route);

			if (response) {
				const status = response.status();
				const isRedirect = status >= 300 && status < 400;
				expect(
					response.ok() || isRedirect,
					`Expected an OK or redirect response for ${route}, received ${status}`
				).toBe(true);
			}

			await expect(page.locator('main')).toBeVisible();
			assertNoPageErrors({
				pageErrors: guards.pageErrors,
				consoleErrors: guards.consoleErrors.filter((error) => !error.includes('File not found'))
			});
			await assertNoOverflow(page);
			await checkControlsActionable(page, 'header, main');
		} finally {
			guards.cleanup();
		}
	});
}
