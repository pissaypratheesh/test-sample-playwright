const FormUtils = require('./FormUtils');

/**
 * Proposal Details Utilities - Functions for proposal details form filling
 * Extends FormUtils for common form interactions
 */
class ProposalDetailsUtils extends FormUtils {
  constructor(page) {
    super(page);
  }

  /**
   * Fill proposal details form
   * @param {Object} proposalDetails - Proposal details object
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async fillProposalDetails(proposalDetails, takeScreenshot = true) {
    console.log('📋 Step: Filling Proposal Details Form');
    
    try {
      // Wait for proposal details form to be ready
      await this.page.waitForSelector('#mui-component-select-SALUTATION', { timeout: 30000 });
      
      // Fill all sections using smaller reusable functions
      await this.fillPersonalInformation(proposalDetails.personalDetails);
      await this.fillContactInformation(proposalDetails.personalDetails);
      await this.fillAddressInformation(proposalDetails.personalDetails);
      await this.fillIdentityDocuments(proposalDetails.personalDetails);
      await this.fillAAMembershipDetails(proposalDetails.aaMembershipDetails);
      await this.fillNCBCarryForwardDetails(proposalDetails.ncbCarryForwardDetails);
      await this.fillNomineeDetails(proposalDetails);
      await this.fillPaymentDetails(proposalDetails);
      await this.fillSolicitationDetails(proposalDetails);

      // Wait for form to process
      await this.page.waitForTimeout(2000);
      
      if (takeScreenshot) {
        await this.page.screenshot({ path: '.playwright-mcp/proposal-details-after-fill.png', fullPage: true });
      }
      
      console.log('✅ Proposal Details Form Filled');
    } catch (error) {
      console.error('❌ Error filling proposal details:', error.message);
      throw error;
    }
  }

  /**
   * Fill personal information section
   * @param {Object} personalDetails - Personal details object
   */
  async fillPersonalInformation(personalDetails) {
    console.log('📋 Filling Personal Information Section');
    
    try {
      // Salutation
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-SALUTATION'),
        personalDetails.salutation
      );

      // Names
      await this.safeFill(
        this.page.locator('input[name="FIRST_NAME"]'),
        personalDetails.firstName
      );

      await this.safeFill(
        this.page.locator('input[name="MIDDLE_NAME"]'),
        personalDetails.middleName
      );

      await this.safeFill(
        this.page.locator('input[name="LAST_NAME"]'),
        personalDetails.lastName
      );

      // Gender selection
      const maleButton = this.page.getByRole('button', { name: 'Male' }).first();
      const isMaleSelected = await maleButton.getAttribute('aria-pressed') === 'true';
      
      if (!isMaleSelected) {
        await maleButton.click();
      }

      // Date of Birth
      const dobInput = this.page.getByRole('textbox', { name: 'Choose date' });
      await this.setDateOnInput(dobInput, personalDetails.dateOfBirth);

      console.log('✅ Personal Information Section Filled');
    } catch (error) {
      console.error('❌ Error filling personal information:', error.message);
      throw error;
    }
  }

  /**
   * Fill contact information section
   * @param {Object} personalDetails - Personal details object
   */
  async fillContactInformation(personalDetails) {
    console.log('📋 Filling Contact Information Section');
    
    try {
      // Alternate Mobile Number
      await this.safeFill(
        this.page.locator('input[name="ALT_MOBILE_NO"]'),
        personalDetails.alternateMobileNo
      );

      console.log('✅ Contact Information Section Filled');
    } catch (error) {
      console.error('❌ Error filling contact information:', error.message);
      throw error;
    }
  }

  /**
   * Fill address information section
   * @param {Object} personalDetails - Personal details object
   */
  async fillAddressInformation(personalDetails) {
    console.log('📋 Filling Address Information Section');
    
    try {
      // Address Lines
      await this.safeFill(
        this.page.getByRole('textbox', { name: 'Address Line 1 *' }),
        personalDetails.addressLine1
      );

      await this.safeFill(
        this.page.getByRole('textbox', { name: 'Address Line 2' }),
        personalDetails.addressLine2
      );

      await this.safeFill(
        this.page.getByRole('textbox', { name: 'Landmark' }),
        personalDetails.landmark
      );

      // City dropdown
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-CITY_ID'),
        personalDetails.city
      );

      // Fill Pincode
      await this.safeFill(
        this.page.locator('input[name="PIN"]'),
        personalDetails.pinCode
      );

      // Fill Pincode dropdown (it's a dropdown, not text input)
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-PIN'),
        '110001'
      );

      console.log('✅ Address Information Section Filled');
    } catch (error) {
      console.error('❌ Error filling address information:', error.message);
      throw error;
    }
  }

  /**
   * Fill identity documents section
   * @param {Object} personalDetails - Personal details object
   */
  async fillIdentityDocuments(personalDetails) {
    console.log('📋 Filling Identity Documents Section');
    
    try {
      // PAN Number
      await this.safeFill(
        this.page.locator('input[name="PAN_NO"]'),
        personalDetails.panNo
      );

      // Aadhaar Number
      await this.safeFill(
        this.page.locator('input[name="AADHAAR_NO"]'),
        personalDetails.aadhaarNo
      );

      // EI Account Number
      await this.safeFill(
        this.page.locator('input[name="EI_ACCOUNT_NO"]'),
        personalDetails.ckycNo
      );

      // CKYC No (additional field found in HTML)
      await this.safeFill(
        this.page.locator('input[name="CKYC_NO"]'),
        'CKYC123456789'
      );

      console.log('✅ Identity Documents Section Filled');
    } catch (error) {
      console.error('❌ Error filling identity documents:', error.message);
      throw error;
    }
  }

  /**
   * Fill AA membership details section
   * @param {Object} aaMembershipDetails - AA membership details object
   */
  async fillAAMembershipDetails(aaMembershipDetails) {
    console.log('📋 Filling AA Membership Details Section');
    
    try {
      // Wait for AA Membership Details section to be ready
      console.log('📋 Waiting for AA Membership Details section to be ready...');
      try {
        await this.page.waitForSelector('#mui-component-select-ASSOCIATION_NAME', { timeout: 30000 });
        console.log('✅ AA Membership Details section is ready');
        
        await this.selectDropdownOption(
          this.page.locator('#mui-component-select-ASSOCIATION_NAME'),
          aaMembershipDetails.associationName
        );
      } catch (error) {
        console.log('⚠️ AA Membership Details section not found, skipping...');
      }

      // Membership Number
      await this.safeFill(
        this.page.locator('input[name="MEMBERSHIP_NO"]'),
        aaMembershipDetails.membershipNo
      );

      // Validity Month
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-AAMonth'),
        aaMembershipDetails.validityMonth
      );

      // Year
      await this.safeFill(
        this.page.locator('input[name="AAYear"]'),
        aaMembershipDetails.year
      );

      console.log('✅ AA Membership Details Section Filled');
    } catch (error) {
      console.error('❌ Error filling AA membership details:', error.message);
      throw error;
    }
  }

  /**
   * Fill NCB carry forward details section
   * @param {Object} ncbCarryForwardDetails - NCB carry forward details object
   */
  async fillNCBCarryForwardDetails(ncbCarryForwardDetails) {
    console.log('📋 Filling NCB Carry Forward Details Section');
    
    try {
      // Previous Policy Type
      await this.selectDropdownOption(
        this.page.getByRole('combobox', { name: 'Previous Policy Type' }),
        ncbCarryForwardDetails.prevPolicyType
      );

      // Previous Vehicle Details
      await this.safeFill(
        this.page.locator('input[name="PREV_VEH_MAKE"]'),
        ncbCarryForwardDetails.make
      );

      await this.safeFill(
        this.page.locator('input[name="PREV_VEH_MODEL"]'),
        ncbCarryForwardDetails.model
      );

      await this.safeFill(
        this.page.locator('input[name="PREV_VEH_VARIANT_NO"]'),
        ncbCarryForwardDetails.variant
      );

      await this.safeFill(
        this.page.locator('input[name="PREV_VEH_MANU_YEAR"]'),
        ncbCarryForwardDetails.yearOfManufacturer
      );

      await this.safeFill(
        this.page.locator('input[name="PREV_VEH_CHASSIS_NO"]'),
        ncbCarryForwardDetails.chasisNo
      );

      await this.safeFill(
        this.page.locator('input[name="PREV_VEH_ENGINE_NO"]'),
        ncbCarryForwardDetails.engineNo
      );

      // Invoice Date
      await this.setDateOnInput(
        this.page.locator('input[name="PREV_VEH_INVOICEDATE"]'),
        ncbCarryForwardDetails.invoiceDate
      );

      // Registration and Policy Details
      await this.safeFill(
        this.page.locator('input[name="PREV_VEH_REG_NO"]'),
        ncbCarryForwardDetails.registrationNo
      );

      await this.safeFill(
        this.page.locator('input[name="PREV_VEH_POLICY_NONVISOF"]'),
        ncbCarryForwardDetails.previousPolicyNo
      );

      // NCB Document Submitted checkbox
      const ncbCheckbox = this.page.getByRole('checkbox', { name: 'NCB document submitted' });
      if (await ncbCheckbox.isVisible()) {
        await ncbCheckbox.check();
      }

      console.log('✅ NCB Carry Forward Details Section Filled');
    } catch (error) {
      console.error('❌ Error filling NCB carry forward details:', error.message);
      throw error;
    }
  }

  /**
   * Fill nominee details section
   * @param {Object} proposalDetails - Proposal details object
   */
  async fillNomineeDetails(proposalDetails) {
    console.log('📋 Filling Nominee Details Section');
    
    // Nominee Name
    await this.safeFill(
      this.page.locator('input[name="NomineeName"]'),
      proposalDetails.nomineeDetails.nomineeName
    );

    // Nominee Age
    await this.safeFill(
      this.page.locator('input[name="NomineeAge"]'),
      proposalDetails.nomineeDetails.nomineeAge
    );

    // Nominee Relation
    await this.selectDropdownOption(
      this.page.locator('#mui-component-select-NomineeRelation'),
      proposalDetails.nomineeDetails.nomineeRelation
    );

    // Nominee Gender
    await this.selectDropdownOption(
      this.page.locator('#mui-component-select-NomineeGender'),
      proposalDetails.nomineeDetails.nomineeGender
    );

    console.log('✅ Nominee Details Section Filled');
  }

  /**
   * Fill payment details section
   * @param {Object} proposalDetails - Proposal details object
   */
  async fillPaymentDetails(proposalDetails) {
    console.log('📋 Filling Payment Mode Section');
    
    // Payment Mode
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'Payment Mode' }),
      proposalDetails.paymentDetails.paymentMode
    );

    console.log('✅ Payment Mode Section Filled');
  }

  /**
   * Fill solicitation details section
   * @param {Object} proposalDetails - Proposal details object
   */
  async fillSolicitationDetails(proposalDetails) {
    console.log('📋 Filling Solicitation Details Section');
    
    // DP Name
    await this.selectDropdownOption(
      this.page.getByRole('combobox', { name: 'DP Name' }),
      proposalDetails.paymentDetails.dpName
    );

    console.log('✅ Solicitation Details Section Filled');
  }
}

module.exports = ProposalDetailsUtils;
