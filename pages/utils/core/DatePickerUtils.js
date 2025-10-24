const DatePickerCore = require('./datepicker/DatePickerCore');
const DatePickerNavigation = require('./datepicker/DatePickerNavigation');
const DatePickerStrategies = require('./datepicker/DatePickerStrategies');
const DatePickerValidation = require('./datepicker/DatePickerValidation');

/**
 * Material UI Date Picker Utility - Main orchestrator class
 * Combines all date picker utilities for comprehensive date handling
 */
class DatePickerUtils extends DatePickerCore {
  constructor(page) {
    super(page);
    this.navigation = new DatePickerNavigation(page);
    this.strategies = new DatePickerStrategies(page);
    this.validation = new DatePickerValidation(page);
  }

  /**
   * Set date on Material UI date picker - Main entry point
   * @param {Locator} inputLocator - Date input locator
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @param {Object} options - Additional options
   */
  async setDateOnMaterialUIPicker(inputLocator, dateStr, options = {}) {
    return await super.setDateOnMaterialUIPicker(inputLocator, dateStr, options);
  }

  /**
   * Set date on input using multiple strategies
   * @param {Locator} inputLocator - Date input locator
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @param {Object} options - Additional options
   */
  async setDateOnInput(inputLocator, dateStr, options = {}) {
    console.log(`[DatePickerUtils] setDateOnInput: Setting date ${dateStr} using multiple strategies`);
    
    // Validate date format first
    if (!this.validation.validateDateFormat(dateStr)) {
      throw new Error(`Invalid date format: ${dateStr}. Expected DD/MM/YYYY`);
    }

    // Strategy 1: Try Material UI picker approach
    try {
      console.log(`[DatePickerUtils] setDateOnInput: Trying Material UI picker approach...`);
      const success = await this.setDateOnMaterialUIPicker(inputLocator, dateStr, options);
      if (success) {
        console.log(`✅ [DatePickerUtils] setDateOnInput: Material UI picker approach successful`);
        return true;
      }
    } catch (error) {
      console.log(`[DatePickerUtils] setDateOnInput: Material UI picker approach failed: ${error.message}`);
    }

    // Strategy 2: Try calendar picker approach
    try {
      console.log(`[DatePickerUtils] setDateOnInput: Trying calendar picker approach...`);
      const success = await this.strategies._tryCalendarPicker(inputLocator, dateStr, options);
      if (success) {
        console.log(`✅ [DatePickerUtils] setDateOnInput: Calendar picker approach successful`);
        return true;
      }
    } catch (error) {
      console.log(`[DatePickerUtils] setDateOnInput: Calendar picker approach failed: ${error.message}`);
    }

    // Strategy 3: Try simple date selection
    try {
      console.log(`[DatePickerUtils] setDateOnInput: Trying simple date selection...`);
      const success = await this.strategies._trySimpleDateSelection(inputLocator, dateStr);
      if (success) {
        console.log(`✅ [DatePickerUtils] setDateOnInput: Simple date selection successful`);
        return true;
      }
    } catch (error) {
      console.log(`[DatePickerUtils] setDateOnInput: Simple date selection failed: ${error.message}`);
    }

    // Strategy 4: Try direct value setting
    try {
      console.log(`[DatePickerUtils] setDateOnInput: Trying direct value setting...`);
      const success = await this.strategies._tryDirectValueSetting(inputLocator, dateStr);
      if (success) {
        console.log(`✅ [DatePickerUtils] setDateOnInput: Direct value setting successful`);
        return true;
      }
    } catch (error) {
      console.log(`[DatePickerUtils] setDateOnInput: Direct value setting failed: ${error.message}`);
    }

    // Strategy 5: Try type and validate
    try {
      console.log(`[DatePickerUtils] setDateOnInput: Trying type and validate...`);
      const success = await this.strategies._tryTypeAndValidate(inputLocator, dateStr);
      if (success) {
        console.log(`✅ [DatePickerUtils] setDateOnInput: Type and validate successful`);
        return true;
      }
    } catch (error) {
      console.log(`[DatePickerUtils] setDateOnInput: Type and validate failed: ${error.message}`);
    }

    console.log(`❌ [DatePickerUtils] setDateOnInput: All strategies failed for date ${dateStr}`);
    throw new Error(`Failed to set date ${dateStr} using all available strategies`);
  }

  /**
   * Validate date format
   * @param {string} dateStr - Date string
   * @returns {boolean} - Valid format
   */
  validateDateFormat(dateStr) {
    return this.validation.validateDateFormat(dateStr);
  }

  /**
   * Convert date to different formats
   * @param {string} dateStr - Input date string
   * @param {string} format - Target format
   * @returns {string} - Converted date string
   */
  convertDateFormat(dateStr, format = 'DD/MM/YYYY') {
    return this.validation.convertDateFormat(dateStr, format);
  }

  /**
   * Check if date is in the past
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {boolean} - True if date is in the past
   */
  isPastDate(dateStr) {
    return this.validation.isPastDate(dateStr);
  }

  /**
   * Check if date is in the future
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {boolean} - True if date is in the future
   */
  isFutureDate(dateStr) {
    return this.validation.isFutureDate(dateStr);
  }

  /**
   * Get age from date of birth
   * @param {string} dobStr - Date of birth string in DD/MM/YYYY format
   * @returns {number} - Age in years
   */
  getAgeFromDOB(dobStr) {
    return this.validation.getAgeFromDOB(dobStr);
  }

  /**
   * Validate age range
   * @param {string} dobStr - Date of birth string in DD/MM/YYYY format
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age
   * @returns {boolean} - True if age is within range
   */
  isAgeInRange(dobStr, minAge, maxAge) {
    return this.validation.isAgeInRange(dobStr, minAge, maxAge);
  }

  /**
   * Get formatted date string for display
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @param {string} format - Display format
   * @returns {string} - Formatted date string
   */
  formatDateForDisplay(dateStr, format = 'DD/MM/YYYY') {
    return this.validation.formatDateForDisplay(dateStr, format);
  }

  /**
   * Check if date is a valid business date
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {boolean} - True if it's a business date
   */
  isBusinessDate(dateStr) {
    return this.validation.isBusinessDate(dateStr);
  }

  /**
   * Get next business date
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {string} - Next business date in DD/MM/YYYY format
   */
  getNextBusinessDate(dateStr) {
    return this.validation.getNextBusinessDate(dateStr);
  }

  /**
   * Validate date range
   * @param {string} startDateStr - Start date string in DD/MM/YYYY format
   * @param {string} endDateStr - End date string in DD/MM/YYYY format
   * @returns {boolean} - True if start date is before end date
   */
  isValidDateRange(startDateStr, endDateStr) {
    return this.validation.isValidDateRange(startDateStr, endDateStr);
  }

  /**
   * Get days difference between two dates
   * @param {string} startDateStr - Start date string in DD/MM/YYYY format
   * @param {string} endDateStr - End date string in DD/MM/YYYY format
   * @returns {number} - Number of days difference
   */
  getDaysDifference(startDateStr, endDateStr) {
    return this.validation.getDaysDifference(startDateStr, endDateStr);
  }

  /**
   * Navigate to target year and month
   * @param {Locator} dialog - Calendar dialog
   * @param {number} targetYear - Target year
   * @param {number} targetMonth - Target month (1-12)
   */
  async _navigateToTargetDateImproved(dialog, targetYear, targetMonth) {
    return await this.navigation._navigateToTargetDateImproved(dialog, targetYear, targetMonth);
  }

  /**
   * Select specific day
   * @param {Locator} dialog - Calendar dialog
   * @param {number} day - Day number
   */
  async _selectDay(dialog, day) {
    return await this.navigation._selectDay(dialog, day);
  }
}

module.exports = DatePickerUtils;