// @ts-check

export class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.invalidCredentialsError = page.getByText('Invalid username/password combination.×');
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  /** @param {string} username */
  async fillUsername(username) {
    await this.usernameInput.click();
    await this.usernameInput.fill(username);
  }

  /** @param {string} password */
  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  /**
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.fillUsername(email);
    await this.fillPassword(password);
    await this.loginButton.click();
  }
}
