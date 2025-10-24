const { test, expect } = require('@playwright/test');
const { AuthPage } = require('../pages/AuthPage');
const { PolicyIssuancePageWithToggles } = require('../pages/PolicyIssuancepagewithtoggles');
const authData = require('../testdata/auth/Auth.json');
const testdata = require('../testdata/vehicle/withtoggle.json');

// 1. Login using AuthPage
// 2. Dashboard page should be open
// 3. Perform all steps using PolicyIssuancePageWithToggles

test('Policy Issuance with Toggles End-to-End', async ({ page }) => {
  // Login
  const loginPage = new AuthPage(page);
  await loginPage.gotoLoginPage();
  await loginPage.loginToApp(authData.username, authData.password);

  // Optionally, assert dashboard is open (customize selector as needed)
  // await expect(page.getByText('Dashboard')).toBeVisible();

  const policyPage = new PolicyIssuancePageWithToggles(page);
  await policyPage.openHamburgerMenu();
  await policyPage.goToPolicyIssuance();
  await policyPage.selectOEM(testdata.make);
  //await policyPage.toggleOfflineQuote();
  await policyPage.selectVehicleCover();
  await policyPage.selectSalutation();
  await policyPage.fillPersonalDetails(testdata);
  await policyPage.fillRandomVinAndEngineNo();
  await policyPage.selectMakeModelVariantYear(testdata);
  await policyPage.selectRegistrationAndResidence(testdata);
  await policyPage.setOptionalDiscounts();
  await policyPage.togglePaCoverPaidDriver('20000');
  await policyPage.togglePaCoverUnnamedPassenger();
  await policyPage.toggleLegalLiabilityPaidDriver();
  await policyPage.clickGetQuotes();
  await policyPage.pauseAfterQuotes();
  await policyPage.clickHdfcEgroBuyNow();

  // Fill additional details as per user request
  await policyPage.fillAdditionalDetails(testdata);

  // ...remaining steps...
});
