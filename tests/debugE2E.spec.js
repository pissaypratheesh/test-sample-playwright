const { test, expect } = require('@playwright/test');
const E2EFlowUtils = require('../pages/utils/e2e/E2EFlowUtils');
const testdata = require('../testdata/policy/renewTatadata.json');
const creds = require('../testdata/auth/Auth.json');

test.describe('Debug E2E Flow', () => {
  test('Debug - Check page structure after login', async ({ page }) => {
    const e2eFlow = new E2EFlowUtils(page);
    
    console.log('🚀 Starting Debug E2E Flow...');
    
    try {
      // Step 1: Login and Navigation
      await e2eFlow.loginAndNavigate(creds, 'renewal');
      
      // Take screenshot of current state
      await page.screenshot({ path: '.playwright-mcp/debug-after-login.png', fullPage: true });
      
      // Wait a bit more for page to fully load
      await page.waitForTimeout(5000);
      
      // Check what elements are actually present
      console.log('🔍 Checking page elements...');
      
      // Check for OEM dropdown
      const oemDropdown = page.locator('#mui-component-select-FKOEM_ID');
      const oemVisible = await oemDropdown.isVisible().catch(() => false);
      console.log('OEM Dropdown visible:', oemVisible);
      
      // Check for Vehicle Cover dropdown
      const vehicleCoverDropdown = page.locator('#mui-component-select-CoverTypeId');
      const vehicleCoverVisible = await vehicleCoverDropdown.isVisible().catch(() => false);
      console.log('Vehicle Cover Dropdown visible:', vehicleCoverVisible);
      
      // Check for any dropdowns on the page
      const allDropdowns = await page.locator('[id*="mui-component-select"]').count();
      console.log('Total MUI dropdowns found:', allDropdowns);
      
      // List all dropdown IDs
      for (let i = 0; i < allDropdowns; i++) {
        const dropdown = page.locator('[id*="mui-component-select"]').nth(i);
        const id = await dropdown.getAttribute('id').catch(() => 'no-id');
        const visible = await dropdown.isVisible().catch(() => false);
        console.log(`Dropdown ${i}: ${id}, visible: ${visible}`);
      }
      
      // Now try to fill policy details to get to customer details step
      console.log('🔧 Attempting to fill policy details...');
      await e2eFlow.fillPolicyDetails(testdata, 'renewal');
      
      // Wait for page to process
      await page.waitForTimeout(3000);
      
      // Check for customer detail input fields
      console.log('🔍 Checking customer detail fields...');
      const allInputs = await page.locator('input').count();
      console.log('Total input fields found:', allInputs);
      
      // List all input fields with their names
      for (let i = 0; i < Math.min(allInputs, 20); i++) {
        const input = page.locator('input').nth(i);
        const name = await input.getAttribute('name').catch(() => 'no-name');
        const id = await input.getAttribute('id').catch(() => 'no-id');
        const visible = await input.isVisible().catch(() => false);
        console.log(`Input ${i}: name="${name}", id="${id}", visible: ${visible}`);
      }
      
      // Take another screenshot
      await page.screenshot({ path: '.playwright-mcp/debug-page-analysis.png', fullPage: true });
      
      console.log('✅ Debug completed');
      
    } catch (error) {
      console.error('❌ Error in debug flow:', error.message);
      await page.screenshot({ path: '.playwright-mcp/debug-error.png', fullPage: true });
      throw error;
    }
  });
});
