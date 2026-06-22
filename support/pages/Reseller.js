const { selectors } = require('../selectors');

class ResellerPage {
  constructor(page) {
    this.page = page;
  }

  async fillCreateForm(filePath, title, primaryColor, secondaryColor, description) {
    await this.page.locator(selectors.resellers.imageUploader).setInputFiles(filePath);
    await this.page.locator(selectors.resellers.title).fill(title);
    await this.page.locator(selectors.resellers.primaryColor).click();
    await this.page.locator(selectors.resellers.secondaryColor).click();
    await this.page.locator(selectors.resellers.title).click();
    await this.page.locator(selectors.resellers.description).fill(description);
  }

  async fillUpdateForm(filePath, title, primaryColor, secondaryColor, description) {
    await this.page.locator(selectors.resellers.imageUploader).click();
    await this.page.locator(selectors.resellers.title).clear();
    await this.page.locator(selectors.resellers.title).fill(title);
    await this.page.locator(selectors.resellers.primaryColor).click();
    await this.page.locator(selectors.resellers.secondaryColor).click();
    await this.page.locator(selectors.resellers.description).clear();
    await this.page.locator(selectors.resellers.description).fill(description);
  }
}

module.exports = { ResellerPage };
