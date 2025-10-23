const { expect } = require('@playwright/test');

/**
 * Base page class with common utilities for all page objects
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for element to be visible and clickable
   * @param {Locator} locator - Playwright locator
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.waitFor({ state: 'attached', timeout });
  }

  /**
   * Safe click with retry mechanism
   * @param {Locator} locator - Playwright locator
   * @param {number} retries - Number of retries
   */
  async safeClick(locator, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElement(locator);
        await locator.click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Safe fill with retry mechanism
   * @param {Locator} locator - Playwright locator
   * @param {string} text - Text to fill
   * @param {number} retries - Number of retries
   */
  async safeFill(locator, text, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElement(locator);
        await locator.clear();
        await locator.fill(text);
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Select dropdown option with retry mechanism
   * @param {Locator} dropdownLocator - Dropdown locator
   * @param {string} optionText - Option text to select
   * @param {number} retries - Number of retries
   */
  async selectDropdownOption(dropdownLocator, optionText, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElement(dropdownLocator);
        await dropdownLocator.click();
        await this.page.waitForTimeout(500); // Wait for dropdown to open
        
        const optionLocator = this.page.getByRole('option', { name: optionText });
        await this.waitForElement(optionLocator, 5000);
        await optionLocator.click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Select radio button option by label
   * @param {string} labelText - Label text for the radio group
   * @param {string} optionText - Option text to select
   */
  async selectRadioOption(labelText, optionText) {
    const radioGroup = this.page.getByRole('group', { name: labelText });
    const option = radioGroup.getByRole('button', { name: optionText });
    await this.safeClick(option);
  }

  /**
   * Click button by text
   * @param {string} buttonText - Button text to click
   */
  async clickButton(buttonText) {
    const button = this.page.getByRole('button', { name: buttonText });
    await this.safeClick(button);
  }

  /**
   * Set date on input field with comprehensive Material UI support
   * @param {Locator} inputLocator - Date input locator
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @param {Object} options - Additional options
   */
  async setDateOnInput(inputLocator, dateStr, options = {}) {
    const DatePickerUtils = require('./DatePickerUtils');
    const datePicker = new DatePickerUtils(this.page);
    return await datePicker.setDateOnMaterialUIPicker(inputLocator, dateStr, options);
  }


  /**
   * Wait for page to load completely
   * @param {string} urlPattern - URL pattern to wait for
   */
  async waitForPageLoad(urlPattern = '**') {
    await this.page.waitForURL(urlPattern);
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = BasePage;
