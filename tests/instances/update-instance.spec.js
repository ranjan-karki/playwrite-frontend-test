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
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
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

    await expect(authenticatedPage.getByText(updateInstanceInputs.updatedTitle, { exact: true })).toBeVisible();

    // Restore the original title so later tests can still find this instance by name.
    await form.openEditForm(updateInstanceInputs.updatedTitle);
    await form.fillTitle(instanceName);
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
    await form.fillSlug(updateInstanceInputs.overLimitSlug);
    await form.save();

    await expect(form.slugLengthError).toBeVisible();

    await form.closeForm();
  });

  test('updates title with a minimum-length value', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openEditForm(instanceName);
    await form.fillTitle(updateInstanceInputs.minTitle);
    await form.save();

    await expect(authenticatedPage.getByText(updateInstanceInputs.minTitle, { exact: true })).toBeVisible();

    // Restore the original title so later tests can still find this instance by name.
    await form.openEditForm(updateInstanceInputs.minTitle);
    await form.fillTitle(instanceName);
    await form.save();
  });

  test('updates title with a maximum-length (255 char) value', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openEditForm(instanceName);
    await form.fillTitle(updateInstanceInputs.maxTitle);
    await form.save();

    await expect(authenticatedPage.getByText(updateInstanceInputs.maxTitle, { exact: true })).toBeVisible();

    // Restore the original title so later tests can still find this instance by name.
    await form.openEditForm(updateInstanceInputs.maxTitle);
    await form.fillTitle(instanceName);
    await form.save();
  });

  test('updates slug with a minimum-length value', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);
    const tempTitle = updateInstanceInputs.minSlugHolderTitle;

    // Slugs must be unique, so claim the boundary value with a throwaway instance first,
    // then free it up again so it can be applied to the real target instance below.
    await form.openNewInstanceForm();
    await form.fillTitle(tempTitle);
    await form.fillSlug(updateInstanceInputs.minSlug);
    const preservedSlug = await form.slugInput.inputValue();
    await form.createButton.click();
    await expect(form.createInstanceHeading).not.toBeVisible();

    await form.deleteInstance(tempTitle);

    await form.openEditForm(instanceName);
    const originalSlug = await form.slugInput.inputValue();

    await form.fillSlug(preservedSlug);
    await form.save();

    await form.openEditForm(instanceName);
    await expect(form.slugInput).toHaveValue(preservedSlug);

    // Restore the original slug so the environment is left unchanged.
    await form.fillSlug(originalSlug);
    await form.save();
  });

  test('updates slug with a maximum-length (50 char) value', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);
    const tempTitle = updateInstanceInputs.maxSlugHolderTitle;

    await form.openNewInstanceForm();
    await form.fillTitle(tempTitle);
    await form.fillSlug(updateInstanceInputs.maxSlug);
    const preservedSlug = await form.slugInput.inputValue();
    await form.createButton.click();
    await expect(form.createInstanceHeading).not.toBeVisible();

    await form.deleteInstance(tempTitle);

    await form.openEditForm(instanceName);
    const originalSlug = await form.slugInput.inputValue();

    await form.fillSlug(preservedSlug);
    await form.save();

    await form.openEditForm(instanceName);
    await expect(form.slugInput).toHaveValue(preservedSlug);

    // Restore the original slug so the environment is left unchanged.
    await form.fillSlug(originalSlug);
    await form.save();
  });
});
