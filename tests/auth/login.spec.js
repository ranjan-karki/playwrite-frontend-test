const { test, expect } = require('@playwright/test');
const { selectors } = require('../../support/selectors');
const { messages } = require('../../support/messages');
const { generateEmail, randomAlphaNumeric, randomNumber } = require('../../utils/basicUtils');
const { securityPayloads } = require('../../utils/securityPayloads');
const { login } = require('../../support/helpers');
const loginData = require('../../fixtures/loginInputData.json');

test.describe('Login Page Functionality', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test.describe('Form Validation', () => {
    test('should disable login button when both fields are empty', async ({ page }) => {
      await expect(page.locator(selectors.login.button)).toBeDisabled();
    });

    test('should disable login button when only username is filled', async ({ page }) => {
      await page.locator(selectors.login.userName).fill(loginData.valid_username);
      await expect(page.locator(selectors.login.button)).toBeDisabled();
    });

    test('should disable login button when only password is filled', async ({ page }) => {
      await page.locator(selectors.login.password).fill(loginData.valid_password);
      await expect(page.locator(selectors.login.button)).toBeDisabled();
    });

    test('should enable login button when both fields are filled', async ({ page }) => {
      await page.locator(selectors.login.userName).fill(loginData.invalid_username);
      await page.locator(selectors.login.password).fill(loginData.valid_password);
      await expect(page.locator(selectors.login.button)).toBeEnabled();
    });
  });

  test.describe('Login Attempts', () => {
    test('should show error for invalid username and invalid password', async ({ page }) => {
      await login(page, loginData.invalid_username, loginData.invalid_password);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.invalidCredentials);
    });

    test('should show error for invalid username and valid password', async ({ page }) => {
      await login(page, loginData.invalid_username, loginData.valid_password);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.invalidCredentials);
    });

    test('should show error for valid username and invalid password', async ({ page }) => {
      await login(page, loginData.valid_username, loginData.invalid_password);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.invalidCredentials);
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      await login(page, loginData.valid_username, loginData.valid_password);
      await expect(page).toHaveURL(/\/sites/, { timeout: 10000 });
      await expect(page.locator('.page-title-wrapper h1.title')).toHaveText('Sites management');
    });
  });

  test.describe('User Experience', () => {
    test('should handle Enter key press on password field', async ({ page }) => {
      await page.locator(selectors.login.userName).fill(loginData.valid_username);
      await page.locator(selectors.login.password).fill(loginData.valid_password);
      await page.locator(selectors.login.password).press('Enter');
      await expect(page).toHaveURL(/\/sites/, { timeout: 10000 });
      await expect(page.locator('.page-title-wrapper h1.title')).toHaveText('Sites management');
    });

    test('should handle case sensitivity in email', async ({ page }) => {
      await login(page, loginData.valid_username.toUpperCase(), loginData.valid_password);
      await expect(page).toHaveURL(/\/sites/, { timeout: 10000 });
      await expect(page.locator('.page-title-wrapper h1.title')).toHaveText('Sites management');
    });

    test('should handle case sensitivity in PASSWORD', async ({ page }) => {
      await login(page, loginData.valid_username, loginData.valid_password.toUpperCase());
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.invalidCredentials);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very long username', async ({ page }) => {
      const longEmail = generateEmail(100);
      await login(page, longEmail, loginData.valid_password);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
    });

    test('should handle very long password', async ({ page }) => {
      const longPassword = randomAlphaNumeric(200);
      await login(page, loginData.valid_username, longPassword);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.invalidCredentials);
    });

    test('should handle special characters in username', async ({ page }) => {
      const email = 'test +' + generateEmail(5);
      await login(page, email, loginData.valid_password);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.invalidCredentials);
    });

    test('should handle numeric password', async ({ page }) => {
      const number = String(randomNumber(10));
      await login(page, loginData.valid_username, number);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.invalidCredentials);
    });
  });

  test.describe('Security Tests', () => {
    test('should handle SQL injection attempts in username', async ({ page }) => {
      await login(page, securityPayloads.sql, loginData.invalid_password);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.invalidCredentials);
    });

    test('should handle SQL injection attempts in password', async ({ page }) => {
      await login(page, loginData.valid_username, securityPayloads.sql);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
    });

    test('should handle XSS attempts in username', async ({ page }) => {
      await login(page, securityPayloads.xss, loginData.valid_password);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
    });

    test('should not display password in plain text', async ({ page }) => {
      await expect(page.locator(selectors.login.password)).toHaveAttribute('type', 'password');
    });

    test('should block login after 5 consecutive failed attempts', async ({ page }) => {
      for (let i = 1; i <= 6; i++) {
        await login(page, loginData.invalid_username, loginData.invalid_password);
        await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      }

      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.rateLimit);

      await login(page, loginData.valid_username, loginData.valid_password);
      await expect(page.locator(selectors.login.loginToast)).toBeVisible();
      await expect(page.locator(selectors.login.loginToast)).toContainText(messages.rateLimit);
    });
  });
});
