async function routeOk(page, method, urlPattern) {
  await page.route(urlPattern, (route) => {
    if (route.request().method() === method) {
      route.fulfill({ status: 200, body: JSON.stringify({ message: 'Success', data: [] }) });
    } else {
      route.continue();
    }
  });
}

async function routeBadRequest(page, method, urlPattern) {
  await page.route(urlPattern, (route) => {
    if (route.request().method() === method) {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Bad Request', details: ['Invalid input provided'] })
      });
    } else {
      route.continue();
    }
  });
}

async function routeUnauthorized(page, method, urlPattern) {
  await page.route(urlPattern, (route) => {
    if (route.request().method() === method) {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized', details: ['Authentication required'] })
      });
    } else {
      route.continue();
    }
  });
}

async function routeForbidden(page, method, urlPattern) {
  await page.route(urlPattern, (route) => {
    if (route.request().method() === method) {
      route.fulfill({
        status: 403,
        body: JSON.stringify({ error: 'Forbidden', details: ['Access denied'] })
      });
    } else {
      route.continue();
    }
  });
}

async function routeNotFound(page, method, urlPattern) {
  await page.route(urlPattern, (route) => {
    if (route.request().method() === method) {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Not Found', details: ['Resource does not exist'] })
      });
    } else {
      route.continue();
    }
  });
}

async function routeServerError(page, method, urlPattern) {
  await page.route(urlPattern, (route) => {
    if (route.request().method() === method) {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error', details: ['Unexpected failure occurred'] })
      });
    } else {
      route.continue();
    }
  });
}

module.exports = { routeOk, routeBadRequest, routeUnauthorized, routeForbidden, routeNotFound, routeServerError };
