// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { HomepageVideosPage } from '../../pages/HomepageVideosPage.js';
import { requireEnv } from '../../utils/env.js';
import { targetInstanceTitles, fillerSlugs } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');
const instanceName = targetInstanceTitles.homepageVideos;

test.describe(`${siteName} - Homepage videos`, () => {
  test.beforeAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await form.openNewInstanceForm();
    await form.fillTitle(instanceName);
    await form.fillSlug(fillerSlugs.homepageVideosTarget);
    await form.blurSlugInput();
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
    const sitesPage = new SitesPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);
    const videosPage = new HomepageVideosPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await siteInstancesPage.openInstance(instanceName);
    await videosPage.open();
  });

  test.describe('page display', () => {
    test('displays the video library', async ({ authenticatedPage }) => {
      const videosPage = new HomepageVideosPage(authenticatedPage);

      await expect(videosPage.libraryCards.first()).toBeVisible();
    });
  });

  test.describe('bucket management', () => {
    test('adds videos from the library to the bucket', async ({ authenticatedPage }) => {
      const videosPage = new HomepageVideosPage(authenticatedPage);

      await videosPage.addFirstLibraryVideoToBucket();
      await expect(videosPage.bucketItems).toHaveCount(1);

      await videosPage.addFirstLibraryVideoToBucket();
      await expect(videosPage.bucketItems).toHaveCount(2);
    });

    test('keeps the video in the bucket when removal is cancelled', async ({ authenticatedPage }) => {
      const videosPage = new HomepageVideosPage(authenticatedPage);

      await videosPage.addFirstLibraryVideoToBucket();
      const bucketCountBefore = await videosPage.bucketItems.count();

      await videosPage.requestRemoveFirstBucketItem();
      await videosPage.cancelRemoval();

      await expect(videosPage.bucketItems).toHaveCount(bucketCountBefore);
    });

    test('removes a video from the bucket and returns it to the library once confirmed', async ({ authenticatedPage }) => {
      const videosPage = new HomepageVideosPage(authenticatedPage);

      await videosPage.addFirstLibraryVideoToBucket();
      const bucketCountBefore = await videosPage.bucketItems.count();
      const removedVideoText = await videosPage.bucketItems.first().innerText();

      await videosPage.requestRemoveFirstBucketItem();
      await expect(videosPage.confirmDialogHeading).toBeVisible();
      await videosPage.proceedWithRemoval();

      await expect(videosPage.bucketItems).toHaveCount(bucketCountBefore - 1);
      await expect(videosPage.libraryCards.filter({ hasText: removedVideoText })).toBeVisible();
    });
  });
});
