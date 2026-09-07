// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { InstanceSettingsPage } from '../../pages/InstanceSettingsPage.js';
import { SiteBuilderPage } from '../../pages/SiteBuilderPage.js';
import { requireEnv } from '../../utils/env.js';
import { targetInstanceTitles, fillerSlugs } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');
// The suite creates (and later deletes) its own target instance rather than depending
// on an environment-specific one, so these settings toggles are reached the same way
// for any environment this runs against.
const instanceName = targetInstanceTitles.instanceSettings;

test.describe(`${siteName} - Instance settings`, () => {
  test.beforeAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const builder = new SiteBuilderPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await builder.openSiteInstances();
    await form.openNewInstanceForm();
    await form.fillTitle(instanceName);
    await form.fillSlug(fillerSlugs.instanceSettingsTarget);
    await form.blurSlugInput();
    await form.createButton.click();
    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(instanceName, { exact: true })).toBeVisible();
  });

  test.afterAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const builder = new SiteBuilderPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await builder.openSiteInstances();
    await form.deleteInstance(instanceName);
    await expect(authenticatedPage.getByText(instanceName, { exact: true })).not.toBeVisible();
  });

  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const builder = new SiteBuilderPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await builder.openSiteInstances();
    await siteInstancesPage.openInstance(instanceName);
  });

  test.describe('page display', () => {
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
  });

  // These tests are order-dependent: each one saves a setting change that the next test's
  // locators (nth-based status labels, nav links) rely on being in place.
  test.describe('setting toggles', () => {
    test('enabling the first setting shows the Homepage layout nav link', async ({ authenticatedPage }) => {
      const settingsPage = new InstanceSettingsPage(authenticatedPage);
      await settingsPage.open();
      await expect(settingsPage.homepageLayoutRow).toBeVisible();
      await settingsPage.homepageLayoutRow.click();
      await settingsPage.toggleSlider();
      await expect(settingsPage.valueLabel.getByText('Enabled')).toBeVisible();
      await settingsPage.save();
      await expect(settingsPage.navLink('Homepage layout')).toBeVisible();
    });

    test('disabling the first setting reveals Homepage resources', async ({ authenticatedPage }) => {
      const settingsPage = new InstanceSettingsPage(authenticatedPage);

      await settingsPage.open();

      await settingsPage.homepageLayoutRow.click();
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
      await settingsPage.homepageResourcesRow.click();
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
      await expect(settingsPage.valueLabel.getByText('Disabled')).toBeVisible();
      await settingsPage.save();
    });

    test('re-enabling the Buttons setting shows its nav link again', async ({ authenticatedPage }) => {
      const settingsPage = new InstanceSettingsPage(authenticatedPage);
      await settingsPage.open();
      await settingsPage.buttonsSettingRow.click();
      await settingsPage.toggleSlider();
      await settingsPage.save();
      await expect(settingsPage.navLink('Buttons')).toBeVisible();
    });

    test('enabling the first setting again shows the Homepage layout nav link', async ({ authenticatedPage }) => {
      const settingsPage = new InstanceSettingsPage(authenticatedPage);
      await settingsPage.open();
      await settingsPage.homepageLayoutRow.click();
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
      await settingsPage.homepageLayoutRow.click();
      await settingsPage.toggleSlider();
      await settingsPage.save();
    });
  });
});
