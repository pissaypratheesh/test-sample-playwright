const BasePage = require('../../BasePage');

/**
 * Date Picker Strategies - Different approaches for setting dates
 * Extends BasePage for common utilities
 */
class DatePickerStrategies extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Try simple date selection approach
   * @param {Locator} inputLocator - Input locator
   * @param {string} dateStr - Date string
   */
  async _trySimpleDateSelection(inputLocator, dateStr) {
    try {
      console.log(`[DatePickerStrategies] _trySimpleDateSelection: Starting simple approach for date: ${dateStr}`);
      
      const input = inputLocator.first();
      await this.waitForElement(input, 5000);
      
      // Parse date to get day
      const { day } = this._parseDateString(dateStr);
      console.log(`[DatePickerStrategies] _trySimpleDateSelection: Parsed day: ${day}`);
      
      // Click on the input to open calendar (like PolicyIssuancePage.js)
      console.log(`[DatePickerStrategies] _trySimpleDateSelection: Clicking input to open calendar...`);
      await input.click();
      await this.page.waitForTimeout(1000);
      
      // Look for the day button (like PolicyIssuancePage.js uses button[normalize-space()='25'])
      const dayButton = this.page.locator(`button:has-text("${day}")`);
      console.log(`[DatePickerStrategies] _trySimpleDateSelection: Looking for day button: ${day}`);
      
      if (await dayButton.isVisible({ timeout: 5000 })) {
        console.log(`[DatePickerStrategies] _trySimpleDateSelection: Found day button, clicking...`);
        await dayButton.click();
        await this.page.waitForTimeout(1000);
        
        // Verify the date was set
        const finalValue = await input.inputValue().catch(() => '');
        console.log(`[DatePickerStrategies] _trySimpleDateSelection: Final input value: "${finalValue}"`);
        const success = finalValue && finalValue !== 'DD/MM/YYYY';
        console.log(`[DatePickerStrategies] _trySimpleDateSelection: Success: ${success}`);
        return success;
      } else {
        console.log(`[DatePickerStrategies] _trySimpleDateSelection: Day button ${day} not found`);
        return false;
      }
      
    } catch (error) {
      console.log('[DatePickerStrategies] _trySimpleDateSelection: Error:', error.message);
      return false;
    }
  }

  /**
   * Try direct value setting (handles readonly/masked inputs)
   * @param {Locator} inputLocator - Input locator
   * @param {string} dateStr - Date string
   * @returns {boolean} - Success status
   */
  async _tryDirectValueSetting(inputLocator, dateStr) {
    try {
      const input = inputLocator.first();
      if (!(await input.isVisible().catch(() => false))) return false;

      const handle = await input.elementHandle();
      if (!handle) return false;

      await handle.evaluate((el, value) => {
        try { el.removeAttribute('readonly'); } catch {}
        try { el.readOnly = false; } catch {}
        try { el.disabled = false; } catch {}
        
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, value);
        
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }, dateStr);

      const currentValue = await input.inputValue().catch(() => '');
      return currentValue === dateStr;
    } catch (error) {
      return false;
    }
  }

  /**
   * Try calendar picker navigation
   * @param {Locator} inputLocator - Input locator
   * @param {string} dateStr - Date string
   * @param {Object} options - Options
   * @returns {boolean} - Success status
   */
  async _tryCalendarPicker(inputLocator, dateStr, options = {}) {
    try {
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Starting calendar picker for date: ${dateStr}`);
      
      // Prevent page scrolling during date picker interaction
      await this._preventPageScrolling();
      
      const input = inputLocator.first();
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Waiting for input element...`);
      await this.waitForElement(input, options.timeout);
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Input element is ready`);
      
      // Check if date picker dialog is already open
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Checking for existing dialogs...`);
      const existingDialog = await this._checkForExistingDialog();
      if (existingDialog) {
        console.log('[DatePickerStrategies] _tryCalendarPicker: Date picker dialog already open, closing it first...');
        await this._closeExistingDialog(existingDialog);
        await this.page.waitForTimeout(1000);
        console.log('[DatePickerStrategies] _tryCalendarPicker: Existing dialog closed');
      }
      
      // Click to open calendar
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Clicking input to open calendar...`);
      await input.click();
      await this.page.waitForTimeout(500);
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Input clicked, waiting for dialog...`);

      // Wait for calendar dialog
      const calendarDialog = await this._waitForCalendarDialog();
      if (!calendarDialog) {
        console.log(`[DatePickerStrategies] _tryCalendarPicker: Calendar dialog did not appear`);
        return false;
      }
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Calendar dialog appeared successfully`);

      // Parse date
      const { day, month, year } = this._parseDateString(dateStr);
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Parsed date - Day: ${day}, Month: ${month}, Year: ${year}`);
      
      // Navigate to target year/month using the improved navigation
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Navigating to target date...`);
      await this._navigateToTargetDateImproved(calendarDialog, year, month);
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Navigation complete`);
      
      // Select the day
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Selecting day ${day}...`);
      await this._selectDay(calendarDialog, day);
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Day selected`);
      
      // Wait for dialog to close automatically
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Waiting for dialog to close...`);
      await this.page.waitForTimeout(1000);
      
      // Verify the date was set
      const finalValue = await input.inputValue().catch(() => '');
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Final input value: "${finalValue}"`);
      const success = finalValue && finalValue !== 'DD/MM/YYYY';
      console.log(`[DatePickerStrategies] _tryCalendarPicker: Success: ${success}`);
      
      // Restore page scrolling
      await this._restorePageScrolling();
      
      return success;
      
    } catch (error) {
      console.log('[DatePickerStrategies] _tryCalendarPicker: Calendar picker error:', error.message);
      console.log('[DatePickerStrategies] _tryCalendarPicker: Error stack:', error.stack);
      
      // Restore page scrolling even on error
      await this._restorePageScrolling();
      
      return false;
    }
  }

  /**
   * Try type and validate approach
   * @param {Locator} inputLocator - Input locator
   * @param {string} dateStr - Date string
   * @returns {boolean} - Success status
   */
  async _tryTypeAndValidate(inputLocator, dateStr) {
    try {
      const input = inputLocator.first();
      await this.waitForElement(input);
      
      await input.click();
      await input.fill('');
      await input.type(dateStr, { delay: 50 });
      
      await this.page.keyboard.press('Enter');
      await this.page.keyboard.press('Escape');
      await input.blur();
      
      const finalValue = await input.inputValue().catch(() => '');
      return finalValue && finalValue !== 'DD/MM/YYYY';
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Prevent page scrolling during date picker interaction
   */
  async _preventPageScrolling() {
    try {
      console.log(`[DatePickerStrategies] _preventPageScrolling: Preventing page scrolling...`);
      await this.page.evaluate(() => {
        // Disable scrolling temporarily
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      });
      console.log(`[DatePickerStrategies] _preventPageScrolling: Page scrolling disabled`);
    } catch (error) {
      console.log(`[DatePickerStrategies] _preventPageScrolling: Error preventing scroll:`, error.message);
    }
  }

  /**
   * Restore page scrolling after date picker interaction
   */
  async _restorePageScrolling() {
    try {
      console.log(`[DatePickerStrategies] _restorePageScrolling: Restoring page scrolling...`);
      await this.page.evaluate(() => {
        // Re-enable scrolling
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      });
      console.log(`[DatePickerStrategies] _restorePageScrolling: Page scrolling restored`);
    } catch (error) {
      console.log(`[DatePickerStrategies] _restorePageScrolling: Error restoring scroll:`, error.message);
    }
  }

  /**
   * Check if date picker dialog is already open
   * @returns {Locator|null} - Existing dialog locator
   */
  async _checkForExistingDialog() {
    console.log(`[DatePickerStrategies] _checkForExistingDialog: Checking for existing date picker dialog...`);
    const dialogSelectors = [
      'dialog[role="dialog"]',
      '.MuiDialog-root',
      '.MuiPickersPopper-root',
      '.MuiModal-root'
    ];

    for (const selector of dialogSelectors) {
      try {
        console.log(`[DatePickerStrategies] _checkForExistingDialog: Checking selector: ${selector}`);
        const dialog = this.page.locator(selector).first();
        if (await dialog.isVisible({ timeout: 1000 })) {
          console.log(`[DatePickerStrategies] _checkForExistingDialog: Found existing dialog with selector: ${selector}`);
          return dialog;
        }
      } catch (error) {
        console.log(`[DatePickerStrategies] _checkForExistingDialog: Selector ${selector} not found or not visible`);
        continue;
      }
    }
    console.log(`[DatePickerStrategies] _checkForExistingDialog: No existing dialog found`);
    return null;
  }

  /**
   * Close existing date picker dialog
   * @param {Locator} dialog - Dialog to close
   */
  async _closeExistingDialog(dialog) {
    try {
      // Try clicking Cancel button first
      const cancelButton = dialog.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible({ timeout: 1000 })) {
        await cancelButton.click();
        return;
      }

      // Try pressing Escape
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);

      // Try clicking outside the dialog
      await this.page.click('body', { position: { x: 10, y: 10 } });
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.log('Error closing existing dialog:', error.message);
    }
  }

  /**
   * Wait for calendar dialog to appear
   * @returns {Locator|null} - Calendar dialog locator
   */
  async _waitForCalendarDialog() {
    console.log(`[DatePickerStrategies] _waitForCalendarDialog: Waiting for calendar dialog to appear...`);
    const dialogSelectors = [
      'dialog[role="dialog"]',
      '.MuiDialog-root',
      '.MuiPickersPopper-root',
      '.MuiModal-root',
      '[data-testid="date-picker-dialog"]'
    ];

    for (const selector of dialogSelectors) {
      try {
        console.log(`[DatePickerStrategies] _waitForCalendarDialog: Checking selector: ${selector}`);
        const dialog = this.page.locator(selector).first();
        await dialog.waitFor({ state: 'visible', timeout: 5000 });
        console.log(`[DatePickerStrategies] _waitForCalendarDialog: Found dialog with selector: ${selector}`);
        return dialog;
      } catch (error) {
        console.log(`[DatePickerStrategies] _waitForCalendarDialog: Selector ${selector} not found or not visible`);
        continue;
      }
    }
    console.log(`[DatePickerStrategies] _waitForCalendarDialog: No calendar dialog found`);
    return null;
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
   * Navigate to target year and month using improved strategy
   * @param {Locator} dialog - Calendar dialog
   * @param {number} targetYear - Target year
   * @param {number} targetMonth - Target month (1-12)
   */
  async _navigateToTargetDateImproved(dialog, targetYear, targetMonth) {
    const DatePickerNavigation = require('./DatePickerNavigation');
    const navigation = new DatePickerNavigation(this.page);
    return await navigation._navigateToTargetDateImproved(dialog, targetYear, targetMonth);
  }

  /**
   * Select specific day
   * @param {Locator} dialog - Calendar dialog
   * @param {number} day - Day number
   */
  async _selectDay(dialog, day) {
    const DatePickerNavigation = require('./DatePickerNavigation');
    const navigation = new DatePickerNavigation(this.page);
    return await navigation._selectDay(dialog, day);
  }
}

module.exports = DatePickerStrategies;
