// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteBuilderPage } from '../../pages/SiteBuilderPage.js';
import { requireEnv } from '../../utils/env.js';
import { messages } from '../../test-data/message.js';

const siteName = requireEnv('TEST_SITE_NAME');

test.describe(`${siteName} - Site builder`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
  });

  test('displays the site builder page controls', async ({ authenticatedPage }) => {
    const builder = new SiteBuilderPage(authenticatedPage);

    await expect(builder.createInstanceButton).toBeVisible();
    await expect(builder.defaultBadge).toBeVisible();
    await expect(builder.instanceLabel).toBeVisible();
    await expect(builder.homepageHeading).toBeVisible();
     await expect(builder.shareSiteButton).toBeVisible();
    await expect(builder.resourceLibraryToggleButton).toBeVisible();
    await expect(builder.previewButton).toBeVisible();
    await expect(builder.siteMenuButton).toBeVisible();
    await expect(builder.maintenanceLabel).toBeVisible();
    await expect(builder.maintenanceToggle).toBeVisible();
    await expect(builder.publishedLabel).toBeVisible();
    await expect(builder.publishedToggle).toBeVisible();
    await expect(builder.pagesPanel.getByText('Homepage', { exact: true })).toBeVisible();
    await expect(builder.addPageButton).toBeVisible();
  });

  test('opens and closes the Add page dialog', async ({ authenticatedPage }) => {
    const builder = new SiteBuilderPage(authenticatedPage);

    await builder.openAddPageForm();

    await expect(builder.dialog).toBeVisible();
    await expect(authenticatedPage.locator('span').filter({ hasText: 'Add page' })).toBeVisible();
    await expect(authenticatedPage.getByText('Title*')).toBeVisible();
    await expect(builder.dialogTitleInput).toBeVisible();
    await expect(builder.dialogCancelButton).toBeVisible();

    await builder.dialogCloseButton.click();
    await expect(builder.dialog).not.toBeVisible();
  });

  test('shares the site link from the share dialog', async ({ authenticatedPage }) => {
    const builder = new SiteBuilderPage(authenticatedPage);

    await builder.openShareDialog();

    await expect(builder.dialog).toBeVisible();
    await expect(builder.shareLinkText).toBeVisible();
    await expect(builder.dialog).toContainText(messages.siteBuilder.shareLinkDescription);
    await expect(builder.websiteLinkHeading).toBeVisible();
    await expect(builder.qrCodeHeading).toBeVisible();

    await builder.copyShareLink();
    await expect(builder.copyLinkButton).toBeVisible();

    await builder.closeDialogByText();
    await expect(builder.dialog).not.toBeVisible();
  });

  test('confirms unpublish, cancels two republish attempts, then republishes', async ({ authenticatedPage }) => {
    const builder = new SiteBuilderPage(authenticatedPage);

    // Unpublish the site.
    await builder.togglePublished();
    await expect(builder.dialog).toBeVisible();
    await expect(builder.unpublishSiteHeading).toBeVisible();
    await expect(builder.dialog).toContainText(messages.siteBuilder.confirmUnpublish);
    await expect(builder.dialogCancelButton).toBeVisible();
    await expect(builder.unpublishConfirmButton).toBeVisible();
    await builder.confirmUnpublish();

    await expect(builder.notPublishedBanner).toBeVisible();

    // First republish attempt: cancel via the dialog's Cancel button.
    await builder.togglePublished();
    await expect(builder.dialog).toBeVisible();
    await expect(builder.publishSiteHeading).toBeVisible();
    await expect(builder.dialog).toContainText(messages.siteBuilder.confirmPublish);
    await expect(builder.dialogCancelButton).toBeVisible();
    await expect(builder.publishConfirmButton).toBeVisible();
    await expect(builder.dialogCloseButton).toBeVisible();
    await builder.dialogCancelButton.click();

    await expect(builder.notPublishedBanner).toBeVisible();

    // Second republish attempt: dismiss via the corner Close button instead.
    await builder.togglePublished();
    await builder.dialogCloseButton.click();

    await expect(builder.notPublishedBanner).toBeVisible();

    // Third attempt: actually confirm, restoring the site to published.
    await builder.togglePublished();
    await builder.confirmPublish();

    await expect(builder.notPublishedBanner).not.toBeVisible();
  });

  test('enables and disables maintenance mode', async ({ authenticatedPage }) => {
    const builder = new SiteBuilderPage(authenticatedPage);

    // Enable maintenance mode.
    await builder.toggleMaintenance();
    await expect(builder.dialog).toBeVisible();
    await expect(builder.enableMaintenanceHeading).toBeVisible();
    await expect(builder.dialog).toContainText(messages.siteBuilder.confirmEnableMaintenance);
    await expect(builder.dialogCancelButton).toBeVisible();
    await expect(builder.enableMaintenanceButton).toBeVisible();
    await builder.confirmEnableMaintenance();

    await expect(builder.statusToast).toBeVisible();
    await expect(builder.statusToast).toContainText(messages.siteBuilder.maintananceModeToast);
    await expect(builder.siteBuilderRoot).toContainText(messages.siteBuilder.maintenanceModeNotice);

    // Disable maintenance mode.
    await builder.toggleMaintenance();
    await expect(builder.dialog).toBeVisible();
    await expect(builder.disableMaintenanceHeading).toBeVisible();
    await expect(builder.dialog).toContainText(messages.siteBuilder.confirmDisableMaintenance);
    await expect(builder.dialogCancelButton).toBeVisible();
    await expect(builder.disableMaintenanceButton).toBeVisible();
    await builder.confirmDisableMaintenance();

    await expect(builder.statusToast).toBeVisible();
    await expect(builder.siteBuilderRoot).not.toContainText(messages.siteBuilder.maintenanceModeNotice);

    // Cancelling a re-enable attempt leaves maintenance mode disabled.
    await builder.toggleMaintenance();
    await expect(builder.dialog).toBeVisible();
    await builder.dialogCancelButton.click();

    await expect(builder.siteBuilderRoot).not.toContainText(messages.siteBuilder.maintenanceModeNotice);
  });
});
