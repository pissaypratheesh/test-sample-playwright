const BasePage = require('../../BasePage');

/**
 * Date Picker Navigation Utilities - Calendar navigation methods
 * Extends BasePage for common utilities
 */
class DatePickerNavigation extends BasePage {
  constructor(page) {
    super(page);
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
      console.log(`[DatePickerNavigation] _tryYearViewNavigation: Starting year view navigation for year: ${targetYear}, month: ${targetMonthName}`);
      
      // Look for year view button
      const yearViewButton = dialog.locator('button:has-text("calendar view is open, switch to year view")');
      console.log(`[DatePickerNavigation] _tryYearViewNavigation: Looking for year view button...`);
      if (await yearViewButton.isVisible({ timeout: 2000 })) {
        console.log(`[DatePickerNavigation] _tryYearViewNavigation: Found year view button, clicking...`);
        await yearViewButton.click();
        await this.page.waitForTimeout(1000);

        // Look for target year in year view
        const yearRadio = dialog.locator(`radio:has-text("${targetYear}")`);
        console.log(`[DatePickerNavigation] _tryYearViewNavigation: Looking for year ${targetYear} radio button...`);
        if (await yearRadio.isVisible({ timeout: 2000 })) {
          console.log(`[DatePickerNavigation] _tryYearViewNavigation: Found year ${targetYear} radio, clicking...`);
          await yearRadio.click();
          await this.page.waitForTimeout(1000);

          // Look for target month in month view
          const monthRadio = dialog.locator(`radio:has-text("${targetMonthName}")`);
          console.log(`[DatePickerNavigation] _tryYearViewNavigation: Looking for month ${targetMonthName} radio button...`);
          if (await monthRadio.isVisible({ timeout: 2000 })) {
            console.log(`[DatePickerNavigation] _tryYearViewNavigation: Found month ${targetMonthName} radio, clicking...`);
            await monthRadio.click();
            await this.page.waitForTimeout(1000);
            console.log(`[DatePickerNavigation] _tryYearViewNavigation: Year view navigation successful`);
            return true;
          } else {
            console.log(`[DatePickerNavigation] _tryYearViewNavigation: Month ${targetMonthName} radio not found`);
          }
        } else {
          console.log(`[DatePickerNavigation] _tryYearViewNavigation: Year ${targetYear} radio not found`);
        }
      } else {
        console.log(`[DatePickerNavigation] _tryYearViewNavigation: Year view button not found`);
      }
      return false;
    } catch (error) {
      console.log(`[DatePickerNavigation] _tryYearViewNavigation: Error:`, error.message);
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
    console.log(`[DatePickerNavigation] _selectDay: Attempting to select day ${day}`);
    const daySelectors = [
      dialog.locator(`[role="gridcell"]:has-text("${day}")`),
      dialog.locator(`.MuiPickersDay-day:has-text("${day}")`),
      dialog.locator(`button:has-text("${day}")`),
      dialog.locator(`[data-testid="day-${day}"]`)
    ];

    for (let i = 0; i < daySelectors.length; i++) {
      const selector = daySelectors[i];
      try {
        console.log(`[DatePickerNavigation] _selectDay: Trying selector ${i + 1}/${daySelectors.length} for day ${day}`);
        await this.waitForElement(selector, 5000);
        console.log(`[DatePickerNavigation] _selectDay: Found day ${day} with selector ${i + 1}, clicking...`);
        await selector.click();
        console.log(`[DatePickerNavigation] _selectDay: Successfully clicked day ${day}`);
        return;
      } catch (error) {
        console.log(`[DatePickerNavigation] _selectDay: Selector ${i + 1} failed for day ${day}:`, error.message);
        continue;
      }
    }

    console.log(`[DatePickerNavigation] _selectDay: Could not find day ${day} with any selector`);
    throw new Error(`Could not find day ${day} in calendar`);
  }
}

module.exports = DatePickerNavigation;
