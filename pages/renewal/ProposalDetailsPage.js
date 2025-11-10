const BaseRenewalPage = require('./BaseRenewalPage');
const path = require('path');

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
   * Handle proposal preview page actions: checkboxes, file upload, and Verify KYC
   * @param {string} filePath - Path to the file to upload (default: 'invoice.pdf')
   */
  async handleProposalPreviewPage(filePath = 'invoice.pdf') {
    // Resolve file path - if relative, resolve from project root
    const resolvedFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    try {
      console.log('🔍 Handling proposal preview page actions...');
      
      // Wait for the preview page to be fully loaded
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check first checkbox: "I hereby agree to receive a one pager policy document."
      try {
        console.log('Checking first checkbox: one pager policy document...');
        
        // Wait a bit and scroll to checkboxes area
        await this.page.waitForTimeout(1000);
        
        // Try to find and scroll to checkboxes area
        try {
          const checkboxArea = this.page.getByText(/I hereby agree to receive a/i).first();
          if (await checkboxArea.isVisible({ timeout: 2000 }).catch(() => false)) {
            await checkboxArea.scrollIntoViewIfNeeded();
            console.log('✅ Scrolled to checkbox area');
            await this.page.waitForTimeout(500);
          }
        } catch (e) {
          console.log('⚠️ Could not scroll to checkbox area');
        }
        
        let firstChecked = false;
        
        // Try multiple approaches
        const firstCheckboxStrategies = [
          // Strategy 1: Label with testid icon (from PolicyIssuancePage.js)
          async () => {
            const checkbox = this.page.locator('label').filter({ hasText: /I hereby agree to receive a/i }).getByTestId('CheckBoxOutlineBlankIcon');
            if (await checkbox.isVisible({ timeout: 2000 })) {
              await checkbox.click();
              return true;
            }
            return false;
          },
          // Strategy 2: Direct testid selector (first one)
          async () => {
            const checkbox = this.page.getByTestId('CheckBoxOutlineBlankIcon').first();
            if (await checkbox.isVisible({ timeout: 2000 })) {
              await checkbox.click();
              return true;
            }
            return false;
          },
          // Strategy 3: Click the label itself (which should trigger checkbox)
          async () => {
            const label = this.page.locator('label').filter({ hasText: /I hereby agree to receive a/i });
            if (await label.isVisible({ timeout: 2000 })) {
              await label.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(200);
              await label.click({ force: true });
              return true;
            }
            return false;
          },
          // Strategy 4: Find actual checkbox input and check it
          async () => {
            const label = this.page.locator('label').filter({ hasText: /I hereby agree to receive a/i });
            if (await label.isVisible({ timeout: 2000 })) {
              await label.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(200);
              
              // Try to find checkbox input in the label or near it
              let checkboxInput = label.locator('input[type="checkbox"]').first();
              if (!(await checkboxInput.isVisible({ timeout: 500 }).catch(() => false))) {
                // Try finding in ancestor container
                checkboxInput = label.locator('xpath=ancestor::*[1]').locator('input[type="checkbox"]').first();
              }
              
              if (await checkboxInput.isVisible({ timeout: 500 }).catch(() => false)) {
                await checkboxInput.scrollIntoViewIfNeeded();
                await checkboxInput.check({ force: true });
                return true;
              } else {
                // Try clicking the label if no input found
                await label.click({ force: true });
                return true;
              }
            }
            return false;
          },
          // Strategy 5: Find checkbox by role near the label
          async () => {
            const label = this.page.getByText(/I hereby agree to receive a/i).first();
            if (await label.isVisible({ timeout: 2000 })) {
              const container = label.locator('xpath=ancestor::label[1]');
              const checkbox = container.locator('input[type="checkbox"]').first();
              if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
                await checkbox.check();
                return true;
              } else {
                // Try getByRole
                const roleCheckbox = container.getByRole('checkbox').first();
                if (await roleCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
                  await roleCheckbox.check();
                  return true;
                }
              }
            }
            return false;
          }
        ];
        
        for (let i = 0; i < firstCheckboxStrategies.length && !firstChecked; i++) {
          try {
            firstChecked = await firstCheckboxStrategies[i]();
            if (firstChecked) {
              console.log(`✅ First checkbox clicked (strategy ${i + 1})`);
              // Wait a bit for state to update
              await this.page.waitForTimeout(500);
              
              // Verify it's actually checked
              try {
                const label = this.page.locator('label').filter({ hasText: /I hereby agree to receive a/i }).first();
                const checkboxInput = label.locator('input[type="checkbox"]').first();
                const isChecked = await checkboxInput.isChecked().catch(() => false);
                if (isChecked) {
                  console.log('✅ First checkbox verified as checked');
                  firstChecked = true;
                  break;
                } else {
                  console.log('⚠️ First checkbox clicked but not checked, trying next strategy...');
                  firstChecked = false;
                }
              } catch (verifyError) {
                // If we can't verify, assume it worked
                console.log('⚠️ Could not verify first checkbox state, assuming it worked');
                firstChecked = true;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!firstChecked) {
          console.log('⚠️ Could not check first checkbox with any strategy');
        }
      } catch (e) {
        console.log(`⚠️ Error checking first checkbox: ${e.message}`);
      }
      
      // Check second checkbox: "I hereby confirm that I have mandated Tata Motors..."
      try {
        console.log('Checking second checkbox: mandate confirmation...');
        
        // Try to find and scroll to second checkbox area
        try {
          const checkboxArea = this.page.getByText(/I hereby confirm that I have mandated/i).first();
          if (await checkboxArea.isVisible({ timeout: 2000 }).catch(() => false)) {
            await checkboxArea.scrollIntoViewIfNeeded();
            console.log('✅ Scrolled to second checkbox area');
            await this.page.waitForTimeout(500);
          }
        } catch (e) {
          console.log('⚠️ Could not scroll to second checkbox area');
        }
        
        let secondChecked = false;
        
        // Try multiple approaches
        const secondCheckboxStrategies = [
          // Strategy 1: Direct testid selector (second one, from PolicyIssuancePage.js)
          async () => {
            const checkbox = this.page.getByTestId('CheckBoxOutlineBlankIcon').nth(1);
            if (await checkbox.isVisible({ timeout: 2000 })) {
              await checkbox.click();
              return true;
            }
            return false;
          },
          // Strategy 2: Label with testid icon
          async () => {
            const checkbox = this.page.locator('label').filter({ hasText: /I hereby confirm that I have mandated/i }).getByTestId('CheckBoxOutlineBlankIcon');
            if (await checkbox.isVisible({ timeout: 2000 })) {
              await checkbox.click();
              return true;
            }
            return false;
          },
          // Strategy 3: Click the label itself
          async () => {
            const label = this.page.locator('label').filter({ hasText: /I hereby confirm that I have mandated/i });
            if (await label.isVisible({ timeout: 2000 })) {
              await label.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(200);
              await label.click({ force: true });
              return true;
            }
            return false;
          },
          // Strategy 4: Find actual checkbox input and check it
          async () => {
            const label = this.page.locator('label').filter({ hasText: /I hereby confirm that I have mandated/i });
            if (await label.isVisible({ timeout: 2000 })) {
              await label.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(200);
              
              // Try to find checkbox input in the label or near it
              let checkboxInput = label.locator('input[type="checkbox"]').first();
              if (!(await checkboxInput.isVisible({ timeout: 500 }).catch(() => false))) {
                // Try finding in ancestor container
                checkboxInput = label.locator('xpath=ancestor::*[1]').locator('input[type="checkbox"]').first();
              }
              
              if (await checkboxInput.isVisible({ timeout: 500 }).catch(() => false)) {
                await checkboxInput.scrollIntoViewIfNeeded();
                await checkboxInput.check({ force: true });
                return true;
              } else {
                await label.click({ force: true });
                return true;
              }
            }
            return false;
          },
          // Strategy 5: Find by text and get checkbox
          async () => {
            const label = this.page.getByText(/I hereby confirm that I have mandated/i).first();
            if (await label.isVisible({ timeout: 2000 })) {
              const container = label.locator('xpath=ancestor::label[1]');
              const checkbox = container.locator('input[type="checkbox"]').first();
              if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
                await checkbox.check();
                return true;
              } else {
                // Try getByRole
                const roleCheckbox = container.getByRole('checkbox').first();
                if (await roleCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
                  await roleCheckbox.check();
                  return true;
                } else {
                  await label.click();
                  return true;
                }
              }
            }
            return false;
          },
          // Strategy 6: Get all checkboxes and click the second visible one
          async () => {
            const checkboxes = this.page.locator('input[type="checkbox"]');
            const count = await checkboxes.count();
            if (count >= 2) {
              const secondCheckbox = checkboxes.nth(1);
              if (await secondCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
                await secondCheckbox.check();
                return true;
              }
            }
            return false;
          }
        ];
        
        for (let i = 0; i < secondCheckboxStrategies.length && !secondChecked; i++) {
          try {
            secondChecked = await secondCheckboxStrategies[i]();
            if (secondChecked) {
              console.log(`✅ Second checkbox clicked (strategy ${i + 1})`);
              // Wait a bit for state to update
              await this.page.waitForTimeout(500);
              
              // Verify it's actually checked
              try {
                const label = this.page.locator('label').filter({ hasText: /I hereby confirm that I have mandated/i }).first();
                const checkboxInput = label.locator('input[type="checkbox"]').first();
                const isChecked = await checkboxInput.isChecked().catch(() => false);
                if (isChecked) {
                  console.log('✅ Second checkbox verified as checked');
                  secondChecked = true;
                  break;
                } else {
                  // Try finding by index
                  const allCheckboxes = this.page.locator('input[type="checkbox"]');
                  const secondCheckbox = allCheckboxes.nth(1);
                  const isCheckedByIndex = await secondCheckbox.isChecked().catch(() => false);
                  if (isCheckedByIndex) {
                    console.log('✅ Second checkbox verified as checked (by index)');
                    secondChecked = true;
                    break;
                  } else {
                    console.log('⚠️ Second checkbox clicked but not checked, trying next strategy...');
                    secondChecked = false;
                  }
                }
              } catch (verifyError) {
                // If we can't verify, assume it worked
                console.log('⚠️ Could not verify second checkbox state, assuming it worked');
                secondChecked = true;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!secondChecked) {
          console.log('⚠️ Could not check second checkbox with any strategy');
        }
      } catch (e) {
        console.log(`⚠️ Error checking second checkbox: ${e.message}`);
      }
      
        // Check "Mandate Form" radio button
        try {
          console.log('Checking "Mandate Form" radio button...');
          await this.page.waitForTimeout(1000); // Wait a bit after checkboxes
          
          // First, wait for radio buttons to appear
          try {
            await this.page.waitForSelector('input[type="radio"]', { timeout: 5000 }).catch(() => {});
            await this.page.waitForTimeout(500);
          } catch (e) {
            console.log('⚠️ Radio buttons may not be visible yet');
          }
          
          const mandateRadioStrategies = [
            // Strategy 1: Click the label text directly (most reliable)
            async () => {
              const mandateLabel = this.page.getByText(/Mandate Form/i).first();
              if (await mandateLabel.isVisible({ timeout: 5000 })) {
                await mandateLabel.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(300);
                await mandateLabel.click();
                // Verify radio is checked
                await this.page.waitForTimeout(500);
                const radio = this.page.getByRole('radio', { name: /Mandate Form/i });
                const isChecked = await radio.isChecked().catch(() => false);
                return isChecked;
              }
              return false;
            },
            // Strategy 2: By role with exact name (from PolicyIssuancePage.js)
            async () => {
              const radio = this.page.getByRole('radio', { name: 'Mandate Form' });
              if (await radio.isVisible({ timeout: 5000 })) {
                await radio.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(300);
                await radio.check();
                return true;
              }
              return false;
            },
            // Strategy 3: By role with case-insensitive regex
            async () => {
              const radio = this.page.getByRole('radio', { name: /Mandate Form/i });
              if (await radio.isVisible({ timeout: 5000 })) {
                await radio.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(300);
                await radio.check();
                return true;
              }
              return false;
            },
            // Strategy 4: Find by text and get parent radio or nearby radio
            async () => {
              const mandateText = this.page.getByText(/Mandate Form/i).first();
              if (await mandateText.isVisible({ timeout: 5000 })) {
                await mandateText.scrollIntoViewIfNeeded();
                // Try to find radio button nearby
                const radio = mandateText.locator('xpath=ancestor::*[1]//input[@type="radio"] | following::input[@type="radio"][1] | preceding::input[@type="radio"][1]').first();
                if (await radio.count() > 0) {
                  await radio.check();
                  return true;
                }
              }
              return false;
            },
            // Strategy 5: Find all radio buttons and check one with Mandate Form label
          async () => {
            const radios = this.page.locator('input[type="radio"]');
            const count = await radios.count();
            for (let i = 0; i < count; i++) {
              const radio = radios.nth(i);
              // Try to find associated label
              const radioId = await radio.getAttribute('id').catch(() => null);
              if (radioId) {
                const label = this.page.locator(`label[for="${radioId}"]`);
                const labelText = await label.textContent().catch(() => '');
                if (/Mandate Form/i.test(labelText)) {
                  await radio.scrollIntoViewIfNeeded();
                  await this.page.waitForTimeout(300);
                  await radio.check();
                  return true;
                }
              }
              // Try to find label near the radio
              const labelNearby = radio.locator('xpath=following-sibling::label[1] | ancestor::label[1]');
              const labelTextNearby = await labelNearby.textContent().catch(() => '');
              if (/Mandate Form/i.test(labelTextNearby)) {
                await radio.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(300);
                await radio.check();
                return true;
              }
            }
            return false;
          },
            // Strategy 6: Find radio button by role and filter by accessible name
          async () => {
            const allRadios = this.page.getByRole('radio');
            const count = await allRadios.count();
            for (let i = 0; i < count; i++) {
              const radio = allRadios.nth(i);
              let accessibleName = await radio.getAttribute('aria-label').catch(() => '');
              
              // If no aria-label, try to get name from associated label
              if (!accessibleName) {
                const radioId = await radio.getAttribute('id').catch(() => null);
                if (radioId) {
                  accessibleName = await this.page.locator(`label[for="${radioId}"]`).textContent().catch(() => '');
                }
              }
              
              // Also try to get text from nearby label
              if (!accessibleName) {
                const nearbyLabel = radio.locator('xpath=following-sibling::label[1] | ancestor::label[1]');
                accessibleName = await nearbyLabel.textContent().catch(() => '');
              }
              
              if (accessibleName && /Mandate Form/i.test(accessibleName)) {
                await radio.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(300);
                await radio.check();
                return true;
              }
            }
            return false;
          },
        ];
        
        let mandateChecked = false;
        for (let i = 0; i < mandateRadioStrategies.length && !mandateChecked; i++) {
          try {
            console.log(`  Trying mandate radio selector ${i + 1}...`);
            mandateChecked = await mandateRadioStrategies[i]();
            if (mandateChecked) {
              console.log(`✅ "Mandate Form" radio button checked (strategy ${i + 1})`);
              await this.page.waitForTimeout(500);
              
              // Verify it's checked
              try {
                const radio = this.page.getByRole('radio', { name: /Mandate Form/i });
                const isChecked = await radio.isChecked().catch(() => false);
                if (isChecked) {
                  console.log('✅ "Mandate Form" radio button verified as checked');
                  mandateChecked = true;
                  break;
                } else {
                  console.log('⚠️ Mandate radio clicked but not checked, trying next strategy...');
                  mandateChecked = false;
                }
              } catch (verifyError) {
                console.log('⚠️ Could not verify mandate radio state, assuming it worked');
                mandateChecked = true;
                break;
              }
            }
          } catch (e) {
            console.log(`  Strategy ${i + 1} failed: ${e.message}`);
            continue;
          }
        }
        
        if (!mandateChecked) {
          console.log('⚠️ Could not check "Mandate Form" radio button with any strategy');
        }
      } catch (e) {
        console.log(`⚠️ Error checking "Mandate Form" radio button: ${e.message}`);
      }
      
      // Wait for the second "Browse files" button to appear after Mandate Form is checked
      await this.page.waitForTimeout(2000);
      
      // Upload invoice.pdf file using the second "Browse files" button (after Mandate Form)
      try {
        console.log(`Uploading file after Mandate Form check: ${resolvedFilePath}...`);
        
        // Method 1: Use file chooser (recommended approach) - find the second "Browse files" button
        try {
          // Wait for "Browse files" buttons to be available
          await this.page.waitForTimeout(1000);
          
          // Try to find all "Browse files" buttons and use the second one (after mandate form)
          const browseFilesButtons = this.page.getByText('Browse files');
          const browseFilesCount = await browseFilesButtons.count();
          console.log(`Found ${browseFilesCount} "Browse files" button(s)`);
          
          let fileUploaded = false;
          
          // If there are multiple buttons, try the second one (index 1)
          if (browseFilesCount > 1) {
            try {
              const secondBrowseButton = browseFilesButtons.nth(1);
              if (await secondBrowseButton.isVisible({ timeout: 5000 })) {
                await secondBrowseButton.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(500);
                const fileChooserPromise = this.page.waitForEvent('filechooser');
                await secondBrowseButton.click();
                console.log('✅ Second "Browse files" button clicked (after Mandate Form)');
                
                const fileChooser = await fileChooserPromise;
                await fileChooser.setFiles(resolvedFilePath);
                console.log(`✅ File uploaded via file chooser: ${resolvedFilePath}`);
                fileUploaded = true;
              }
            } catch (e) {
              console.log(`⚠️ Second browse button method failed: ${e.message}`);
            }
          }
          
          // Fallback: Try the last "Browse files" button
          if (!fileUploaded && browseFilesCount > 0) {
            try {
              const lastBrowseButton = browseFilesButtons.last();
              if (await lastBrowseButton.isVisible({ timeout: 5000 })) {
                await lastBrowseButton.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(500);
                const fileChooserPromise = this.page.waitForEvent('filechooser');
                await lastBrowseButton.click();
                console.log('✅ Last "Browse files" button clicked (after Mandate Form)');
                
                const fileChooser = await fileChooserPromise;
                await fileChooser.setFiles(resolvedFilePath);
                console.log(`✅ File uploaded via file chooser: ${resolvedFilePath}`);
                fileUploaded = true;
              }
            } catch (e) {
              console.log(`⚠️ Last browse button method failed: ${e.message}`);
            }
          }
          
          // Fallback: Try the first "Browse files" button if only one exists
          if (!fileUploaded) {
            const firstBrowseButton = browseFilesButtons.first();
            if (await firstBrowseButton.isVisible({ timeout: 5000 })) {
              await firstBrowseButton.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(500);
              const fileChooserPromise = this.page.waitForEvent('filechooser');
              await firstBrowseButton.click();
              console.log('✅ "Browse files" button clicked');
              
              const fileChooser = await fileChooserPromise;
              await fileChooser.setFiles(resolvedFilePath);
              console.log(`✅ File uploaded via file chooser: ${resolvedFilePath}`);
              fileUploaded = true;
            } else {
              throw new Error('Browse files button not visible');
            }
          }
        } catch (fileChooserError) {
          console.log(`⚠️ File chooser method failed: ${fileChooserError.message}, trying alternatives...`);
          
          // Method 2: Find file input directly and set files (try second file input)
          try {
            const fileInputs = this.page.locator('input[type="file"]');
            const inputCount = await fileInputs.count();
            console.log(`Found ${inputCount} file input(s)`);
            
            // Try the second file input if available, otherwise use the last one
            let targetInput = null;
            if (inputCount > 1) {
              targetInput = fileInputs.nth(1);
            } else if (inputCount > 0) {
              targetInput = fileInputs.last();
            }
            
            if (targetInput) {
              await targetInput.waitFor({ state: 'attached', timeout: 3000 });
              await targetInput.setInputFiles(resolvedFilePath);
              console.log(`✅ File uploaded via direct file input: ${resolvedFilePath}`);
            } else {
              throw new Error('No file input found');
            }
          } catch (directInputError) {
            console.log(`⚠️ Direct file input method failed: ${directInputError.message}, trying body fallback...`);
            
            // Method 3: Use body setInputFiles (from recorded_flow.js and PolicyIssuancePage.js)
            // This works when there's a file input attached to body
            await this.page.locator('body').setInputFiles(resolvedFilePath);
            console.log(`✅ File uploaded via body fallback: ${resolvedFilePath}`);
          }
        }
      } catch (e) {
        console.log(`❌ Could not upload file: ${e.message}`);
        console.log(`❌ File upload error stack: ${e.stack}`);
      }
      
      // Wait a bit for file upload to complete and UI to update
      await this.page.waitForTimeout(2000);
      
      // Click "SEND FOR APPROVAL" button
      try {
        console.log('Clicking SEND FOR APPROVAL button...');
        await this.page.waitForTimeout(1000);
        
        const sendForApprovalSelectors = [
          () => this.page.getByRole('button', { name: 'SEND FOR APPROVAL' }),
          () => this.page.getByRole('button', { name: /SEND FOR APPROVAL/i }),
          () => this.page.getByRole('button', { name: /^SEND FOR APPROVAL$/i }),
          () => this.page.locator('button').filter({ hasText: /^SEND FOR APPROVAL$/i }),
          () => this.page.locator('button').filter({ hasText: /SEND FOR APPROVAL/i }),
          () => this.page.locator('button:has-text("SEND FOR APPROVAL")'),
          () => this.page.locator('button:has-text("Send for Approval")'),
          () => this.page.locator('button:has-text("Send For Approval")'),
        ];
        
        let sendForApprovalClicked = false;
        for (let i = 0; i < sendForApprovalSelectors.length && !sendForApprovalClicked; i++) {
          try {
            const sendButton = sendForApprovalSelectors[i]();
            if (await sendButton.isVisible({ timeout: 5000 })) {
              await sendButton.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(500);
              await sendButton.click();
              console.log(`✅ SEND FOR APPROVAL button clicked (selector ${i + 1})`);
              sendForApprovalClicked = true;
              
              // Wait for action to complete
              await this.page.waitForTimeout(2000);
              await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!sendForApprovalClicked) {
          console.log('⚠️ SEND FOR APPROVAL button not found');
        }
      } catch (e) {
        console.log(`⚠️ Error clicking SEND FOR APPROVAL button: ${e.message}`);
      }
      
      // Click Verify KYC button
      try {
        console.log('Clicking Verify KYC button...');
        const verifyKYCButton = this.page.getByRole('button', { name: 'Verify KYC' });
        if (await verifyKYCButton.isVisible({ timeout: 5000 })) {
          await verifyKYCButton.click();
          console.log('✅ Verify KYC button clicked');
          
          // Wait for modal to appear and click OK button
          try {
            console.log('Waiting for modal message to appear...');
            
            // Wait for modal dialog to appear - try multiple detection methods
            let modalDetected = false;
            let okButtonFound = false;
            
            // Method 1: Wait for "Message" text
            try {
              const modalTitle = this.page.getByText('Message').first();
              await modalTitle.waitFor({ state: 'visible', timeout: 10000 });
              modalDetected = true;
              console.log('✅ Modal detected by title "Message"');
            } catch (e) {
              console.log('⚠️ Modal title "Message" not found immediately');
            }
            
            // Method 2: Wait for dialog role
            if (!modalDetected) {
              try {
                const modalDialog = this.page.locator('[role="dialog"]').first();
                await modalDialog.waitFor({ state: 'visible', timeout: 5000 });
                modalDetected = true;
                console.log('✅ Modal detected by dialog role');
              } catch (e) {
                console.log('⚠️ Modal with dialog role not found');
              }
            }
            
            // Method 3: Wait for modal content text
            if (!modalDetected) {
              try {
                const modalContent = this.page.getByText(/KYC fields provided could not be verified/i);
                await modalContent.waitFor({ state: 'visible', timeout: 5000 });
                modalDetected = true;
                console.log('✅ Modal detected by content text');
              } catch (e) {
                console.log('⚠️ Modal content text not found');
              }
            }
            
            // Wait a moment for modal to fully render
            if (modalDetected) {
              await this.page.waitForTimeout(500);
            }
            
            // Try multiple ways to find and click OK button
            const okButtonSelectors = [
              () => this.page.getByRole('button', { name: 'OK' }),
              () => this.page.getByRole('button', { name: /^OK$/i }),
              () => this.page.locator('button').filter({ hasText: /^OK$/i }),
              () => this.page.locator('button:has-text("OK")'),
            ];
            
            for (let i = 0; i < okButtonSelectors.length && !okButtonFound; i++) {
              try {
                const okButton = okButtonSelectors[i]();
                if (await okButton.isVisible({ timeout: 3000 })) {
                  await okButton.scrollIntoViewIfNeeded();
                  await this.page.waitForTimeout(200);
                  await okButton.click();
                  console.log(`✅ OK button clicked (selector ${i + 1})`);
                  okButtonFound = true;
                  
                  // Wait for modal to close
                  await this.page.waitForTimeout(1000);
                  break;
                }
              } catch (e) {
                continue;
              }
            }
            
            if (!okButtonFound) {
              console.log('⚠️ OK button not found in modal');
            }
          } catch (modalError) {
            console.log(`⚠️ Could not handle modal: ${modalError.message}`);
            console.log(`⚠️ Modal error stack: ${modalError.stack}`);
          }
          
          // Click IC KYC PORTAL button
          try {
            // Wait a bit for page to update after modal dismissal
            await this.page.waitForTimeout(1000);
            
            console.log('Clicking IC KYC PORTAL button...');
            let buttonClicked = false;
            
            // Try multiple selectors for IC KYC PORTAL button
            const buttonSelectors = [
              () => this.page.getByRole('button', { name: 'IC KYC PORTAL' }),
              () => this.page.getByRole('button', { name: 'IC KYC Portal' }),
              () => this.page.getByRole('button', { name: /IC KYC/i }),
              () => this.page.locator('button').filter({ hasText: /IC KYC/i }),
              () => this.page.locator('button').filter({ hasText: /KYC PORTAL/i }),
              () => this.page.locator('button:has-text("IC KYC")'),
            ];
            
            for (let i = 0; i < buttonSelectors.length && !buttonClicked; i++) {
              try {
                const button = buttonSelectors[i]();
                if (await button.isVisible({ timeout: 3000 })) {
                  await button.click();
                  console.log(`✅ IC KYC PORTAL button clicked (selector ${i + 1})`);
                  buttonClicked = true;
                  
                  // Handle IC KYC Portal page actions
                  await this.handleICKYCPortalPage();
                  break;
                }
              } catch (e) {
                // Try next selector
                continue;
              }
            }
            
            if (!buttonClicked) {
              console.log('⚠️ IC KYC PORTAL button not found with any selector');
            }
          } catch (icKycError) {
            console.log(`⚠️ Could not click IC KYC PORTAL button: ${icKycError.message}`);
          }
          
        } else {
          console.log('⚠️ Verify KYC button not found');
        }
      } catch (e) {
        console.log(`⚠️ Could not click Verify KYC button: ${e.message}`);
      }
      
      console.log('✅ Proposal preview page actions completed');
    } catch (e) {
      console.log(`❌ Error handling proposal preview page: ${e.message}`);
      throw e;
    }
  }

  /**
   * Handle IC KYC Portal page: Fill PAN, Mobile Number, and click SUBMIT
   */
  async handleICKYCPortalPage(panNumber = 'BPEPG4929L', mobileNumber = '7483774467') {
    try {
      console.log('🔍 Handling IC KYC Portal page...');
      
      // Wait for navigation to IC KYC page
      console.log('Waiting for navigation to IC KYC Portal page...');
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      await this.page.waitForTimeout(2000);
      
      // Wait for KYC page to load (look for key indicators)
      try {
        const kycIndicators = [
          this.page.getByText('Customer Onboarding'),
          this.page.getByText('KYC verification'),
          this.page.getByText(/Please help us with/i),
          this.page.getByText('PAN Number'),
        ];
        
        let pageLoaded = false;
        for (const indicator of kycIndicators) {
          try {
            if (await indicator.isVisible({ timeout: 5000 })) {
              console.log('✅ IC KYC Portal page detected');
              pageLoaded = true;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!pageLoaded) {
          console.log('⚠️ IC KYC Portal page may not have loaded completely');
        }
        
        // Extra wait to ensure form is fully rendered
        await this.page.waitForTimeout(1000);
      } catch (e) {
        console.log('⚠️ Could not detect IC KYC Portal page:', e.message);
      }
      
      // Fill PAN Number - MUST be filled first into the correct field
      try {
        console.log(`Filling PAN Number: ${panNumber}...`);
        const panSelectors = [
          // Strategy 1: Find label with "PAN Number" text and get the following input
          () => {
            const label = this.page.getByText('PAN Number').first();
            return label.locator('xpath=following::input[1]');
          },
          // Strategy 2: Use getByLabel with exact text
          () => this.page.getByLabel('PAN Number'),
          // Strategy 3: Find label and navigate to input via parent
          () => {
            const label = this.page.locator('label, div').filter({ hasText: /^PAN Number/i }).first();
            return label.locator('xpath=following-sibling::*//input | following::input[1]').first();
          },
          // Strategy 4: Find by placeholder that contains PAN example
          () => this.page.getByPlaceholder(/e.g. BHASD|PAN/i),
          // Strategy 5: Try to find input near PAN label text
          () => {
            const panText = this.page.getByText(/PAN Number/i).first();
            return this.page.locator('input').filter({ has: panText.locator('xpath=ancestor::*[1]') }).first();
          },
          // Strategy 6: Find first text input that's not a mobile field
          async () => {
            // Find all text inputs and exclude any that might be mobile
            const allInputs = this.page.locator('input[type="text"]');
            const count = await allInputs.count();
            // Return first input (usually PAN comes first)
            return count > 0 ? allInputs.nth(0) : null;
          },
        ];
        
        let panFilled = false;
        for (let i = 0; i < panSelectors.length && !panFilled; i++) {
          try {
            const panInputFn = panSelectors[i];
            const panInput = await panInputFn();
            if (!panInput) continue;
            
            if (await panInput.isVisible({ timeout: 3000 })) {
              await panInput.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(300);
              await panInput.click({ force: true });
              await this.page.waitForTimeout(200);
              await panInput.fill(''); // Clear first
              await this.page.waitForTimeout(100);
              await panInput.fill(panNumber);
              await this.page.waitForTimeout(300);
              
              // Verify it was filled correctly
              const value = await panInput.inputValue().catch(() => '');
              if (value === panNumber || value.includes(panNumber)) {
                console.log(`✅ PAN Number filled: ${panNumber} (selector ${i + 1})`);
                panFilled = true;
                await this.page.waitForTimeout(500);
                break;
              } else {
                console.log(`⚠️ PAN input found but value incorrect. Expected: ${panNumber}, Got: ${value}`);
              }
            }
          } catch (e) {
            console.log(`⚠️ PAN selector ${i + 1} failed: ${e.message}`);
            continue;
          }
        }
        
        if (!panFilled) {
          console.log('⚠️ PAN Number field not found with any selector');
        }
      } catch (e) {
        console.log(`⚠️ Error filling PAN Number: ${e.message}`);
      }
      
      // Fill Mobile Number - MUST be filled into a DIFFERENT field than PAN
      try {
        console.log(`Filling Mobile Number: ${mobileNumber}...`);
        const mobileSelectors = [
          // Strategy 1: Find label with "Mobile Number" text and get the following input
          () => {
            const label = this.page.getByText('Mobile Number').first();
            return label.locator('xpath=following::input[1]');
          },
          // Strategy 2: Use getByLabel with exact text
          () => this.page.getByLabel('Mobile Number'),
          // Strategy 3: Find label and navigate to input via parent
          () => {
            const label = this.page.locator('label, div').filter({ hasText: /^Mobile Number/i }).first();
            return label.locator('xpath=following-sibling::*//input | following::input[1]').first();
          },
          // Strategy 4: Try to find input that does NOT contain PAN number (to avoid filling PAN field)
          async () => {
            const allTextInputs = this.page.locator('input[type="text"]');
            const count = await allTextInputs.count();
            // Try second input (Mobile is usually second)
            if (count >= 2) {
              const secondInput = allTextInputs.nth(1);
              const currentValue = await secondInput.inputValue().catch(() => '');
              // Make sure it's not the PAN field (check if it doesn't have PAN format)
              if (currentValue !== panNumber && !currentValue.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) {
                return secondInput;
              }
            }
            return null;
          },
          // Strategy 5: Find input near Mobile label text (exclude PAN field)
          async () => {
            const mobileText = this.page.getByText(/Mobile Number/i).first();
            const inputs = this.page.locator('input[type="text"]');
            const count = await inputs.count();
            // Try inputs after finding mobile text, excluding first one (PAN)
            for (let i = 1; i < count; i++) {
              const input = inputs.nth(i);
              if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
                const value = await input.inputValue().catch(() => '');
                // Make sure this input doesn't have PAN number
                if (value !== panNumber) {
                  return input;
                }
              }
            }
            return null;
          },
          // Strategy 6: Find by type tel (mobile numbers often use tel type)
          () => this.page.locator('input[type="tel"]'),
          // Strategy 7: Last resort - second text input (but verify it's not PAN)
          async () => {
            const inputs = this.page.locator('input[type="text"]');
            const count = await inputs.count();
            if (count >= 2) {
              const secondInput = inputs.nth(1);
              const value = await secondInput.inputValue().catch(() => '');
              // Only use if it doesn't contain PAN number
              if (value !== panNumber) {
                return secondInput;
              }
            }
            return null;
          },
        ];
        
        let mobileFilled = false;
        for (let i = 0; i < mobileSelectors.length && !mobileFilled; i++) {
          try {
            const mobileInputFn = mobileSelectors[i];
            const mobileInput = await mobileInputFn();
            if (!mobileInput) continue;
            
            if (await mobileInput.isVisible({ timeout: 3000 })) {
              await mobileInput.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(300);
              
              // Double-check: make sure this input doesn't already have PAN number
              const currentValue = await mobileInput.inputValue().catch(() => '');
              if (currentValue === panNumber) {
                console.log(`⚠️ Mobile selector ${i + 1} found PAN field instead, skipping...`);
                continue;
              }
              
              await mobileInput.click({ force: true });
              await this.page.waitForTimeout(200);
              await mobileInput.fill(''); // Clear first
              await this.page.waitForTimeout(100);
              await mobileInput.fill(mobileNumber);
              await this.page.waitForTimeout(300);
              
              // Verify it was filled correctly and NOT with PAN
              const value = await mobileInput.inputValue().catch(() => '');
              if ((value === mobileNumber || value.includes(mobileNumber)) && value !== panNumber) {
                console.log(`✅ Mobile Number filled: ${mobileNumber} (selector ${i + 1})`);
                mobileFilled = true;
                await this.page.waitForTimeout(500);
                break;
              } else {
                console.log(`⚠️ Mobile input found but value incorrect. Expected: ${mobileNumber}, Got: ${value}`);
              }
            }
          } catch (e) {
            console.log(`⚠️ Mobile selector ${i + 1} failed: ${e.message}`);
            continue;
          }
        }
        
        if (!mobileFilled) {
          console.log('⚠️ Mobile Number field not found with any selector');
        }
      } catch (e) {
        console.log(`⚠️ Error filling Mobile Number: ${e.message}`);
      }
      
      // Click SUBMIT button
      try {
        console.log('Clicking SUBMIT button...');
        const submitSelectors = [
          () => this.page.getByRole('button', { name: 'SUBMIT' }),
          () => this.page.getByRole('button', { name: /SUBMIT/i }),
          () => this.page.locator('button').filter({ hasText: /SUBMIT/i }),
          () => this.page.locator('button:has-text("SUBMIT")'),
          () => this.page.locator('button[type="submit"]'),
        ];
        
        let submitClicked = false;
        for (let i = 0; i < submitSelectors.length && !submitClicked; i++) {
          try {
            const submitButton = submitSelectors[i]();
            if (await submitButton.isVisible({ timeout: 5000 })) {
              await submitButton.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(500);
              await submitButton.click();
              console.log(`✅ SUBMIT button clicked (selector ${i + 1})`);
              submitClicked = true;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!submitClicked) {
          console.log('⚠️ SUBMIT button not found');
        }
      } catch (e) {
        console.log(`⚠️ Error clicking SUBMIT button: ${e.message}`);
      }
      
      // Wait for page to load after SUBMIT (might show upload section)
      await this.page.waitForTimeout(3000);
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      
      // Handle file uploads if the upload section appears
      const photographFile = 'Nam Pancard (1) (1).pdf';
      const addressDocumentFile = 'Nam Pancard (1) (1).pdf';
      
      // Upload Photograph
      try {
        console.log(`Uploading photograph: ${photographFile}...`);
        const resolvedPhotoPath = path.isAbsolute(photographFile) ? photographFile : path.resolve(process.cwd(), photographFile);
        console.log(`🔍 Resolved photograph path: ${resolvedPhotoPath}`);
        
        let photoUploaded = false;
        
        // Strategy 1: Find file input directly (most reliable)
        try {
          const allFileInputs = this.page.locator('input[type="file"]');
          const count = await allFileInputs.count();
          console.log(`🔍 Found ${count} file input(s) on page`);
          
          if (count > 0) {
            const firstFileInput = allFileInputs.first();
            // File inputs are often hidden, so check if attached to DOM
            await firstFileInput.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
            
            // Scroll to make sure the upload area is visible
            await firstFileInput.scrollIntoViewIfNeeded().catch(() => {});
            await this.page.waitForTimeout(500);
            
            await firstFileInput.setInputFiles(resolvedPhotoPath);
            console.log(`✅ Photograph uploaded via first file input: ${resolvedPhotoPath}`);
            photoUploaded = true;
            await this.page.waitForTimeout(1000);
          }
        } catch (e) {
          console.log(`⚠️ Direct file input upload failed: ${e.message}`);
        }
        
        // Strategy 2: Find "Upload Photograph" section and locate browse button
        if (!photoUploaded) {
          try {
            const photoSection = this.page.locator('*').filter({ hasText: /Upload Photograph/i }).first();
            if (await photoSection.isVisible({ timeout: 3000 }).catch(() => false)) {
              console.log('🔍 Found Upload Photograph section');
              
              // Try clicking the section itself or "click to browse files" within it
              const browseText = photoSection.getByText(/click to browse files|Drag and Drop/i).first();
              if (await browseText.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log('🔍 Found browse text in photograph section');
                const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 5000 });
                await browseText.scrollIntoViewIfNeeded();
                await browseText.click();
                const fileChooser = await fileChooserPromise.catch(() => null);
                
                if (fileChooser) {
                  await fileChooser.setFiles(resolvedPhotoPath);
                  console.log(`✅ Photograph uploaded via browse button: ${resolvedPhotoPath}`);
                  photoUploaded = true;
                }
              } else {
                // Click the entire section
                const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 5000 });
                await photoSection.click();
                const fileChooser = await fileChooserPromise.catch(() => null);
                
                if (fileChooser) {
                  await fileChooser.setFiles(resolvedPhotoPath);
                  console.log(`✅ Photograph uploaded via section click: ${resolvedPhotoPath}`);
                  photoUploaded = true;
                }
              }
              await this.page.waitForTimeout(1000);
            }
          } catch (e) {
            console.log(`⚠️ Photograph section browse failed: ${e.message}`);
          }
        }
        
        // Strategy 3: Find all "click to browse files" and try the first one
        if (!photoUploaded) {
          try {
            const allBrowseTexts = this.page.getByText(/click to browse files|browse files/i);
            const count = await allBrowseTexts.count();
            if (count > 0) {
              const firstBrowse = allBrowseTexts.first();
              if (await firstBrowse.isVisible({ timeout: 2000 }).catch(() => false)) {
                const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 5000 });
                await firstBrowse.scrollIntoViewIfNeeded();
                await firstBrowse.click();
                const fileChooser = await fileChooserPromise.catch(() => null);
                
                if (fileChooser) {
                  await fileChooser.setFiles(resolvedPhotoPath);
                  console.log(`✅ Photograph uploaded via first browse text: ${resolvedPhotoPath}`);
                  photoUploaded = true;
                }
              }
            }
          } catch (e) {
            console.log(`⚠️ First browse text failed: ${e.message}`);
          }
        }
        
        if (!photoUploaded) {
          console.log('⚠️ Photograph upload section not found or upload failed');
        }
      } catch (e) {
        console.log(`⚠️ Error uploading photograph: ${e.message}`);
      }
      
      // Upload Address Document
      try {
        console.log(`Uploading address document: ${addressDocumentFile}...`);
        const resolvedAddressPath = path.isAbsolute(addressDocumentFile) ? addressDocumentFile : path.resolve(process.cwd(), addressDocumentFile);
        console.log(`🔍 Resolved address document path: ${resolvedAddressPath}`);
        
        let addressUploaded = false;
        
        // Strategy 1: Find second file input directly (most reliable)
        try {
          const allFileInputs = this.page.locator('input[type="file"]');
          const count = await allFileInputs.count();
          console.log(`🔍 Found ${count} file input(s) on page for address document`);
          
          if (count >= 2) {
            const secondFileInput = allFileInputs.nth(1);
            // File inputs are often hidden, so check if attached to DOM
            await secondFileInput.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
            
            // Scroll to make sure the upload area is visible
            await secondFileInput.scrollIntoViewIfNeeded().catch(() => {});
            await this.page.waitForTimeout(500);
            
            await secondFileInput.setInputFiles(resolvedAddressPath);
            console.log(`✅ Address Document uploaded via second file input: ${resolvedAddressPath}`);
            addressUploaded = true;
            await this.page.waitForTimeout(1000);
          }
        } catch (e) {
          console.log(`⚠️ Direct file input upload failed for address: ${e.message}`);
        }
        
        // Strategy 2: Find "Upload Address Document" section and locate browse button
        if (!addressUploaded) {
          try {
            const addressSection = this.page.locator('*').filter({ hasText: /Upload Address Document/i }).first();
            if (await addressSection.isVisible({ timeout: 3000 }).catch(() => false)) {
              console.log('🔍 Found Upload Address Document section');
              
              // Try clicking the section itself or "click to browse files" within it
              const browseText = addressSection.getByText(/click to browse files|Drag and Drop/i).first();
              if (await browseText.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log('🔍 Found browse text in address document section');
                const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 5000 });
                await browseText.scrollIntoViewIfNeeded();
                await browseText.click();
                const fileChooser = await fileChooserPromise.catch(() => null);
                
                if (fileChooser) {
                  await fileChooser.setFiles(resolvedAddressPath);
                  console.log(`✅ Address Document uploaded via browse button: ${resolvedAddressPath}`);
                  addressUploaded = true;
                }
              } else {
                // Click the entire section
                const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 5000 });
                await addressSection.click();
                const fileChooser = await fileChooserPromise.catch(() => null);
                
                if (fileChooser) {
                  await fileChooser.setFiles(resolvedAddressPath);
                  console.log(`✅ Address Document uploaded via section click: ${resolvedAddressPath}`);
                  addressUploaded = true;
                }
              }
              await this.page.waitForTimeout(1000);
            }
          } catch (e) {
            console.log(`⚠️ Address document section browse failed: ${e.message}`);
          }
        }
        
        // Strategy 3: Find all "click to browse files" and try the second one
        if (!addressUploaded) {
          try {
            const allBrowseTexts = this.page.getByText(/click to browse files|browse files/i);
            const count = await allBrowseTexts.count();
            if (count >= 2) {
              const secondBrowse = allBrowseTexts.nth(1);
              if (await secondBrowse.isVisible({ timeout: 2000 }).catch(() => false)) {
                const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 5000 });
                await secondBrowse.scrollIntoViewIfNeeded();
                await secondBrowse.click();
                const fileChooser = await fileChooserPromise.catch(() => null);
                
                if (fileChooser) {
                  await fileChooser.setFiles(resolvedAddressPath);
                  console.log(`✅ Address Document uploaded via second browse text: ${resolvedAddressPath}`);
                  addressUploaded = true;
                }
              }
            }
          } catch (e) {
            console.log(`⚠️ Second browse text failed: ${e.message}`);
          }
        }
        
        if (!addressUploaded) {
          console.log('⚠️ Address Document upload section not found or upload failed');
        }
      } catch (e) {
        console.log(`⚠️ Error uploading address document: ${e.message}`);
      }
      
      // Click Upload button
      try {
        console.log('Clicking Upload button...');
        await this.page.waitForTimeout(2000); // Wait for upload section to be ready
        
        const uploadSelectors = [
          // Strategy 1: By role with exact text
          () => this.page.getByRole('button', { name: 'Upload' }),
          // Strategy 2: By role with case-insensitive regex
          () => this.page.getByRole('button', { name: /Upload/i }),
          // Strategy 3: By role with exact match regex
          () => this.page.getByRole('button', { name: /^Upload$/i }),
          // Strategy 4: Button locator with text filter (exact)
          () => this.page.locator('button').filter({ hasText: /^Upload$/i }),
          // Strategy 5: Button locator with text filter (contains)
          () => this.page.locator('button').filter({ hasText: /Upload/i }),
          // Strategy 6: Button with has-text selector
          () => this.page.locator('button:has-text("Upload")'),
          // Strategy 7: Find button near upload sections
          async () => {
            const uploadSection = this.page.getByText(/Upload Photograph|Upload Address Document/i).first();
            if (await uploadSection.isVisible({ timeout: 3000 }).catch(() => false)) {
              const uploadButton = uploadSection.locator('xpath=following::button[contains(text(), "Upload")][1] | ancestor::*[1]//button[contains(text(), "Upload")][1]').first();
              if (await uploadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                return uploadButton;
              }
            }
            return null;
          },
          // Strategy 8: Find all buttons and filter by text content
          async () => {
            const allButtons = this.page.locator('button');
            const count = await allButtons.count();
            for (let i = 0; i < count; i++) {
              const btn = allButtons.nth(i);
              const text = await btn.textContent().catch(() => '');
              if (text && /^Upload$/i.test(text.trim())) {
                return btn;
              }
            }
            return null;
          },
        ];
        
        let uploadClicked = false;
        for (let i = 0; i < uploadSelectors.length && !uploadClicked; i++) {
          try {
            const uploadButtonFn = uploadSelectors[i];
            const uploadButton = await uploadButtonFn();
            if (!uploadButton) continue;
            
            // Check if button is visible and enabled
            const isVisible = await uploadButton.isVisible({ timeout: 5000 }).catch(() => false);
            if (isVisible) {
              const isEnabled = await uploadButton.isEnabled().catch(() => true);
              if (isEnabled) {
                await uploadButton.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(500);
                
                // Try normal click first
                try {
                  await uploadButton.click({ timeout: 5000 });
                  console.log(`✅ Upload button clicked (selector ${i + 1})`);
                  uploadClicked = true;
                  break;
                } catch (clickError) {
                  console.log(`  Selector ${i + 1}: Click failed, trying force click: ${clickError.message}`);
                  try {
                    await uploadButton.click({ force: true, timeout: 5000 });
                    console.log(`✅ Upload button clicked with force (selector ${i + 1})`);
                    uploadClicked = true;
                    break;
                  } catch (forceError) {
                    console.log(`  Selector ${i + 1}: Force click also failed: ${forceError.message}`);
                    continue;
                  }
                }
              }
            }
          } catch (e) {
            console.log(`  Selector ${i + 1}: Error - ${e.message}`);
            continue;
          }
        }
        
        if (!uploadClicked) {
          console.log('⚠️ Upload button not found or could not be clicked');
          console.log('🔍 Attempting to find any button with Upload text...');
          // Last resort: try to find any element with Upload text
          try {
            const allButtons = this.page.locator('button');
            const buttonCount = await allButtons.count();
            console.log(`Found ${buttonCount} buttons on page`);
            for (let i = 0; i < buttonCount; i++) {
              const btn = allButtons.nth(i);
              const text = await btn.textContent().catch(() => '');
              if (text && /Upload/i.test(text.trim())) {
                console.log(`  Button ${i}: "${text}"`);
                const isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                  try {
                    await btn.scrollIntoViewIfNeeded();
                    await this.page.waitForTimeout(300);
                    await btn.click({ force: true });
                    console.log(`✅ Upload button clicked (button ${i})`);
                    uploadClicked = true;
                    break;
                  } catch (e) {
                    continue;
                  }
                }
              }
            }
          } catch (e) {
            console.log(`❌ Final attempt failed: ${e.message}`);
          }
        }
      } catch (e) {
        console.log(`❌ Error clicking Upload button: ${e.message}`);
        console.log(`Stack trace: ${e.stack}`);
      }
      
      // Wait for page to load after clicking Upload (might show PROCEED button)
      console.log('⏳ Waiting for page to load and PROCEED button to appear...');
      await this.page.waitForTimeout(5000);
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await this.page.waitForTimeout(2000);
      
      // Click PROCEED button
      try {
        console.log('🔍 Searching for PROCEED button...');
        const proceedSelectors = [
          // Strategy 1: By role with exact text
          () => this.page.getByRole('button', { name: 'PROCEED' }),
          // Strategy 2: By role with case-insensitive regex
          () => this.page.getByRole('button', { name: /PROCEED/i }),
          // Strategy 3: By role with exact match regex
          () => this.page.getByRole('button', { name: /^PROCEED$/i }),
          // Strategy 4: Button locator with text filter (exact)
          () => this.page.locator('button').filter({ hasText: /^PROCEED$/i }),
          // Strategy 5: Button locator with text filter (contains)
          () => this.page.locator('button').filter({ hasText: /PROCEED/i }),
          // Strategy 6: Button with has-text selector
          () => this.page.locator('button:has-text("PROCEED")'),
          // Strategy 7: Button with case-insensitive text
          () => this.page.locator('button:has-text("Proceed")'),
          // Strategy 8: CSS selector with button text
          () => this.page.locator('button[type="button"]').filter({ hasText: /PROCEED/i }),
          // Strategy 9: CSS selector with button type submit
          () => this.page.locator('button[type="submit"]').filter({ hasText: /PROCEED/i }),
          // Strategy 10: Find by text and get parent button
          async () => {
            const proceedText = this.page.getByText(/^PROCEED$/i);
            const button = proceedText.locator('xpath=ancestor::button | ancestor::*[@role="button"]').first();
            if (await button.count() > 0) return button;
            return null;
          },
          // Strategy 11: Find all buttons and filter by text content
          async () => {
            const buttons = this.page.locator('button');
            const count = await buttons.count();
            for (let i = 0; i < count; i++) {
              const btn = buttons.nth(i);
              const text = await btn.textContent().catch(() => '');
              if (text && /^PROCEED$/i.test(text.trim())) {
                return btn;
              }
            }
            return null;
          },
          // Strategy 12: XPath selector
          () => this.page.locator('xpath=//button[contains(translate(text(), "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "PROCEED")]'),
        ];
        
        let proceedClicked = false;
        for (let i = 0; i < proceedSelectors.length && !proceedClicked; i++) {
          try {
            console.log(`  Trying selector ${i + 1}...`);
            const proceedButtonFn = proceedSelectors[i];
            const proceedButton = await proceedButtonFn();
            if (!proceedButton) {
              console.log(`  Selector ${i + 1}: No element found`);
              continue;
            }
            
            // Check if button exists and is visible
            const count = await proceedButton.count().catch(() => 0);
            if (count === 0) {
              console.log(`  Selector ${i + 1}: Count is 0`);
              continue;
            }
            
            const firstButton = proceedButton.first();
            const isVisible = await firstButton.isVisible({ timeout: 5000 }).catch(() => false);
            if (!isVisible) {
              console.log(`  Selector ${i + 1}: Not visible`);
              continue;
            }
            
            // Check if button is enabled
            const isEnabled = await firstButton.isEnabled().catch(() => true);
            if (!isEnabled) {
              console.log(`  Selector ${i + 1}: Button found but is disabled`);
              continue;
            }
            
            // Get button text for debugging
            const buttonText = await firstButton.textContent().catch(() => '');
            console.log(`  Selector ${i + 1}: Found button with text: "${buttonText}"`);
            
            // Scroll into view and wait
            await firstButton.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(500);
            
            // Wait for button to be stable
            await firstButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
            await this.page.waitForTimeout(300);
            
            // Try clicking with different methods
            try {
              await firstButton.click({ timeout: 5000 });
              console.log(`✅ PROCEED button clicked successfully (selector ${i + 1})`);
              proceedClicked = true;
              break;
            } catch (clickError) {
              console.log(`  Selector ${i + 1}: Click failed, trying force click: ${clickError.message}`);
              try {
                await firstButton.click({ force: true, timeout: 5000 });
                console.log(`✅ PROCEED button clicked with force (selector ${i + 1})`);
                proceedClicked = true;
                break;
              } catch (forceError) {
                console.log(`  Selector ${i + 1}: Force click also failed: ${forceError.message}`);
                continue;
              }
            }
          } catch (e) {
            console.log(`  Selector ${i + 1}: Error - ${e.message}`);
            continue;
          }
        }
        
        if (!proceedClicked) {
          console.log('⚠️ PROCEED button not found or could not be clicked');
          console.log('🔍 Attempting to find any button with PROCEED text...');
          // Last resort: try to find any element with PROCEED text
          try {
            const allButtons = this.page.locator('button');
            const buttonCount = await allButtons.count();
            console.log(`Found ${buttonCount} buttons on page`);
            for (let i = 0; i < buttonCount; i++) {
              const btn = allButtons.nth(i);
              const text = await btn.textContent().catch(() => '');
              console.log(`  Button ${i}: "${text}"`);
              if (text && /PROCEED/i.test(text.trim())) {
                await btn.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(500);
                await btn.click({ force: true });
                console.log(`✅ Found and clicked PROCEED button (button index ${i})`);
                proceedClicked = true;
                break;
              }
            }
          } catch (e) {
            console.log(`❌ Final attempt failed: ${e.message}`);
          }
        }
      } catch (e) {
        console.log(`❌ Error clicking PROCEED button: ${e.message}`);
        console.log(`Stack trace: ${e.stack}`);
      }
      
      // Wait for 2 minutes after clicking PROCEED
      console.log('⏳ Waiting 2 minutes after clicking PROCEED...');
      await this.page.waitForTimeout(120000); // 2 minutes = 120,000 milliseconds
      console.log('✅ 2 minutes wait completed after PROCEED');
      
      // Wait for page to navigate to KYC Status page
      await this.page.waitForTimeout(3000);
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      
      // Handle KYC Status page
      await this.handleKYCStatusPage();
      
    } catch (e) {
      console.log(`❌ Error handling IC KYC Portal page: ${e.message}`);
      throw e;
    }
  }

  /**
   * Handle KYC Status page: Set date fields and click search
   */
  async handleKYCStatusPage() {
    try {
      console.log('🔍 Handling KYC Status page...');
      
      // Wait for page to load
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await this.page.waitForTimeout(2000);
      
      // Click "KYC Status From" field and click "TODAY" button
      try {
        console.log('Setting KYC Status From date to TODAY...');
        const kycStatusFromSelectors = [
          // Strategy 1: Find by label text
          () => {
            const label = this.page.getByText('KYC Status From').first();
            return label.locator('xpath=following::input[1]');
          },
          // Strategy 2: Find input near label
          () => {
            const label = this.page.locator('label, div').filter({ hasText: /^KYC Status From/i }).first();
            return label.locator('xpath=following-sibling::*//input | following::input[1]').first();
          },
          // Strategy 3: Find by placeholder
          () => this.page.locator('input[placeholder*="DD/MM/YYYY"]').first(),
          // Strategy 4: Find input near "KYC Status From" text
          async () => {
            const text = this.page.getByText(/KYC Status From/i).first();
            const container = text.locator('xpath=ancestor::*[1]');
            return container.locator('input').first();
          },
        ];
        
        let fromFieldFound = false;
        for (let i = 0; i < kycStatusFromSelectors.length && !fromFieldFound; i++) {
          try {
            const fromFieldFn = kycStatusFromSelectors[i];
            const fromField = await fromFieldFn();
            if (!fromField) continue;
            
            if (await fromField.isVisible({ timeout: 5000 })) {
              await fromField.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(300);
              await fromField.click();
              await this.page.waitForTimeout(1000);
              
              // Look for "TODAY" button in the date picker
              console.log('  Looking for TODAY button...');
              const todayButtonSelectors = [
                () => this.page.getByRole('button', { name: 'TODAY' }),
                () => this.page.getByRole('button', { name: /TODAY/i }),
                () => this.page.locator('button').filter({ hasText: /^TODAY$/i }),
                () => this.page.locator('button:has-text("TODAY")'),
                () => this.page.locator('button:has-text("Today")'),
              ];
              
              let todayClicked = false;
              for (let j = 0; j < todayButtonSelectors.length && !todayClicked; j++) {
                try {
                  const todayButton = todayButtonSelectors[j]();
                  if (await todayButton.isVisible({ timeout: 5000 })) {
                    await todayButton.scrollIntoViewIfNeeded();
                    await this.page.waitForTimeout(300);
                    await todayButton.click();
                    console.log(`✅ TODAY button clicked for KYC Status From (selector ${j + 1})`);
                    todayClicked = true;
                    fromFieldFound = true;
                    await this.page.waitForTimeout(1000);
                    break;
                  }
                } catch (e) {
                  continue;
                }
              }
              
              if (!todayClicked) {
                console.log('⚠️ TODAY button not found for KYC Status From');
              } else {
                break;
              }
            }
          } catch (e) {
            console.log(`⚠️ KYC Status From selector ${i + 1} failed: ${e.message}`);
            continue;
          }
        }
        
        if (!fromFieldFound) {
          console.log('⚠️ KYC Status From field not found');
        }
      } catch (e) {
        console.log(`⚠️ Error setting KYC Status From: ${e.message}`);
      }
      
      // Click "KYC Status To" field and click "TODAY" button
      try {
        console.log('Setting KYC Status To date to TODAY...');
        await this.page.waitForTimeout(1000);
        
        const kycStatusToSelectors = [
          // Strategy 1: Find by label text
          () => {
            const label = this.page.getByText('KYC Status To').first();
            return label.locator('xpath=following::input[1]');
          },
          // Strategy 2: Find input near label
          () => {
            const label = this.page.locator('label, div').filter({ hasText: /^KYC Status To/i }).first();
            return label.locator('xpath=following-sibling::*//input | following::input[1]').first();
          },
          // Strategy 3: Find by placeholder (second input)
          () => this.page.locator('input[placeholder*="DD/MM/YYYY"]').nth(1),
          // Strategy 4: Find input near "KYC Status To" text
          async () => {
            const text = this.page.getByText(/KYC Status To/i).first();
            const container = text.locator('xpath=ancestor::*[1]');
            return container.locator('input').first();
          },
          // Strategy 5: Find all date inputs and use the second one
          async () => {
            const inputs = this.page.locator('input[placeholder*="DD/MM/YYYY"]');
            const count = await inputs.count();
            if (count >= 2) {
              return inputs.nth(1);
            }
            return null;
          },
        ];
        
        let toFieldFound = false;
        for (let i = 0; i < kycStatusToSelectors.length && !toFieldFound; i++) {
          try {
            const toFieldFn = kycStatusToSelectors[i];
            const toField = await toFieldFn();
            if (!toField) continue;
            
            if (await toField.isVisible({ timeout: 5000 })) {
              await toField.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(300);
              await toField.click();
              await this.page.waitForTimeout(1000);
              
              // Look for "TODAY" button in the date picker
              console.log('  Looking for TODAY button...');
              const todayButtonSelectors = [
                () => this.page.getByRole('button', { name: 'TODAY' }),
                () => this.page.getByRole('button', { name: /TODAY/i }),
                () => this.page.locator('button').filter({ hasText: /^TODAY$/i }),
                () => this.page.locator('button:has-text("TODAY")'),
                () => this.page.locator('button:has-text("Today")'),
              ];
              
              let todayClicked = false;
              for (let j = 0; j < todayButtonSelectors.length && !todayClicked; j++) {
                try {
                  const todayButton = todayButtonSelectors[j]();
                  if (await todayButton.isVisible({ timeout: 5000 })) {
                    await todayButton.scrollIntoViewIfNeeded();
                    await this.page.waitForTimeout(300);
                    await todayButton.click();
                    console.log(`✅ TODAY button clicked for KYC Status To (selector ${j + 1})`);
                    todayClicked = true;
                    toFieldFound = true;
                    await this.page.waitForTimeout(1000);
                    break;
                  }
                } catch (e) {
                  continue;
                }
              }
              
              if (!todayClicked) {
                console.log('⚠️ TODAY button not found for KYC Status To');
              } else {
                break;
              }
            }
          } catch (e) {
            console.log(`⚠️ KYC Status To selector ${i + 1} failed: ${e.message}`);
            continue;
          }
        }
        
        if (!toFieldFound) {
          console.log('⚠️ KYC Status To field not found');
        }
      } catch (e) {
        console.log(`⚠️ Error setting KYC Status To: ${e.message}`);
      }
      
      // Click "SEARCH" button
      try {
        console.log('Clicking SEARCH button...');
        await this.page.waitForTimeout(1000);
        
        const searchButtonSelectors = [
          () => this.page.getByRole('button', { name: 'SEARCH' }),
          () => this.page.getByRole('button', { name: /SEARCH/i }),
          () => this.page.getByRole('button', { name: /^SEARCH$/i }),
          () => this.page.locator('button').filter({ hasText: /^SEARCH$/i }),
          () => this.page.locator('button:has-text("SEARCH")'),
          () => this.page.locator('button:has-text("Search")'),
          // Strategy: Find button with search icon
          () => this.page.locator('button').filter({ hasText: /SEARCH/i }),
        ];
        
        let searchClicked = false;
        for (let i = 0; i < searchButtonSelectors.length && !searchClicked; i++) {
          try {
            const searchButton = searchButtonSelectors[i]();
            if (await searchButton.isVisible({ timeout: 5000 })) {
              await searchButton.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(500);
              await searchButton.click();
              console.log(`✅ SEARCH button clicked (selector ${i + 1})`);
              searchClicked = true;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!searchClicked) {
          console.log('⚠️ SEARCH button not found');
        }
      } catch (e) {
        console.log(`⚠️ Error clicking SEARCH button: ${e.message}`);
      }
      
    } catch (e) {
      console.log(`❌ Error handling KYC Status page: ${e.message}`);
      throw e;
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
          
          // Handle proposal preview page actions: checkboxes, file upload, and Verify KYC
          await this.handleProposalPreviewPage();
          
        } catch (navError) {
          console.log('Error waiting for navigation:', navError.message);
        }
        
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