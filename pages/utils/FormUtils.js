const BasePage = require('./BasePage');

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

    // Step 2: Select Vehicle Cover early (like original)
    await this.selectMuiOption('#mui-component-select-CoverTypeId', data.vehicleCover);

    // Step 3: Fill Previous Policy No
    await this.safeFill(
      this.page.getByLabel('Previous Policy No'),
      data.prevPolicyNo
    );

    // Step 4: Previous Vehicle Cover
    await this.selectMuiOption('#mui-component-select-PREV_COVERTYPE_ID', data.prevVehicleCover);

    // Step 5: NCB with numeric matching (like original)
    await this.selectMuiOption('#mui-component-select-OLD_POL_NCB_LEVEL', data.ncb, { numeric: true });

    // Step 6: Previous Insurance Company
    await this.selectMuiOption('#mui-component-select-FKISURANCE_COMP_ID', data.prevPolicyIC);

    // Step 7: Date fields using original locators
    if (data.odPolicyExpiryDate) {
      const expiryInputs = this.page.locator('input[name="POLICY_EXPIRY_DATE"]');
      const expiryCount = await expiryInputs.count();
      if (expiryCount >= 1) {
        await this.setDateOnInput(expiryInputs.nth(0), data.odPolicyExpiryDate);
      }
    }

    if (data.tpPolicyExpiryDate) {
      const expiryInputs = this.page.locator('input[name="POLICY_EXPIRY_DATE"]');
      const expiryCount = await expiryInputs.count();
      if (expiryCount >= 2) {
        await this.setDateOnInput(expiryInputs.nth(1), data.tpPolicyExpiryDate);
      }
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
    // Make
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Make--' }),
      data.make
    );

    // Model
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Model--' }),
      data.model
    );

    // Variant
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Variant--' }),
      data.variant
    );

    // Year of Manufacture
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Year of Manufacture--' }),
      data.year
    );

    // Registration City
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Registration City--' }),
      data.registrationCity
    );

    // Customer Residence State
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Customer Residence State--' }),
      data.customerState
    );

    // Invoice Date
    if (data.invoiceDate) {
      await this.setDateOnInput(this.page.locator('input[name="InvoiceDate"]'), data.invoiceDate);
    }

    // Registration Date
    if (data.registrationDate) {
      await this.setDateOnInput(this.page.locator('input[name="RegistrationDate"]'), data.registrationDate);
    }
  }

  /**
   * Select Material UI option (based on original renewPolicy.js)
   * @param {string} selectLocator - Select element locator
   * @param {string} optionText - Option text to select
   * @param {Object} opts - Options like { numeric: true }
   */
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
   * Select radio button option
   * @param {string} groupName - Radio group name
   * @param {string} optionValue - Option value to select
   */
  async selectRadioOption(groupName, optionValue) {
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
