const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * OEM Selection Handler
 * Handles OEM selection and related operations
 */
class OEMSelectionHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Select OEM (Original Equipment Manufacturer)
   * @param {string} oem - OEM name
   */
  async selectOEM(oem) {
    console.log(`Selecting OEM: ${oem}`);
    await this.page.locator('#mui-component-select-FKOEM_ID').click();
    await this.page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 10000 });
    await this.page.locator('ul[role="listbox"] li[role="option"]', { hasText: oem }).click({ force: true });
    await this.page.waitForTimeout(500);
    console.log(`✅ OEM selected: ${oem}`);
  }

  /**
   * Select Proposer Type (Individual/Corporate)
   * @param {string} proposerType - Type of proposer
   */
  async selectProposerType(proposerType) {
    console.log(`Selecting Proposer Type: ${proposerType}`);
    const proposerToggle = this.page.getByRole('button', { name: new RegExp(proposerType.toLowerCase(), 'i') });
    if (await proposerToggle.isVisible().catch(() => false)) {
      await proposerToggle.click();
      console.log(`✅ Proposer Type selected: ${proposerType}`);
    }
  }

  /**
   * Select Vehicle Cover (affects form fields dynamically)
   * @param {string} vehicleCover - Type of vehicle cover
   */
  async selectVehicleCover(vehicleCover) {
    console.log(`Selecting Vehicle Cover: ${vehicleCover}`);
    await this.selectMuiOption('#mui-component-select-CoverTypeId', vehicleCover);
    console.log(`✅ Vehicle Cover selected: ${vehicleCover}`);
  }
}

module.exports = OEMSelectionHandler;
