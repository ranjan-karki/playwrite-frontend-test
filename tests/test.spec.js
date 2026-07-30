await expect(page.getByRole('heading', { name: 'Homepage messages' })).toBeVisible();
await expect(page.locator('.col-md-7 > .card')).toBeVisible();
await expect(page.locator('.page-tooltip')).toBeVisible();
await expect(page.locator('#tooltip-with-id')).toContainText('Customize the message area on the homepage of the site. Use this area for a welcome message and/or a temporary announcement. Example: Open enrollment is November 15 to November 22.');


await page.locator('.fas.fa-info-circle').click();
await expect(page.locator('.page-tooltip')).toBeVisible();
await page.locator('.fas.fa-info-circle').click();
await expect(page.locator('.page-tooltip')).not.toBeVisible();