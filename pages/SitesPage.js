// @ts-check

export class SitesPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loadingOverlay = page.locator('.cssload-overlay');
  }

  /** @param {string} name */
  async selectSite(name) {
    await this.page.getByText(name, { exact: true }).click();
    // Bounded so a stuck spinner fails fast with a clear cause instead of eating
    // the whole test timeout.
    await this.loadingOverlay.waitFor({ state: 'hidden', timeout: 12_000 }).catch(() => {
      throw new Error(`Site "${name}": .cssload-overlay never cleared — a page request is likely still pending (check the [net:*] logs).`);
    });
  }
}
