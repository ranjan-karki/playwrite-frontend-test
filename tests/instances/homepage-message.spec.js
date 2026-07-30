// @ts-check
import { test, expect } from '../../fixtures/auth.fixture.js';
import { SitesPage } from '../../pages/SitesPage.js';
import { SiteInstancesPage } from '../../pages/SiteInstancesPage.js';
import { HomepageMessagePage } from '../../pages/HomepageMessagePage.js';
import { requireEnv } from '../../utils/env.js';
import { targetInstanceTitles, fillerSlugs } from '../../test-data/instances.js';
import { messages } from '../../test-data/message.js';
import { securityPayloads } from '../../test-data/securityPayloads.js';
import { homepageMessageInputs } from '../../test-data/homepageMessage.js';

const siteName = requireEnv('TEST_SITE_NAME');
// The suite creates (and later deletes) its own target instance rather than depending
// on an environment-specific one, so the "Homepage messages" nav link is reached the
// same way for any environment this runs against.
const instanceName = targetInstanceTitles.homepageMessage;

test.describe(`${siteName} - Homepage message`, () => {
  test.beforeAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await form.openNewInstanceForm();
    await form.fillTitle(instanceName);
    await form.fillSlug(fillerSlugs.homepageMessageTarget);
    await form.blurSlugInput();
    await form.createButton.click();

    await expect(form.createInstanceHeading).not.toBeVisible();
    await expect(authenticatedPage.getByText(instanceName, { exact: true })).toBeVisible();
  });

  test.afterAll(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const form = new SiteInstancesPage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await form.deleteInstance(instanceName);

    await expect(authenticatedPage.getByText(instanceName, { exact: true })).not.toBeVisible();
  });

  test.beforeEach(async ({ authenticatedPage }) => {
    const sitesPage = new SitesPage(authenticatedPage);
    const siteInstancesPage = new SiteInstancesPage(authenticatedPage);
    const messagePage = new HomepageMessagePage(authenticatedPage);

    await authenticatedPage.goto('/manage/sites');
    await sitesPage.selectSite(siteName);
    await siteInstancesPage.openInstance(instanceName);
    await messagePage.open();
  });

  test.describe('page display', () => {
    test('displays the homepage message heading, form, and info tooltip', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await expect(messagePage.heading).toBeVisible();
      await expect(messagePage.formCard).toBeVisible();
      await expect(messagePage.messageEditor).toBeVisible();
      await expect(messagePage.saveButton).toBeVisible();

      await messagePage.toggleInfoTooltip();

      await expect(messagePage.tooltip).toBeVisible();
      await expect(messagePage.tooltipBody).toContainText(
        'Customize the message area on the homepage of the site. Use this area for a welcome message and/or a temporary announcement. Example: Open enrollment is November 15 to November 22.'
      );

      await messagePage.toggleInfoTooltip();

      await expect(messagePage.tooltip).not.toBeVisible();
    });

    test('disables Save until a change is made, and reveals Cancel once one is', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await expect(messagePage.saveButton).toBeDisabled();
      await expect(messagePage.cancelButton).not.toBeVisible();

      await messagePage.fillMessage(homepageMessageInputs.standard);

      await expect(messagePage.saveButton).toBeEnabled();
      await expect(messagePage.cancelButton).toBeVisible();

      await messagePage.cancel();
    });
  });

  test.describe('validation', () => {
    test('shows the required-field error when saved empty', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      // Establish a real, saved value first so Save is guaranteed to be enabled once
      // the field is cleared afterward, regardless of the instance's pristine state.
      await messagePage.fillMessage(homepageMessageInputs.standard);
      await messagePage.save();

      await messagePage.clearMessage();
      await messagePage.save();

      await expect(authenticatedPage.getByText(messages.messageRequired)).toBeVisible();

      await messagePage.cancel();
    });
  });

  test.describe('message content', () => {
    test('saves a standard message', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(homepageMessageInputs.standard);
      await messagePage.save();

      await expect(authenticatedPage.getByText(messages.messageRequired)).not.toBeVisible();
      await expect(messagePage.messageEditor).toContainText(homepageMessageInputs.standard);
    });

    test('updates an existing message', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(homepageMessageInputs.standard);
      await messagePage.save();
      await messagePage.fillMessage(homepageMessageInputs.updated);
      await messagePage.save();

      await expect(messagePage.messageEditor).toContainText(homepageMessageInputs.updated);
    });

    test('accepts a large message (5,000 characters)', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(homepageMessageInputs.large);
      await messagePage.save();

      await expect(authenticatedPage.getByText(messages.messageRequired)).not.toBeVisible();
      // toContainText normalizes whitespace, unlike a raw string comparison - the
      // contenteditable box reflows/collapses whitespace and newlines on render, so a
      // literal substring match against the source text would spuriously fail.
      await expect(messagePage.messageEditor).toContainText(homepageMessageInputs.large.slice(0, 200));
      const savedText = await messagePage.getMessageText();
      // Tolerant of whitespace collapsing rather than an exact/greater-or-equal length,
      // while still catching real truncation of a large value.
      expect(savedText.length).toBeGreaterThan(homepageMessageInputs.large.length * 0.8);
    });

    test('accepts a very large message (20,000 characters)', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(homepageMessageInputs.extreme);
      await messagePage.save();

      await expect(authenticatedPage.getByText(messages.messageRequired)).not.toBeVisible();
      const savedText = await messagePage.getMessageText();
      expect(savedText.length).toBeGreaterThan(homepageMessageInputs.extreme.length * 0.8);
    });
  });

  test.describe('editing', () => {
    test('discards an unsaved edit on cancel', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(homepageMessageInputs.standard);
      await messagePage.save();

      await messagePage.fillMessage(homepageMessageInputs.updated);
      await messagePage.cancel();

      await messagePage.open();
      await expect(messagePage.messageEditor).toHaveText(homepageMessageInputs.standard);
    });
  });

  test.describe('security payloads', () => {
    test('stores an xss payload as literal text', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(securityPayloads.xss);
      await messagePage.save();

      await expect(messagePage.messageEditor).toContainText(securityPayloads.xss);
    });

    test('stores an htmlInjection payload as literal text', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(securityPayloads.htmlInjection);
      await messagePage.save();

      await expect(messagePage.messageEditor).toContainText(securityPayloads.htmlInjection);
    });

    test('stores a sqlInjection payload as literal text', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(securityPayloads.sqlInjection);
      await messagePage.save();

      await expect(messagePage.messageEditor).toContainText(securityPayloads.sqlInjection);
    });

    test('stores a specialCharString payload as literal text', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(securityPayloads.specialCharString);
      await messagePage.save();

      await expect(messagePage.messageEditor).toContainText(securityPayloads.specialCharString);
    });

    test('stores a pathTraversal payload as literal text', async ({ authenticatedPage }) => {
      const messagePage = new HomepageMessagePage(authenticatedPage);

      await messagePage.fillMessage(securityPayloads.pathTraversal);
      await messagePage.save();

      await expect(messagePage.messageEditor).toContainText(securityPayloads.pathTraversal);
    });
  });
});
