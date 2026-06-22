const { test, expect } = require('@playwright/test');
const path = require('path');
const { selectors } = require('../../support/selectors');
const { messages } = require('../../support/messages');
const { randomAlphaNumeric, getRandomSubstring } = require('../../utils/basicUtils');
const { securityPayloads } = require('../../utils/securityPayloads');
const { ResellerPage } = require('../../support/pages/Reseller');
const { openAddForm, submitForm, cancelForm } = require('../../support/helpers');
const resellerInputData = require('../../fixtures/resellerInputData.json');

const STORAGE_STATE = path.join(__dirname, '../../auth/storageState.json');
const PAGE_TITLE = 'LearnYour Benefits :: Reseller management';

function fixturePath(relativePath) {
  return path.join(__dirname, '../../', relativePath);
}

const files = {
  jpg: fixturePath(resellerInputData.file.jpg),
  png: fixturePath(resellerInputData.file.png),
  jpeg: fixturePath(resellerInputData.file.jpeg),
  svg: fixturePath(resellerInputData.file.svg),
  xls: fixturePath(resellerInputData.file.xls),
  ppt: fixturePath(resellerInputData.file.ppt),
  pdf: fixturePath(resellerInputData.file.pdf),
  exe: fixturePath(resellerInputData.file.exe),
  doc: fixturePath(resellerInputData.file.doc),
};

test.use({ storageState: STORAGE_STATE });

test.describe('Reseller Add Test', () => {
  let resellerPage;

  test.beforeEach(async ({ page }) => {
    resellerPage = new ResellerPage(page);
    await page.goto('/manage/resellers');
    await page.waitForTimeout(3000);
    await openAddForm(page);
  });

  test.describe('Modal Elements Visibility', () => {
    test('should display all form elements and buttons', async ({ page }) => {
      await page.waitForTimeout(1000);
      await expect(page.locator(selectors.resellers.imageUploader)).toBeEnabled();
      await expect(page.locator(selectors.resellers.title)).toBeVisible();
      await expect(page.locator(selectors.resellers.primaryColor)).toBeVisible();
      await expect(page.locator(selectors.resellers.secondaryColor)).toBeVisible();
      await expect(page.locator(selectors.resellers.description)).toBeVisible();
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
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.jpg);
      await expect(page.locator(selectors.common.saveButton)).toBeDisabled();
    });

    test('should keep save button disabled when only title is filled', async ({ page }) => {
      await page.locator(selectors.resellers.title).fill(getRandomSubstring(10));
      await expect(page.locator(selectors.common.saveButton)).toBeDisabled();
    });

    test('should enable save button when all required fields are filled', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.jpg);
      await page.locator(selectors.resellers.title).fill(getRandomSubstring(10));
      await page.locator(selectors.resellers.description).fill(getRandomSubstring(50));
      await expect(page.locator(selectors.common.saveButton)).toBeEnabled();
    });
  });

  test.describe('Logo File Type Validation', () => {
    test('should accept valid JPG file', async ({ page }) => {
      await expect(page.locator(selectors.resellers.uploadedImageThumbnail)).toHaveCount(0);
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.jpg);
      await expect(page.locator(selectors.resellers.uploadedImageThumbnail)).toBeVisible();
    });

    test('should accept valid PNG file', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.png);
      await expect(page.locator(selectors.resellers.uploadedImageThumbnail)).toBeVisible();
    });

    test('should accept valid JPEG file', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.jpeg);
      await expect(page.locator(selectors.resellers.uploadedImageThumbnail)).toBeVisible();
    });

    test('should accept valid SVG file', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.svg);
      await expect(page.locator(selectors.resellers.uploadedImageThumbnail)).toBeVisible();
    });

    test('should show error for invalid PDF file type', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.pdf);
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid XLS file type', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.xls);
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid PPT file type', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.ppt);
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid EXE file type', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.exe);
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid DOC file type', async ({ page }) => {
      await page.locator(selectors.resellers.imageUploader).setInputFiles(files.doc);
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.resellers.logoErrorToolTip)).toContainText(messages.imageFileTypeError);
    });
  });

  test.describe('Title Field Character Limit', () => {
    test('should accept title with 255 characters and should add reseller', async ({ page }) => {
      const title = randomAlphaNumeric(255);
      await resellerPage.fillCreateForm(files.jpg, title, '', '', getRandomSubstring(100));
      await submitForm(page);
      await page.waitForTimeout(5000);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await page.waitForTimeout(2000);
      await expect(page.locator(selectors.resellers.singleResellerCardView)).toBeVisible();
    });

    test('should show error when title exceeds 255 characters', async ({ page }) => {
      const title = randomAlphaNumeric(256);
      await resellerPage.fillCreateForm(files.jpg, title, '', '', getRandomSubstring(100));
      await submitForm(page);
      await page.waitForTimeout(3000);
      await expect(page.locator(selectors.resellers.titleErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.resellers.titleErrorToolTip)).toContainText(messages.titleLengthLimit255);
    });
  });

  test.describe('Description Field Long Text Validation', () => {
    test('should accept description with 2000 characters', async ({ page }) => {
      const title = getRandomSubstring(50);
      const longDescription = getRandomSubstring(2000);
      await resellerPage.fillCreateForm(files.jpg, title, '', '', longDescription);
      await submitForm(page);
      await page.waitForTimeout(2000);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.singleResellerCardView)).toBeVisible();
    });

    test('should accept description with special characters', async ({ page }) => {
      const title = getRandomSubstring(50);
      const description = 'Description with special chars: @#$%^&*()_+-={}[]|:;"<>,.?/';
      await resellerPage.fillCreateForm(files.jpg, title, '', '', description);
      await submitForm(page);
      await page.waitForTimeout(3000);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.singleResellerCardView)).toBeVisible();
    });
  });

  test.describe('Cancel and Close Button Behavior', () => {
    test('should not trigger API when cancel button is clicked after filling all fields', async ({ page }) => {
      const title = getRandomSubstring(50);
      const message = getRandomSubstring(200);
      await resellerPage.fillCreateForm(files.jpg, title, '', '', message);
      await cancelForm(page);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.title)).toHaveCount(0);
    });

    test('should not trigger API when close button is clicked after filling all fields', async ({ page }) => {
      const title = getRandomSubstring(50);
      const description = getRandomSubstring(200);
      await resellerPage.fillCreateForm(files.jpg, title, '', '', description);
      await cancelForm(page);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.title)).toHaveCount(0);
    });
  });

  test.describe('Security Tests - XSS and SQL Injection', () => {
    test('should handle XSS attempt in title field', async ({ page }) => {
      const title = securityPayloads.xss;
      await resellerPage.fillCreateForm(files.jpg, title, '', '', getRandomSubstring(100));
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.singleResellerCardView)).toBeVisible();
    });

    test('should handle SQL injection attempt in title field', async ({ page }) => {
      const title = securityPayloads.sql;
      await resellerPage.fillCreateForm(files.jpg, title, '', '', getRandomSubstring(100));
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.singleResellerCardView)).toBeVisible();
    });

    test('should handle XSS attempt in description field', async ({ page }) => {
      const title = getRandomSubstring(10);
      await resellerPage.fillCreateForm(files.jpg, title, '', '', securityPayloads.xss);
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.singleResellerCardView)).toBeVisible();
    });

    test('should handle SQL injection attempt in description field', async ({ page }) => {
      const title = getRandomSubstring(10);
      await resellerPage.fillCreateForm(files.jpg, getRandomSubstring(10), '', '', securityPayloads.sql);
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.singleResellerCardView)).toBeVisible();
    });
  });

  test.describe('Successful Reseller Creation with minimum char length', () => {
    test('should successfully create reseller with minimum title length', async ({ page }) => {
      const title = getRandomSubstring(1);
      await resellerPage.fillCreateForm(files.jpg, title, '', '', getRandomSubstring(100));
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.titleOfFirstResellerCardView)).toBeVisible();
    });

    test('should successfully create reseller with minimum description length', async ({ page }) => {
      const title = getRandomSubstring(10);
      await resellerPage.fillCreateForm(files.jpg, title, '', '', getRandomSubstring(1));
      await submitForm(page);
      await page.waitForTimeout(2000);
      await expect(page).toHaveTitle(PAGE_TITLE);
      await page.locator(selectors.common.searchField).first().fill(title);
      await page.locator(selectors.common.searchField).first().press('Enter');
      await expect(page.locator(selectors.resellers.titleOfFirstResellerCardView)).toBeVisible();
    });
  });
});
