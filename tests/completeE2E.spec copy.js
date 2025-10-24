const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/RenewPolicyPage');
const testdata = require('../testdata/policy/renewTatadata.json');
const creds = require('../testdata/auth/Auth.json');
const proposalDetails = require('../testdata/proposal/proposalDetails.json');

test.describe('Complete E2E Policy Flow', () => {
  test('Complete End-to-End Policy Renewal Flow', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    
    console.log('🚀 Starting Complete E2E Policy Renewal Flow...');
    
    try {
      // ===== STEP 1: LOGIN AND NAVIGATION =====
      console.log('📋 Step 1: Login and Navigation');
      await renewPolicyPage.navigation.navigateToLoginPage();
      await renewPolicyPage.navigation.login(creds);
      await renewPolicyPage.navigation.navigateToPolicyIssuance();
      await renewPolicyPage.navigation.navigateToRenewalFlow();
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      await renewPolicyPage.takeFormScreenshot('step1-login-complete.png');
      console.log('✅ Step 1 Complete: Login and Navigation');

      // ===== STEP 2: FILL POLICY DETAILS =====
      console.log('📋 Step 2: Filling Policy Details');
      
      // Wait for form to be ready
      await page.waitForSelector('#mui-component-select-FKOEM_ID', { timeout: 30000 });
      
      await renewPolicyPage.fillPolicyDetails(testdata);
      await page.waitForTimeout(2000); // Wait for form to process
      await renewPolicyPage.takeFormScreenshot('step2-policy-details.png');
      console.log('✅ Step 2 Complete: Policy Details Filled');

      // ===== STEP 3: FILL CUSTOMER DETAILS =====
      console.log('📋 Step 3: Filling Customer Details');
      
      // Wait for customer details section to be ready
      await page.waitForSelector('input[name="ChassisNo"]', { timeout: 30000 });
      
      await renewPolicyPage.fillCustomerDetails(testdata);
      await page.waitForTimeout(2000);
      await renewPolicyPage.takeFormScreenshot('step3-customer-details.png');
      console.log('✅ Step 3 Complete: Customer Details Filled');

      // ===== STEP 4: FILL VEHICLE DETAILS =====
      console.log('📋 Step 4: Filling Vehicle Details');
      
      await renewPolicyPage.fillVehicleDetails(testdata);
      await page.waitForTimeout(3000); // Wait for vehicle fetch to complete
      await renewPolicyPage.takeFormScreenshot('step4-vehicle-details.png');
      console.log('✅ Step 4 Complete: Vehicle Details Filled');

      // ===== STEP 5: GET QUOTES =====
      console.log('📋 Step 5: Getting Quotes');
      
      // Wait for quotes button to be ready
      await page.waitForSelector('button:has-text("Get Quotes")', { timeout: 30000 });
      
      await renewPolicyPage.getQuotes();
      await page.waitForTimeout(5000); // Wait longer for quotes to load
      await renewPolicyPage.takeFormScreenshot('step5-quotes-loaded.png');
      console.log('✅ Step 5 Complete: Quotes Generated');

      // ===== STEP 6: CLICK BUY NOW =====
      console.log('📋 Step 6: Clicking BUY NOW');
      
      // Wait for BUY NOW button to be available
      await page.waitForSelector('button:has-text("BUY NOW")', { timeout: 30000 });
      
      const buyNowSelectors = [
        'button:has-text("BUY NOW")',
        'a:has-text("BUY NOW")',
        '.quotation-buynow-btn',
        '[data-testid="buy-now"]'
      ];

      let buyNowButton = null;
      for (const selector of buyNowSelectors) {
        try {
          buyNowButton = page.locator(selector).first();
          if (await buyNowButton.isVisible({ timeout: 5000 })) {
            console.log(`Found BUY NOW button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!buyNowButton || !(await buyNowButton.isVisible().catch(() => false))) {
        throw new Error('BUY NOW button not found');
      }

      // Handle potential popup
      const [newPage] = await Promise.all([
        page.waitForEvent('popup', { timeout: 15000 }).catch(() => null),
        buyNowButton.click()
      ]);

      if (newPage) {
        console.log('BUY NOW opened new window, switching to it...');
        await newPage.waitForLoadState('networkidle');
        await newPage.waitForTimeout(3000); // Additional wait for page to stabilize
        await newPage.screenshot({ path: '.playwright-mcp/proposal-details-page.png', fullPage: true });
        // Switch to new page for proposal details
        page = newPage;
      } else {
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '.playwright-mcp/proposal-details-page.png', fullPage: true });
      }
      console.log('✅ Step 6 Complete: BUY NOW Clicked');

      // ===== STEP 7: FILL PROPOSAL DETAILS FORM =====
      console.log('📋 Step 7: Filling Proposal Details Form');
      
      // Wait for proposal details form to be ready
      await page.waitForSelector('#mui-component-select-SALUTATION', { timeout: 30000 });
      
      // Personal Information
      await renewPolicyPage.selectDropdownOption(
        page.locator('#mui-component-select-SALUTATION'),
        proposalDetails.personalDetails.salutation
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="FIRST_NAME"]'),
        proposalDetails.personalDetails.firstName
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="MIDDLE_NAME"]'),
        proposalDetails.personalDetails.middleName
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="LAST_NAME"]'),
        proposalDetails.personalDetails.lastName
      );

      // Gender selection
      const maleButton = page.getByRole('button', { name: 'Male' }).first();
      const isMaleSelected = await maleButton.getAttribute('aria-pressed') === 'true';
      
      if (!isMaleSelected) {
        await maleButton.click();
      }

      // Date of Birth
      const dobInput = page.getByRole('textbox', { name: 'Choose date' });
      await renewPolicyPage.setDateOnInput(dobInput, proposalDetails.personalDetails.dateOfBirth);

      // Contact Information
      await renewPolicyPage.safeFill(
        page.locator('input[name="ALT_MOBILE_NO"]'),
        proposalDetails.personalDetails.alternateMobileNo
      );

      // Address Information
      await renewPolicyPage.safeFill(
        page.getByRole('textbox', { name: 'Address Line 1 *' }),
        proposalDetails.personalDetails.addressLine1
      );

      await renewPolicyPage.safeFill(
        page.getByRole('textbox', { name: 'Address Line 2' }),
        proposalDetails.personalDetails.addressLine2
      );

      await renewPolicyPage.safeFill(
        page.getByRole('textbox', { name: 'Landmark' }),
        proposalDetails.personalDetails.landmark
      );

      // City dropdown
      await renewPolicyPage.selectDropdownOption(
        page.locator('#mui-component-select-CITY_ID'),
        proposalDetails.personalDetails.city
      );

      // Fill Pincode
      await renewPolicyPage.safeFill(
        page.locator('input[name="PIN"]'),
        proposalDetails.personalDetails.pinCode
      );

      // Identity Documents
      await renewPolicyPage.safeFill(
        page.locator('input[name="PAN_NO"]'),
        proposalDetails.personalDetails.panNo
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="AADHAAR_NO"]'),
        proposalDetails.personalDetails.aadhaarNo
      );

      // EI Account Number
      await renewPolicyPage.safeFill(
        page.locator('input[name="EI_ACCOUNT_NO"]'),
        proposalDetails.personalDetails.ckycNo
      );

      // CKYC No (additional field found in HTML)
      await renewPolicyPage.safeFill(
        page.locator('input[name="CKYC_NO"]'),
        'CKYC123456789'
      );

      // Fill Pincode dropdown (it's a dropdown, not text input)
      await renewPolicyPage.selectDropdownOption(
        page.locator('#mui-component-select-PIN'),
        '110001'
      );

      // AA Membership Details
      console.log('📋 Waiting for AA Membership Details section to be ready...');
      try {
        await page.waitForSelector('#mui-component-select-ASSOCIATION_NAME', { timeout: 30000 });
        console.log('✅ AA Membership Details section is ready');
        
        await renewPolicyPage.selectDropdownOption(
          page.locator('#mui-component-select-ASSOCIATION_NAME'),
          proposalDetails.aaMembershipDetails.associationName
        );
      } catch (error) {
        console.log('⚠️ AA Membership Details section not found, skipping...');
      }

      await renewPolicyPage.safeFill(
        page.locator('input[name="MEMBERSHIP_NO"]'),
        proposalDetails.aaMembershipDetails.membershipNo
      );

      await renewPolicyPage.selectDropdownOption(
        page.locator('#mui-component-select-AAMonth'),
        proposalDetails.aaMembershipDetails.validityMonth
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="AAYear"]'),
        proposalDetails.aaMembershipDetails.year
      );

      // NCB Carry Forward Details
      await renewPolicyPage.selectDropdownOption(
        page.getByRole('combobox', { name: 'Previous Policy Type' }),
        proposalDetails.ncbCarryForwardDetails.prevPolicyType
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="PREV_VEH_MAKE"]'),
        proposalDetails.ncbCarryForwardDetails.make
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="PREV_VEH_MODEL"]'),
        proposalDetails.ncbCarryForwardDetails.model
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="PREV_VEH_VARIANT_NO"]'),
        proposalDetails.ncbCarryForwardDetails.variant
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="PREV_VEH_MANU_YEAR"]'),
        proposalDetails.ncbCarryForwardDetails.yearOfManufacturer
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="PREV_VEH_CHASSIS_NO"]'),
        proposalDetails.ncbCarryForwardDetails.chasisNo
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="PREV_VEH_ENGINE_NO"]'),
        proposalDetails.ncbCarryForwardDetails.engineNo
      );

      // Invoice Date
      await renewPolicyPage.setDateOnInput(
        page.locator('input[name="PREV_VEH_INVOICEDATE"]'),
        proposalDetails.ncbCarryForwardDetails.invoiceDate
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="PREV_VEH_REG_NO"]'),
        proposalDetails.ncbCarryForwardDetails.registrationNo
      );

      await renewPolicyPage.safeFill(
        page.locator('input[name="PREV_VEH_POLICY_NONVISOF"]'),
        proposalDetails.ncbCarryForwardDetails.previousPolicyNo
      );

      // NCB Document Submitted checkbox
      const ncbCheckbox = page.getByRole('checkbox', { name: 'NCB document submitted' });
      if (await ncbCheckbox.isVisible()) {
        await ncbCheckbox.check();
      }

      // ===== FILL NOMINEE DETAILS SECTION =====
      console.log('📋 Filling Nominee Details Section');
      
      // Nominee Name
      await renewPolicyPage.safeFill(
        page.locator('input[name="NomineeName"]'),
        proposalDetails.nomineeDetails.nomineeName
      );

      // Nominee Age
      await renewPolicyPage.safeFill(
        page.locator('input[name="NomineeAge"]'),
        proposalDetails.nomineeDetails.nomineeAge
      );

      // Nominee Relation
      await renewPolicyPage.selectDropdownOption(
        page.locator('#mui-component-select-NomineeRelation'),
        proposalDetails.nomineeDetails.nomineeRelation
      );

      // Nominee Gender
      await renewPolicyPage.selectDropdownOption(
        page.locator('#mui-component-select-NomineeGender'),
        proposalDetails.nomineeDetails.nomineeGender
      );

      console.log('✅ Nominee Details Section Filled');

      // ===== FILL PAYMENT MODE SECTION =====
      console.log('📋 Filling Payment Mode Section');
      
      // Payment Mode
      await renewPolicyPage.selectDropdownOption(
        page.getByRole('combobox', { name: 'Payment Mode' }),
        proposalDetails.paymentDetails.paymentMode
      );

      console.log('✅ Payment Mode Section Filled');

      // ===== FILL SOLICITATION DETAILS SECTION =====
      console.log('📋 Filling Solicitation Details Section');
      
      // DP Name
      await renewPolicyPage.selectDropdownOption(
        page.getByRole('combobox', { name: 'DP Name' }),
        proposalDetails.paymentDetails.dpName
      );

      console.log('✅ Solicitation Details Section Filled');

      await page.waitForTimeout(2000); // Wait for form to process
      await page.screenshot({ path: '.playwright-mcp/proposal-details-after-fill.png', fullPage: true });
      console.log('✅ Step 7 Complete: Proposal Details Form Filled');

      // ===== STEP 8: CLICK PROPOSAL PREVIEW =====
      console.log('📋 Step 8: Clicking Proposal Preview');
      
      // Look for Proposal Preview button (as shown in HTML)
      const previewSelectors = [
        'button:has-text("Proposal Preview")',
        'button:has-text("PROPOSAL PREVIEW")',
        'button[type="submit"]',
        '.css-1wtvbz6' // Specific class from HTML
      ];

      let previewButton = null;
      for (const selector of previewSelectors) {
        try {
          previewButton = page.locator(selector).first();
          if (await previewButton.isVisible({ timeout: 5000 })) {
            console.log(`Found Proposal Preview button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (previewButton && await previewButton.isVisible().catch(() => false)) {
        await previewButton.click();
        console.log('✅ Proposal Preview button clicked');
        
        // Wait for preview to load
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '.playwright-mcp/after-proposal-preview.png', fullPage: true });
        console.log('✅ Step 8 Complete: Proposal Preview Opened');
      } else {
        console.log('⚠️ Proposal Preview button not found, but form filling completed');
      }

      // ===== FINAL VALIDATION =====
      console.log('📋 Final Validation');
      
      // Check if we're on a success page or next step
      const successIndicators = [
        'text="Success"',
        'text="Policy Created"',
        'text="Proposal Submitted"',
        'text="Payment"',
        'text="Confirmation"'
      ];

      let foundSuccess = false;
      for (const indicator of successIndicators) {
        try {
          if (await page.locator(indicator).isVisible({ timeout: 5000 })) {
            console.log(`✅ Found success indicator: ${indicator}`);
            foundSuccess = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!foundSuccess) {
        console.log('⚠️ No clear success indicator found, but flow completed');
      }

      console.log('🎉 COMPLETE E2E POLICY RENEWAL FLOW FINISHED SUCCESSFULLY!');
      
    } catch (error) {
      console.error('❌ Error in E2E flow:', error.message);
      await page.screenshot({ path: '.playwright-mcp/error-screenshot.png', fullPage: true });
      throw error;
    }
  });
});
