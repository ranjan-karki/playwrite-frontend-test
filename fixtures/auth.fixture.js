// @ts-check
import { test as base, expect } from '@playwright/test';
import { parentSuite } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage.js';
import { standardUser } from '../test-data/users.js';
import { requireEnv } from '../utils/env.js';

/**
 * @typedef {Object} AuthFixtures
 * @property {LoginPage} loginPage
 */

/**
 * @typedef {Object} AuthWorkerFixtures
 * @property {import('@playwright/test').Page} authenticatedPage
 */

const siteName = requireEnv('TEST_SITE_NAME');

/** @type {import('@playwright/test').TestType<
 *   import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & AuthFixtures,
 *   import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions & AuthWorkerFixtures
 * >} */
export const test = base.extend(
  /** @type {import('@playwright/test').Fixtures<
   *   AuthFixtures,
   *   AuthWorkerFixtures,
   *   import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions,
   *   import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions
   * >} */ ({
    // Group every test under one Allure parent suite ("Frontend E2E") so it sits
    // next to Backend Unit / Backend E2E in the combined dashboard.
    _allureParentSuite: [async ({}, use) => {
      await parentSuite('Frontend E2E');
      await use(undefined);
    }, { auto: true }],

    loginPage: async ({ page }, use) => {
      await use(new LoginPage(page));
    },

    /**
     * Logs in once per worker and shares the same page across all tests, so the
     * browser stays open for the whole run and only closes when the worker is done.
     * Each test reloads the sites page itself instead of opening/closing a browser.
     */
    authenticatedPage: [
      /**
       * @param {import('@playwright/test').PlaywrightWorkerArgs} fixtures
       * @param {(page: import('@playwright/test').Page) => Promise<void>} use
       */
      async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Surface app-side failures in the CI log so a hang (e.g. a request that
        // never resolves and leaves the loading overlay stuck) names its cause.
        page.on('pageerror', (e) => console.log(`[browser:pageerror] ${e.message}`));
        page.on('console', (m) => { if (m.type() === 'error') console.log(`[browser:error] ${m.text()}`); });
        page.on('requestfailed', (r) => console.log(`[net:failed] ${r.method()} ${r.url()} — ${r.failure()?.errorText || ''}`));
        page.on('response', (r) => { if (r.status() >= 500) console.log(`[net:${r.status()}] ${r.request().method()} ${r.url()}`); });

        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(standardUser.email, standardUser.password);
        // The post-login redirect and sites table can take longer than the default timeout.
        await expect(page.getByText(siteName, { exact: true })).toBeVisible({ timeout: 15_000 });

        await use(page);
        await context.close();
      },
      { scope: 'worker' },
    ],
  })
);

export { expect };
