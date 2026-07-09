// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { requireEnv } from '../../utils/env.js';

const siteName = requireEnv('TEST_SITE_NAME');
const deletableInstanceTitle = 'Deletable instance';

test.describe(`${siteName} - Delete instance`, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
  });

  test('deletes an instance after confirming', async ({ authenticatedPage }) => {
    const form = new SiteInstancesPage(authenticatedPage);

    await form.openNewInstanceForm();
    await form.fillTitle(deletableInstanceTitle);
    await form.triggerSlugAutofill();
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
