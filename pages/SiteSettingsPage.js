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

    // Instance limits - per a recorded flow, each row is opened by its position in the
    // settings table before its own spinbutton (found by its accessible name) appears.
    this.maxActiveLimitRow = page.locator('.flex-table-tbody > div:nth-child(3) > div').first();
    this.maxActiveLimitInput = page.getByRole('spinbutton', { name: 'Instance max active limit' });
    this.maxCreationLimitRow = page.locator('.flex-table-tbody > div:nth-child(2) > div').first();
    this.maxCreationLimitInput = page.getByRole('spinbutton', { name: 'Instance max creation limit' });
  }

  async openSettings() {
    await this.settingsButton.click();
  }

  async toggleMultiInstance() {
    await this.multiInstanceSlider.click();
  }

  async openMaxActiveLimitEditor() {
    await this.maxActiveLimitRow.click();
  }

  async openMaxCreationLimitEditor() {
    await this.maxCreationLimitRow.click();
  }

  async save() {
    await this.saveButton.click();
  }
}
