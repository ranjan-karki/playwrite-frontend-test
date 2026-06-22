const { test, expect } = require('@playwright/test');
const path = require('path');
const { selectors } = require('../../support/selectors');
const { messages } = require('../../support/messages');
const { randomAlphaNumeric, getRandomSubstring } = require('../../utils/basicUtils');
const { securityPayloads } = require('../../utils/securityPayloads');
const { SitePage } = require('../../support/pages/Site');
const { openAddForm, submitForm, cancelForm } = require('../../support/helpers');
const siteInputData = require('../../fixtures/siteInputData.json');

const STORAGE_STATE = path.join(__dirname, '../../auth/storageState.json');
const PAGE_TITLE = 'LearnYour Benefits :: Sites management';

// Resolve fixture file paths relative to project root
function fixturePath(relativePath) {
  return path.join(__dirname, '../../', relativePath);
}

const files = {
  jpg: fixturePath(siteInputData.file.jpg),
  png: fixturePath(siteInputData.file.png),
  jpeg: fixturePath(siteInputData.file.jpeg),
  svg: fixturePath(siteInputData.file.svg),
  xls: fixturePath(siteInputData.file.xls),
  ppt: fixturePath(siteInputData.file.ppt),
  pdf: fixturePath(siteInputData.file.pdf),
  exe: fixturePath(siteInputData.file.exe),
  doc: fixturePath(siteInputData.file.doc),
};

test.use({ storageState: STORAGE_STATE });

test.describe('Site Add Test', () => {
  let sitePage;

  test.beforeEach(async ({ page }) => {
    sitePage = new SitePage(page);
    await page.goto('/manage/sites');
    await page.waitForTimeout(3000);
    await openAddForm(page);
  });

  test.describe('Modal Elements Visibility', () => {
    test('should display all form elements and buttons', async ({ page }) => {
      await expect(page.locator(selectors.sites.imageUploader)).toBeEnabled();
      await expect(page.locator(selectors.sites.titleField)).toBeVisible();
      await expect(page.locator(selectors.sites.domainField)).toBeVisible();
      await expect(page.locator(selectors.sites.primaryColor)).toBeVisible();
      await expect(page.locator(selectors.sites.secondaryColor)).toBeVisible();
      await expect(page.locator(selectors.common.saveButton)).toBeVisible();
      await expect(page.locator(selectors.common.cancelButton)).toBeVisible();
      await expect(page.locator(selectors.common.modalCloseButton)).toBeVisible();
    });
  });

  test.describe('Save Button State Validation', () => {
    test('should keep save button disabled when all fields are empty', async ({ page }) => {
      await expect(page.locator(selectors.common.saveButton)).toBeDisabled();
    });

    test('should keep save button disabled when only image is uploaded', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.jpg);
      await expect(page.locator(selectors.common.saveButton)).toBeDisabled();
    });

    test('should keep save button disabled when only title is filled', async ({ page }) => {
      await page.locator(selectors.sites.titleField).fill(getRandomSubstring(10));
      await expect(page.locator(selectors.common.saveButton)).toBeDisabled();
    });

    test('should keep save button disabled when only domain is filled', async ({ page }) => {
      await page.locator(selectors.sites.domainField).fill(randomAlphaNumeric(5).toLowerCase());
      await expect(page.locator(selectors.common.saveButton)).toBeDisabled();
    });

    test('should enable save button when all required fields are filled', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.jpg);
      await page.locator(selectors.sites.titleField).fill(getRandomSubstring(10));
      await page.locator(selectors.sites.domainField).fill(randomAlphaNumeric(5).toLowerCase());
      await expect(page.locator(selectors.common.saveButton)).toBeEnabled();
    });
  });

  test.describe('Logo File Type Validation', () => {
    test('should accept valid JPG file', async ({ page }) => {
      await expect(page.locator(selectors.sites.uploadedImageThumbnail)).toHaveCount(0);
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.jpg);
      await expect(page.locator(selectors.sites.uploadedImageThumbnail)).toBeVisible();
    });

    test('should accept valid PNG file', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.png);
      await expect(page.locator(selectors.sites.uploadedImageThumbnail)).toBeVisible();
    });

    test('should accept valid JPEG file', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.jpeg);
      await expect(page.locator(selectors.sites.uploadedImageThumbnail)).toBeVisible();
    });

    test('should accept valid SVG file', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.svg);
      await expect(page.locator(selectors.sites.uploadedImageThumbnail)).toBeVisible();
    });

    test('should show error for invalid PDF file type', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.pdf);
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid XLS file type', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.xls);
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid PPT file type', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.ppt);
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid EXE file type', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.exe);
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid DOC file type', async ({ page }) => {
      await page.locator(selectors.sites.imageUploader).setInputFiles(files.doc);
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });
  });

  test.describe('Color Picker Functionality', () => {
    test('should display color picker when primary color field is clicked', async ({ page }) => {
      await page.locator(selectors.sites.primaryColor).click();
      await expect(page.locator(selectors.sites.primaryColorPicker)).toBeVisible();
    });

    test('should accept hex color value in primary color field', async ({ page }) => {
      await page.locator(selectors.sites.primaryColor).click();
      await page.locator(selectors.sites.primaryColorPicker).clear();
      await page.locator(selectors.sites.primaryColorPicker).fill(siteInputData.siteAdd.PrimaryColor);
      await expect(page.locator(selectors.sites.primaryColorPicker)).toHaveValue(siteInputData.siteAdd.PrimaryColor);
      await page.locator(selectors.sites.primaryColorPickerOkButton).click();
    });

    test('should display color picker when secondary color field is clicked', async ({ page }) => {
      await page.locator(selectors.sites.secondaryColor).click();
      await expect(page.locator(selectors.sites.secondaryColorPicker)).toBeVisible();
    });

    test('should accept hex color value in secondary color field', async ({ page }) => {
      await page.locator(selectors.sites.secondaryColor).click();
      await page.locator(selectors.sites.secondaryColorPicker).clear();
      await page.locator(selectors.sites.secondaryColorPicker).fill(siteInputData.siteAdd.PrimaryColor);
      await expect(page.locator(selectors.sites.secondaryColorPicker)).toHaveValue(siteInputData.siteAdd.PrimaryColor);
      await page.locator(selectors.sites.secondaryColorPickerOkButton).click();
    });
  });

  test.describe('Title Field Character Limit', () => {
    test('should accept title with 255 characters and should add site', async ({ page }) => {
      const title = randomAlphaNumeric(255);
      await sitePage.fillCreateForm(files.jpg, title, randomAlphaNumeric(5).toLowerCase(), '', '');
      await submitForm(page);
      await page.waitForTimeout(5000);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
    });

    test('should show error when title exceeds 255 characters', async ({ page }) => {
      const title = randomAlphaNumeric(256);
      await sitePage.fillCreateForm(files.jpg, title, randomAlphaNumeric(5).toLowerCase(), siteInputData.siteAdd.PrimaryColor, siteInputData.siteAdd.secondaryolor);
      await submitForm(page);
      await page.waitForTimeout(3000);
      await expect(page.locator(selectors.sites.titleErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.titleErrorToolTip)).toContainText(messages.titleLengthLimit255);
    });
  });

  test.describe('Domain Field Character Limit & Unique', () => {
    test('should accept domain with exactly 50 characters', async ({ page }) => {
      const domain = randomAlphaNumeric(50).toLowerCase();
      await sitePage.fillCreateForm(files.jpg, getRandomSubstring(10), domain, '', '');
      await submitForm(page);
      await page.waitForTimeout(2000);
      await page.locator(selectors.common.searchField).first().fill(domain);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.sites.titleOfFirstSiteCardView)).toBeVisible();
    });

    test('should show error when domain exceeds 50 characters', async ({ page }) => {
      const domain = randomAlphaNumeric(51).toLowerCase();
      await sitePage.fillCreateForm(files.jpg, getRandomSubstring(10), domain, '', '');
      await submitForm(page);
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toContainText(messages.domainLengthLimit);
    });

    test('should not accept domain with spaces between characters', async ({ page }) => {
      const domain = 'test domain name';
      await sitePage.fillCreateForm(files.jpg, getRandomSubstring(10), domain, '', '');
      await submitForm(page);
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toContainText(messages.domainCharConatin);
    });

    test('should show error when trying to add duplicate domain', async ({ page }) => {
      const domain = 'test' + randomAlphaNumeric(8).toLowerCase();

      await sitePage.fillCreateForm(files.jpg, getRandomSubstring(10), domain, '', '');
      await submitForm(page);
      await page.waitForTimeout(2000);

      await openAddForm(page);
      await sitePage.fillCreateForm(files.jpg, getRandomSubstring(10), domain, '', '');
      await submitForm(page);
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toContainText(messages.domainAlreadyTaken);
    });
  });

  test.describe('Cancel and Close Button Behavior', () => {
    test('should not trigger API when cancel button is clicked after filling all fields', async ({ page }) => {
      const title = getRandomSubstring(50);
      await sitePage.fillCreateForm(files.jpg, title, randomAlphaNumeric(10).toLowerCase(), '', '');
      await cancelForm(page);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.sites.titleField)).toHaveCount(0);
    });

    test('should not trigger API when close button is clicked after filling all fields', async ({ page }) => {
      const title = getRandomSubstring(50);
      await sitePage.fillCreateForm(files.jpg, title, randomAlphaNumeric(10).toLowerCase(), '', '');
      await cancelForm(page);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.sites.titleField)).toHaveCount(0);
    });
  });

  test.describe('Security Tests - XSS and SQL Injection', () => {
    test('should handle XSS attempt in title field', async ({ page }) => {
      await sitePage.fillCreateForm(files.jpg, securityPayloads.xss, randomAlphaNumeric(5).toLowerCase(), '', '');
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
    });

    test('should handle SQL injection attempt in title field', async ({ page }) => {
      await sitePage.fillCreateForm(files.jpg, securityPayloads.sql, randomAlphaNumeric(5).toLowerCase(), '', '');
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
    });

    test('should handle XSS attempt in domain field', async ({ page }) => {
      await sitePage.fillCreateForm(files.jpg, getRandomSubstring(10), securityPayloads.xss.toLowerCase(), '', '');
      await submitForm(page);
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toContainText(messages.domainCharConatin);
    });

    test('should handle SQL injection attempt in domain field', async ({ page }) => {
      await sitePage.fillCreateForm(files.jpg, getRandomSubstring(10), securityPayloads.sql.toLowerCase(), '', '');
      await submitForm(page);
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.sites.domainErrorToolTip)).toContainText(messages.domainCharConatin);
    });
  });

  test.describe('Successful Site Creation with minimum char length', () => {
    test('should successfully create site with minimum title length', async ({ page }) => {
      const title = getRandomSubstring(1);
      await sitePage.fillCreateForm(files.jpg, title, randomAlphaNumeric(5).toLowerCase(), '', '');
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.sites.titleOfFirstSiteCardView)).toBeVisible();
    });

    test('should successfully create site with minimum domain length', async ({ page }) => {
      const title = getRandomSubstring(10);
      await sitePage.fillCreateForm(files.jpg, title, randomAlphaNumeric(1).toLowerCase(), '', '');
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.sites.titleOfFirstSiteCardView)).toBeVisible();
    });
  });
});
