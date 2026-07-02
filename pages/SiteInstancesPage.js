// @ts-check

export class SiteInstancesPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Site instances', exact: true });
    this.newInstanceButton = page.getByRole('button', { name: ' New instance' });
    this.siteControlsPublished = page.getByText('Site controlsPublished');
    this.publishedStatus = page.getByText('Published status');
    this.maintenanceMode = page.getByText('Maintenance mode');
  }
}
