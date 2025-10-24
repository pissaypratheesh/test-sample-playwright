const { test, expect } = require('@playwright/test');
const E2EFlowUtils = require('../pages/utils/e2e/E2EFlowUtils');
const testdata = require('../testdata/policy/renewTatadata.json');
const creds = require('../testdata/auth/Auth.json');
const proposalDetails = require('../testdata/proposal/proposalDetails.json');

test.describe('Complete E2E Policy Flow', () => {
  test('Complete End-to-End Policy Renewal Flow', async ({ page }) => {
    const e2eFlow = new E2EFlowUtils(page);
    
    console.log('🚀 Starting Complete E2E Policy Renewal Flow...');
    
    try {
      // ===== STEP 1: LOGIN AND NAVIGATION =====
      await e2eFlow.loginAndNavigate(creds, 'renewal');

      // ===== STEP 2: FILL POLICY DETAILS =====
      await e2eFlow.fillPolicyDetails(testdata, 'renewal');

      // ===== STEP 3: FILL CUSTOMER DETAILS =====
      await e2eFlow.fillCustomerDetails(testdata);

      // ===== STEP 4: FILL VEHICLE DETAILS =====
      await e2eFlow.fillVehicleDetails(testdata);

      // ===== STEP 5: GET QUOTES =====
      await e2eFlow.getQuotes();

      // ===== STEP 6: CLICK BUY NOW =====
      const currentPage = await e2eFlow.clickBuyNow();

      // ===== STEP 7: FILL PROPOSAL DETAILS FORM =====
      await e2eFlow.fillProposalDetails(proposalDetails);

      // ===== STEP 8: CLICK PROPOSAL PREVIEW =====
      await e2eFlow.clickProposalPreview();

      // ===== FINAL VALIDATION =====
      const isSuccess = await e2eFlow.validateSuccess();

      console.log('🎉 COMPLETE E2E POLICY RENEWAL FLOW FINISHED SUCCESSFULLY!');
      
    } catch (error) {
      console.error('❌ Error in E2E flow:', error.message);
      await page.screenshot({ path: '.playwright-mcp/error-screenshot.png', fullPage: true });
      throw error;
    }
  });
});
