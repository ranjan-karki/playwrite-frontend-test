const { selectors } = require('./selectors');

async function login(page, username, password) {
  await page.locator(selectors.login.userName).clear();
  await page.locator(selectors.login.userName).fill(username);
  await page.locator(selectors.login.password).clear();
  await page.locator(selectors.login.password).fill(password);
  await page.locator(selectors.login.button).click();
}

async function openAddForm(page) {
  await page.locator(selectors.common.addButton).click({ force: true });
}

async function submitForm(page) {
  await page.locator(selectors.common.saveButton).click({ force: true });
}

async function cancelForm(page) {
  await page.locator(selectors.common.cancelButton).click();
}

async function ensureCardView(page) {
  const ariaChecked = await page.locator(selectors.common.cardViewButton).getAttribute('aria-checked');
  if (ariaChecked === 'false') {
    await page.locator(selectors.common.cardViewButton).click();
  }
}

async function trimText(page, selector) {
  const text = await page.locator(selector).textContent();
  return text ? text.trim() : '';
}

module.exports = { login, openAddForm, submitForm, cancelForm, ensureCardView, trimText };
