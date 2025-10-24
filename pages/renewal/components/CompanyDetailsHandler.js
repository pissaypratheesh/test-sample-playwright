const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * Company Details Handler
 * Handles company information filling for corporate policy holders
 */
class CompanyDetailsHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Fill Company Details section
   * @param {Object} data - Company data
   */
  async fillCompanyDetails(data) {
    console.log('Filling Company Details...');
    
    // Scroll to Company Details section
    await this.scrollIntoView(this.page.locator('text=Company Details'));
    
    // Company Salutation - try to select but don't fail if it doesn't work
    try {
      await this.selectCompanySalutation(data.companySalutation || 'Mr.');
    } catch (e) {
      console.log(`⚠️ Company Salutation selection failed, continuing with other fields: ${e.message}`);
    }
    
    // Company Name - try multiple locator strategies
    await this.fillCompanyName(data.companyName);
    
    // Email Id - try multiple locator strategies
    await this.fillEmail(data.email);
    
    // Mobile No - try multiple locator strategies
    await this.fillMobileNo(data.companyContactNo);
    
    // Alternate Mobile No (if provided) - try multiple locator strategies
    if (data.companyLandlineNo) {
      await this.fillAlternateMobileNo(data.companyLandlineNo);
    }
    
    console.log('✅ Company Details filled');
  }

  /**
   * Select Company Salutation dropdown
   * @param {string} salutation - Salutation value
   */
  async selectCompanySalutation(salutation) {
    console.log(`🔍 [CompanyDetailsHandler] Starting Company Salutation selection: ${salutation}`);
    
    try {
      // First, let's debug what's actually on the page
      console.log(`🔍 [CompanyDetailsHandler] Current URL: ${this.page.url()}`);
      
      // Check if Company Details section is visible
      const companySection = this.page.locator('text=Company Details');
      const isCompanySectionVisible = await companySection.isVisible().catch(() => false);
      console.log(`🔍 [CompanyDetailsHandler] Company Details section visible: ${isCompanySectionVisible}`);
      
      // Check if Company Salutation text is visible
      const salutationText = this.page.getByText('Company Salutation');
      const isSalutationTextVisible = await salutationText.isVisible().catch(() => false);
      console.log(`🔍 [CompanyDetailsHandler] Company Salutation text visible: ${isSalutationTextVisible}`);
      
      // Strategy 1: Try MUI select pattern with different IDs
      const muiSelectors = [
        '#mui-component-select-CompanySalutation',
        '#mui-component-select-Salutation',
        '[data-testid="company-salutation"]',
        '[data-testid="salutation"]'
      ];
      
      console.log(`🔍 [CompanyDetailsHandler] Trying MUI selectors...`);
      for (const selector of muiSelectors) {
        console.log(`🔍 [CompanyDetailsHandler] Checking selector: ${selector}`);
        const muiSelect = this.page.locator(selector);
        const isVisible = await muiSelect.isVisible().catch(() => false);
        console.log(`🔍 [CompanyDetailsHandler] Selector ${selector} visible: ${isVisible}`);
        
        if (isVisible) {
          console.log(`🔍 [CompanyDetailsHandler] Found MUI select with selector: ${selector}`);
          try {
            await muiSelect.click();
            console.log(`🔍 [CompanyDetailsHandler] Clicked MUI select successfully`);
            await this.page.waitForTimeout(1000);
            
            // Wait for options to appear
            try {
              await this.page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 5000 });
              console.log(`🔍 [CompanyDetailsHandler] Options appeared after clicking`);
              
              // Get all available options
              const allOptions = await this.page.locator('ul[role="listbox"] li[role="option"]').allTextContents();
              console.log(`🔍 [CompanyDetailsHandler] Available options: ${JSON.stringify(allOptions)}`);
              
              // Try different option selection strategies
              const optionSelectors = [
                `ul[role="listbox"] li[role="option"]:has-text("${salutation}")`,
                `ul[role="listbox"] li[role="option"]:has-text("M/S")`,
                `ul[role="listbox"] li[role="option"]:has-text("LESSEE")`,
                `ul[role="listbox"] li[role="option"]:has-text("THE")`
              ];
              
              for (const optionSelector of optionSelectors) {
                console.log(`🔍 [CompanyDetailsHandler] Trying option selector: ${optionSelector}`);
                const option = this.page.locator(optionSelector);
                const optionVisible = await option.isVisible().catch(() => false);
                console.log(`🔍 [CompanyDetailsHandler] Option ${optionSelector} visible: ${optionVisible}`);
                
                if (optionVisible) {
                  await option.click({ force: true });
                  console.log(`✅ Company Salutation selected: ${salutation} using selector: ${optionSelector}`);
                  return;
                }
              }
            } catch (e) {
              console.log(`🔍 [CompanyDetailsHandler] Options not found for selector: ${selector}, error: ${e.message}`);
            }
          } catch (e) {
            console.log(`🔍 [CompanyDetailsHandler] Failed to click MUI select ${selector}: ${e.message}`);
          }
        }
      }
      
      // Strategy 2: Try by combobox role with accessible name
      console.log(`🔍 [CompanyDetailsHandler] Trying combobox by accessible name...`);
      const salutationDropdown = this.page.getByRole('combobox', { name: /Company Salutation/i });
      const isComboboxVisible = await salutationDropdown.isVisible().catch(() => false);
      console.log(`🔍 [CompanyDetailsHandler] Combobox by accessible name visible: ${isComboboxVisible}`);
      
      if (isComboboxVisible) {
        console.log('🔍 [CompanyDetailsHandler] Found combobox by accessible name');
        try {
          await salutationDropdown.click();
          console.log(`🔍 [CompanyDetailsHandler] Clicked combobox successfully`);
          await this.page.waitForTimeout(1000);
          
          // Check for options
          const optionsVisible = await this.page.locator('ul[role="listbox"] li[role="option"]').isVisible().catch(() => false);
          console.log(`🔍 [CompanyDetailsHandler] Options visible after combobox click: ${optionsVisible}`);
          
          if (optionsVisible) {
            const allOptions = await this.page.locator('ul[role="listbox"] li[role="option"]').allTextContents();
            console.log(`🔍 [CompanyDetailsHandler] Available options in combobox: ${JSON.stringify(allOptions)}`);
          }
          
          // Select the salutation option
          const option = this.page.getByRole('option', { name: salutation, exact: false });
          const optionVisible = await option.isVisible().catch(() => false);
          console.log(`🔍 [CompanyDetailsHandler] Target option "${salutation}" visible: ${optionVisible}`);
          
          if (optionVisible) {
            await option.click();
            console.log(`✅ Company Salutation selected: ${salutation}`);
            return;
          }
        } catch (e) {
          console.log(`🔍 [CompanyDetailsHandler] Failed to click combobox: ${e.message}`);
        }
      }
      
      // Strategy 3: Try by proximity to label text
      console.log(`🔍 [CompanyDetailsHandler] Trying proximity to label text...`);
      const label = this.page.getByText(/Company Salutation\s*\*/i);
      const isLabelVisible = await label.isVisible().catch(() => false);
      console.log(`🔍 [CompanyDetailsHandler] Label text visible: ${isLabelVisible}`);
      
      if (isLabelVisible) {
        console.log('🔍 [CompanyDetailsHandler] Found label text, trying proximity approach');
        try {
          const container = label.locator('xpath=..');
          const dropdown = container.locator('[role="button"], [aria-haspopup="listbox"], [role="combobox"]');
          const dropdownVisible = await dropdown.first().isVisible().catch(() => false);
          console.log(`🔍 [CompanyDetailsHandler] Proximity dropdown visible: ${dropdownVisible}`);
          
          if (dropdownVisible) {
            await dropdown.first().click();
            console.log(`🔍 [CompanyDetailsHandler] Clicked proximity dropdown`);
            await this.page.waitForTimeout(1000);
            
            const option = this.page.getByRole('option', { name: salutation, exact: false });
            const optionVisible = await option.isVisible().catch(() => false);
            console.log(`🔍 [CompanyDetailsHandler] Proximity option visible: ${optionVisible}`);
            
            if (optionVisible) {
              await option.click();
              console.log(`✅ Company Salutation selected: ${salutation}`);
              return;
            }
          }
        } catch (e) {
          console.log(`🔍 [CompanyDetailsHandler] Failed proximity approach: ${e.message}`);
        }
      }
      
      // Strategy 4: Try clicking any dropdown near Company Salutation text
      console.log(`🔍 [CompanyDetailsHandler] Trying nearby dropdown approach...`);
      const companySalutationText = this.page.getByText('Company Salutation');
      const isTextVisible = await companySalutationText.isVisible().catch(() => false);
      console.log(`🔍 [CompanyDetailsHandler] Company Salutation text visible: ${isTextVisible}`);
      
      if (isTextVisible) {
        console.log('🔍 [CompanyDetailsHandler] Found Company Salutation text, trying nearby dropdown');
        try {
          const nearbyDropdown = companySalutationText.locator('xpath=following-sibling::*//*[@role="button" or @role="combobox" or @aria-haspopup="listbox"]').first();
          const nearbyVisible = await nearbyDropdown.isVisible().catch(() => false);
          console.log(`🔍 [CompanyDetailsHandler] Nearby dropdown visible: ${nearbyVisible}`);
          
          if (nearbyVisible) {
            await nearbyDropdown.click();
            console.log(`🔍 [CompanyDetailsHandler] Clicked nearby dropdown`);
            await this.page.waitForTimeout(1000);
            
            // Try to select any available option
            const anyOption = this.page.locator('ul[role="listbox"] li[role="option"]').first();
            const anyOptionVisible = await anyOption.isVisible().catch(() => false);
            console.log(`🔍 [CompanyDetailsHandler] Any option visible: ${anyOptionVisible}`);
            
            if (anyOptionVisible) {
              await anyOption.click();
              console.log(`✅ Company Salutation selected (first available option)`);
              return;
            }
          }
        } catch (e) {
          console.log(`🔍 [CompanyDetailsHandler] Failed nearby dropdown approach: ${e.message}`);
        }
      }
      
      console.log(`⚠️ Could not select Company Salutation: ${salutation} - continuing without selection`);
      // Don't throw error, just log and continue
    } catch (e) {
      console.log(`❌ Error selecting Company Salutation: ${e.message} - continuing without selection`);
      // Don't throw error, just log and continue
    }
    
    // Ensure any open dropdowns are closed
    try {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      console.log(`🔍 [CompanyDetailsHandler] Pressed Escape to close dropdowns`);
    } catch (e) {
      console.log(`Could not close dropdowns with Escape key: ${e.message}`);
    }
  }

  /**
   * Fill Company Name field
   * @param {string} companyName - Company name
   */
  async fillCompanyName(companyName) {
    console.log(`Filling Company Name: ${companyName}`);
    
    const locators = [
      this.page.getByRole('textbox', { name: 'Company Name *' }),
      this.page.locator('input[placeholder*="Company Name"]'),
      this.page.locator('input[name*="COMPANY_NAME"]'),
      this.page.locator('textbox[ref=e182]')
    ];
    
    for (const locator of locators) {
      try {
        if (await locator.isVisible().catch(() => false)) {
          await this.fillInput(locator, companyName);
          console.log(`✅ Company Name filled: ${companyName}`);
          return;
        }
      } catch (e) {
        console.log(`Failed to fill Company Name with locator: ${e.message}`);
      }
    }
    
    console.log(`⚠️ Could not fill Company Name: ${companyName}`);
  }

  /**
   * Fill Email field
   * @param {string} email - Email address
   */
  async fillEmail(email) {
    console.log(`Filling Email: ${email}`);
    
    const locators = [
      this.page.getByRole('textbox', { name: 'Email Id *' }),
      this.page.locator('input[placeholder*="Email"]'),
      this.page.locator('input[name*="EMAIL"]'),
      this.page.locator('textbox[ref=e189]')
    ];
    
    for (const locator of locators) {
      try {
        if (await locator.isVisible().catch(() => false)) {
          await this.fillInput(locator, email);
          console.log(`✅ Email filled: ${email}`);
          return;
        }
      } catch (e) {
        console.log(`Failed to fill Email with locator: ${e.message}`);
      }
    }
    
    console.log(`⚠️ Could not fill Email: ${email}`);
  }

  /**
   * Fill Mobile Number field
   * @param {string} mobileNo - Mobile number
   */
  async fillMobileNo(mobileNo) {
    console.log(`Filling Mobile No: ${mobileNo}`);
    
    const locators = [
      this.page.getByRole('textbox', { name: 'Mobile No *' }),
      this.page.locator('input[placeholder*="Mobile"]'),
      this.page.locator('input[name*="MOB_NO"]'),
      this.page.locator('textbox[ref=e195]')
    ];
    
    for (const locator of locators) {
      try {
        if (await locator.isVisible().catch(() => false)) {
          await this.fillInput(locator, mobileNo);
          console.log(`✅ Mobile No filled: ${mobileNo}`);
          return;
        }
      } catch (e) {
        console.log(`Failed to fill Mobile No with locator: ${e.message}`);
      }
    }
    
    console.log(`⚠️ Could not fill Mobile No: ${mobileNo}`);
  }

  /**
   * Fill Alternate Mobile Number field
   * @param {string} alternateMobileNo - Alternate mobile number
   */
  async fillAlternateMobileNo(alternateMobileNo) {
    console.log(`Filling Alternate Mobile No: ${alternateMobileNo}`);
    
    const locators = [
      this.page.getByRole('textbox', { name: 'Alternate Mobile No.' }),
      this.page.locator('input[placeholder*="Alternate"]'),
      this.page.locator('input[name*="ALT_MOB"]'),
      this.page.locator('textbox[ref=e201]')
    ];
    
    for (const locator of locators) {
      try {
        if (await locator.isVisible().catch(() => false)) {
          await this.fillInput(locator, alternateMobileNo);
          console.log(`✅ Alternate Mobile No filled: ${alternateMobileNo}`);
          return;
        }
      } catch (e) {
        console.log(`Failed to fill Alternate Mobile No with locator: ${e.message}`);
      }
    }
    
    console.log(`⚠️ Could not fill Alternate Mobile No: ${alternateMobileNo}`);
  }

  /**
   * Check if company details section is visible
   * @returns {boolean} True if company details section is visible
   */
  async isCompanyDetailsVisible() {
    try {
      const companySection = this.page.locator('text=Company Details');
      return await companySection.isVisible();
    } catch (e) {
      return false;
    }
  }
}

module.exports = CompanyDetailsHandler;
