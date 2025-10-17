const { test, expect } = require('@playwright/test');
const RenewPage = require('../pages/renew');

test.describe('Policy Renewal Tests', () => {
  
  test('should login and navigate to renewal page', async ({ page }) => {
    const renewPage = new RenewPage(page);
    await renewPage.loginAndNavigate(page);
    await renewPage.openHamburgerMenu(page);
    await renewPage.navigateToRenewalViaMenu(page);
    await renewPage.toggleToRenew(page);
    await renewPage.toggleToNonTmibaslPolicy(page);
    await renewPage.fillRenewalForm(page);
    await page.pause();
  });


});