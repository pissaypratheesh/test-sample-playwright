const FormUtils = require('./utils/FormUtils');
const NavigationUtils = require('./utils/NavigationUtils');

/**
 * Renew Policy Page Object - Handles policy renewal flow
 * Extends utility classes for reusable functionality
 */
class RenewPolicyPage extends FormUtils {
  constructor(page) {
    super(page);
    this.navigation = new NavigationUtils(page);
  }

  /**
   * Complete renewal flow from login to proposal details
   * @param {Object} testdata - Test data object
   * @param {Object} creds - Credentials object
   * @param {Object} proposalDetails - Proposal details object (optional)
   */
  async runRenewalFlow(testdata, creds, proposalDetails = null) {
    try {
      // Step 1: Navigate and login
      await this.navigation.navigateToLoginPage();
      await this.navigation.login(creds);

      // Step 2: Navigate to policy issuance
      await this.navigation.navigateToPolicyIssuance();

      // Step 3: Navigate to renewal flow
      await this.navigation.navigateToRenewalFlow();

      // Step 4: Fill policy details
      await this.fillPolicyDetails(testdata);

      // Step 5: Fill customer details if provided
      if (proposalDetails && proposalDetails.personalDetails) {
        await this.fillCustomerDetails(proposalDetails.personalDetails);
      }

      // Step 6: Fill vehicle details if provided
      if (testdata.make && testdata.model && testdata.variant) {
        await this.fillVehicleDetails(testdata);
      }

      // Step 7: Fill additional discounts
      await this.fillAdditionalDiscounts();

      // Step 8: Get quotes
      await this.getQuotes();

      // Step 9: Handle post-quotation flow (Buy Now + Proposal Details)
      await this.handlePostQuotationFlow(proposalDetails);

      console.log('Complete renewal flow finished successfully');
    } catch (error) {
      console.error('Error in renewal flow:', error.message);
      throw error;
    }
  }

  /**
   * Run new policy flow
   * @param {Object} testdata - Test data object
   * @param {Object} creds - Credentials object
   * @param {Object} proposalDetails - Proposal details object (optional)
   */
  async runNewPolicyFlow(testdata, creds, proposalDetails = null) {
    try {
      // Step 1: Navigate and login
      await this.navigation.navigateToLoginPage();
      await this.navigation.login(creds);

      // Step 2: Navigate to policy issuance
      await this.navigation.navigateToPolicyIssuance();

      // Step 3: Navigate to new policy flow
      await this.navigation.navigateToNewPolicyFlow();

      // Step 4: Fill policy details (for new policy)
      await this.fillNewPolicyDetails(testdata);

      // Step 5: Fill customer details if provided
      if (proposalDetails && proposalDetails.personalDetails) {
        await this.fillCustomerDetails(proposalDetails.personalDetails);
      }

      // Step 6: Fill vehicle details if provided
      if (testdata.make && testdata.model && testdata.variant) {
        await this.fillVehicleDetails(testdata);
      }

      console.log('New policy flow completed successfully');
    } catch (error) {
      console.error('Error in new policy flow:', error.message);
      throw error;
    }
  }

  /**
   * Fill new policy details (different from renewal)
   * @param {Object} data - Policy data object
   */
  async fillNewPolicyDetails(data) {
    // OEM selection
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select OEM--' }),
      data.oem
    );

    // Vehicle Cover
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'OEM * --Select Vehicle Cover--' }),
      data.vehicleCover
    );

    // Proposer Type (Individual/Corporate)
    if (data.proposerType) {
      await this.selectRadioOption('Proposer Type', data.proposerType);
    }

    // Vehicle Class (Private/Commercial)
    if (data.vehicleClass) {
      await this.selectRadioOption('Vehicle Class', data.vehicleClass);
    }
  }

  /**
   * Get quotes after filling form
   */
  async getQuotes() {
    await this.clickButton('Get Quotes');
    await this.page.waitForTimeout(2000); // Wait for quotes to load
  }

  /**
   * Validate form completion
   * @returns {boolean} - True if form is complete
   */
  async validateFormCompletion() {
    try {
      // Check if all required fields are filled by looking at the actual values
      const requiredChecks = [
        // Check OEM is selected (not default)
        async () => {
          const oemDropdown = this.page.getByRole('combobox', { name: 'OEM * --Select OEM--' });
          const oemText = await oemDropdown.textContent();
          return oemText && oemText !== '--Select OEM--';
        },
        
        // Check Previous Policy No is filled
        async () => {
          const policyNoField = this.page.getByRole('textbox', { name: 'Previous Policy No *' });
          const policyNoValue = await policyNoField.inputValue();
          return policyNoValue && policyNoValue.length > 0;
        },
        
        // Check Previous Vehicle Cover is selected
        async () => {
          const vehicleCoverDropdown = this.page.getByRole('combobox', { name: 'OEM * --Select Previous Vehicle Cover--' });
          const vehicleCoverText = await vehicleCoverDropdown.textContent();
          return vehicleCoverText && vehicleCoverText !== '--Select Previous Vehicle Cover--';
        },
        
        // Check NCB is selected (not default 0)
        async () => {
          const ncbDropdown = this.page.locator('text=Previous NCB %').locator('..').locator('div[role="combobox"]').first();
          const ncbText = await ncbDropdown.textContent();
          return ncbText && ncbText !== '0' && ncbText !== '--Select Previous NCB %--';
        },
        
        // Check Previous OD Policy IC is selected
        async () => {
          const policyICDropdown = this.page.getByRole('combobox', { name: 'OEM * --Select Previous OD Policy IC--' });
          const policyICText = await policyICDropdown.textContent();
          return policyICText && policyICText !== '--Select Previous OD Policy IC--';
        },
        
        // Check Vehicle Cover is selected
        async () => {
          const vehicleCoverDropdown = this.page.getByRole('combobox', { name: 'OEM * --Select Vehicle Cover--' });
          const vehicleCoverText = await vehicleCoverDropdown.textContent();
          return vehicleCoverText && vehicleCoverText !== '--Select Vehicle Cover--';
        }
      ];

      // Run all checks
      const results = await Promise.all(requiredChecks.map(check => check().catch(() => false)));
      
      // All checks must pass
      const allPassed = results.every(result => result === true);
      
      console.log('Form validation results:', {
        oem: results[0],
        policyNo: results[1],
        vehicleCover: results[2],
        ncb: results[3],
        policyIC: results[4],
        currentVehicleCover: results[5],
        allPassed
      });
      
      return allPassed;
    } catch (error) {
      console.error('Error validating form:', error.message);
      return false;
    }
  }

  /**
   * Take screenshot of current form state
   * @param {string} filename - Screenshot filename
   */
  async takeFormScreenshot(filename = 'form-state.png') {
    await this.page.screenshot({
      path: `.playwright-mcp/${filename}`,
      fullPage: true
    });
  }

  /**
   * Generate random VIN number
   * @returns {string} - Random VIN
   */
  generateRandomVin() {
    return Array.from({ length: 17 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('').toUpperCase();
  }

  /**
   * Generate random Engine number
   * @returns {string} - Random Engine number
   */
  generateRandomEngineNo() {
    return Array.from({ length: 17 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('').toUpperCase();
  }

  /**
   * Fill additional discounts section
   */
  async fillAdditionalDiscounts() {
    try {
      // NCB Carry Forward
      await this.safeClick(this.page.getByRole('button', { name: 'Yes' }).first());
      
      // Voluntary Excess
      await this.safeClick(this.page.getByRole('button', { name: 'Yes' }).nth(1));
      
      // AAI Membership
      await this.safeClick(this.page.getByRole('button', { name: 'Yes' }).nth(2));
      
      // Handicapped
      await this.safeClick(this.page.getByRole('button', { name: 'Yes' }).nth(3));
      
      // Anti Theft
      await this.safeClick(this.page.getByRole('button', { name: 'Yes' }).nth(4));
    } catch (error) {
      console.warn('Error filling additional discounts:', error.message);
    }
  }

  /**
   * Handle post-quotation flow (Buy Now + Proposal Details)
   * @param {Object} proposalDetails - Proposal details data
   */
  async handlePostQuotationFlow(proposalDetails = null) {
    try {
      console.log('Starting post-quotation flow...');
      
      // Step 1: Click Buy Now button
      await this.clickBuyNow();
      
      // Step 2: Wait for proposal details page to load
      await this.waitForProposalDetailsPage();
      
      // Step 3: Fill proposal details if provided
      if (proposalDetails) {
        await this.fillProposalDetails(proposalDetails);
      } else {
        // Use default proposal details from test data
        const defaultProposalDetails = require('../testdata/proposalDetails.json');
        await this.fillProposalDetails(defaultProposalDetails);
      }
      
      console.log('Post-quotation flow completed successfully');
    } catch (error) {
      console.error('Error in post-quotation flow:', error.message);
      throw error;
    }
  }

  /**
   * Click Buy Now button with popup handling
   */
  async clickBuyNow() {
    try {
      console.log('Looking for BUY NOW button...');
      
      // Try multiple selectors for Buy Now button
      const buyNowSelectors = [
        'button:has-text("BUY NOW")',
        'a:has-text("BUY NOW")',
        '.quotation-buynow-btn',
        '[data-testid="buy-now"]'
      ];
      
      let buyNowButton = null;
      for (const selector of buyNowSelectors) {
        try {
          buyNowButton = this.page.locator(selector).first();
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
        this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null),
        buyNowButton.click()
      ]);
      
      if (newPage) {
        console.log('BUY NOW opened new window, switching to it...');
        await newPage.waitForLoadState('networkidle');
        this.page = newPage;
      }
      
      console.log('BUY NOW button clicked successfully');
    } catch (error) {
      console.log('Error clicking Buy Now:', error.message);
      throw error;
    }
  }

  /**
   * Wait for proposal details page to load
   */
  async waitForProposalDetailsPage() {
    try {
      console.log('Waiting for proposal details page to load...');
      
      // Wait for proposal page indicators
      await Promise.race([
        this.page.waitForSelector('input[name="DOB"]', { timeout: 60000 }),
        this.page.waitForSelector('input[name="FIRST_NAME"]', { timeout: 60000 }),
        this.page.waitForSelector('text=Proposer Details', { timeout: 60000 }),
        this.page.waitForSelector('text=Personal Details', { timeout: 60000 })
      ]);
      
      console.log('Proposal details page loaded successfully');
    } catch (error) {
      console.log('Error waiting for proposal details page:', error.message);
      throw error;
    }
  }

  /**
   * Fill proposal details form
   * @param {Object} data - Proposal details data
   */
  async fillProposalDetails(data) {
    try {
      console.log('Starting to fill proposal details...');
      
      // Personal Details
      await this.fillPersonalDetails(data.personalDetails);
      
      // AA Membership Details
      if (data.aaMembershipDetails) {
        await this.fillAAMembershipDetails(data.aaMembershipDetails);
      }
      
      // NCB Carry Forward Details
      if (data.ncbCarryForwardDetails) {
        await this.fillNCBCarryForwardDetails(data.ncbCarryForwardDetails);
      }
      
      // Policy Details
      if (data.policyDetails) {
        await this.fillPolicyDetailsSection(data.policyDetails);
      }
      
      // Nominee Details
      if (data.nomineeDetails) {
        await this.fillNomineeDetails(data.nomineeDetails);
      }
      
      // Payment Details
      if (data.paymentDetails) {
        await this.fillPaymentDetails(data.paymentDetails);
      }
      
      console.log('Proposal details filled successfully');
    } catch (error) {
      console.error('Error filling proposal details:', error.message);
      throw error;
    }
  }

  /**
   * Fill personal details section
   * @param {Object} data - Personal details data
   */
  async fillPersonalDetails(data) {
    try {
      console.log('Filling personal details...');
      
      // Salutation
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-SALUTATION'),
        data.salutation
      );
      
      // Names
      await this.safeFill(this.page.getByRole('textbox', { name: 'First Name *' }), data.firstName);
      await this.safeFill(this.page.getByRole('textbox', { name: 'Middle Name' }), data.middleName);
      await this.safeFill(this.page.getByRole('textbox', { name: 'Last Name' }), data.lastName);
      
      // Date of Birth
      const dobInput = this.page.getByRole('textbox', { name: 'DOB' });
      await this.setDateOnInput(dobInput, data.dateOfBirth);
      
      // Contact Information
      await this.safeFill(this.page.getByRole('textbox', { name: 'EMAIL' }), data.email);
      await this.safeFill(this.page.getByRole('textbox', { name: 'MOB_NO' }), data.mobileNo);
      await this.safeFill(this.page.getByRole('textbox', { name: 'ALT_MOBILE_NO' }), data.alternateMobileNo);
      
      // Address
      await this.safeFill(this.page.getByRole('textbox', { name: 'ADDRESS_LINE1' }), data.addressLine1);
      await this.safeFill(this.page.getByRole('textbox', { name: 'ADDRESS_LINE2' }), data.addressLine2);
      await this.safeFill(this.page.getByRole('textbox', { name: 'LANDMARK' }), data.landmark);
      
      // Location
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-STATE'),
        data.state
      );
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-CITY'),
        data.city
      );
      
      await this.safeFill(this.page.getByRole('textbox', { name: 'PIN' }), data.pinCode);
      
      // Identity Documents
      await this.safeFill(this.page.getByRole('textbox', { name: 'PAN_NO' }), data.panNo);
      await this.safeFill(this.page.getByRole('textbox', { name: 'AADHAAR_NO' }), data.aadhaarNo);
      
      console.log('Personal details filled successfully');
    } catch (error) {
      console.error('Error filling personal details:', error.message);
      throw error;
    }
  }

  /**
   * Fill AA Membership details section
   * @param {Object} data - AA Membership data
   */
  async fillAAMembershipDetails(data) {
    try {
      console.log('Filling AA Membership details...');
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-AA_ASSOCIATION'),
        data.associationName
      );
      
      await this.safeFill(this.page.getByRole('textbox', { name: 'MEMBERSHIP_NO' }), data.membershipNo);
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-AA_MONTH'),
        data.validityMonth
      );
      
      await this.safeFill(this.page.getByRole('textbox', { name: 'AAYear' }), data.year);
      
      console.log('AA Membership details filled successfully');
    } catch (error) {
      console.error('Error filling AA Membership details:', error.message);
      throw error;
    }
  }

  /**
   * Fill NCB Carry Forward details section
   * @param {Object} data - NCB Carry Forward data
   */
  async fillNCBCarryForwardDetails(data) {
    try {
      console.log('Filling NCB Carry Forward details...');
      
      await this.safeFill(this.page.getByRole('textbox', { name: 'PREV_VEH_MAKE' }), data.make);
      await this.safeFill(this.page.getByRole('textbox', { name: 'PREV_VEH_MODEL' }), data.model);
      await this.safeFill(this.page.getByRole('textbox', { name: 'PREV_VEH_VARIANT_NO' }), data.variant);
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-PREV_VEH_YEAR_OF_MANUFACTURER'),
        data.yearOfManufacturer
      );
      
      await this.safeFill(this.page.getByRole('textbox', { name: 'PREV_VEH_CHASSIS_NO' }), data.chasisNo);
      await this.safeFill(this.page.getByRole('textbox', { name: 'PREV_VEH_ENGINE_NO' }), data.engineNo);
      await this.safeFill(this.page.getByRole('textbox', { name: 'PREV_VEH_REG_NO' }), data.registrationNo);
      await this.safeFill(this.page.getByRole('textbox', { name: 'PREV_VEH_POLICY_NONVISOF' }), data.previousPolicyNo);
      
      console.log('NCB Carry Forward details filled successfully');
    } catch (error) {
      console.error('Error filling NCB Carry Forward details:', error.message);
      throw error;
    }
  }

  /**
   * Fill policy details section
   * @param {Object} data - Policy details data
   */
  async fillPolicyDetailsSection(data) {
    try {
      console.log('Filling policy details section...');
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-INSURANCE_COMPANY'),
        data.insuranceCompany
      );
      
      await this.safeFill(this.page.getByRole('textbox', { name: 'PREV_VEH_ADDRESS' }), data.officeAddress);
      
      const policyStartInput = this.page.getByRole('textbox', { name: 'PREV_VEH_POLICYSTARTDATE' });
      await this.setDateOnInput(policyStartInput, data.policyPeriodFrom);
      
      const policyEndInput = this.page.getByRole('textbox', { name: 'PREV_VEH_POLICYENDDATE' });
      await this.setDateOnInput(policyEndInput, data.policyPeriodTo);
      
      console.log('Policy details section filled successfully');
    } catch (error) {
      console.error('Error filling policy details section:', error.message);
      throw error;
    }
  }

  /**
   * Fill nominee details section
   * @param {Object} data - Nominee details data
   */
  async fillNomineeDetails(data) {
    try {
      console.log('Filling nominee details...');
      
      await this.safeFill(this.page.getByRole('textbox', { name: 'NomineeName' }), data.nomineeName);
      await this.safeFill(this.page.getByRole('textbox', { name: 'NomineeAge' }), data.nomineeAge);
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-NomineeRelation'),
        data.nomineeRelation
      );
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-NomineeGender'),
        data.nomineeGender
      );
      
      console.log('Nominee details filled successfully');
    } catch (error) {
      console.error('Error filling nominee details:', error.message);
      throw error;
    }
  }

  /**
   * Fill payment details section
   * @param {Object} data - Payment details data
   */
  async fillPaymentDetails(data) {
    try {
      console.log('Filling payment details...');
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-PAYMENT_MODE'),
        data.paymentMode
      );
      
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-DP_NAME'),
        data.dpName
      );
      
      console.log('Payment details filled successfully');
    } catch (error) {
      console.error('Error filling payment details:', error.message);
      throw error;
    }
  }
}

module.exports = RenewPolicyPage;