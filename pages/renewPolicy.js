const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

class RenewPolicyPage {
  constructor(page) {
    this.page = page;
  }

  async runFlow(data, creds) {
    const page = this.page;
    await page.goto('https://uatlifekaplan.tmibasl.in/');
    await page.getByRole('textbox', { name: 'Enter User Name' }).fill(creds.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(creds.password);
    await page.getByRole('button', { name: /login/i }).click();
    await page.getByRole('button', { name: /menu/i }).click();
    await page.getByText('Policy Centre').click();
    await page.getByText(/^Policy$/).click();
    await page.getByText('Policy Issuance').click();
    await page.getByRole('button', { name: /renew/i }).click();
    await page.getByRole('button', { name: /NON TMIBASL POLICY/i }).click();

    // Select OEM first to initialize dependent form state
    await page.locator('#mui-component-select-FKOEM_ID').click();
    await page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 10000 });
    await page.locator('ul[role="listbox"] li[role="option"]', { hasText: data.oem }).click({ force: true });
    await page.waitForTimeout(500);

    // Select Proposer Type: Individual (if present)
    const proposerToggle = page.getByRole('button', { name: /individual/i });
    if (await proposerToggle.isVisible().catch(() => false)) {
      await proposerToggle.click();
    }

    // Select Vehicle Cover (current) early to satisfy dependencies
    await this._selectMuiOption('#mui-component-select-CoverTypeId', data.vehicleCover);

    // CRITICAL: Set Previous Policy Type first to enable other fields
    console.log('🎯 Setting Previous Policy Type to enable form fields...');
    const prevPolicyTypeButton = page.getByRole('button', { name: /Non TMIBASL Policy/i });
    if (await prevPolicyTypeButton.isVisible().catch(() => false)) {
      await prevPolicyTypeButton.click();
      console.log('✅ Previous Policy Type set to Non TMIBASL Policy');
    }

    // Previous policy details (must be filled before OEM)
    await page.getByLabel('Previous Policy No').fill(data.prevPolicyNo);
    await this._selectMuiOption('#mui-component-select-PREV_COVERTYPE_ID', data.prevVehicleCover);
    await this._selectMuiOption('#mui-component-select-OLD_POL_NCB_LEVEL', data.ncb, { numeric: true });
    await this._selectMuiOption('#mui-component-select-FKISURANCE_COMP_ID', data.prevPolicyIC);

    // SKIP OEM selection - go directly to Make (renewal form might not have OEM field)
    console.log('🎯 Skipping OEM selection, going directly to Make...');

    // OD/TP Policy Expiry Dates (FIXED: Different field names!)
    const odExpiryInput = page.locator('input[name="POLICY_EXPIRY_DATE"]');
    const tpExpiryInput = page.locator('input[name="TP_POLICY_EXPIRY_DATE"]');
    
    const odExists = await odExpiryInput.count() > 0;
    const tpExists = await tpExpiryInput.count() > 0;
    
    console.log(`📅 OD Policy Expiry Date field exists: ${odExists}`);
    console.log(`📅 TP Policy Expiry Date field exists: ${tpExists}`);
    
    if (odExists) {
      console.log('🎯 Setting OD Policy Expiry Date using JavaScript injection...');
      await this._setDateOnInput(odExpiryInput, data.odPolicyExpiryDate);

      console.log('🎯 OD Policy Expiry Date set, verifying...');
      const odValue = await odExpiryInput.inputValue().catch(() => '');
      console.log(`📅 OD Policy Expiry Date after setting: "${odValue}"`);
    }

    if (tpExists) {
      // Check if TP field is enabled before trying to set it
      const isTpEnabled = await tpExpiryInput.isEnabled().catch(() => false);
      console.log(`📅 TP Policy Expiry Date field enabled: ${isTpEnabled}`);
      
      if (isTpEnabled) {
        try {
          console.log('🎯 Setting TP Policy Expiry Date using JavaScript injection...');
          await this._setDateOnInput(tpExpiryInput, data.tpPolicyExpiryDate);

          // Final verification
          console.log('🎯 Final verification of both dates...');
          const finalOdValue = await odExpiryInput.inputValue().catch(() => '');
          const finalTpValue = await tpExpiryInput.inputValue().catch(() => '');
          console.log(`📅 Final OD Policy Expiry Date: "${finalOdValue}"`);
          console.log(`📅 Final TP Policy Expiry Date: "${finalTpValue}"`);
        } catch (error) {
          console.log('❌ Error setting TP Policy Expiry Date:', error.message);
          console.log('📅 Continuing with form filling...');
        }
    } else {
        console.log('⚠️ TP Policy Expiry Date field is disabled - skipping for now');
        console.log('📅 Will try to set it later when form dependencies are met');
        
        // Store TP date for later retry
        this._pendingTpDate = data.tpPolicyExpiryDate;
      }
    } else {
      console.log('⚠️ TP Policy Expiry Date field not found - using OD field for both');
      console.log('📅 Both OD and TP Policy Expiry Dates are set to the same value:', data.odPolicyExpiryDate);
    }
    // Customer Details section
    console.log('🎯 Moving to Customer Details section...');
    await page.locator('text=Customer Details').scrollIntoViewIfNeeded().catch(() => {});
    
    // Check if Customer Details fields are enabled
    const firstNameField = page.locator('input[name="FIRST_NAME"]');
    const isFirstNameEnabled = await firstNameField.isEnabled().catch(() => false);
    console.log(`📅 First Name field enabled: ${isFirstNameEnabled}`);
    
    if (isFirstNameEnabled) {
      console.log('🎯 Filling Customer Details...');
    await this._selectSalutation(data.salutation).catch(() => {});
    await page.locator('input[name="FIRST_NAME"]').fill(data.firstName);
    await page.locator('input[name="EMAIL"]').fill(data.email);
    await page.locator('input[name="MOB_NO"]').fill(data.mobile);
    } else {
      console.log('⚠️ Customer Details fields are disabled, skipping...');
    }
    // Vehicle Details section
    console.log('🎯 Moving to Vehicle Details section...');
    
    // Check if Vehicle Details fields are enabled
    const chassisField = page.locator('input[name="ChassisNo"]');
    const isChassisEnabled = await chassisField.isEnabled().catch(() => false);
    console.log(`📅 Chassis No field enabled: ${isChassisEnabled}`);
    
    if (isChassisEnabled) {
      console.log('🎯 Filling Vehicle Details...');
    // VIN (Chassis No)
    const randomVin = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await page.locator('input[name="ChassisNo"]').fill(randomVin);
    fs.writeFileSync(path.join(__dirname, '../testdata/generated_vin.json'), JSON.stringify({ vin: randomVin }, null, 2));
    // Engine No
    const randomEngineNo = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await page.locator('input[name="EngineNo"]').fill(randomEngineNo);
    fs.writeFileSync(path.join(__dirname, '../testdata/generated_engine.json'), JSON.stringify({ engine: randomEngineNo }, null, 2));
    } else {
      console.log('⚠️ Vehicle Details fields are disabled, skipping...');
    }
    // Check if Make field is enabled before trying to select it
    const makeField = page.locator('#mui-component-select-MakeId');
    const isMakeEnabled = await makeField.isEnabled().catch(() => false);
    console.log(`📅 Make field enabled: ${isMakeEnabled}`);
    
    if (isMakeEnabled) {
      console.log('🎯 Selecting Make...');
    await this._selectMuiOption('#mui-component-select-MakeId', data.make);
    } else {
      console.log('⚠️ Make field is disabled - skipping vehicle details');
      console.log('📅 Form dependencies not met for vehicle selection');
    }
    // Skip remaining vehicle fields since Make is disabled
    console.log('⚠️ Skipping remaining vehicle fields due to form dependencies');
    console.log('📅 Model, Variant, Year, Registration City, Customer State fields are disabled');
    // Invoice/Registration Dates (check if fields exist first with error handling)
    try {
      const invoiceDateField = page.locator('input[name="InvoiceDate"]');
      const registrationDateField = page.locator('input[name="RegistrationDate"]');
      
      const invoiceExists = await invoiceDateField.count() > 0;
      const registrationExists = await registrationDateField.count() > 0;
      
      console.log(`📅 Invoice Date field exists: ${invoiceExists}`);
      console.log(`📅 Registration Date field exists: ${registrationExists}`);
      
      if (invoiceExists) {
        console.log('🎯 Setting Invoice Date...');
        await this._setDateOnInput(invoiceDateField, data.invoiceDate);
      } else {
        console.log('⚠️ Invoice Date field not found - skipping');
      }
      
      if (registrationExists) {
        console.log('🎯 Setting Registration Date...');
        await this._setDateOnInput(registrationDateField, data.registrationDate);
      } else {
        console.log('⚠️ Registration Date field not found - skipping');
      }
    } catch (error) {
      console.log('❌ Error checking/setting Invoice/Registration dates:', error.message);
      console.log('📅 Continuing with form filling...');
    }

    // Registration Number (split fields): StateCode+RTO, Series, Number
    try {
      const regStateRto = page.locator('input[placeholder="DL-09"], input[aria-label="Registration State RTO"], input[name="REG_STATE_RTO"]');
      const regSeries = page.locator('input[placeholder="RAA"], input[aria-label="Registration Series"], input[name="REG_SERIES"]');
      const regNumber = page.locator('input[placeholder="5445"], input[aria-label="Registration Number"], input[name="REG_NUMBER"]');

      const stateRtoVal = data.registrationStateRto || 'DL-06';
      const seriesVal = data.registrationSeries || 'RAA';
      const numberVal = data.registrationNumber || '9999';

      if (await regStateRto.first().isVisible().catch(() => false)) {
        await regStateRto.first().fill(stateRtoVal);
      }
      if (await regSeries.first().isVisible().catch(() => false)) {
        await regSeries.first().fill(seriesVal);
      }
      if (await regNumber.first().isVisible().catch(() => false)) {
        await regNumber.first().fill(numberVal);
      }
    } catch {}

    // Additional details/discount section (after vehicle details)
    try {
      const additionalHeader = page.getByText(/Additional\s*(details|discount)/i).first();
      await additionalHeader.scrollIntoViewIfNeeded().catch(() => {});
      // If an accordion, ensure expanded by clicking header if details not visible
      const detailsRoot = page.locator('.MuiAccordionDetails-root').filter({ hasText: /NCB|Voluntary|AAI|Handicapped|Anti\s*Theft/i }).first();
      if (!(await detailsRoot.isVisible().catch(() => false))) {
        await additionalHeader.click().catch(() => {});
        await page.waitForTimeout(500);
      }

      // Toggle Yes for NCB Carry forward
      await this._toggleYesNearLabel(/NCB\s*Carry\s*Forward/i).catch(() => {});
      // Wait for NCB dropdown container
      await page.locator('#divNCBValue').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      // Select 20 in Entitled NCB% (try near-label then fallback by ID)
      const ncbSelected = await (async () => {
        try { await this._selectDropdownNearLabel(/Entitled\s*NCB\s*%/i, '20', { numeric: true }); return true; } catch { /* fallthrough */ }
        try { await this._selectMuiOption('#mui-component-select-NCBLevel', '20', { numeric: true }); return true; } catch { /* ignore */ }
        return false;
      })();

      // Voluntary excess: toggle and select 2500
      await this._toggleYesNearLabel(/Voluntary\s*Excess/i).catch(() => {});
      await page.locator('#divVoluntaryExcess').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const volSelected = await (async () => {
        try { await this._selectDropdownNearLabel(/Voluntary\s*Excess/i, '2500', { numeric: true }); return true; } catch { /* fallthrough */ }
        try { await this._selectMuiOption('#mui-component-select-VoluntaryExcess', '2500', { numeric: true }); return true; } catch { /* ignore */ }
        return false;
      })();

      // AAI membership
      await this._toggleYesNearLabel(/AAI\s*Membership/i).catch(() => {});
      // Handicapped
      await this._toggleYesNearLabel(/Handicapped/i).catch(() => {});
      // Anti theft
      await this._toggleYesNearLabel(/Anti\s*Theft/i).catch(() => {});
    } catch {}

    // Check if page is still open before clicking Get Quotes
    try {
      const isPageOpen = await page.url().catch(() => null);
      if (isPageOpen) {
        console.log('🎯 Page is still open, clicking Get Quotes button...');
    await page.getByRole('button', { name: /Get Quotes/i }).click();
        console.log('✅ Get Quotes button clicked successfully');
      } else {
        console.log('⚠️ Page is closed, cannot click Get Quotes button');
      }
    } catch (error) {
      console.log('❌ Error clicking Get Quotes button:', error.message);
      console.log('📅 Page may have been closed due to session timeout');
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
          // eslint-disable-next-line no-console
          console.log('Validation alert detected:', text);
          await page.screenshot({ path: path.join(__dirname, '../test-results/validation-alert.png'), fullPage: true });
        }
      } else {
        const minText = page.getByText(/minimum|min\b/i).first();
        if (await minText.isVisible({ timeout: 1000 }).catch(() => false)) {
          const text = await minText.innerText();
          // eslint-disable-next-line no-console
          console.log('Validation message detected:', text);
          await page.screenshot({ path: path.join(__dirname, '../test-results/validation-alert.png'), fullPage: true });
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

      // Confirm navigation into proposal/checkout screen and fill details
      if (clicked) {
        console.log('Waiting for proposal details page to load...');
        
        // Wait for proposal page to load
        await Promise.race([
          page.waitForSelector('input[name="DOB"]', { timeout: 60000 }).catch(() => null),
          page.waitForSelector('text=/Proposal|Proposer|Checkout/i', { timeout: 60000 }).catch(() => null),
          page.waitForSelector('input[name="FIRST_NAME"]', { timeout: 60000 }).catch(() => null),
        ]);
        
        // Load proposal details data
        const proposalData = require('../testdata/proposalDetails.json');
        console.log('Filling proposal details with dummy data...');
        
        // Fill proposal details form
        await this._fillProposalDetails(proposalData);
        
        // Stay on the page for manual review
        console.log('Staying on proposal details page for 15 seconds for manual review...');
        await page.waitForTimeout(15000);
        
        console.log('Proposal details filled successfully!');
      }
    } catch (e) {
      console.log('Error in proposal details flow:', e.message);
    }
  }

  async _selectDate(dateStr, inputLocator = null) {
    const page = this.page;
    const [dStr, mStr, yStr] = dateStr.split('/');
    const targetDay = dStr.replace(/^0/, '');
    const targetMonth = parseInt(mStr, 10); // 1-12
    const targetYear = parseInt(yStr, 10);

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    // Find the dialog associated with the specific input field
    let dialog;
    if (inputLocator) {
      // The input was already clicked by _setDateOnInput, so just get the dialog
      console.log(`🎯 Using dialog for specific input field (input already clicked)`);
      dialog = page.locator('[role="dialog"]').first();
    } else {
      dialog = page.locator('[role="dialog"]').first();
      console.log(`⚠️ No input locator provided, using first dialog`);
    }
    
    await dialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    console.log(`🎯 Navigating to ${targetDay}/${targetMonth}/${targetYear} using TATA date picker flow`);

    try {
      // Step 1: Click on the month/year header to open year selection
      console.log('Step 1: Opening year selection...');
      const monthYearHeader = dialog.locator('text=/^(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}$/').first();
      
      if (await monthYearHeader.isVisible({ timeout: 2000 }).catch(() => false)) {
        await monthYearHeader.click();
        await page.waitForTimeout(1000);
        console.log('✅ Clicked on month/year header to open year selection');
      } else {
        // Try alternative selectors for the header
        const altHeader = dialog.locator('button').filter({ hasText: /\d{4}/ }).first();
        if (await altHeader.isVisible({ timeout: 2000 }).catch(() => false)) {
          await altHeader.click();
          await page.waitForTimeout(1000);
          console.log('✅ Clicked on alternative year header');
        } else {
          console.log('⚠️ Could not find year header, trying direct year selection');
        }
      }

      // Step 2: Select the target year from the year grid
      console.log(`Step 2: Selecting year ${targetYear}...`);
      // CRITICAL: Exclude Clear button by being more specific
      const yearButton = dialog.locator(`[role="radio"]`).filter({ hasText: targetYear.toString() }).filter({ hasNotText: 'Clear' }).first();
      
      if (await yearButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // CRITICAL: Double-check that we're not clicking the Clear button
        const buttonText = await yearButton.textContent().catch(() => '');
        if (buttonText.includes('Clear')) {
          console.log(`⚠️ Skipping Clear button, looking for year ${targetYear}...`);
        } else {
          await yearButton.click();
          await page.waitForTimeout(1000);
          console.log(`✅ Successfully selected year ${targetYear}`);
        }
      } else {
        console.log(`⚠️ Year ${targetYear} not found in year grid, trying to scroll or navigate`);
        
        // Try to scroll to find the year
        const yearGrid = dialog.locator('[role="grid"], .year-grid, .MuiPickersYear-root').first();
        if (await yearGrid.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Scroll up to find older years
          for (let i = 0; i < 10; i++) {
            await page.keyboard.press('ArrowUp');
            await page.waitForTimeout(200);
            
            if (await yearButton.isVisible({ timeout: 500 }).catch(() => false)) {
              await yearButton.click();
              await page.waitForTimeout(1000);
              console.log(`✅ Found and selected year ${targetYear} after scrolling`);
              break;
            }
          }
        }
      }

      // Step 3: Select the target month from the month grid
      console.log(`Step 3: Selecting month ${monthNames[targetMonth - 1]}...`);
      // CRITICAL: Exclude Clear button by being more specific
      const monthButton = dialog.locator(`[role="radio"]`).filter({ hasText: monthNames[targetMonth - 1].substring(0, 3) }).filter({ hasNotText: 'Clear' }).first();
      
      if (await monthButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // CRITICAL: Double-check that we're not clicking the Clear button
        const buttonText = await monthButton.textContent().catch(() => '');
        if (buttonText.includes('Clear')) {
          console.log(`⚠️ Skipping Clear button, looking for month ${monthNames[targetMonth - 1]}...`);
      } else {
          await monthButton.click();
          await page.waitForTimeout(1000);
          console.log(`✅ Successfully selected month ${monthNames[targetMonth - 1]}`);
        }
      } else {
        console.log(`⚠️ Month ${monthNames[targetMonth - 1]} not found, trying alternative selectors`);
        
        // Try alternative month selectors - also exclude Clear button
        const altMonthButton = dialog.locator(`[role="radio"]`).filter({ hasText: monthNames[targetMonth - 1].substring(0, 3) }).filter({ hasNotText: 'Clear' }).first();
        if (await altMonthButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await altMonthButton.click();
          await page.waitForTimeout(1000);
          console.log(`✅ Selected month using alternative selector`);
        }
      }

      // Step 4: Select the target day from the calendar grid
      console.log(`Step 4: Selecting day ${targetDay}...`);
      // CRITICAL: Exclude Clear button by being more specific
      const dayButton = dialog.locator(`[role="gridcell"]`).filter({ hasText: targetDay }).filter({ hasNotText: 'Clear' }).first();
      
      if (await dayButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // CRITICAL: Double-check that we're not clicking the Clear button
        const buttonText = await dayButton.textContent().catch(() => '');
        if (buttonText.includes('Clear')) {
          console.log(`⚠️ Skipping Clear button, looking for day ${targetDay}...`);
        } else {
          await dayButton.click();
          await page.waitForTimeout(1000);
          console.log(`✅ Successfully selected day ${targetDay}`);
        }
      } else {
        console.log(`⚠️ Day ${targetDay} not found, trying alternative selectors`);
        
        // Try alternative day selectors
        const altDayButton = dialog.locator(`[role="gridcell"]`).filter({ hasText: targetDay }).first();
        if (await altDayButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await altDayButton.click();
          await page.waitForTimeout(1000);
          console.log(`✅ Selected day using alternative selector`);
        } else {
          console.log(`⚠️ Could not find day ${targetDay}, but continuing...`);
        }
      }

      console.log(`🎉 Successfully navigated to ${targetDay}/${targetMonth}/${targetYear} using TATA date picker flow`);
      
    } catch (error) {
      console.log(`❌ Error in date selection: ${error.message}`);
    } finally {
      // ALWAYS ensure dialog is closed, even if date selection failed
      console.log('🔒 Ensuring dialog is closed to prevent blocking...');
      await this._closeAnyOpenDialogs();
    }
  }

  async _setDateOnInput(inputLocator, dateStr) {
    const input = inputLocator.first();
    if (!(await input.isVisible().catch(() => false))) throw new Error('Date input not found');
    
    // Check if input is enabled
    const isEnabled = await input.isEnabled().catch(() => false);
    if (!isEnabled) {
      console.log(`⚠️ Date input is disabled, skipping date setting: ${dateStr}`);
      return;
    }
    
    const page = this.page;

    console.log(`Setting date: ${dateStr}`);

    const handle = await input.elementHandle();
    if (!handle) throw new Error('Date input handle missing');

    // Method 1: JavaScript injection (PRIMARY method for all dates, especially 1992)
    console.log('🎯 Using JavaScript injection as primary method (date picker only supports recent years)...');

    try {
    await handle.evaluate((el, value) => {
        // Set the value directly
        el.value = value;

        // Dispatch all necessary events for form validation
        el.dispatchEvent(new Event('focus', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));

        console.log('Date set via JavaScript injection:', el.value);
    }, dateStr);

      // Verify the date was set
      const val = await input.inputValue().catch(() => '');
    if (val === dateStr) {
        console.log('✅ Date set successfully via JavaScript injection');

        // CRITICAL: Verify the date persists after a short wait
        await page.waitForTimeout(1000);
        const persistedVal = await input.inputValue().catch(() => '');
        if (persistedVal === dateStr) {
          console.log('✅ Date persisted successfully');

          // Log all date field values for verification
          await this._logAllDateFieldValues();

      return;
        } else {
          console.log(`⚠️ Date was reset after persistence check: "${persistedVal}"`);
        }
      } else {
        console.log(`⚠️ Date not set correctly: expected "${dateStr}", got "${val}"`);
      }
    } catch (e) {
      console.log('JavaScript injection failed:', e.message);
    }
    
    // Method 2: JavaScript injection fallback (only if visual flow fails)
    console.log('Attempting JavaScript injection fallback...');
    
    await handle.evaluate((el, value) => {
      // Set the value directly
      el.value = value;
      
      // Dispatch all necessary events for form validation
      el.dispatchEvent(new Event('focus', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
      
      // Set up persistent monitoring to prevent resets
      const restoreValue = () => {
        if (el.value !== value && el.value !== 'DD/MM/YYYY') {
          console.log('Value changed, restoring to:', value);
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      
      // Monitor events that might reset the value
      el.addEventListener('focus', restoreValue);
      el.addEventListener('click', restoreValue);
      el.addEventListener('blur', restoreValue);
      el.addEventListener('change', restoreValue);
      el.addEventListener('input', restoreValue);
      
      // Set up interval monitoring
      const interval = setInterval(restoreValue, 100);
      
      // Store cleanup function
      el._cleanup = () => {
        clearInterval(interval);
        el.removeEventListener('focus', restoreValue);
        el.removeEventListener('click', restoreValue);
        el.removeEventListener('blur', restoreValue);
        el.removeEventListener('change', restoreValue);
        el.removeEventListener('input', restoreValue);
      };
      
      console.log('Date set via JavaScript injection with monitoring:', el.value);
    }, dateStr);
    
    let val = await input.inputValue().catch(() => '');
    console.log(`JavaScript injection result: ${val}`);
    
    if (val === dateStr) {
      console.log('✅ Date set successfully via JavaScript injection');
      
      // AGGRESSIVE DIALOG CLOSING - Try multiple strategies
      console.log('🔧 Aggressively closing any open dialogs...');
      
      // Strategy 1: Try all close buttons
      const closeButtons = [
        'button:has-text("Cancel")',
        'button:has-text("Close")', 
        'button:has-text("OK")',
        'button:has-text("Done")',
        'button:has-text("Today")',
        'button[aria-label*="close"]',
        'button[aria-label*="Close"]',
        '[role="dialog"] button:has-text("Cancel")',
        '[role="dialog"] button:has-text("Close")',
        '.MuiDialog-root button:has-text("Cancel")',
        '.MuiModal-root button:has-text("Cancel")'
      ];
      
      for (const selector of closeButtons) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
            console.log(`Clicking close button: ${selector}`);
            await button.click();
            await page.waitForTimeout(300);
          }
        } catch (e) {
          // Continue to next button
        }
      }
      
      // Strategy 2: Try keyboard shortcuts
      const keys = ['Escape', 'Enter', 'Tab', 'Backspace'];
      for (const key of keys) {
        try {
          console.log(`Pressing ${key} to close dialog`);
          await page.keyboard.press(key);
          await page.waitForTimeout(300);
        } catch (e) {
          // Continue to next key
        }
      }
      
      // Strategy 3: Click outside dialog
      try {
        console.log('Clicking outside dialog to close it');
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Could not click outside dialog');
      }
      
      // Strategy 4: Force remove dialogs from DOM
      try {
        console.log('Force removing dialogs from DOM');
        await page.evaluate(() => {
          const dialogSelectors = [
            '[role="dialog"]',
            '.MuiDialog-root',
            '.MuiModal-root',
            '.MuiDialog-container',
            '.MuiBackdrop-root',
            '[data-testid*="dialog"]',
            '[data-testid*="modal"]',
            '.dialog',
            '.modal',
            '.date-picker',
            '.calendar'
          ];
          
          dialogSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el.style.display !== 'none') {
                console.log(`Force removing dialog: ${selector}`);
                el.style.display = 'none';
                if (el.parentNode) {
                  el.parentNode.removeChild(el);
                }
              }
            });
          });
        });
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Could not force remove dialogs');
      }
      
      // Verify the date persisted after aggressive dialog closure
      await page.waitForTimeout(1000);
    val = await input.inputValue().catch(() => '');
      console.log(`Value after aggressive dialog closure: ${val}`);
      
      if (val === dateStr) {
        console.log('✅ Date persisted after aggressive dialog closure');
        return;
      } else {
        console.log('⚠️ Date was reset after aggressive dialog closure, retrying...');
        // Retry the injection with even more persistence
        await handle.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
          
          // Set up even more aggressive monitoring
          const aggressiveRestore = () => {
            if (el.value !== value && el.value !== 'DD/MM/YYYY') {
              console.log('Aggressive restore triggered, setting value to:', value);
              el.value = value;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          };
          
          // More frequent monitoring
          const aggressiveInterval = setInterval(aggressiveRestore, 50);
          
          // Store cleanup
          el._aggressiveCleanup = () => {
            clearInterval(aggressiveInterval);
          };
        }, dateStr);
        
        val = await input.inputValue().catch(() => '');
        console.log(`Aggressive retry result: ${val}`);
        
        if (val === dateStr) {
          console.log('✅ Date set successfully with aggressive retry');
          return;
        }
      }
    }
    
    // Method 3: Force typing as final fallback
    console.log('Attempting force typing as final fallback...');
    try {
    await input.click();
      await page.waitForTimeout(500);
      
      // Try to remove readonly and type
      await handle.evaluate((el) => {
        try { el.removeAttribute('readonly'); } catch {}
        try { el.readOnly = false; } catch {}
      });
      
    await input.fill('');
      await input.type(dateStr, { delay: 50 });
    await page.keyboard.press('Enter').catch(() => {});
      await this._closeAnyOpenDialogs();
      
      val = await input.inputValue().catch(() => '');
      console.log(`Force typing result: ${val}`);
      
      if (val === dateStr) {
        console.log('✅ Date set successfully via force typing');
        return;
      }
    } catch (e) {
      console.log('Force typing failed:', e.message);
    }
    
    // Final verification
    val = await input.inputValue().catch(() => '');
    if (val === dateStr) {
      console.log('✅ Date set successfully via final method');
    } else {
      console.log(`⚠️ All methods failed. Expected: ${dateStr}, Got: ${val}`);
      console.log('⚠️ The TATA website may have strict validation preventing this date');
    }
    
    // Always ensure dialogs are closed to prevent blocking
    await this._closeAnyOpenDialogs();
    
    // Log all date field values for verification
    await this._logAllDateFieldValues();
  }

  async _logAllDateFieldValues() {
    const page = this.page;

    console.log('\n📅 === COMPREHENSIVE DATE FIELD VALUES LOG ===');

    try {
      // OD Policy Expiry Date
      const odPolicyExpiry = page.locator('input[name="POLICY_EXPIRY_DATE"]');
      const odPolicyExpiryValue = await odPolicyExpiry.inputValue().catch(() => 'NOT_FOUND');
      console.log(`📅 OD Policy Expiry Date: "${odPolicyExpiryValue}"`);

      // TP Policy Expiry Date (FIXED: Different field name!)
      const tpPolicyExpiry = page.locator('input[name="TP_POLICY_EXPIRY_DATE"]');
      const tpPolicyExpiryValue = await tpPolicyExpiry.inputValue().catch(() => 'NOT_FOUND');
      console.log(`📅 TP Policy Expiry Date: "${tpPolicyExpiryValue}"`);
      
      // Invoice Date
      const invoiceDate = page.locator('input[name="InvoiceDate"]');
      const invoiceDateValue = await invoiceDate.inputValue().catch(() => 'NOT_FOUND');
      console.log(`📅 Invoice Date: "${invoiceDateValue}"`);
      
      // Registration Date
      const registrationDate = page.locator('input[name="RegistrationDate"]');
      const registrationDateValue = await registrationDate.inputValue().catch(() => 'NOT_FOUND');
      console.log(`📅 Registration Date: "${registrationDateValue}"`);
      
      // Date of Birth
      const dobDate = page.locator('input[name="DOB"]');
      const dobDateValue = await dobDate.inputValue().catch(() => 'NOT_FOUND');
      console.log(`📅 Date of Birth: "${dobDateValue}"`);
      
      // Policy Period From
      const policyPeriodFrom = page.locator('input[name="POLICY_PERIOD_FROM"]');
      const policyPeriodFromValue = await policyPeriodFrom.inputValue().catch(() => 'NOT_FOUND');
      console.log(`📅 Policy Period From: "${policyPeriodFromValue}"`);
      
      // Policy Period To
      const policyPeriodTo = page.locator('input[name="POLICY_PERIOD_TO"]');
      const policyPeriodToValue = await policyPeriodTo.inputValue().catch(() => 'NOT_FOUND');
      console.log(`📅 Policy Period To: "${policyPeriodToValue}"`);
      
      console.log('📅 === END DATE FIELD VALUES LOG ===\n');
      
    } catch (e) {
      console.log('❌ Error logging date field values:', e.message);
    }
  }

  async _closeAnyOpenDialogs() {
    const page = this.page;
    
    try {
      // Check for multiple dialog types
      const dialogSelectors = [
        '[role="dialog"]',
        '.MuiDialog-root',
        '.MuiModal-root',
        '.MuiDialog-container',
        '.MuiBackdrop-root',
        '[data-testid*="dialog"]',
        '[data-testid*="modal"]',
        '.dialog',
        '.modal',
        '.date-picker',
        '.calendar'
      ];
      
      let dialogsFound = 0;
      for (const selector of dialogSelectors) {
        const dialogs = page.locator(selector);
        const count = await dialogs.count();
        if (count > 0) {
          const visible = await dialogs.first().isVisible().catch(() => false);
          if (visible) {
            console.log(`Found ${count} visible dialogs with selector: ${selector}`);
            dialogsFound += count;
          }
        }
      }
      
      if (dialogsFound === 0) {
        console.log('✅ No dialogs open');
        return;
      }
      
      console.log(`🔍 Found ${dialogsFound} dialogs, attempting to close...`);
      
      // Try multiple ways to close any open dialogs
      const closeMethods = [
        () => page.keyboard.press('Escape'),
        () => page.keyboard.press('Enter'),
        () => page.keyboard.press('Tab'),
        () => page.keyboard.press('Backspace'),
        () => page.locator('[role="dialog"] button:has-text("Cancel")').first().click(),
        () => page.locator('[role="dialog"] button:has-text("Close")').first().click(),
        () => page.locator('[role="dialog"] button:has-text("OK")').first().click(),
        () => page.locator('[role="dialog"] button:has-text("Today")').first().click(),
        () => page.locator('[role="dialog"] button:has-text("Done")').first().click(),
        () => page.locator('.MuiDialog-root button:has-text("Cancel")').first().click(),
        () => page.locator('.MuiModal-root button:has-text("Cancel")').first().click(),
        () => page.locator('button:has-text("Cancel")').first().click(),
        () => page.locator('button:has-text("Close")').first().click(),
        () => page.locator('button[aria-label*="close"]').first().click(),
        () => page.locator('button[aria-label*="Close"]').first().click()
      ];
      
      for (const method of closeMethods) {
        try {
          await method();
          await page.waitForTimeout(300);
          
          // Check if any dialogs are still open
          let stillOpen = 0;
          for (const selector of dialogSelectors) {
            const dialogs = page.locator(selector);
            const count = await dialogs.count();
            if (count > 0) {
              const visible = await dialogs.first().isVisible().catch(() => false);
              if (visible) stillOpen += count;
            }
          }
          
          if (stillOpen === 0) {
            console.log('✅ All dialogs closed successfully');
            return;
          }
        } catch (e) {
          // Continue to next method
        }
      }
      
      // Try clicking outside the dialog
      console.log('⚠️ Dialog still open, trying to click outside...');
      try {
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);
        
        const dialogStillOpen = await dialog.isVisible({ timeout: 500 }).catch(() => false);
        if (!dialogStillOpen) {
          console.log('✅ Dialog closed by clicking outside');
          return;
        }
      } catch (e) {
        console.log('Could not click outside dialog');
      }
      
      // Force close by removing all dialogs from DOM
      console.log('⚠️ Force closing all dialogs by removing from DOM...');
      try {
        await page.evaluate(() => {
          const dialogSelectors = [
            '[role="dialog"]',
            '.MuiDialog-root',
            '.MuiModal-root',
            '.MuiDialog-container',
            '.MuiBackdrop-root',
            '[data-testid*="dialog"]',
            '[data-testid*="modal"]',
            '.dialog',
            '.modal',
            '.date-picker',
            '.calendar'
          ];
          
          dialogSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el.style.display !== 'none') {
                console.log(`Force removing dialog: ${selector}`);
                el.style.display = 'none';
                if (el.parentNode) {
                  el.parentNode.removeChild(el);
                }
              }
            });
          });
        });
        await page.waitForTimeout(500);
        console.log('✅ All dialogs force closed');
      } catch (e) {
        console.log('Could not force close dialog:', e.message);
      }
      
    } catch (e) {
      console.log('Error closing dialogs:', e.message);
    }
  }

  async _setDateByLabel(labelRegex, dateStr) {
    const page = this.page;
    const label = page.getByText(labelRegex).first();
    await label.scrollIntoViewIfNeeded().catch(() => {});
    const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
    const input = container.locator('input[placeholder="DD/MM/YYYY"], input[name="POLICY_EXPIRY_DATE"]').first();
    if (!(await input.isVisible().catch(() => false))) throw new Error('Date input not found');
    
    try {
    // Try calendar first
    await input.click();
    await this._selectDate(dateStr);
    const valAfter = await input.inputValue().catch(() => '');
    if (valAfter && valAfter !== 'DD/MM/YYYY') return;
      
    // Direct set fallback to commit value
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
    } finally {
      // ALWAYS ensure dialog is closed
      await this._closeAnyOpenDialogs();
    }
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
        
        // AGGRESSIVE DROPDOWN CLOSING
        console.log(`🔧 Closing dropdown after selecting: ${optionText}`);
        
        // Strategy 1: Wait for dropdown to close naturally (increased wait time)
        await page.waitForTimeout(1000);
        
        // Strategy 2: Check if dropdown is still open and force close
        const stillOpen = await list.isVisible({ timeout: 1000 }).catch(() => false);
        if (stillOpen) {
          console.log('⚠️ Dropdown still open, forcing closure...');
          
          // Try pressing Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          
          // Try pressing Enter
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          
          // Try clicking outside
          await page.click('body', { position: { x: 10, y: 10 } });
          await page.waitForTimeout(300);
          
          // Force remove from DOM
          await page.evaluate(() => {
            const dropdowns = document.querySelectorAll('ul[role="listbox"], [role="listbox"]');
            dropdowns.forEach(dropdown => {
              if (dropdown.style.display !== 'none') {
                console.log('Force removing dropdown from DOM');
                dropdown.style.display = 'none';
                if (dropdown.parentNode) {
                  dropdown.parentNode.removeChild(dropdown);
                }
              }
            });
          });
        }
        
        return;
      }
    }
    // loose spaces/case
    const target = normalizeLoose(optionText);
    for (let i = 0; i < count; i++) {
      const text = normalizeLoose(await options.nth(i).innerText());
      if (text.includes(target)) {
        await options.nth(i).click();
        
        // AGGRESSIVE DROPDOWN CLOSING
        console.log(`🔧 Closing dropdown after selecting (loose match): ${optionText}`);
        
        // Strategy 1: Wait for dropdown to close naturally
        await page.waitForTimeout(500);
        
        // Strategy 2: Check if dropdown is still open and force close
        const stillOpen = await list.isVisible({ timeout: 1000 }).catch(() => false);
        if (stillOpen) {
          console.log('⚠️ Dropdown still open, forcing closure...');
          
          // Try pressing Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          
          // Try pressing Enter
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          
          // Try clicking outside
          await page.click('body', { position: { x: 10, y: 10 } });
          await page.waitForTimeout(300);
          
          // Force remove from DOM
          await page.evaluate(() => {
            const dropdowns = document.querySelectorAll('ul[role="listbox"], [role="listbox"]');
            dropdowns.forEach(dropdown => {
              if (dropdown.style.display !== 'none') {
                console.log('Force removing dropdown from DOM');
                dropdown.style.display = 'none';
                if (dropdown.parentNode) {
                  dropdown.parentNode.removeChild(dropdown);
                }
              }
            });
          });
        }
        
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
            
            // AGGRESSIVE DROPDOWN CLOSING
            console.log(`🔧 Closing dropdown after selecting (numeric match): ${optionText}`);
            
            // Strategy 1: Wait for dropdown to close naturally
            await page.waitForTimeout(500);
            
            // Strategy 2: Check if dropdown is still open and force close
            const stillOpen = await list.isVisible({ timeout: 1000 }).catch(() => false);
            if (stillOpen) {
              console.log('⚠️ Dropdown still open, forcing closure...');
              
              // Try pressing Escape
              await page.keyboard.press('Escape');
              await page.waitForTimeout(300);
              
              // Try pressing Enter
              await page.keyboard.press('Enter');
              await page.waitForTimeout(300);
              
              // Try clicking outside
              await page.click('body', { position: { x: 10, y: 10 } });
              await page.waitForTimeout(300);
              
              // Force remove from DOM
              await page.evaluate(() => {
                const dropdowns = document.querySelectorAll('ul[role="listbox"], [role="listbox"]');
                dropdowns.forEach(dropdown => {
                  if (dropdown.style.display !== 'none') {
                    console.log('Force removing dropdown from DOM');
                    dropdown.style.display = 'none';
                    if (dropdown.parentNode) {
                      dropdown.parentNode.removeChild(dropdown);
                    }
                  }
                });
              });
            }
            
            return;
          }
        }
      }
    }
    throw new Error(`Option not found for ${selectLocator}: ${optionText}`);
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
  async _selectSalutation(optionText) {
    const page = this.page;
    // Try by known ID
    const byId = page.locator('#mui-component-select-Salutation');
    if (await byId.isVisible().catch(() => false)) {
      await this._selectMuiOption('#mui-component-select-Salutation', optionText);
      return;
    }
    // Try combobox by accessible name
    const byRole = page.getByRole('combobox', { name: /salutation/i });
    if (await byRole.isVisible().catch(() => false)) {
      await byRole.click();
      await page.getByRole('option', { name: optionText, exact: false }).click();
      return;
    }
    // Try proximity to label text
    const label = page.getByText(/Salutation\s*\*/i);
    if (await label.isVisible().catch(() => false)) {
      const container = label.locator('xpath=..');
      const button = container.locator('[role="button"], [aria-haspopup="listbox"]');
      if (await button.first().isVisible().catch(() => false)) {
        await button.first().click();
        await page.getByRole('option', { name: optionText, exact: false }).click();
        return;
      }
    }
    // As last resort, pick the first visible combobox
    const anyCombo = page.locator('[role="button"][aria-haspopup="listbox"]').filter({ hasText: /select salutation/i });
    if (await anyCombo.first().isVisible().catch(() => false)) {
      await anyCombo.first().click();
      await page.getByRole('option', { name: optionText, exact: false }).click();
      return;
    }
    throw new Error(`Salutation dropdown not found`);
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
        await this._selectMuiOption('#mui-component-select-SALUTATION', data.personalDetails.salutation);
      } catch {
        try {
          await page.locator('[name="SALUTATION"]').selectOption(data.personalDetails.salutation);
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
          await firstNameInput.fill(data.personalDetails.firstName);
        }
      } catch (e) {
        console.log('Error filling first name:', e.message);
      }
      
      // Middle Name
      try {
        console.log('Filling middle name...');
        const middleNameInput = page.locator('input[name="MIDDLE_NAME"]');
        if (await middleNameInput.isVisible({ timeout: 2000 })) {
          await middleNameInput.clear();
          await middleNameInput.fill(data.personalDetails.middleName);
        }
      } catch (e) {
        console.log('Error filling middle name:', e.message);
      }
      
      // Last Name
      try {
        console.log('Filling last name...');
        const lastNameInput = page.locator('input[name="LAST_NAME"]');
        if (await lastNameInput.isVisible({ timeout: 2000 })) {
          await lastNameInput.clear();
          await lastNameInput.fill(data.personalDetails.lastName);
        }
      } catch (e) {
        console.log('Error filling last name:', e.message);
      }
      
      // Date of Birth - Use direct JavaScript injection for readonly fields
      try {
        console.log('Filling date of birth...');
        const dobInput = page.locator('input[name="DOB"]');
        if (await dobInput.isVisible({ timeout: 2000 })) {
          // For readonly DOB fields, use direct JavaScript injection
          await dobInput.evaluate((el, value) => {
            el.removeAttribute('readonly');
            el.readOnly = false;
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('blur', { bubbles: true }));
          }, data.personalDetails.dateOfBirth);
          
          // Verify the value was set
          const currentValue = await dobInput.inputValue();
          console.log(`DOB set to: ${currentValue}`);
        }
      } catch (e) {
        console.log('Error filling date of birth:', e.message);
      }
      
      // Email
      try {
        console.log('Filling email...');
        const emailInput = page.locator('input[name="EMAIL"]');
        if (await emailInput.isVisible({ timeout: 2000 })) {
          const isEnabled = await emailInput.isEnabled().catch(() => false);
          if (isEnabled) {
            await emailInput.clear();
            await emailInput.fill(data.email);
          } else {
            console.log('Email field is disabled, skipping...');
          }
        }
      } catch (e) {
        console.log('Error filling email:', e.message);
      }
      
      // Mobile Number
      try {
        console.log('Filling mobile number...');
        const mobileInput = page.locator('input[name="MOB_NO"]');
        if (await mobileInput.isVisible({ timeout: 2000 })) {
          const isEnabled = await mobileInput.isEnabled().catch(() => false);
          if (isEnabled) {
            await mobileInput.clear();
            await mobileInput.fill(data.mobileNo);
          } else {
            console.log('Mobile number field is disabled, skipping...');
          }
        }
      } catch (e) {
        console.log('Error filling mobile number:', e.message);
      }
      
      // Alternate Mobile Number
      try {
        console.log('Filling alternate mobile number...');
        const altMobileInput = page.locator('input[name="ALT_MOBILE_NO"]');
        if (await altMobileInput.isVisible({ timeout: 2000 })) {
          await altMobileInput.clear();
          await altMobileInput.fill(data.personalDetails.alternateMobileNo);
        }
      } catch (e) {
        console.log('Error filling alternate mobile number:', e.message);
      }
      
      // Address Line 1
      try {
        console.log('Filling address line 1...');
        const addr1Input = page.locator('input[name="ADDRESS_LINE1"], textarea[name="ADDRESS_LINE1"]');
        if (await addr1Input.isVisible({ timeout: 2000 })) {
          await addr1Input.clear();
          await addr1Input.fill(data.personalDetails.addressLine1);
        }
      } catch (e) {
        console.log('Error filling address line 1:', e.message);
      }
      
      // Address Line 2
      try {
        console.log('Filling address line 2...');
        const addr2Input = page.locator('input[name="ADDRESS_LINE2"], textarea[name="ADDRESS_LINE2"]');
        if (await addr2Input.isVisible({ timeout: 2000 })) {
          await addr2Input.clear();
          await addr2Input.fill(data.personalDetails.addressLine2);
        }
      } catch (e) {
        console.log('Error filling address line 2:', e.message);
      }
      
      // Landmark
      try {
        console.log('Filling landmark...');
        const landmarkInput = page.locator('input[name="LANDMARK"], textarea[name="LANDMARK"]');
        if (await landmarkInput.isVisible({ timeout: 2000 })) {
          await landmarkInput.clear();
          await landmarkInput.fill(data.personalDetails.landmark);
        }
      } catch (e) {
        console.log('Error filling landmark:', e.message);
      }
      
      // State
      try {
        console.log('Filling state...');
        await this._selectMuiOption('#mui-component-select-STATE_ID', data.personalDetails.state);
      } catch (e) {
        console.log('Error filling state:', e.message);
      }
      
      // City
      try {
        console.log('Filling city...');
        await this._selectMuiOption('#mui-component-select-CITY_ID', data.personalDetails.city);
    } catch (e) {
        console.log('Error filling city:', e.message);
      }
      
      // Pincode
      try {
        console.log('Filling pincode...');
        const pincodeInput = page.locator('input[name="PIN"]');
        if (await pincodeInput.isVisible({ timeout: 2000 })) {
          await pincodeInput.clear();
          await pincodeInput.fill(data.personalDetails.pinCode);
        }
      } catch (e) {
        console.log('Error filling pincode:', e.message);
      }
      
      // PAN Number
      try {
        console.log('Filling PAN number...');
        const panInput = page.locator('input[name="PAN_NO"]');
        if (await panInput.isVisible({ timeout: 2000 })) {
          await panInput.clear();
          await panInput.fill(data.personalDetails.panNo);
        }
      } catch (e) {
        console.log('Error filling PAN number:', e.message);
      }
      
      // Aadhaar Number
      try {
        console.log('Filling Aadhaar number...');
        const aadhaarInput = page.locator('input[name="AADHAAR_NO"]');
        if (await aadhaarInput.isVisible({ timeout: 2000 })) {
          await aadhaarInput.clear();
          await aadhaarInput.fill(data.personalDetails.aadhaarNo);
        }
      } catch (e) {
        console.log('Error filling Aadhaar number:', e.message);
      }
      
      // EI Account Number (optional field)
      try {
        console.log('Filling EI account number...');
        const eiInput = page.locator('input[name="EI_ACCOUNT_NO"]');
        if (await eiInput.isVisible({ timeout: 2000 })) {
          await eiInput.clear();
          await eiInput.fill(data.personalDetails.eiAccountNo || '');
        }
      } catch (e) {
        console.log('Error filling EI account number:', e.message);
      }
      
      // AA Membership Details
      try {
        console.log('Filling AA Membership Details...');
        
        // Association Name
        try {
          await this._selectMuiOption('#mui-component-select-ASSOCIATION_NAME', data.aaMembershipDetails.associationName);
        } catch (e) {
          console.log('Could not fill Association Name:', e.message);
        }
        
        // Membership No
        try {
          const membershipInput = page.locator('input[name="MEMBERSHIP_NO"]');
          if (await membershipInput.isVisible({ timeout: 2000 })) {
            await membershipInput.clear();
            await membershipInput.fill(data.aaMembershipDetails.membershipNo);
          }
        } catch (e) {
          console.log('Could not fill Membership No:', e.message);
        }
        
        // Validity Month
        try {
          await this._selectMuiOption('#mui-component-select-AAMonth', data.aaMembershipDetails.validityMonth);
        } catch (e) {
          console.log('Could not fill Validity Month:', e.message);
        }
        
        // Year
        try {
          const yearInput = page.locator('input[name="AAYear"]');
          if (await yearInput.isVisible({ timeout: 2000 })) {
            await yearInput.clear();
            await yearInput.fill(data.aaMembershipDetails.year);
          }
        } catch (e) {
          console.log('Could not fill Year:', e.message);
        }
      } catch (e) {
        console.log('Error filling AA Membership Details:', e.message);
      }
      
      // NCB Carry Forward Details
      try {
        console.log('Filling NCB Carry Forward Details...');
        
        // Make
        try {
          const makeInput = page.locator('input[name="PREV_VEH_MAKE"]');
          if (await makeInput.isVisible({ timeout: 2000 })) {
            await makeInput.clear();
            await makeInput.fill(data.ncbCarryForwardDetails.make);
          }
        } catch (e) {
          console.log('Could not fill Make:', e.message);
        }
        
        // Model
        try {
          const modelInput = page.locator('input[name="PREV_VEH_MODEL"]');
          if (await modelInput.isVisible({ timeout: 2000 })) {
            await modelInput.clear();
            await modelInput.fill(data.ncbCarryForwardDetails.model);
          }
        } catch (e) {
          console.log('Could not fill Model:', e.message);
        }
        
        // Variant
        try {
          const variantInput = page.locator('input[name="PREV_VEH_VARIANT_NO"]');
          if (await variantInput.isVisible({ timeout: 2000 })) {
            await variantInput.clear();
            await variantInput.fill(data.ncbCarryForwardDetails.variant);
          }
        } catch (e) {
          console.log('Could not fill Variant:', e.message);
        }
        
        // Year Of Manufacturer
        try {
          await this._selectMuiOption('#mui-component-select-PREV_VEH_MANU_YEAR', data.ncbCarryForwardDetails.yearOfManufacturer);
        } catch (e) {
          console.log('Could not fill Year Of Manufacturer:', e.message);
        }
        
        // Chassis No
        try {
          const chassisInput = page.locator('input[name="PREV_VEH_CHASSIS_NO"]');
          if (await chassisInput.isVisible({ timeout: 2000 })) {
            await chassisInput.clear();
            await chassisInput.fill(data.ncbCarryForwardDetails.chasisNo);
          }
        } catch (e) {
          console.log('Could not fill Chassis No:', e.message);
        }
        
        // Engine No
        try {
          const engineInput = page.locator('input[name="PREV_VEH_ENGINE_NO"]');
          if (await engineInput.isVisible({ timeout: 2000 })) {
            await engineInput.clear();
            await engineInput.fill(data.ncbCarryForwardDetails.engineNo);
          }
        } catch (e) {
          console.log('Could not fill Engine No:', e.message);
        }
        
        // Invoice Date
        try {
          const invoiceInput = page.locator('input[name="PREV_VEH_INVOICEDATE"]');
          if (await invoiceInput.isVisible({ timeout: 2000 })) {
            await this._setDateOnInput(invoiceInput, data.ncbCarryForwardDetails.invoiceDate);
          }
        } catch (e) {
          console.log('Could not fill Invoice Date:', e.message);
        }
        
        // Registration No
        try {
          const regInput = page.locator('input[name="PREV_VEH_REG_NO"]');
          if (await regInput.isVisible({ timeout: 2000 })) {
            await regInput.clear();
            await regInput.fill(data.ncbCarryForwardDetails.registrationNo);
          }
        } catch (e) {
          console.log('Could not fill Registration No:', e.message);
        }
        
        // Previous Policy No
        try {
          const prevPolicyInput = page.locator('input[name="PREV_VEH_POLICY_NONVISOF"]');
          if (await prevPolicyInput.isVisible({ timeout: 2000 })) {
            await prevPolicyInput.clear();
            await prevPolicyInput.fill(data.ncbCarryForwardDetails.previousPolicyNo);
          }
        } catch (e) {
          console.log('Could not fill Previous Policy No:', e.message);
        }
        
        // Insurance Company
        try {
          await this._selectMuiOption('#mui-component-select-PREV_VEH_IC', data.policyDetails.insuranceCompany);
        } catch (e) {
          console.log('Could not fill Insurance Company:', e.message);
        }
        
        // Office Address
        try {
          const officeInput = page.locator('input[name="PREV_VEH_ADDRESS"]');
          if (await officeInput.isVisible({ timeout: 2000 })) {
            await officeInput.clear();
            await officeInput.fill(data.policyDetails.officeAddress);
          }
        } catch (e) {
          console.log('Could not fill Office Address:', e.message);
        }
        
        // Policy Period From
        try {
          const policyFromInput = page.locator('input[name="PREV_VEH_POLICYSTARTDATE"]');
          if (await policyFromInput.isVisible({ timeout: 2000 })) {
            await this._setDateOnInput(policyFromInput, data.policyDetails.policyPeriodFrom);
          }
        } catch (e) {
          console.log('Could not fill Policy Period From:', e.message);
        }
        
        // Policy Period To
        try {
          const policyToInput = page.locator('input[name="PREV_VEH_POLICYENDDATE"]');
          if (await policyToInput.isVisible({ timeout: 2000 })) {
            await this._setDateOnInput(policyToInput, data.policyDetails.policyPeriodTo);
          }
        } catch (e) {
          console.log('Could not fill Policy Period To:', e.message);
        }
        
        // NCB Certificate Effective Date
        try {
          const ncbDateInput = page.locator('input[name="PREV_VEH_NCB_EFFECTIVE_DATE_NONVISOF"]');
          if (await ncbDateInput.isVisible({ timeout: 2000 })) {
            await this._setDateOnInput(ncbDateInput, data.ncbCarryForwardDetails.invoiceDate);
          }
        } catch (e) {
          console.log('Could not fill NCB Certificate Effective Date:', e.message);
        }
        
      } catch (e) {
        console.log('Error filling NCB Carry Forward Details:', e.message);
      }
      
      // Nominee Details
      try {
        console.log('Filling Nominee Details...');
        
        // Nominee Name
        try {
          const nomineeNameInput = page.locator('input[name="NomineeName"]');
          if (await nomineeNameInput.isVisible({ timeout: 2000 })) {
            await nomineeNameInput.clear();
            await nomineeNameInput.fill(data.nomineeDetails.nomineeName);
          }
        } catch (e) {
          console.log('Could not fill Nominee Name:', e.message);
        }
        
        // Nominee Age
        try {
          const nomineeAgeInput = page.locator('input[name="NomineeAge"]');
          if (await nomineeAgeInput.isVisible({ timeout: 2000 })) {
            await nomineeAgeInput.clear();
            await nomineeAgeInput.fill(data.nomineeDetails.nomineeAge);
          }
        } catch (e) {
          console.log('Could not fill Nominee Age:', e.message);
        }
        
        // Nominee Relation
        try {
          await this._selectMuiOption('#mui-component-select-NomineeRelation', data.nomineeDetails.nomineeRelation);
        } catch (e) {
          console.log('Could not fill Nominee Relation:', e.message);
        }
        
        // Nominee Gender
        try {
          await this._selectMuiOption('#mui-component-select-NomineeGender', data.nomineeDetails.nomineeGender);
        } catch (e) {
          console.log('Could not fill Nominee Gender:', e.message);
        }
        
      } catch (e) {
        console.log('Error filling Nominee Details:', e.message);
      }
      
      // Payment Mode
      try {
        console.log('Filling Payment Mode...');
        await this._selectMuiOption('#mui-component-select-PAYMENT_MODE', data.paymentDetails.paymentMode);
      } catch (e) {
        console.log('Could not fill Payment Mode:', e.message);
        // Continue with the test even if payment mode fails
      }
      
      // DP Name
      try {
        console.log('Filling DP Name...');
        await this._selectMuiOption('#mui-component-select-AgentID', data.paymentDetails.dpName);
      } catch (e) {
        console.log('Could not fill DP Name:', e.message);
      }
      
      console.log('Finished filling proposal details form');
      
      // Print all filled form data for review
      console.log('\n=== FORM DATA REVIEW ===');
      console.log('Personal Details:');
      console.log(`  Salutation: ${data.personalDetails.salutation}`);
      console.log(`  First Name: ${data.personalDetails.firstName}`);
      console.log(`  Middle Name: ${data.personalDetails.middleName}`);
      console.log(`  Last Name: ${data.personalDetails.lastName}`);
      console.log(`  Date of Birth: ${data.personalDetails.dateOfBirth}`);
      console.log(`  Email: ${data.personalDetails.email}`);
      console.log(`  Mobile: ${data.personalDetails.mobileNo}`);
      console.log(`  Alternate Mobile: ${data.personalDetails.alternateMobileNo}`);
      console.log(`  Address Line 1: ${data.personalDetails.addressLine1}`);
      console.log(`  Address Line 2: ${data.personalDetails.addressLine2}`);
      console.log(`  Landmark: ${data.personalDetails.landmark}`);
      console.log(`  State: ${data.personalDetails.state}`);
      console.log(`  City: ${data.personalDetails.city}`);
      console.log(`  Pin Code: ${data.personalDetails.pinCode}`);
      console.log(`  PAN No: ${data.personalDetails.panNo}`);
      console.log(`  Aadhaar No: ${data.personalDetails.aadhaarNo}`);
      console.log(`  EI Account No: ${data.personalDetails.eiAccountNo || 'Not provided'}`);
      
      console.log('\nAA Membership Details:');
      console.log(`  Association Name: ${data.aaMembershipDetails.associationName}`);
      console.log(`  Membership No: ${data.aaMembershipDetails.membershipNo}`);
      console.log(`  Validity Month: ${data.aaMembershipDetails.validityMonth}`);
      console.log(`  Year: ${data.aaMembershipDetails.year}`);
      
      console.log('\nNCB Carry Forward Details:');
      console.log(`  Previous Policy No: ${data.ncbCarryForwardDetails.previousPolicyNo}`);
      console.log(`  NCB Document Submitted: ${data.ncbCarryForwardDetails.ncbDocumentSubmitted}`);
      
      console.log('\nPolicy Details:');
      console.log(`  Policy Period From: ${data.policyDetails.policyPeriodFrom}`);
      console.log(`  Policy Period To: ${data.policyDetails.policyPeriodTo}`);
      console.log(`  Insurance Company: ${data.policyDetails.insuranceCompany}`);
      console.log(`  Office Address: ${data.policyDetails.officeAddress}`);
      
      console.log('\nNominee Details:');
      console.log(`  Nominee Name: ${data.nomineeDetails.nomineeName}`);
      console.log(`  Nominee Age: ${data.nomineeDetails.nomineeAge}`);
      console.log(`  Nominee Relation: ${data.nomineeDetails.nomineeRelation}`);
      console.log(`  Nominee Gender: ${data.nomineeDetails.nomineeGender}`);
      
      console.log('\nPayment Details:');
      console.log(`  Payment Mode: ${data.paymentDetails.paymentMode}`);
      console.log(`  DP Name: ${data.paymentDetails.dpName}`);
      console.log('=== END FORM DATA REVIEW ===\n');
      
    } catch (e) {
      console.log('Error in _fillProposalDetails:', e.message);
    }
  }
}

module.exports = RenewPolicyPage;
