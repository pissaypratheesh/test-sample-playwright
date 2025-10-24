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
    
    // VIN (Chassis No) - Use from test data
    console.log(`🔍 [VehicleDetailsHandler] Using VIN from test data: ${data.vin}`);
    const vinInput = this.page.locator('input[name="ChassisNo"]');
    const isVinVisible = await vinInput.isVisible().catch(() => false);
    console.log(`🔍 [VehicleDetailsHandler] VIN field visible: ${isVinVisible}`);
    
    if (isVinVisible) {
      await this.fillInput(vinInput, data.vin);
      console.log(`✅ VIN filled: ${data.vin}`);
    } else {
      console.log('🔍 [VehicleDetailsHandler] VIN field not visible, trying alternative selectors...');
      // Try alternative selectors
      const vinInputAlt = this.page.locator('input[placeholder*="CHASSIS"], input[placeholder*="chassis"], input[placeholder*="Chassis"]');
      const isVinAltVisible = await vinInputAlt.isVisible().catch(() => false);
      console.log(`🔍 [VehicleDetailsHandler] VIN field (alt) visible: ${isVinAltVisible}`);
      
      if (isVinAltVisible) {
        await this.fillInput(vinInputAlt, data.vin);
        console.log(`✅ VIN filled (alt): ${data.vin}`);
      } else {
        console.log('❌ VIN field not found with any selector');
      }
    }
    
    // Engine No - Use from test data
    console.log(`🔍 [VehicleDetailsHandler] Using Engine No from test data: ${data.engineNo}`);
    await this.fillInput(this.page.locator('input[name="EngineNo"]'), data.engineNo);
    
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
}

module.exports = VehicleDetailsHandler;
