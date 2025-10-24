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
    
    // First check if the option is already selected
    const currentValue = await page.locator(selectLocator).textContent().catch(() => '');
    console.log(`🔍 [BaseRenewalPage] Current selected value: "${currentValue}"`);
    
    const normalize = (s) => (s || '').trim();
    const normalizeLoose = (s) => (s || '').replace(/\s+/g, '').toLowerCase();
    
    // Check if already selected (exact match or contains)
    if (normalize(currentValue) === normalize(optionText) || 
        normalize(currentValue).includes(normalize(optionText)) ||
        normalizeLoose(currentValue) === normalizeLoose(optionText)) {
      console.log(`✅ [BaseRenewalPage] Option "${optionText}" is already selected`);
      return;
    }
    
    try {
      // Add timeout to the click operation to prevent hanging
      await page.locator(selectLocator).click({ timeout: 2000 });
    } catch (e) {
      console.log(`Could not click dropdown ${selectLocator}: ${e.message}`);
      throw e;
    }
    
    const list = page.locator('ul[role="listbox"]');
    await list.waitFor({ state: 'visible', timeout: 10000 });
    const options = list.locator('li[role="option"]');
    const count = await options.count();
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
        { timeout: 10000 }
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
    console.log(`🔍 [BaseRenewalPage] toggleYesNearLabel called with regex: ${labelRegex}`);
    const page = this.page;
    
    try {
      // Debug: Check current page state
      const currentUrl = page.url();
      const pageTitle = await page.title();
      console.log(`🔍 [BaseRenewalPage] Current URL: ${currentUrl}`);
      console.log(`🔍 [BaseRenewalPage] Current Title: ${pageTitle}`);
      
      // Find the label
      console.log(`🔍 [BaseRenewalPage] Looking for label with regex: ${labelRegex}`);
      const label = page.getByText(labelRegex).first();
      const labelVisible = await label.isVisible().catch(() => false);
      console.log(`🔍 [BaseRenewalPage] Label visible: ${labelVisible}`);
      
      if (!labelVisible) {
        console.log(`⚠️ [BaseRenewalPage] Label not found with regex: ${labelRegex}`);
        
        // Try alternative approaches
        console.log(`🔍 [BaseRenewalPage] Trying alternative label searches...`);
        const altPatterns = [
          labelRegex.source, // Use the regex source as string
          labelRegex.source.replace(/\\s\*/g, ' '), // Replace \s* with space
          labelRegex.source.replace(/\\s\+/g, ' '), // Replace \s+ with space
        ];
        
        for (const pattern of altPatterns) {
          try {
            const altLabel = page.getByText(pattern).first();
            const altVisible = await altLabel.isVisible().catch(() => false);
            console.log(`🔍 [BaseRenewalPage] Alternative pattern "${pattern}" visible: ${altVisible}`);
            if (altVisible) {
              console.log(`🔍 [BaseRenewalPage] Found label with alternative pattern: ${pattern}`);
              await altLabel.scrollIntoViewIfNeeded().catch(() => {});
              const container = altLabel.locator('xpath=ancestor::*[self::div or self::*][1]');
              await this.tryToggleMethods(container, pattern);
              return;
            }
          } catch (e) {
            console.log(`🔍 [BaseRenewalPage] Error with alternative pattern "${pattern}": ${e.message}`);
          }
        }
        
        throw new Error(`Label not found with regex: ${labelRegex}`);
      }
      
      console.log(`🔍 [BaseRenewalPage] Found label, scrolling into view...`);
      await label.scrollIntoViewIfNeeded().catch(() => {});
      const container = label.locator('xpath=ancestor::*[self::div or self::*][1]');
      console.log(`🔍 [BaseRenewalPage] Container found, trying toggle methods...`);
      
      await this.tryToggleMethods(container, labelRegex.source);
      
    } catch (e) {
      console.log(`❌ [BaseRenewalPage] Error in toggleYesNearLabel: ${e.message}`);
      throw e;
    }
  }
  
  /**
   * Try different toggle methods on a container
   * @param {Object} container - The container element
   * @param {string} labelText - The label text for debugging
   */
  async tryToggleMethods(container, labelText) {
    console.log(`🔍 [BaseRenewalPage] Trying toggle methods for: ${labelText}`);
    
    // Try explicit Yes button
    console.log(`🔍 [BaseRenewalPage] Trying Yes button...`);
    const yesBtn = container.getByRole('button', { name: /yes/i }).first();
    const yesBtnVisible = await yesBtn.isVisible().catch(() => false);
    console.log(`🔍 [BaseRenewalPage] Yes button visible: ${yesBtnVisible}`);
    
    if (yesBtnVisible) {
      const ariaPressed = await yesBtn.getAttribute('aria-pressed').catch(() => null);
      console.log(`🔍 [BaseRenewalPage] Yes button aria-pressed: ${ariaPressed}`);
      if (ariaPressed !== 'true') {
        console.log(`🔍 [BaseRenewalPage] Clicking Yes button...`);
        await yesBtn.click();
        console.log(`🔍 [BaseRenewalPage] ✅ Yes button clicked successfully`);
        return;
      } else {
        console.log(`🔍 [BaseRenewalPage] ✅ Yes button already pressed`);
        return;
      }
    }

    // Try switch/checkbox
    console.log(`🔍 [BaseRenewalPage] Trying checkbox/switch...`);
    const checkbox = container.locator('input[type="checkbox"], [role="switch"]').first();
    const checkboxVisible = await checkbox.isVisible().catch(() => false);
    console.log(`🔍 [BaseRenewalPage] Checkbox visible: ${checkboxVisible}`);
    
    if (checkboxVisible) {
      const isChecked = await checkbox.isChecked().catch(() => false);
      console.log(`🔍 [BaseRenewalPage] Checkbox checked: ${isChecked}`);
      if (!isChecked) {
        const boxLabel = checkbox.locator('xpath=ancestor::label[1]');
        const boxLabelVisible = await boxLabel.isVisible().catch(() => false);
        console.log(`🔍 [BaseRenewalPage] Box label visible: ${boxLabelVisible}`);
        if (boxLabelVisible) {
          console.log(`🔍 [BaseRenewalPage] Clicking box label...`);
          await boxLabel.click();
        } else {
          console.log(`🔍 [BaseRenewalPage] Clicking checkbox directly...`);
          await checkbox.click({ force: true });
        }
        console.log(`🔍 [BaseRenewalPage] ✅ Checkbox clicked successfully`);
        return;
      } else {
        console.log(`🔍 [BaseRenewalPage] ✅ Checkbox already checked`);
        return;
      }
    }

    // Try radio Yes
    console.log(`🔍 [BaseRenewalPage] Trying radio Yes...`);
    const radioYes = container.locator('input[type="radio"][value="true"], input[type="radio"][aria-checked="true"]').first();
    const radioYesVisible = await radioYes.isVisible().catch(() => false);
    console.log(`🔍 [BaseRenewalPage] Radio Yes visible: ${radioYesVisible}`);
    
    if (radioYesVisible) {
      const isChecked = await radioYes.isChecked().catch(() => false);
      console.log(`🔍 [BaseRenewalPage] Radio Yes checked: ${isChecked}`);
      if (!isChecked) {
        console.log(`🔍 [BaseRenewalPage] Clicking radio Yes...`);
        await radioYes.check({ force: true });
        console.log(`🔍 [BaseRenewalPage] ✅ Radio Yes clicked successfully`);
        return;
      } else {
        console.log(`🔍 [BaseRenewalPage] ✅ Radio Yes already checked`);
        return;
      }
    }

    console.log(`❌ [BaseRenewalPage] No toggle method worked for: ${labelText}`);
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
    await list.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
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
