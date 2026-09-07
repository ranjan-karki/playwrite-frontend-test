// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteBuilderPage } from '../../pages/SiteBuilderPage.js';
import { requireEnv } from '../../utils/env.js';
import { copyInstanceInputs } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');
const { sourceTitle, pageTitle, copyTitle } = copyInstanceInputs;

// Every resource type a page can hold, alongside the library's singular "Choose <type>"
// wording and the plural wording used by that tab's empty-state placeholder.
const RESOURCE_TABS = [
  { pageTab: 'Videos', libraryType: 'video', plural: 'videos' },
  { pageTab: 'Documents', libraryType: 'document', plural: 'documents' },
  { pageTab: 'Images', libraryType: 'image', plural: 'images' },
  { pageTab: 'Links', libraryType: 'link', plural: 'links' },
  { pageTab: 'Contacts', libraryType: 'contact', plural: 'contacts' },
  { pageTab: 'Calculators', libraryType: 'calculator', plural: 'calculators' },
];

test.describe(`${siteName} - Copy instance`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
  });

  // Removes both the source and copy instances, whichever of them still exist, so a
  // test that fails midway doesn't leave orphan instances behind.
  test.afterEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const builder = new SiteBuilderPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);

    for (const title of [copyTitle, sourceTitle]) {
      const optionsButton = builder.optionsButtonFor(title);
      if (!(await optionsButton.isVisible().catch(() => false))) continue;

      await optionsButton.click();
      await authenticatedPage.getByRole('button', { name: 'Remove' }).click();

      const confirmButton = authenticatedPage.getByRole('button', { name: 'Proceed' });
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }
      await expect(optionsButton).not.toBeVisible();
    }
  });

  test('copying an instance carries over its page content and homepage videos', async ({ authenticatedPage }) => {
    const builder = new SiteBuilderPage(authenticatedPage);

    // Build a source instance with a page that holds one resource of every type,
    // plus a homepage video.
    await builder.openCreateInstanceForm();
    await builder.fillDialogTitle(sourceTitle);
    await builder.triggerSlugAutofill();
    await builder.submitCreate();
    await expect(builder.dialog).not.toBeVisible();
    await expect(authenticatedPage.getByText(sourceTitle, { exact: true })).toBeVisible();

    await builder.openAddPageForm();
    await builder.fillDialogTitle(pageTitle);
    await builder.submitAddPage();
    await builder.openPage(pageTitle);

    for (const { pageTab, libraryType, plural } of RESOURCE_TABS) {
      await builder.openContentTab(pageTab);
      await builder.openResourceLibrary(libraryType);
      await builder.addFirstResource(pageTitle);
      await builder.closeResourceLibrary();

      await expect(builder.emptyStateText(plural)).not.toBeVisible();
    }

    await builder.openHomepage();
    await builder.openContentTab('Videos');
    await builder.openResourceLibrary('video');
    await builder.addFirstResource('Homepage');
    await builder.closeResourceLibrary();
    await expect(builder.emptyStateText('videos')).not.toBeVisible();

    // Copy the instance.
    await builder.openCopyForm(sourceTitle);
    await builder.fillDialogTitle(copyTitle);
    await builder.selectFirstDialogTheme();
    await builder.submitCopy();
    await expect(builder.dialog).not.toBeVisible();
    await expect(authenticatedPage.getByText(copyTitle, { exact: true })).toBeVisible();

    // The copy should carry over the same page, populated with the same resource types.
    await builder.openInstanceTab(copyTitle);
    await builder.openPage(pageTitle);

    for (const { pageTab, plural } of RESOURCE_TABS) {
      await builder.openContentTab(pageTab);
      await expect(builder.emptyStateText(plural)).not.toBeVisible();
    }

    await builder.openHomepage();
    await builder.openContentTab('Videos');
    await expect(builder.emptyStateText('videos')).not.toBeVisible();
  });
});
