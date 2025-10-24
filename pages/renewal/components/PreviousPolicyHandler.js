const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * Previous Policy Details Handler
 * Handles previous policy information filling
 */
class PreviousPolicyHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Fill Previous Policy Details section
   * @param {Object} data - Previous policy data
   */
  async fillPreviousPolicyDetails(data) {
    console.log('Filling Previous Policy Details...');
    
    // Previous Policy Number
    await this.fillInput(this.page.getByLabel('Previous Policy No'), data.prevPolicyNo);
    
    // Previous Vehicle Cover
    await this.selectMuiOption('#mui-component-select-PREV_COVERTYPE_ID', data.prevVehicleCover);
    
    // NCB Level
    await this.selectMuiOption('#mui-component-select-OLD_POL_NCB_LEVEL', data.ncb, { numeric: true });
    
    // Previous Policy Insurance Company
    await this.selectMuiOption('#mui-component-select-FKISURANCE_COMP_ID', data.prevPolicyIC);
    
    // Policy Expiry Dates
    await this.fillPolicyExpiryDates(data);
    
    console.log('✅ Previous Policy Details filled');
  }

  /**
   * Fill Policy Expiry Dates (OD and TP)
   * @param {Object} data - Policy expiry data
   */
  async fillPolicyExpiryDates(data) {
    const expiryInputs = this.page.locator('input[name="POLICY_EXPIRY_DATE"]');
    const expiryCount = await expiryInputs.count();
    
    if (expiryCount >= 1) {
      await this.setDateOnInput(expiryInputs.nth(0), data.odPolicyExpiryDate);
    }
    
    if (expiryCount >= 2) {
      await this.setDateOnInput(expiryInputs.nth(1), data.tpPolicyExpiryDate);
    } else {
      // Fallback by label if DOM structure differs
      try {
        await this.setDateByLabel(/TP\s*Policy\s*Expiry\s*Date/i, data.tpPolicyExpiryDate);
      } catch (e) {
        console.log('TP Policy Expiry Date fallback failed:', e.message);
      }
    }
  }

}

module.exports = PreviousPolicyHandler;
