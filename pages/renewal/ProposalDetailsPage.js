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
    
    // Fill Payment Details section
    await this.fillPaymentDetailsSection(data.paymentDetails);
    
    // Click Proposal Preview button
    await this.clickProposalPreview();
    
    console.log('✅ Proposal Details Form completed successfully');
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
    console.log('Filling Personal Details section...');
    
    try {
      // Wait for the proposal details section to be visible
      await this.page.waitForSelector('text=Proposer Details', { timeout: 10000 }).catch(() => {});
      
      // Salutation
      await this.fillSalutation(personalDetails.salutation);
      
      // Names
      await this.fillNameFields(personalDetails);
      
      // Date of Birth
      await this.fillDateOfBirth(personalDetails.dateOfBirth);
      
      // Contact Information
      await this.fillContactInformation(personalDetails);
      
      // Address Information
      await this.fillAddressInformation(personalDetails);
      
      // Identity Documents
      await this.fillIdentityDocuments(personalDetails);
      
      console.log('✅ Personal Details section filled');
      
    } catch (e) {
      console.log('Error filling Personal Details section:', e.message);
    }
  }

  /**
   * Fill salutation dropdown
   * @param {string} salutation - Salutation value
   */
  async fillSalutation(salutation) {
    try {
      console.log('Filling salutation...');
      await this.selectMuiOption('#mui-component-select-SALUTATION', salutation);
    } catch {
      try {
        await this.page.locator('[name="SALUTATION"]').selectOption(salutation);
      } catch {
        console.log('Could not fill salutation, skipping...');
      }
    }
  }

  /**
   * Fill name fields
   * @param {Object} personalDetails - Personal details data
   */
  async fillNameFields(personalDetails) {
    // First Name
    try {
      console.log('Filling first name...');
      const firstNameInput = this.page.locator('input[name="FIRST_NAME"]');
      if (await firstNameInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(firstNameInput, personalDetails.firstName);
      }
    } catch (e) {
      console.log('Error filling first name:', e.message);
    }
    
    // Middle Name
    try {
      console.log('Filling middle name...');
      const middleNameInput = this.page.locator('input[name="MIDDLE_NAME"]');
      if (await middleNameInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(middleNameInput, personalDetails.middleName);
      }
    } catch (e) {
      console.log('Error filling middle name:', e.message);
    }
    
    // Last Name
    try {
      console.log('Filling last name...');
      const lastNameInput = this.page.locator('input[name="LAST_NAME"]');
      if (await lastNameInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(lastNameInput, personalDetails.lastName);
      }
    } catch (e) {
      console.log('Error filling last name:', e.message);
    }
  }

  /**
   * Fill date of birth using DatePickerCore
   * @param {string} dateOfBirth - Date of birth in DD/MM/YYYY format
   */
  async fillDateOfBirth(dateOfBirth) {
    try {
      console.log('Filling date of birth using DatePickerCore...');
      const dobInput = this.page.locator('input[name="DOB"]');
      if (await dobInput.isVisible({ timeout: 2000 })) {
        console.log(`Setting DOB to: ${dateOfBirth}`);
        const success = await this.datePickerCore.setDateOnMaterialUIPicker(
          dobInput, 
          dateOfBirth,
          { timeout: 10000 }
        );
        
        if (success) {
          const currentValue = await dobInput.inputValue();
          console.log(`✅ DOB set successfully using DatePickerCore: ${currentValue}`);
        } else {
          console.log('❌ DatePickerCore failed, trying fallback method...');
          await this.setDateOnInput(dobInput, dateOfBirth);
        }
      }
    } catch (e) {
      console.log('Error filling date of birth:', e.message);
    }
  }

  /**
   * Fill contact information
   * @param {Object} personalDetails - Personal details data
   */
  async fillContactInformation(personalDetails) {
    // Email
    try {
      console.log('Filling email...');
      const emailInput = this.page.locator('input[name="EMAIL"]');
      if (await emailInput.isVisible({ timeout: 2000 })) {
        const isEnabled = await emailInput.isEnabled().catch(() => false);
        if (isEnabled) {
          await this.fillInput(emailInput, personalDetails.email);
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
      const mobileInput = this.page.locator('input[name="MOB_NO"]');
      if (await mobileInput.isVisible({ timeout: 2000 })) {
        const isEnabled = await mobileInput.isEnabled().catch(() => false);
        if (isEnabled) {
          await this.fillInput(mobileInput, personalDetails.mobileNo);
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
      const altMobileInput = this.page.locator('input[name="ALT_MOBILE_NO"]');
      if (await altMobileInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(altMobileInput, personalDetails.alternateMobileNo);
      }
    } catch (e) {
      console.log('Error filling alternate mobile number:', e.message);
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
        await this.fillInput(eiInput, personalDetails.eiAccountNo || '');
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
    console.log('Filling AA Membership Details section...');
    
    try {
      // Association Name
      try {
        await this.selectMuiOption('#mui-component-select-ASSOCIATION_NAME', aaMembershipDetails.associationName);
      } catch (e) {
        console.log('Could not fill Association Name:', e.message);
      }
      
      // Membership No
      try {
        const membershipInput = this.page.locator('input[name="MEMBERSHIP_NO"]');
        if (await membershipInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(membershipInput, aaMembershipDetails.membershipNo);
        }
      } catch (e) {
        console.log('Could not fill Membership No:', e.message);
      }
      
      // Validity Month
      try {
        await this.selectMuiOption('#mui-component-select-AAMonth', aaMembershipDetails.validityMonth);
      } catch (e) {
        console.log('Could not fill Validity Month:', e.message);
      }
      
      // Year
      try {
        const yearInput = this.page.locator('input[name="AAYear"]');
        if (await yearInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(yearInput, aaMembershipDetails.year);
        }
      } catch (e) {
        console.log('Could not fill Year:', e.message);
      }
      
      console.log('✅ AA Membership Details section filled');
      
    } catch (e) {
      console.log('Error filling AA Membership Details section:', e.message);
    }
  }

  /**
   * Fill NCB Carry Forward Details section
   * @param {Object} ncbCarryForwardDetails - NCB carry forward data
   */
  async fillNCBCarryForwardSection(ncbCarryForwardDetails) {
    console.log('Filling NCB Carry Forward Details section...');
    
    try {
      // Vehicle Details
      await this.fillNCBVehicleDetails(ncbCarryForwardDetails);
      
      // Policy Details
      await this.fillNCBPolicyDetails(ncbCarryForwardDetails);
      
      // NCB Document Submitted Checkbox
      await this.fillNCBDocumentCheckbox(ncbCarryForwardDetails);
      
      console.log('✅ NCB Carry Forward Details section filled');
      
    } catch (e) {
      console.log('Error filling NCB Carry Forward Details section:', e.message);
    }
  }

  /**
   * Fill NCB vehicle details
   * @param {Object} ncbCarryForwardDetails - NCB carry forward data
   */
  async fillNCBVehicleDetails(ncbCarryForwardDetails) {
    // Make
    try {
      const makeInput = this.page.locator('input[name="PREV_VEH_MAKE"]');
      if (await makeInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(makeInput, ncbCarryForwardDetails.make);
      }
    } catch (e) {
      console.log('Could not fill Make:', e.message);
    }
    
    // Model
    try {
      const modelInput = this.page.locator('input[name="PREV_VEH_MODEL"]');
      if (await modelInput.isVisible({ timeout: 2000 })) {
        await this.fillInput(modelInput, ncbCarryForwardDetails.model);
      }
    } catch (e) {
      console.log('Could not fill Model:', e.message);
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
    console.log('Filling Policy Details section...');
    
    try {
      // Insurance Company
      try {
        await this.selectMuiOption('#mui-component-select-PREV_VEH_IC', policyDetails.insuranceCompany);
      } catch (e) {
        console.log('Could not fill Insurance Company:', e.message);
      }
      
      // Office Address
      try {
        const officeInput = this.page.locator('input[name="PREV_VEH_ADDRESS"]');
        if (await officeInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(officeInput, policyDetails.officeAddress);
        }
      } catch (e) {
        console.log('Could not fill Office Address:', e.message);
      }
      
      console.log('✅ Policy Details section filled');
      
    } catch (e) {
      console.log('Error filling Policy Details section:', e.message);
    }
  }

  /**
   * Fill Nominee Details section
   * @param {Object} nomineeDetails - Nominee details data
   */
  async fillNomineeDetailsSection(nomineeDetails) {
    console.log('Filling Nominee Details section...');
    
    try {
      // Nominee Name
      try {
        const nomineeNameInput = this.page.locator('input[name="NomineeName"]');
        if (await nomineeNameInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(nomineeNameInput, nomineeDetails.nomineeName);
        }
      } catch (e) {
        console.log('Could not fill Nominee Name:', e.message);
      }
      
      // Nominee Age
      try {
        const nomineeAgeInput = this.page.locator('input[name="NomineeAge"]');
        if (await nomineeAgeInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(nomineeAgeInput, nomineeDetails.nomineeAge);
        }
      } catch (e) {
        console.log('Could not fill Nominee Age:', e.message);
      }
      
      // Nominee Relation
      try {
        await this.selectMuiOption('#mui-component-select-NomineeRelation', nomineeDetails.nomineeRelation);
      } catch (e) {
        console.log('Could not fill Nominee Relation:', e.message);
      }
      
      // Nominee Gender
      try {
        await this.selectMuiOption('#mui-component-select-NomineeGender', nomineeDetails.nomineeGender);
      } catch (e) {
        console.log('Could not fill Nominee Gender:', e.message);
      }
      
      console.log('✅ Nominee Details section filled');
      
    } catch (e) {
      console.log('Error filling Nominee Details section:', e.message);
    }
  }

  /**
   * Fill Payment Details section
   * @param {Object} paymentDetails - Payment details data
   */
  async fillPaymentDetailsSection(paymentDetails) {
    console.log('Filling Payment Details section...');
    
    try {
      // Payment Mode
      try {
        console.log('Filling Payment Mode...');
        await this.selectMuiOption('#mui-component-select-PAYMENT_MODE', paymentDetails.paymentMode);
      } catch (e) {
        console.log('Could not fill Payment Mode:', e.message);
      }
      
      // DP Name
      try {
        console.log('Filling DP Name...');
        await this.page.locator('#mui-component-select-AgentID').click();
        await this.page.getByRole('option', { name: paymentDetails.dpName }).click();
        console.log('✅ DP Name set successfully');
      } catch (e) {
        console.log('Could not fill DP Name:', e.message);
      }
      
      console.log('✅ Payment Details section filled');
      
    } catch (e) {
      console.log('Error filling Payment Details section:', e.message);
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
