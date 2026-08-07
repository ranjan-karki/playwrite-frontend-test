// @ts-check

export class HomepageResourcesPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.navLink = page.getByRole('link', { name: 'Homepage resources' });

    // Tab strip - more tabs exist (Contacts, Dynamic Calculators, Calculators) than
    // fit on screen, revealed by scrolling the strip with the chevron.
    this.tabsContainer = page.locator('app-horizontal-resource-tabs');
    this.documentsTab = this.tabsContainer.getByText('Documents');
    this.imagesTab = this.tabsContainer.getByText('Images');
    this.linksTab = this.tabsContainer.getByText('Links');
    this.scrollTabsRightButton = page.locator('.fa.fa-chevron-right');

    // Per-tab primary action (e.g. add a new resource) - always the first `.action`
    // element on the page, scoped to whichever tab is currently active.
    this.actionButton = page.locator('.action').first();
  }

  async open() {
    await this.navLink.click();
    await this.tabsContainer.waitFor({ state: 'visible' });
  }

  /** @param {import('@playwright/test').Locator} tab */
  async selectTab(tab) {
    await tab.click();
  }

  async clickAction() {
    await this.actionButton.click();
  }

  async scrollTabsRight() {
    await this.scrollTabsRightButton.click();
  }
}
