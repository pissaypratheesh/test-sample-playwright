const RenewalFormSystem = require('../pages/renewal/RenewalFormSystem');
const testdata = require('../testdata/newPolicyIndividual.json');
const creds = require('../testdata/Auth.json');
const { test } = require('@playwright/test');
const proposalDetailsData = require('../testdata/proposalDetails.json');

test('New Policy - Individual Proposer E2E', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  console.log('🚀 Starting New Policy - Individual Proposer Flow');
  
  // NOTE: This test currently uses the RenewalFormSystem which is designed for renewal flows.
  // To implement proper "New Policy" flow, you would need to:
  // 1. Create a new PolicyFormSystem that handles both new and renewal policies
  // 2. Modify LoginNavigationHandler to support navigation to "New Policy" instead of "Renew"
  // 3. Create separate page classes for new policy flows
  // For now, this reuses the renewal infrastructure as they share similar forms
  
  // Set a longer timeout for this test
  test.setTimeout(600000); // 10 minutes
  
  // Get proposal details data and modify it for this test
  const modifiedProposalDetails = {
    ...proposalDetailsData
  };
  
  // Execute new policy form with custom Ford data
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
    creds,
    'new' // Flow type: 'new' for new policy
  );
  
  console.log('✅ New Policy - Individual Proposer Flow completed successfully');
});

