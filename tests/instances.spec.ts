import { test, expect } from '@playwright/test';
import { CREDENTIALS, SITE_IDS } from './fixtures';
import { LoginPage } from './pages/LoginPage';
import { InstancesPage } from './pages/InstancesPage';

test.describe.serial('Instances', () => {
  let instancesPage: InstancesPage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.valid.username, CREDENTIALS.valid.password);
    await page.waitForURL('**/manage/sites**');
    await page.waitForLoadState('networkidle');
    instancesPage = new InstancesPage(page);
  });

  test.afterAll(async () => {
    await instancesPage.page.context().close();
  });

  test.beforeEach(async () => {
    await instancesPage.goto(SITE_IDS.main);
  });

  // ── List page ─────────────────────────────────────────────────────────────

  test('instances list page shows New instance button', async () => {
    await expect(instancesPage.newInstanceButton).toBeVisible();
  });

  // ── New instance form ─────────────────────────────────────────────────────

  test('new instance form opens with all required fields visible', async () => {
    await instancesPage.openNewInstanceForm();
    await expect(instancesPage.page.locator('#site-instance-create-edit-form').getByText('Title')).toBeVisible();
    await expect(instancesPage.page.getByText('Slug', { exact: true })).toBeVisible();
    await expect(instancesPage.titleInput).toBeVisible();
    await expect(instancesPage.slugInput).toBeVisible();
    await expect(instancesPage.layoutTile).toBeVisible();
    await expect(instancesPage.layoutTilePlus).toBeVisible();
  });

  test('cancel closes the form and returns to instances list', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.cancelButton.click();
    await expect(instancesPage.pageHeading).toBeVisible();
  });

  // ── Create button enable / disable logic ──────────────────────────────────

  test('Create button is disabled when form is empty', async () => {
    await instancesPage.openNewInstanceForm();
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('Create button is disabled when title is empty', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ slug: 'valid-slug', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('Create button is disabled when slug is empty', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test Instance', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('Create button is disabled when no theme is selected', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test Instance', slug: 'valid-slug' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('Create button enables only when title, slug, and theme are all filled', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: 'valid-slug', layout: 'tile' });
    await expect(instancesPage.createButton).toBeEnabled();
  });

  // ── Title character limits ────────────────────────────────────────────────

  test('title with 1 character enables Create button', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'a', slug: 'valid-slug', layout: 'tile' });
    await expect(instancesPage.createButton).toBeEnabled();
  });

  test('title with exactly 255 characters enables Create button', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'a'.repeat(255), slug: 'valid-slug', layout: 'tile' });
    await expect(instancesPage.createButton).toBeEnabled();
  });

  test('title exceeding 255 characters disables Create button', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'a'.repeat(256), slug: 'valid-slug', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  // ── Slug character limits ─────────────────────────────────────────────────

  test('slug with 1 character (single letter) enables Create button', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: 'a', layout: 'tile' });
    await expect(instancesPage.createButton).toBeEnabled();
  });

  test('slug with exactly 50 characters enables Create button', async () => {
    await instancesPage.openNewInstanceForm();
    // starts with a letter to satisfy slug format rule
    await instancesPage.fillForm({ title: 'Test', slug: 'a' + 'b'.repeat(49), layout: 'tile' });
    await expect(instancesPage.createButton).toBeEnabled();
  });

  test('slug exceeding 50 characters disables Create button', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: 'a' + 'b'.repeat(50), layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  // ── Slug format validations ───────────────────────────────────────────────

  test('slug with leading hyphen is rejected', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: '-invalid', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('slug with trailing hyphen is rejected', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: 'invalid-', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('slug with consecutive hyphens is rejected', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: 'bad--slug', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('slug with uppercase letters is rejected', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: 'UPPERCASE', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('slug with spaces is rejected', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: 'has space', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('slug that is only digits is rejected', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: '12345', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  test('slug as single hyphen is rejected', async () => {
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test', slug: '-', layout: 'tile' });
    await expect(instancesPage.createButton).toBeDisabled();
  });

  // ── Successful creation ───────────────────────────────────────────────────

  test('create instance with valid title, slug and theme succeeds', async () => {
    const slug = `test-inst-${Date.now()}`;
    await instancesPage.openNewInstanceForm();
    await instancesPage.fillForm({ title: 'Test Instance', slug, layout: 'tile-plus' });
    await expect(instancesPage.createButton).toBeEnabled();
    await instancesPage.createButton.click();
    await instancesPage.page.waitForLoadState('networkidle');
    await expect(instancesPage.pageHeading).toBeVisible();
    await expect(instancesPage.instanceCard('Test Instance')).toBeVisible();
  });
});
