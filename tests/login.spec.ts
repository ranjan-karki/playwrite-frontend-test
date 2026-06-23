import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { CREDENTIALS } from './fixtures';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('login page renders all expected elements', async () => {
    await loginPage.assertOnLoginPage();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  // ── Login button enable / disable logic ───────────────────────────────────

  test('login button is disabled when both fields are empty', async () => {
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('login button is disabled when only username is filled', async () => {
    await loginPage.usernameInput.fill(CREDENTIALS.valid.username);
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('login button is disabled when only password is filled', async () => {
    await loginPage.passwordInput.fill(CREDENTIALS.valid.password);
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('login button is enabled when both username and password are filled', async () => {
    await loginPage.usernameInput.fill(CREDENTIALS.valid.username);
    await loginPage.passwordInput.fill(CREDENTIALS.valid.password);
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('successful login navigates to Sites management', async ({ page }) => {
    await loginPage.login(CREDENTIALS.valid.username, CREDENTIALS.valid.password);
    await expect(page.getByRole('heading', { name: 'Sites management' })).toBeVisible();
    await expect(page.locator('h1')).toContainText('Sites management');
  });

  test('wrong password shows invalid credentials error', async () => {
    await loginPage.login(CREDENTIALS.wrongPassword.username, CREDENTIALS.wrongPassword.password);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorDetail).toBeVisible();
  });

  test('wrong username shows invalid credentials error', async () => {
    await loginPage.login(CREDENTIALS.wrongUsername.username, CREDENTIALS.wrongUsername.password);
    await expect(loginPage.errorBanner).toBeVisible();
  });

  test('forgot password link shows cancel option', async () => {
    await loginPage.forgotPasswordLink.click();
    await expect(loginPage.cancelLink).toBeVisible();
  });

  test('cancel on forgot password returns to login form', async () => {
    await loginPage.forgotPasswordLink.click();
    await loginPage.cancelLink.click();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.heading).toBeVisible();
  });
});
