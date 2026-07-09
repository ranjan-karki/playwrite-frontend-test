// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { InstanceSettingsPage } from '../../pages/InstanceSettingsPage.js';
import { requireEnv } from '../../utils/env.js';

const siteName = requireEnv('TEST_SITE_NAME');
const primaryInstanceName = 'Primary';

test.describe(`${siteName} - Instance settings`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await siteInstancesPage.openInstance(primaryInstanceName);
  });

  // These tests are order-dependent: each one saves a setting change that the next test's
  // locators (nth-based status labels, nav links) rely on being in place.

  test('displays the Settings page heading and info tooltip', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await expect(settingsPage.heading).toBeVisible();

    await settingsPage.openInfoTooltip();

    await expect(settingsPage.tooltip).toBeVisible();
    await expect(settingsPage.tooltipHeading).toBeVisible();
    await expect(settingsPage.tooltipCloseIcon).toBeVisible();
    await expect(settingsPage.tooltipBody).toContainText('Settings can be managed here.');
    await expect(settingsPage.tooltipBody).toContainText('These options controls what features to be enabled to your site.');
    await expect(settingsPage.pageSectionHeading).toBeVisible();

    await settingsPage.closeInfoTooltip();
  });

  test('enabling the first setting shows the Homepage layout nav link', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await expect(settingsPage.firstSettingDisabledStatus).toBeVisible();
    await settingsPage.firstSettingDisabledStatus.click();
    await settingsPage.toggleSlider();

    await expect(settingsPage.valueLabel.getByText('Enabled')).toBeVisible();

    await settingsPage.save();

    await expect(settingsPage.settingEnabledStatusNth1).toBeVisible();
    await expect(settingsPage.navLink('Homepage layout')).toBeVisible();
  });

  test('disabling the first setting reveals Homepage resources', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await settingsPage.settingEnabledStatusNth1.click();
    await settingsPage.toggleSlider();

    await expect(settingsPage.valueLabel.getByText('Disabled')).toBeVisible();

    await settingsPage.save();

    await expect(settingsPage.homepageResourcesSection).toBeVisible();
  });

  test('enabling Homepage resources shows its nav link', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await settingsPage.homepageResourcesRow.click();
    await settingsPage.toggleSlider();
    await settingsPage.save();

    await expect(settingsPage.navLink('Homepage resources')).toBeVisible();
  });

  test('disabling Homepage resources shows Homepage videos and Buttons nav links', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await settingsPage.settingEnabledStatusNth1.click();
    await settingsPage.toggleSlider();
    await settingsPage.save();

    await expect(settingsPage.navLink('Homepage videos')).toBeVisible();
    await expect(settingsPage.navLink('Buttons')).toBeVisible();
  });

  test('disabling the Buttons setting updates its status to Disabled', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await settingsPage.buttonsSettingRow.click();
    await settingsPage.toggleSlider();
    await settingsPage.save();

    await expect(settingsPage.settingDisabledStatusNth2).toBeVisible();
  });

  test('re-enabling the Buttons setting shows its nav link again', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await settingsPage.settingDisabledStatusNth2.click();
    await settingsPage.toggleSlider();
    await settingsPage.save();

    await expect(settingsPage.navLink('Buttons')).toBeVisible();
  });

  test('enabling the first setting again shows the Homepage layout nav link', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await settingsPage.firstSettingDisabledStatus.click();
    await settingsPage.toggleSlider();
    await settingsPage.save();

    await expect(settingsPage.navLink('Homepage layout')).toBeVisible();
  });

  test('dismisses the edit settings prompt without saving, then enables the next setting', async ({ authenticatedPage }) => {
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await settingsPage.open();

    await settingsPage.disabledSettingRow.click();
    await settingsPage.toggleSlider();
    await settingsPage.editSettingsModalPrompt.click();
    await settingsPage.close();

    await settingsPage.settingEnabledStatusNth1.click();
    await settingsPage.toggleSlider();
    await settingsPage.save();
  });
});
