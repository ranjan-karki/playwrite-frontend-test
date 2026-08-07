// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { InstanceSettingsPage } from '../../pages/InstanceSettingsPage.js';
import { HomepageResourcesPage } from '../../pages/HomepageResourcesPage.js';
import { requireEnv } from '../../utils/env.js';
import { targetInstanceTitles, fillerSlugs } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');
// The suite creates (and later deletes) its own target instance rather than depending
// on an environment-specific one, so the "Homepage resources" nav link is reached the
// same way for any environment this runs against.
const instanceName = targetInstanceTitles.homepageResources;

test.describe(`${siteName} - Homepage resources`, () => {
  test.beforeAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);
    const settingsPage = new InstanceSettingsPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await form.openNewInstanceForm();
    await form.fillTitle(instanceName);
    await form.fillSlug(fillerSlugs.homepageResourcesTarget);
    await form.blurSlugInput();
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(instanceName, { exact: true })).toBeVisible();

    // New instances default to "Homepage videos" - the resources tabs only appear
    // once the "Homepage resources" setting is switched on for this instance.
    await form.openInstance(instanceName);
    await settingsPage.open();
    await settingsPage.homepageResourcesRow.click();
    await settingsPage.toggleSlider();
    await settingsPage.save();

    await expect(settingsPage.navLink('Homepage resources')).toBeVisible();
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
    const sitesPage = new SitesPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);
    const resourcesPage = new HomepageResourcesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await siteInstancesPage.openInstance(instanceName);
    await resourcesPage.open();
  });

  test.describe('Documents tab', () => {
    test('opens the Documents tab and shows its action control', async ({ authenticatedPage }) => {
      const resourcesPage = new HomepageResourcesPage(authenticatedPage);

      await resourcesPage.selectTab(resourcesPage.documentsTab);

      await expect(resourcesPage.documentsTab).toBeVisible();
      await expect(resourcesPage.actionButton).toBeVisible();
    });
  });

  test.describe('Images tab', () => {
    test('opens the Images tab and shows its action control', async ({ authenticatedPage }) => {
      const resourcesPage = new HomepageResourcesPage(authenticatedPage);

      await resourcesPage.selectTab(resourcesPage.imagesTab);

      await expect(resourcesPage.imagesTab).toBeVisible();
      await expect(resourcesPage.actionButton).toBeVisible();
    });
  });

  test.describe('Links tab', () => {
    test('opens the Links tab and shows its action control', async ({ authenticatedPage }) => {
      const resourcesPage = new HomepageResourcesPage(authenticatedPage);

      await resourcesPage.selectTab(resourcesPage.linksTab);

      await expect(resourcesPage.linksTab).toBeVisible();
      await expect(resourcesPage.actionButton).toBeVisible();
    });
  });
});
