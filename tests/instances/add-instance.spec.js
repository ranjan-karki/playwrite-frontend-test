// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { SiteBrandingPage } from '../../pages/SiteBrandingPage.js';
import { requireEnv } from '../../utils/env.js';
import {
  SLUG_NOTE,
  SLUG_INPUT_TRUNCATE_LENGTH,
  HEX_COLOR_PATTERN,
  newInstanceInputs,
  colorInputs,
  pickerColorInputs,
  invalidSlugCases,
  validSlugCases,
  titleSecurityCases,
  slugSecurityCases,
  duplicateSlugInputs,
  reusedSlugInputs,
  extremeInputs,
} from '../../test-data/instances.js';
import { messages } from '../../test-data/message.js';

const siteName = requireEnv('TEST_SITE_NAME');

/**
 * Submits the create form expecting the server to reject it: the expected error
 * message (from test-data/message.js) appears, and no row for the title exists
 * once the form is closed.
 * @param {import('@playwright/test').Page} page
 * @param {SiteInstancesPage} form
 * @param {string} title
 * @param {string} message
 */
async function expectCreateRejected(page, form, title, message) {
  await form.createButton.click();
  await expect(page.getByText(message).first()).toBeVisible();
  await expect(form.createInstanceHeading).toBeVisible();
  await form.closeForm();
  await expect(page.getByText(title, { exact: true })).not.toBeVisible();
}

test.describe(`${siteName} - Add instance`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
  });

  test('displays create instance form fields', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();

    await expect(form.createInstanceHeading).toBeVisible();
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
    await expect(form.cancelCreateButtons).toBeVisible();
    await expect(form.lybTilePlusThumb).toBeVisible();
    await expect(form.createButton).toBeDisabled();
    await expect(form.selectedThemeCheckmark).toHaveCount(1);
    await form.closeForm();
  });

  test('closes the modal via the close (X) button', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);
    await form.openNewInstanceForm();
    await expect(form.createInstanceHeading).toBeVisible();

    await form.closeForm();

    await expect(form.createInstanceHeading).not.toBeVisible();
  });

  test('enables the Create button once title and slug are filled', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await expect(form.createButton).toBeDisabled();

    await form.fillTitle(newInstanceInputs.title);
    await form.triggerSlugAutofill();
    await expect(form.slugInput).not.toHaveValue('');

    await expect(form.createButton).toBeEnabled();

    await form.closeForm();
  });

  test('fills title, selects theme image, and closes form', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.title);
    await form.triggerSlugAutofill();
    await expect(form.slugInput).toBeVisible();
    await form.selectLybTileTheme();
    await expect(form.createButton).toBeVisible();
    await expect(form.closeButton).toBeVisible();
    await form.closeForm();
  });

  test('shows validation error when title exceeds 255 characters', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.longTitle);
    await form.triggerSlugAutofill();
    await form.createButton.click();

    await expect(form.titleLengthError).toBeVisible();

    await form.closeForm();
  });

  test('truncates the slug input to a maximum of 60 characters', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.title);
    await form.fillSlug(newInstanceInputs.longSlug);

    await expect(form.slugInput).toHaveValue(newInstanceInputs.longSlug.slice(0, SLUG_INPUT_TRUNCATE_LENGTH));

    await form.closeForm();
  });

  test('does not accept integers or special characters in the slug', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.title);
    await form.fillSlug(newInstanceInputs.invalidCharsSlug);

    await expect(form.slugInput).toHaveValue(newInstanceInputs.slugValidPart);

    await form.closeForm();
  });

  test('shows validation error when slug exceeds 50 characters', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.title);
    await form.fillSlug(newInstanceInputs.overLimitSlug);
    await form.createButton.click();

    await expect(form.slugLengthError).toBeVisible();

    await form.closeForm();
  });

  test('defaults the theme colors to the site branding primary and secondary colors', async ({ authenticatedPage }) => {
    const brandingPage = new SiteBrandingPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await brandingPage.open();

    await expect(brandingPage.primaryColorInput).toBeVisible();

    const primaryColor = await brandingPage.getPrimaryColor();
    const secondaryColor = await brandingPage.getSecondaryColor();

    await brandingPage.openSiteInstances();
    await form.openNewInstanceForm();

    await expect(form.primaryColorInput).toHaveValue(primaryColor);
    await expect(form.secondaryColorInput).toHaveValue(secondaryColor);

    await form.closeForm();
  });

  test('picks primary and secondary colors from the color picker palette', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();

    const initialPrimary = await form.primaryColorInput.inputValue();
    const initialSecondary = await form.secondaryColorInput.inputValue();

    await form.pickColorFromPalette(form.primaryColorInput);
    await expect(form.primaryColorInput).toHaveValue(HEX_COLOR_PATTERN);
    await expect(form.primaryColorInput).not.toHaveValue(initialPrimary);

    await form.pickColorFromPalette(form.secondaryColorInput);
    await expect(form.secondaryColorInput).toHaveValue(HEX_COLOR_PATTERN);
    await expect(form.secondaryColorInput).not.toHaveValue(initialSecondary);

    await form.closeForm();
  });

  test('sets primary and secondary colors by entering hex values in the color picker', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();

    await form.enterColorHexValue(form.primaryColorInput, colorInputs.primaryHex);
    await expect(form.primaryColorInput).toHaveValue(new RegExp(`^${colorInputs.primaryHex}$`, 'i'));

    await form.enterColorHexValue(form.secondaryColorInput, colorInputs.secondaryHex);
    await expect(form.secondaryColorInput).toHaveValue(new RegExp(`^${colorInputs.secondaryHex}$`, 'i'));

    await form.closeForm();
  });

  test('creates an instance with a minimum-length title', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.minTitle);
    await form.triggerSlugAutofill();
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(newInstanceInputs.minTitle, { exact: true })).toBeVisible();

    await form.deleteInstance(newInstanceInputs.minTitle);

    await expect(authenticatedPage.getByText(newInstanceInputs.minTitle, { exact: true })).not.toBeVisible();
  });

  test('creates an instance with a maximum-length (255 char) title', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.maxTitle);
    await form.triggerSlugAutofill();
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(newInstanceInputs.maxTitle, { exact: true })).toBeVisible();

    await form.deleteInstance(newInstanceInputs.maxTitle);

    await expect(authenticatedPage.getByText(newInstanceInputs.maxTitle, { exact: true })).not.toBeVisible();
  });

  test('creates an instance with a minimum-length slug', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);
    const title = newInstanceInputs.minSlugTitle;

    await form.openNewInstanceForm();
    await form.fillTitle(title);
    await form.fillSlug(newInstanceInputs.minSlug);
    await form.slugInput.click();
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(form.heading).toBeVisible();
    await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();

    await form.deleteInstance(title);

    await expect(authenticatedPage.getByText(title, { exact: true })).not.toBeVisible();
  });

  test('creates an instance with a maximum-length (50 char) slug', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);
    const title = newInstanceInputs.maxSlugTitle;

    await form.openNewInstanceForm();
    await form.fillTitle(title);
    await form.fillSlug(newInstanceInputs.maxSlug);
    await form.slugInput.click();
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();

    await form.deleteInstance(title);

    await expect(authenticatedPage.getByText(title, { exact: true })).not.toBeVisible();
  });

  test('keeps the Create button disabled when the title is empty', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillSlug(newInstanceInputs.emptyCheckSlug);

    await expect(form.createButton).toBeDisabled();

    await form.closeForm();
  });

  test('keeps the Create button disabled when the slug is empty', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.title);

    await expect(form.createButton).toBeDisabled();

    await form.closeForm();
  });

  test('shows validation error for an extremely large (10,000 character) title', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(extremeInputs.title);
    await form.fillSlug(extremeInputs.slug);
    await form.createButton.click();

    await expect(form.titleLengthError).toBeVisible();

    await form.closeForm();
  });

  for (const { key, title, slug } of titleSecurityCases) {
    test(`stores a title containing a ${key} payload as literal text`, async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();

      await form.deleteInstance(title);

      await expect(authenticatedPage.getByText(title, { exact: true })).not.toBeVisible();
    });
  }

  for (const { description, slug, title } of validSlugCases) {
    test(`creates an instance with a slug ${description}`, async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();

      await form.deleteInstance(title);

      await expect(authenticatedPage.getByText(title, { exact: true })).not.toBeVisible();
    });
  }

  for (const { description, slug, title } of invalidSlugCases) {
    test(`rejects a slug ${description}`, async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);

      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalid);
    });
  }

  for (const { key, slug, title } of slugSecurityCases) {
    test(`rejects a slug containing a ${key} payload`, async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);

      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalid);
    });
  }

  test('rejects a duplicate slug within the same site', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(duplicateSlugInputs.holderTitle);
    await form.fillSlug(duplicateSlugInputs.slug);
    await form.createButton.click();
    await expect(form.createInstanceHeading).not.toBeVisible();

    await form.openNewInstanceForm();
    await form.fillTitle(duplicateSlugInputs.secondTitle);
    await form.fillSlug(duplicateSlugInputs.slug);
    await expectCreateRejected(authenticatedPage, form, duplicateSlugInputs.secondTitle, messages.instances.slugAlreadyTaken);

    await form.deleteInstance(duplicateSlugInputs.holderTitle);

    await expect(authenticatedPage.getByText(duplicateSlugInputs.holderTitle, { exact: true })).not.toBeVisible();
  });

  test('allows reusing the slug of a deleted instance', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(reusedSlugInputs.firstTitle);
    await form.fillSlug(reusedSlugInputs.slug);
    await form.createButton.click();
    await expect(form.createInstanceHeading).not.toBeVisible();

    await form.deleteInstance(reusedSlugInputs.firstTitle);
    await expect(authenticatedPage.getByText(reusedSlugInputs.firstTitle, { exact: true })).not.toBeVisible();

    await form.openNewInstanceForm();
    await form.fillTitle(reusedSlugInputs.secondTitle);
    await form.fillSlug(reusedSlugInputs.slug);
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(reusedSlugInputs.secondTitle, { exact: true })).toBeVisible();

    await form.deleteInstance(reusedSlugInputs.secondTitle);

    await expect(authenticatedPage.getByText(reusedSlugInputs.secondTitle, { exact: true })).not.toBeVisible();
  });

  // The color inputs are readonly — values only get in through the picker popover,
  // so the empty / too-short / too-long / non-string rejection cases from the API
  // suite are unreachable from the UI. What is FE-testable is how the picker's own
  // hex field handles shorthand, missing-prefix, and invalid values.
  test('applies a 3-character shorthand hex color entered in the picker', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.enterColorHexValue(form.primaryColorInput, pickerColorInputs.threeCharHex);

    await expect(form.primaryColorInput).toHaveValue(
      new RegExp(`^(${pickerColorInputs.threeCharHex}|${pickerColorInputs.threeCharHexExpanded})$`, 'i'),
    );

    await form.closeForm();
  });

  test('accepts a hex color entered without the # prefix in the picker', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.enterColorHexValue(form.primaryColorInput, pickerColorInputs.noPrefixHex);

    await expect(form.primaryColorInput).toHaveValue(new RegExp(`^#?${pickerColorInputs.noPrefixHex}$`, 'i'));

    await form.closeForm();
  });

  test('keeps the color unchanged when an invalid value is entered in the picker', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    const initialColor = await form.primaryColorInput.inputValue();

    await form.enterColorHexValue(form.primaryColorInput, pickerColorInputs.invalidColor);

    await expect(form.primaryColorInput).toHaveValue(initialColor);

    await form.closeForm();
  });
});
