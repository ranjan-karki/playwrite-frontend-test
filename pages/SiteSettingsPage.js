// @ts-check

export class SiteSettingsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // Nav
    this.siteLayoutNavLink = page.getByRole('link', { name: ' Site layout' });
    this.siteInstancesNavLink = page.getByRole('link', { name: ' Site instances' });

    // Settings
    this.settingsButton = page.getByRole('button', { name: ' Settings ' });
    this.multiInstanceEnabledLabel = page.getByText('Enabled', { exact: true }).first();
    this.multiInstanceDisabledLabel = page.getByText('Disabled', { exact: true }).first();
    this.multiInstanceSlider = page.locator('.slider').first();
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async openSettings() {
    await this.settingsButton.click();
  }

  async toggleMultiInstance() {
    await this.multiInstanceSlider.click();
  }

  async save() {
    await this.saveButton.click();
  }
}
