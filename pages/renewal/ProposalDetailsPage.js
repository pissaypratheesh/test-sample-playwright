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
    
    // Fill AA Membership Details section (only if data exists and is not empty)
    if (data.aaMembershipDetails && data.aaMembershipDetails.associationName && data.aaMembershipDetails.associationName.trim() !== '') {
      console.log('🔍 [MAIN] AA Membership data provided, attempting to fill...');
      await this.fillAAMembershipSection(data.aaMembershipDetails);
    } else {
      console.log('🔍 [MAIN] AA Membership data not provided or empty, skipping section...');
    }
    
    // Fill NCB Carry Forward Details section
    console.log('🔍 [MAIN] About to call fillNCBCarryForwardSection...');
    console.log('🔍 [MAIN] NCB Carry Forward data:', JSON.stringify(data.ncbCarryForwardDetails, null, 2));
    
    // Check if NCB Carry Forward section should be filled
    // Only fill if data exists and has ALL required fields
    const hasNCBData = data.ncbCarryForwardDetails && 
                       data.ncbCarryForwardDetails.insuranceCompany && 
                       data.ncbCarryForwardDetails.officeAddress &&
                       data.ncbCarryForwardDetails.policyPeriodFrom &&
                       data.ncbCarryForwardDetails.policyPeriodTo;
    
    const shouldFillNCB = hasNCBData;
    
    console.log(`🔍 [MAIN] Has NCB data: ${hasNCBData}`);
    console.log(`🔍 [MAIN] Should fill NCB: ${shouldFillNCB}`);
    
    if (shouldFillNCB) {
      await this.fillNCBCarryForwardSection(data.ncbCarryForwardDetails);
      console.log('🔍 [MAIN] ✅ fillNCBCarryForwardSection completed');
    } else {
      console.log('🔍 [MAIN] ⚠️ Skipping NCB Carry Forward section (no data or incomplete data)');
    }
    
    // Check page state after NCB
    try {
      const urlAfterNCB = this.page.url();
      console.log(`🔍 [MAIN] Page URL after NCB: ${urlAfterNCB}`);
    } catch (e) {
      console.log(`❌ [MAIN] Page is dead after NCB: ${e.message}`);
    }
    
    // Fill Policy Details section
    console.log('🔍 [MAIN] About to call fillPolicyDetailsSection...');
    await this.fillPolicyDetailsSection(data.policyDetails);
    console.log('🔍 [MAIN] ✅ fillPolicyDetailsSection completed');
    
    // Fill Nominee Details section
    console.log('🔍 [DEBUG] About to call fillNomineeDetailsSection...');
    await this.fillNomineeDetailsSection(data.nomineeDetails);
    console.log('🔍 [DEBUG] fillNomineeDetailsSection completed...');
    
    // Fill Payment Details section
    await this.fillPaymentDetailsSection(data.paymentDetails);
    
    // Wait 15 seconds before clicking Proposal Preview to allow manual verification
    console.log('⏳ Waiting 15 seconds for manual verification of filled form...');
    console.log('🔍 Please verify: Date of Incorporation, all personal details, and other form fields...');
    await this.page.waitForTimeout(15000);
    console.log('✅ 15 seconds wait completed, proceeding to click Proposal Preview...');
    
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
      
      // Date of Birth or Date of Incorporation
      // Check if Date of Incorporation exists (for corporate) otherwise use Date of Birth
      if (personalDetails.dateOfIncorporation) {
        await this.fillDateOfIncorporation(personalDetails.dateOfIncorporation);
      } else {
        await this.fillDateOfBirth(personalDetails.dateOfBirth);
      }
      
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
   * Fill date of incorporation using DatePickerCore
   * @param {string} dateOfIncorporation - Date of incorporation in DD/MM/YYYY format
   */
  async fillDateOfIncorporation(dateOfIncorporation) {
    try {
      console.log('🔍 [INC] Filling date of incorporation using DatePickerCore...');
      console.log(`🔍 [INC] Date to set: ${dateOfIncorporation}`);
      
      // Try multiple selectors for Date of Incorporation
      const selectors = [
        'input[name="DATE_OF_INCORPORATION"]',
        'input[name="DATE_OF_INCORP"]',
        'input[name="INCORPORATION_DATE"]'
      ];
      
      let dateOfIncInput = null;
      
      // First try finding by name attribute
      for (const selector of selectors) {
        console.log(`🔍 [INC] Trying selector: ${selector}`);
        const input = this.page.locator(selector);
        const isVisible = await input.first().isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`🔍 [INC] ${selector} visible: ${isVisible}`);
        
        if (isVisible) {
          dateOfIncInput = input.first();
          console.log(`✅ [INC] Found input using selector: ${selector}`);
          break;
        }
      }
      
      // If not found by name, try by placeholder with parent label check
      if (!dateOfIncInput) {
        console.log(`🔍 [INC] Trying to find by placeholder with parent label...`);
        const allDateInputs = this.page.locator('input[placeholder*="DD/MM/YYYY"]');
        const count = await allDateInputs.count();
        console.log(`🔍 [INC] Found ${count} inputs with DD/MM/YYYY placeholder`);
        
        for (let i = 0; i < count; i++) {
          const input = allDateInputs.nth(i);
          const isVisible = await input.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (isVisible) {
            // Check if parent contains "Incorporation" text
            try {
              const parent = input.locator('xpath=ancestor::div[contains(@class, "MuiTextField") or contains(@class, "MuiFormControl")]');
              const parentText = await parent.locator('text=/Incorporation/i').count();
              
              if (parentText > 0) {
                dateOfIncInput = input;
                console.log(`✅ [INC] Found input by placeholder with Incorporation label at index ${i}`);
                break;
              }
            } catch (e) {
              console.log(`🔍 [INC] Error checking parent for input ${i}: ${e.message}`);
            }
            
            // Alternative: Check if nearby label contains "Incorporation"
            try {
              const nearbyText = await input.evaluate((el) => {
                // Walk up the DOM tree to find labels
                let text = '';
                let current = el.parentElement;
                
                // Check up to 10 levels
                for (let level = 0; level < 10 && current; level++) {
                  if (current.textContent) {
                    text += current.textContent + ' ';
                  }
                  
                  // Also check for label elements
                  const labels = current.querySelectorAll('label, span, p, div');
                  labels.forEach(label => {
                    if (label.textContent) {
                      text += label.textContent + ' ';
                    }
                  });
                  
                  current = current.parentElement;
                }
                
                return text;
              });
              
              console.log(`🔍 [INC] Nearby text for input ${i}: ${nearbyText}`);
              
              // Check for incorporation text (case insensitive)
              const lowerText = nearbyText.toLowerCase();
              if (lowerText.includes('incorporation') || lowerText.includes('incorp') || lowerText.includes('incorpor')) {
                dateOfIncInput = input;
                console.log(`✅ [INC] Found input by nearby text containing 'Incorporation' at index ${i}`);
                break;
              }
              
              // Debug: log all text to help identify which field this is
              console.log(`🔍 [INC] Input ${i} does not contain incorporation text`);
            } catch (e) {
              console.log(`🔍 [INC] Error checking nearby text for input ${i}: ${e.message}`);
            }
          }
        }
      }
      
      if (dateOfIncInput) {
        console.log(`🔍 [INC] Setting Date of Incorporation to: ${dateOfIncorporation}`);
        const success = await this.datePickerCore.setDateOnMaterialUIPicker(
          dateOfIncInput, 
          dateOfIncorporation,
          { timeout: 10000 }
        );
        
        if (success) {
          const currentValue = await dateOfIncInput.inputValue();
          console.log(`✅ [INC] Date of Incorporation set successfully: ${currentValue}`);
        } else {
          console.log('⚠️ [INC] DatePickerCore failed, trying fallback method...');
          await this.setDateOnInput(dateOfIncInput, dateOfIncorporation);
          const currentValue = await dateOfIncInput.inputValue();
          console.log(`✅ [INC] Date of Incorporation set using fallback: ${currentValue}`);
        }
      } else {
        console.log('⚠️ [INC] Date of Incorporation input not found with any selector');
      }
    } catch (e) {
      console.log(`⚠️ [INC] Error filling date of incorporation: ${e.message}`);
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
    console.log('🔍 [AA] Starting AA Membership Details section...');
    
    try {
      // Check if AA Membership section is even visible on the page
      const aaSectionVisible = await this.page.locator('text=AA Membership').isVisible({ timeout: 1000 }).catch(() => false);
      console.log(`🔍 [AA] AA Membership section visible: ${aaSectionVisible}`);
      
      if (!aaSectionVisible) {
        console.log('⚠️ [AA] AA Membership section not visible, skipping entire section...');
        return;
      }
      // Association Name
      try {
        console.log('🔍 [AA] Attempting to fill Association Name...');
        const associationDropdown = this.page.locator('#mui-component-select-ASSOCIATION_NAME');
        const isVisible = await associationDropdown.isVisible({ timeout: 1000 });
        console.log(`🔍 [AA] Association Name dropdown visible: ${isVisible}`);
        
        if (isVisible) {
          const isEnabled = await associationDropdown.isEnabled().catch(() => false);
          console.log(`🔍 [AA] Association Name dropdown enabled: ${isEnabled}`);
          
          if (isEnabled) {
            try {
              await this.selectMuiOption('#mui-component-select-ASSOCIATION_NAME', aaMembershipDetails.associationName);
              console.log(`✅ [AA] Association Name filled: ${aaMembershipDetails.associationName}`);
            } catch (selectError) {
              console.log(`⚠️ [AA] selectMuiOption failed for Association Name: ${selectError.message}`);
              // Try alternative approach
              try {
                await associationDropdown.click({ timeout: 1000 });
                await this.page.waitForTimeout(500);
                const option = this.page.locator(`text=${aaMembershipDetails.associationName}`).first();
                if (await option.isVisible({ timeout: 1000 })) {
                  await option.click();
                  console.log(`✅ [AA] Association Name filled via alternative method: ${aaMembershipDetails.associationName}`);
                } else {
                  console.log(`⚠️ [AA] Association Name option not found: ${aaMembershipDetails.associationName}`);
                }
              } catch (altError) {
                console.log(`⚠️ [AA] Alternative method also failed: ${altError.message}`);
              }
            }
          } else {
            console.log('⚠️ [AA] Association Name dropdown is disabled, skipping...');
          }
        } else {
          console.log('⚠️ [AA] Association Name dropdown not visible, skipping...');
        }
      } catch (e) {
        console.log(`⚠️ [AA] Could not fill Association Name: ${e.message}`);
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
        console.log('🔍 [AA] Attempting to fill Validity Month...');
        const validityDropdown = this.page.locator('#mui-component-select-AAMonth');
        const isVisible = await validityDropdown.isVisible({ timeout: 1000 });
        console.log(`🔍 [AA] Validity Month dropdown visible: ${isVisible}`);
        
        if (isVisible) {
          const isEnabled = await validityDropdown.isEnabled().catch(() => false);
          console.log(`🔍 [AA] Validity Month dropdown enabled: ${isEnabled}`);
          
          if (isEnabled) {
            await this.selectMuiOption('#mui-component-select-AAMonth', aaMembershipDetails.validityMonth);
            console.log(`✅ [AA] Validity Month filled: ${aaMembershipDetails.validityMonth}`);
          } else {
            console.log('⚠️ [AA] Validity Month dropdown is disabled, skipping...');
          }
        } else {
          console.log('⚠️ [AA] Validity Month dropdown not visible, skipping...');
        }
      } catch (e) {
        console.log(`⚠️ [AA] Could not fill Validity Month: ${e.message}`);
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
    console.log('🔍 [NCB] ===== STARTING NCB CARRY FORWARD SECTION =====');
    console.log('🔍 [NCB] Checking if page is still alive...');
    
    try {
      // Check page state
      const pageState = this.page.url();
      console.log(`🔍 [NCB] Page URL: ${pageState}`);
      
      // Vehicle Details
      console.log('🔍 [NCB] About to call fillNCBVehicleDetails...');
      await this.fillNCBVehicleDetails(ncbCarryForwardDetails);
      console.log('🔍 [NCB] ✅ fillNCBVehicleDetails completed');
      
      // Policy Details
      console.log('🔍 [NCB] About to call fillNCBPolicyDetails...');
      await this.fillNCBPolicyDetails(ncbCarryForwardDetails);
      console.log('🔍 [NCB] ✅ fillNCBPolicyDetails completed');
      
      // NCB Document Submitted Checkbox
      console.log('🔍 [NCB] About to call fillNCBDocumentCheckbox...');
      await this.fillNCBDocumentCheckbox(ncbCarryForwardDetails);
      console.log('🔍 [NCB] ✅ fillNCBDocumentCheckbox completed');
      
      console.log('✅ NCB Carry Forward Details section filled');
      
    } catch (e) {
      console.log(`❌ [NCB] Error filling NCB Carry Forward Details section: ${e.message}`);
      console.log(`❌ [NCB] Error stack: ${e.stack}`);
      
      // Check if page is still alive
      try {
        const url = this.page.url();
        console.log(`🔍 [NCB] Page still alive, URL: ${url}`);
      } catch (pageError) {
        console.log(`❌ [NCB] Page is closed or dead: ${pageError.message}`);
      }
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
    console.log('🔍 [NCB-POLICY] ===== STARTING NCB POLICY DETAILS =====');
    
    // Insurance Company
    console.log('🔍 [NCB-POLICY] Attempting to fill Insurance Company...');
    console.log(`🔍 [NCB-POLICY] Insurance Company value: ${ncbCarryForwardDetails.insuranceCompany}`);
    console.log('🔍 [NCB-POLICY] Checking page state before selectMuiOption...');
    
    try {
      if (!ncbCarryForwardDetails.insuranceCompany) {
        console.log('⚠️ [NCB-POLICY] Insurance Company not provided, skipping...');
      } else {
        const currentUrl = this.page.url();
        console.log(`🔍 [NCB-POLICY] Page URL: ${currentUrl}`);
        console.log(`🔍 [NCB-POLICY] Calling selectMuiOption with value: ${ncbCarryForwardDetails.insuranceCompany}`);
        
        await this.selectMuiOption('#mui-component-select-PREV_VEH_IC', ncbCarryForwardDetails.insuranceCompany);
        console.log('🔍 [NCB-POLICY] ✅ selectMuiOption completed successfully');
      }
    } catch (e) {
      console.log(`❌ [NCB-POLICY] Could not fill Insurance Company: ${e.message}`);
      console.log(`❌ [NCB-POLICY] Error stack: ${e.stack}`);
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
          { timeout: 2500 }
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
        // Use ncbCertificateEffectiveDate if available, otherwise fall back to invoiceDate
        const dateToUse = ncbCarryForwardDetails.ncbCertificateEffectiveDate || ncbCarryForwardDetails.invoiceDate;
        console.log(`🔍 [NCB-POLICY] Using date: ${dateToUse}`);
        await this.setDateOnInput(ncbDateInput, dateToUse);
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
    console.log('🔍 [DEBUG] Starting fillNomineeDetailsSection...');
    console.log('🔍 [DEBUG] Nominee details data:', JSON.stringify(nomineeDetails, null, 2));
    console.log('Filling Nominee Details section...');
    
    try {
      // First check if nominee section exists on the page
      const nomineeSectionHeading = this.page.locator('text=Nominee Details');
      const isNomineeSectionVisible = await nomineeSectionHeading.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (!isNomineeSectionVisible) {
        console.log('⚠️ [NOMINEE] Nominee Details section not found on page, skipping...');
        return;
      }
      
      console.log('✅ [NOMINEE] Nominee Details section found, proceeding to fill...');
      
      // Nominee Name
      try {
        const nomineeNameInput = this.page.locator('input[name="NomineeName"]');
        if (await nomineeNameInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(nomineeNameInput, nomineeDetails.nomineeName);
          console.log(`✅ [NOMINEE] Nominee Name filled: ${nomineeDetails.nomineeName}`);
        } else {
          console.log('⚠️ [NOMINEE] Nominee Name field not visible, skipping...');
        }
      } catch (e) {
        console.log('⚠️ [NOMINEE] Could not fill Nominee Name:', e.message);
      }
      
      // Nominee Age
      try {
        const nomineeAgeInput = this.page.locator('input[name="NomineeAge"]');
        if (await nomineeAgeInput.isVisible({ timeout: 2000 })) {
          await this.fillInput(nomineeAgeInput, nomineeDetails.nomineeAge);
          console.log(`✅ [NOMINEE] Nominee Age filled: ${nomineeDetails.nomineeAge}`);
        } else {
          console.log('⚠️ [NOMINEE] Nominee Age field not visible, skipping...');
        }
      } catch (e) {
        console.log('⚠️ [NOMINEE] Could not fill Nominee Age:', e.message);
      }
      
      // Nominee Relation
      try {
        const nomineeRelationDropdown = this.page.locator('#mui-component-select-NomineeRelation');
        if (await nomineeRelationDropdown.isVisible({ timeout: 2000 })) {
          await this.selectMuiOption('#mui-component-select-NomineeRelation', nomineeDetails.nomineeRelation);
          console.log(`✅ [NOMINEE] Nominee Relation selected: ${nomineeDetails.nomineeRelation}`);
        } else {
          console.log('⚠️ [NOMINEE] Nominee Relation dropdown not visible, skipping...');
        }
      } catch (e) {
        console.log('⚠️ [NOMINEE] Could not select Nominee Relation:', e.message);
      }
      
      // Nominee Gender
      try {
        const nomineeGenderDropdown = this.page.locator('#mui-component-select-NomineeGender');
        if (await nomineeGenderDropdown.isVisible({ timeout: 2000 })) {
          await this.selectMuiOption('#mui-component-select-NomineeGender', nomineeDetails.nomineeGender);
          console.log(`✅ [NOMINEE] Nominee Gender selected: ${nomineeDetails.nomineeGender}`);
        } else {
          console.log('⚠️ [NOMINEE] Nominee Gender dropdown not visible, skipping...');
        }
      } catch (e) {
        console.log('⚠️ [NOMINEE] Could not select Nominee Gender:', e.message);
      }
      
      console.log('✅ Nominee Details section filled');
      
    } catch (e) {
      console.log('⚠️ [NOMINEE] Error filling Nominee Details section:', e.message);
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
        
        // Wait for 15 seconds on the proposal preview page before exiting
        console.log('⏳ Waiting 15 seconds on proposal preview page for manual verification...');
        await this.page.waitForTimeout(15000);
        console.log('✅ 15 seconds completed, exiting test...');
        
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