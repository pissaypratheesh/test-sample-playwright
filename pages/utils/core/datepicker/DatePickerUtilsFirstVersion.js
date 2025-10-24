const BasePage = require('./BasePage');

/**
 * Material UI Date Picker Utility
 * Handles complex date selection scenarios including old dates like 1992
 * Optimized for Material UI date picker components
 */
class DatePickerUtils extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Set date on Material UI date picker - Simplified approach based on PolicyIssuancePage.js
   * @param {Locator} inputLocator - Date input locator
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @param {Object} options - Additional options
   */
  async setDateOnMaterialUIPicker(inputLocator, dateStr, options = {}) {
    const {
      retries = 3,
      timeout = 10000,
      takeScreenshot = false
    } = options;

    console.log(`[DatePickerUtils] Starting simplified date picker for date: ${dateStr}`);

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`[DatePickerUtils] Attempt ${attempt + 1}/${retries}: Setting date ${dateStr}`);
        
        if (takeScreenshot) {
          await this.page.screenshot({ path: `.playwright-mcp/date-picker-attempt-${attempt + 1}.png` });
        }

        // Strategy 1: Simple click approach (like PolicyIssuancePage.js)
        const simpleSuccess = await this._trySimpleDateSelection(inputLocator, dateStr);
        if (simpleSuccess) {
          console.log('✅ [DatePickerUtils] Date set successfully using simple approach');
          return true;
        }

        // Strategy 2: Direct value setting (fallback)
        console.log(`[DatePickerUtils] Attempt ${attempt + 1}: Trying direct value setting...`);
        const directSuccess = await this._tryDirectValueSetting(inputLocator, dateStr);
        if (directSuccess) {
          console.log('✅ [DatePickerUtils] Date set successfully using direct value setting');
          return true;
        }

        console.log(`❌ [DatePickerUtils] Attempt ${attempt + 1} failed, retrying...`);
        await this.page.waitForTimeout(1000);

      } catch (error) {
        console.log(`❌ [DatePickerUtils] Attempt ${attempt + 1} error:`, error.message);
        if (attempt === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }

    throw new Error(`Failed to set date ${dateStr} after ${retries} attempts`);
  }

  /**
   * Try simple date selection approach (based on PolicyIssuancePage.js)
   * @param {Locator} inputLocator - Input locator
   * @param {string} dateStr - Date string
   * @returns {boolean} - Success status
   */
  async _trySimpleDateSelection(inputLocator, dateStr) {
    try {
      console.log(`[DatePickerUtils] _trySimpleDateSelection: Starting simple approach for date: ${dateStr}`);
      
      const input = inputLocator.first();
      await this.waitForElement(input, 5000);
      
      // Parse date to get day
      const { day } = this._parseDateString(dateStr);
      console.log(`[DatePickerUtils] _trySimpleDateSelection: Parsed day: ${day}`);
      
      // Click on the input to open calendar (like PolicyIssuancePage.js)
      console.log(`[DatePickerUtils] _trySimpleDateSelection: Clicking input to open calendar...`);
      await input.click();
      await this.page.waitForTimeout(1000);
      
      // Look for the day button (like PolicyIssuancePage.js uses button[normalize-space()='25'])
      const dayButton = this.page.locator(`button:has-text("${day}")`);
      console.log(`[DatePickerUtils] _trySimpleDateSelection: Looking for day button: ${day}`);
      
      if (await dayButton.isVisible({ timeout: 5000 })) {
        console.log(`[DatePickerUtils] _trySimpleDateSelection: Found day button, clicking...`);
        await dayButton.click();
        await this.page.waitForTimeout(1000);
        
        // Verify the date was set
        const finalValue = await input.inputValue().catch(() => '');
        console.log(`[DatePickerUtils] _trySimpleDateSelection: Final input value: "${finalValue}"`);
        const success = finalValue && finalValue !== 'DD/MM/YYYY';
        console.log(`[DatePickerUtils] _trySimpleDateSelection: Success: ${success}`);
        return success;
      } else {
        console.log(`[DatePickerUtils] _trySimpleDateSelection: Day button ${day} not found`);
        return false;
      }
      
    } catch (error) {
      console.log('[DatePickerUtils] _trySimpleDateSelection: Error:', error.message);
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
      console.log(`[DatePickerUtils] _tryCalendarPicker: Starting calendar picker for date: ${dateStr}`);
      
      // Prevent page scrolling during date picker interaction
      await this._preventPageScrolling();
      
      const input = inputLocator.first();
      console.log(`[DatePickerUtils] _tryCalendarPicker: Waiting for input element...`);
      await this.waitForElement(input, options.timeout);
      console.log(`[DatePickerUtils] _tryCalendarPicker: Input element is ready`);
      
      // Check if date picker dialog is already open
      console.log(`[DatePickerUtils] _tryCalendarPicker: Checking for existing dialogs...`);
      const existingDialog = await this._checkForExistingDialog();
      if (existingDialog) {
        console.log('[DatePickerUtils] _tryCalendarPicker: Date picker dialog already open, closing it first...');
        await this._closeExistingDialog(existingDialog);
        await this.page.waitForTimeout(1000);
        console.log('[DatePickerUtils] _tryCalendarPicker: Existing dialog closed');
      }
      
      // Click to open calendar
      console.log(`[DatePickerUtils] _tryCalendarPicker: Clicking input to open calendar...`);
      await input.click();
      await this.page.waitForTimeout(500);
      console.log(`[DatePickerUtils] _tryCalendarPicker: Input clicked, waiting for dialog...`);

      // Wait for calendar dialog
      const calendarDialog = await this._waitForCalendarDialog();
      if (!calendarDialog) {
        console.log(`[DatePickerUtils] _tryCalendarPicker: Calendar dialog did not appear`);
        return false;
      }
      console.log(`[DatePickerUtils] _tryCalendarPicker: Calendar dialog appeared successfully`);

      // Parse date
      const { day, month, year } = this._parseDateString(dateStr);
      console.log(`[DatePickerUtils] _tryCalendarPicker: Parsed date - Day: ${day}, Month: ${month}, Year: ${year}`);
      
      // Navigate to target year/month using the improved navigation
      console.log(`[DatePickerUtils] _tryCalendarPicker: Navigating to target date...`);
      await this._navigateToTargetDateImproved(calendarDialog, year, month);
      console.log(`[DatePickerUtils] _tryCalendarPicker: Navigation complete`);
      
      // Select the day
      console.log(`[DatePickerUtils] _tryCalendarPicker: Selecting day ${day}...`);
      await this._selectDay(calendarDialog, day);
      console.log(`[DatePickerUtils] _tryCalendarPicker: Day selected`);
      
      // Wait for dialog to close automatically
      console.log(`[DatePickerUtils] _tryCalendarPicker: Waiting for dialog to close...`);
      await this.page.waitForTimeout(1000);
      
      // Verify the date was set
      const finalValue = await input.inputValue().catch(() => '');
      console.log(`[DatePickerUtils] _tryCalendarPicker: Final input value: "${finalValue}"`);
      const success = finalValue && finalValue !== 'DD/MM/YYYY';
      console.log(`[DatePickerUtils] _tryCalendarPicker: Success: ${success}`);
      
      // Restore page scrolling
      await this._restorePageScrolling();
      
      return success;
      
    } catch (error) {
      console.log('[DatePickerUtils] _tryCalendarPicker: Calendar picker error:', error.message);
      console.log('[DatePickerUtils] _tryCalendarPicker: Error stack:', error.stack);
      
      // Restore page scrolling even on error
      await this._restorePageScrolling();
      
      return false;
    }
  }

  /**
   * Prevent page scrolling during date picker interaction
   */
  async _preventPageScrolling() {
    try {
      console.log(`[DatePickerUtils] _preventPageScrolling: Preventing page scrolling...`);
      await this.page.evaluate(() => {
        // Disable scrolling temporarily
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      });
      console.log(`[DatePickerUtils] _preventPageScrolling: Page scrolling disabled`);
    } catch (error) {
      console.log(`[DatePickerUtils] _preventPageScrolling: Error preventing scroll:`, error.message);
    }
  }

  /**
   * Restore page scrolling after date picker interaction
   */
  async _restorePageScrolling() {
    try {
      console.log(`[DatePickerUtils] _restorePageScrolling: Restoring page scrolling...`);
      await this.page.evaluate(() => {
        // Re-enable scrolling
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      });
      console.log(`[DatePickerUtils] _restorePageScrolling: Page scrolling restored`);
    } catch (error) {
      console.log(`[DatePickerUtils] _restorePageScrolling: Error restoring scroll:`, error.message);
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
   * Check if date picker dialog is already open
   * @returns {Locator|null} - Existing dialog locator
   */
  async _checkForExistingDialog() {
    console.log(`[DatePickerUtils] _checkForExistingDialog: Checking for existing date picker dialog...`);
    const dialogSelectors = [
      'dialog[role="dialog"]',
      '.MuiDialog-root',
      '.MuiPickersPopper-root',
      '.MuiModal-root'
    ];

    for (const selector of dialogSelectors) {
      try {
        console.log(`[DatePickerUtils] _checkForExistingDialog: Checking selector: ${selector}`);
        const dialog = this.page.locator(selector).first();
        if (await dialog.isVisible({ timeout: 1000 })) {
          console.log(`[DatePickerUtils] _checkForExistingDialog: Found existing dialog with selector: ${selector}`);
          return dialog;
        }
      } catch (error) {
        console.log(`[DatePickerUtils] _checkForExistingDialog: Selector ${selector} not found or not visible`);
        continue;
      }
    }
    console.log(`[DatePickerUtils] _checkForExistingDialog: No existing dialog found`);
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
    console.log(`[DatePickerUtils] _waitForCalendarDialog: Waiting for calendar dialog to appear...`);
    const dialogSelectors = [
      'dialog[role="dialog"]',
      '.MuiDialog-root',
      '.MuiPickersPopper-root',
      '.MuiModal-root',
      '[data-testid="date-picker-dialog"]'
    ];

    for (const selector of dialogSelectors) {
      try {
        console.log(`[DatePickerUtils] _waitForCalendarDialog: Checking selector: ${selector}`);
        const dialog = this.page.locator(selector).first();
        await dialog.waitFor({ state: 'visible', timeout: 5000 });
        console.log(`[DatePickerUtils] _waitForCalendarDialog: Found dialog with selector: ${selector}`);
        return dialog;
      } catch (error) {
        console.log(`[DatePickerUtils] _waitForCalendarDialog: Selector ${selector} not found or not visible`);
        continue;
      }
    }
    console.log(`[DatePickerUtils] _waitForCalendarDialog: No calendar dialog found`);
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
   * Navigate to target year and month using improved strategy based on MCP findings
   * @param {Locator} dialog - Calendar dialog
   * @param {number} targetYear - Target year
   * @param {number} targetMonth - Target month (1-12)
   */
  async _navigateToTargetDateImproved(dialog, targetYear, targetMonth) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const targetMonthName = monthNames[targetMonth - 1];
    
    // Strategy 1: Try year view navigation (most reliable for old dates)
    const yearViewSuccess = await this._tryYearViewNavigation(dialog, targetYear, targetMonthName);
    if (yearViewSuccess) return;

    // Strategy 2: Try month/year navigation buttons
    const navSuccess = await this._tryNavigationButtons(dialog, targetYear, targetMonthName);
    if (navSuccess) return;

    // Strategy 3: Fallback to direct month selection
    await this._tryDirectMonthSelection(dialog, targetMonthName);
  }

  /**
   * Try year view navigation (most reliable for old dates like 1992)
   * @param {Locator} dialog - Calendar dialog
   * @param {number} targetYear - Target year
   * @param {string} targetMonthName - Target month name
   * @returns {boolean} - Success status
   */
  async _tryYearViewNavigation(dialog, targetYear, targetMonthName) {
    try {
      console.log(`[DatePickerUtils] _tryYearViewNavigation: Starting year view navigation for year: ${targetYear}, month: ${targetMonthName}`);
      
      // Look for year view button
      const yearViewButton = dialog.locator('button:has-text("calendar view is open, switch to year view")');
      console.log(`[DatePickerUtils] _tryYearViewNavigation: Looking for year view button...`);
      if (await yearViewButton.isVisible({ timeout: 2000 })) {
        console.log(`[DatePickerUtils] _tryYearViewNavigation: Found year view button, clicking...`);
        await yearViewButton.click();
        await this.page.waitForTimeout(1000);

        // Look for target year in year view
        const yearRadio = dialog.locator(`radio:has-text("${targetYear}")`);
        console.log(`[DatePickerUtils] _tryYearViewNavigation: Looking for year ${targetYear} radio button...`);
        if (await yearRadio.isVisible({ timeout: 2000 })) {
          console.log(`[DatePickerUtils] _tryYearViewNavigation: Found year ${targetYear} radio, clicking...`);
          await yearRadio.click();
          await this.page.waitForTimeout(1000);

          // Look for target month in month view
          const monthRadio = dialog.locator(`radio:has-text("${targetMonthName}")`);
          console.log(`[DatePickerUtils] _tryYearViewNavigation: Looking for month ${targetMonthName} radio button...`);
          if (await monthRadio.isVisible({ timeout: 2000 })) {
            console.log(`[DatePickerUtils] _tryYearViewNavigation: Found month ${targetMonthName} radio, clicking...`);
            await monthRadio.click();
            await this.page.waitForTimeout(1000);
            console.log(`[DatePickerUtils] _tryYearViewNavigation: Year view navigation successful`);
            return true;
          } else {
            console.log(`[DatePickerUtils] _tryYearViewNavigation: Month ${targetMonthName} radio not found`);
          }
        } else {
          console.log(`[DatePickerUtils] _tryYearViewNavigation: Year ${targetYear} radio not found`);
        }
      } else {
        console.log(`[DatePickerUtils] _tryYearViewNavigation: Year view button not found`);
      }
      return false;
    } catch (error) {
      console.log(`[DatePickerUtils] _tryYearViewNavigation: Error:`, error.message);
      return false;
    }
  }

  /**
   * Try navigation buttons approach
   * @param {Locator} dialog - Calendar dialog
   * @param {number} targetYear - Target year
   * @param {string} targetMonthName - Target month name
   * @returns {boolean} - Success status
   */
  async _tryNavigationButtons(dialog, targetYear, targetMonthName) {
    try {
      // Navigate to target year first (for old dates like 1992)
      await this._navigateToTargetYear(dialog, targetYear);
      
      // Then navigate to target month
      await this._navigateToTargetMonth(dialog, targetMonthName);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Try direct month selection
   * @param {Locator} dialog - Calendar dialog
   * @param {string} targetMonthName - Target month name
   */
  async _tryDirectMonthSelection(dialog, targetMonthName) {
    try {
      const monthButton = dialog.locator(`button:has-text("${targetMonthName}")`);
      if (await monthButton.isVisible({ timeout: 2000 })) {
        await monthButton.click();
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Navigate to target year and month (legacy method)
   * @param {Locator} dialog - Calendar dialog
   * @param {number} targetYear - Target year
   * @param {number} targetMonth - Target month (1-12)
   */
  async _navigateToTargetDate(dialog, targetYear, targetMonth) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const targetMonthName = monthNames[targetMonth - 1];
    
    // Try to find year/month navigation buttons
    const yearNavButtons = [
      dialog.locator('[aria-label="Previous year"]'),
      dialog.locator('[aria-label="Next year"]'),
      dialog.locator('button[title*="year"]'),
      dialog.locator('.MuiPickersYear-yearButton'),
      dialog.locator('button:has-text("‹‹")'),
      dialog.locator('button:has-text("››")')
    ];

    const monthNavButtons = [
      dialog.locator('[aria-label="Previous month"]'),
      dialog.locator('[aria-label="Next month"]'),
      dialog.locator('button[title*="month"]'),
      dialog.locator('button:has-text("‹")'),
      dialog.locator('button:has-text("›")')
    ];

    // Navigate to target year first (for old dates like 1992)
    await this._navigateToTargetYear(dialog, targetYear, yearNavButtons);
    
    // Then navigate to target month
    await this._navigateToTargetMonth(dialog, targetMonthName, monthNavButtons);
  }

  /**
   * Navigate to target year
   * @param {Locator} dialog - Calendar dialog
   * @param {number} targetYear - Target year
   * @param {Array} yearNavButtons - Year navigation button locators (optional)
   */
  async _navigateToTargetYear(dialog, targetYear, yearNavButtons = null) {
    const maxAttempts = 50; // Prevent infinite loops
    
    // Default year navigation buttons if not provided
    if (!yearNavButtons) {
      yearNavButtons = [
        dialog.locator('[aria-label="Previous year"]'),
        dialog.locator('[aria-label="Next year"]'),
        dialog.locator('button[title*="year"]'),
        dialog.locator('.MuiPickersYear-yearButton'),
        dialog.locator('button:has-text("‹‹")'),
        dialog.locator('button:has-text("››")')
      ];
    }
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const currentYear = await this._getCurrentYear(dialog);
      if (currentYear === targetYear) break;
      
      const prevButton = yearNavButtons.find(async btn => await btn.isVisible().catch(() => false));
      const nextButton = yearNavButtons.find(async btn => await btn.isVisible().catch(() => false));
      
      if (currentYear > targetYear && prevButton) {
        await prevButton.click();
      } else if (currentYear < targetYear && nextButton) {
        await nextButton.click();
      } else {
        // Fallback: try clicking any visible navigation button
        const anyNavButton = dialog.locator('button').filter({ hasText: /[‹›]/ }).first();
        if (await anyNavButton.isVisible().catch(() => false)) {
          await anyNavButton.click();
        } else {
          break;
        }
      }
      
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Navigate to target month
   * @param {Locator} dialog - Calendar dialog
   * @param {string} targetMonthName - Target month name
   * @param {Array} monthNavButtons - Month navigation button locators (optional)
   */
  async _navigateToTargetMonth(dialog, targetMonthName, monthNavButtons = null) {
    const maxAttempts = 15; // Prevent infinite loops
    
    // Default month navigation buttons if not provided
    if (!monthNavButtons) {
      monthNavButtons = [
        dialog.locator('[aria-label="Previous month"]'),
        dialog.locator('[aria-label="Next month"]'),
        dialog.locator('button[title*="month"]'),
        dialog.locator('button:has-text("‹")'),
        dialog.locator('button:has-text("›")')
      ];
    }
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const currentMonth = await this._getCurrentMonth(dialog);
      if (currentMonth === targetMonthName) break;
      
      const prevButton = monthNavButtons.find(async btn => await btn.isVisible().catch(() => false));
      const nextButton = monthNavButtons.find(async btn => await btn.isVisible().catch(() => false));
      
      if (prevButton) {
        await prevButton.click();
      } else {
        // Fallback: try clicking any visible month navigation button
        const anyMonthButton = dialog.locator('button').filter({ hasText: /[‹›]/ }).first();
        if (await anyMonthButton.isVisible().catch(() => false)) {
          await anyMonthButton.click();
        } else {
          break;
        }
      }
      
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Get current year from calendar
   * @param {Locator} dialog - Calendar dialog
   * @returns {number} - Current year
   */
  async _getCurrentYear(dialog) {
    const yearSelectors = [
      dialog.locator('.MuiPickersYear-yearButton'),
      dialog.locator('[data-testid="year-text"]'),
      dialog.locator('text=/\\d{4}/')
    ];

    for (const selector of yearSelectors) {
      try {
        const yearText = await selector.textContent();
        const yearMatch = yearText.match(/\d{4}/);
        if (yearMatch) return parseInt(yearMatch[0], 10);
      } catch (error) {
        continue;
      }
    }

    // Fallback: extract year from month/year text
    try {
      const monthYearText = await dialog.locator('text=/\\w+\\s+\\d{4}/').textContent();
      const yearMatch = monthYearText.match(/\d{4}/);
      if (yearMatch) return parseInt(yearMatch[0], 10);
    } catch (error) {
      // Ignore
    }

    return new Date().getFullYear(); // Default to current year
  }

  /**
   * Get current month from calendar
   * @param {Locator} dialog - Calendar dialog
   * @returns {string} - Current month name
   */
  async _getCurrentMonth(dialog) {
    const monthSelectors = [
      dialog.locator('.MuiPickersMonth-monthButton'),
      dialog.locator('[data-testid="month-text"]'),
      dialog.locator('text=/January|February|March|April|May|June|July|August|September|October|November|December/')
    ];

    for (const selector of monthSelectors) {
      try {
        const monthText = await selector.textContent();
        const monthMatch = monthText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/);
        if (monthMatch) return monthMatch[1];
      } catch (error) {
        continue;
      }
    }

    // Fallback: extract month from month/year text
    try {
      const monthYearText = await dialog.locator('text=/\\w+\\s+\\d{4}/').textContent();
      const monthMatch = monthYearText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/);
      if (monthMatch) return monthMatch[1];
    } catch (error) {
      // Ignore
    }

    return 'January'; // Default
  }

  /**
   * Select specific day
   * @param {Locator} dialog - Calendar dialog
   * @param {number} day - Day number
   */
  async _selectDay(dialog, day) {
    console.log(`[DatePickerUtils] _selectDay: Attempting to select day ${day}`);
    const daySelectors = [
      dialog.locator(`[role="gridcell"]:has-text("${day}")`),
      dialog.locator(`.MuiPickersDay-day:has-text("${day}")`),
      dialog.locator(`button:has-text("${day}")`),
      dialog.locator(`[data-testid="day-${day}"]`)
    ];

    for (let i = 0; i < daySelectors.length; i++) {
      const selector = daySelectors[i];
      try {
        console.log(`[DatePickerUtils] _selectDay: Trying selector ${i + 1}/${daySelectors.length} for day ${day}`);
        await this.waitForElement(selector, 5000);
        console.log(`[DatePickerUtils] _selectDay: Found day ${day} with selector ${i + 1}, clicking...`);
        await selector.click();
        console.log(`[DatePickerUtils] _selectDay: Successfully clicked day ${day}`);
        return;
      } catch (error) {
        console.log(`[DatePickerUtils] _selectDay: Selector ${i + 1} failed for day ${day}:`, error.message);
        continue;
      }
    }

    console.log(`[DatePickerUtils] _selectDay: Could not find day ${day} with any selector`);
    throw new Error(`Could not find day ${day} in calendar`);
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

  /**
   * Validate date format
   * @param {string} dateStr - Date string
   * @returns {boolean} - Valid format
   */
  validateDateFormat(dateStr) {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return dateRegex.test(dateStr);
  }

  /**
   * Convert date to different formats
   * @param {string} dateStr - Input date string
   * @param {string} format - Target format
   * @returns {string} - Converted date string
   */
  convertDateFormat(dateStr, format = 'DD/MM/YYYY') {
    if (!this.validateDateFormat(dateStr)) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }

    const [day, month, year] = dateStr.split('/');
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return dateStr;
      default:
        return dateStr;
    }
  }
}

module.exports = DatePickerUtils;
