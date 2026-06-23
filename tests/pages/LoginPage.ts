import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly cancelLink: Locator;
  readonly errorBanner: Locator;
  readonly errorDetail: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole('img', { name: 'lyb-logo' });
    this.heading = page.getByRole('heading', { name: 'Login' });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.cancelLink = page.getByRole('link', { name: 'Cancel' });
    this.errorBanner = page.getByText('Invalid username/password');
    this.errorDetail = page.getByText('Invalid username/password combination');
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async assertOnLoginPage() {
    await expect(this.logo).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
