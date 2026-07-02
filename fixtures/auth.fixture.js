// @ts-check
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { standardUser } from '../test-data/users.js';

/**
 * @typedef {Object} AuthFixtures
 * @property {LoginPage} loginPage
 * @property {import('@playwright/test').Page} authenticatedPage
 */

/** @type {import('@playwright/test').TestType<
 *   import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & AuthFixtures,
 *   import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions
 * >} */
export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  /** Page that is already logged in and sitting on the sites page. */
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(standardUser.email, standardUser.password);
    await use(page);
  },
});

export { expect };
