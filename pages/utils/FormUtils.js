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
    // Previous Policy No (must be filled to enable OEM)
    await this.safeFill(
      this.page.getByRole('textbox', { name: 'Previous Policy No *' }),
      data.prevPolicyNo
    );

    // Wait for form to process the policy number
    await this.page.waitForTimeout(2000);

    // OEM selection (now enabled)
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select OEM--' }),
      data.oem
    );

    // Previous Vehicle Cover
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Previous Vehicle Cover--' }),
      data.prevVehicleCover
    );

    // NCB Percentage - Convert percentage to number format
    const ncbValue = this.convertNcbToNumber(data.ncb);
    // Use direct combobox locator for NCB dropdown with special handling
    const ncbDropdown = this.page.locator('#mui-component-select-OLD_POL_NCB_LEVEL');
    await this.selectNcbOption(ncbDropdown, ncbValue);

    // Previous Insurance Company
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Previous OD Policy IC--' }),
      data.prevPolicyIC
    );

    // Vehicle Cover (Current)
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Vehicle Cover--' }),
      data.vehicleCover
    );

    // Date fields - using more flexible locators
    if (data.odPolicyExpiryDate) {
      const odDateInput = this.page.locator('text=OD Policy Expiry Date').locator('..').locator('input').first();
      await this.setDateOnInput(odDateInput, data.odPolicyExpiryDate);
    }

    if (data.tpPolicyExpiryDate) {
      const tpDateInput = this.page.locator('text=TP Policy Expiry Date').locator('..').locator('input').first();
      await this.setDateOnInput(tpDateInput, data.tpPolicyExpiryDate);
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
      const invoiceDateInput = this.page.locator('text=Invoice Date').locator('..').locator('input').first();
      await this.setDateOnInput(invoiceDateInput, data.invoiceDate);
    }

    // Registration Date
    if (data.registrationDate) {
      const regDateInput = this.page.locator('text=Registration Date').locator('..').locator('input').first();
      await this.setDateOnInput(regDateInput, data.registrationDate);
    }
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
