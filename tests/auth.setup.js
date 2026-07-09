// @ts-check
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { standardUser } from '../test-data/users.js';
import { requireEnv } from '../utils/env.js';

const authFile = 'playwright/.auth/user.json';
const siteName = requireEnv('TEST_SITE_NAME');

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(standardUser.email, standardUser.password);

  // The post-login redirect and sites table can take longer than the default timeout.
  await expect(page.getByText(siteName, { exact: true })).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
