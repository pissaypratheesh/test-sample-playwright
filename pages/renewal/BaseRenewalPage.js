const { expect } = require('@playwright/test');
const DatePickerCore = require('../utils/core/datepicker_copy/DatePickerCore');

/**
 * Base class for all renewal form pages
 * Contains common utilities and methods used across all pages
 */
class BaseRenewalPage {
  constructor(page) {
    this.page = page;
    this.datePickerCore = new DatePickerCore(page);
  }

  /**
   * Select an option from a Material-UI dropdown
   * @param {string} selectLocator - CSS selector for the dropdown
   * @param {string} optionText - Text of the option to select
   * @param {Object} opts - Options for selection (numeric matching, etc.)
   */
  async selectMuiOption(selectLocator, optionText, opts = {}) {
    const page = this.page;
    
    try {
      // Add timeout to the click operation to prevent hanging
      await page.locator(selectLocator).click({ timeout: 2000 });
    } catch (e) {
      console.log(`Could not click dropdown ${selectLocator}: ${e.message}`);
      throw e;
    }
    
    const list = page.locator('ul[role="listbox"]');
    await list.waitFor({ state: 'visible', timeout: 3000 });
    const options = list.locator('li[role="option"]');
    const count = await options.count();
    
    const normalize = (s) => (s || '').trim();
    const normalizeLoose = (s) => (s || '').replace(/\s+/g, '').toLowerCase();
    const toNumeric = (s) => {
      const m = (s || '').match(/\d+/);
      return m ? m[0] : null;
    };

    // Exact/contains matching
    for (let i = 0; i < count; i++) {
      const text = normalize(await options.nth(i).innerText());
      if (text === optionText || text.includes(optionText)) {
        await options.nth(i).click();
        return;
      }
    }

    // Loose spaces/case matching
    const target = normalizeLoose(optionText);
    for (let i = 0; i < count; i++) {
      const text = normalizeLoose(await options.nth(i).innerText());
      if (text.includes(target)) {
        await options.nth(i).click();
        return;
      }
    }

    // Numeric matching (for cases like '20%', '20 %', 'Level 20')
    if (opts.numeric) {
      const want = toNumeric(optionText);
      if (want) {
        for (let i = 0; i < count; i++) {
          const text = await options.nth(i).innerText();
          if (toNumeric(text) === want) {
            await options.nth(i).click();
            return;
          }
        }
      }
    }
    
    throw new Error(`Option not found for ${selectLocator}: ${optionText}`);
  }

  /**
   * Set date on an input field using DatePickerCore with JavaScript fallback
   * @param {Object} inputLocator - Playwright locator for the input
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   */
  async setDateOnInput(inputLocator, dateStr) {
    const input = inputLocator.first();
    if (!(await input.isVisible().catch(() => false))) {
      throw new Error('Date input not found');
    }

    const page = this.page;
    
    // Try DatePickerCore first (it handles clicking internally)
    try {
      const success = await this.datePickerCore.setDateOnMaterialUIPicker(
        input, 
        dateStr,
        { timeout: 5000 }
      );
      
      if (success) {
        const currentValue = await input.inputValue();
        console.log(`✅ Date set successfully using DatePickerCore: ${currentValue}`);
        return;
      }
    } catch (e) {
      console.log('DatePickerCore failed, trying JavaScript fallback method...');
    }

    // Fallback 1: JavaScript injection with readonly removal
    try {
      const result = await page.evaluate((selector, value) => {
        const input = document.querySelector(selector);
        if (input) {
          // Remove readonly attribute
          input.removeAttribute('readonly');
          input.readOnly = false;
          
          // Set the value
          input.value = value;
          
          // Trigger events
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));
          
          return {
            success: true,
            finalValue: input.value,
            readonly: input.readOnly
          };
        }
        return { success: false, error: 'Input not found' };
      }, `input[name="${await input.getAttribute('name')}"]`, dateStr);

      if (result.success) {
        console.log(`✅ Date set successfully using JavaScript fallback: ${result.finalValue}`);
        return;
      }
    } catch (e) {
      console.log('JavaScript fallback failed, trying direct element handle method...');
    }

    // Fallback 2: Direct element handle manipulation
    try {
      const handle = await input.elementHandle();
      if (!handle) throw new Error('Date input handle missing');
      
      await handle.evaluate((el, value) => {
        try { el.removeAttribute('readonly'); } catch {}
        try { el.readOnly = false; } catch {}
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur();
      }, dateStr);

      const val = await input.inputValue().catch(() => '');
      if (val === dateStr) {
        console.log(`✅ Date set successfully using element handle method: ${val}`);
        await page.keyboard.press('Escape').catch(() => {});
        await input.blur().catch(() => {});
        return;
      }
    } catch (e) {
      console.log('Element handle method failed, trying final typing method...');
    }

    // Fallback 3: Final attempt with typing
    try {
      await input.click();
      await input.fill('');
      await input.type(dateStr, { delay: 20 });
      await page.keyboard.press('Enter').catch(() => {});
      await page.keyboard.press('Escape').catch(() => {});
      await input.blur().catch(() => {});
      
      const val = await input.inputValue().catch(() => '');
      if (val === dateStr) {
        console.log(`✅ Date set successfully using typing method: ${val}`);
        return;
      }
    } catch (e) {
      console.log('Typing method also failed');
    }

    throw new Error(`Failed to set date ${dateStr} using all available methods`);
  }

  /**
   * Toggle a Yes/No option near a label
   * @param {RegExp} labelRegex - Regex to find the label
   */
  async toggleYesNearLabel(labelRegex) {
    const page = this.page;
    const label = page.getByText(labelRegex).first();
    await label.scrollIntoViewIfNeeded().catch(() => {});
    const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
    
    // Try explicit Yes button
    const yesBtn = container.getByRole('button', { name: /yes/i }).first();
    if (await yesBtn.isVisible().catch(() => false)) {
      const ariaPressed = await yesBtn.getAttribute('aria-pressed').catch(() => null);
      if (ariaPressed !== 'true') {
        await yesBtn.click();
      }
      return;
    }

    // Try switch/checkbox
    const checkbox = container.locator('input[type="checkbox"], [role="switch"]').first();
    if (await checkbox.isVisible().catch(() => false)) {
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (!isChecked) {
        const boxLabel = checkbox.locator('xpath=ancestor::label[1]');
        if (await boxLabel.isVisible().catch(() => false)) {
          await boxLabel.click();
        } else {
          await checkbox.click({ force: true });
        }
      }
      return;
    }

    // Try radio Yes
    const radioYes = container.locator('input[type="radio"][value="true"], input[type="radio"][aria-checked="true"]').first();
    if (await radioYes.isVisible().catch(() => false)) {
      const isChecked = await radioYes.isChecked().catch(() => false);
      if (!isChecked) {
        await radioYes.check({ force: true });
      }
      return;
    }

    throw new Error('Unable to set Yes for toggle near label');
  }

  /**
   * Select dropdown option near a label
   * @param {RegExp} labelRegex - Regex to find the label
   * @param {string} optionText - Text of the option to select
   * @param {Object} opts - Options for selection
   */
  async selectDropdownNearLabel(labelRegex, optionText, opts = {}) {
    const page = this.page;
    const label = page.getByText(labelRegex).first();
    await label.scrollIntoViewIfNeeded().catch(() => {});
    const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
    const button = container.locator('[role="combobox"], [role="button"][aria-haspopup="listbox"], [aria-haspopup="listbox"], [id^="mui-component-select-"]').first();
    
    if (!(await button.isVisible().catch(() => false))) {
      throw new Error('Dropdown button not found near label');
    }
    
    await button.click();
    
    // Reuse listbox selection logic
    const list = page.locator('ul[role="listbox"], [role="listbox"]');
    await list.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    const options = list.locator('li[role="option"], [role="option"]');
    const count = await options.count();
    
    const normalize = (s) => (s || '').trim();
    const normalizeLoose = (s) => (s || '').replace(/\s+/g, '').toLowerCase();
    const toNumeric = (s) => {
      const m = (s || '').match(/\d+/);
      return m ? m[0] : null;
    };

    for (let i = 0; i < count; i++) {
      const text = normalize(await options.nth(i).innerText());
      if (text === optionText || text.includes(optionText)) {
        await options.nth(i).click();
        return;
      }
    }

    const target = normalizeLoose(optionText);
    for (let i = 0; i < count; i++) {
      const text = normalizeLoose(await options.nth(i).innerText());
      if (text.includes(target)) {
        await options.nth(i).click();
        return;
      }
    }

    if (opts.numeric) {
      const want = toNumeric(optionText);
      if (want) {
        for (let i = 0; i < count; i++) {
          const text = await options.nth(i).innerText();
          if (toNumeric(text) === want) {
            await options.nth(i).click();
            return;
          }
        }
      }
    }
    
    throw new Error('Option not found near label');
  }

  /**
   * Fill a text input field safely
   * @param {Object} inputLocator - Playwright locator for the input
   * @param {string} value - Value to fill
   * @param {boolean} clearFirst - Whether to clear the field first
   */
  async fillInput(inputLocator, value, clearFirst = true) {
    const input = inputLocator.first();
    if (!(await input.isVisible().catch(() => false))) {
      throw new Error('Input field not found');
    }

    if (clearFirst) {
      await input.clear();
    }
    await input.fill(value);
  }

  /**
   * Wait for an element to be visible with timeout
   * @param {Object} locator - Playwright locator
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(locator, timeout = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Scroll element into view if needed
   * @param {Object} locator - Playwright locator
   */
  async scrollIntoView(locator) {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
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

  /**
   * Set date by label (fallback method)
   * @param {RegExp} labelRegex - Label regex
   * @param {string} dateStr - Date string
   */
  async setDateByLabel(labelRegex, dateStr) {
    const page = this.page;
    const label = page.getByText(labelRegex).first();
    await this.scrollIntoView(label);
    const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
    const input = container.locator('input[placeholder="DD/MM/YYYY"], input[name="POLICY_EXPIRY_DATE"]').first();
    
    if (!(await input.isVisible().catch(() => false))) {
      throw new Error('Date input not found');
    }
    
    // Use the same date setting logic as setDateOnInput
    await this.setDateOnInput(input, dateStr);
  }
}

module.exports = BaseRenewalPage;
