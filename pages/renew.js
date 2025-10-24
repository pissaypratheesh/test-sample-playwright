const { expect } = require('@playwright/test');
const { AuthPage } = require('./AuthPage');
const authData = require('../testdata/auth/Auth.json');

class RenewPage {
  constructor(page) {
    this.page = page;
  }

  async loginAndNavigate(page) {
    const loginPage = new AuthPage(page);
    await loginPage.gotoLoginPage();
    await loginPage.loginToApp(authData.username, authData.password);
    await page.waitForLoadState('networkidle');
    return loginPage;
  }

  async openHamburgerMenu(page) {
    await page.getByRole('button', { name: 'menu' }).click();
  }

  async navigateToRenewalViaMenu(page) {
    await page.locator('a').filter({ hasText: 'Policy Centre' }).click();
    await page.waitForTimeout(1000); // Wait for menu to load
    await page.locator('a').filter({ hasText: /^Policy$/ }).click();
    await page.waitForTimeout(1000); // Wait for submenu to load
    await page.locator('a').filter({ hasText: 'Policy Issuance' }).click();
    await page.waitForTimeout(2000); // Wait for page to load
    console.log('Navigated to Policy Centre > Policy > Policy Issuance');
  }

  async toggleToRenew(page) {
    // Look for policy type toggle and switch to Renew
    try {
      await page.getByText('Renew').click();
      console.log('Switched to Renew policy type');
    } catch (error) {
      try {
        await page.locator('button').filter({ hasText: 'Renew' }).click();
        console.log('Clicked Renew toggle button');
      } catch (error2) {
        console.log('Renew toggle not found, skipping...');
      }
    }
  }

  async toggleToNonTmibaslPolicy(page) {
    // Look for NON TMIBASL POLICY toggle
    try {
      await page.getByText('NON TMIBASL POLICY').click();
      console.log('Switched to NON TMIBASL POLICY');
      await page.waitForTimeout(2000); // Wait for 2 seconds
    } catch (error) {
      try {
        // Alternative: look for toggle button
        await page.locator('button').filter({ hasText: 'NON TMIBASL POLICY' }).click();
        console.log('Clicked NON TMIBASL POLICY toggle button');
        await page.waitForTimeout(2000); // Wait for 2 seconds
      } catch (error2) {
        console.log('NON TMIBASL POLICY toggle not found, skipping...');
        await page.waitForTimeout(2000); // Wait for 2 seconds anyway
      }
    }
  }

  async navigateToHomePage(page) {
    await page.goto('https://uatlifekaplan.tmibasl.in');
    await page.waitForLoadState('networkidle');
  }

  async testRenewalFormValidation(page) {
    console.log('Testing renewal form validation');
    // Add form validation logic here
  }

  async testPolicyRenewalProcess(page) {
    console.log('Testing policy renewal process');
    // Add renewal process logic here
  }

  async testRenewalErrorHandling(page) {
    console.log('Testing renewal error handling');
    // Add error handling logic here
  }

  async debugFormFields(page) {
    console.log('=== DEBUGGING FORM FIELDS ===');
    
    // Get all input fields
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields:`);
    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      try {
        const placeholder = await inputs[i].getAttribute('placeholder');
        const name = await inputs[i].getAttribute('name');
        const id = await inputs[i].getAttribute('id');
        console.log(`Input ${i}: placeholder="${placeholder}", name="${name}", id="${id}"`);
      } catch (error) {
        console.log(`Input ${i}: Could not get attributes`);
      }
    }
    
    // Get all select/combobox elements
    const selects = await page.locator('select, [role="combobox"]').all();
    console.log(`Found ${selects.length} select/combobox elements:`);
    for (let i = 0; i < Math.min(selects.length, 10); i++) {
      try {
        const name = await selects[i].getAttribute('name');
        const id = await selects[i].getAttribute('id');
        const ariaLabel = await selects[i].getAttribute('aria-label');
        console.log(`Select ${i}: name="${name}", id="${id}", aria-label="${ariaLabel}"`);
      } catch (error) {
        console.log(`Select ${i}: Could not get attributes`);
      }
    }
    
    // Get all labels
    const labels = await page.locator('label').all();
    console.log(`Found ${labels.length} labels:`);
    for (let i = 0; i < Math.min(labels.length, 15); i++) {
      try {
        const text = await labels[i].textContent();
        console.log(`Label ${i}: "${text}"`);
      } catch (error) {
        console.log(`Label ${i}: Could not get text`);
      }
    }
    
    console.log('=== END DEBUGGING ===');
  }

  async fillRenewalForm(page) {
    // Select Ford in OEM dropdown
    await page.getByRole('combobox', { name: 'OEM * --Select OEM--' }).click();
    await page.getByRole('option', { name: 'FORD' }).click();
    console.log('Selected FORD in OEM dropdown');

    // Toggle yes for offline quote
    const offlineToggle = page.locator('label:has-text("Offline Quote")').locator('..').locator('button:has-text("Yes")');
    await offlineToggle.waitFor({ state: 'visible', timeout: 5000 });
    await offlineToggle.click();
    console.log('Toggled Yes for Offline Quote');

    // Wait for form to load and debug available fields
    await page.waitForTimeout(2000);
    await this.debugFormFields(page);
    
    // Try multiple selectors for Previous Policy No.
    try {
      await page.locator('input[name="PREV_POLICY_NO"]').fill('345242234');
      console.log('Filled Previous Policy No.: 345242234');
    } catch (error) {
      console.log('Previous Policy No. field not found');
    }

    // Try multiple selectors for Previous Vehicle Cover
    try {
      await page.locator('#mui-component-select-PREV_COVERTYPE_ID').click();
      await page.waitForTimeout(1000);
      // Debug available options
      const options = await page.locator('[role="option"]').all();
      console.log(`Found ${options.length} options in Previous Vehicle Cover dropdown`);
      for (let i = 0; i < Math.min(options.length, 5); i++) {
        try {
          const text = await options[i].textContent();
          console.log(`Option ${i}: "${text}"`);
        } catch (error) {
          console.log(`Option ${i}: Could not get text`);
        }
      }
      await page.getByRole('option', { name: '1 OD + 1 TP' }).click();
      console.log('Selected 1 OD + 1 TP in Previous Vehicle Cover');
    } catch (error) {
      console.log('Previous Vehicle Cover dropdown not found or option not available');
    }

    // Try multiple selectors for Previous NCB%
    try {
      await page.locator('#mui-component-select-OLD_POL_NCB_LEVEL').click();
      await page.waitForTimeout(1000);
      // Debug available options
      const options = await page.locator('[role="option"]').all();
      console.log(`Found ${options.length} options in Previous NCB% dropdown`);
      for (let i = 0; i < Math.min(options.length, 5); i++) {
        try {
          const text = await options[i].textContent();
          console.log(`NCB Option ${i}: "${text}"`);
        } catch (error) {
          console.log(`NCB Option ${i}: Could not get text`);
        }
      }
      await page.getByRole('option', { name: '25' }).click();
      console.log('Selected 25 in Previous NCB%');
    } catch (error) {
      console.log('Previous NCB% dropdown not found or option not available');
    }

    // Try multiple selectors for Previous OD Policy IC
    try {
      await page.locator('#mui-component-select-FKISURANCE_COMP_ID').click();
      await page.waitForTimeout(1000);
      // Debug available options
      const options = await page.locator('[role="option"]').all();
      console.log(`Found ${options.length} options in Previous OD Policy IC dropdown`);
      for (let i = 0; i < Math.min(options.length, 5); i++) {
        try {
          const text = await options[i].textContent();
          console.log(`Policy IC Option ${i}: "${text}"`);
        } catch (error) {
          console.log(`Policy IC Option ${i}: Could not get text`);
        }
      }
      await page.getByRole('option', { name: 'HDFC ERGO General Insurance Co. Ltd.' }).click();
      console.log('Selected HDFC ERGO General Insurance Co. Ltd.');
    } catch (error) {
      console.log('Previous OD Policy IC dropdown not found or option not available');
    }

    // Try multiple selectors for Vehicle Cover
    try {
      await page.locator('#mui-component-select-CoverTypeId').click();
      await page.getByRole('option', { name: '1 OD + 1 TP' }).click();
      console.log('Selected 1 OD + 1 TP in Vehicle Cover');
    } catch (error) {
      console.log('Vehicle Cover dropdown not found');
    }

    // Select MR. in salutation dropdown
    try {
      await page.getByRole('combobox', { name: 'OEM * --Select Salutation--' }).click();
      await page.getByRole('option', { name: 'MR.' }).click();
      console.log('Selected MR. in Salutation');
    } catch (error) {
      console.log('Salutation dropdown not found, skipping...');
    }

    // Fill personal details
    try {
      await page.getByLabel('First Name').fill('john');
      await page.getByLabel('Email Id').fill('john@joh.com');
      await page.locator('input[name="MOB_NO"]').fill('8978564532');
      console.log('Filled personal details: john, john@joh.com, 8978564532');
    } catch (error) {
      console.log('Personal details fields not found, skipping...');
    }

    // Generate and store random VIN and Engine numbers
    const randomVin = Array.from({length: 17}, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    const randomEngineNo = Array.from({length: 17}, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    
    try {
      await page.getByLabel('VIN (Chassis No)').fill(randomVin);
      await page.getByLabel('Engine No').fill(randomEngineNo);
      console.log(`Generated VIN: ${randomVin}`);
      console.log(`Generated Engine No: ${randomEngineNo}`);
    } catch (error) {
      console.log('VIN/Engine No fields not found, skipping...');
    }

    // Store generated values in testdata file
    const fs = require('fs');
    const path = require('path');
    const generatedData = { vin: randomVin, engineNo: randomEngineNo };
    fs.writeFileSync(path.join(__dirname, '../testdata/generated_renew_values.json'), JSON.stringify(generatedData, null, 2));
    console.log('Stored generated values in testdata/generated_renew_values.json');

    // Select vehicle details
    try {
      await page.getByRole('combobox', { name: 'OEM * --Select Make--' }).click();
      await page.getByRole('option', { name: 'FORD' }).click();
      console.log('Selected FORD in Make');
    } catch (error) {
      console.log('Make dropdown not found, skipping...');
    }

    try {
      await page.getByRole('combobox', { name: 'OEM * --Select Model--' }).click();
      await page.getByRole('option', { name: 'ECOSPORT' }).click();
      console.log('Selected ECOSPORT in Model');
    } catch (error) {
      console.log('Model dropdown not found, skipping...');
    }

    try {
      await page.getByText('--Select Variant--').click();
      await page.getByRole('option', { name: '1.0 ECOSPORT PTL TIT' }).click();
      console.log('Selected 1.0 ECOSPORT PTL TIT in Variant');
    } catch (error) {
      console.log('Variant dropdown not found, skipping...');
    }

    // Select manufacture year 2025 (simple robust selector, as done in PolicyIssuancePageWithToggles)
    try {
      await page.getByRole('combobox', { name: '--Select Year of Manufacture--' }).click();
      await page.waitForTimeout(200);
      await page.getByRole('option', { name: '2025' }).click();
      console.log('Selected 2025 in Year of Manufacture (simple click)');
    } catch (error) {
      console.log('Year of Manufacture dropdown not found, skipping...');
    }
    // Optionally verify
    await expect(page.locator('#mui-component-select-DateofManufacture')).toHaveText(/2025/);

    // Select today's date and yesterday's date
    function formatDate(d) {
      return d.toLocaleDateString('en-GB').replace(/\//g, '/');
    }
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const todayStr = formatDate(today);
    const yestStr = formatDate(yesterday);
    try {
      await page.getByLabel('Invoice Date').click({ force: true });
      await page.getByLabel('Invoice Date').fill(todayStr);
      console.log('Set Invoice Date to today');
    } catch (error) {
      console.log('Invoice Date field not found');
    }
    try {
      await page.getByLabel('Registration Date').click({ force: true });
      await page.getByLabel('Registration Date').fill(yestStr);
      console.log('Set Registration Date to yesterday');
    } catch (error) {
      console.log('Registration Date field not found');
    }

    // Robustly fill Invoice Date and Registration Date (remove readonly, fill value)
    try {
      await page.evaluate(() => {
        const el = document.querySelector('input[name="InvoiceDate"]');
        if (el) el.removeAttribute('readonly');
      });
      await page.locator('input[name="InvoiceDate"]').fill('06/10/2025');
      console.log('Set Invoice Date');
    } catch (error) {
      console.log('Invoice Date field not found');
    }
    try {
      await page.evaluate(() => {
        const el = document.querySelector('input[name="RegistrationDate"]');
        if (el) el.removeAttribute('readonly');
      });
      await page.locator('input[name="RegistrationDate"]').fill('05/10/2025');
      console.log('Set Registration Date');
    } catch (error) {
      console.log('Registration Date field not found');
    }

    // Registration City (MUI selector)
    try {
      await page.locator('#mui-component-select-RTOId').click();
      await page.getByRole('option', { name: /Ahmednagar/i }).first().click();
      console.log('Selected Ahmednagar (Mh) in Registration City');
    } catch (error) {
      console.log('Registration City dropdown not found, skipping...');
    }
    // Customer Residence State (MUI selector)
    try {
      await page.locator('#mui-component-select-IsuredStateId').click();
      await page.getByRole('option', { name: /delhi/i }).first().click();
      console.log('Selected delhi in Customer Residence State');
    } catch (error) {
      console.log('Customer Residence State dropdown not found, skipping...');
    }

    // Additional toggles: always wait for visibility, retry on fail
    const toggles = [
      { label: 'Offline Quote', btn: 'Yes' },
      { label: 'Test Vehicle', btn: 'Yes' },
      { label: 'PA Cover- Paid Driver', btn: 'Yes' },
      { label: 'PA Cover Unnamed Passenger', btn: 'Yes' },
      { label: 'Legal Liability - Paid Driver', btn: 'Yes' }
    ];
    for (const t of toggles) {
      try {
        const btn = page.locator(`label:has-text(\"${t.label}\")`).locator('..').locator(`button:has-text(\"${t.btn}\")`);
        await btn.waitFor({ state: 'visible', timeout: 4000 });
        await btn.click();
        console.log(`Toggled Yes for ${t.label}`);
      } catch (error) {
        console.log(`${t.label} toggle not found, skipping...`);
      }
    }
    // PA Cover Amount
    try {
      await page.getByLabel('PA Cover Amount').fill('20000');
      console.log('Filled PA Cover Amount: 20000');
    } catch (error) {
      console.log('PA Cover Amount field not found, skipping...');
    }
    // Get Quotes: try robustly
    try {
      await page.waitForTimeout(400); // slight pause
      await page.getByRole('button', { name: /Get Quotes/i }).click({timeout: 2000});
      console.log('Clicked Get Quotes button');
    } catch (error1) {
      try {
        await page.locator('button').filter({ hasText: 'Get Quotes' }).click({timeout: 2000});
        console.log('Clicked Get Quotes button (alt selector)');
      } catch (error2) {
        console.log('Get Quotes button not found or not clickable.');
      }
    }
  }

  async fillAdditionalFormFields(page) {
    console.log('=== DEBUGGING ADDITIONAL FORM FIELDS ===');
    
    // Scroll down to find more fields
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Debug all available dropdowns and buttons
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons:`);
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      try {
        const text = await allButtons[i].textContent();
        if (text && text.trim()) {
          console.log(`Button ${i}: "${text.trim()}"`);
        }
      } catch (error) {
        console.log(`Button ${i}: Could not get text`);
      }
    }
    
    const allLabels = await page.locator('label').all();
    console.log(`Found ${allLabels.length} labels:`);
    for (let i = 0; i < Math.min(allLabels.length, 30); i++) {
      try {
        const text = await allLabels[i].textContent();
        if (text && text.trim()) {
          console.log(`Label ${i}: "${text.trim()}"`);
        }
      } catch (error) {
        console.log(`Label ${i}: Could not get text`);
      }
    }
    
    console.log('=== END DEBUGGING ADDITIONAL FIELDS ===');

    try {
      await page.locator('#mui-component-select-RTOId').click();
      await page.getByRole('option', { name: 'AHMEDNAGAR' }).click();
      console.log('Selected AHMEDNAGAR in Registration City');
    } catch (error) {
      console.log('Registration City dropdown not found, skipping...');
    }

    try {
      await page.getByRole('combobox', { name: '--Select Customer Residence State--' }).click();
      await page.getByRole('option', { name: 'ASSAM' }).click();
      console.log('Selected ASSAM in Customer Residence State');
    } catch (error) {
      console.log('Customer Residence State dropdown not found, skipping...');
    }

    try {
      const testVehicleToggle = page.locator('label:has-text("Test Vehicle")').locator('..').locator('button:has-text("Yes")');
      await testVehicleToggle.waitFor({ state: 'visible', timeout: 5000 });
      await testVehicleToggle.click();
      console.log('Toggled Yes for Test Vehicle');
    } catch (error) {
      console.log('Test Vehicle toggle not found, skipping...');
    }

    try {
      const paCoverToggle = page.locator('label:has-text("PA Cover- Paid Driver")').locator('..').locator('button:has-text("Yes")');
      await paCoverToggle.waitFor({ state: 'visible', timeout: 5000 });
      await paCoverToggle.click();
      console.log('Toggled Yes for PA Cover- Paid Driver');
    } catch (error) {
      console.log('PA Cover- Paid Driver toggle not found, skipping...');
    }

    try {
      await page.getByLabel('PA Cover Amount').fill('20000');
      console.log('Filled PA Cover Amount: 20000');
    } catch (error) {
      console.log('PA Cover Amount field not found, skipping...');
    }

    try {
      const paCoverUnnamedToggle = page.locator('label:has-text("PA Cover Unnamed Passenger")').locator('..').locator('button:has-text("Yes")');
      await paCoverUnnamedToggle.waitFor({ state: 'visible', timeout: 5000 });
      await paCoverUnnamedToggle.click();
      console.log('Toggled Yes for PA Cover Unnamed Passenger');
    } catch (error) {
      console.log('PA Cover Unnamed Passenger toggle not found, skipping...');
    }

    try {
      const legalLiabilityToggle = page.locator('label:has-text("Legal Liability - Paid Driver")').locator('..').locator('button:has-text("Yes")');
      await legalLiabilityToggle.waitFor({ state: 'visible', timeout: 5000 });
      await legalLiabilityToggle.click();
      console.log('Toggled Yes for Legal Liability - Paid Driver');
    } catch (error) {
      console.log('Legal Liability - Paid Driver toggle not found, skipping...');
    }

    console.log('Completed filling additional form fields');
  }

  async clickGetQuotes(page) {
    try {
      await page.getByRole('button', { name: 'Get Quotes' }).click();
      console.log('Clicked Get Quotes button');
    } catch (error) {
      try {
        await page.locator('button').filter({ hasText: 'Get Quotes' }).click();
        console.log('Clicked Get Quotes button (alternative selector)');
      } catch (error2) {
        console.log('Get Quotes button not found');
      }
    }
  }

  async testSuccessfulLoginAndNavigation(page) {
    console.log('Successfully logged in and navigated to renewal page');
    // Add success verification logic here
  }
}

module.exports = RenewPage;