// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { requireEnv } from '../../utils/env.js';

const siteName = requireEnv('TEST_SITE_NAME');

test.describe(`${siteName} site instances`, () => {
  test('displays site instances page controls', async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);

    await sitesPage.selectProduct(siteName);

    await expect(siteInstancesPage.heading).toBeVisible();
    await expect(siteInstancesPage.newInstanceButton).toBeVisible();
    await expect(siteInstancesPage.siteControlsPublished).toBeVisible();
    await expect(siteInstancesPage.publishedStatus).toBeVisible();
    await expect(siteInstancesPage.maintenanceMode).toBeVisible();
  });
});
