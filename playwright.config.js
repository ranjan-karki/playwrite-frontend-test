// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const ENV = process.env.ENV || 'local';
const envConfig = require('./playwright.env.json')[ENV];

const STORAGE_STATE = 'auth/storageState.json';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  timeout: 60000,

  use: {
    baseURL: envConfig.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.js/,
      testDir: './auth',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['auth-setup'],
    },
  ],
});
