const { test } = require('@playwright/test');
const { AuthPage } = require('../pages/AuthPage');
const testdata = require('../testdata/auth/Auth.json');

test('Login with valid credentials', async ({ page }) => {
  const loginPage = new AuthPage(page);
  await loginPage.gotoLoginPage();
  await loginPage.loginToApp(testdata.username, testdata.password);
});