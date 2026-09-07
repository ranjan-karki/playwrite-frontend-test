// @ts-check
import { expect } from '@playwright/test';

export class HomepageVideosPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.navLink = page.getByRole('link', { name: 'Homepage videos' });

    // Video library — videos available to add to this instance's homepage.
    this.libraryCards = page.locator('.app-video-library-component .card.video-card');
    this.addToBucketButtons = page.locator('.add-to-bucket');

    // Bucket — videos already added to this instance's homepage, in cdk-drag order.
    this.bucketItems = page.locator('.cdk-drag.drag-item > .app-video-item-component > .video-container');
    // Scoped to the same bucket-item ancestor chain as bucketItems above - '.video-action'
    // alone (or scoped only to '.video-container') also matches the library cards' own
    // action control, so an unscoped locator can grab the wrong element entirely.
    this.removeFromBucketButtons = this.bucketItems.locator('> .video-action');

    // Shared confirm-dialog component, reused across the app for destructive actions.
    // Buttons are intentionally page-level, not scoped through confirmDialog - matching
    // the same pattern in SiteInstancesPage.js - since a stale/duplicate dialog instance
    // left in the DOM can make a scoped lookup resolve to a non-interactive one and hang.
    this.confirmDialog = page.locator('nico-confirm-dialog');
    this.confirmDialogHeading = page.getByRole('heading', { name: 'Confirm your action' });
    this.confirmDialogCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.confirmDialogProceedButton = page.getByRole('button', { name: 'Proceed' });

    // Full-page loading spinner shown while the bucket/library refresh after a change -
    // it can still be covering the page (intercepting clicks) right after the dialog
    // that triggered it has already closed.
    this.loadingOverlay = page.locator('.cssload-overlay');
  }

  async open() {
    await this.navLink.click();
    await this.libraryCards.first().waitFor({ state: 'visible' });
  }

  /** Opens the first library video's own card (preview), same as clicking any card does. */
  async previewFirstLibraryVideo() {
    await this.libraryCards.first().click();
  }

  /**
   * Adds whichever video is currently first in the library to the bucket. Once added,
   * a video drops out of the library list and the next one shifts into first place, so
   * calling this repeatedly adds successive videos without needing to track identity.
   */
  async addFirstLibraryVideoToBucket() {
    const countBefore = await this.bucketItems.count();
    await this.addToBucketButtons.first().click();
    await expect(this.bucketItems).toHaveCount(countBefore + 1);
  }

  /**
   * Clicking the remove icon always opens the shared confirm dialog; the caller decides
   * whether to cancel or proceed.
   */
  async requestRemoveFirstBucketItem() {
    await this.removeFromBucketButtons.first().click();
    await this.confirmDialog.waitFor({ state: 'visible' });
  }

  async cancelRemoval() {
    await this.confirmDialogCancelButton.click();
    await this.confirmDialog.waitFor({ state: 'hidden' });
  }

  async proceedWithRemoval() {
    await this.confirmDialogProceedButton.click();
    await this.confirmDialog.waitFor({ state: 'hidden' });
    await this.loadingOverlay.waitFor({ state: 'hidden' });
  }

  /**
   * Removes every video currently in the bucket, so a test can start from a known,
   * empty bucket regardless of what earlier tests in the file left behind.
   */
  async clearBucket() {
    while ((await this.bucketItems.count()) > 0) {
      await this.requestRemoveFirstBucketItem();
      await this.proceedWithRemoval();
    }
  }
}
