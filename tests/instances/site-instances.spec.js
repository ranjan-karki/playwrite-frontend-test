// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { SiteSettingsPage } from '../../pages/SiteSettingsPage.js';
import { requireEnv } from '../../utils/env.js';

const siteName = requireEnv('TEST_SITE_NAME');
const instanceName = requireEnv('TEST_INSTANCE_NAME');

test.describe(`${siteName} site instances`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/manage/sites');
  });

  test('displays site instances page controls', async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);

    await sitesPage.selectSite(siteName);

    await expect(siteInstancesPage.heading).toBeVisible();
    await expect(siteInstancesPage.newInstanceButton).toBeVisible();
    await expect(siteInstancesPage.siteControlsPublished).toBeVisible();
    await expect(siteInstancesPage.publishedStatus).toBeVisible();
    await expect(siteInstancesPage.maintenanceMode).toBeVisible();
  });

  test('shows Site layout nav link when multi-instance is disabled', async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const settingsPage = new SiteSettingsPage(authenticatedPage);

    await sitesPage.selectSite(siteName);

    await expect(settingsPage.siteLayoutNavLink).toBeVisible();
  });

  test('toggles multi-instance and updates the nav link accordingly', async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const settingsPage = new SiteSettingsPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);

    await sitesPage.selectSite(siteName);

    await settingsPage.openSettings();
    await settingsPage.toggleMultiInstance();

    await expect(settingsPage.multiInstanceEnabledLabel).toBeVisible();

    await settingsPage.save();

    await expect(settingsPage.siteInstancesNavLink).toBeVisible();

    await settingsPage.siteInstancesNavLink.click();

    await expect(siteInstancesPage.heading).toBeVisible();

    await settingsPage.openSettings();
    await settingsPage.toggleMultiInstance();

    await expect(settingsPage.multiInstanceDisabledLabel).toBeVisible();

    await settingsPage.save();

    await expect(settingsPage.siteLayoutNavLink).toBeVisible();
  });

  test('shows a confirmation when setting an instance as default, and cancels it', async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);

    await sitesPage.selectSite(siteName);
    await siteInstancesPage.openRowActionsMenu(instanceName);
    await siteInstancesPage.setToDefaultMenuItem.click();

    await expect(siteInstancesPage.confirmDialog).toContainText(
      `Are you sure you want to set "${instanceName}" as the default instance?`
    );

    await siteInstancesPage.dialogCancelButton.click();
  });

  test('shows a confirmation when publishing an instance, and cancels it', async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);

    await sitesPage.selectSite(siteName);
    await siteInstancesPage.openRowActionsMenu(instanceName);
    await siteInstancesPage.publishMenuItem.click();

    await expect(siteInstancesPage.confirmDialog).toContainText(
      `Are you sure you want to set "${instanceName}" to active?`
    );

    await siteInstancesPage.dialogCancelButton.click();
  });
});
