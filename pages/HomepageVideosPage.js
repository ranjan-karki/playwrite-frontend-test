// @ts-check

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
    this.removeFromBucketButtons = page.locator('.fa-minus-circle');

    // Shared confirm-dialog component, reused across the app for destructive actions.
    this.confirmDialog = page.locator('nico-confirm-dialog');
    this.confirmDialogHeading = this.confirmDialog.getByRole('heading', { name: 'Confirm your action' });
    this.confirmDialogCancelButton = this.confirmDialog.getByRole('button', { name: 'Cancel' });
    this.confirmDialogProceedButton = this.confirmDialog.getByRole('button', { name: 'Proceed' });
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
    await this.addToBucketButtons.first().click();
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
  }
}
