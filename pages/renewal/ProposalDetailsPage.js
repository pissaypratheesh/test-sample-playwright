const BaseRenewalPage = require('./BaseRenewalPage');

/**
 * Page 3: Proposal Details
 * Handles the final proposal form with personal details, NCB carry forward, nominee, and payment details
 */
class ProposalDetailsPage extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Fill the complete proposal details form
   * @param {Object} data - Proposal details data
   */
  async fillProposalDetailsForm(data) {
    console.log('Starting Proposal Details Form');
    
    // Wait for proposal details page to load
    await this.waitForProposalPageToLoad();
    
    // Fill Personal Details section
    await this.fillPersonalDetailsSection(data.personalDetails);
    
    // Fill AA Membership Details section
    await this.fillAAMembershipSection(data.aaMembershipDetails);
    
    // Fill NCB Carry Forward Details section
    await this.fillNCBCarryForwardSection(data.ncbCarryForwardDetails);
    
    // Fill Policy Details section
    await this.fillPolicyDetailsSection(data.policyDetails);
    
    // Fill Nominee Details section
    await this.fillNomineeDetailsSection(data.nomineeDetails);
    
    // Fill Financier Details section
    await this.fillFinancierDetailsSection(data.financierDetails);
    
    // Fill Payment Details section
    await this.fillPaymentDetailsSection(data.paymentDetails);
    
    // Print comprehensive form summary before clicking Proposal Preview button
    await this.printFormSummary(data);
    
    // Click Proposal Preview button
    await this.clickProposalPreview();
    
    console.log('✅ Proposal Details Form completed successfully');
  }

  /**
   * Print comprehensive form summary with all filled values
   * @param {Object} data - Form data
   */
  async printFormSummary(data) {
    console.log('\n🔍 [ProposalDetailsPage] ===== COMPREHENSIVE FORM SUMMARY =====');
    
    try {
      // Personal Details Section
      console.log('\n📋 PERSONAL DETAILS SECTION:');
      console.log('----------------------------------------');
      
      // Salutation
      const salutationValue = await this.page.locator('#mui-component-select-SALUTATION').textContent().catch(() => 'Not found');
      console.log(`✅ Salutation: ${salutationValue}`);
      
      // Names
      const firstNameValue = await this.page.locator('input[name="FIRST_NAME"]').inputValue().catch(() => 'Not found');
      console.log(`✅ First Name: ${firstNameValue}`);
      
      const middleNameValue = await this.page.locator('input[name="MIDDLE_NAME"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Middle Name: ${middleNameValue}`);
      
      const lastNameValue = await this.page.locator('input[name="LAST_NAME"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Last Name: ${lastNameValue}`);
      
      // Date (DOB or DOI)
      const dobValue = await this.page.locator('input[name="DOB"]').inputValue().catch(() => 'Not found');
      const doiValue = await this.page.locator('input[name="DOI"]').inputValue().catch(() => 'Not found');
      if (dobValue !== 'Not found') {
        console.log(`✅ Date of Birth: ${dobValue}`);
      } else if (doiValue !== 'Not found') {
        console.log(`✅ Date of Incorporation: ${doiValue}`);
      } else {
        console.log(`❌ Date field: Not found`);
      }
      
      // Contact Information
      const emailValue = await this.page.locator('input[name="EMAIL"]').inputValue().catch(() => 'Not found');
      const emailEnabled = await this.page.locator('input[name="EMAIL"]').isEnabled().catch(() => false);
      console.log(`✅ Email: ${emailValue} ${emailEnabled ? '(enabled)' : '(disabled)'}`);
      
      const mobileValue = await this.page.locator('input[name="MOB_NO"]').inputValue().catch(() => 'Not found');
      const mobileEnabled = await this.page.locator('input[name="MOB_NO"]').isEnabled().catch(() => false);
      console.log(`✅ Mobile: ${mobileValue} ${mobileEnabled ? '(enabled)' : '(disabled)'}`);
      
      const altMobileValue = await this.page.locator('input[name="ALT_MOBILE_NO"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Alt Mobile: ${altMobileValue}`);
      
      // Address Information
      const address1Value = await this.page.locator('input[name="ADDRESS_LINE_1"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Address Line 1: ${address1Value}`);
      
      const address2Value = await this.page.locator('input[name="ADDRESS_LINE_2"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Address Line 2: ${address2Value}`);
      
      const landmarkValue = await this.page.locator('input[name="LANDMARK"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Landmark: ${landmarkValue}`);
      
      const stateValue = await this.page.locator('#mui-component-select-STATE').textContent().catch(() => 'Not found');
      console.log(`✅ State: ${stateValue}`);
      
      const cityValue = await this.page.locator('#mui-component-select-CITY').textContent().catch(() => 'Not found');
      console.log(`✅ City: ${cityValue}`);
      
      const pinCodeValue = await this.page.locator('input[name="PINCODE"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Pin Code: ${pinCodeValue}`);
      
      // Identity Documents
      const panValue = await this.page.locator('input[name="PAN_NO"]').inputValue().catch(() => 'Not found');
      console.log(`✅ PAN No: ${panValue}`);
      
      const aadhaarValue = await this.page.locator('input[name="AADHAAR_NO"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Aadhaar No: ${aadhaarValue}`);
      
      const eiAccountValue = await this.page.locator('input[name="EI_ACCOUNT_NO"]').inputValue().catch(() => 'Not found');
      console.log(`✅ EI Account No: ${eiAccountValue}`);
      
      // AA Membership Details Section
      console.log('\n📋 AA MEMBERSHIP DETAILS SECTION:');
      console.log('----------------------------------------');
      
      const associationNameValue = await this.page.locator('#mui-component-select-ASSOCIATION_NAME').textContent().catch(() => 'Not found');
      console.log(`✅ Association Name: ${associationNameValue}`);
      
      const aaMonthValue = await this.page.locator('#mui-component-select-AAMonth').textContent().catch(() => 'Not found');
      console.log(`✅ AA Month: ${aaMonthValue}`);
      
      // NCB Carry Forward Details Section
      console.log('\n📋 NCB CARRY FORWARD DETAILS SECTION:');
      console.log('----------------------------------------');
      
      const prevVehManuYearValue = await this.page.locator('#mui-component-select-PREV_VEH_MANU_YEAR').textContent().catch(() => 'Not found');
      console.log(`✅ Previous Vehicle Manufacture Year: ${prevVehManuYearValue}`);
      
      const prevVehIcValue = await this.page.locator('#mui-component-select-PREV_VEH_IC').textContent().catch(() => 'Not found');
      console.log(`✅ Previous Vehicle Insurance Company: ${prevVehIcValue}`);
      
      const policyPeriodToValue = await this.page.locator('input[name="POLICY_PERIOD_TO"]').inputValue().catch(() => 'Not found');
      console.log(`✅ Policy Period To: ${policyPeriodToValue}`);
      
      const ncbDocSubmittedValue = await this.page.locator('input[name="NCB_DOC_SUBMITTED"]').isChecked().catch(() => false);
      console.log(`✅ NCB Document Submitted: ${ncbDocSubmittedValue ? 'Yes' : 'No'}`);
      
      // Policy Details Section
      console.log('\n📋 POLICY DETAILS SECTION:');
      console.log('----------------------------------------');
      
      const policyPrevVehIcValue = await this.page.locator('#mui-component-select-PREV_VEH_IC').textContent().catch(() => 'Not found');
      console.log(`✅ Policy Previous Vehicle IC: ${policyPrevVehIcValue}`);
      
      // Nominee Details Section
      console.log('\n📋 NOMINEE DETAILS SECTION:');
      console.log('----------------------------------------');
      
      const nomineeRelationValue = await this.page.locator('#mui-component-select-NomineeRelation').textContent().catch(() => 'Not found');
      console.log(`✅ Nominee Relation: ${nomineeRelationValue}`);
      
      const nomineeGenderValue = await this.page.locator('#mui-component-select-NomineeGender').textContent().catch(() => 'Not found');
      console.log(`✅ Nominee Gender: ${nomineeGenderValue}`);
      
      // Payment Details Section
      console.log('\n📋 PAYMENT DETAILS SECTION:');
      console.log('----------------------------------------');
      
      const paymentModeValue = await this.page.locator('#mui-component-select-PAYMENT_MODE').textContent().catch(() => 'Not found');
      console.log(`✅ Payment Mode: ${paymentModeValue}`);
      
      const dpNameValue = await this.page.locator('input[name="DP_NAME"]').inputValue().catch(() => 'Not found');
      console.log(`✅ DP Name: ${dpNameValue}`);
      
      console.log('\n🔍 [ProposalDetailsPage] ===== FORM SUMMARY COMPLETED =====\n');
      
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Error printing form summary: ${e.message}`);
    }
  }

  /**
   * Wait for proposal details page to load
   */
  async waitForProposalPageToLoad() {
    console.log('Waiting for proposal details page to load...');
    
    // Wait for proposal page to load
    await Promise.race([
      this.page.waitForSelector('input[name="DOB"]', { timeout: 60000 }).catch(() => null),
      this.page.waitForSelector('text=/Proposal|Proposer|Checkout/i', { timeout: 60000 }).catch(() => null),
      this.page.waitForSelector('input[name="FIRST_NAME"]', { timeout: 60000 }).catch(() => null),
    ]);
    
    console.log('✅ Proposal details page loaded');
  }

  /**
   * Fill Personal Details section
   * @param {Object} personalDetails - Personal details data
   */
  async fillPersonalDetailsSection(personalDetails) {
    console.log('🔍 [ProposalDetailsPage] ===== FILLING PERSONAL DETAILS SECTION =====');
    console.log(`🔍 [ProposalDetailsPage] Data received:`, JSON.stringify(personalDetails, null, 2));
    
    try {
      // Wait for the proposal details section to be visible
      await this.page.waitForSelector('text=Proposer Details', { timeout: 10000 }).catch(() => {});
      
      // Salutation
      console.log(`🔍 [ProposalDetailsPage] Attempting to fill salutation: ${personalDetails.salutation}`);
      await this.fillSalutation(personalDetails.salutation);
      
      // Names
      console.log(`🔍 [ProposalDetailsPage] Attempting to fill name fields`);
      await this.fillNameFields(personalDetails);
      
      // Date of Birth/Incorporation
      console.log(`🔍 [ProposalDetailsPage] Attempting to fill date field: ${personalDetails.dateOfBirth}`);
      await this.fillDateOfBirth(personalDetails.dateOfBirth);
      
      // Contact Information
      console.log(`🔍 [ProposalDetailsPage] Attempting to fill contact information`);
      await this.fillContactInformation(personalDetails);
      
      // Address Information
      console.log(`🔍 [ProposalDetailsPage] Attempting to fill address information`);
      await this.fillAddressInformation(personalDetails);
      
      // Identity Documents
      console.log(`🔍 [ProposalDetailsPage] Attempting to fill identity documents`);
      await this.fillIdentityDocuments(personalDetails);
      
      console.log('✅ [ProposalDetailsPage] Personal Details section filled');
      
    } catch (e) {
      console.log('❌ [ProposalDetailsPage] Error filling Personal Details section:', e.message);
    }
  }

  /**
   * Fill salutation dropdown
   * @param {string} salutation - Salutation value
   */
  async fillSalutation(salutation) {
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling salutation: ${salutation}`);
      
      // Try multiple selectors for salutation dropdown
      const selectors = [
        '#mui-component-select-SALUTATION',
        '#mui-component-select-Salutation',
        '[name="SALUTATION"]',
        '[name="Salutation"]',
        'select[name*="salutation" i]',
        'select[name*="SALUTATION"]',
        '.MuiSelect-select:has-text("--Select Salutation--")',
        '[aria-label*="salutation" i]',
        '[aria-labelledby*="salutation" i]'
      ];
      
      for (const selector of selectors) {
        try {
          console.log(`🔍 [ProposalDetailsPage] Trying selector: ${selector}`);
          const element = this.page.locator(selector).first();
          const isVisible = await element.isVisible({ timeout: 1000 });
          console.log(`🔍 [ProposalDetailsPage] Selector "${selector}" visible: ${isVisible}`);
          
          if (isVisible) {
            // Check current value
            const currentValue = await element.textContent().catch(() => '');
            console.log(`🔍 [ProposalDetailsPage] Current salutation value: "${currentValue}"`);
            
            // Check if it's already set to what we want
            if (currentValue.includes(salutation) || currentValue.includes(salutation.toUpperCase())) {
              console.log(`✅ [ProposalDetailsPage] Salutation already set to: ${salutation}`);
              return;
            }
            
            // Try to select the option
            if (selector.includes('mui-component-select')) {
              // Close any open dropdowns first
              await this.page.keyboard.press('Escape');
              await this.page.waitForTimeout(500);
              
              await this.selectMuiOption(selector, salutation);
              console.log(`✅ [ProposalDetailsPage] Salutation filled via MUI: ${salutation}`);
              return;
            } else {
              await element.selectOption(salutation);
              console.log(`✅ [ProposalDetailsPage] Salutation filled via select: ${salutation}`);
              return;
            }
          }
        } catch (e) {
          console.log(`🔍 [ProposalDetailsPage] Error with selector "${selector}": ${e.message}`);
        }
      }
      
      // Try finding by text content
      try {
        console.log(`🔍 [ProposalDetailsPage] Trying to find salutation dropdown by text...`);
        const salutationDropdown = this.page.locator('text=--Select Salutation--').first();
        const dropdownVisible = await salutationDropdown.isVisible({ timeout: 2000 });
        console.log(`🔍 [ProposalDetailsPage] Salutation dropdown by text visible: ${dropdownVisible}`);
        
        if (dropdownVisible) {
          await salutationDropdown.click();
          await this.page.waitForTimeout(500);
          
          // Try to find and click the option
          const option = this.page.locator(`text=${salutation}`).first();
          const optionVisible = await option.isVisible({ timeout: 2000 });
          console.log(`🔍 [ProposalDetailsPage] Salutation option "${salutation}" visible: ${optionVisible}`);
          
          if (optionVisible) {
            await option.click();
            console.log(`✅ [ProposalDetailsPage] Salutation filled via text click: ${salutation}`);
            return;
          }
        }
      } catch (e) {
        console.log(`🔍 [ProposalDetailsPage] Error finding salutation by text: ${e.message}`);
      }
      
      console.log(`❌ [ProposalDetailsPage] Could not find salutation field with any method`);
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Could not fill salutation: ${e.message}`);
    }
  }

  /**
   * Fill name fields
   * @param {Object} personalDetails - Personal details data
   */
  async fillNameFields(personalDetails) {
    // First Name
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling first name: ${personalDetails.firstName}`);
      const firstNameInput = this.page.locator('input[name="FIRST_NAME"]');
      const isVisible = await firstNameInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] First name field visible: ${isVisible}`);
      
      if (isVisible) {
        await this.fillInput(firstNameInput, personalDetails.firstName);
        console.log(`✅ [ProposalDetailsPage] First name filled: ${personalDetails.firstName}`);
      } else {
        console.log(`❌ [ProposalDetailsPage] First name field not found`);
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Error filling first name: ${e.message}`);
    }
    
    // Middle Name
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling middle name: ${personalDetails.middleName}`);
      const middleNameInput = this.page.locator('input[name="MIDDLE_NAME"]');
      const isVisible = await middleNameInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] Middle name field visible: ${isVisible}`);
      
      if (isVisible) {
        await this.fillInput(middleNameInput, personalDetails.middleName);
        console.log(`✅ [ProposalDetailsPage] Middle name filled: ${personalDetails.middleName}`);
      } else {
        console.log(`❌ [ProposalDetailsPage] Middle name field not found`);
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Error filling middle name: ${e.message}`);
    }
    
    // Last Name
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling last name: ${personalDetails.lastName}`);
      const lastNameInput = this.page.locator('input[name="LAST_NAME"]');
      const isVisible = await lastNameInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] Last name field visible: ${isVisible}`);
      
      if (isVisible) {
        await this.fillInput(lastNameInput, personalDetails.lastName);
        console.log(`✅ [ProposalDetailsPage] Last name filled: ${personalDetails.lastName}`);
      } else {
        console.log(`❌ [ProposalDetailsPage] Last name field not found`);
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Error filling last name: ${e.message}`);
    }
  }

  /**
   * Fill date of birth or date of incorporation using DatePickerCore
   * @param {string} dateValue - Date in DD/MM/YYYY format
   */
  async fillDateOfBirth(dateValue) {
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling date field: ${dateValue}`);
      
      // Try Date of Birth first (for individual flows)
      let dateInput = this.page.locator('input[name="DOB"]');
      let isVisible = await dateInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] DOB field visible: ${isVisible}`);
      
      if (isVisible) {
        console.log(`🔍 [ProposalDetailsPage] Setting DOB to: ${dateValue}`);
        const success = await this.datePickerCore.setDateOnMaterialUIPicker(
          dateInput, 
          dateValue,
          { timeout: 10000 }
        );
        
        if (success) {
          const currentValue = await dateInput.inputValue();
          console.log(`✅ [ProposalDetailsPage] DOB set successfully: ${currentValue}`);
          return;
        } else {
          console.log(`❌ [ProposalDetailsPage] DatePickerCore failed for DOB, trying fallback method...`);
          await this.setDateOnInput(dateInput, dateValue);
          return;
        }
      }
      
      // Try Date of Incorporation (for corporate flows)
      dateInput = this.page.locator('input[name="DOI"]');
      isVisible = await dateInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] DOI field visible: ${isVisible}`);
      
      if (isVisible) {
        console.log(`🔍 [ProposalDetailsPage] Setting DOI (Date of Incorporation) to: ${dateValue}`);
        const success = await this.datePickerCore.setDateOnMaterialUIPicker(
          dateInput, 
          dateValue,
          { timeout: 10000 }
        );
        
        if (success) {
          const currentValue = await dateInput.inputValue();
          console.log(`✅ [ProposalDetailsPage] DOI set successfully: ${currentValue}`);
        } else {
          console.log(`❌ [ProposalDetailsPage] DatePickerCore failed for DOI, trying fallback method...`);
          await this.setDateOnInput(dateInput, dateValue);
        }
      } else {
        console.log(`❌ [ProposalDetailsPage] Neither DOB nor DOI field found`);
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Error filling date field: ${e.message}`);
    }
  }

  /**
   * Fill contact information
   * @param {Object} personalDetails - Personal details data
   */
  async fillContactInformation(personalDetails) {
    // Email
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling email: ${personalDetails.email}`);
      const emailInput = this.page.locator('input[name="EMAIL"]');
      const isVisible = await emailInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] Email field visible: ${isVisible}`);
      
      if (isVisible) {
        const isEnabled = await emailInput.isEnabled().catch(() => false);
        console.log(`🔍 [ProposalDetailsPage] Email field enabled: ${isEnabled}`);
        
        if (isEnabled) {
          await this.fillInput(emailInput, personalDetails.email);
          console.log(`✅ [ProposalDetailsPage] Email filled: ${personalDetails.email}`);
        } else {
          console.log(`⚠️ [ProposalDetailsPage] Email field is disabled, skipping...`);
        }
      } else {
        console.log(`❌ [ProposalDetailsPage] Email field not found`);
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Error filling email: ${e.message}`);
    }
    
    // Mobile Number
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling mobile number: ${personalDetails.mobileNo}`);
      const mobileInput = this.page.locator('input[name="MOB_NO"]');
      const isVisible = await mobileInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] Mobile field visible: ${isVisible}`);
      
      if (isVisible) {
        const isEnabled = await mobileInput.isEnabled().catch(() => false);
        console.log(`🔍 [ProposalDetailsPage] Mobile field enabled: ${isEnabled}`);
        
        if (isEnabled) {
          await this.fillInput(mobileInput, personalDetails.mobileNo);
          console.log(`✅ [ProposalDetailsPage] Mobile filled: ${personalDetails.mobileNo}`);
        } else {
          console.log(`⚠️ [ProposalDetailsPage] Mobile field is disabled, skipping...`);
        }
      } else {
        console.log(`❌ [ProposalDetailsPage] Mobile field not found`);
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Error filling mobile number: ${e.message}`);
    }
    
    // Alternate Mobile Number
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling alternate mobile: ${personalDetails.alternateMobileNo}`);
      const altMobileInput = this.page.locator('input[name="ALT_MOBILE_NO"]');
      const isVisible = await altMobileInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] Alt mobile field visible: ${isVisible}`);
      
      if (isVisible) {
        await this.fillInput(altMobileInput, personalDetails.alternateMobileNo);
        console.log(`✅ [ProposalDetailsPage] Alt mobile filled: ${personalDetails.alternateMobileNo}`);
      } else {
        console.log(`❌ [ProposalDetailsPage] Alt mobile field not found`);
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Error filling alternate mobile: ${e.message}`);
    }
  }

  /**
   * Fill address information
   * @param {Object} personalDetails - Personal details data
   */
  async fillAddressInformation(personalDetails) {
    // Address Line 1
    try {
      console.log('Filling address line 1...');
      const addr1Input = this.page.locator('input[name="ADDRESS1"]');
      if (await addr1Input.isVisible({ timeout: 2000 })) {
        await this.fillInput(addr1Input, personalDetails.addressLine1);
        console.log('✅ Address Line 1 set successfully');
      } else {
        console.log('Address Line 1 field not found');
      }
    } catch (e) {
      console.log('Error filling address line 1:', e.message);
    }
    
    // Address Line 2
    try {
      console.log('Filling address line 2...');
      const addr2Input = this.page.locator('input[name="ADDRESS_LINE2"], textarea[name="ADDRESS_LINE2"]');
      if (await addr2Input.isVisible({ timeout: 2000 })) {
        await this.fillInput(addr2Input, personalDetails.addressLine2);
      }
    } catch (e) {
      console.log('Error filling address line 2:', e.message);
    }
    
    // Landmark
    try {
      console.log('Filling landmark...');
      const landmarkInput = this.page.locator('input[name="LANDMARK"], textarea[name="LANDMARK"]');
      if (await landmarkInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(landmarkInput, personalDetails.landmark);
      }
    } catch (e) {
      console.log('Error filling landmark:', e.message);
    }
    
    // State
    try {
      console.log('Filling state...');
      await this.selectMuiOption('#mui-component-select-STATE_ID', personalDetails.state);
    } catch (e) {
      console.log('Error filling state:', e.message);
    }
    
    // City
    try {
      console.log('Filling city...');
      await this.selectMuiOption('#mui-component-select-CITY_ID', personalDetails.city);
    } catch (e) {
      console.log('Error filling city:', e.message);
    }
    
    // Pincode
    try {
      console.log('Filling pincode...');
      await this.selectMuiOption('#mui-component-select-PIN', personalDetails.pinCode);
      console.log('✅ Pincode set successfully');
    } catch (e) {
      console.log('Error filling pincode:', e.message);
    }
  }

  /**
   * Fill identity documents
   * @param {Object} personalDetails - Personal details data
   */
  async fillIdentityDocuments(personalDetails) {
    // PAN Number
    try {
      console.log('Filling PAN number...');
      const panInput = this.page.locator('input[name="PAN_NO"]');
      if (await panInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(panInput, personalDetails.panNo);
      }
    } catch (e) {
      console.log('Error filling PAN number:', e.message);
    }
    
    // Aadhaar Number
    try {
      console.log('Filling Aadhaar number...');
      const aadhaarInput = this.page.locator('input[name="AADHAAR_NO"]');
      if (await aadhaarInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(aadhaarInput, personalDetails.aadhaarNo);
      }
    } catch (e) {
      console.log('Error filling Aadhaar number:', e.message);
    }
    
    // EI Account Number (optional field)
    try {
      console.log('Filling EI account number...');
      const eiInput = this.page.locator('input[name="EI_ACCOUNT_NO"]');
      if (await eiInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(eiInput, personalDetails.eiAccountNo);
      }
    } catch (e) {
      console.log('Error filling EI account number:', e.message);
    }
  }

  /**
   * Fill AA Membership Details section
   * @param {Object} aaMembershipDetails - AA membership data
   */
  async fillAAMembershipSection(aaMembershipDetails) {
    console.log('🔍 [ProposalDetailsPage] Filling AA Membership Details section...');
    console.log('🔍 [ProposalDetailsPage] AA Membership Data:', JSON.stringify(aaMembershipDetails, null, 2));
    
    try {
      // Try to fill AA Membership fields directly without checking for section visibility
      // This matches the old renewPolicy.js approach - try to fill, catch errors and continue
      // Association Name
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Association Name: ${aaMembershipDetails.associationName}`);
        
        // Check if the current value matches what we want
        const currentValue = await this.page.locator('#mui-component-select-ASSOCIATION_NAME').textContent().catch(() => '');
        console.log(`🔍 [ProposalDetailsPage] Current Association Name: "${currentValue}"`);
        
        if (currentValue.includes(aaMembershipDetails.associationName)) {
          console.log(`✅ [ProposalDetailsPage] Association Name already set to: ${aaMembershipDetails.associationName}`);
        } else {
          // Close any open dropdowns first
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(500);
          
        await this.selectMuiOption('#mui-component-select-ASSOCIATION_NAME', aaMembershipDetails.associationName);
          console.log(`✅ [ProposalDetailsPage] Association Name set to: ${aaMembershipDetails.associationName}`);
        }
      } catch (e) {
        console.log(`❌ [ProposalDetailsPage] Could not fill Association Name: ${e.message}`);
      }
      
      // Membership No
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Membership No: ${aaMembershipDetails.membershipNo}`);
        const membershipInput = this.page.locator('input[name="MEMBERSHIP_NO"]');
        const isVisible = await membershipInput.isVisible({ timeout: 2000 });
        console.log(`🔍 [ProposalDetailsPage] Membership No field visible: ${isVisible}`);
        
        if (isVisible) {
          const currentValue = await membershipInput.inputValue().catch(() => '');
          console.log(`🔍 [ProposalDetailsPage] Current Membership No: "${currentValue}"`);
          
          if (currentValue === aaMembershipDetails.membershipNo) {
            console.log(`✅ [ProposalDetailsPage] Membership No already set to: ${aaMembershipDetails.membershipNo}`);
          } else {
          await this.fillInput(membershipInput, aaMembershipDetails.membershipNo);
            console.log(`✅ [ProposalDetailsPage] Membership No set to: ${aaMembershipDetails.membershipNo}`);
          }
        }
      } catch (e) {
        console.log(`❌ [ProposalDetailsPage] Could not fill Membership No: ${e.message}`);
      }
      
      // Validity Month
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Validity Month: ${aaMembershipDetails.validityMonth}`);
        
        // Check if the current value matches what we want
        const currentValue = await this.page.locator('#mui-component-select-AAMonth').textContent().catch(() => '');
        console.log(`🔍 [ProposalDetailsPage] Current Validity Month: "${currentValue}"`);
        
        if (currentValue.includes(aaMembershipDetails.validityMonth)) {
          console.log(`✅ [ProposalDetailsPage] Validity Month already set to: ${aaMembershipDetails.validityMonth}`);
        } else {
          // Close any open dropdowns first
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(500);
          
        await this.selectMuiOption('#mui-component-select-AAMonth', aaMembershipDetails.validityMonth);
          console.log(`✅ [ProposalDetailsPage] Validity Month set to: ${aaMembershipDetails.validityMonth}`);
        }
      } catch (e) {
        console.log(`❌ [ProposalDetailsPage] Could not fill Validity Month: ${e.message}`);
      }
      
      // Year
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Year: ${aaMembershipDetails.year}`);
        const yearInput = this.page.locator('input[name="AAYear"]');
        const isVisible = await yearInput.isVisible({ timeout: 2000 });
        console.log(`🔍 [ProposalDetailsPage] Year field visible: ${isVisible}`);
        
        if (isVisible) {
          const currentValue = await yearInput.inputValue().catch(() => '');
          console.log(`🔍 [ProposalDetailsPage] Current Year: "${currentValue}"`);
          
          if (currentValue === aaMembershipDetails.year) {
            console.log(`✅ [ProposalDetailsPage] Year already set to: ${aaMembershipDetails.year}`);
          } else {
          await this.fillInput(yearInput, aaMembershipDetails.year);
            console.log(`✅ [ProposalDetailsPage] Year set to: ${aaMembershipDetails.year}`);
          }
        }
      } catch (e) {
        console.log(`❌ [ProposalDetailsPage] Could not fill Year: ${e.message}`);
      }
      
      console.log('✅ [ProposalDetailsPage] AA Membership Details section filled');
      
    } catch (e) {
      console.log('❌ [ProposalDetailsPage] Error filling AA Membership Details section:', e.message);
    }
  }

  /**
   * Fill NCB Carry Forward Details section
   * @param {Object} ncbCarryForwardDetails - NCB carry forward data
   */
  async fillNCBCarryForwardSection(ncbCarryForwardDetails) {
    console.log('🔍 [ProposalDetailsPage] Filling NCB Carry Forward Details section...');
    console.log('🔍 [ProposalDetailsPage] NCB Data:', JSON.stringify(ncbCarryForwardDetails, null, 2));
    
    try {
      // Try to fill NCB Carry Forward fields directly without checking for section visibility
      // This matches the old renewPolicy.js approach - try to fill, catch errors and continue
      // Vehicle Details
      await this.fillNCBVehicleDetails(ncbCarryForwardDetails);
      
      // Policy Details
      await this.fillNCBPolicyDetails(ncbCarryForwardDetails);
      
      // NCB Document Submitted Checkbox
      await this.fillNCBDocumentCheckbox(ncbCarryForwardDetails);
      
      console.log('✅ [ProposalDetailsPage] NCB Carry Forward Details section filled');
      
    } catch (e) {
      console.log('❌ [ProposalDetailsPage] Error filling NCB Carry Forward Details section:', e.message);
    }
  }

  /**
   * Fill NCB vehicle details
   * @param {Object} ncbCarryForwardDetails - NCB carry forward data
   */
  async fillNCBVehicleDetails(ncbCarryForwardDetails) {
    console.log('🔍 [ProposalDetailsPage] Filling NCB Vehicle Details...');
    
    // Make
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling Make: ${ncbCarryForwardDetails.make}`);
      const makeInput = this.page.locator('input[name="PREV_VEH_MAKE"]');
      const isVisible = await makeInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] Make field visible: ${isVisible}`);
      
      if (isVisible) {
        const currentValue = await makeInput.inputValue().catch(() => '');
        console.log(`🔍 [ProposalDetailsPage] Current Make value: "${currentValue}"`);
        
        if (currentValue === ncbCarryForwardDetails.make) {
          console.log(`✅ [ProposalDetailsPage] Make already set to: ${ncbCarryForwardDetails.make}`);
        } else {
        await this.fillInput(makeInput, ncbCarryForwardDetails.make);
          console.log(`✅ [ProposalDetailsPage] Make filled: ${ncbCarryForwardDetails.make}`);
        }
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Could not fill Make: ${e.message}`);
    }
    
    // Model
    try {
      console.log(`🔍 [ProposalDetailsPage] Filling Model: ${ncbCarryForwardDetails.model}`);
      const modelInput = this.page.locator('input[name="PREV_VEH_MODEL"]');
      const isVisible = await modelInput.isVisible({ timeout: 2000 });
      console.log(`🔍 [ProposalDetailsPage] Model field visible: ${isVisible}`);
      
      if (isVisible) {
        const currentValue = await modelInput.inputValue().catch(() => '');
        console.log(`🔍 [ProposalDetailsPage] Current Model value: "${currentValue}"`);
        
        if (currentValue === ncbCarryForwardDetails.model) {
          console.log(`✅ [ProposalDetailsPage] Model already set to: ${ncbCarryForwardDetails.model}`);
        } else {
        await this.fillInput(modelInput, ncbCarryForwardDetails.model);
          console.log(`✅ [ProposalDetailsPage] Model filled: ${ncbCarryForwardDetails.model}`);
        }
      }
    } catch (e) {
      console.log(`❌ [ProposalDetailsPage] Could not fill Model: ${e.message}`);
    }
    
    // Variant
    try {
      const variantInput = this.page.locator('input[name="PREV_VEH_VARIANT_NO"]');
      if (await variantInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(variantInput, ncbCarryForwardDetails.variant);
      }
    } catch (e) {
      console.log('Could not fill Variant:', e.message);
    }
    
    // Year Of Manufacturer
    try {
      await this.selectMuiOption('#mui-component-select-PREV_VEH_MANU_YEAR', ncbCarryForwardDetails.yearOfManufacturer);
    } catch (e) {
      console.log('Could not fill Year Of Manufacturer:', e.message);
    }
    
    // Chassis No
    try {
      const chassisInput = this.page.locator('input[name="PREV_VEH_CHASSIS_NO"]');
      if (await chassisInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(chassisInput, ncbCarryForwardDetails.chasisNo);
      }
    } catch (e) {
      console.log('Could not fill Chassis No:', e.message);
    }
    
    // Engine No
    try {
      const engineInput = this.page.locator('input[name="PREV_VEH_ENGINE_NO"]');
      if (await engineInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(engineInput, ncbCarryForwardDetails.engineNo);
      }
    } catch (e) {
      console.log('Could not fill Engine No:', e.message);
    }
    
    // Invoice Date
    try {
      const invoiceInput = this.page.locator('input[name="PREV_VEH_INVOICEDATE"]');
      if (await invoiceInput.isVisible({ timeout: 2000 })) {
        await this.setDateOnInput(invoiceInput, ncbCarryForwardDetails.invoiceDate);
      }
    } catch (e) {
      console.log('Could not fill Invoice Date:', e.message);
    }
    
    // Registration No
    try {
      const regInput = this.page.locator('input[name="PREV_VEH_REG_NO"]');
      if (await regInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(regInput, ncbCarryForwardDetails.registrationNo);
      }
    } catch (e) {
      console.log('Could not fill Registration No:', e.message);
    }
    
    // Previous Policy No
    try {
      const prevPolicyInput = this.page.locator('input[name="PREV_VEH_POLICY_NONVISOF"]');
      if (await prevPolicyInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(prevPolicyInput, ncbCarryForwardDetails.previousPolicyNo);
      }
    } catch (e) {
      console.log('Could not fill Previous Policy No:', e.message);
    }
  }

  /**
   * Fill NCB policy details
   * @param {Object} ncbCarryForwardDetails - NCB carry forward data
   */
  async fillNCBPolicyDetails(ncbCarryForwardDetails) {
    // Insurance Company
    try {
      await this.selectMuiOption('#mui-component-select-PREV_VEH_IC', ncbCarryForwardDetails.insuranceCompany);
    } catch (e) {
      console.log('Could not fill Insurance Company:', e.message);
    }
    
    // Office Address
    try {
      const officeInput = this.page.locator('input[name="PREV_VEH_ADDRESS"]');
      if (await officeInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(officeInput, ncbCarryForwardDetails.officeAddress);
      }
    } catch (e) {
      console.log('Could not fill Office Address:', e.message);
    }
    
    // Policy Period From
    try {
      const policyFromInput = this.page.locator('input[name="PREV_VEH_POLICYSTARTDATE"]');
      if (await policyFromInput.isVisible({ timeout: 2000 })) {
        await this.setDateOnInput(policyFromInput, ncbCarryForwardDetails.policyPeriodFrom);
      }
    } catch (e) {
      console.log('Could not fill Policy Period From:', e.message);
    }
    
    // Policy Period To
    try {
      console.log('Filling Policy Period To using DatePickerCore...');
      const policyToInput = this.page.locator('input[name="PREV_VEH_POLICYENDDATE"]');
      if (await policyToInput.isVisible({ timeout: 2000 })) {
        console.log(`Setting Policy Period To to: ${ncbCarryForwardDetails.policyPeriodTo}`);
        const success = await this.datePickerCore.setDateOnMaterialUIPicker(
          policyToInput, 
          ncbCarryForwardDetails.policyPeriodTo,
          { timeout: 10000 }
        );
        
        if (success) {
          const currentValue = await policyToInput.inputValue();
          console.log(`✅ Policy Period To set successfully using DatePickerCore: ${currentValue}`);
        } else {
          console.log('❌ DatePickerCore failed for Policy Period To, trying fallback...');
          await this.setDateOnInput(policyToInput, ncbCarryForwardDetails.policyPeriodTo);
        }
      }
    } catch (e) {
      console.log('Could not fill Policy Period To:', e.message);
    }
    
    // NCB Certificate Effective Date
    try {
      const ncbDateInput = this.page.locator('input[name="PREV_VEH_NCB_EFFECTIVE_DATE_NONVISOF"]');
      if (await ncbDateInput.isVisible({ timeout: 2000 })) {
        await this.setDateOnInput(ncbDateInput, ncbCarryForwardDetails.invoiceDate);
      }
    } catch (e) {
      console.log('Could not fill NCB Certificate Effective Date:', e.message);
    }
  }

  /**
   * Fill NCB document submitted checkbox
   * @param {Object} ncbCarryForwardDetails - NCB carry forward data
   */
  async fillNCBDocumentCheckbox(ncbCarryForwardDetails) {
    try {
      console.log('Setting NCB Document Submitted checkbox...');
      if (ncbCarryForwardDetails.ncbDocumentSubmitted) {
        const ncbCheckbox = this.page.locator('input[name="PREV_VEH_ISNCBCERTIFICATE"]');
        
        if (await ncbCheckbox.isVisible({ timeout: 2000 })) {
          const isChecked = await ncbCheckbox.isChecked();
          if (!isChecked) {
            await ncbCheckbox.click();
            console.log('✅ NCB Document Submitted checkbox checked');
          } else {
            console.log('✅ NCB Document Submitted checkbox already checked');
          }
        } else {
          console.log('NCB Document Submitted checkbox not found');
        }
      }
    } catch (e) {
      console.log('Error setting NCB Document Submitted checkbox:', e.message);
    }
  }

  /**
   * Fill Policy Details section
   * @param {Object} policyDetails - Policy details data
   */
  async fillPolicyDetailsSection(policyDetails) {
    console.log('🔍 [ProposalDetailsPage] Filling Policy Details section...');
    console.log('🔍 [ProposalDetailsPage] Policy Details Data:', JSON.stringify(policyDetails, null, 2));
    
    try {
      // Insurance Company
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Insurance Company: ${policyDetails.insuranceCompany}`);
        await this.selectMuiOption('#mui-component-select-PREV_VEH_IC', policyDetails.insuranceCompany);
        console.log(`✅ [ProposalDetailsPage] Insurance Company filled: ${policyDetails.insuranceCompany}`);
      } catch (e) {
        console.log(`❌ [ProposalDetailsPage] Could not fill Insurance Company: ${e.message}`);
      }
      
      // Office Address
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Office Address: ${policyDetails.officeAddress}`);
        const officeInput = this.page.locator('input[name="PREV_VEH_ADDRESS"]');
        const isVisible = await officeInput.isVisible({ timeout: 2000 });
        console.log(`🔍 [ProposalDetailsPage] Office Address field visible: ${isVisible}`);
        
        if (isVisible) {
          const currentValue = await officeInput.inputValue().catch(() => '');
          console.log(`🔍 [ProposalDetailsPage] Current Office Address value: "${currentValue}"`);
          
          if (currentValue === policyDetails.officeAddress) {
            console.log(`✅ [ProposalDetailsPage] Office Address already set to: ${policyDetails.officeAddress}`);
          } else {
          await this.fillInput(officeInput, policyDetails.officeAddress);
            console.log(`✅ [ProposalDetailsPage] Office Address filled: ${policyDetails.officeAddress}`);
          }
        }
      } catch (e) {
        console.log(`❌ [ProposalDetailsPage] Could not fill Office Address: ${e.message}`);
      }
      
      console.log('✅ [ProposalDetailsPage] Policy Details section filled');
      
    } catch (e) {
      console.log('❌ [ProposalDetailsPage] Error filling Policy Details section:', e.message);
    }
  }

  /**
   * Fill Financier Details section
   * @param {Object} financierDetails - Financier details data
   */
  async fillFinancierDetailsSection(financierDetails) {
    console.log('🔍 [ProposalDetailsPage] Filling Financier Details section...');
    console.log('🔍 [ProposalDetailsPage] Financier Details Data:', JSON.stringify(financierDetails, null, 2));
    
    try {
      // Try to fill financier fields directly without checking for section visibility
      // This matches the old renewPolicy.js approach
      
      // Agreement Type
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Agreement Type: ${financierDetails.agreementType}`);
        
        // Check if dropdown is visible
        const agreementDropdown = this.page.locator('#mui-component-select-AGREEMENT_TYPE');
        const isVisible = await agreementDropdown.isVisible({ timeout: 2000 });
        console.log(`🔍 [ProposalDetailsPage] Agreement Type dropdown visible: ${isVisible}`);
        
        if (isVisible) {
          // Check current value
          const currentValue = await agreementDropdown.textContent().catch(() => '');
          console.log(`🔍 [ProposalDetailsPage] Current Agreement Type value: "${currentValue}"`);
          
          // Check if it's already set to what we want
          if (currentValue.includes(financierDetails.agreementType) || currentValue.includes(financierDetails.agreementType.toUpperCase())) {
            console.log(`✅ [ProposalDetailsPage] Agreement Type already set to: ${financierDetails.agreementType}`);
          } else {
            // Close any open dropdowns first
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
            
            await this.selectMuiOption('#mui-component-select-AGREEMENT_TYPE', financierDetails.agreementType);
            console.log(`✅ [ProposalDetailsPage] Agreement Type filled: ${financierDetails.agreementType}`);
          }
        } else {
          console.log('⚠️ [ProposalDetailsPage] Agreement Type dropdown not found, skipping...');
        }
      } catch (e) {
        console.log(`⚠️ [ProposalDetailsPage] Could not fill Agreement Type: ${e.message}`);
      }
      
      // Financier Name
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Financier Name: ${financierDetails.financierName}`);
        
        // Check if dropdown is visible
        const financierDropdown = this.page.locator('#mui-component-select-FINANCIER_NAME');
        const isVisible = await financierDropdown.isVisible({ timeout: 2000 });
        console.log(`🔍 [ProposalDetailsPage] Financier Name dropdown visible: ${isVisible}`);
        
        if (isVisible) {
          // Check current value
          const currentValue = await financierDropdown.textContent().catch(() => '');
          console.log(`🔍 [ProposalDetailsPage] Current Financier Name value: "${currentValue}"`);
          
          // Check if it's already set to what we want
          if (currentValue.includes(financierDetails.financierName) || currentValue.includes(financierDetails.financierName.toUpperCase())) {
            console.log(`✅ [ProposalDetailsPage] Financier Name already set to: ${financierDetails.financierName}`);
          } else {
            // Close any open dropdowns first
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
            
            await this.selectMuiOption('#mui-component-select-FINANCIER_NAME', financierDetails.financierName);
            console.log(`✅ [ProposalDetailsPage] Financier Name filled: ${financierDetails.financierName}`);
          }
        } else {
          console.log('⚠️ [ProposalDetailsPage] Financier Name dropdown not found, skipping...');
        }
      } catch (e) {
        console.log(`⚠️ [ProposalDetailsPage] Could not fill Financier Name: ${e.message}`);
      }
      
      console.log('✅ [ProposalDetailsPage] Financier Details section completed');
      
    } catch (e) {
      console.log('⚠️ [ProposalDetailsPage] Error filling Financier Details section:', e.message);
    }
  }

  /**
   * Fill Nominee Details section
   * @param {Object} nomineeDetails - Nominee details data
   */
  async fillNomineeDetailsSection(nomineeDetails) {
    console.log('🔍 [ProposalDetailsPage] Filling Nominee Details section...');
    
    try {
      // Try to fill nominee fields directly without checking for section visibility
      // This matches the old renewPolicy.js approach
      
      // Nominee Name
      try {
        const nomineeNameInput = this.page.locator('input[name="NomineeName"]');
        if (await nomineeNameInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(nomineeNameInput, nomineeDetails.nomineeName);
          console.log(`✅ [ProposalDetailsPage] Nominee Name filled: ${nomineeDetails.nomineeName}`);
        } else {
          console.log('⚠️ [ProposalDetailsPage] Nominee Name field not found, skipping...');
        }
      } catch (e) {
        console.log('⚠️ [ProposalDetailsPage] Could not fill Nominee Name:', e.message);
      }
      
      // Nominee Age
      try {
        const nomineeAgeInput = this.page.locator('input[name="NomineeAge"]');
        if (await nomineeAgeInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(nomineeAgeInput, nomineeDetails.nomineeAge);
          console.log(`✅ [ProposalDetailsPage] Nominee Age filled: ${nomineeDetails.nomineeAge}`);
        } else {
          console.log('⚠️ [ProposalDetailsPage] Nominee Age field not found, skipping...');
        }
      } catch (e) {
        console.log('⚠️ [ProposalDetailsPage] Could not fill Nominee Age:', e.message);
      }
      
      // Nominee Relation
      try {
        const relationDropdown = this.page.locator('#mui-component-select-NomineeRelation');
        if (await relationDropdown.isVisible({ timeout: 2000 })) {
        await this.selectMuiOption('#mui-component-select-NomineeRelation', nomineeDetails.nomineeRelation);
          console.log(`✅ [ProposalDetailsPage] Nominee Relation filled: ${nomineeDetails.nomineeRelation}`);
        } else {
          console.log('⚠️ [ProposalDetailsPage] Nominee Relation dropdown not found, skipping...');
        }
      } catch (e) {
        console.log('⚠️ [ProposalDetailsPage] Could not fill Nominee Relation:', e.message);
      }
      
      // Nominee Gender
      try {
        const genderDropdown = this.page.locator('#mui-component-select-NomineeGender');
        if (await genderDropdown.isVisible({ timeout: 2000 })) {
        await this.selectMuiOption('#mui-component-select-NomineeGender', nomineeDetails.nomineeGender);
          console.log(`✅ [ProposalDetailsPage] Nominee Gender filled: ${nomineeDetails.nomineeGender}`);
        } else {
          console.log('⚠️ [ProposalDetailsPage] Nominee Gender dropdown not found, skipping...');
        }
      } catch (e) {
        console.log('⚠️ [ProposalDetailsPage] Could not fill Nominee Gender:', e.message);
      }
      
      console.log('✅ [ProposalDetailsPage] Nominee Details section completed');
      
    } catch (e) {
      console.log('⚠️ [ProposalDetailsPage] Error filling Nominee Details section:', e.message);
    }
  }

  /**
   * Fill Payment Details section
   * @param {Object} paymentDetails - Payment details data
   */
  async fillPaymentDetailsSection(paymentDetails) {
    console.log('🔍 [ProposalDetailsPage] Filling Payment Details section...');
    console.log('🔍 [ProposalDetailsPage] Payment Details Data:', JSON.stringify(paymentDetails, null, 2));
    
    try {
      // Try to fill payment fields directly without checking for dropdown visibility
      // This matches the old renewPolicy.js approach
      
      // Payment Mode
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling Payment Mode: ${paymentDetails.paymentMode}`);
        
        // Check if dropdown is visible
        const paymentModeDropdown = this.page.locator('#mui-component-select-PAYMENT_MODE');
        const isVisible = await paymentModeDropdown.isVisible({ timeout: 2000 });
        console.log(`🔍 [ProposalDetailsPage] Payment Mode dropdown visible: ${isVisible}`);
        
        if (isVisible) {
          // Check current value
          const currentValue = await paymentModeDropdown.textContent().catch(() => '');
          console.log(`🔍 [ProposalDetailsPage] Current Payment Mode value: "${currentValue}"`);
          
          // Check if it's already set to what we want
          if (currentValue.includes(paymentDetails.paymentMode) || currentValue.includes(paymentDetails.paymentMode.toUpperCase())) {
            console.log(`✅ [ProposalDetailsPage] Payment Mode already set to: ${paymentDetails.paymentMode}`);
          } else {
            // Close any open dropdowns first
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
            
        await this.selectMuiOption('#mui-component-select-PAYMENT_MODE', paymentDetails.paymentMode);
            console.log(`✅ [ProposalDetailsPage] Payment Mode filled: ${paymentDetails.paymentMode}`);
          }
        } else {
          console.log('⚠️ [ProposalDetailsPage] Payment Mode dropdown not found, skipping...');
        }
      } catch (e) {
        console.log(`⚠️ [ProposalDetailsPage] Could not fill Payment Mode: ${e.message}`);
      }
      
      // DP Name
      try {
        console.log(`🔍 [ProposalDetailsPage] Filling DP Name: ${paymentDetails.dpName}`);
        
        // Check if dropdown is visible
        const dpNameDropdown = this.page.locator('#mui-component-select-AgentID');
        const isVisible = await dpNameDropdown.isVisible({ timeout: 2000 });
        console.log(`🔍 [ProposalDetailsPage] DP Name dropdown visible: ${isVisible}`);
        
        if (isVisible) {
          // Check current value
          const currentValue = await dpNameDropdown.textContent().catch(() => '');
          console.log(`🔍 [ProposalDetailsPage] Current DP Name value: "${currentValue}"`);
          
          // Check if it's already set to what we want
          if (currentValue.includes(paymentDetails.dpName) || currentValue.includes(paymentDetails.dpName.toUpperCase())) {
            console.log(`✅ [ProposalDetailsPage] DP Name already set to: ${paymentDetails.dpName}`);
          } else {
            // Close any open dropdowns first
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
            
            await dpNameDropdown.click();
            await this.page.waitForTimeout(500);
            
            // Try to find and click the option
            const option = this.page.getByRole('option', { name: paymentDetails.dpName });
            const optionVisible = await option.isVisible({ timeout: 2000 });
            console.log(`🔍 [ProposalDetailsPage] DP Name option "${paymentDetails.dpName}" visible: ${optionVisible}`);
            
            if (optionVisible) {
              await option.click();
              console.log(`✅ [ProposalDetailsPage] DP Name filled: ${paymentDetails.dpName}`);
            } else {
              console.log(`⚠️ [ProposalDetailsPage] DP Name option "${paymentDetails.dpName}" not found`);
            }
          }
        } else {
          console.log('⚠️ [ProposalDetailsPage] DP Name dropdown not found, skipping...');
        }
      } catch (e) {
        console.log(`⚠️ [ProposalDetailsPage] Could not fill DP Name: ${e.message}`);
      }
      
      console.log('✅ [ProposalDetailsPage] Payment Details section completed');
      
    } catch (e) {
      console.log('⚠️ [ProposalDetailsPage] Error filling Payment Details section:', e.message);
    }
  }

  /**
   * Click Proposal Preview button
   */
  async clickProposalPreview() {
    try {
      console.log('Clicking Proposal Preview button...');
      const proposalPreviewButton = this.page.locator('button:has-text("Proposal Preview")');
      if (await proposalPreviewButton.isVisible({ timeout: 5000 })) {
        await proposalPreviewButton.click();
        console.log('✅ Proposal Preview button clicked successfully');
        
        // Wait for navigation to proposal preview/confirmation page
        try {
          console.log('Waiting for navigation to proposal preview page...');
          await this.page.waitForLoadState('networkidle', { timeout: 10000 });
          
          // Check if we're on a different page (proposal preview/confirmation)
          const currentUrl = this.page.url();
          console.log(`Current URL after button click: ${currentUrl}`);
          
          // Look for indicators that we're on the proposal preview page
          const previewIndicators = [
            'text=Proposal Preview',
            'text=Review Proposal',
            'text=Confirm Proposal',
            'text=Proposal Summary',
            'text=Policy Summary',
            'h1:has-text("Proposal")',
            'h2:has-text("Proposal")',
            'h3:has-text("Proposal")'
          ];
          
          let foundPreviewPage = false;
          for (const indicator of previewIndicators) {
            try {
              if (await this.page.locator(indicator).isVisible({ timeout: 2000 })) {
                console.log(`✅ Successfully navigated to proposal preview page! Found indicator: ${indicator}`);
                foundPreviewPage = true;
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (!foundPreviewPage) {
            console.log('⚠️ Navigation may not have occurred or preview page not detected');
            await this.page.screenshot({ path: '.playwright-mcp/proposal-preview-page.png' });
            console.log('Screenshot saved for debugging: proposal-preview-page.png');
          }
          
        } catch (navError) {
          console.log('Error waiting for navigation:', navError.message);
        }
        
        // Wait for 5 seconds on the proposal preview page before exiting
        console.log('Waiting 5 seconds on proposal preview page before exiting...');
        await this.page.waitForTimeout(5000);
        console.log('✅ 5 seconds completed, exiting test...');
        
      } else {
        console.log('Proposal Preview button not found');
      }
    } catch (e) {
      console.log('Error clicking Proposal Preview button:', e.message);
    }
  }

  /**
   * Print form data review for debugging
   * @param {Object} data - Complete form data
   */
  printFormDataReview(data) {
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
  }
}

module.exports = ProposalDetailsPage;
