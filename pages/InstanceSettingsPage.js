// @ts-check
import { expect } from '@playwright/test';

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

    // Used by homepage-resources.spec.js's beforeAll on a freshly-created instance,
    // per a recorded flow - disabling this reveals Homepage resources.
    this.settingDisabledStatusNth2 = page.getByText('Disabled').nth(2);
    this.homepageResourcesSection = page.locator('div').filter({ hasText: /^Homepage resources$/ }).first();
    // Scoped to the settings table component, not just page.getByText - once enabled,
    // these also appear as nav links elsewhere on the page, which an unscoped locator
    // would also match (and can click instead, navigating away from Settings entirely).
    this.homepageResourcesRow = page.locator('app-site-instance-settings').getByText('Homepage resources');
    this.homepageLayoutRow = page.locator('app-site-instance-settings').getByText('Homepage layout');
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

  /**
   * Ensures the given nav link is visible, running the given Settings steps to switch
   * over first if it isn't. Used for mutually-exclusive homepage-type settings (Homepage
   * videos vs Homepage resources), where a retried beforeAll can land on an instance
   * already in the other state.
   * @param {import('@playwright/test').Locator} navLink
   * @param {() => Promise<void>} enable
   */
  async ensureNavLinkVisible(navLink, enable) {
    // isVisible() checks the current DOM synchronously with no retrying, but the page
    // we just navigated to may not have rendered its nav yet - waitFor here gives it a
    // real chance to appear before concluding it's genuinely absent and needs enabling.
    const alreadyVisible = await navLink
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (alreadyVisible) return;

    await enable();
    await expect(navLink).toBeVisible();
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
