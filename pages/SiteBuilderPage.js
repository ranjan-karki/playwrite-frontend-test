// @ts-check
import { escapeRegExp } from '../utils/basicUtils.js';

/**
 * Models the site builder screen reached by selecting a site: a horizontal
 * instance tab strip (each tab with its own "Options for <title>" menu offering
 * Publish / Edit / Make a copy / Remove), a Pages panel, per-page content tabs
 * (Videos, Documents, Images, Links, Contacts, Calculators) that each pull from a
 * shared resource library panel, and the top toolbar (Preview, Site menu,
 * Maintenance/Published toggles, Share site).
 */
export class SiteBuilderPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.createInstanceButton = page.getByRole('button', { name: 'Create instance', exact: true });

    // Create/copy instance dialog and the Add page dialog are all rendered as the
    // page's single modal dialog, distinguished only by their contents/submit button.
    this.dialog = page.getByRole('dialog');
    this.dialogTitleInput = this.dialog.getByRole('textbox', { name: 'Title' });
    this.dialogSlugRequiredLabel = this.dialog.getByText('Slug*');
    this.dialogThemeTiles = this.dialog.locator('.grid');
    this.dialogCreateButton = this.dialog.getByRole('button', { name: 'Create instance' });
    this.dialogSaveButton = this.dialog.getByRole('button', { name: 'Save instance' });
    this.dialogAddPageButton = this.dialog.getByRole('button', { name: 'Add page', exact: true });

    // Pages panel - a page's title also renders as the main content heading once
    // selected, so lookups here must stay scoped to the panel to avoid matching both.
    this.pagesPanel = page.getByLabel('Pages');
    this.addPageButton = this.pagesPanel.getByRole('button', { name: 'Add page', exact: true });
    this.homepageLink = this.pagesPanel.getByText('Homepage', { exact: true });

    // Resource library - an inline panel (not a modal dialog), opened from a page's
    // own "Choose <type>" button and closed with its own Close button.
    this.closeLibraryButton = page.getByRole('button', { name: 'Close', exact: true });

    // Top toolbar - site-level controls surrounding the instance tab strip.
    this.defaultBadge = page.getByText('Default').first();
    this.instanceLabel = page.getByText('Instance', { exact: true });
    this.homepageHeading = page.getByRole('heading', { name: 'Homepage' });
    this.resourceLibraryToggleButton = page.getByRole('button', { name: 'Resource library' });
    this.previewButton = page.getByRole('button', { name: 'Preview' });
    this.siteMenuButton = page.getByRole('button', { name: 'Site menu' });
    this.siteInstancesMenuItem = page.getByRole('button', { name: 'Site instances' });
    this.maintenanceLabel = page.getByText('Maintenance', { exact: true });
    this.maintenanceToggle = page.getByRole('switch', { name: 'Toggle maintenance' });
    this.publishedLabel = page.getByText('Published', { exact: true });
    this.publishedToggle = page.getByRole('switch', { name: 'Toggle published' });
    this.shareSiteButton = page.getByRole('button', { name: 'Share site with employees' });
    this.notPublishedBanner = page.getByText(
      'This site is not published and will not be visible to the public.'
    );

    // Share site dialog.
    this.shareLinkText = page.getByText('Share link');
    // Scoped to the dialog, like the other dialog controls below - unscoped, "Copy" also
    // substring-matches instance tab buttons titled e.g. "Copy source ..."/"Copy target ...".
    this.copyLinkButton = this.dialog.getByRole('button', { name: 'Copy' });
    this.websiteLinkHeading = page.getByRole('heading', { name: 'Website link' });
    this.qrCodeHeading = page.getByRole('heading', { name: 'Download and use QR code' });
    this.dialogCloseText = page.getByText('Close');

    // Publish/unpublish confirmation dialog - rendered as the shared dialog, its
    // Cancel/confirm buttons distinguished by the action's own wording, plus a
    // corner "Close" icon button that dismisses it without confirming either way.
    this.unpublishSiteHeading = page.getByText('Unpublish site');
    this.publishSiteHeading = page.getByText('Publish site');
    this.dialogCancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.unpublishConfirmButton = page.getByRole('button', { name: 'Unpublish' });
    this.publishConfirmButton = page.getByRole('button', { name: 'Publish' });
    this.dialogCloseButton = page.getByRole('button', { name: 'Close', exact: true });

    // Enable/disable maintenance mode confirmation dialog - same shared dialog,
    // distinguished by its own heading/confirm button wording.
    this.enableMaintenanceHeading = page.getByText('Enable maintenance mode', { exact: true });
    this.disableMaintenanceHeading = page.getByText('Disable maintenance mode', { exact: true });
    this.enableMaintenanceButton = page.getByRole('button', { name: 'Enable' });
    this.disableMaintenanceButton = page.getByRole('button', { name: 'Disable' });
    this.statusToast = page.getByRole('status');
    this.siteBuilderRoot = page.locator('lyb-site-builder');
  }

  /**
   * The tab strip's own button for an instance carries its name followed by a status
   * (e.g. "Copy target abc Draft"), while its options menu button is named "Options
   * for <title>" - anchoring the match to the start of the name tells the two apart.
   * @param {string} title
   */
  instanceTab(title) {
    return this.page.getByRole('button', { name: new RegExp(`^${escapeRegExp(title)}`) });
  }

  /** @param {string} title */
  optionsButtonFor(title) {
    return this.page.getByRole('button', { name: `Options for ${title}` });
  }

  /** @param {string} title */
  async openInstanceTab(title) {
    await this.instanceTab(title).click();
  }

  async openCreateInstanceForm() {
    await this.createInstanceButton.click();
  }

  /** @param {string} title */
  async openCopyForm(title) {
    await this.optionsButtonFor(title).click();
    await this.page.getByRole('button', { name: 'Make a copy' }).click();
  }

  /** @param {string} title */
  async fillDialogTitle(title) {
    await this.dialogTitleInput.click();
    await this.dialogTitleInput.fill(title);
  }

  /** Clicking the "Slug*" label triggers the same auto-fill/validation the title field kicks off. */
  async triggerSlugAutofill() {
    await this.dialogSlugRequiredLabel.click();
  }

  async selectFirstDialogTheme() {
    await this.dialogThemeTiles.first().click();
  }

  async submitCreate() {
    await this.dialogCreateButton.click();
  }

  async submitCopy() {
    await this.dialogSaveButton.click();
  }

  async openAddPageForm() {
    await this.addPageButton.click();
  }

  async submitAddPage() {
    await this.dialogAddPageButton.click();
  }

  /** @param {string} pageTitle */
  async openPage(pageTitle) {
    await this.pagesPanel.getByText(pageTitle, { exact: true }).click();
  }

  async openHomepage() {
    await this.homepageLink.click();
  }

  /** @param {string} tabName e.g. "Videos", "Documents", "Images", "Links", "Contacts", "Calculators" */
  async openContentTab(tabName) {
    await this.page.getByRole('tab', { name: tabName, exact: true }).click();
  }

  /**
   * Some themes render an extra "Choose video" tied to a carousel/banner widget
   * ahead of the tab's own one - targeting the last match reaches the tab's own
   * button either way, since it's a no-op when only one match exists.
   * @param {string} type singular resource type, e.g. "video", "document", "image", "link", "contact", "calculator"
   */
  async openResourceLibrary(type) {
    await this.page.getByRole('button', { name: `Choose ${type}` }).last().click();
  }

  /**
   * Adds the currently-first available resource in the library to the given page or
   * homepage. Once added, a resource drops out of the library and the next one shifts
   * into first place, so calling this repeatedly adds successive resources.
   * @param {string} pageOrHomepageLabel e.g. a page's title, or "Homepage"
   */
  async addFirstResource(pageOrHomepageLabel) {
    await this.page.getByRole('button', { name: `Add to ${pageOrHomepageLabel}` }).first().click();
  }

  async closeResourceLibrary() {
    await this.closeLibraryButton.click();
  }

  /**
   * The empty-state placeholder shown on a content tab before any resource of that
   * type has been added. Confirmed for videos ("No videos yet"); the other resource
   * tabs share the same component and are expected to follow the same wording.
   * @param {string} pluralType e.g. "videos", "documents", "images", "links", "contacts", "calculators"
   */
  emptyStateText(pluralType) {
    return this.page.getByText(`No ${pluralType} yet`);
  }

  async openShareDialog() {
    await this.shareSiteButton.click();
  }

  /** Selecting a site now lands on the site builder screen — reach the instances
   * list from there via the "Site menu" dropdown. */
  async openSiteInstances() {
    await this.siteMenuButton.click();
    await this.siteInstancesMenuItem.click();
  }

  async copyShareLink() {
    await this.copyLinkButton.click();
  }

  /** Dismisses the currently-open dialog via its corner "Close" text control. */
  async closeDialogByText() {
    await this.dialogCloseText.click();
  }

  /** Toggles the published switch, opening its confirm dialog either way. */
  async togglePublished() {
    await this.publishedToggle.click();
  }

  async confirmUnpublish() {
    await this.unpublishConfirmButton.click();
  }

  async confirmPublish() {
    await this.publishConfirmButton.click();
  }

  async toggleMaintenance() {
    await this.maintenanceToggle.click();
  }

  async confirmEnableMaintenance() {
    await this.enableMaintenanceButton.click();
  }

  async confirmDisableMaintenance() {
    await this.disableMaintenanceButton.click();
  }
}
