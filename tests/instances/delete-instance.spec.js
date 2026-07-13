// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { requireEnv } from '../../utils/env.js';
import { fillerSlugs } from '../../test-data/instances.js';

const siteName = requireEnv('TEST_SITE_NAME');
const deletableInstanceTitle = 'Deletable instance';

test.describe(`${siteName} - Delete instance`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
  });

  // The test deletes its own row on the happy path; this only cleans up when a
  // failure strikes between creation and deletion.
  test.afterEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);

    const row = authenticatedPage.getByText(deletableInstanceTitle, { exact: true });
    try {
      await row.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      return; // already deleted by the test itself
    }
    await form.deleteInstance(deletableInstanceTitle);
    await expect(row).not.toBeVisible();
  });

  test('deletes an instance after confirming', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(deletableInstanceTitle);
    await form.fillSlug(fillerSlugs.deletable);
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(deletableInstanceTitle, { exact: true })).toBeVisible();

    await form.openRowActionsMenu(deletableInstanceTitle);
    await form.deleteMenuItem.click();

    await expect(form.confirmDialog).toContainText('Are you sure you want to delete this item?');

    await form.dialogProceedButton.click();

    await expect(authenticatedPage.getByText(deletableInstanceTitle, { exact: true })).not.toBeVisible();
  });
});
