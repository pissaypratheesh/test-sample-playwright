const { test, expect } = require('@playwright/test');
const E2EFlowUtils = require('../pages/utils/e2e/E2EFlowUtils');
const testdata = require('../testdata/policy/renewTatadata.json');
const creds = require('../testdata/auth/Auth.json');

test.describe('Step-by-Step Debug E2E Flow', () => {
  test('Debug each step with detailed logging', async ({ page }) => {
    const e2eFlow = new E2EFlowUtils(page);
    
    console.log('🚀 Starting Step-by-Step Debug E2E Flow...');
    
    try {
      // ===== STEP 1: LOGIN AND NAVIGATION =====
      console.log('📋 STEP 1: Login and Navigation');
      await e2eFlow.loginAndNavigate(creds, 'renewal');
      await page.screenshot({ path: '.playwright-mcp/step1-login-complete.png', fullPage: true });
      console.log('✅ STEP 1 COMPLETE: Login and Navigation');

      // ===== STEP 2: FILL POLICY DETAILS =====
      console.log('📋 STEP 2: Filling Policy Details');
      
      // Wait for form to be ready
      await page.waitForSelector('#mui-component-select-FKOEM_ID', { timeout: 30000 });
      console.log('✅ OEM dropdown found');
      
      // Take screenshot before OEM selection
      await page.screenshot({ path: '.playwright-mcp/step2-before-oem-selection.png', fullPage: true });
      
      // Select OEM
      await e2eFlow.selectDropdownOption(
        page.locator('#mui-component-select-FKOEM_ID'),
        testdata.oem
      );
      console.log('✅ OEM selected:', testdata.oem);
      
      // Wait for page refresh after OEM selection
      console.log('⏳ Waiting for page refresh after OEM selection...');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Take screenshot after OEM selection
      await page.screenshot({ path: '.playwright-mcp/step2-after-oem-selection.png', fullPage: true });
      
      // Check if Vehicle Cover dropdown is available
      const vehicleCoverDropdown = page.locator('#mui-component-select-CoverTypeId');
      const vehicleCoverVisible = await vehicleCoverDropdown.isVisible().catch(() => false);
      console.log('Vehicle Cover dropdown visible:', vehicleCoverVisible);
      
      if (vehicleCoverVisible) {
        // Take screenshot before vehicle cover selection
        await page.screenshot({ path: '.playwright-mcp/step2-before-vehicle-cover.png', fullPage: true });
        
        // Select Vehicle Cover
        await e2eFlow.selectDropdownOption(
          page.locator('#mui-component-select-CoverTypeId'),
          testdata.vehicleCover
        );
        console.log('✅ Vehicle Cover selected:', testdata.vehicleCover);
        
        // Wait for page to process after vehicle cover selection
        await page.waitForTimeout(2000);
        
        // Take screenshot after vehicle cover selection
        await page.screenshot({ path: '.playwright-mcp/step2-after-vehicle-cover.png', fullPage: true });
      } else {
        console.log('❌ Vehicle Cover dropdown not visible');
      }
      
      console.log('✅ STEP 2 COMPLETE: Policy Details Filled');

      // ===== STEP 3: FILL CUSTOMER DETAILS =====
      console.log('📋 STEP 3: Filling Customer Details');
      
      // Check what input fields are available
      const chassisInput = page.locator('input[name="ChassisNo"]');
      const engineInput = page.locator('input[name="EngineNo"]');
      
      const chassisVisible = await chassisInput.isVisible().catch(() => false);
      const engineVisible = await engineInput.isVisible().catch(() => false);
      
      console.log('ChassisNo input visible:', chassisVisible);
      console.log('EngineNo input visible:', engineVisible);
      
      if (chassisVisible && engineVisible) {
        // Take screenshot before filling customer details
        await page.screenshot({ path: '.playwright-mcp/step3-before-customer-details.png', fullPage: true });
        
        // Fill chassis number
        await e2eFlow.safeFill(chassisInput, testdata.chassisNo);
        console.log('✅ Chassis number filled:', testdata.chassisNo);
        
        // Fill engine number
        await e2eFlow.safeFill(engineInput, testdata.engineNo);
        console.log('✅ Engine number filled:', testdata.engineNo);
        
        // Wait for form to process
        await page.waitForTimeout(2000);
        
        // Take screenshot after filling customer details
        await page.screenshot({ path: '.playwright-mcp/step3-after-customer-details.png', fullPage: true });
      } else {
        console.log('❌ Customer detail inputs not visible');
      }
      
      console.log('✅ STEP 3 COMPLETE: Customer Details Filled');

      // ===== STEP 4: FILL VEHICLE DETAILS =====
      console.log('📋 STEP 4: Filling Vehicle Details');
      
      // Check what vehicle detail fields are available
      const makeInput = page.locator('input[name="Make"]');
      const modelInput = page.locator('input[name="Model"]');
      const variantInput = page.locator('input[name="Variant"]');
      
      const makeVisible = await makeInput.isVisible().catch(() => false);
      const modelVisible = await modelInput.isVisible().catch(() => false);
      const variantVisible = await variantInput.isVisible().catch(() => false);
      
      console.log('Make input visible:', makeVisible);
      console.log('Model input visible:', modelVisible);
      console.log('Variant input visible:', variantVisible);
      
      if (makeVisible && modelVisible && variantVisible) {
        // Take screenshot before filling vehicle details
        await page.screenshot({ path: '.playwright-mcp/step4-before-vehicle-details.png', fullPage: true });
        
        // Fill vehicle make
        await e2eFlow.safeFill(makeInput, testdata.make);
        console.log('✅ Make filled:', testdata.make);
        
        // Fill vehicle model
        await e2eFlow.safeFill(modelInput, testdata.model);
        console.log('✅ Model filled:', testdata.model);
        
        // Fill vehicle variant
        await e2eFlow.safeFill(variantInput, testdata.variant);
        console.log('✅ Variant filled:', testdata.variant);
        
        // Wait for vehicle fetch to complete
        await page.waitForTimeout(3000);
        
        // Take screenshot after filling vehicle details
        await page.screenshot({ path: '.playwright-mcp/step4-after-vehicle-details.png', fullPage: true });
      } else {
        console.log('❌ Vehicle detail inputs not visible');
      }
      
      console.log('✅ STEP 4 COMPLETE: Vehicle Details Filled');

      // ===== STEP 5: GET QUOTES =====
      console.log('📋 STEP 5: Getting Quotes');
      
      // Check if Get Quotes button is available
      const getQuotesButton = page.locator('button:has-text("Get Quotes")');
      const quotesButtonVisible = await getQuotesButton.isVisible().catch(() => false);
      
      console.log('Get Quotes button visible:', quotesButtonVisible);
      
      if (quotesButtonVisible) {
        // Take screenshot before clicking Get Quotes
        await page.screenshot({ path: '.playwright-mcp/step5-before-get-quotes.png', fullPage: true });
        
        // Click Get Quotes button
        await e2eFlow.clickButton('Get Quotes');
        console.log('✅ Get Quotes button clicked');
        
        // Wait longer for quotes to load
        await page.waitForTimeout(5000);
        
        // Take screenshot after clicking Get Quotes
        await page.screenshot({ path: '.playwright-mcp/step5-after-get-quotes.png', fullPage: true });
      } else {
        console.log('❌ Get Quotes button not visible');
      }
      
      console.log('✅ STEP 5 COMPLETE: Quotes Generated');

      // ===== STEP 6: CHECK FOR BUY NOW BUTTON =====
      console.log('📋 STEP 6: Checking for BUY NOW Button');
      
      // Check all possible BUY NOW button selectors
      const buyNowSelectors = [
        'button:has-text("BUY NOW")',
        'a:has-text("BUY NOW")',
        '.quotation-buynow-btn',
        '[data-testid="buy-now"]',
        'button:has-text("Buy Now")',
        'button:has-text("Buy")',
        'a:has-text("Buy Now")',
        'a:has-text("Buy")'
      ];
      
      let buyNowFound = false;
      for (const selector of buyNowSelectors) {
        const element = page.locator(selector);
        const visible = await element.isVisible().catch(() => false);
        console.log(`BUY NOW selector "${selector}" visible:`, visible);
        if (visible) {
          buyNowFound = true;
          break;
        }
      }
      
      // Check all buttons on the page
      const allButtons = await page.locator('button').count();
      console.log('Total buttons found:', allButtons);
      
      // List first 10 buttons
      for (let i = 0; i < Math.min(allButtons, 10); i++) {
        const button = page.locator('button').nth(i);
        const text = await button.textContent().catch(() => 'no-text');
        const visible = await button.isVisible().catch(() => false);
        console.log(`Button ${i}: "${text}", visible: ${visible}`);
      }
      
      // Check all links on the page
      const allLinks = await page.locator('a').count();
      console.log('Total links found:', allLinks);
      
      // List first 10 links
      for (let i = 0; i < Math.min(allLinks, 10); i++) {
        const link = page.locator('a').nth(i);
        const text = await link.textContent().catch(() => 'no-text');
        const visible = await link.isVisible().catch(() => false);
        console.log(`Link ${i}: "${text}", visible: ${visible}`);
      }
      
      console.log('✅ STEP 6 COMPLETE: BUY NOW Button Analysis');

      console.log('🎉 STEP-BY-STEP DEBUG COMPLETED SUCCESSFULLY!');
      
    } catch (error) {
      console.error('❌ Error in step-by-step debug:', error.message);
      await page.screenshot({ path: '.playwright-mcp/debug-error.png', fullPage: true });
      throw error;
    }
  });
});
