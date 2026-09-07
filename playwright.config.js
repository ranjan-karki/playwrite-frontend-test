// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry once on CI. Note: the login fixture is worker-scoped, so a retry
     restarts the worker and logs in again — keep this low so a broken run (e.g.
     a wrong TEST_SITE_NAME) can't multiply the login timeout across every test. */
  retries: process.env.CI ? 1 : 2,
  /* Run tests sequentially in a single browser instance instead of many parallel
     windows. The specs share one site (e2e-main) and create/delete instances on
     it, so parallel workers would race on data — keep this at 1 unless the specs
     are isolated per worker (e.g. a site per worker). */
  workers: 1,
  /* Fail fast: a genuinely-working action here is well under a few seconds
     against a local stack, so bound the per-test time and per-assertion wait so a
     hung page surfaces quickly instead of burning the default 30s. */
  timeout: 20_000,
  expect: { timeout: 7_000 },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters
     allure-playwright writes ./allure-results, which the CI pipeline uploads to
     the shared Blob (results/frontend-e2e/current) for the combined dashboard.
     Every test is force-grouped under the "Frontend E2E" parent suite so it sits
     next to "Backend Unit" and "Backend E2E" — suiteTitle:false drops the
     path-derived suite labels, globalLabels sets the single parentSuite. */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['allure-playwright', {
      resultsDir: 'allure-results',
      // Drop the path-derived suite labels; the single "Frontend E2E" parentSuite
      // is set at runtime in fixtures/auth.fixture.js (every spec imports it).
      suiteTitle: false,
      environmentInfo: { framework: 'playwright', suite: 'Frontend E2E' },
    }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. Overridable via
       BASE_URL so CI can point at the Dockerized frontend / a staging URL. */
    baseURL: process.env.BASE_URL || 'http://localhost:4200',
    /* Bound individual actions/navigations so a stuck click/goto fails fast
       rather than hanging to the test timeout. */
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    /* Video off on CI — continuous recording adds per-test overhead; the trace
       (below) carries the network + DOM for failures. Full video locally. */
    video: process.env.CI ? 'off' : 'on',

    /* Trace on failure retry — carries network log + snapshots for diagnosis. */
    trace: 'on-first-retry',

    /* Capture a screenshot when a test fails, attached to the HTML report. */
    screenshot: 'only-on-failure',
  },
  

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /* Use the real (maximized) window size instead of a fixed viewport. */
        viewport: null,
        deviceScaleFactor: undefined,
        launchOptions: { args: ['--start-maximized'] },
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },

  
});
