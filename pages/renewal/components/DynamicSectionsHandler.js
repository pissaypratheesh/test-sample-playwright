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
    console.log('Filling Additional Details section...');
    
    try {
      // Find and expand the additional details accordion
      await this.expandAdditionalDetailsAccordion();
      
      // Fill NCB Carry Forward section
      await this.fillNCBCarryForwardSection(data);
      
      // Fill Voluntary Excess section
      await this.fillVoluntaryExcessSection(data);
      
      // Fill AAI Membership section
      await this.fillAAIMembershipSection(data);
      
      // Fill Handicapped discount section
      await this.fillHandicappedSection(data);
      
      // Fill Anti-theft discount section
      await this.fillAntiTheftSection(data);
      
    } catch (e) {
      console.log('Error filling additional details section:', e.message);
    }
  }

  /**
   * Expand the Additional Details accordion
   */
  async expandAdditionalDetailsAccordion() {
    try {
      const additionalHeader = this.page.getByText(/Additional\s*(details|discount)/i).first();
      await this.scrollIntoView(additionalHeader);
      
      // If an accordion, ensure expanded by clicking header if details not visible
      const detailsRoot = this.page.locator('.MuiAccordionDetails-root').filter({ hasText: /NCB|Voluntary|AAI|Handicapped|Anti\s*Theft/i }).first();
      if (!(await detailsRoot.isVisible().catch(() => false))) {
        await additionalHeader.click().catch(() => {});
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('Error expanding additional details accordion:', e.message);
    }
  }

  /**
   * Fill NCB Carry Forward section
   * @param {Object} data - NCB data
   */
  async fillNCBCarryForwardSection(data) {
    console.log('Filling NCB Carry Forward section...');
    
    try {
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
      // Toggle Yes for AAI membership
      await this.toggleYesNearLabel(/AAI\s*Membership/i);
      console.log('✅ AAI Membership toggled');
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
      // Toggle Yes for Handicapped discount
      await this.toggleYesNearLabel(/Handicapped/i);
      console.log('✅ Handicapped discount toggled');
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
      // Toggle Yes for Anti-theft discount
      await this.toggleYesNearLabel(/Anti\s*Theft/i);
      console.log('✅ Anti-theft discount toggled');
    } catch (e) {
      console.log('Error filling Anti-theft section:', e.message);
    }
  }
}

module.exports = DynamicSectionsHandler;
