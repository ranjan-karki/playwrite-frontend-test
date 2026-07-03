// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { requireEnv } from '../../utils/env.js';
import { SLUG_NOTE, newInstanceInputs, defaultThemeColors } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');

test.describe(`${siteName} - Add instance`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    await sitesPage.selectProduct(siteName);
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
    await expect(form.primaryColorInput).toHaveValue(defaultThemeColors.primary);
    await expect(form.secondaryColorInput).toHaveValue(defaultThemeColors.secondary);
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
});
