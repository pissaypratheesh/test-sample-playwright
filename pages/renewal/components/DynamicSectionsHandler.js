const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * Dynamic Sections Handler
 * Handles dynamic sections like NCB, Voluntary Excess, etc.
 */
class DynamicSectionsHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Fill Additional Details section with dynamic subsections
   * @param {Object} data - Additional details data
   */
  async fillAdditionalDetailsSection(data) {
    console.log('🔍 [DynamicSectionsHandler] ===== STARTING ADDITIONAL DETAILS SECTION =====');
    console.log('🔍 [DynamicSectionsHandler] Received data:', JSON.stringify(data, null, 2));
    
    try {
      // Find and expand the additional details accordion
      console.log('🔍 [DynamicSectionsHandler] Expanding Additional Details accordion...');
      await this.expandAdditionalDetailsAccordion();
      console.log('🔍 [DynamicSectionsHandler] ✅ Additional Details accordion expanded');
      
      // Fill NCB Carry Forward section
      console.log('🔍 [DynamicSectionsHandler] Starting NCB Carry Forward section...');
      await this.fillNCBCarryForwardSection(data);
      console.log('🔍 [DynamicSectionsHandler] ✅ NCB Carry Forward section completed');
      
      // Fill Voluntary Excess section
      console.log('🔍 [DynamicSectionsHandler] Starting Voluntary Excess section...');
      await this.fillVoluntaryExcessSection(data);
      console.log('🔍 [DynamicSectionsHandler] ✅ Voluntary Excess section completed');
      
      // Fill AAI Membership section
      console.log('🔍 [DynamicSectionsHandler] Starting AAI Membership section...');
      await this.fillAAIMembershipSection(data);
      console.log('🔍 [DynamicSectionsHandler] ✅ AAI Membership section completed');
      
      // Fill Handicapped discount section
      console.log('🔍 [DynamicSectionsHandler] Starting Handicapped discount section...');
      await this.fillHandicappedSection(data);
      console.log('🔍 [DynamicSectionsHandler] ✅ Handicapped discount section completed');
      
      // Fill Anti-theft discount section
      console.log('🔍 [DynamicSectionsHandler] Starting Anti-theft discount section...');
      await this.fillAntiTheftSection(data);
      console.log('🔍 [DynamicSectionsHandler] ✅ Anti-theft discount section completed');
      
      console.log('🔍 [DynamicSectionsHandler] ===== ADDITIONAL DETAILS SECTION COMPLETED =====');
      
    } catch (e) {
      console.log('❌ [DynamicSectionsHandler] Error filling additional details section:', e.message);
      console.log('❌ [DynamicSectionsHandler] Stack trace:', e.stack);
    }
  }

  /**
   * Expand the Additional Details accordion
   */
  async expandAdditionalDetailsAccordion() {
    console.log('🔍 [DynamicSectionsHandler] Starting to expand Additional Details accordion...');
    
    try {
      // Debug: Check current page state
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      console.log(`🔍 [DynamicSectionsHandler] Current URL: ${currentUrl}`);
      console.log(`🔍 [DynamicSectionsHandler] Current Title: ${pageTitle}`);
      
      // Look for Additional Details text
      console.log('🔍 [DynamicSectionsHandler] Looking for Additional Details text...');
      const additionalHeader = this.page.getByText(/Additional\s*(details|discount)/i).first();
      const headerVisible = await additionalHeader.isVisible().catch(() => false);
      console.log(`🔍 [DynamicSectionsHandler] Additional Details header visible: ${headerVisible}`);
      
      if (headerVisible) {
        console.log('🔍 [DynamicSectionsHandler] Found Additional Details header, scrolling into view...');
        await this.scrollIntoView(additionalHeader);
        
        // Check if accordion details are already visible
        console.log('🔍 [DynamicSectionsHandler] Checking if accordion details are already visible...');
        const detailsRoot = this.page.locator('.MuiAccordionDetails-root').filter({ hasText: /NCB|Voluntary|AAI|Handicapped|Anti\s*Theft/i }).first();
        const detailsVisible = await detailsRoot.isVisible().catch(() => false);
        console.log(`🔍 [DynamicSectionsHandler] Accordion details visible: ${detailsVisible}`);
        
        if (!detailsVisible) {
          console.log('🔍 [DynamicSectionsHandler] Accordion details not visible, clicking header to expand...');
          await additionalHeader.click().catch(() => {});
          await this.page.waitForTimeout(500);
          console.log('🔍 [DynamicSectionsHandler] ✅ Accordion header clicked');
        } else {
          console.log('🔍 [DynamicSectionsHandler] ✅ Accordion details already visible');
        }
      } else {
        console.log('⚠️ [DynamicSectionsHandler] Additional Details header not found!');
        
        // Try alternative selectors
        console.log('🔍 [DynamicSectionsHandler] Trying alternative selectors...');
        const altSelectors = [
          'text=Additional Discounts',
          'text=Additional Details',
          '[data-testid="additional-details"]',
          '.additional-details',
          '[class*="additional"]'
        ];
        
        for (const selector of altSelectors) {
          try {
            const element = this.page.locator(selector).first();
            const visible = await element.isVisible().catch(() => false);
            console.log(`🔍 [DynamicSectionsHandler] Selector "${selector}" visible: ${visible}`);
            if (visible) {
              console.log(`🔍 [DynamicSectionsHandler] Found element with selector: ${selector}`);
              await this.scrollIntoView(element);
              await element.click().catch(() => {});
              await this.page.waitForTimeout(500);
              break;
            }
          } catch (e) {
            console.log(`🔍 [DynamicSectionsHandler] Error with selector "${selector}": ${e.message}`);
          }
        }
      }
      
      console.log('🔍 [DynamicSectionsHandler] ✅ Additional Details accordion expansion completed');
      
    } catch (e) {
      console.log('❌ [DynamicSectionsHandler] Error expanding additional details accordion:', e.message);
      console.log('❌ [DynamicSectionsHandler] Stack trace:', e.stack);
    }
  }

  /**
   * Fill NCB Carry Forward section
   * @param {Object} data - NCB data
   */
  async fillNCBCarryForwardSection(data) {
    console.log('Filling NCB Carry Forward section...');
    
    try {
      // Check if NCB Carry Forward should be enabled
      const shouldEnableNCB = data.ncbCarryForward === true || data.ncbCarryForward === "YES";
      console.log(`🔍 [DynamicSectionsHandler] NCB Carry Forward should be enabled: ${shouldEnableNCB}`);
      
      if (shouldEnableNCB) {
        // Toggle Yes for NCB Carry forward
        await this.toggleYesNearLabel(/NCB\s*Carry\s*Forward/i);
        
        // Wait for NCB dropdown container
        await this.page.locator('#divNCBValue').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        
        // Select NCB Level
        const ncbSelected = await (async () => {
          try { 
            await this.selectDropdownNearLabel(/Entitled\s*NCB\s*%/i, data.ncbLevel, { numeric: true }); 
            return true; 
          } catch { 
            try { 
              await this.selectMuiOption('#mui-component-select-NCBLevel', data.ncbLevel, { numeric: true }); 
              return true; 
            } catch { 
              return false; 
            }
          }
        })();
        
        if (ncbSelected) {
          console.log(`✅ NCB Level selected: ${data.ncbLevel}`);
        } else {
          console.log('⚠️ Could not select NCB Level');
        }
      } else {
        console.log('🔍 [DynamicSectionsHandler] NCB Carry Forward disabled - skipping');
      }
      
    } catch (e) {
      console.log('Error filling NCB Carry Forward section:', e.message);
    }
  }

  /**
   * Fill Voluntary Excess section
   * @param {Object} data - Voluntary excess data
   */
  async fillVoluntaryExcessSection(data) {
    console.log('Filling Voluntary Excess section...');
    
    try {
      // Check if Voluntary Excess should be enabled
      const shouldEnableVoluntary = data.voluntaryExcessEnabled === true || data.voluntaryExcessEnabled === "YES";
      console.log(`🔍 [DynamicSectionsHandler] Voluntary Excess should be enabled: ${shouldEnableVoluntary}`);
      
      if (shouldEnableVoluntary) {
        // Toggle Yes for Voluntary excess
        await this.toggleYesNearLabel(/Voluntary\s*Excess/i);
        
        // Wait for Voluntary Excess dropdown container
        await this.page.locator('#divVoluntaryExcess').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        
        // Select Voluntary Excess amount
        const volSelected = await (async () => {
          try { 
            await this.selectDropdownNearLabel(/Voluntary\s*Excess/i, data.voluntaryExcess, { numeric: true }); 
            return true; 
          } catch { 
            try { 
              await this.selectMuiOption('#mui-component-select-VoluntaryExcess', data.voluntaryExcess, { numeric: true }); 
              return true; 
            } catch { 
              return false; 
            }
          }
        })();
        
        if (volSelected) {
          console.log(`✅ Voluntary Excess selected: ${data.voluntaryExcess}`);
        } else {
          console.log('⚠️ Could not select Voluntary Excess');
        }
      } else {
        console.log('🔍 [DynamicSectionsHandler] Voluntary Excess disabled - skipping');
      }
      
    } catch (e) {
      console.log('Error filling Voluntary Excess section:', e.message);
    }
  }

  /**
   * Fill AAI Membership section
   * @param {Object} data - AAI membership data
   */
  async fillAAIMembershipSection(data) {
    console.log('Filling AAI Membership section...');
    
    try {
      // Check if AAI Membership should be enabled
      const shouldEnableAAI = data.aaiMembership === true || data.aaiMembership === "YES";
      console.log(`🔍 [DynamicSectionsHandler] AAI Membership should be enabled: ${shouldEnableAAI}`);
      
      if (shouldEnableAAI) {
        // Toggle Yes for AAI membership
        await this.toggleYesNearLabel(/AAI\s*Membership/i);
        console.log('✅ AAI Membership toggled');
      } else {
        console.log('🔍 [DynamicSectionsHandler] AAI Membership disabled - skipping');
      }
    } catch (e) {
      console.log('Error filling AAI Membership section:', e.message);
    }
  }

  /**
   * Fill Handicapped discount section
   * @param {Object} data - Handicapped discount data
   */
  async fillHandicappedSection(data) {
    console.log('Filling Handicapped discount section...');
    
    try {
      // Check if Handicapped discount should be enabled
      const shouldEnableHandicapped = data.handicappedDiscount === true || data.handicappedDiscount === "YES";
      console.log(`🔍 [DynamicSectionsHandler] Handicapped discount should be enabled: ${shouldEnableHandicapped}`);
      
      if (shouldEnableHandicapped) {
        // Toggle Yes for Handicapped discount
        await this.toggleYesNearLabel(/Handicapped/i);
        console.log('✅ Handicapped discount toggled');
      } else {
        console.log('🔍 [DynamicSectionsHandler] Handicapped discount disabled - skipping');
      }
    } catch (e) {
      console.log('Error filling Handicapped section:', e.message);
    }
  }

  /**
   * Fill Anti-theft discount section
   * @param {Object} data - Anti-theft discount data
   */
  async fillAntiTheftSection(data) {
    console.log('Filling Anti-theft discount section...');
    
    try {
      // Check if Anti-theft discount should be enabled
      const shouldEnableAntiTheft = data.antiTheftDiscount === true || data.antiTheftDiscount === "YES";
      console.log(`🔍 [DynamicSectionsHandler] Anti-theft discount should be enabled: ${shouldEnableAntiTheft}`);
      
      if (shouldEnableAntiTheft) {
        // Toggle Yes for Anti-theft discount
        await this.toggleYesNearLabel(/Anti\s*Theft/i);
        console.log('✅ Anti-theft discount toggled');
      } else {
        console.log('🔍 [DynamicSectionsHandler] Anti-theft discount disabled - skipping');
      }
    } catch (e) {
      console.log('Error filling Anti-theft section:', e.message);
    }
  }
}

module.exports = DynamicSectionsHandler;
