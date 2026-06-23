import { Page, Locator, expect } from '@playwright/test';

export type InstanceLayout = 'tile' | 'tile-plus';

export interface InstanceFormData {
  title?: string;
  slug?: string;
  primaryColor?: string;
  secondaryColor?: string;
  layout?: InstanceLayout;
}

export class InstancesPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly newInstanceButton: Locator;
  readonly formHeading: Locator;
  readonly titleInput: Locator;
  readonly slugInput: Locator;
  readonly primaryColorInput: Locator;
  readonly secondaryColorInput: Locator;
  readonly layoutTile: Locator;
  readonly layoutTilePlus: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: 'Site instances' });
    this.newInstanceButton = page.getByRole('button', { name: 'New instance', exact: true });
    this.formHeading = page.getByRole('heading', { name: 'Create new instance' });
    this.titleInput = page.getByRole('textbox', { name: 'Title' });
    this.slugInput = page.getByRole('textbox', { name: 'Slug' });
    this.primaryColorInput = page.getByRole('textbox', { name: 'Primary color' });
    this.secondaryColorInput = page.getByRole('textbox', { name: 'Secondary color' });
    this.layoutTile = page.getByRole('img', { name: 'lyb-global-tile' });
    this.layoutTilePlus = page.getByRole('img', { name: 'lyb global tile plus' });
    this.createButton = page.locator('#site-instance-create-edit-form').getByRole('button', { name: 'Create', exact: true });
    this.cancelButton = page.locator('#site-instance-create-edit-form').getByRole('button', { name: 'Cancel', exact: true });
  }

  async goto(siteId: number) {
    await this.page.goto(`/manage/sites/${siteId}/instances`);
    await this.page.waitForLoadState('networkidle');
  }

  async openNewInstanceForm() {
    await this.newInstanceButton.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.formHeading).toBeVisible();
  }

  async fillForm(data: InstanceFormData) {
    if (data.title !== undefined) await this.titleInput.fill(data.title);
    if (data.slug !== undefined) await this.slugInput.fill(data.slug);
    if (data.primaryColor !== undefined) await this.primaryColorInput.fill(data.primaryColor);
    if (data.secondaryColor !== undefined) await this.secondaryColorInput.fill(data.secondaryColor);
    if (data.layout === 'tile') await this.layoutTile.click();
    if (data.layout === 'tile-plus') await this.layoutTilePlus.click();
  }

  fieldError(message: string) {
    return this.page.getByText(message);
  }

  instanceCard(title: string) {
    return this.page.getByText(title, { exact: true });
  }
}
