const BasePage = require('../../BasePage');

/**
 * Date Picker Validation Utilities - Validation and utility methods
 * Extends BasePage for common utilities
 */
class DatePickerValidation extends BasePage {
  constructor(page) {
    super(page);
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
   * Validate if date is in the past
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {boolean} - True if date is in the past
   */
  isPastDate(dateStr) {
    try {
      const [day, month, year] = dateStr.split('/');
      const inputDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      return inputDate < today;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate if date is in the future
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {boolean} - True if date is in the future
   */
  isFutureDate(dateStr) {
    try {
      const [day, month, year] = dateStr.split('/');
      const inputDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      return inputDate > today;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get age from date of birth
   * @param {string} dobStr - Date of birth string in DD/MM/YYYY format
   * @returns {number} - Age in years
   */
  getAgeFromDOB(dobStr) {
    try {
      const [day, month, year] = dobStr.split('/');
      const dob = new Date(year, month - 1, day);
      const today = new Date();
      
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Validate age range
   * @param {string} dobStr - Date of birth string in DD/MM/YYYY format
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age
   * @returns {boolean} - True if age is within range
   */
  isAgeInRange(dobStr, minAge, maxAge) {
    const age = this.getAgeFromDOB(dobStr);
    return age >= minAge && age <= maxAge;
  }

  /**
   * Get formatted date string for display
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @param {string} format - Display format
   * @returns {string} - Formatted date string
   */
  formatDateForDisplay(dateStr, format = 'DD/MM/YYYY') {
    try {
      const [day, month, year] = dateStr.split('/');
      
      switch (format) {
        case 'DD-MM-YYYY':
          return `${day}-${month}-${year}`;
        case 'DD MMM YYYY':
          const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];
          return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
        case 'DD MMMM YYYY':
          const fullMonthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          return `${day} ${fullMonthNames[parseInt(month) - 1]} ${year}`;
        default:
          return dateStr;
      }
    } catch (error) {
      return dateStr;
    }
  }

  /**
   * Check if date is a valid business date (not weekend)
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {boolean} - True if it's a business date
   */
  isBusinessDate(dateStr) {
    try {
      const [day, month, year] = dateStr.split('/');
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    } catch (error) {
      return false;
    }
  }

  /**
   * Get next business date
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {string} - Next business date in DD/MM/YYYY format
   */
  getNextBusinessDate(dateStr) {
    try {
      const [day, month, year] = dateStr.split('/');
      let date = new Date(year, month - 1, day);
      
      do {
        date.setDate(date.getDate() + 1);
      } while (!this.isBusinessDate(this.formatDateFromDate(date)));
      
      return this.formatDateFromDate(date);
    } catch (error) {
      return dateStr;
    }
  }

  /**
   * Format Date object to DD/MM/YYYY string
   * @param {Date} date - Date object
   * @returns {string} - Formatted date string
   */
  formatDateFromDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  /**
   * Validate date range
   * @param {string} startDateStr - Start date string in DD/MM/YYYY format
   * @param {string} endDateStr - End date string in DD/MM/YYYY format
   * @returns {boolean} - True if start date is before end date
   */
  isValidDateRange(startDateStr, endDateStr) {
    try {
      const [startDay, startMonth, startYear] = startDateStr.split('/');
      const [endDay, endMonth, endYear] = endDateStr.split('/');
      
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      
      return startDate <= endDate;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get days difference between two dates
   * @param {string} startDateStr - Start date string in DD/MM/YYYY format
   * @param {string} endDateStr - End date string in DD/MM/YYYY format
   * @returns {number} - Number of days difference
   */
  getDaysDifference(startDateStr, endDateStr) {
    try {
      const [startDay, startMonth, startYear] = startDateStr.split('/');
      const [endDay, endMonth, endYear] = endDateStr.split('/');
      
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      
      const timeDiff = endDate.getTime() - startDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    } catch (error) {
      return 0;
    }
  }
}

module.exports = DatePickerValidation;
