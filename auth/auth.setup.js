const { test, expect } = require('@playwright/test');
const envConfig = require('../playwright.env.json')[process.env.ENV || 'local'];
const { selectors } = require('../support/selectors');

const STORAGE_STATE = 'auth/storageState.json';

test('authenticate as master admin', async ({ page }) => {
  await page.goto('/auth/login');

  await page.locator(selectors.login.userName).fill(envConfig.masterAdmin.username);
  await page.locator(selectors.login.password).fill(envConfig.masterAdmin.password);

  const loginResponse = page.waitForResponse(res =>
    res.url().includes('/api/auth/authenticate') && res.status() === 200
  );
  await page.locator(selectors.login.button).click();
  await loginResponse;

  await expect(page).toHaveURL(/\/sites/);
  await page.context().storageState({ path: STORAGE_STATE });
});

module.exports = { STORAGE_STATE };
