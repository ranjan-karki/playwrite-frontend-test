// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { SiteBrandingPage } from '../../pages/SiteBrandingPage.js';
import { requireEnv } from '../../utils/env.js';
import { SLUG_NOTE, newInstanceInputs } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');

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

  test('truncates the slug value to a maximum of 60 characters', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(newInstanceInputs.title);
    await form.fillSlug(newInstanceInputs.longSlug);

    await expect(form.slugInput).toHaveValue(newInstanceInputs.longSlug.slice(0, 60));

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
    const title = 'Min slug instance';

    await form.openNewInstanceForm();
    await form.fillTitle(title);
    await form.slugInput.click();
    await form.fillSlug(newInstanceInputs.minSlug);
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(form.heading).toBeVisible();
    await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();

    await form.deleteInstance(title);

    await expect(authenticatedPage.getByText(title, { exact: true })).not.toBeVisible();
  });

  test('creates an instance with a maximum-length (60 char) slug', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);
    const title = 'Max slug instance';

    await form.openNewInstanceForm();
    await form.fillTitle(title);
    await form.fillSlug(newInstanceInputs.maxSlug);
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(title, { exact: true })).toBeVisible();

    await form.deleteInstance(title);

    await expect(authenticatedPage.getByText(title, { exact: true })).not.toBeVisible();
  });
});
