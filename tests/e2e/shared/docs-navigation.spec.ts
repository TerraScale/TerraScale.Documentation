import { expect, test, type Locator, type Page } from '@playwright/test';

import { strings, type LocalePrefix } from '../support/locale-strings';
import { assertNoPageErrors, attachPageErrorListeners } from '../support/page-guards';
import { getRoutes } from '../support/route-inventory.mjs';

const locales = ['en', 'es', 'pt-br'] as const satisfies readonly LocalePrefix[];
const preferredSharedDocsRoute = '/guides/getting-started/';
const sharedDocsRoute = resolveSharedDocsRoute();

function resolveSharedDocsRoute(): string {
	const routes = getRoutes() as Record<LocalePrefix | 'default', string[]>;
	const sharedRoutes = routes.en
		.map(stripLocalePrefix)
		.filter(isDocsRoute)
		.filter((route) => locales.every((locale) => routes[locale].includes(toLocalizedRoute(locale, route))));

	if (sharedRoutes.includes(preferredSharedDocsRoute)) {
		return preferredSharedDocsRoute;
	}

	const [firstSharedRoute] = sharedRoutes;

	if (!firstSharedRoute) {
		throw new Error('No locale-shared docs route found in the build-derived route inventory.');
	}

	return firstSharedRoute;
}

function stripLocalePrefix(route: string): string {
	return route.replace(/^\/(en|es|pt-br)(?=\/|$)/, '') || '/';
}

function isDocsRoute(route: string): boolean {
	return route !== '/' && route !== '/blog/' && route !== '/roadmap/';
}

function toLocalizedRoute(locale: LocalePrefix, route: string): string {
	return route === '/' ? `/${locale}/` : `/${locale}${route}`;
}

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSidebar(page: Page): Locator {
	return page.locator('section > aside').first();
}

function getPrevNextNav(page: Page): Locator {
	return page.locator('article[data-prose] + nav');
}

function getPrevNextControl(nav: Locator, label: string): Locator {
	return nav.locator('a').filter({ hasText: label });
}

async function assertCurrentPageActiveInSidebar(page: Page, localizedRoute: string): Promise<void> {
	const activeLink = getSidebar(page).locator(`a[href="${localizedRoute}"]`).first();

	await expect(activeLink).toBeVisible();
	await expect(activeLink).toHaveClass(/border-blue-500/);
	await expect(activeLink).toHaveClass(/font-medium/);
}

async function assertDocsNavToggleBehavior(page: Page): Promise<void> {
	const navToggle = getSidebar(page).locator('button[aria-expanded]').first();

	if ((await navToggle.count()) === 0) {
		return;
	}

	const initialState = await navToggle.getAttribute('aria-expanded');
	const nextState = initialState === 'true' ? 'false' : 'true';

	await navToggle.click();
	await expect(navToggle).toHaveAttribute('aria-expanded', nextState);
	await navToggle.click();
	await expect(navToggle).toHaveAttribute('aria-expanded', initialState ?? 'true');
}

async function assertTableOfContentsBehavior(page: Page, locale: LocalePrefix): Promise<void> {
	const ui = strings[locale];
	const articleHeadings = page.locator('article[data-prose] :is(h2, h3)[id]');
	const headingCount = await articleHeadings.count();
	const tocHeading = page.getByRole('heading', { name: ui.toc.heading, exact: true });
	const tocLinks = page.locator('aside a[href^="#"]');

	if (headingCount === 0) {
		await expect(tocHeading).toHaveCount(0);
		await expect(tocLinks).toHaveCount(0);
		return;
	}

	await expect(tocHeading).toBeVisible();
	await expect(tocLinks.first()).toBeVisible();

	const firstTocLink = tocLinks.first();
	const targetHash = await firstTocLink.getAttribute('href');

	if (!targetHash) {
		throw new Error('Expected first TOC link to include a fragment target.');
	}

	const targetHeading = page.locator(targetHash);

	await firstTocLink.click();
	await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe(targetHash);
	await expect(targetHeading).toBeVisible();
	await expect
		.poll(() =>
			targetHeading.evaluate((element) => {
				const rect = element.getBoundingClientRect();
				return rect.top < window.innerHeight && rect.bottom > 0;
			})
		)
		.toBe(true);
}

async function getPrevNextCounts(page: Page, locale: LocalePrefix): Promise<{ previousCount: number; nextCount: number }> {
	const ui = strings[locale];
	const prevNextNav = getPrevNextNav(page);

	return {
		previousCount: await getPrevNextControl(prevNextNav, ui.prevNext.previous).count(),
		nextCount: await getPrevNextControl(prevNextNav, ui.prevNext.next).count()
	};
}

async function navigateToRouteWithPrevNext(page: Page, locale: LocalePrefix, currentRoute: string): Promise<string> {
	const sidebarLinks = await getSidebar(page)
		.locator('a[href^="/"]')
		.evaluateAll((elements) =>
			elements
				.map((element) => element.getAttribute('href'))
				.filter((href): href is string => Boolean(href))
		);
	const candidateRoutes = [...new Set(sidebarLinks)].filter((href) => href !== currentRoute);

	for (const candidateRoute of candidateRoutes) {
		await page.goto(candidateRoute);

		const { previousCount, nextCount } = await getPrevNextCounts(page, locale);

		if (previousCount + nextCount > 0) {
			return candidateRoute;
		}
	}

	throw new Error('Could not find a localized docs page with previous or next navigation controls.');
}

async function assertBoundaryControlAbsent(page: Page, locale: LocalePrefix): Promise<void> {
	const ui = strings[locale];
	const visitedPaths = new Set<string>();

	for (let step = 0; step < 20; step += 1) {
		const prevNextNav = getPrevNextNav(page);
		const previousControl = getPrevNextControl(prevNextNav, ui.prevNext.previous);
		const nextControl = getPrevNextControl(prevNextNav, ui.prevNext.next);
		const previousCount = await previousControl.count();
		const nextCount = await nextControl.count();

		if (previousCount === 0) {
			await expect(previousControl).toHaveCount(0);
			return;
		}

		if (nextCount === 0) {
			await expect(nextControl).toHaveCount(0);
			return;
		}

		const currentPath = new URL(page.url()).pathname;

		if (visitedPaths.has(currentPath)) {
			break;
		}

		visitedPaths.add(currentPath);

		const previousHref = await previousControl.first().getAttribute('href');

		if (!previousHref) {
			break;
		}

		await Promise.all([
			page.waitForURL(new RegExp(`${escapeRegex(previousHref)}$`)),
			previousControl.first().click()
		]);
	}

	throw new Error('Could not confirm a docs navigation boundary with a missing previous or next control.');
}

test.describe('desktop docs navigation across shared localized routes', () => {
	test.describe.configure({ mode: 'parallel' });

	for (const locale of locales) {
		test(`docs sidebar, toc, anchors, and prev-next work for ${locale}`, async ({ page }, testInfo) => {
			test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Chromium only');

			const guards = attachPageErrorListeners(page);
			const localizedRoute = toLocalizedRoute(locale, sharedDocsRoute);
			const ui = strings[locale];

			try {
				await page.goto(localizedRoute);

				await expect(getSidebar(page)).toBeVisible();
				await assertCurrentPageActiveInSidebar(page, localizedRoute);
				await assertDocsNavToggleBehavior(page);
				await assertTableOfContentsBehavior(page, locale);

				let prevNextRoute = localizedRoute;
				let { previousCount, nextCount } = await getPrevNextCounts(page, locale);

				if (previousCount === 0) {
					await expect(getPrevNextControl(getPrevNextNav(page), ui.prevNext.previous)).toHaveCount(0);
				}

				if (nextCount === 0) {
					await expect(getPrevNextControl(getPrevNextNav(page), ui.prevNext.next)).toHaveCount(0);
				}

				if (previousCount + nextCount === 0) {
					prevNextRoute = await navigateToRouteWithPrevNext(page, locale, localizedRoute);
					await assertCurrentPageActiveInSidebar(page, prevNextRoute);
					({ previousCount, nextCount } = await getPrevNextCounts(page, locale));
				}

				expect(previousCount + nextCount).toBeGreaterThan(0);

				const prevNextNav = getPrevNextNav(page);
				const previousControl = getPrevNextControl(prevNextNav, ui.prevNext.previous);
				const nextControl = getPrevNextControl(prevNextNav, ui.prevNext.next);

				const navigationControl = nextCount > 0 ? nextControl.first() : previousControl.first();
				const destinationHref = await navigationControl.getAttribute('href');

				if (!destinationHref) {
					throw new Error('Expected prev-next navigation control to include an href.');
				}

				await Promise.all([
					page.waitForURL(new RegExp(`${escapeRegex(destinationHref)}$`)),
					navigationControl.click()
				]);

				await expect(page).toHaveURL(new RegExp(`${escapeRegex(destinationHref)}$`));

				const returnLabel = nextCount > 0 ? ui.prevNext.previous : ui.prevNext.next;
				await expect(getPrevNextControl(getPrevNextNav(page), returnLabel).first()).toHaveAttribute(
					'href',
					prevNextRoute
				);

				if (previousCount > 0 && nextCount > 0) {
					await assertBoundaryControlAbsent(page, locale);
				}

				assertNoPageErrors(guards);
			} finally {
				guards.cleanup();
			}
		});
	}
});
