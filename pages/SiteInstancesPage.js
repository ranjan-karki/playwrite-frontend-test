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
    this.lybTilePlusThumb = page.locator('div').filter({ hasText: 'Lyb tile plus' }).nth(5);
    this.lybTilePlusImage = page.getByRole('img', { name: 'Lyb tile plus' });
    this.selectedThemeCheckmark = page.locator('.layout-item .fas.fa-check-circle');
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.closeButton = page.getByRole('button', { name: 'Close' });
    this.titleLengthError = page.getByText('The title may not be greater than 255 characters.');
    this.slugLengthError = page.getByText('The slug may not be greater than 60 characters.');

    // Edit instance form
    this.editInstanceHeading = page.getByRole('heading', { name: ' Edit instance' });
    this.editMenuItem = page.getByText('Edit', { exact: true });
    this.cancelEditButtons = page.getByText('Cancel Edit');
    this.saveButton = page.getByRole('button', { name: 'Save' });

    // Row actions menu (Edit, Copy, Set to default, Publish, Delete)
    this.copyMenuItem = page.getByText('Copy', { exact: true });
    this.setToDefaultMenuItem = page.getByText('Set to default');
    this.publishMenuItem = page.getByText('Publish', { exact: true });
    this.deleteMenuItem = page.getByText('Delete');
    this.confirmDialog = page.locator('nico-confirm-dialog');
    this.dialogCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.dialogProceedButton = page.getByRole('button', { name: 'Proceed' });
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

  /**
   * Filling the slug alone doesn't settle its async availability validation — the field
   * needs to be clicked again afterward for that check to resolve before Create/Save can
   * actually submit.
   * @param {string} slug
   */
  async fillSlug(slug) {
    await this.slugInput.click();
    await this.slugInput.fill(slug);
    await this.slugInput.click();
  }

  async selectLybTileTheme() {
    await this.lybTilePlusImage.click();
  }

  async closeForm() {
    await this.closeButton.click();
  }

  /** @param {string} name */
  async openInstance(name) {
    await this.page.getByText(name).click();
  }

  async save() {
    await this.saveButton.click();
  }

  /**
   * ag-Grid renders the Title column and the actions-menu column in separate pinned
   * containers, so the row's position can't be found via a single shared index. Look
   * up the named row's actual `row-index` attribute, then use it to find the matching
   * row in the actions column, regardless of where either row happens to be sorted.
   * @param {string} name
   */
  async openRowActionsMenu(name) {
    const titleRow = this.page
      .locator('.ag-pinned-left-cols-container .ag-row')
      .filter({ hasText: new RegExp(`^${name}$`) });
    const rowIndex = await titleRow.getAttribute('row-index');
    await this.page.locator(`.ag-pinned-right-cols-container .ag-row[row-index="${rowIndex}"] button`).click();
  }

  /** @param {string} name */
  async openEditForm(name) {
    await this.openRowActionsMenu(name);
    await this.editMenuItem.click();
  }

  /** @param {string} name */
  async deleteInstance(name) {
    await this.openRowActionsMenu(name);
    await this.deleteMenuItem.click();
    await this.dialogProceedButton.click();
  }
}
