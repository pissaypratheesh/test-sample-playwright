const NewCorporatePolicyPage = require('../pages/NewCorporatePolicy.page');
const testdata = require('../testdata/newCorporate.data.json');
const creds = require('../testdata/Auth.json');
const { test } = require('@playwright/test');

test('New Corporate Policy E2E Flow', async ({ page }) => {
  const newCorporatePolicyPage = new NewCorporatePolicyPage(page);
  await newCorporatePolicyPage.runFlow(testdata, creds);
});
