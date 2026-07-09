// @ts-check

export class InstanceSettingsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.settingsLink = page.getByRole('link', { name: 'Settings' });
    this.heading = page.getByRole('heading', { name: 'Settings', exact: true });

    // Info tooltip
    this.infoIcon = page.locator('.fas.fa-info-circle');
    this.tooltip = page.locator('.page-tooltip');
    this.tooltipHeading = page.locator('h4');
    this.tooltipCloseIcon = page.locator('.far.fa-times');
    this.tooltipBody = page.locator('#no-id-tooltip');
    this.pageSectionHeading = page.getByRole('heading', { name: 'Page', exact: true });

    // Setting toggle controls (single slider/value shown at a time, for whichever row is selected)
    this.slider = page.locator('.slider');
    this.valueLabel = page.locator('#value');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.closeButton = page.getByRole('button', { name: 'Close' });

    // Setting rows referenced by the recorded flow
    this.firstSettingDisabledStatus = page.getByText('Disabled').first();
    this.settingEnabledStatusNth1 = page.getByText('Enabled').nth(1);
    this.settingDisabledStatusNth2 = page.getByText('Disabled').nth(2);
    this.homepageResourcesSection = page.locator('div').filter({ hasText: /^Homepage resources$/ }).first();
    this.homepageResourcesRow = page.getByText('Homepage resources');
    this.buttonsSettingRow = page.locator('app-site-instance-settings').getByText('Buttons');
    this.disabledSettingRow = page.locator('div').filter({ hasText: /^Disabled$/ }).first();
    this.editSettingsModalPrompt = page.locator('#nico-modal-body div').filter({ hasText: 'Edit settings' });
  }

  async open() {
    await this.settingsLink.click();
  }

  async openInfoTooltip() {
    await this.infoIcon.click();
  }

  async closeInfoTooltip() {
    await this.tooltipCloseIcon.click();
  }

  async toggleSlider() {
    await this.slider.click();
  }

  async save() {
    await this.saveButton.click();
  }

  async close() {
    await this.closeButton.click();
  }

  /** @param {string} name */
  navLink(name) {
    return this.page.getByRole('link', { name });
  }
}
