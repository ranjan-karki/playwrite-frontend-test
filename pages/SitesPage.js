// @ts-check

export class SitesPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loadingOverlay = page.locator('.cssload-overlay');
  }

  /** @param {string} name */
  async selectProduct(name) {
    await this.page.getByText(name, { exact: true }).click();
    await this.loadingOverlay.waitFor({ state: 'hidden' });
  }
}
