// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { SiteBrandingPage } from '../../pages/SiteBrandingPage.js';
import { requireEnv } from '../../utils/env.js';
import {
  SLUG_NOTE,
  HEX_COLOR_PATTERN,
  newInstanceInputs,
  colorInputs,
  pickerColorInputs,
  invalidSlugs,
  validSlugs,
  fillerSlugs,
  titleSecurity,
  slugSecurity,
  duplicateSlugInputs,
  reusedSlugInputs,
  extremeInputs,
} from '../../test-data/instances.js';
import { messages } from '../../test-data/message.js';
import { securityPayloads } from '../../test-data/securityPayloads.js';

const siteName = requireEnv('TEST_SITE_NAME');

/**
 * For slugs that pass the form's own checks (Create is enabled) but are invalid on
 * submit: clicks Create, expects the given rejection message, the form stays open,
 * and no row for the title exists once it's closed.
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

/**
 * For slugs the form itself flags (characters outside the accepted set) the Create
 * button never enables, so there is nothing to click — the rejection IS the disabled
 * button, alongside the inline invalid-characters error. Closing the form must leave
 * no row behind.
 * @param {import('@playwright/test').Page} page
 * @param {SiteInstancesPage} form
 * @param {string} title
 */
async function expectCreateBlocked(page, form, title) {
  await expect(form.slugInvalidCharsError).toBeVisible();
  await expect(form.createButton).toBeDisabled();
  await form.closeForm();
  await expect(page.getByText(title, { exact: true })).not.toBeVisible();
}

// Titles a test registers (via trackInstance) before creating a row. The afterEach
// below deletes whichever of them still exist, so a test that fails midway doesn't
// leave orphan instances behind.
/** @type {string[]} */
let createdTitles = [];

/** @param {string} title */
function trackInstance(title) {
  createdTitles.push(title);
}

test.describe(`${siteName} - Add instance`, () => {
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

    // Navigate fresh — a failed test may have left the create modal open.
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
      await expect(form.themeThumbnails.first()).toBeVisible();
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
      await form.fillSlug(fillerSlugs.enableCheck);
      await form.blurSlugInput();

      await expect(form.createButton).toBeEnabled();

      await form.closeForm();
    });

    test('fills title, selects theme image, and closes form', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(newInstanceInputs.title);
      await form.fillSlug(fillerSlugs.themeFlow);
      await form.blurSlugInput();
      await form.selectTheme();
      await expect(form.createButton).toBeVisible();
      await expect(form.closeButton).toBeVisible();
      await form.closeForm();
    });

    test('keeps the Create button disabled when the title is empty', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillSlug(newInstanceInputs.emptyCheckSlug);
      await form.blurSlugInput();

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
  });

  test.describe('title validation', () => {
    test('shows validation error when title exceeds 255 characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(newInstanceInputs.longTitle);
      await form.fillSlug(fillerSlugs.longTitle);
      await form.blurSlugInput();
      await form.createButton.click();

      await expect(form.titleLengthError).toBeVisible();

      await form.closeForm();
    });

    test('shows validation error for an extremely large (10,000 character) title', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(extremeInputs.title);
      await form.fillSlug(extremeInputs.slug);
      await form.blurSlugInput();
      await form.createButton.click();

      await expect(form.titleLengthError).toBeVisible();

      await form.closeForm();
    });
  });

  test.describe('slug validation', () => {
    test('truncates the slug input to a maximum of 60 characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(newInstanceInputs.maxTitle);
      await form.triggerSlugAutofill();

      await expect(form.slugInput).not.toHaveValue('');
      await expect(form.slugLengthError).toBeVisible();

      await form.closeForm();
    });

    test('does not accept integers or special characters in the slug', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(newInstanceInputs.title);
      await form.fillSlug(newInstanceInputs.invalidCharsSlug);
      await form.blurSlugInput();

      await expectCreateBlocked(authenticatedPage, form, newInstanceInputs.title);
    });

    test('shows validation error when slug exceeds 50 characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(newInstanceInputs.title);
      await form.fillSlug(newInstanceInputs.overLimitSlug);
      await form.blurSlugInput();
      await form.createButton.click();

      await expect(form.slugLengthError).toBeVisible();

      await form.closeForm();
    });

    test('rejects a slug containing uppercase letters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.uppercase;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Only allowed characters, so this passes the character check and fails the format rule.
      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalid);
    });

    test('rejects a slug containing spaces', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.spaces;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Space isn't in the allowed character set, so the server rejects the format on submit.
      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalidChars);
    });

    test('rejects a slug starting with a hyphen', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.leadingHyphen;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Only allowed characters, so this passes the character check and fails the format rule.
      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalid);
    });

    test('rejects a slug ending with a hyphen', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.trailingHyphen;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Only allowed characters, so this passes the character check and fails the format rule.
      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalid);
    });

    test('rejects a slug containing consecutive hyphens', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.consecutiveHyphens;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Only allowed characters, so this passes the character check and fails the format rule.
      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalid);
    });

    test('rejects a slug containing an underscore', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.underscore;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Underscore passes the form's character check (Create enables), so the
      // rejection comes from the server-side format rule on submit.
      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalid);
    });

    test('rejects a slug containing a period', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.period;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Period isn't in the allowed character set — the inline error surfaces once the
      // availability check settles, and Create never enables.
      await expect(form.slugInvalidCharsError).toBeVisible();
      await expect(form.createButton).toBeDisabled();
    });

    test('rejects a slug that is a single hyphen', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.singleHyphen;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Only allowed characters, so this passes the character check and fails the format rule.
      await expectCreateRejected(authenticatedPage, form, title, messages.instances.slugInvalid);
    });

    test('rejects a slug containing unicode characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.unicode;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // Unicode isn't in the allowed character set — the inline error surfaces once the
      // availability check settles, and Create never enables.
      await expect(form.slugInvalidCharsError).toBeVisible();
      await expect(form.createButton).toBeDisabled();
    });

    test('rejects a slug containing URL-encoded characters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.urlEncoded;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // URL-encoded characters aren't in the allowed character set — the inline error
      // surfaces once the availability check settles, and Create never enables.
      await expect(form.slugInvalidCharsError).toBeVisible();
      await expect(form.createButton).toBeDisabled();
    });

    test('rejects a slug containing HTML tags', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = invalidSlugs.htmlTags;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      // HTML tags aren't in the allowed character set — the inline error surfaces once
      // the availability check settles, and Create never enables.
      await expect(form.slugInvalidCharsError).toBeVisible();
      await expect(form.createButton).toBeDisabled();
    });
  });

  test.describe('theme colors', () => {
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

  test.describe('instance creation', () => {
    test('creates an instance with a minimum-length title', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(newInstanceInputs.minTitle);
      await form.fillSlug(fillerSlugs.minTitle);
      await form.blurSlugInput();
      trackInstance(newInstanceInputs.minTitle);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      await expect(authenticatedPage.getByText(newInstanceInputs.minTitle, { exact: true })).toBeVisible();
    });

    test('creates an instance with a maximum-length (255 char) title', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(newInstanceInputs.maxTitle);
      await form.fillSlug(fillerSlugs.maxTitle);
      await form.blurSlugInput();
      trackInstance(newInstanceInputs.maxTitle);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      await expect(authenticatedPage.getByText(newInstanceInputs.maxTitle, { exact: true })).toBeVisible();
    });

    test('creates an instance with a minimum-length slug', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const title = newInstanceInputs.minSlugTitle;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(newInstanceInputs.minSlug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      await expect(form.heading).toBeVisible();
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('creates an instance with a maximum-length (50 char) slug', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const title = newInstanceInputs.maxSlugTitle;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(newInstanceInputs.maxSlug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('creates an instance with a slug containing hyphens', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = validSlugs.hyphens;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('creates an instance with a slug containing numbers and letters', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = validSlugs.alphanumeric;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('rejects a duplicate slug within the same site', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(duplicateSlugInputs.holderTitle);
      await form.fillSlug(duplicateSlugInputs.slug);
      await form.blurSlugInput();
      trackInstance(duplicateSlugInputs.holderTitle);
      await form.createButton.click();
      await expect(form.createInstanceHeading).not.toBeVisible();

      await form.openNewInstanceForm();
      await form.fillTitle(duplicateSlugInputs.secondTitle);
      await form.fillSlug(duplicateSlugInputs.slug);
      await form.blurSlugInput();
      await expectCreateRejected(authenticatedPage, form, duplicateSlugInputs.secondTitle, messages.instances.slugAlreadyTaken);
    });

    test('allows reusing the slug of a deleted instance', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      await form.fillTitle(reusedSlugInputs.firstTitle);
      await form.fillSlug(reusedSlugInputs.slug);
      await form.blurSlugInput();
      trackInstance(reusedSlugInputs.firstTitle);
      await form.createButton.click();
      await expect(form.createInstanceHeading).not.toBeVisible();

      // Deleting the first instance is part of the scenario — it frees the slug.
      await form.deleteInstance(reusedSlugInputs.firstTitle);
      await expect(authenticatedPage.getByText(reusedSlugInputs.firstTitle, { exact: true })).not.toBeVisible();

      await form.openNewInstanceForm();
      await form.fillTitle(reusedSlugInputs.secondTitle);
      await form.fillSlug(reusedSlugInputs.slug);
      await form.blurSlugInput();
      trackInstance(reusedSlugInputs.secondTitle);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      await expect(authenticatedPage.getByText(reusedSlugInputs.secondTitle, { exact: true })).toBeVisible();
    });
  });

  test.describe('security payloads', () => {
    test('stores a title containing a xss payload as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { title, slug } = titleSecurity.xss;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('stores a title containing a htmlInjection payload as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { title, slug } = titleSecurity.htmlInjection;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('stores a title containing a sqlInjection payload as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { title, slug } = titleSecurity.sqlInjection;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('stores a title containing a specialCharString payload as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { title, slug } = titleSecurity.specialCharString;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('stores a title containing a pathTraversal payload as literal text', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { title, slug } = titleSecurity.pathTraversal;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();
      trackInstance(title);
      await form.createButton.click();

      await expect(form.createInstanceHeading).not.toBeVisible();
      // The payload must render as literal text in the grid, not execute or inject markup.
      await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();
    });

    test('rejects a slug containing a xss payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = slugSecurity.xss;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectCreateBlocked(authenticatedPage, form, title);
    });

    test('rejects a slug containing a htmlInjection payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = slugSecurity.htmlInjection;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectCreateBlocked(authenticatedPage, form, title);
    });

    test('rejects a slug containing a sqlInjection payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = slugSecurity.sqlInjection;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectCreateBlocked(authenticatedPage, form, title);
    });

    test('rejects a slug containing a specialCharString payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = slugSecurity.specialCharString;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectCreateBlocked(authenticatedPage, form, title);
    });

    test('rejects a slug containing a pathTraversal payload', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);
      const { slug, title } = slugSecurity.pathTraversal;

      await form.openNewInstanceForm();
      await form.fillTitle(title);
      await form.fillSlug(slug);
      await form.blurSlugInput();

      await expectCreateBlocked(authenticatedPage, form, title);
    });

    // The color inputs are readonly and only take values through the picker's hex
    // field, so a rejected payload must leave the field value unchanged.
    test('rejects a xss payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.xss);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });

    test('rejects a htmlInjection payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.htmlInjection);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });

    test('rejects a sqlInjection payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.sqlInjection);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });

    test('rejects a specialCharString payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.specialCharString);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });

    test('rejects a pathTraversal payload in the color picker, keeping the value unchanged', async ({ authenticatedPage }) => {
      const form = new SiteInstancesPage(authenticatedPage);

      await form.openNewInstanceForm();
      const initialColor = await form.primaryColorInput.inputValue();

      await form.enterColorHexValue(form.primaryColorInput, securityPayloads.pathTraversal);

      await expect(form.primaryColorInput).toHaveValue(initialColor);

      await form.closeForm();
    });
  });
});
