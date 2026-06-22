const { test, expect } = require('@playwright/test');
const path = require('path');
const { selectors } = require('../../support/selectors');
const { messages } = require('../../support/messages');
const { openAddForm, ensureCardView, trimText } = require('../../support/helpers');

const STORAGE_STATE = path.join(__dirname, '../../auth/storageState.json');

// Video fixture data inline (matches Cypress structure)
const videoInputData = {
  file: {
    jpg: path.join(__dirname, '../../fixtures/uploadfiles/lion_king.jpg'),
    png: path.join(__dirname, '../../fixtures/uploadfiles/Bbb-splash3.png'),
    jpeg: path.join(__dirname, '../../fixtures/uploadfiles/sample.jpeg'),
    svg: path.join(__dirname, '../../fixtures/uploadfiles/lion_king.jpg'),
    xls: path.join(__dirname, '../../fixtures/uploadfiles/file.xls'),
    ppt: path.join(__dirname, '../../fixtures/uploadfiles/sample.pptx'),
    pdf: path.join(__dirname, '../../fixtures/uploadfiles/A17_FlightPlan.pdf'),
    exe: path.join(__dirname, '../../fixtures/uploadfiles/7z.exe'),
    doc: path.join(__dirname, '../../fixtures/uploadfiles/file.doc'),
  }
};

test.use({ storageState: STORAGE_STATE });

test.describe('Add Video Page Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/manage/videos');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/manage\/videos/);
    await expect(page.locator(selectors.common.pageTitle)).toContainText('Video management');
    await ensureCardView(page);
    await openAddForm(page);
  });

  test('should navigate to the add video page and display main sections', async ({ page }) => {
    await expect(page.locator(selectors.videos.addVideoSection)).toBeVisible();
    const headerText = await trimText(page, selectors.videos.addVideoHeader);
    expect(headerText).toBe('Upload your own video');
    await page.locator(selectors.videos.videoLibrarySection).scrollIntoViewIfNeeded();
    await expect(page.locator(selectors.videos.videoLibrarySection)).toBeVisible();
    const libraryText = await trimText(page, selectors.videos.videoLibraryHeader);
    expect(libraryText).toContain('Video library');
  });

  test('should display the video library list', async ({ page }) => {
    await expect(page.locator(selectors.videos.videoLibraryList)).toBeVisible();
    await expect(page.locator(selectors.videos.videoLibraryItemTitle)).toBeVisible();
  });

  test('should display the add video form correctly', async ({ page }) => {
    await expect(page.locator(selectors.videos.titleInput)).toBeVisible();
    await expect(page.locator(selectors.videos.descriptionInput)).toBeVisible();
    await expect(page.locator(selectors.videos.videoUploadLinkButton)).toBeVisible();
    await page.locator(selectors.videos.vidoeUrlInputformLink).click();
    await expect(page.locator(selectors.videos.videoUrlInput)).toBeVisible();
    await page.locator(selectors.common.saveButtonOfPage).scrollIntoViewIfNeeded();
    await expect(page.locator(selectors.common.saveButtonOfPage)).toBeVisible();
    await expect(page.locator(selectors.common.saveButtonOfPage)).toContainText('Save');
    await expect(page.locator(selectors.common.cancelButtonOfPage)).toBeVisible();
    await expect(page.locator(selectors.common.cancelButtonOfPage)).toContainText('Cancel');
    await expect(page.locator(selectors.videos.addGlobalToggle)).toBeVisible();
  });

  test.describe('Crop thumbnail modal Validation', () => {
    test('should display title correctly', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.jpg);
      await expect(page.locator(selectors.videos.cropThumbnailModal)).toBeVisible();
      await expect(page.locator(selectors.videos.cropThumbnailModalTitle)).toHaveText('Crop thumbnail');
    });

    test('should display title and elements correctly', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.jpg);
      await expect(page.locator(selectors.videos.cropThumbnailModalDoneButton)).toBeVisible();
      await expect(page.locator(selectors.videos.cropThumbnailModalKeepOriginalButton)).toBeVisible();
      await expect(page.locator(selectors.videos.cropThumbnailModalCancelButton)).toBeVisible();
    });

    test('should display image preview and crop container', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.jpg);
      await expect(page.locator(selectors.videos.previewContainerImage)).toBeVisible();
      const previewSrc = await page.locator(selectors.videos.previewContainerImage).getAttribute('src');
      expect(previewSrc).not.toBe('');
      const cropSrc = await page.locator(selectors.videos.cropContainerImage).getAttribute('src');
      expect(cropSrc).not.toBe('');
    });
  });

  test.describe('Thumbnail File Type Validation', () => {
    test('should accept valid JPG file', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.jpg);
      await expect(page.locator(selectors.videos.cropThumbnailModal)).toBeVisible();
    });

    test('should accept valid PNG file', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.png);
      await expect(page.locator(selectors.videos.cropThumbnailModal)).toBeVisible();
    });

    test('should accept valid JPEG file', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.jpeg);
      await expect(page.locator(selectors.videos.cropThumbnailModal)).toBeVisible();
    });

    test('should accept valid SVG file', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.svg);
      await expect(page.locator(selectors.videos.cropThumbnailModal)).toBeVisible();
    });

    test('should show error for invalid PDF file type', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.pdf);
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid XLS file type', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.xls);
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid PPT file type', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.ppt);
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid EXE file type', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.exe);
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toContainText(messages.imageFileTypeError);
    });

    test('should show error for invalid DOC file type', async ({ page }) => {
      await page.locator(selectors.videos.thumbnailInput).setInputFiles(videoInputData.file.doc);
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toBeVisible();
      await expect(page.locator(selectors.videos.thumbnailErrorToolTip)).toContainText(messages.imageFileTypeError);
    });
  });
});
