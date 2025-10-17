const { test } = require('@playwright/test');
const authData = require('../testdata/Auth.json');
const { AuthPage } = require('../pages/AuthPage');
const { LogoutPage } = require('../pages/LogoutPage');

test('Logout Test', async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.gotoLoginPage();
  await authPage.loginToApp(authData.username, authData.password);

  const logoutFromApp = new LogoutPage(page);
  await logoutFromApp.logoutFromApp();
});