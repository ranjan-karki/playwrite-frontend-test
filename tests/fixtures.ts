import { test as base, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { CREDENTIALS, SITE_NAMES, LIMITS, LAYOUTS, INVALID_SLUGS } from './data/testData';

export { CREDENTIALS, SITE_NAMES, LIMITS, LAYOUTS, INVALID_SLUGS };
export { expect } from '@playwright/test';

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.valid.username, CREDENTIALS.valid.password);
    await page.waitForURL('**/manage/sites**');
    await use(page);
  },
});
