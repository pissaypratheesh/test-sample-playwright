const RenewalFormSystem = require('../pages/renewal/RenewalFormSystem');
const testdata = require('../testdata/renewTatadata.json');
const creds = require('../testdata/Auth.json');
const { test } = require('@playwright/test');

test('Renew Ford E2E (modular structure, data-driven)', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  // Execute renewal form with custom Ford data
  await renewalFormSystem.executeWithCustomData(
    testdata, // Policy Vehicle data
    { 
      ncbLevel: testdata.ncbLevel,
      voluntaryExcess: testdata.voluntaryExcess,
      aaiMembership: false,
      handicappedDiscount: false,
      antiTheftDiscount: false
    }, // Additional Details data
    require('../testdata/proposalDetails.json'), // Proposal Details data
    creds
  );
});
