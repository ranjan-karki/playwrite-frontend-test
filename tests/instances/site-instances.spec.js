// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { SiteSettingsPage } from '../../pages/SiteSettingsPage.js';
import { requireEnv } from '../../utils/env.js';
import { targetInstanceTitles, fillerSlugs } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');
// Instance names vary per environment, so the suite creates (and later deletes)
// its own target row instead of expecting one to already exist.
const instanceName = targetInstanceTitles.rowActions;

test.describe(`${siteName} site instances`, () => {
  test.beforeAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await form.openNewInstanceForm();
    await form.fillTitle(instanceName);
    await form.fillSlug(fillerSlugs.rowActionsTarget);
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(instanceName, { exact: true })).toBeVisible();
  });

  test.afterAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await form.deleteInstance(instanceName);

    await expect(authenticatedPage.getByText(instanceName, { exact: true })).not.toBeVisible();
  });

  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/manage/sites');
  });

  test.describe('page controls', () => {
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
  });

  test.describe('multi-instance setting', () => {
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
  });

  test.describe('row actions', () => {
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
});
