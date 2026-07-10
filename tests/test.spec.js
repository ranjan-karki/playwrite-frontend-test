
//primary color value input
await page.getByRole('textbox', { name: 'Primary color' }).click();
await page.locator('.saturation-lightness').first().click();
await page.getByRole('button', { name: 'OK' }).click();


await page.getByRole('textbox', { name: 'Primary color' }).click();
await page.getByRole('textbox').nth(3).click();
await page.getByRole('textbox').nth(3).fill('#624141');
await page.getByRole('textbox').nth(3).press('Enter');

//secondary color value input
await page.getByRole('textbox', { name: 'Secondary color' }).click();
await page.locator('.color-picker.open > .saturation-lightness').click();
await page.getByRole('button', { name: 'OK' }).click();


await page.getByRole('textbox', { name: 'Secondary color' }).click();
await page.getByRole('textbox').nth(4).click();
await page.getByRole('textbox').nth(4).fill('#814181');
await page.getByRole('textbox').nth(4).press('Enter');