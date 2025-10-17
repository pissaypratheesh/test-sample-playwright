const RenewPolicyPage = require('../pages/renewPolicy');
const testdata = require('../testdata/renewTatadata.json');
const creds = require('../testdata/Auth.json');
const { test } = require('@playwright/test');

test('Renew Tata E2E (recorded_flow locators, data-driven)', async ({ page }) => {
  const renewPolicyPage = new RenewPolicyPage(page);
  await renewPolicyPage.runFlow(testdata, creds);
});