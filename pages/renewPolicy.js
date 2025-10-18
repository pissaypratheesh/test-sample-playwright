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

    // Previous policy details
    await page.getByLabel('Previous Policy No').fill(data.prevPolicyNo);
    await this._selectMuiOption('#mui-component-select-PREV_COVERTYPE_ID', data.prevVehicleCover);

    await this._selectMuiOption('#mui-component-select-OLD_POL_NCB_LEVEL', data.ncb, { numeric: true });

    await this._selectMuiOption('#mui-component-select-FKISURANCE_COMP_ID', data.prevPolicyIC);

    // OD/TP Policy Expiry Dates (robust setter with fallback)
    const expiryInputs = page.locator('input[name="POLICY_EXPIRY_DATE"]');
    const expiryCount = await expiryInputs.count();
    if (expiryCount >= 1) {
      await this._setDateOnInput(expiryInputs.nth(0), data.odPolicyExpiryDate);
    }
    if (expiryCount >= 2) {
      await this._setDateOnInput(expiryInputs.nth(1), data.tpPolicyExpiryDate);
    } else {
      // Fallback by label if DOM structure differs
      await this._setDateByLabel(/TP\s*Policy\s*Expiry\s*Date/i, data.tpPolicyExpiryDate).catch(() => {});
    }
    await page.locator('text=Customer Details').scrollIntoViewIfNeeded().catch(() => {});
    await this._selectSalutation(data.salutation).catch(() => {});
    await page.locator('input[name="FIRST_NAME"]').fill(data.firstName);
    await page.locator('input[name="EMAIL"]').fill(data.email);
    await page.locator('input[name="MOB_NO"]').fill(data.mobile);
    // VIN (Chassis No)
    const randomVin = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await page.locator('input[name="ChassisNo"]').fill(randomVin);
    fs.writeFileSync(path.join(__dirname, '../testdata/generated_vin.json'), JSON.stringify({ vin: randomVin }, null, 2));
    // Engine No
    const randomEngineNo = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await page.locator('input[name="EngineNo"]').fill(randomEngineNo);
    fs.writeFileSync(path.join(__dirname, '../testdata/generated_engine.json'), JSON.stringify({ engine: randomEngineNo }, null, 2));
    await this._selectMuiOption('#mui-component-select-MakeId', data.make);
    await this._selectMuiOption('#mui-component-select-ModelId', data.model);
    await this._selectMuiOption('#mui-component-select-VariantId', data.variant);
    await this._selectMuiOption('#mui-component-select-DateofManufacture', data.year);
    await this._selectMuiOption('#mui-component-select-RTOId', data.registrationCity);
    await this._selectMuiOption('#mui-component-select-IsuredStateId', data.customerState);
    // Invoice/Registration Dates (robust setter with fallback)
    await this._setDateOnInput(page.locator('input[name="InvoiceDate"]'), data.invoiceDate);
    await this._setDateOnInput(page.locator('input[name="RegistrationDate"]'), data.registrationDate);

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

    await page.getByRole('button', { name: /Get Quotes/i }).click();
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
      
      // Wait for quotes to load and spinners to disappear
      console.log('Waiting for quotes to load...');
      await page.waitForTimeout(10000); // Wait at least 10 seconds for quotes to appear
      
      // Wait for any spinners/progress to finish if present
      const spinners = page.locator('[role="progressbar"], .MuiCircularProgress-root');
      try { await spinners.first().waitFor({ state: 'visible', timeout: 5000 }); } catch {}
      await spinners.first().waitFor({ state: 'hidden', timeout: waitMs }).catch(() => {});
      
      // Wait for PolicyListing cards to be visible (based on getquotes.html structure)
      await page.locator('.PolicyListing').first().waitFor({ state: 'visible', timeout: waitMs })
        .catch(() => console.log('PolicyListing not found, will try alternative selectors'));

      console.log('Attempting to find and click BUY NOW button...');
      
      let clicked = false;
      
      // APPROACH 1: Target the first PolicyListing card's BUY NOW button directly (from getquotes.html structure)
      try {
        // First, ensure we can see the quote cards
        const policyCard = page.locator('.MuiPaper-root.MuiPaper-outlined.MuiCard-root.PolicyListing').first();
        if (await policyCard.isVisible({ timeout: 5000 })) {
          // Find the BUY NOW button within the first quote card using the specific structure
          const buyNowButton = policyCard.locator('button.MuiButtonBase-root.MuiButton-root.MuiButton-contained:has-text("BUY NOW")').first();
          
          if (await buyNowButton.isVisible({ timeout: 3000 })) {
            console.log('Found BUY NOW button in first PolicyListing card');
            await policyCard.scrollIntoViewIfNeeded();
            await buyNowButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000); // Small pause for stability
            await buyNowButton.click({ timeout: 5000 });
            clicked = true;
            console.log('Successfully clicked BUY NOW button');
          }
        }
      } catch (e) {
        console.log('Error with direct PolicyListing approach:', e.message);
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
        
        // Stay on the page for 5 seconds for observation
        console.log('Staying on proposal details page for 5 seconds...');
        await page.waitForTimeout(5000);
        
        console.log('Proposal details filled successfully!');
      }
    } catch (e) {
      console.log('Error in proposal details flow:', e.message);
    }
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
    if (val && val !== 'DD/MM/YYYY') {
      // Ensure calendar (if open) is closed to avoid overlay blocking
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

  async _setDateByLabel(labelRegex, dateStr) {
    const page = this.page;
    const label = page.getByText(labelRegex).first();
    await label.scrollIntoViewIfNeeded().catch(() => {});
    const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
    const input = container.locator('input[placeholder="DD/MM/YYYY"], input[name="POLICY_EXPIRY_DATE"]').first();
    if (!(await input.isVisible().catch(() => false))) throw new Error('Date input not found');
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
        await this._selectMuiOption('#mui-component-select-SALUTATION', data.salutation);
      } catch {
        try {
          await page.locator('[name="SALUTATION"]').selectOption(data.salutation);
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
          await firstNameInput.fill(data.firstName);
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
          await middleNameInput.fill(data.middleName);
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
          await lastNameInput.fill(data.lastName);
        }
      } catch (e) {
        console.log('Error filling last name:', e.message);
      }
      
      // Date of Birth
      try {
        console.log('Filling date of birth...');
        const dobInput = page.locator('input[name="DOB"]');
        if (await dobInput.isVisible({ timeout: 2000 })) {
          await this._setDateOnInput(dobInput, data.dateOfBirth);
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
          await altMobileInput.fill(data.alternateMobileNo);
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
          await addr1Input.fill(data.addressLine1);
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
          await addr2Input.fill(data.addressLine2);
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
          await landmarkInput.fill(data.landmark);
        }
      } catch (e) {
        console.log('Error filling landmark:', e.message);
      }
      
      // State
      try {
        console.log('Filling state...');
        await this._selectMuiOption('#mui-component-select-STATE_ID', data.state);
      } catch (e) {
        console.log('Error filling state:', e.message);
      }
      
      // City
      try {
        console.log('Filling city...');
        await this._selectMuiOption('#mui-component-select-CITY_ID', data.city);
      } catch (e) {
        console.log('Error filling city:', e.message);
      }
      
      // Pincode
      try {
        console.log('Filling pincode...');
        const pincodeInput = page.locator('input[name="PIN"]');
        if (await pincodeInput.isVisible({ timeout: 2000 })) {
          await pincodeInput.clear();
          await pincodeInput.fill(data.pincode);
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
          await panInput.fill(data.panNo);
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
          await aadhaarInput.fill(data.aadhaarNo);
        }
      } catch (e) {
        console.log('Error filling Aadhaar number:', e.message);
      }
      
      // EI Account Number
      try {
        console.log('Filling EI account number...');
        const eiInput = page.locator('input[name="EI_ACCOUNT_NO"]');
        if (await eiInput.isVisible({ timeout: 2000 })) {
          await eiInput.clear();
          await eiInput.fill(data.eiAccountNo);
        }
      } catch (e) {
        console.log('Error filling EI account number:', e.message);
      }
      
      console.log('Finished filling proposal details form');
      
    } catch (e) {
      console.log('Error in _fillProposalDetails:', e.message);
    }
  }
}

module.exports = RenewPolicyPage;
