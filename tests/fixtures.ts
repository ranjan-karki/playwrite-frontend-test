import { test as base, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

export const CREDENTIALS = {
  valid: {
    username: 'ranjan.karki@ensue.us',
    password: 'Ensue@2027',
  },
  wrongPassword: {
    username: 'ranjan.karki@ensue.us',
    password: 'wrong-password',
  },
  wrongUsername: {
    username: 'nobody@example.com',
    password: 'Ensue@2026',
  },
};

export const SITE_IDS = {
  main: 7,
  secondary: 10,
  deleted: 11,
};

export const LAYOUTS = {
  tile: 'lyb-global-tile',
  tilePlus: 'lyb-global-tile-plus',
} as const;

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
