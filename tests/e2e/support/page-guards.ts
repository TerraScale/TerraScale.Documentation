import { expect, type ConsoleMessage, type Page } from '@playwright/test';

export type PageGuards = {
	pageErrors: string[];
	consoleErrors: string[];
	cleanup: () => void;
};

export function attachPageErrorListeners(page: Page): PageGuards {
	const pageErrors: string[] = [];
	const consoleErrors: string[] = [];

	const onPageError = (error: Error) => {
		pageErrors.push(error.stack ?? error.message);
	};

	const onConsole = (message: ConsoleMessage) => {
		if (message.type() !== 'error') {
			return;
		}

		consoleErrors.push(message.text());
	};

	page.on('pageerror', onPageError);
	page.on('console', onConsole);

	return {
		pageErrors,
		consoleErrors,
		cleanup: () => {
			page.off('pageerror', onPageError);
			page.off('console', onConsole);
		}
	};
}

export function assertNoPageErrors(guards: Pick<PageGuards, 'pageErrors' | 'consoleErrors'>): void {
	const errors = [...guards.pageErrors.map((error) => `pageerror: ${error}`), ...guards.consoleErrors.map((error) => `console: ${error}`)];

	expect(errors, errors.join('\n\n')).toEqual([]);
}

export async function hasHorizontalOverflow(page: Page): Promise<boolean> {
	return page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth
	);
}

export async function assertNoOverflow(page: Page): Promise<void> {
	expect(await hasHorizontalOverflow(page)).toBe(false);
}

export async function checkControlsActionable(page: Page, selector: string): Promise<number> {
	const controls = page.locator(`${selector} button:visible, ${selector} a[href]:visible`);
	const count = await controls.count();
	let checked = 0;
	const pageOrigin = new URL(page.url()).origin;

	for (let index = 0; index < count; index += 1) {
		const control = controls.nth(index);
		const tagName = await control.evaluate((element) => element.tagName.toLowerCase());

		if (tagName === 'a') {
			const href = await control.getAttribute('href');
			if (!href) {
				continue;
			}

			if (href.startsWith('#')) {
				continue;
			}

			const controlOrigin = new URL(href, page.url()).origin;
			if (controlOrigin !== pageOrigin) {
				continue;
			}
		}

		await control.click({ trial: true });
		checked += 1;
	}

	return checked;
}
