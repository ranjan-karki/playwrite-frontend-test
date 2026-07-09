// @ts-check

export class SiteBrandingPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.brandingNavLink = page.getByRole('link', { name: ' Site branding' });
    this.siteInstancesNavLink = page.getByRole('link', { name: ' Site instances' });
    this.primaryColorInput = page.getByRole('textbox', { name: 'Primary site color' });
    this.secondaryColorInput = page.getByRole('textbox', { name: 'Secondary site color' });
  }

  async open() {
    await this.brandingNavLink.click();
  }

  async openSiteInstances() {
    await this.siteInstancesNavLink.click();
  }

  async getPrimaryColor() {
    return this.primaryColorInput.inputValue();
  }

  async getSecondaryColor() {
    return this.secondaryColorInput.inputValue();
  }
}
