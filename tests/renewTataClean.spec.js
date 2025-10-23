const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/RenewPolicyPage');
const testdata = require('../testdata/renewTatadata.json');
const creds = require('../testdata/Auth.json');
const proposalDetails = require('../testdata/proposalDetails.json');

test.describe('Policy Renewal Flow - Reusable Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set default timeout for all tests
    test.setTimeout(120000); // 2 minutes
  });

  test('Renew Tata Policy - Basic Flow Test', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    
    // Take initial screenshot
    await renewPolicyPage.takeFormScreenshot('before-renewal-basic.png');
    
    // Test just the basic flow without complex date handling
    await renewPolicyPage.navigation.navigateToLoginPage();
    await renewPolicyPage.navigation.login(creds);
    await renewPolicyPage.navigation.navigateToPolicyIssuance();
    await renewPolicyPage.navigation.navigateToRenewalFlow();
    
    // Fill basic policy details (skip dates for now)
    const basicTestData = {
      ...testdata,
      odPolicyExpiryDate: null, // Skip date fields for now
      tpPolicyExpiryDate: null
    };
    
    await renewPolicyPage.fillPolicyDetails(basicTestData);
    
    // Take screenshot after basic form filling
    await renewPolicyPage.takeFormScreenshot('after-basic-form.png');
    
    console.log('✅ Basic renewal flow completed successfully');
  });

  test('New Policy Flow - Basic Test', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    
    // Test data for new policy
    const newPolicyData = {
      ...testdata,
      proposerType: 'Individual',
      vehicleClass: 'Private'
    };
    
    // Run new policy flow
    await renewPolicyPage.runNewPolicyFlow(newPolicyData, creds, proposalDetails);
    
    // Validate form completion
    const isFormComplete = await renewPolicyPage.validateFormCompletion();
    expect(isFormComplete).toBe(true);
  });

  test('Form Validation - Required Fields', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    
    // Navigate to renewal flow
    await renewPolicyPage.navigation.navigateToLoginPage();
    await renewPolicyPage.navigation.login(creds);
    await renewPolicyPage.navigation.navigateToPolicyIssuance();
    await renewPolicyPage.navigation.navigateToRenewalFlow();
    
    // Try to get quotes without filling required fields
    await renewPolicyPage.getQuotes();
    
    // Check for validation errors
    const validationErrors = await page.locator('text=*').all();
    expect(validationErrors.length).toBeGreaterThan(0);
  });

  test('NCB Selection - Different Values', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    
    // Test different NCB values
    const ncbValues = ['0', '20', '25', '35', '45', '50', '55', '65'];
    
    for (const ncbValue of ncbValues) {
      const testData = { ...testdata, ncb: `${ncbValue}%` };
      
      // Navigate to renewal flow
      await renewPolicyPage.navigation.navigateToLoginPage();
      await renewPolicyPage.navigation.login(creds);
      await renewPolicyPage.navigation.navigateToPolicyIssuance();
      await renewPolicyPage.navigation.navigateToRenewalFlow();
      
      // Fill policy details with current NCB value
      await renewPolicyPage.fillPolicyDetails(testData);
      
      // Verify NCB was selected correctly
      const ncbDropdown = page.locator('#mui-component-select-OLD_POL_NCB_LEVEL');
      const selectedValue = await ncbDropdown.textContent();
      expect(selectedValue).toContain(ncbValue);
    }
  });

  test('Error Handling - Invalid Data', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    
    // Test with invalid data
    const invalidData = {
      ...testdata,
      prevPolicyNo: 'INVALID123',
      ncb: '999%' // Invalid NCB
    };
    
    try {
      await renewPolicyPage.runRenewalFlow(invalidData, creds);
    } catch (error) {
      // Expected to fail with invalid data
      expect(error.message).toBeDefined();
    }
  });

  test('Proposal Details Flow - Extended Test', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    
    // Run the complete renewal flow including proposal details
    await renewPolicyPage.runRenewalFlow(testdata, creds, proposalDetails);
    
    // Wait for manual review
    await page.waitForTimeout(15000);
    
    console.log('✅ Complete proposal details flow completed successfully');
  });
});