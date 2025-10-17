// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      slowMo: 300
    }
  },
  reporter: [['list'], ['allure-playwright']],
};
