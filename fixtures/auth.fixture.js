// @ts-check
import { test as base, expect } from '@playwright/test';
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
