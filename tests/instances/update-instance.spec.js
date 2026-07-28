// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { requireEnv } from '../../utils/env.js';
import {
  SLUG_NOTE,
  updateInstanceInputs,
  updateTitleSecurity,
  targetInstanceTitles,
  fillerSlugs,
  invalidSlugs,
  slugSecurity,
} from '../../test-data/instances.js';
import { messages } from '../../test-data/message.js';
import { securityPayloads } from '../../test-data/securityPayloads.js';

const siteName = requireEnv('TEST_SITE_NAME');
// Instance names vary per environment, so the suite creates (and later deletes)
// its own target row instead of expecting one to already exist.
const instanceName = targetInstanceTitles.update;

// Titles a test registers (via trackInstance) before creating a row. The afterEach
// below deletes whichever of them still exist, so a test that fails midway doesn't
// leave orphan instances behind.
/** @type {string[]} */
let createdTitles = [];

/** @param {string} title */
function trackInstance(title) {
  createdTitles.push(title);
}

/**
 * For slugs that pass the form's own checks (Save is enabled) but are invalid on
 * submit: clicks Save, expects the given rejection message, and the form stays
 * open with the instance's slug left unchanged.
 * @param {import('@playwright/test').Page} page
 * @param {SiteInstancesPage} form
 * @param {string} message
 */
async function expectSaveRejected(page, form, message) {
  await form.save();
  await expect(page.getByText(message).first()).toBeVisible();
  await expect(form.editInstanceHeading).toBeVisible();
  await form.closeForm();
}

/**
 * For slugs the form itself flags (characters outside the accepted set) the Save
 * button never enables, so there is nothing to click — the rejection IS the disabled
 * button, alongside the given inline error.
 * @param {import('@playwright/test').Page} page
 * @param {SiteInstancesPage} form
 * @param {string} message
 */
async function expectSaveBlocked(page, form, message) {
  await expect(page.getByText(message)).toBeVisible();
  await expect(form.saveButton).toBeDisabled();
  await form.closeForm();
}

test.describe(`${siteName} - Update instance`, () => {
  test.beforeAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
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
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await form.deleteInstance(instanceName);

    await expect(authenticatedPage.getByText(instanceName, { exact: true })).not.toBeVisible();
  });

  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
  });

  test.afterEach(async ({ authenticatedPage }) => {
    const titles = createdTitles;
    createdTitles = [];
    if (titles.length === 0) return;

    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    // Navigate fresh — a failed test may have left the create/edit modal open.
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);

    for (const title of titles) {
      const row = authenticatedPage.getByText(title, { exact: true });
      try {
        await row.waitFor({ state: 'visible', timeout: 3000 });
      } catch {
        continue; // never created, or the test already deleted it
      }
      await form.deleteInstance(title);
      await expect(row).not.toBeVisible();
    }
  });

  test.describe('form display', () => {
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

    test('shows validation error when slug exceeds 50 characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      await form.fillSlug(updateInstanceInputs.overLimitSlug);
      await form.save();

      await expect(form.slugLengthError).toBeVisible();

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

  test.describe('slug updates', () => {
    test('updates slug with a minimum-length value', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      const originalSlug = await form.slugInput.inputValue();

      await form.fillSlug(updateInstanceInputs.minSlug);
      await form.blurSlugInput();
      const appliedSlug = await form.slugInput.inputValue();
      await form.save();

      await form.openEditForm(instanceName);
      await expect(form.slugInput).toHaveValue(appliedSlug);

      // Restore the original slug so the environment is left unchanged.
      await form.fillSlug(originalSlug);
      await form.blurSlugInput();
      await form.save();
    });

    test('updates slug with a maximum-length (50 char) value', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openEditForm(instanceName);
      const originalSlug = await form.slugInput.inputValue();

      await form.fillSlug(updateInstanceInputs.maxSlug);
      await form.blurSlugInput();
      const appliedSlug = await form.slugInput.inputValue();
      await form.save();

      await form.openEditForm(instanceName);
      await expect(form.slugInput).toHaveValue(appliedSlug);

      // Restore the original slug so the environment is left unchanged.
      await form.fillSlug(originalSlug);
      await form.blurSlugInput();
      await form.save();
    });

    test('rejects a slug containing uppercase letters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.uppercase;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Only allowed characters, so this passes the character check and fails the format rule.
      await expectSaveRejected(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing spaces', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.spaces;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Space isn't in the allowed character set — Save never enables.
      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug starting with a hyphen', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.leadingHyphen;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveRejected(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug ending with a hyphen', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.trailingHyphen;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveRejected(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing consecutive hyphens', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.consecutiveHyphens;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveRejected(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing an underscore', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.underscore;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveRejected(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing a period', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.period;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Period isn't in the allowed character set — Save never enables.
      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug that is a single hyphen', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.singleHyphen;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveRejected(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing unicode characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.unicode;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Unicode isn't in the allowed character set — Save never enables.
      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing URL-encoded characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.urlEncoded;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // URL-encoded characters aren't in the allowed character set — Save never enables.
      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing HTML tags', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = invalidSlugs.htmlTags;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // HTML tags aren't in the allowed character set — Save never enables.
      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
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

    test('rejects a slug containing a xss payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = slugSecurity.xss;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing a htmlInjection payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = slugSecurity.htmlInjection;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing a sqlInjection payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = slugSecurity.sqlInjection;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing a specialCharString payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = slugSecurity.specialCharString;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
    });

    test('rejects a slug containing a pathTraversal payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug } = slugSecurity.pathTraversal;

      await form.openEditForm(instanceName);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectSaveBlocked(authenticatedPage, form, messages.instances.slugInvalid);
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
