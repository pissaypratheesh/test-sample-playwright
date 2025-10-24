const FormUtils = require('./FormUtils');

/**
 * Policy Details Utilities - Functions for policy details form filling
 * Extends FormUtils for common form interactions
 */
class PolicyDetailsUtils extends FormUtils {
  constructor(page) {
    super(page);
  }

  /**
   * Fill policy details with variations for renew/new policies
   * @param {Object} testdata - Test data object
   * @param {string} policyType - Type of policy ('renewal' or 'new')
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async fillPolicyDetails(testdata, policyType = 'renewal', takeScreenshot = true) {
    console.log(`📋 Step: Filling Policy Details (${policyType})`);
    
    try {
      // Wait for form to be ready
      await this.page.waitForSelector('#mui-component-select-FKOEM_ID', { timeout: 30000 });
      
      if (policyType === 'renewal') {
        // Fill renewal-specific policy details
        await this.fillRenewalPolicyDetails(testdata);
      } else if (policyType === 'new') {
        // Fill new policy details
        await this.fillNewPolicyDetails(testdata);
      }
      
      // Wait for form to process and page to stabilize
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
      
      if (takeScreenshot) {
        await this.takeFormScreenshot('policy-details-filled.png');
      }
      
      console.log(`✅ Policy Details Filled (${policyType})`);
    } catch (error) {
      console.error('❌ Error filling policy details:', error.message);
      throw error;
    }
  }

  /**
   * Fill renewal-specific policy details
   * @param {Object} data - Policy data object
   */
  async fillRenewalPolicyDetails(data) {
    // OEM selection
    await this.selectDropdownOption(
      this.page.locator('#mui-component-select-FKOEM_ID'),
      data.oem
    );

    // Wait for page refresh/update after OEM selection
    console.log('⏳ Waiting for page to refresh after OEM selection...');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000); // Additional wait for dynamic content

    // Vehicle Cover
    await this.selectDropdownOption(
      this.page.locator('#mui-component-select-CoverTypeId'),
      data.vehicleCover
    );

    // Wait for page to process after vehicle cover selection
    await this.page.waitForTimeout(2000);

    // Proposer Type
    if (data.proposerType) {
      await this.selectRadioOption('Proposer Type', data.proposerType);
    }

    // Vehicle Class
    if (data.vehicleClass) {
      await this.selectRadioOption('Vehicle Class', data.vehicleClass);
    }
  }

  /**
   * Fill new policy details
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

    // Proposer Type
    if (data.proposerType) {
      await this.selectRadioOption('Proposer Type', data.proposerType);
    }

    // Vehicle Class
    if (data.vehicleClass) {
      await this.selectRadioOption('Vehicle Class', data.vehicleClass);
    }
  }

  /**
   * Take form screenshot with timestamp
   * @param {string} filename - Screenshot filename
   */
  async takeFormScreenshot(filename) {
    try {
      await this.page.screenshot({ 
        path: `.playwright-mcp/${filename}`, 
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.log(`⚠️ Could not take screenshot: ${error.message}`);
    }
  }
}

module.exports = PolicyDetailsUtils;
