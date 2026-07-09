// @ts-check
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

/**
 * @typedef {Object} AuthFixtures
 * @property {LoginPage} loginPage
 * @property {import('@playwright/test').Page} authenticatedPage
 */

const authFile = 'playwright/.auth/user.json';

/** @type {import('@playwright/test').TestType<
 *   import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & AuthFixtures,
 *   import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions
 * >} */
export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  /**
   * Single browser context/page reusing the session saved by tests/auth.setup.js.
   * Created once per worker and shared across all tests; each test reloads the sites
   * page itself instead of opening/closing a browser per test.
   */
  authenticatedPage: [
    async ({ browser }, use) => {
      const context = await browser.newContext({ storageState: authFile });
      const page = await context.newPage();
      await use(page);
      await context.close();
    },
    { scope: 'worker' },
  ],
});

export { expect };
