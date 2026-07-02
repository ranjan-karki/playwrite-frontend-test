// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { standardUser } from '../../test-data/users.js';


test.describe('Login validation', () => {
  test('Login button is disabled when username is empty', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillPassword(standardUser.password);

    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('Login button is disabled when password is empty', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillUsername(standardUser.email);

    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('Login button is disabled when both fields are empty', async ({ loginPage }) => {
    await loginPage.goto();

    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('shows an error message for an invalid username/password combination', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid.user@ensue.us', 'WrongPassword123!');

    await expect(loginPage.invalidCredentialsError).toBeVisible();
    await expect(loginPage.invalidCredentialsError).toHaveText('Invalid username/password combination.×');
  });
  test.describe('Login', () => {
  test('logs in with valid credentials and lands on the sites page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(standardUser.email, standardUser.password);

    // The post-login redirect and sites table can take longer than the default timeout.
    await expect(page.getByText('Pet-benefits', { exact: true })).toBeVisible({ timeout: 15_000 });
  });
});
});
