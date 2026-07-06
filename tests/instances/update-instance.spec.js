// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { requireEnv } from '../../utils/env.js';
import { SLUG_NOTE, updateInstanceInputs, defaultThemeColors } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');
const instanceName = requireEnv('TEST_INSTANCE_NAME');

test.describe(`${siteName} - Update instance`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    await sitesPage.selectProduct(siteName);
  });

  test('displays edit instance form fields', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openEditForm(instanceName);

    await expect(form.editInstanceHeading).toBeVisible();
    await expect(form.selectThemeText).toBeVisible();
    await expect(form.homepageVideosOption).toBeVisible();
    await expect(form.pageSpecificVideosOption).toBeVisible();
    await expect(form.singleGlobalVideoOption).toBeVisible();
    await expect(form.titleLabel).toBeVisible();
    await expect(form.slugLabel).toBeVisible();
    await expect(form.titleInput).toBeVisible();
    await expect(form.slugInput).toBeVisible();
    await expect(form.createEditForm).toContainText(SLUG_NOTE);
    await expect(form.instanceUrlText).toBeVisible();
    await expect(form.primaryColorLabel).toBeVisible();
    await expect(form.primaryColorInput).toBeVisible();
    await expect(form.secondaryColorLabel).toBeVisible();
    await expect(form.secondaryColorInput).toBeVisible();
    await expect(form.cancelEditButtons).toBeVisible();
    await expect(form.lybTilePlusThumb).toBeVisible();
    await expect(form.saveButton).toBeEnabled();
    await expect(form.selectedThemeCheckmark).toHaveCount(1);
    await form.closeForm();
  });

  test('closes the modal via the close (X) button', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openEditForm(instanceName);
    await expect(form.editInstanceHeading).toBeVisible();

    await form.closeForm();

    await expect(form.editInstanceHeading).not.toBeVisible();
  });

  test('keeps the Save button enabled when title and slug are populated', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openEditForm(instanceName);

    await expect(form.titleInput).not.toHaveValue('');
    await expect(form.slugInput).not.toHaveValue('');
    await expect(form.saveButton).toBeEnabled();

    await form.closeForm();
  });

  test('updates title, selects theme image, and saves', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openEditForm(instanceName);
    await form.fillTitle(updateInstanceInputs.updatedTitle);
    await form.selectLybTileTheme();
    await expect(form.saveButton).toBeEnabled();
    await form.save();
  });

  test('shows validation error when title exceeds 255 characters', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openEditForm(instanceName);
    await form.fillTitle(updateInstanceInputs.longTitle);
    await form.save();

    await expect(form.titleLengthError).toBeVisible();

    await form.closeForm();
  });

  test('shows validation error when slug exceeds 50 characters', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openEditForm(instanceName);
    await form.fillSlug(updateInstanceInputs.longSlug);
    await form.save();

    await expect(form.slugLengthError).toBeVisible();

    await form.closeForm();
  });
});
