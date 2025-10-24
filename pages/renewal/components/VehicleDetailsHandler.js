const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * Vehicle Details Handler
 * Handles vehicle information filling
 */
class VehicleDetailsHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Fill Vehicle Details section
   * @param {Object} data - Vehicle data
   */
  async fillVehicleDetails(data) {
    console.log('Filling Vehicle Details...');
    
    // Generate random VIN and Engine numbers
    const randomVin = this.generateRandomVin();
    const randomEngineNo = this.generateRandomEngineNo();
    
    // Save generated values for later use
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, '../../../testdata/generated_vin.json'), JSON.stringify({ vin: randomVin }, null, 2));
    fs.writeFileSync(path.join(__dirname, '../../../testdata/generated_engine.json'), JSON.stringify({ engine: randomEngineNo }, null, 2));
    
    // VIN (Chassis No)
    console.log(`🔍 [VehicleDetailsHandler] Generated VIN: ${randomVin}`);
    const vinInput = this.page.locator('input[name="ChassisNo"]');
    const isVinVisible = await vinInput.isVisible().catch(() => false);
    console.log(`🔍 [VehicleDetailsHandler] VIN field visible: ${isVinVisible}`);
    
    if (isVinVisible) {
      await this.fillInput(vinInput, randomVin);
      console.log(`✅ VIN filled: ${randomVin}`);
    } else {
      console.log('🔍 [VehicleDetailsHandler] VIN field not visible, trying alternative selectors...');
      // Try alternative selectors
      const vinInputAlt = this.page.locator('input[placeholder*="CHASSIS"], input[placeholder*="chassis"], input[placeholder*="Chassis"]');
      const isVinAltVisible = await vinInputAlt.isVisible().catch(() => false);
      console.log(`🔍 [VehicleDetailsHandler] VIN field (alt) visible: ${isVinAltVisible}`);
      
      if (isVinAltVisible) {
        await this.fillInput(vinInputAlt, randomVin);
        console.log(`✅ VIN filled (alt): ${randomVin}`);
      } else {
        console.log('❌ VIN field not found with any selector');
      }
    }
    
    // Engine No
    await this.fillInput(this.page.locator('input[name="EngineNo"]'), randomEngineNo);
    
    // Make
    await this.selectMuiOption('#mui-component-select-MakeId', data.make);
    
    // Model
    await this.selectMuiOption('#mui-component-select-ModelId', data.model);
    
    // Variant
    await this.selectMuiOption('#mui-component-select-VariantId', data.variant);
    
    // Year of Manufacture
    await this.selectMuiOption('#mui-component-select-DateofManufacture', data.year);
    
    // Registration City
    await this.selectMuiOption('#mui-component-select-RTOId', data.registrationCity);
    
    // Customer State
    await this.selectMuiOption('#mui-component-select-IsuredStateId', data.customerState);
    
    console.log('✅ Vehicle Details filled');
  }

  /**
   * Generate random VIN number
   * @returns {string} Random VIN number
   */
  generateRandomVin() {
    return Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
  }

  /**
   * Generate random Engine number
   * @returns {string} Random Engine number
   */
  generateRandomEngineNo() {
    return Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
  }
}

module.exports = VehicleDetailsHandler;
