// playwright.config.js
const testTimeoutMs = parseInt(process.env.PLAYWRIGHT_TEST_TIMEOUT_MS || '180000', 10);
const navTimeoutMs = parseInt(process.env.PLAYWRIGHT_NAVIGATION_TIMEOUT_MS || '180000', 10);
const actionTimeoutMs = parseInt(process.env.PLAYWRIGHT_ACTION_TIMEOUT_MS || '90000', 10);

module.exports = {
  testDir: './tests',
  timeout: testTimeoutMs,
  retries: 0,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      slowMo: 300
    },
    navigationTimeout: navTimeoutMs,
    actionTimeout: actionTimeoutMs,
    screenshot: 'only-on-failure'
  },
  reporter: [['list'], ['allure-playwright']],
};
