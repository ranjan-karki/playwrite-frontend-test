// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { SiteBuilderPage } from '../../pages/SiteBuilderPage.js';
import { requireEnv } from '../../utils/env.js';
import {
  SLUG_NOTE,
  updateInstanceInputs,
  updateTitleSecurity,
  targetInstanceTitles,
  fillerSlugs,
  extremeInputs,
} from '../../test-data/instances.js';
import { securityPayloads } from '../../test-data/securityPayloads.js';

const siteName = requireEnv('TEST_SITE_NAME');
// Instance names vary per environment, so the suite creates (and later deletes)
// its own target row instead of expecting one to already exist.
const instanceName = targetInstanceTitles.update;

test.describe(`${siteName} - Update instance`, () => {
  test.beforeAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const builder = new SiteBuilderPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await builder.openSiteInstances();
    await form.openNewInstanceForm();
    await form.fillTitle(instanceName);
    await form.fillSlug(fillerSlugs.updateTarget);
    await form.blurSlugInput();
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(instanceName, { exact: true })).toBeVisible();
  });

  test.afterAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const builder = new SiteBuilderPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await builder.openSiteInstances();
    await form.deleteInstance(instanceName);

    await expect(authenticatedPage.getByText(instanceName, { exact: true })).not.toBeVisible();
  });

  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const builder = new SiteBuilderPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await builder.openSiteInstances();
  });

  test.describe('form display', () => {
    test('displays edit instance form fields', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);

      await expect(form.editInstanceHeading).toBeVisible();
      await expect(form.selectThemeText).toBeVisible();
      await expect(form.titleLabel).toBeVisible();
      await expect(form.slugLabel).toBeVisible();
      await expect(form.titleInput).toBeVisible();
      await expect(form.slugInput).toBeVisible();
      await expect(form.instanceUrlText).toBeVisible();
      await expect(form.primaryColorLabel).toBeVisible();
      await expect(form.primaryColorInput).toBeVisible();
      await expect(form.secondaryColorLabel).toBeVisible();
      await expect(form.secondaryColorInput).toBeVisible();
      await expect(form.cancelButton).toBeVisible();
      await expect(form.themeThumbnails.first()).toBeVisible();
      // Save stays disabled until a change is made — opening the form alone doesn't enable it.
      await expect(form.saveButton).toBeDisabled();
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

    test('enables the Save button once a change is made', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);

      await expect(form.titleInput).not.toHaveValue('');
      await expect(form.slugInput).not.toHaveValue('');
      await expect(form.saveButton).toBeDisabled();

      await form.fillTitle(updateInstanceInputs.updatedTitle);

      await expect(form.saveButton).toBeEnabled();

      await form.closeForm();
    });
  });

  test.describe('validation', () => {
    test('shows validation error when title exceeds 255 characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      await form.fillTitle(updateInstanceInputs.longTitle);
      await form.save();

      await expect(form.titleLengthError).toBeVisible();

      await form.closeForm();
    });

    test('shows validation error for an extremely large (10,000 character) title', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      await form.fillTitle(extremeInputs.title);
      await form.save();

      await expect(form.titleLengthError).toBeVisible();

      await form.closeForm();
    });
  });

  test.describe('title updates', () => {
    test('updates title, selects theme image, and saves', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      await form.fillTitle(updateInstanceInputs.updatedTitle);
      await form.selectTheme();
      await expect(form.saveButton).toBeEnabled();
      await form.save();

      await expect(authenticatedPage.getByText(updateInstanceInputs.updatedTitle, { exact: true })).toBeVisible();

      // Restore the original title so later tests can still find this instance by name.
      await form.openEditForm(updateInstanceInputs.updatedTitle);
      await form.fillTitle(instanceName);
      await form.save();
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
  });

  // The slug powers all analytics tracking for this instance (see SLUG_NOTE above) and
  // cannot be changed once set - the edit form only allows viewing it, not editing it.
  test.describe('slug', () => {
    test('does not allow editing the slug from the edit form', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);

      await expect(form.slugInput).not.toBeEditable();

      await form.closeForm();
    });
  });

  test.describe('security payloads', () => {
    test('updates title with a xss payload stored as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const payloadTitle = updateTitleSecurity.xss;

      await form.openEditForm(instanceName);
      await form.fillTitle(payloadTitle);
      await form.save();

      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(payloadTitle, { exact: true })).toBeVisible();

      // Restore the original title so later tests can still find this instance by name.
      await form.openEditForm(payloadTitle);
      await form.fillTitle(instanceName);
      await form.save();
    });

    test('updates title with a htmlInjection payload stored as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const payloadTitle = updateTitleSecurity.htmlInjection;

      await form.openEditForm(instanceName);
      await form.fillTitle(payloadTitle);
      await form.save();

      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(payloadTitle, { exact: true })).toBeVisible();

      // Restore the original title so later tests can still find this instance by name.
      await form.openEditForm(payloadTitle);
      await form.fillTitle(instanceName);
      await form.save();
    });

    test('updates title with a sqlInjection payload stored as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const payloadTitle = updateTitleSecurity.sqlInjection;

      await form.openEditForm(instanceName);
      await form.fillTitle(payloadTitle);
      await form.save();

      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(payloadTitle, { exact: true })).toBeVisible();

      // Restore the original title so later tests can still find this instance by name.
      await form.openEditForm(payloadTitle);
      await form.fillTitle(instanceName);
      await form.save();
    });

    test('updates title with a specialCharString payload stored as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const payloadTitle = updateTitleSecurity.specialCharString;

      await form.openEditForm(instanceName);
      await form.fillTitle(payloadTitle);
      await form.save();

      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(payloadTitle, { exact: true })).toBeVisible();

      // Restore the original title so later tests can still find this instance by name.
      await form.openEditForm(payloadTitle);
      await form.fillTitle(instanceName);
      await form.save();
    });

    test('updates title with a pathTraversal payload stored as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const payloadTitle = updateTitleSecurity.pathTraversal;

      await form.openEditForm(instanceName);
      await form.fillTitle(payloadTitle);
      await form.save();

      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(payloadTitle, { exact: true })).toBeVisible();

      // Restore the original title so later tests can still find this instance by name.
      await form.openEditForm(payloadTitle);
      await form.fillTitle(instanceName);
      await form.save();
    });

    // The color inputs are readonly and only take values through the picker's hex
    // field, so a rejected payload must leave the field value unchanged. The form is
    // closed without saving, leaving the instance untouched.
    test('rejects a xss payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.xss);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });

    test('rejects a htmlInjection payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.htmlInjection);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });

    test('rejects a sqlInjection payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.sqlInjection);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });

    test('rejects a specialCharString payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.specialCharString);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });

    test('rejects a pathTraversal payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.pathTraversal);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });
  });
});
