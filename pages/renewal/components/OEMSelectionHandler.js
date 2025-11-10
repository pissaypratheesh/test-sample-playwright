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
   * Toggle Offline Quote to YES
   */
  async toggleOfflineQuoteYes() {
    console.log('Toggling Offline Quote to YES...');
    try {
      // Method 1: Find label and get parent, then find Yes button
      const offlineQuoteLabel = this.page.locator('label:has-text("Offline Quote")');
      if (await offlineQuoteLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
        const container = offlineQuoteLabel.locator('xpath=ancestor::*[1]');
        const yesButton = container.locator('button:has-text("Yes")');
        if (await yesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          const ariaPressed = await yesButton.getAttribute('aria-pressed').catch(() => null);
          if (ariaPressed !== 'true') {
            await yesButton.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(300);
            await yesButton.click();
            console.log('✅ Offline Quote toggled to YES');
            return;
          } else {
            console.log('✅ Offline Quote is already set to YES');
            return;
          }
        }
      }
      
      // Method 2: Use toggleYesNearLabel from BaseRenewalPage
      await this.toggleYesNearLabel(/Offline Quote/i);
      console.log('✅ Offline Quote toggled to YES (via toggleYesNearLabel)');
    } catch (e) {
      console.log(`⚠️ Error toggling Offline Quote: ${e.message}`);
    }
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
   * Select Vehicle Class (Private/Commercial)
   * @param {string} vehicleClass - Type of vehicle class (PRIVATE or COMMERCIAL)
   */
  async selectVehicleClass(vehicleClass) {
    console.log(`Selecting Vehicle Class: ${vehicleClass}`);
    try {
      const vehicleClassToggle = this.page.getByRole('button', { name: new RegExp(vehicleClass, 'i') });
      if (await vehicleClassToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
        await vehicleClassToggle.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(300);
        await vehicleClassToggle.click();
        console.log(`✅ Vehicle Class selected: ${vehicleClass}`);
      } else {
        console.log(`⚠️ Vehicle Class button "${vehicleClass}" not found`);
      }
    } catch (e) {
      console.log(`⚠️ Error selecting Vehicle Class: ${e.message}`);
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
