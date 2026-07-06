// @ts-check

export class SiteInstancesPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // Site instances list
    this.heading = page.getByRole('heading', { name: 'Site instances', exact: true });
    this.newInstanceButton = page.getByRole('button', { name: ' New instance' });
    this.siteControlsPublished = page.getByText('Site controlsPublished');
    this.publishedStatus = page.getByText('Published status');
    this.maintenanceMode = page.getByText('Maintenance mode');

    // Create instance form
    this.createInstanceHeading = page.getByRole('heading', { name: ' Create new instance' });
    this.selectThemeText = page.getByText('Select a theme');
    this.homepageVideosOption = page.getByText('Homepage & page videos');
    this.pageSpecificVideosOption = page.getByText('Page-specific videos');
    this.singleGlobalVideoOption = page.getByText('Single global video playlist');
    this.titleLabel = page.locator('#site-instance-create-edit-form').getByText('Title');
    this.slugLabel = page.getByText('Slug', { exact: true });
    this.titleInput = page.getByRole('textbox', { name: 'Title' });
    this.slugInput = page.getByRole('textbox', { name: 'Slug' });
    this.createEditForm = page.locator('#site-instance-create-edit-form');
    this.instanceUrlText = page.getByText('Instance URL:http://localhost');
    this.primaryColorLabel = page.getByText('Primary color');
    this.primaryColorInput = page.getByRole('textbox', { name: 'Primary color' });
    this.secondaryColorLabel = page.getByText('Secondary color');
    this.secondaryColorInput = page.getByRole('textbox', { name: 'Secondary color' });
    this.cancelCreateButtons = page.getByText('Cancel Create');
    this.lybTilePlusThumb = page.locator('div').filter({ hasText: 'lyb global tile plus' }).nth(5);
    this.lybTilePlusImage = page.getByRole('img', { name: 'lyb global tile plus' });
    this.selectedThemeCheckmark = page.locator('.layout-item .fas.fa-check-circle');
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.closeButton = page.getByRole('button', { name: 'Close' });
    this.titleLengthError = page.getByText('The title may not be greater than 255 characters.');
    this.slugLengthError = page.getByText('The slug may not be greater than 50 characters.');

    // Edit instance form
    this.editInstanceHeading = page.getByRole('heading', { name: ' Edit instance' });
    this.editMenuItem = page.getByText('Edit', { exact: true });
    this.cancelEditButtons = page.getByText('Cancel Edit');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async openNewInstanceForm() {
    await this.newInstanceButton.click();
  }

  /** @param {string} title */
  async fillTitle(title) {
    await this.titleInput.click();
    await this.titleInput.fill(title);
  }

  async triggerSlugAutofill() {
    await this.slugLabel.click();
  }

  /** @param {string} slug */
  async fillSlug(slug) {
    await this.slugInput.click();
    await this.slugInput.fill(slug);
  }

  async selectLybTileTheme() {
    await this.lybTilePlusImage.click();
  }

  async closeForm() {
    await this.closeButton.click();
  }

  /** @param {string} name */
  async openEditForm(name) {
    await this.page.locator('div').filter({ hasText: new RegExp(`^${name}$`) }).nth(3).click();
    await this.page.locator('button').nth(4).click();
    await this.editMenuItem.click();
  }

  async save() {
    await this.saveButton.click();
  }
}
