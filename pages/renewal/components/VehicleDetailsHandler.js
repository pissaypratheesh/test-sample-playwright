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
    
    // Built Type - Select if provided
    if (data.builtType) {
      console.log(`Selecting Built Type: ${data.builtType}`);
      try {
        // Try multiple selectors for Built Type dropdown
        const builtTypeSelectors = [
          '#mui-component-select-FKBuiltType_ID', // Correct selector based on error log
          '#mui-component-select-BuiltTypeId',
          '#mui-component-select-BuiltType',
          'select[name="BuiltType"]',
          '[name="BuiltType"]',
        ];
        
        let builtTypeSelected = false;
        for (const selector of builtTypeSelectors) {
          try {
            await this.selectMuiOption(selector, data.builtType);
            console.log(`✅ Built Type selected: ${data.builtType}`);
            builtTypeSelected = true;
            break;
          } catch (e) {
            continue;
          }
        }
        
        // Fallback: Try to find by label text and click the visible combobox
        if (!builtTypeSelected) {
          try {
            // Try the correct selector based on the error message
            const builtTypeCombobox = this.page.locator('#mui-component-select-FKBuiltType_ID');
            if (await builtTypeCombobox.isVisible({ timeout: 3000 }).catch(() => false)) {
              await builtTypeCombobox.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(300);
              await builtTypeCombobox.click();
              await this.page.waitForTimeout(500);
              
              // Wait for options to appear
              await this.page.waitForSelector('ul[role="listbox"]', { timeout: 5000 });
              const option = this.page.getByRole('option', { name: new RegExp(data.builtType, 'i') });
              if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
                await option.click();
                console.log(`✅ Built Type selected via combobox: ${data.builtType}`);
                builtTypeSelected = true;
              }
            } else {
              // Try finding by label text
              const builtTypeLabel = this.page.getByText(/Built Type/i).first();
              if (await builtTypeLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
                // Find the visible combobox div near the label
                const builtTypeComboboxAlt = builtTypeLabel.locator('xpath=following::div[@role="combobox"][1] | following::*[@id="mui-component-select-FKBuiltType_ID"][1]').first();
                if (await builtTypeComboboxAlt.isVisible({ timeout: 2000 }).catch(() => false)) {
                  await builtTypeComboboxAlt.scrollIntoViewIfNeeded();
                  await this.page.waitForTimeout(300);
                  await builtTypeComboboxAlt.click();
                  await this.page.waitForTimeout(500);
                  
                  await this.page.waitForSelector('ul[role="listbox"]', { timeout: 5000 });
                  const option = this.page.getByRole('option', { name: new RegExp(data.builtType, 'i') });
                  if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await option.click();
                    console.log(`✅ Built Type selected via label: ${data.builtType}`);
                    builtTypeSelected = true;
                  }
                }
              }
            }
          } catch (e) {
            console.log(`⚠️ Built Type selection via label/combobox failed: ${e.message}`);
          }
        }
        
        if (!builtTypeSelected) {
          console.log(`⚠️ Built Type "${data.builtType}" not found with any selector`);
        }
      } catch (e) {
        console.log(`⚠️ Error selecting Built Type: ${e.message}`);
      }
    }
    
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
