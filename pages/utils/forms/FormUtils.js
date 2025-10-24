const BasePage = require('../core/BasePage');

/**
 * Form utilities for common form interactions
 */
class FormUtils extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Fill policy details form section
   * @param {Object} data - Policy data object
   */
  async fillPolicyDetails(data) {
    // Step 1: Select OEM FIRST (like original renewPolicy.js)
    await this.selectMuiOption('#mui-component-select-FKOEM_ID', data.oem);
    await this.page.waitForTimeout(500);

    // Step 2: Fill Previous Policy No
    await this.safeFill(
      this.page.getByLabel('Previous Policy No'),
      data.prevPolicyNo
    );

    // Step 3: Previous Vehicle Cover (must be before Vehicle Cover)
    await this.selectMuiOption('#mui-component-select-PREV_COVERTYPE_ID', data.prevVehicleCover);

    // Step 4: Select Vehicle Cover (after Previous Vehicle Cover) - with retry
    await this.selectMuiOptionWithRetry('#mui-component-select-CoverTypeId', data.vehicleCover);

    // Step 5: NCB with numeric matching (like original)
    await this.selectMuiOption('#mui-component-select-OLD_POL_NCB_LEVEL', data.ncb, { numeric: true });

    // Step 6: Previous Insurance Company
    await this.selectMuiOption('#mui-component-select-FKISURANCE_COMP_ID', data.prevPolicyIC);

    // Step 7: Date fields using correct locators
    if (data.odPolicyExpiryDate) {
      const odExpiryInput = this.page.locator('input[name="POLICY_EXPIRY_DATE"]');
      await this.setDateOnInput(odExpiryInput, data.odPolicyExpiryDate);
    }

    if (data.tpPolicyExpiryDate) {
      const tpExpiryInput = this.page.locator('input[name="TP_POLICY_EXPIRY_DATE"]');
      await this.setDateOnInput(tpExpiryInput, data.tpPolicyExpiryDate);
    }
  }

  /**
   * Fill customer details form section
   * @param {Object} data - Customer data object
   */
  async fillCustomerDetails(data) {
    // Salutation
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Salutation--' }),
      data.salutation
    );

    // First Name
    await this.safeFill(
      this.page.getByRole('textbox', { name: 'First Name *' }),
      data.firstName
    );

    // Email
    if (data.email) {
      await this.safeFill(
        this.page.getByRole('textbox', { name: 'Email Id *' }),
        data.email
      );
    }

    // Mobile
    if (data.mobile) {
      await this.safeFill(
        this.page.getByRole('textbox', { name: 'Mobile No *' }),
        data.mobile
      );
    }
  }

  /**
   * Fill vehicle details form section
   * @param {Object} data - Vehicle data object
   */
  async fillVehicleDetails(data) {
    // VIN (Chassis No) - Generate random VIN like original
    const randomVin = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await this.safeFill(this.page.locator('input[name="ChassisNo"]'), randomVin);
    console.log(`[FormUtils] Generated VIN: ${randomVin}`);

    // Engine No - Generate random Engine No like original
    const randomEngineNo = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await this.safeFill(this.page.locator('input[name="EngineNo"]'), randomEngineNo);
    console.log(`[FormUtils] Generated Engine No: ${randomEngineNo}`);

    // Click Fetch button after filling VIN/Engine
    await this.clickButton('Fetch');

    // Make, Model, Variant using original locators
    await this.selectMuiOption('#mui-component-select-MakeId', data.make);
    await this.selectMuiOption('#mui-component-select-ModelId', data.model);
    await this.selectMuiOption('#mui-component-select-VariantId', data.variant);

    // Additional vehicle details (optional - may not be present)
    try {
      const fuelTypeField = this.page.locator('input[name="FUEL_TYPE"]');
      if (await fuelTypeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.safeFill(fuelTypeField, data.fuelType || 'PETROL');
        console.log(`[FormUtils] Filled Fuel Type: ${data.fuelType || 'PETROL'}`);
      }
    } catch (error) {
      console.log(`[FormUtils] Fuel Type field not found or not visible: ${error.message}`);
    }

    try {
      const seatingCapacityField = this.page.locator('input[name="SEATING_CAPACITY"]');
      if (await seatingCapacityField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.safeFill(seatingCapacityField, data.seatingCapacity || '5');
        console.log(`[FormUtils] Filled Seating Capacity: ${data.seatingCapacity || '5'}`);
      }
    } catch (error) {
      console.log(`[FormUtils] Seating Capacity field not found or not visible: ${error.message}`);
    }

    try {
      const cubicCapacityField = this.page.locator('input[name="CUBIC_CAPACITY"]');
      if (await cubicCapacityField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.safeFill(cubicCapacityField, data.cubicCapacity || '999');
        console.log(`[FormUtils] Filled Cubic Capacity: ${data.cubicCapacity || '999'}`);
      }
    } catch (error) {
      console.log(`[FormUtils] Cubic Capacity field not found or not visible: ${error.message}`);
    }

    try {
      const exShowroomPriceField = this.page.locator('input[name="EX_SHOWROOM_PRICE"]');
      if (await exShowroomPriceField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.safeFill(exShowroomPriceField, data.exShowroomPrice || '1000000');
        console.log(`[FormUtils] Filled Ex-Showroom Price: ${data.exShowroomPrice || '1000000'}`);
      }
    } catch (error) {
      console.log(`[FormUtils] Ex-Showroom Price field not found or not visible: ${error.message}`);
    }

    // Year of Manufacture
    await this.selectMuiOption('#mui-component-select-DateofManufacture', data.year);

    // Registration City
    await this.selectMuiOption('#mui-component-select-RTOId', data.registrationCity);

    // Customer Residence State (without clicking Search and Map RTO)
    await this.selectMuiOption('#mui-component-select-IsuredStateId', data.customerState);

    // Invoice Date
    if (data.invoiceDate) {
      await this.setDateOnInput(this.page.locator('input[name="InvoiceDate"]'), data.invoiceDate);
    }

    // Registration Date
    if (data.registrationDate) {
      await this.setDateOnInput(this.page.locator('input[name="RegistrationDate"]'), data.registrationDate);
    }

    // Registration Number (split fields) - like original renewPolicy.js
    try {
      const regStateRto = this.page.locator('input[placeholder="DL-09"], input[aria-label="Registration State RTO"], input[name="REG_STATE_RTO"]');
      const regSeries = this.page.locator('input[placeholder="RAA"], input[aria-label="Registration Series"], input[name="REG_SERIES"]');
      const regNumber = this.page.locator('input[placeholder="5445"], input[aria-label="Registration Number"], input[name="REG_NUMBER"]');

      const stateRtoVal = data.registrationStateRto || 'DL-06';
      const seriesVal = data.registrationSeries || 'RAA';
      const numberVal = data.registrationNumber || '9999';

      if (await regStateRto.first().isVisible().catch(() => false)) {
        await regStateRto.first().fill(stateRtoVal);
        console.log(`[FormUtils] Filled Registration State RTO: ${stateRtoVal}`);
      }
      if (await regSeries.first().isVisible().catch(() => false)) {
        await regSeries.first().fill(seriesVal);
        console.log(`[FormUtils] Filled Registration Series: ${seriesVal}`);
      }
      if (await regNumber.first().isVisible().catch(() => false)) {
        await regNumber.first().fill(numberVal);
        console.log(`[FormUtils] Filled Registration Number: ${numberVal}`);
      }
    } catch (error) {
      console.log(`[FormUtils] Error filling registration number fields: ${error.message}`);
    }
  }

  /**
   * Select Material UI option (based on original renewPolicy.js)
   * @param {string} selectLocator - Select element locator
   * @param {string} optionText - Option text to select
   * @param {Object} opts - Options like { numeric: true }
   */
  /**
   * Select MUI option with retry mechanism for Vehicle Cover
   * @param {string} selectLocator - Select element locator
   * @param {string} optionText - Option text to select
   * @param {Object} options - Additional options
   */
  async selectMuiOptionWithRetry(selectLocator, optionText, options = {}) {
    const maxRetries = 3;
    const retryDelay = 2000;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`[FormUtils] selectMuiOptionWithRetry: Attempt ${i + 1} to select "${optionText}" from ${selectLocator}`);
        
        // Wait for the select to be visible and enabled
        const selectElement = this.page.locator(selectLocator);
        await this.waitForElement(selectElement, 10000);
        
        // Click to open dropdown
        await selectElement.click();
        await this.page.waitForTimeout(1000);
        
        // Look for the option with multiple possible formats
        const possibleOptions = [
          optionText,
          optionText.replace(/\s+/g, ' '), // Normalize spaces
          optionText.toUpperCase(),
          optionText.toLowerCase()
        ];
        
        let optionFound = false;
        for (const possibleOption of possibleOptions) {
          try {
            const option = this.page.getByRole('option', { name: possibleOption });
            if (await option.isVisible({ timeout: 2000 })) {
              console.log(`[FormUtils] selectMuiOptionWithRetry: Found option "${possibleOption}"`);
              await option.click();
              optionFound = true;
              break;
            }
          } catch (e) {
            // Continue to next option
          }
        }
        
        if (optionFound) {
          await this.page.waitForTimeout(500);
          console.log(`✅ [FormUtils] selectMuiOptionWithRetry: Successfully selected "${optionText}"`);
          return;
        }
        
        // If not found, try to get all available options for debugging
        const allOptions = await this.page.locator('[role="option"]').allTextContents();
        console.log(`[FormUtils] selectMuiOptionWithRetry: Available options: ${JSON.stringify(allOptions)}`);
        
        throw new Error(`Option "${optionText}" not found in ${selectLocator}. Available: ${JSON.stringify(allOptions)}`);
        
      } catch (error) {
        console.log(`[FormUtils] selectMuiOptionWithRetry: Attempt ${i + 1} failed: ${error.message}`);
        
        if (i === maxRetries - 1) {
          throw error;
        }
        
        // Wait before retry
        await this.page.waitForTimeout(retryDelay);
      }
    }
  }

  async selectMuiOption(selectLocator, optionText, opts = {}) {
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

    // exact/contains match
    for (let i = 0; i < count; i++) {
      const text = normalize(await options.nth(i).innerText());
      if (text === optionText || text.includes(optionText)) {
        await options.nth(i).click();
        return;
      }
    }

    // loose match
    const target = normalizeLoose(optionText);
    for (let i = 0; i < count; i++) {
      const text = normalizeLoose(await options.nth(i).innerText());
      if (text.includes(target)) {
        await options.nth(i).click();
        return;
      }
    }

    // numeric match (for NCB)
    if (opts.numeric) {
      const targetNum = toNumeric(optionText);
      if (targetNum) {
        for (let i = 0; i < count; i++) {
          const text = normalize(await options.nth(i).innerText());
          const textNum = toNumeric(text);
          if (textNum === targetNum) {
            await options.nth(i).click();
            return;
          }
        }
      }
    }

    throw new Error(`Option "${optionText}" not found in ${selectLocator}`);
  }

  /**
   * Convert NCB percentage string to number format for dropdown
   * @param {string} ncbStr - NCB string like "20%" or "20"
   * @returns {string} - Number string like "20"
   */
  convertNcbToNumber(ncbStr) {
    if (!ncbStr) return '0';
    return ncbStr.replace('%', '').trim();
  }

  /**
   * Select NCB option with special handling for Material UI backdrop
   * @param {Locator} dropdownLocator - NCB dropdown locator
   * @param {string} ncbValue - NCB value to select
   */
  async selectNcbOption(dropdownLocator, ncbValue) {
    try {
      console.log(`[FormUtils] Selecting NCB value: ${ncbValue}`);
      
      // Click the dropdown to open it
      await this.waitForElement(dropdownLocator);
      await dropdownLocator.click();
      await this.page.waitForTimeout(1000);
      
      // Wait for the dropdown menu to appear
      const menuLocator = this.page.locator('#menu-OLD_POL_NCB_LEVEL');
      await menuLocator.waitFor({ state: 'visible', timeout: 5000 });
      
      // Try multiple approaches to find the option
      let optionLocator = null;
      
      // Approach 1: Try exact text match first
      try {
        optionLocator = this.page.locator(`li:has-text("${ncbValue}")`).filter({ hasText: new RegExp(`^${ncbValue}$`) });
        await this.waitForElement(optionLocator, 2000);
        console.log(`[FormUtils] Found NCB option using exact text: ${ncbValue}`);
      } catch (error) {
        console.log(`[FormUtils] exact text approach failed, trying data-value...`);
        
        // Approach 2: Try data-value attribute with text filter
        optionLocator = this.page.locator(`li[data-value="${ncbValue}"]`).filter({ hasText: new RegExp(`^${ncbValue}$`) });
        await this.waitForElement(optionLocator, 2000);
        console.log(`[FormUtils] Found NCB option using data-value with text filter: ${ncbValue}`);
      }
      
      // Use force click to bypass backdrop
      await optionLocator.click({ force: true });
      await this.page.waitForTimeout(500);
      
      console.log(`[FormUtils] Successfully selected NCB value: ${ncbValue}`);
    } catch (error) {
      console.error(`[FormUtils] Error selecting NCB value ${ncbValue}:`, error.message);
      throw error;
    }
  }

  /**
   * Select radio button option (handles both radio and button-based radio groups)
   * @param {string} groupName - Radio group name
   * @param {string} optionValue - Option value to select
   */
  async selectRadioOption(groupName, optionValue) {
    // Try button-based radio group first (Material UI style)
    try {
      const buttonOption = this.page.getByRole('button', { name: optionValue });
      if (await buttonOption.isVisible({ timeout: 2000 })) {
        await this.safeClick(buttonOption);
        return;
      }
    } catch (error) {
      // Fallback to traditional radio button
    }
    
    // Fallback to traditional radio button
    await this.safeClick(
      this.page.getByRole('radio', { name: optionValue })
    );
  }

  /**
   * Click button with retry mechanism
   * @param {string} buttonName - Button name or text
   */
  async clickButton(buttonName) {
    await this.safeClick(
      this.page.getByRole('button', { name: buttonName })
    );
  }

  /**
   * Wait for form section to be visible
   * @param {string} sectionName - Section name
   */
  async waitForSection(sectionName) {
    const section = this.page.locator(`text=${sectionName}`).first();
    await this.waitForElement(section);
  }

  /**
   * Expand form section
   * @param {string} sectionName - Section name to expand
   */
  async expandSection(sectionName) {
    const sectionButton = this.page.getByRole('button', { name: sectionName });
    const isExpanded = await sectionButton.getAttribute('aria-expanded');
    
    if (isExpanded !== 'true') {
      await this.safeClick(sectionButton);
      await this.page.waitForTimeout(500); // Wait for animation
    }
  }
}

module.exports = FormUtils;
