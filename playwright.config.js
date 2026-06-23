// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'always', host: 'localhost', port: 3939 }],
    ['list'],
  ],

  use: {
    baseURL: 'http://admin.learnyourcare.com',
    //baseURL: 'http://localhost:4200',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],
});
