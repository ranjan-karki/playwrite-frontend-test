const { selectors } = require('../selectors');
const path = require('path');

class SitePage {
  constructor(page) {
    this.page = page;
  }

  async fillCreateForm(filePath, title, subDomain, primaryColor, secondaryColor) {
    await this.page.locator(selectors.sites.imageUploader).setInputFiles(filePath);
    await this.page.locator(selectors.sites.titleField).fill(title);
    await this.page.locator(selectors.sites.domainField).fill(subDomain);
    await this.page.locator(selectors.sites.primaryColor).click();
    await this.page.locator(selectors.sites.secondaryColor).click();
    await this.page.locator(selectors.sites.titleField).click();
  }

  async fillUpdateForm(filePath, title, primaryColor, secondaryColor) {
    await this.page.locator(selectors.sites.imageUploader).click();
    await this.page.locator(selectors.sites.titleField).fill(title);
    await this.page.locator(selectors.sites.primaryColor).click();
    await this.page.locator(selectors.sites.secondaryColor).click();
  }
}

module.exports = { SitePage };
