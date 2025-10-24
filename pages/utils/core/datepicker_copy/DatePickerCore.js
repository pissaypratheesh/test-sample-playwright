const BasePage = require('../BasePage');

/**
 * Date Picker Core Utilities - Main date picker functionality
 * Extends BasePage for common utilities
 */
class DatePickerCore extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Set date on Material UI date picker - Main entry point
   * @param {Locator} inputLocator - Date input locator
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @param {Object} options - Additional options
   */
  async setDateOnMaterialUIPicker(inputLocator, dateStr, options = {}) {
    console.log(`[DatePickerCore] Setting date: ${dateStr} using original renewPolicy.js approach`);
    
    const input = inputLocator.first();
    if (!(await input.isVisible().catch(() => false))) {
      throw new Error('Date input not found');
    }

    const page = this.page;
    
    // Use the same year-month-day selection approach for all dates
    console.log(`[DatePickerCore] Using year-month-day selection approach for: ${dateStr}`);
    return await this._setDateUsingYearMonthDay(input, dateStr);
  }

  /**
   * Universal method for setting any date using year-month-day selection approach
   * @param {Locator} input - Date input locator
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   */
  async _setDateUsingYearMonthDay(input, dateStr) {
    const page = this.page;
    console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Setting date to ${dateStr} using year-month-day approach`);
    
    try {
      // Parse the date string
      const [dayStr, monthStr, yearStr] = dateStr.split('/');
      const targetDay = parseInt(dayStr, 10);
      const targetMonth = parseInt(monthStr, 10);
      const targetYear = parseInt(yearStr, 10);
      
      const monthNames = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
      ];
      
      console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Target - Day: ${targetDay}, Month: ${targetMonth} (${monthNames[targetMonth-1]}), Year: ${targetYear}`);
      
      // Step 1: Click the input to open calendar dialog
      console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Clicking input to open calendar...`);
      await input.click();
      await page.waitForTimeout(1000);
      
      // Step 2: Switch to year view
      console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Switching to year view...`);
      const yearViewButton = page.getByRole('button', { name: 'calendar view is open, switch to year view' });
      await this.waitForElement(yearViewButton, 5000);
      await yearViewButton.click();
      await page.waitForTimeout(1000);
      
      // Step 3: Select target year
      console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Selecting year ${targetYear}...`);
      const yearButton = page.getByRole('radio', { name: targetYear.toString() });
      await this.waitForElement(yearButton, 5000);
      await yearButton.click();
      await page.waitForTimeout(1000);
      
      // Step 4: Select target month
      console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Selecting ${monthNames[targetMonth-1]}...`);
      const monthButton = page.getByRole('radio', { name: monthNames[targetMonth-1] });
      await this.waitForElement(monthButton, 5000);
      await monthButton.click();
      await page.waitForTimeout(1000);
      
      // Step 5: Select target day
      console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Selecting day ${targetDay}...`);
      const dayButton = page.getByRole('gridcell', { name: targetDay.toString(), exact: true });
      await this.waitForElement(dayButton, 5000);
      await dayButton.click();
      await page.waitForTimeout(1000);
      
      // Step 6: Verify the date was set correctly
      const finalValue = await input.inputValue().catch(() => '');
      console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Final input value: "${finalValue}"`);

      if (finalValue && finalValue.includes(yearStr)) {
        console.log(`✅ [DatePickerCore] Date set successfully using year-month-day approach: ${finalValue}`);
        
        // Step 7: Ensure date picker dialog is closed by pressing Escape or clicking outside
        try {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Escape key failed, trying click outside...`);
          // Click outside the dialog to close it
          await page.click('body', { position: { x: 10, y: 10 } });
          await page.waitForTimeout(500);
        }
        
        return true;
      } else {
        console.log(`❌ [DatePickerCore] Date not set correctly. Expected ${yearStr}, got: ${finalValue}`);
        return false;
      }
      
    } catch (error) {
      console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Year-month-day approach failed: ${error.message}`);
      
      // Fallback to FirstVersion methods
      try {
        const DatePickerUtilsFirstVersion = require('./DatePickerUtilsFirstVersion');
        const firstVersionPicker = new DatePickerUtilsFirstVersion(page);
        
        console.log(`[DatePickerCore] _setDateUsingYearMonthDay: Trying FirstVersion fallback...`);
        const success = await firstVersionPicker._tryDirectValueSetting(input, dateStr);
        
        if (success) {
          const value = await input.inputValue().catch(() => '');
          console.log(`✅ [DatePickerCore] Date set successfully using FirstVersion fallback: ${value}`);
          return true;
        }
      } catch (fallbackError) {
        console.log(`[DatePickerCore] _setDateUsingYearMonthDay: FirstVersion fallback failed: ${fallbackError.message}`);
      }
      
      throw new Error(`Failed to set date ${dateStr} using all methods`);
    }
  }

  /**
   * Special method for setting DOB (01/01/1995) using MCP-proven approach
   * @param {Locator} input - Date input locator
   * @param {string} dateStr - Date string
   */
  async _setDOBDate(input, dateStr) {
    const page = this.page;
    console.log(`[DatePickerCore] _setDOBDate: Setting DOB to ${dateStr} using MCP-proven approach`);
    
    try {
      // Step 1: Click the input to open calendar dialog
      console.log(`[DatePickerCore] _setDOBDate: Clicking input to open calendar...`);
      await input.click();
      await page.waitForTimeout(1000);
      
      // Step 2: Switch to year view
      console.log(`[DatePickerCore] _setDOBDate: Switching to year view...`);
      const yearViewButton = page.getByRole('button', { name: 'calendar view is open, switch to year view' });
      await this.waitForElement(yearViewButton, 5000);
      await yearViewButton.click();
      await page.waitForTimeout(1000);
      
      // Step 3: Select target year (1995)
      console.log(`[DatePickerCore] _setDOBDate: Selecting year 1995...`);
      const year1995 = page.getByRole('radio', { name: '1995' });
      await this.waitForElement(year1995, 5000);
      await year1995.click();
      await page.waitForTimeout(1000);
      
      // Step 4: Select target month (January)
      console.log(`[DatePickerCore] _setDOBDate: Selecting January...`);
      const januaryButton = page.getByRole('radio', { name: 'January' });
      await this.waitForElement(januaryButton, 5000);
      await januaryButton.click();
      await page.waitForTimeout(1000);
      
      // Step 5: Select target day (1)
      console.log(`[DatePickerCore] _setDOBDate: Selecting day 1...`);
      const day1 = page.getByRole('gridcell', { name: '1', exact: true });
      await this.waitForElement(day1, 5000);
      await day1.click();
      await page.waitForTimeout(1000);
      
      // Step 6: Verify the date was set correctly
      const finalValue = await input.inputValue().catch(() => '');
      console.log(`[DatePickerCore] _setDOBDate: Final input value: "${finalValue}"`);
      
      if (finalValue && finalValue.includes('1995')) {
        console.log(`✅ [DatePickerCore] DOB set successfully using MCP approach: ${finalValue}`);
        return true;
      } else {
        console.log(`❌ [DatePickerCore] DOB not set correctly. Expected 1995, got: ${finalValue}`);
        return false;
      }
      
    } catch (error) {
      console.log(`[DatePickerCore] _setDOBDate: MCP approach failed: ${error.message}`);
      
      // Fallback to FirstVersion methods
      try {
        const DatePickerUtilsFirstVersion = require('./DatePickerUtilsFirstVersion');
        const firstVersionPicker = new DatePickerUtilsFirstVersion(page);
        
        console.log(`[DatePickerCore] _setDOBDate: Trying FirstVersion fallback...`);
        const success = await firstVersionPicker._tryDirectValueSetting(input, dateStr);
        
        if (success) {
          const value = await input.inputValue().catch(() => '');
          console.log(`✅ [DatePickerCore] DOB set successfully using FirstVersion fallback: ${value}`);
          return true;
        }
      } catch (fallbackError) {
        console.log(`[DatePickerCore] _setDOBDate: FirstVersion fallback failed: ${fallbackError.message}`);
      }
      
      throw new Error(`Failed to set DOB ${dateStr} using all methods`);
    }
  }

  /**
   * Parse date string into components
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {Object} - Parsed date components
   */
  _parseDateString(dateStr) {
    const [dayStr, monthStr, yearStr] = dateStr.split('/');
    return {
      day: parseInt(dayStr, 10),
      month: parseInt(monthStr, 10),
      year: parseInt(yearStr, 10)
    };
  }

  /**
   * Close calendar dialog
   */
  async _closeCalendar() {
    try {
      // Try pressing Escape
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      
      // Try clicking outside the dialog
      await this.page.click('body', { position: { x: 10, y: 10 } });
      await this.page.waitForTimeout(500);
      
      // Try clicking close button if exists
      const closeButton = this.page.locator('[aria-label="Close"], [data-testid="close"], button:has-text("×")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    } catch (error) {
      // Ignore close errors
    }
  }
}

module.exports = DatePickerCore;
