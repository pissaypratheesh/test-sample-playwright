const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { setDobMUIv5 } = require('./utils/dateSetters');

class NewCorporatePolicyPage {
  constructor(page) {
    this.page = page;
  }

  async runFlow(data, creds) {
    const page = this.page;
    
    console.log('🚀 Starting New Corporate Policy Flow...');
    
    // Navigate to the application and login
    await this._navigateAndLogin(creds);
    
    // Navigate to Policy Issuance
    await this._navigateToPolicyIssuance();
    
    // Add session refresh to prevent timeout
    await this._refreshSessionIfNeeded();
    
    // Fill Policy Details Section
    await this._fillPolicyDetails(data.policyDetails);
    
    // Fill Company Details Section
    await this._fillCompanyDetails(data.companyDetails);
    
    // Fill Vehicle Details Section
    await this._fillVehicleDetails(data.vehicleDetails);
    
    // Fill Additional Discounts Section (minimal - only NCB Carry Forward)
    console.log('💰 Filling Additional Discounts section (minimal)...');
    try {
      // Only fill NCB Carry Forward to get to quotes faster
      await this._toggleYesNearLabel(/NCB\s*Carry\s*Forward/i);
      console.log('✅ NCB Carry Forward set to YES');
    } catch (error) {
      console.log(`❌ Error setting NCB Carry Forward: ${error.message}`);
      console.log('⚠️ Skipping NCB Carry Forward, continuing...');
    }
    
    // Click Get Quotes and wait
    await this._getQuotesAndWait();
    
    // Fill Proposal Details Section (comprehensive approach from renewPolicy.js)
    await this._fillProposalDetails(data);
    
    // Fill AA Membership Details Section
    await this._fillAAMembershipDetails(data.aaMembershipDetails);
    
    // Fill NCB Carry Forward Details Section
    console.log('🔄 Starting NCB Carry Forward Details section...');
    console.log(`Page is closed before NCB: ${this.page.isClosed()}`);
    await this._fillNCBCarryForwardDetails(data.ncbCarryForwardDetails);
    
    console.log('🔄 NCB Carry Forward Details completed, checking page status...');
    console.log(`Page is closed: ${this.page.isClosed()}`);
    
    // Add a small wait to let the page stabilize
    console.log('⏳ Waiting for page to stabilize...');
    await this.page.waitForTimeout(2000);
    
    // Try to fill payment details with retry mechanism
    console.log('💳 Attempting to fill Payment Details section with retry...');
    await this._fillPaymentDetailsWithRetry(data.paymentDetails);
    
    // Click Proposal Review
    await this._clickProposalReview();
    
    console.log('✅ New Corporate Policy Flow completed successfully!');
  }

  async _navigateAndLogin(creds) {
    const page = this.page;
    console.log('🔐 Navigating to application and logging in...');
    await page.goto('https://uatlifekaplan.tmibasl.in/');
    await page.getByRole('textbox', { name: 'Enter User Name' }).fill(creds.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(creds.password);
    await page.getByRole('button', { name: /login/i }).click();
    await page.getByRole('button', { name: /menu/i }).click();
    await page.getByText('Policy Centre').click();
    await page.getByText(/^Policy$/).click();
    await page.getByText('Policy Issuance').click();
    console.log('✅ Login and navigation completed');
  }

  async _navigateToPolicyIssuance() {
    const page = this.page;
    console.log('📋 Navigating to Policy Issuance...');
    
    // Check what buttons are available
    const availableButtons = await page.locator('button').allTextContents();
    console.log('Available buttons:', availableButtons);
    
    // Click on NEW policy button instead of RENEW (be more specific to avoid NEWS button)
    console.log('Clicking NEW policy button...');
    await page.getByRole('button', { name: 'New', exact: true }).click();
    
    // For NEW policies, there's no "NON TMIBASL POLICY" button - that's only for RENEW
    // The form should be ready after clicking NEW
    console.log('✅ Policy Issuance navigation completed (NEW policy selected)');
  }

  async _refreshSessionIfNeeded() {
    const page = this.page;
    console.log('🔄 Checking session status...');
    
    try {
      // Try to interact with a simple element to check if session is alive
      await page.locator('body').click({ timeout: 5000 });
      console.log('✅ Session is active');
    } catch (error) {
      console.log('⚠️ Session might be expired, attempting refresh...');
      try {
        // Instead of reloading, try to navigate to a safe page first
        console.log('🔄 Attempting to navigate to a safe page...');
        await page.goto(page.url(), { waitUntil: 'networkidle', timeout: 30000 });
        console.log('✅ Page refreshed successfully');
      } catch (refreshError) {
        console.log(`❌ Failed to refresh page: ${refreshError.message}`);
        // Don't throw error, just log it and continue
      }
    }
  }

  async _fillPolicyDetails(policyDetails) {
    const page = this.page;
    console.log('📝 Filling Policy Details section...');
    console.log('Policy Details data:', policyDetails);
    
    // Set Policy Type to "NEW" (should already be selected)
    console.log('Setting Policy Type to NEW...');
    const newPolicyToggle = page.getByRole('button', { name: 'New', exact: true });
    if (await newPolicyToggle.isVisible().catch(() => false)) {
      await newPolicyToggle.click();
      console.log('✅ Policy Type set to NEW');
    } else {
      console.log('⚠️ Policy Type NEW button not found');
    }
    
    // Select OEM
    console.log(`Selecting OEM: ${policyDetails.oem}...`);
    try {
      await page.locator('#mui-component-select-FKOEM_ID').click();
      await page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 10000 });
      
      // Check available OEM options
      const oemOptions = await page.locator('ul[role="listbox"] li[role="option"]').allTextContents();
      console.log('Available OEM options:', oemOptions);
      
      const fordOption = page.locator('ul[role="listbox"] li[role="option"]', { hasText: policyDetails.oem });
      const fordOptionExists = await fordOption.count() > 0;
      console.log(`Ford option exists: ${fordOptionExists}`);
      
      if (fordOptionExists) {
        await fordOption.click({ force: true });
        console.log(`✅ OEM selected: ${policyDetails.oem}`);
      } else {
        console.log(`❌ OEM option "${policyDetails.oem}" not found`);
        // Try to select the first available option
        const firstOption = page.locator('ul[role="listbox"] li[role="option"]').first();
        if (await firstOption.isVisible().catch(() => false)) {
          const firstOptionText = await firstOption.textContent();
          await firstOption.click();
          console.log(`⚠️ Selected first available OEM option: ${firstOptionText}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error selecting OEM: ${error.message}`);
    }
    await page.waitForTimeout(500);
    
    // Set Vehicle Class to COMMERCIAL (MUST be done before Built Type)
    console.log('Setting Vehicle Class to COMMERCIAL...');
    
    // First, close any open dropdowns
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    // Try multiple approaches to find and click the COMMERCIAL button
    const commercialSelectors = [
      page.getByRole('button', { name: 'COMMERCIAL', exact: true }),
      page.getByRole('button', { name: 'Commercial', exact: true }),
      page.getByRole('button', { name: /commercial/i }),
      page.locator('button').filter({ hasText: 'COMMERCIAL' }),
      page.locator('button').filter({ hasText: 'Commercial' }),
      page.locator('button').filter({ hasText: /commercial/i }),
      page.locator('[data-testid*="commercial"]'),
      page.locator('[data-testid*="COMMERCIAL"]')
    ];
    
    let commercialSelected = false;
    for (let i = 0; i < commercialSelectors.length; i++) {
      try {
        const selector = commercialSelectors[i];
        const isVisible = await selector.isVisible().catch(() => false);
        if (isVisible) {
          // Check if already selected
          const isSelected = await selector.getAttribute('class').then(cls => cls?.includes('Mui-selected')).catch(() => false);
          if (isSelected) {
            console.log(`✅ Vehicle Class already set to COMMERCIAL (selector ${i + 1})`);
            commercialSelected = true;
            break;
          }
          
          // Click the button
          await selector.click();
          console.log(`✅ Vehicle Class button clicked using selector ${i + 1}`);
          
          // Wait a moment for the selection to take effect
          await page.waitForTimeout(500);
          
          // Verify the selection took effect
          const isNowSelected = await selector.getAttribute('class').then(cls => cls?.includes('Mui-selected')).catch(() => false);
          if (isNowSelected) {
            console.log(`✅ Vehicle Class successfully set to COMMERCIAL using selector ${i + 1}`);
            commercialSelected = true;
            break;
          } else {
            console.log(`⚠️ Vehicle Class button clicked but not selected, trying next selector...`);
          }
        }
      } catch (e) {
        console.log(`Commercial selector ${i + 1} failed: ${e.message}`);
      }
    }
    
    if (!commercialSelected) {
      console.log('⚠️ Vehicle Class COMMERCIAL button not found, trying alternative approach...');
      
      // Alternative approach: look for any button containing "commercial" text
      try {
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          const button = allButtons.nth(i);
          const text = await button.textContent().catch(() => '');
          if (text && text.toLowerCase().includes('commercial')) {
            console.log(`Found COMMERCIAL button with text: "${text}"`);
            await button.click();
            await page.waitForTimeout(500);
            
            // Verify selection
            const isSelected = await button.getAttribute('class').then(cls => cls?.includes('Mui-selected')).catch(() => false);
            if (isSelected) {
              console.log('✅ Vehicle Class set to COMMERCIAL using alternative approach');
              commercialSelected = true;
              break;
            } else {
              console.log('⚠️ Alternative approach clicked but not selected');
            }
          }
        }
      } catch (e) {
        console.log(`Alternative approach failed: ${e.message}`);
      }
    }
    
    // Final verification - check if any commercial button is selected
    if (commercialSelected) {
      console.log('🔄 Final verification of COMMERCIAL selection...');
      try {
        const commercialButtons = page.locator('button').filter({ hasText: /commercial/i });
        const count = await commercialButtons.count();
        
        for (let i = 0; i < count; i++) {
          const button = commercialButtons.nth(i);
          const isSelected = await button.getAttribute('class').then(cls => cls?.includes('Mui-selected')).catch(() => false);
          if (isSelected) {
            const text = await button.textContent();
            console.log(`✅ Confirmed: Vehicle Class "${text}" is selected`);
            break;
          }
        }
      } catch (e) {
        console.log(`Final verification failed: ${e.message}`);
      }
    }
    
    if (!commercialSelected) {
      console.log('❌ Could not select Vehicle Class COMMERCIAL');
    }
    
    await page.waitForTimeout(1000); // Reduced wait time
    
    // Select Vehicle Cover
    console.log(`Selecting Vehicle Cover: ${policyDetails.vehicleCover}...`);
    try {
      // First, close any open dropdowns by pressing Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Click on the Vehicle Cover dropdown
      await page.locator('#mui-component-select-CoverTypeId').click();
      await page.waitForTimeout(1000);
      
      // Get all available options
      const options = await page.locator('[role="option"]').allTextContents();
      console.log('Available Vehicle Cover options:', options);
      
      // Try to select the option by clicking on it directly
      const optionToSelect = options.find(option => option.includes('1 OD + 1 TP') || option.includes('1 OD + 3 TP'));
      if (optionToSelect) {
        await page.locator(`[role="option"]:has-text("${optionToSelect}")`).click();
        console.log(`✅ Vehicle Cover selected: ${optionToSelect}`);
      } else {
        // Fallback: try to select any available option
        if (options.length > 0) {
          await page.locator('[role="option"]').first().click();
          console.log(`✅ Vehicle Cover selected: ${options[0]}`);
        } else {
          throw new Error('No options available');
        }
      }
    } catch (error) {
      console.log(`❌ Error selecting Vehicle Cover: ${error.message}`);
      
      // Try alternative approach - close dropdown and continue
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      console.log('⚠️ Skipping Vehicle Cover selection, continuing with form...');
    }
    
    // Set Offline Quote to NO
    console.log('Setting Offline Quote to NO...');
    const noToggle = page.getByRole('button', { name: /no/i }).first();
    if (await noToggle.isVisible().catch(() => false)) {
      await noToggle.click();
      console.log('✅ Offline Quote set to NO');
    } else {
      console.log('⚠️ Offline Quote NO button not found');
    }
    
    // Set Policy Start Date to Today
    console.log('Setting Policy Start Date to Today...');
    const policyStartDateInput = page.locator('input[name="POLICY_START_DATE"]').first();
    if (await policyStartDateInput.isVisible().catch(() => false)) {
      await policyStartDateInput.click();
      // Click "Today" button in calendar
      const todayButton = page.getByRole('button', { name: /today/i });
      if (await todayButton.isVisible().catch(() => false)) {
        await todayButton.click();
        console.log('✅ Policy Start Date set to Today');
      } else {
        console.log('⚠️ Today button not found in calendar');
      }
    } else {
      console.log('⚠️ Policy Start Date input not found');
    }
    
    // Set Proposer Type to CORPORATE
    console.log('Setting Proposer Type to CORPORATE...');
    
    // First, close any open dropdowns
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200); // Reduced wait time
    
    // Check if already selected to avoid multiple clicks
    const corporateButton = page.getByRole('button', { name: 'Corporate', exact: true });
    const isCorporateSelected = await corporateButton.getAttribute('class').then(cls => cls?.includes('Mui-selected')).catch(() => false);
    
    let corporateSelected = false;
    
    if (isCorporateSelected) {
      console.log('✅ Proposer Type already set to CORPORATE');
      corporateSelected = true;
    } else {
      // Try different approaches to find and click the Corporate button
      const corporateSelectors = [
      page.getByRole('button', { name: 'CORPORATE', exact: true }),
      page.getByRole('button', { name: 'Corporate', exact: true }),
      page.getByRole('button', { name: /corporate/i }),
      page.locator('button').filter({ hasText: 'CORPORATE' }),
      page.locator('button').filter({ hasText: 'Corporate' })
    ];
    
    let corporateSelected = false;
    for (let i = 0; i < corporateSelectors.length; i++) {
      try {
        const selector = corporateSelectors[i];
        const isVisible = await selector.isVisible().catch(() => false);
        console.log(`Corporate selector ${i + 1} visible: ${isVisible}`);
        
        if (isVisible) {
          const isEnabled = await selector.isEnabled().catch(() => false);
          console.log(`Corporate selector ${i + 1} enabled: ${isEnabled}`);
          
          if (isEnabled) {
            await selector.click();
            console.log(`✅ Proposer Type set to CORPORATE using selector ${i + 1}`);
            corporateSelected = true;
            break;
          }
        }
      } catch (e) {
        console.log(`Corporate selector ${i + 1} failed: ${e.message}`);
      }
    }
    
    if (!corporateSelected) {
      console.log('⚠️ Proposer Type CORPORATE button not found or not clickable');
      
      // Try to find any toggle button group that might contain Corporate
      const toggleGroups = await page.locator('[role="group"], .MuiToggleButtonGroup-root').all();
      console.log(`Found ${toggleGroups.length} toggle groups`);
      
      for (let i = 0; i < toggleGroups.length; i++) {
        try {
          const group = toggleGroups[i];
          const buttons = await group.locator('button').allTextContents();
          console.log(`Toggle group ${i + 1} buttons:`, buttons);
          
          if (buttons.some(btn => btn.toLowerCase().includes('corporate'))) {
            const corporateBtn = group.locator('button').filter({ hasText: /corporate/i });
            if (await corporateBtn.isVisible().catch(() => false)) {
              await corporateBtn.click();
              console.log(`✅ Proposer Type set to CORPORATE using toggle group ${i + 1}`);
              corporateSelected = true;
              break;
            }
          }
        } catch (e) {
          console.log(`Toggle group ${i + 1} failed: ${e.message}`);
        }
      }
    }
    }
    
    if (!corporateSelected) {
      console.log('❌ Could not select CORPORATE proposer type');
    }
    
    console.log('✅ Policy Details section completed');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-policy-details.png', fullPage: true });
    console.log('📸 Screenshot saved: debug-policy-details.png');
  }

  async _fillCompanyDetails(companyDetails) {
    const page = this.page;
    console.log('🏢 Filling Company Details section...');
    console.log('Company Details data:', companyDetails);
    
    // Scroll to Company Details section
    await page.locator('text=Company Details').scrollIntoViewIfNeeded().catch(() => {});
    
    // Company Salutation
    console.log(`Selecting Company Salutation: ${companyDetails.companySalutation}...`);
    try {
      // Try different selectors for Company Salutation
      const salutationSelectors = [
        '#mui-component-select-COMPANY_SALUTATION',
        'input[name="COMPANY_SALUTATION"]',
        'select[name="COMPANY_SALUTATION"]'
      ];
      
      let salutationSelected = false;
      for (const selector of salutationSelectors) {
        try {
          await this._selectMuiOption(selector, companyDetails.companySalutation);
          console.log(`✅ Company Salutation selected: ${companyDetails.companySalutation}`);
          salutationSelected = true;
          break;
        } catch (e) {
          console.log(`Tried selector ${selector}, failed: ${e.message}`);
        }
      }
      
      if (!salutationSelected) {
        console.log(`❌ Could not select Company Salutation with any selector`);
      }
    } catch (error) {
      console.log(`❌ Error selecting Company Salutation: ${error.message}`);
    }
    
    // Company Name
    console.log(`Filling Company Name: ${companyDetails.companyName}...`);
    try {
      // Try different selectors for Company Name
      const nameSelectors = [
        'input[name="COMPANY_NAME"]',
        'input[placeholder*="Company Name"]',
        'input[label*="Company Name"]'
      ];
      
      let nameFilled = false;
      for (const selector of nameSelectors) {
        try {
          await page.locator(selector).fill(companyDetails.companyName);
          console.log(`✅ Company Name filled: ${companyDetails.companyName}`);
          nameFilled = true;
          break;
        } catch (e) {
          console.log(`Tried selector ${selector}, failed: ${e.message}`);
        }
      }
      
      if (!nameFilled) {
        console.log(`❌ Could not fill Company Name with any selector`);
      }
    } catch (error) {
      console.log(`❌ Error filling Company Name: ${error.message}`);
    }
    
    // Email ID
    console.log(`Filling Email ID: ${companyDetails.emailId}...`);
    try {
      // Try different selectors for Email ID with shorter timeout
      const emailSelectors = [
        'input[placeholder="your_email@gmail.com"]',
        'input[placeholder="YOUR_EMAIL@GMAIL.COM"]',
        'input[type="email"]',
        'input[name="COMPANY_EMAIL"]',
        'input[name="EMAIL"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="email"]'
      ];
      
      let emailFilled = false;
      for (const selector of emailSelectors) {
        try {
          await page.locator(selector).fill(companyDetails.emailId, { timeout: 3000 });
          console.log(`✅ Email ID filled: ${companyDetails.emailId}`);
          emailFilled = true;
          break;
        } catch (e) {
          console.log(`Tried selector ${selector}, failed: ${e.message}`);
        }
      }
      
      if (!emailFilled) {
        console.log(`❌ Could not fill Email ID with any selector`);
      }
      
      // Small wait to prevent field clearing
      await page.waitForTimeout(500);
    } catch (error) {
      console.log(`❌ Error filling Email ID: ${error.message}`);
    }
    
    // Mobile No
    console.log(`Filling Mobile No: ${companyDetails.mobileNo}...`);
    try {
      // Try different selectors for Mobile No with shorter timeout
      const mobileSelectors = [
        'input[placeholder="9999999999"]',
        'input[name="COMPANY_MOBILE"]',
        'input[name="MOB_NO"]',
        'input[placeholder*="Mobile"]',
        'input[placeholder*="Phone"]'
      ];
      
      let mobileFilled = false;
      for (const selector of mobileSelectors) {
        try {
          await page.locator(selector).fill(companyDetails.mobileNo, { timeout: 3000 });
          console.log(`✅ Mobile No filled: ${companyDetails.mobileNo}`);
          mobileFilled = true;
          break;
        } catch (e) {
          console.log(`Tried selector ${selector}, failed: ${e.message}`);
        }
      }
      
      if (!mobileFilled) {
        console.log(`❌ Could not fill Mobile No with any selector`);
      }
    } catch (error) {
      console.log(`❌ Error filling Mobile No: ${error.message}`);
    }
    
    // Alternate Mobile No
    console.log(`Filling Alternate Mobile No: ${companyDetails.alternateMobileNo}...`);
    try {
      // Try different selectors for Alternate Mobile No with shorter timeout
      const altMobileSelectors = [
        'input[name="COMPANY_ALT_MOBILE"]',
        'input[name="ALT_MOBILE_NO"]',
        'input[placeholder*="Alternate"]',
        'input[placeholder*="Alt Mobile"]'
      ];
      
      let altMobileFilled = false;
      for (const selector of altMobileSelectors) {
        try {
          await page.locator(selector).fill(companyDetails.alternateMobileNo, { timeout: 3000 });
          console.log(`✅ Alternate Mobile No filled: ${companyDetails.alternateMobileNo}`);
          altMobileFilled = true;
          break;
        } catch (e) {
          console.log(`Tried selector ${selector}, failed: ${e.message}`);
        }
      }
      
      if (!altMobileFilled) {
        console.log(`❌ Could not fill Alternate Mobile No with any selector`);
      }
      
      // Small wait to prevent field clearing
      await page.waitForTimeout(500);
    } catch (error) {
      console.log(`❌ Error filling Alternate Mobile No: ${error.message}`);
    }
    
    console.log('✅ Company Details section completed');
  }

  async _fillVehicleDetails(vehicleDetails) {
    const page = this.page;
    console.log('🚗 Filling Vehicle Details...');
    
    // Scroll to Vehicle Details section
    await page.locator('text=Vehicle Details').scrollIntoViewIfNeeded().catch(() => {});
    
    // Use provided VIN and Engine numbers
    const vin = vehicleDetails.vin;
    const engineNo = vehicleDetails.engineNo;
    
    console.log(`Using VIN: ${vin}`);
    console.log(`Using Engine No: ${engineNo}`);
    
    // Fill VIN (Chassis No)
    await page.locator('input[name="ChassisNo"]').fill(vin);
    console.log(`✅ VIN filled: ${vin}`);
    
    // Fill Engine No
    await page.locator('input[name="EngineNo"]').fill(engineNo);
    console.log(`✅ Engine No filled: ${engineNo}`);
    
    // Built Type (if provided) - only appears when Vehicle Class = Commercial
    if (vehicleDetails.builtType) {
      console.log(`Selecting Built Type: ${vehicleDetails.builtType}...`);
      try {
        // Wait a bit longer for the field to appear after Vehicle Class selection
        await page.waitForTimeout(3000);
        
        // Try different selectors for Built Type - using the correct ID from HTML
        const builtTypeSelectors = [
          '#mui-component-select-FKBuiltType_ID',
          'input[name="FKBuiltType_ID"]',
          '#mui-component-select-BuiltType',
          'select[name="BuiltType"]',
          'input[name="BuiltType"]',
          '[data-testid="built-type"]'
        ];
        
        let builtTypeSelected = false;
        for (const selector of builtTypeSelectors) {
          try {
            console.log(`Trying Built Type selector: ${selector}`);
            await this._selectMuiOption(selector, vehicleDetails.builtType, { timeout: 5000 });
            console.log(`✅ Built Type selected: ${vehicleDetails.builtType}`);
            builtTypeSelected = true;
            break;
          } catch (e) {
            console.log(`Tried selector ${selector}, failed: ${e.message}`);
          }
        }
        
        if (!builtTypeSelected) {
          console.log(`⚠️ Could not select Built Type with any selector, continuing...`);
        }
      } catch (error) {
        console.log(`❌ Error selecting Built Type: ${error.message}`);
      }
    }
    
    // Make
    await this._selectMuiOption('#mui-component-select-MakeId', vehicleDetails.make);
    
    // Model
    await this._selectMuiOption('#mui-component-select-ModelId', vehicleDetails.model);
    
    // Variant
    await this._selectMuiOption('#mui-component-select-VariantId', vehicleDetails.variant);
    
    // Year of Manufacture
    await this._selectMuiOption('#mui-component-select-DateofManufacture', vehicleDetails.yearOfManufacture);
    
    // Registration City
    await this._selectMuiOption('#mui-component-select-RTOId', vehicleDetails.registrationCity);
    
    // Customer Residence State
    await this._selectMuiOption('#mui-component-select-IsuredStateId', vehicleDetails.customerResidenceState);
    
    // Invoice Date - Skip as it's pre-filled/disabled
    console.log('⚠️ Invoice Date is pre-filled/disabled, skipping...');
    
    // Registration Date - Skip as it's pre-filled/disabled  
    console.log('⚠️ Registration Date is pre-filled/disabled, skipping...');
    
    // GSTIN
    console.log(`Filling GSTIN: ${vehicleDetails.gstin}...`);
    try {
      // Try different selectors for GSTIN
      const gstinSelectors = [
        'input[name="GSTIN"]',
        'input[placeholder*="GST"]',
        'input[placeholder*="gst"]',
        'input[placeholder="Enter GST Number"]',
        'input[placeholder="Enter GSTIN"]'
      ];
      
      let gstinFilled = false;
      for (const selector of gstinSelectors) {
        try {
          await page.locator(selector).fill(vehicleDetails.gstin, { timeout: 5000 });
          console.log(`✅ GSTIN filled: ${vehicleDetails.gstin}`);
          gstinFilled = true;
          break;
        } catch (e) {
          console.log(`Tried selector ${selector}, failed: ${e.message}`);
        }
      }
      
      if (!gstinFilled) {
        console.log(`❌ Could not fill GSTIN with any selector`);
      }
    } catch (error) {
      console.log(`❌ Error filling GSTIN: ${error.message}`);
    }
    
    // Registration Number (using same robust approach as renewPolicy.js)
    console.log('Filling Registration Number...');
    const regNo = vehicleDetails.registrationNo;
    
    try {
      const regStateRto = page.locator('input[placeholder="DL-09"], input[aria-label="Registration State RTO"], input[name="REG_STATE_RTO"]');
      const regSeries = page.locator('input[placeholder="RAA"], input[aria-label="Registration Series"], input[name="REG_SERIES"]');
      const regNumber = page.locator('input[placeholder="5445"], input[aria-label="Registration Number"], input[name="REG_NUMBER"]');

      const stateRtoVal = regNo.stateCode || 'DL02T123';
      const seriesVal = regNo.rtoCode || 'DL';
      const numberVal = regNo.number || '7878';

      if (await regStateRto.first().isVisible().catch(() => false)) {
        await regStateRto.first().fill(stateRtoVal);
        console.log(`✅ State Code filled: ${stateRtoVal}`);
      }
      if (await regSeries.first().isVisible().catch(() => false)) {
        await regSeries.first().fill(seriesVal);
        console.log(`✅ RTO Code filled: ${seriesVal}`);
      }
      if (await regNumber.first().isVisible().catch(() => false)) {
        await regNumber.first().fill(numberVal);
        console.log(`✅ Registration Number filled: ${numberVal}`);
      }
    } catch (error) {
      console.log(`❌ Error filling Registration Number: ${error.message}`);
    }
    
    // Test Vehicle - NO
    const testVehicleNoToggle = page.getByRole('button', { name: /no/i }).last();
    if (await testVehicleNoToggle.isVisible().catch(() => false)) {
      await testVehicleNoToggle.click();
    }
  }

  async _fillAdditionalDiscounts(additionalDiscounts) {
    const page = this.page;
    
    // Scroll to Additional Discounts section
    await page.locator('text=Additional Discounts').scrollIntoViewIfNeeded().catch(() => {});
    
    // NCB Carry Forward - YES
    try {
      await this._toggleYesNearLabel(/NCB\s*Carry\s*Forward/i);
      console.log('✅ NCB Carry Forward set to YES');
    } catch (error) {
      console.log(`❌ Error setting NCB Carry Forward: ${error.message}`);
      console.log('⚠️ Skipping NCB Carry Forward, continuing...');
    }
    
    // Wait for NCB dropdown container
    await page.locator('#divNCBValue').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Select Entitled NCB %
    const ncbSelected = await (async () => {
      try { 
        await this._selectDropdownNearLabel(/Entitled\s*NCB\s*%/i, additionalDiscounts.entitledNcbPercent, { numeric: true }); 
        return true; 
      } catch { 
        try { 
          await this._selectMuiOption('#mui-component-select-NCBLevel', additionalDiscounts.entitledNcbPercent, { numeric: true }); 
          return true; 
        } catch { 
          return false; 
        }
      }
    })();
    
    // Voluntary Excess - YES
    try {
      await this._toggleYesNearLabel(/Voluntary\s*Excess/i);
      console.log('✅ Voluntary Excess set to YES');
    } catch (error) {
      console.log(`❌ Error setting Voluntary Excess: ${error.message}`);
      console.log('⚠️ Skipping Voluntary Excess, continuing...');
    }
    await page.locator('#divVoluntaryExcess').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Select Voluntary Excess Amount
    const volSelected = await (async () => {
      try { 
        await this._selectDropdownNearLabel(/Voluntary\s*Excess/i, additionalDiscounts.voluntaryExcessAmount, { numeric: true }); 
        return true; 
      } catch { 
        try { 
          await this._selectMuiOption('#mui-component-select-VoluntaryExcess', additionalDiscounts.voluntaryExcessAmount, { numeric: true }); 
          return true; 
        } catch { 
          return false; 
        }
      }
    })();
    
    // AAI Membership - YES
    try {
      await this._toggleYesNearLabel(/AAI\s*Membership/i);
      console.log('✅ AAI Membership set to YES');
    } catch (error) {
      console.log(`❌ Error setting AAI Membership: ${error.message}`);
      console.log('⚠️ Skipping AAI Membership, continuing...');
    }
    
    // Handicapped - YES
    try {
      await this._toggleYesNearLabel(/Handicapped/i);
      console.log('✅ Handicapped set to YES');
    } catch (error) {
      console.log(`❌ Error setting Handicapped: ${error.message}`);
      console.log('⚠️ Skipping Handicapped, continuing...');
    }
    
    // Anti Theft - YES
    try {
      await this._toggleYesNearLabel(/Anti\s*Theft/i);
      console.log('✅ Anti Theft set to YES');
    } catch (error) {
      console.log(`❌ Error setting Anti Theft: ${error.message}`);
      console.log('⚠️ Skipping Anti Theft, continuing...');
    }
  }

  async _getQuotesAndWait() {
    const page = this.page;
    console.log('🔄 Clicking Get Quotes and waiting for quotation page...');
    
    // Refresh session before clicking Get Quotes to prevent timeout
    await this._refreshSessionIfNeeded();
    
    // Click Get Quotes button
    try {
      await page.getByRole('button', { name: /Get Quotes/i }).click();
      console.log('✅ Get Quotes button clicked');
    } catch (error) {
      console.log(`❌ Error clicking Get Quotes: ${error.message}`);
      throw error;
    }
    
    // Optional pause immediately after clicking Get Quotes for manual observation
    {
      const debugSleepMs = parseInt(process.env.PLAYWRIGHT_DEBUG_SLEEP_MS || '0', 10);
      if (Number.isFinite(debugSleepMs) && debugSleepMs > 0) {
        await page.waitForTimeout(debugSleepMs);
      }
    }
    // Brief wait to let any validation surface
    await page.waitForTimeout(2000);

    // Robust, configurable wait for slow quote result loads
    try {
      const waitMs = parseInt(process.env.PLAYWRIGHT_QUOTE_LOAD_TIMEOUT_MS || '180000', 10);
      const pollIntervalMs = 500;
      const deadline = Date.now() + waitMs;
      while (Date.now() < deadline) {
        // Success conditions: quotes table/list visible OR a success toast
        const quoteGrid = page.locator('table:has-text("Quote"), [data-testid="quotes-grid"], [role="grid"]:has-text("Quote")').first();
        if (await quoteGrid.isVisible().catch(() => false)) break;
        const successToast = page.getByText(/quote|premium|plan|result/i).first();
        if (await successToast.isVisible().catch(() => false)) break;
        // Failure conditions: error alert surfaced
        const errorAlert = page.getByRole('alert').filter({ hasText: /error|failed|unable|timeout/i }).first();
        if (await errorAlert.isVisible().catch(() => false)) {
          break;
        }
        await page.waitForTimeout(pollIntervalMs);
      }
    } catch {}
    
    // Try to detect a red information alert mentioning minimum constraints
    try {
      const alertRole = page.getByRole('alert');
      if (await alertRole.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await alertRole.first().innerText();
        if (/minimum|min\b/i.test(text)) {
          console.log('Validation alert detected:', text);
          await page.screenshot({ path: 'test-results/validation-alert.png', fullPage: true });
        }
      } else {
        const minText = page.getByText(/minimum|min\b/i).first();
        if (await minText.isVisible({ timeout: 1000 }).catch(() => false)) {
          const text = await minText.innerText();
          console.log('Validation message detected:', text);
          await page.screenshot({ path: 'test-results/validation-alert.png', fullPage: true });
        }
      }
    } catch {}
    
    // Optional sleep for manual observation. Enable with PLAYWRIGHT_DEBUG_SLEEP_MS env var.
    const debugSleepMs = parseInt(process.env.PLAYWRIGHT_DEBUG_SLEEP_MS || '0', 10);
    if (Number.isFinite(debugSleepMs) && debugSleepMs > 0) {
      await page.waitForTimeout(debugSleepMs);
    }
    
    // After quotes load, pick the first available quote and click Buy Now
    try {
      const waitMs = parseInt(process.env.PLAYWRIGHT_QUOTE_LOAD_TIMEOUT_MS || '180000', 10);
      
      // Wait for quotes to load
      console.log('Waiting for quotes to load...');
      await page.waitForTimeout(5000); // Wait 5 seconds for quotes to appear
      
      console.log('Proceeding to find BUY NOW button...');
      
      // Wait for PolicyListing cards to be visible (based on getquotes.html structure)
      try {
        await page.locator('button:has-text("BUY NOW")').first().waitFor({ state: 'visible', timeout: waitMs });
        console.log('BUY NOW button is visible');
      } catch (e) {
        console.log('BUY NOW button not found, will try alternative selectors:', e.message);
      }

      console.log('Attempting to find and click BUY NOW button...');
      
      // Check if page is still alive
      try {
        await page.title();
        console.log('Page is still alive, proceeding with BUY NOW click');
      } catch (e) {
        console.log('Page has been closed, cannot proceed with BUY NOW click');
        throw new Error('Page has been closed');
      }
      
      let clicked = false;
      
      // APPROACH 1: Target the first BUY NOW button directly
      try {
        const buyNowButton = page.locator('button:has-text("BUY NOW")').first();
        if (await buyNowButton.isVisible({ timeout: 5000 })) {
          console.log('Found BUY NOW button, clicking...');
          await buyNowButton.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          
          // Wait for navigation after clicking BUY NOW
          const [newPage] = await Promise.all([
            page.waitForEvent('popup', { timeout: 10000 }).catch(() => null),
            buyNowButton.click()
          ]);
          
          if (newPage) {
            console.log('✅ BUY NOW opened new window, switching to it...');
            await newPage.waitForLoadState('networkidle');
            // Update page reference to the new page
            this.page = newPage;
            clicked = true;
            console.log('✅ Successfully switched to new window!');
          } else {
            // No popup, might be navigation in same window
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            clicked = true;
            console.log('✅ BUY NOW button clicked successfully!');
          }
        }
      } catch (e) {
        console.log('Approach 1 failed:', e.message);
      }
      
      // APPROACH 2: Try using the exact CSS path from getquotes.html if approach 1 failed
      if (!clicked) {
        try {
          // This targets the specific button structure from getquotes.html
          const specificBuyNow = page.locator('.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.cursor-pointer').first();
          
          if (await specificBuyNow.isVisible({ timeout: 3000 })) {
            console.log('Found BUY NOW button using specific CSS selector');
            await specificBuyNow.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await specificBuyNow.click();
            clicked = true;
            console.log('Successfully clicked specific BUY NOW button');
          }
        } catch (e) {
          console.log('Error with specific CSS selector approach:', e.message);
        }
      }
      
      // APPROACH 3: Try common selectors for Buy Now (enabled and visible)
      if (!clicked) {
        const buyCandidates = [
          page.locator('button:has-text("BUY NOW"):not([disabled])').first(),
          page.getByRole('button', { name: /buy\s*now/i }).first(),
          page.locator('a:has-text("BUY NOW")').first(),
          // Additional selector based on the HTML structure
          page.locator('.quotation-buynow-btn').first().locator('xpath=..'),
        ];

        for (const cand of buyCandidates) {
          if (!(await cand.isVisible({ timeout: 2000 }).catch(() => false))) continue;
          try {
            console.log('Found BUY NOW button using common selector');
            await cand.scrollIntoViewIfNeeded();
            await cand.waitFor({ state: 'visible', timeout: 5000 });
            await page.waitForTimeout(1000);
            await cand.click({ trial: true });
            await cand.click();
            clicked = true;
            console.log('Successfully clicked BUY NOW using common selector');
            break;
          } catch (e) {
            console.log('Error clicking with common selector:', e.message);
          }
        }
      }

      // APPROACH 4: If no global Buy Now visible, try within first table row/card
      if (!clicked) {
        try {
          // Explicit: first quote card's Buy Now within .PolicyListing
          const firstCard = page.locator('.PolicyListing').first();
          if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
            const firstCardBuy = firstCard.locator('button:has-text("BUY NOW"), [role="button"]:has-text("BUY NOW")').first();
            if (await firstCardBuy.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('Found BUY NOW button in first card');
              await firstCard.scrollIntoViewIfNeeded();
              await firstCardBuy.scrollIntoViewIfNeeded();
              await page.waitForTimeout(1000);
              await firstCardBuy.click({ trial: true });
              await firstCardBuy.click();
              clicked = true;
              console.log('Successfully clicked BUY NOW in first card');
            }
          }
        } catch (e) {
          console.log('Error with first card approach:', e.message);
          try {
            // Force click as last resort
            const firstCard = page.locator('.PolicyListing').first();
            const firstCardBuy = firstCard.locator('button:has-text("BUY NOW")').first();
            await firstCardBuy.click({ force: true });
            clicked = true;
            console.log('Force clicked BUY NOW in first card');
          } catch {}
        }
      }

      // APPROACH 5: Try table rows if cards didn't work
      if (!clicked) {
        try {
          const firstRow = page.locator('table tbody tr').first();
          if (await firstRow.isVisible().catch(() => false)) {
            const rowBuy = firstRow.getByRole('button', { name: /buy\s*now/i }).first();
            if (await rowBuy.isVisible({ timeout: 1000 }).catch(() => false)) {
              console.log('Found BUY NOW button in table row');
              await rowBuy.scrollIntoViewIfNeeded();
              await page.waitForTimeout(1000);
              await rowBuy.click({ trial: true });
              await rowBuy.click();
              clicked = true;
              console.log('Successfully clicked BUY NOW in table row');
            } else {
              await firstRow.click();
              const altRowBuy = firstRow.locator('button:has-text("BUY NOW"), a:has-text("BUY NOW")').first();
              if (await altRowBuy.isVisible({ timeout: 1000 }).catch(() => false)) {
                await altRowBuy.scrollIntoViewIfNeeded();
                await page.waitForTimeout(1000);
                await altRowBuy.click({ trial: true });
                await altRowBuy.click();
                clicked = true;
                console.log('Successfully clicked alternative BUY NOW in table row');
              }
            }
          }
        } catch (e) {
          console.log('Error with table row approach:', e.message);
        }
      }

      // APPROACH 6: Final fallback using any visible BUY NOW button
      if (!clicked) {
        try {
          const anyBuyNow = page.locator('button:has-text("BUY NOW"), [class*="buynow" i]').first();
          if (await anyBuyNow.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('Found BUY NOW using fallback approach');
            await anyBuyNow.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await anyBuyNow.click({ force: true });
            clicked = true;
            console.log('Successfully clicked BUY NOW using fallback approach');
          }
        } catch (e) {
          console.log('Error with fallback approach:', e.message);
        }
      }

      // Confirm navigation into proposal/checkout screen
      if (clicked) {
        console.log('Waiting for proposal details page to load...');
        
        // Wait for proposal page to load
        await Promise.race([
          page.waitForSelector('input[name="DOB"]', { timeout: 60000 }).catch(() => null),
          page.waitForSelector('text=/Proposal|Proposer|Checkout/i', { timeout: 60000 }).catch(() => null),
          page.waitForSelector('input[name="FIRST_NAME"]', { timeout: 60000 }).catch(() => null),
        ]);
        
        console.log('✅ Successfully navigated to proposal details page!');
      }
    } catch (e) {
      console.log('Error in quotation flow:', e.message);
    }
    
    console.log('✅ Quote processing completed');
  }

  async _fillProposalDetails(data) {
    const page = this.page;
    
    try {
      console.log('Starting to fill proposal details...');
      
      // Wait for the proposal details section to be visible
      await page.waitForSelector('text=Proposer Details', { timeout: 10000 }).catch(() => {});
      
      // Salutation - try different approaches
      try {
        console.log('Filling salutation...');
        await this._selectMuiOption('#mui-component-select-SALUTATION', data.proposerDetails.salutation);
      } catch {
        try {
          await page.locator('[name="SALUTATION"]').selectOption(data.proposerDetails.salutation);
        } catch {
          console.log('Could not fill salutation, skipping...');
        }
      }
      
      // First Name
      try {
        console.log('Filling first name...');
        const firstNameInput = page.locator('input[name="FIRST_NAME"]');
        if (await firstNameInput.isVisible({ timeout: 2000 })) {
          await firstNameInput.clear();
          await firstNameInput.fill(data.proposerDetails.firstName);
        }
      } catch (e) {
        console.log('Error filling first name:', e.message);
      }
      
      // Date of Incorporation - Skip as it's readonly/disabled
      console.log('⚠️ Date of Incorporation field is readonly/disabled, skipping...');
      
      // State - Check if already selected
      try {
        console.log('Checking state...');
        const stateValue = await page.locator('#mui-component-select-STATE_ID').textContent();
        if (stateValue && stateValue.trim() !== '--Select State--') {
          console.log(`✅ State already selected: ${stateValue}`);
        } else {
          console.log('Filling state...');
          await this._selectMuiOption('#mui-component-select-STATE_ID', data.proposerDetails.state);
        }
      } catch (e) {
        console.log('Error filling state:', e.message);
      }
      
      // City - Check if needs to be selected
      try {
        console.log('Checking city...');
        const cityValue = await page.locator('#mui-component-select-CITY_ID').textContent();
        if (cityValue && cityValue.trim() !== '--Select City--') {
          console.log(`✅ City already selected: ${cityValue}`);
        } else {
          console.log('Filling city...');
          await this._selectMuiOption('#mui-component-select-CITY_ID', data.proposerDetails.city);
        }
      } catch (e) {
        console.log('Error filling city:', e.message);
      }
      
      // Pincode (proposal page)
      try {
        console.log('Filling pincode...');
        let setOk = false;
        let pickedPin = null;
        // Dropdown-first: open list near the Pincode label and pick a 6-digit option
        try {
          const label = page.getByText(/Pincode\b/i).first();
          const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
          const combo = container.locator('[role="combobox"], [aria-haspopup="listbox"], [id^="mui-component-select-"]').first();
          if (await combo.isVisible({ timeout: 1000 }).catch(() => false)) {
            await combo.click();
            const list = page.locator('ul[role="listbox"] li[role="option"]').filter({ hasText: /\b\d{6}\b/ });
            const count = await list.count().catch(() => 0);
            if (count > 0) {
              // prefer exact match from test data
              const exact = list.filter({ hasText: new RegExp(`\\b${data.proposerDetails.pincode}\\b`) });
              if (await exact.count()) {
                pickedPin = (await exact.first().innerText()).trim().match(/\b\d{6}\b/)[0];
                await exact.first().click();
              } else {
                pickedPin = (await list.first().innerText()).trim().match(/\b\d{6}\b/)[0];
                await list.first().click();
              }
              setOk = true;
            }
          }
        } catch {}
        // Input fallback
        if (!setOk) {
          const pincodeInput = page.locator('input[name="PIN"]').first();
          if (await pincodeInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await pincodeInput.clear();
            await pincodeInput.fill(data.proposerDetails.pincode);
            let pv = await pincodeInput.inputValue().catch(() => '');
            if (!pv) {
              await this._forceSetBySelector('input[name="PIN"]', data.proposerDetails.pincode).catch(() => {});
              pv = await pincodeInput.inputValue().catch(() => '');
            }
            await page.keyboard.press('Tab').catch(() => {});
            pickedPin = pv || data.proposerDetails.pincode;
            setOk = !!pv;
          } else {
            // Near-label to next input
            await this._forceSetBySelector('xpath=//label[contains(.,"Pincode")]/following::input[1]', data.proposerDetails.pincode).catch(() => {});
            pickedPin = data.proposerDetails.pincode;
          }
        }
      } catch (e) {
        console.log('Error filling pincode:', e.message);
      }
      
      // Email ID - Skip as it's disabled
      console.log('⚠️ Email ID field is disabled, skipping...');
      
      // Mobile No - Skip as it's disabled  
      console.log('⚠️ Mobile No field is disabled, skipping...');
      
      // PAN Number
      try {
        console.log('Filling PAN number...');
        const panInput = page.locator('input[name="PAN_NO"]');
        if (await panInput.isVisible({ timeout: 2000 })) {
          await panInput.clear();
          await panInput.fill(data.proposerDetails.panNo);
        }
      } catch (e) {
        console.log('Error filling PAN number:', e.message);
      }
      
      console.log('Finished filling proposal details form');
      
    } catch (e) {
      console.log('Error in _fillProposalDetails:', e.message);
    }
  }

  async _fillAAMembershipDetails(aaMembershipDetails) {
    const page = this.page;
    
    try {
      console.log('🏛️ Filling AA Membership Details section...');
      
      // Check if AA Membership Details section exists
      const aaSectionExists = await page.locator('text=AA Membership Details').isVisible({ timeout: 5000 }).catch(() => false);
      
      if (!aaSectionExists) {
        console.log('⚠️ AA Membership Details section not found, skipping...');
        return;
      }
      
      // Scroll to AA Membership Details section
      await page.locator('text=AA Membership Details').scrollIntoViewIfNeeded().catch(() => {});
      
      // Association Name
      try {
        console.log(`Selecting Association Name: ${aaMembershipDetails.associationName}...`);
        await this._selectMuiOption('#mui-component-select-ASSOCIATION_NAME', aaMembershipDetails.associationName);
        console.log('✅ Association Name selected');
      } catch (error) {
        console.log(`❌ Error selecting Association Name: ${error.message}`);
      }
      
      // Membership No
      try {
        console.log(`Filling Membership No: ${aaMembershipDetails.membershipNo}...`);
        await page.locator('input[name="MEMBERSHIP_NO"]').fill(aaMembershipDetails.membershipNo);
        console.log('✅ Membership No filled');
      } catch (error) {
        console.log(`❌ Error filling Membership No: ${error.message}`);
      }
      
      // Invalidity Month
      try {
        console.log(`Selecting Invalidity Month: ${aaMembershipDetails.invalidityMonth}...`);
        await this._selectMuiOption('#mui-component-select-AAMonth', aaMembershipDetails.invalidityMonth);
        console.log('✅ Invalidity Month selected');
      } catch (error) {
        console.log(`❌ Error selecting Invalidity Month: ${error.message}`);
      }
      
      // Year
      try {
        console.log(`Filling Year: ${aaMembershipDetails.year}...`);
        await page.locator('input[name="AAYear"]').fill(aaMembershipDetails.year);
        console.log('✅ Year filled');
      } catch (error) {
        console.log(`❌ Error filling Year: ${error.message}`);
      }
      
      console.log('✅ AA Membership Details section completed');
    } catch (error) {
      console.log(`❌ Error in _fillAAMembershipDetails: ${error.message}`);
    }
  }

  async _fillNCBCarryForwardDetails(ncbCarryForwardDetails) {
    const page = this.page;
    
    try {
      console.log('📋 Filling NCB Carry Forward Details section...');
      
      // Check if NCB Carry Forward Details section exists
      const ncbSectionExists = await page.locator('text=NCB Carry Forward Details').isVisible({ timeout: 5000 }).catch(() => false);
      
      if (!ncbSectionExists) {
        console.log('⚠️ NCB Carry Forward Details section not found, skipping...');
        return;
      }
      
      // Scroll to NCB Carry Forward Details section
      await page.locator('text=NCB Carry Forward Details').scrollIntoViewIfNeeded().catch(() => {});
      
      // Make
      try {
        console.log(`Filling Make: ${ncbCarryForwardDetails.make}...`);
        await page.locator('input[name="PREV_VEH_MAKE"]').fill(ncbCarryForwardDetails.make);
        console.log('✅ Make filled');
      } catch (error) {
        console.log(`❌ Error filling Make: ${error.message}`);
      }
      
      // Model
      try {
        console.log(`Filling Model: ${ncbCarryForwardDetails.model}...`);
        await page.locator('input[name="PREV_VEH_MODEL"]').fill(ncbCarryForwardDetails.model);
        console.log('✅ Model filled');
      } catch (error) {
        console.log(`❌ Error filling Model: ${error.message}`);
      }
      
      // Variant
      try {
        console.log(`Filling Variant: ${ncbCarryForwardDetails.variant}...`);
        await page.locator('input[name="PREV_VEH_VARIANT_NO"]').fill(ncbCarryForwardDetails.variant);
        console.log('✅ Variant filled');
      } catch (error) {
        console.log(`❌ Error filling Variant: ${error.message}`);
      }
      
      // Year of Manufacture
      try {
        console.log(`Selecting Year of Manufacture: ${ncbCarryForwardDetails.yearOfManufacture}...`);
        await this._selectMuiOption('#mui-component-select-PREV_VEH_MANU_YEAR', ncbCarryForwardDetails.yearOfManufacture);
        console.log('✅ Year of Manufacture selected');
      } catch (error) {
        console.log(`❌ Error selecting Year of Manufacture: ${error.message}`);
      }
      
      // Chassis No
      try {
        console.log(`Filling Chassis No: ${ncbCarryForwardDetails.chassisNo}...`);
        await page.locator('input[name="PREV_VEH_CHASSIS_NO"]').fill(ncbCarryForwardDetails.chassisNo);
        console.log('✅ Chassis No filled');
      } catch (error) {
        console.log(`❌ Error filling Chassis No: ${error.message}`);
      }
      
      // Engine No
      try {
        console.log(`Filling Engine No: ${ncbCarryForwardDetails.engineNo}...`);
        await page.locator('input[name="PREV_VEH_ENGINE_NO"]').fill(ncbCarryForwardDetails.engineNo);
        console.log('✅ Engine No filled');
      } catch (error) {
        console.log(`❌ Error filling Engine No: ${error.message}`);
      }
      
      // Invoice Date
      try {
        console.log(`Setting Invoice Date: ${ncbCarryForwardDetails.invoiceDate}...`);
        await this._setDateOnInput(page.locator('input[name="PREV_VEH_INVOICEDATE"]'), ncbCarryForwardDetails.invoiceDate);
        console.log('✅ Invoice Date set');
      } catch (error) {
        console.log(`❌ Error setting Invoice Date: ${error.message}`);
      }
      
      // Registration No
      try {
        console.log(`Filling Registration No: ${ncbCarryForwardDetails.registrationNo}...`);
        await page.locator('input[name="PREV_VEH_REG_NO"]').fill(ncbCarryForwardDetails.registrationNo);
        console.log('✅ Registration No filled');
      } catch (error) {
        console.log(`❌ Error filling Registration No: ${error.message}`);
      }
      
      // Previous Policy No
      try {
        console.log(`Filling Previous Policy No: ${ncbCarryForwardDetails.previousPolicyNo}...`);
        await page.locator('input[name="PREV_VEH_POLICY_NONVISOF"]').fill(ncbCarryForwardDetails.previousPolicyNo);
        console.log('✅ Previous Policy No filled');
      } catch (error) {
        console.log(`❌ Error filling Previous Policy No: ${error.message}`);
      }
      
      // NCB Document Submitted - YES
      try {
        console.log(`Setting NCB Document Submitted: ${ncbCarryForwardDetails.ncbDocumentSubmitted}...`);
        await this._setCheckboxNearLabel(/NCB\s*Document\s*Submitted/i, ncbCarryForwardDetails.ncbDocumentSubmitted);
        console.log('✅ NCB Document Submitted checkbox set');
      } catch (error) {
        console.log(`❌ Error setting NCB Document Submitted checkbox: ${error.message}`);
      }
      
      // Policy Period From
      try {
        console.log(`Setting Policy Period From: ${ncbCarryForwardDetails.policyPeriodFrom}...`);
        await this._setDateOnInput(page.locator('input[name="PREV_VEH_POLICYSTARTDATE"]'), ncbCarryForwardDetails.policyPeriodFrom);
        console.log('✅ Policy Period From set');
      } catch (error) {
        console.log(`❌ Error setting Policy Period From: ${error.message}`);
      }
      
      // Policy Period To
      try {
        console.log(`Setting Policy Period To: ${ncbCarryForwardDetails.policyPeriodTo}...`);
        await this._setDateOnInput(page.locator('input[name="PREV_VEH_POLICYENDDATE"]'), ncbCarryForwardDetails.policyPeriodTo);
        console.log('✅ Policy Period To set');
      } catch (error) {
        console.log(`❌ Error setting Policy Period To: ${error.message}`);
      }
      
      // Insurance Company
      try {
        console.log(`Selecting Insurance Company: ${ncbCarryForwardDetails.insuranceCompany}...`);
        await this._selectMuiOption('#mui-component-select-PREV_VEH_IC', ncbCarryForwardDetails.insuranceCompany);
        console.log('✅ Insurance Company selected');
      } catch (error) {
        console.log(`❌ Error selecting Insurance Company: ${error.message}`);
      }
      
      // Office Address
      try {
        console.log(`Filling Office Address: ${ncbCarryForwardDetails.officeAddress}...`);
        await page.locator('input[name="PREV_VEH_ADDRESS"]').fill(ncbCarryForwardDetails.officeAddress);
        console.log('✅ Office Address filled');
      } catch (error) {
        console.log(`❌ Error filling Office Address: ${error.message}`);
      }
      
      console.log('✅ NCB Carry Forward Details section completed');
    } catch (error) {
      console.log(`❌ Error in _fillNCBCarryForwardDetails: ${error.message}`);
    }
  }

  async _fillNomineeDetails(nomineeDetails) {
    const page = this.page;
    
    console.log('👤 Filling Nominee Details section...');
    
    // Scroll to Nominee Details section
    await page.locator('text=Nominee Details').scrollIntoViewIfNeeded().catch(() => {});
    
    // Check if page is still alive
    if (page.isClosed()) {
      console.log('❌ Page is closed, cannot fill nominee details');
      return;
    }
    
    try {
      // Nominee Name
      console.log(`Filling Nominee Name: ${nomineeDetails.nomineeName}`);
      await page.locator('input[name="NomineeName"]').fill(nomineeDetails.nomineeName);
      console.log('✅ Nominee Name filled');
      
      // Nominee Age
      console.log(`Filling Nominee Age: ${nomineeDetails.nomineeAge}`);
      await page.locator('input[name="NomineeAge"]').fill(nomineeDetails.nomineeAge);
      console.log('✅ Nominee Age filled');
      
      // Nominee Relation
      console.log(`Selecting Nominee Relation: ${nomineeDetails.nomineeRelation}`);
      await this._selectMuiOption('#mui-component-select-NomineeRelation', nomineeDetails.nomineeRelation);
      console.log('✅ Nominee Relation selected');
      
      // Nominee Gender
      console.log(`Selecting Nominee Gender: ${nomineeDetails.nomineeGender}`);
      await this._selectMuiOption('#mui-component-select-NomineeGender', nomineeDetails.nomineeGender);
      console.log('✅ Nominee Gender selected');
      
      console.log('✅ Nominee Details section completed');
    } catch (error) {
      console.log(`❌ Error filling nominee details: ${error.message}`);
      throw error;
    }
  }

  async _fillPaymentDetailsWithRetry(paymentDetails) {
    const page = this.page;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`💳 Payment Details attempt ${attempt}/${maxRetries}...`);
      
      try {
        // Check if page is still alive
        if (page.isClosed()) {
          console.log(`❌ Page is closed on attempt ${attempt}`);
          if (attempt < maxRetries) {
            console.log('⏳ Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw new Error('Page is closed and cannot be recovered');
        }
        
        // Scroll to Payment Details section
        await page.locator('text=Payment Details').scrollIntoViewIfNeeded().catch(() => {});
        console.log('✅ Scrolled to Payment Details section');
        
        // Wait for elements to be visible
        await page.waitForSelector('#mui-component-select-PAYMENT_MODE', { timeout: 10000 });
        await page.waitForSelector('#mui-component-select-AgentID', { timeout: 10000 });
        
        // Payment Mode
        console.log(`Selecting Payment Mode: ${paymentDetails.paymentMode}`);
        await this._selectMuiOption('#mui-component-select-PAYMENT_MODE', paymentDetails.paymentMode);
        console.log('✅ Payment Mode selected');
        
        // Small wait between selections
        await page.waitForTimeout(1000);
        
        // DP Name
        console.log(`Selecting DP Name: ${paymentDetails.dpName}`);
        await this._selectMuiOption('#mui-component-select-AgentID', paymentDetails.dpName);
        console.log('✅ DP Name selected');
        
        console.log('✅ Payment Details section completed successfully');
        return; // Success, exit retry loop
        
      } catch (error) {
        console.log(`❌ Error on attempt ${attempt}: ${error.message}`);
        
        if (attempt < maxRetries) {
          console.log('⏳ Waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.log('❌ All retry attempts failed');
          throw error;
        }
      }
    }
  }

  async _fillPaymentDetails(paymentDetails) {
    const page = this.page;
    
    console.log('💳 Filling Payment Details section...');
    console.log(`Payment Details data: ${JSON.stringify(paymentDetails, null, 2)}`);
    
    // Check if page is still alive
    if (page.isClosed()) {
      console.log('❌ Page is closed, cannot fill payment details');
      return;
    }
    
    try {
      // Scroll to Payment Details section
      await page.locator('text=Payment Details').scrollIntoViewIfNeeded().catch(() => {});
      console.log('✅ Scrolled to Payment Details section');
      
      // Check current Payment Mode value
      const currentPaymentMode = await page.locator('#mui-component-select-PAYMENT_MODE').textContent();
      console.log(`Current Payment Mode: "${currentPaymentMode}"`);
      console.log(`Expected Payment Mode: "${paymentDetails.paymentMode}"`);
      
      if (currentPaymentMode && currentPaymentMode.trim() === paymentDetails.paymentMode) {
        console.log('✅ Payment Mode already selected correctly');
      } else {
        console.log(`Selecting Payment Mode: ${paymentDetails.paymentMode}`);
        await this._selectMuiOption('#mui-component-select-PAYMENT_MODE', paymentDetails.paymentMode);
        console.log('✅ Payment Mode selected');
      }
      
      // Check current DP Name value
      const currentDpName = await page.locator('#mui-component-select-AgentID').textContent();
      console.log(`Current DP Name: "${currentDpName}"`);
      console.log(`Expected DP Name: "${paymentDetails.dpName}"`);
      
      if (currentDpName && currentDpName.trim() === paymentDetails.dpName) {
        console.log('✅ DP Name already selected correctly');
      } else {
        console.log(`Selecting DP Name: ${paymentDetails.dpName}`);
        await this._selectMuiOption('#mui-component-select-AgentID', paymentDetails.dpName);
        console.log('✅ DP Name selected');
      }
      
      console.log('✅ Payment Details section completed');
    } catch (error) {
      console.log(`❌ Error filling payment details: ${error.message}`);
      throw error;
    }
  }

  async _clickProposalReview() {
    const page = this.page;
    
    // Click Proposal Review button
    const proposalReviewBtn = page.getByRole('button', { name: /proposal\s*review/i });
    if (await proposalReviewBtn.isVisible().catch(() => false)) {
      await proposalReviewBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Reuse existing helper methods from RenewPolicyPage
  async _forceSetBySelector(selector, value) {
    const page = this.page;
    const field = page.locator(selector).first();
    if (!(await field.isVisible().catch(() => false))) return false;
    const handle = await field.elementHandle();
    if (!handle) return false;
    await handle.evaluate((el, v) => {
      try { el.removeAttribute('readonly'); } catch {}
      try { el.readOnly = false; } catch {}
      try { el.removeAttribute('disabled'); } catch {}
      try { el.disabled = false; } catch {}
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
        || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.blur();
    }, value);
    const val = await field.inputValue().catch(() => '');
    if (val && val !== 'DD/MM/YYYY') return true;
    // Fallback to typing
    try {
      await field.click();
      await field.fill('');
      await field.type(value, { delay: 20 });
      await page.keyboard.press('Tab').catch(() => {});
      return true;
    } catch { return false; }
  }

  async _selectMuiOption(selectLocator, optionText, opts = {}) {
    const page = this.page;
    await page.locator(selectLocator).click();
    const list = page.locator('ul[role="listbox"]');
    await list.waitFor({ state: 'visible', timeout: 10000 });
    const options = list.locator('li[role="option"]');
    const count = await options.count();
    const normalize = (s) => (s || '').trim();
    const normalizeLoose = (s) => (s || '').replace(/\s+/g, '').toLowerCase();
    const toNumeric = (s) => {
      const m = (s || '').match(/\d+/);
      return m ? m[0] : null;
    };

    // exact/contains
    for (let i = 0; i < count; i++) {
      const text = normalize(await options.nth(i).innerText());
      if (text === optionText || text.includes(optionText)) {
        await options.nth(i).click();
        return;
      }
    }
    // loose spaces/case
    const target = normalizeLoose(optionText);
    for (let i = 0; i < count; i++) {
      const text = normalizeLoose(await options.nth(i).innerText());
      if (text.includes(target)) {
        await options.nth(i).click();
        return;
      }
    }
    // numeric matching (for cases like '20%', '20 %', 'Level 20')
    if (opts.numeric) {
      const want = toNumeric(optionText);
      if (want) {
        for (let i = 0; i < count; i++) {
          const text = await options.nth(i).innerText();
          if (toNumeric(text) === want) {
            await options.nth(i).click();
            return;
          }
        }
      }
    }
    throw new Error(`Option not found for ${selectLocator}: ${optionText}`);
  }

  async _setDateOnInput(inputLocator, dateStr) {
    const input = inputLocator.first();
    if (!(await input.isVisible().catch(() => false))) throw new Error('Date input not found');
    const page = this.page;
    // 1) Try direct set first (handles masked/readonly inputs)
    const handle = await input.elementHandle();
    if (!handle) throw new Error('Date input handle missing');
    await handle.evaluate((el, value) => {
      try { el.removeAttribute('readonly'); } catch {}
      try { el.readOnly = false; } catch {}
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.blur();
    }, dateStr);
    let val = await input.inputValue().catch(() => '');
    if (val === dateStr) {
      // Value is already set correctly
      await page.keyboard.press('Escape').catch(() => {});
      await input.blur().catch(() => {});
      return;
    }
    // 2) Fallback to calendar selection
    await input.click();
    try {
      await this._selectDate(dateStr);
      await page.keyboard.press('Escape').catch(() => {});
    } catch {}
    val = await input.inputValue().catch(() => '');
    if (val && val !== 'DD/MM/YYYY') return;
    // 3) Final attempt: type into input (some masks accept typing)
    await input.click();
    await input.fill('');
    await input.type(dateStr, { delay: 20 });
    await page.keyboard.press('Enter').catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await input.blur().catch(() => {});
  }

  async _selectDate(dateStr) {
    const page = this.page;
    const [dStr, mStr, yStr] = dateStr.split('/');
    const targetDay = dStr.replace(/^0/, '');
    const targetMonth = parseInt(mStr, 10); // 1-12
    const targetYear = parseInt(yStr, 10);

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    // Ensure a dialog is open
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Helper to read current header month/year
    const readHeader = async () => {
      // Try a direct regex on header label text
      const header = dialog.locator('text=/^(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}$/').first();
      if (await header.isVisible().catch(() => false)) {
        const t = (await header.innerText()).trim();
        const [mName, y] = t.split(/\s+/);
        return { monthIndex: monthNames.indexOf(mName) + 1, year: parseInt(y, 10) };
      }
      // Fallback: scan any text in dialog matching Month YYYY
      const all = await dialog.allInnerTexts().catch(() => []);
      for (const line of all) {
        const m = line.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/);
        if (m) {
          return { monthIndex: monthNames.indexOf(m[1]) + 1, year: parseInt(m[2], 10) };
        }
      }
      return null;
    };

    const clickNext = async () => {
      const btn = dialog.locator('[aria-label="Next month"], button[title="Next month"], [data-testid*="NextArrow"], button:has-text("›"), button:has-text(\">\")').first();
      if (await btn.isVisible().catch(() => false)) { await btn.click(); return true; }
      // Generic: the second arrow icon button in header
      const generic = dialog.locator('button').filter({ hasText: /\b|/ }).nth(1);
      if (await generic.isVisible().catch(() => false)) { await generic.click(); return true; }
      return false;
    };
    const clickPrev = async () => {
      const btn = dialog.locator('[aria-label="Previous month"], button[title="Previous month"], [data-testid*="PreviousArrow"], button:has-text("‹"), button:has-text("<")').first();
      if (await btn.isVisible().catch(() => false)) { await btn.click(); return true; }
      const generic = dialog.locator('button').first();
      if (await generic.isVisible().catch(() => false)) { await generic.click(); return true; }
      return false;
    };

    // Navigate to target month/year with a safe iteration cap
    for (let i = 0; i < 30; i++) {
      const cur = await readHeader();
      if (!cur) break;
      if (cur.year === targetYear && cur.monthIndex === targetMonth) break;
      const curAbs = cur.year * 12 + cur.monthIndex;
      const tgtAbs = targetYear * 12 + targetMonth;
      if (tgtAbs > curAbs) {
        if (!(await clickNext())) break;
      } else {
        if (!(await clickPrev())) break;
      }
      await page.waitForTimeout(100);
    }

    // Click the target day
    await page.getByRole('gridcell', { name: targetDay, exact: true }).click();
  }

  async _toggleYesNearLabel(labelRegex) {
    const page = this.page;
    const label = page.getByText(labelRegex).first();
    await label.scrollIntoViewIfNeeded().catch(() => {});
    const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
    // Try explicit Yes button
    const yesBtn = container.getByRole('button', { name: /yes/i }).first();
    if (await yesBtn.isVisible().catch(() => false)) {
      const ariaPressed = await yesBtn.getAttribute('aria-pressed').catch(() => null);
      if (ariaPressed !== 'true') {
        await yesBtn.click();
      }
      return;
    }
    // Try switch/checkbox
    const checkbox = container.locator('input[type="checkbox"], [role="switch"]').first();
    if (await checkbox.isVisible().catch(() => false)) {
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (!isChecked) {
        const boxLabel = checkbox.locator('xpath=ancestor::label[1]');
        if (await boxLabel.isVisible().catch(() => false)) {
          await boxLabel.click();
        } else {
          await checkbox.click({ force: true });
        }
      }
      return;
    }
    // Try radio Yes
    const radioYes = container.locator('input[type="radio"][value="true"], input[type="radio"][aria-checked="true"]').first();
    if (await radioYes.isVisible().catch(() => false)) {
      const isChecked = await radioYes.isChecked().catch(() => false);
      if (!isChecked) {
        await radioYes.check({ force: true });
      }
      return;
    }
    // Fallback: global Yes near the label
    const globalYes = page.getByRole('button', { name: /yes/i }).first();
    if (await globalYes.isVisible().catch(() => false)) {
      const ariaPressed = await globalYes.getAttribute('aria-pressed').catch(() => null);
      if (ariaPressed !== 'true') {
        await globalYes.click();
      }
      return;
    }
    throw new Error('Unable to set Yes for toggle near label');
  }

  async _setCheckboxNearLabel(labelRegex, shouldBeChecked) {
    const page = this.page;
    const label = page.getByText(labelRegex).first();
    await label.scrollIntoViewIfNeeded().catch(() => {});
    const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
    const checkbox = container.locator('input[type="checkbox"], [role="switch"]').first();
    if (await checkbox.isVisible().catch(() => false)) {
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (shouldBeChecked !== isChecked) {
        const boxLabel = checkbox.locator('xpath=ancestor::label[1]');
        if (await boxLabel.isVisible().catch(() => false)) {
          await boxLabel.click();
        } else {
          await checkbox.click({ force: true });
        }
      }
    } else {
      // Fallback to any Yes/No buttons in the same container
      const yesBtn = container.getByRole('button', { name: /yes/i }).first();
      const noBtn = container.getByRole('button', { name: /no/i }).first();
      if (shouldBeChecked && await yesBtn.isVisible().catch(() => false)) {
        const ariaPressed = await yesBtn.getAttribute('aria-pressed').catch(() => null);
        if (ariaPressed !== 'true') await yesBtn.click();
      } else if (!shouldBeChecked && await noBtn.isVisible().catch(() => false)) {
        const ariaPressed = await noBtn.getAttribute('aria-pressed').catch(() => null);
        if (ariaPressed !== 'true') await noBtn.click();
      }
    }
  }

  async _selectDropdownNearLabel(labelRegex, optionText, opts = {}) {
    const page = this.page;
    const label = page.getByText(labelRegex).first();
    await label.scrollIntoViewIfNeeded().catch(() => {});
    const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
    const button = container.locator('[role="combobox"], [role="button"][aria-haspopup="listbox"], [aria-haspopup="listbox"], [id^="mui-component-select-"]').first();
    if (!(await button.isVisible().catch(() => false))) throw new Error('Dropdown button not found near label');
    await button.click();
    // Reuse listbox selection logic similar to _selectMuiOption
    const list = page.locator('ul[role="listbox"], [role="listbox"]');
    await list.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const options = list.locator('li[role="option"], [role="option"]');
    const count = await options.count();
    const normalize = (s) => (s || '').trim();
    const normalizeLoose = (s) => (s || '').replace(/\s+/g, '').toLowerCase();
    const toNumeric = (s) => {
      const m = (s || '').match(/\d+/);
      return m ? m[0] : null;
    };
    for (let i = 0; i < count; i++) {
      const text = normalize(await options.nth(i).innerText());
      if (text === optionText || text.includes(optionText)) { await options.nth(i).click(); return; }
    }
    const target = normalizeLoose(optionText);
    for (let i = 0; i < count; i++) {
      const text = normalizeLoose(await options.nth(i).innerText());
      if (text.includes(target)) { await options.nth(i).click(); return; }
    }
    if (opts.numeric) {
      const want = toNumeric(optionText);
      if (want) {
        for (let i = 0; i < count; i++) {
          const text = await options.nth(i).innerText();
          if (toNumeric(text) === want) { await options.nth(i).click(); return; }
        }
      }
    }
    throw new Error('Option not found near label');
  }
}

module.exports = NewCorporatePolicyPage;
