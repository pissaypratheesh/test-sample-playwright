const { test, expect } = require('@playwright/test');
const E2EFlowUtils = require('../pages/utils/e2e/E2EFlowUtils');
const testdata = require('../testdata/policy/renewTatadata.json');
const creds = require('../testdata/auth/Auth.json');

test.describe('Debug Vehicle Cover Issue', () => {
  test('Debug - Check what happens after vehicle cover selection', async ({ page }) => {
    const e2eFlow = new E2EFlowUtils(page);
    
    console.log('🚀 Starting Debug Vehicle Cover Test...');
    
    try {
      // Step 1: Login and Navigation
      await e2eFlow.loginAndNavigate(creds, 'renewal');
      
      // Step 2: Fill Policy Details
      console.log('🔧 Filling Policy Details...');
      await e2eFlow.fillPolicyDetails(testdata, 'renewal');
      
      // Take screenshot after policy details
      await page.screenshot({ path: '.playwright-mcp/debug-after-policy-details.png', fullPage: true });
      
      // Step 3: Try to fill customer details
      console.log('🔧 Attempting Customer Details...');
      await e2eFlow.fillCustomerDetails(testdata);
      
      // Take screenshot after customer details
      await page.screenshot({ path: '.playwright-mcp/debug-after-customer-details.png', fullPage: true });
      
      // Step 4: Try to fill vehicle details
      console.log('🔧 Attempting Vehicle Details...');
      await e2eFlow.fillVehicleDetails(testdata);
      
      // Take screenshot after vehicle details
      await page.screenshot({ path: '.playwright-mcp/debug-after-vehicle-details.png', fullPage: true });
      
      console.log('✅ Debug completed successfully');
      
    } catch (error) {
      console.error('❌ Error in debug flow:', error.message);
      await page.screenshot({ path: '.playwright-mcp/debug-error.png', fullPage: true });
      throw error;
    }
  });
});
