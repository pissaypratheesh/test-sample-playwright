const RenewalFormSystem = require('../pages/renewal/RenewalFormSystem');
const testdata = require('../testdata/renewTatadata.json');
const creds = require('../testdata/Auth.json');
const { test } = require('@playwright/test');
const proposalDetailsData = require('../testdata/proposalDetails.json');
 
test('Renew Ford E2E (modular structure, data-driven)', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  // Get proposal details data and modify it for this test
  
  // Modify proposal details as needed for this test
  const modifiedProposalDetails = {
    ...proposalDetailsData
  };
  
  // Execute renewal form with custom Ford data
  await renewalFormSystem.executeWithCustomData(
    testdata, // Policy Vehicle data
    { 
      ncbLevel: testdata.ncbLevel,
      voluntaryExcess: testdata.voluntaryExcess,
      aaiMembership: true,
      handicappedDiscount: false,
      antiTheftDiscount: false,
      ncbCarryForward: true, // Toggle NCB Carry Forward ON
      enableNCBCarryForward: true // Enable NCB Carry Forward
    }, // Additional Details data
    modifiedProposalDetails, // Modified Proposal Details data if needed
    creds
  );
});
