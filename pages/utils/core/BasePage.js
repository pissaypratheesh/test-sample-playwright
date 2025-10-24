/**
 * Base Page Class - Common utilities for all page objects
 * Provides common methods for element interaction and waiting
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for element to be visible
   * @param {Locator} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(locator, timeout = 5000) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch (error) {
      console.log(`Element not visible within ${timeout}ms:`, error.message);
      return false;
    }
  }

  /**
   * Wait for element to be attached to DOM
   * @param {Locator} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElementAttached(locator, timeout = 5000) {
    try {
      await locator.waitFor({ state: 'attached', timeout });
      return true;
    } catch (error) {
      console.log(`Element not attached within ${timeout}ms:`, error.message);
      return false;
    }
  }

  /**
   * Check if element is visible
   * @param {Locator} locator - Element locator
   * @returns {boolean} - True if visible
   */
  async isElementVisible(locator) {
    try {
      return await locator.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param {Locator} locator - Element locator
   * @returns {boolean} - True if enabled
   */
  async isElementEnabled(locator) {
    try {
      return await locator.isEnabled();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get element text content
   * @param {Locator} locator - Element locator
   * @returns {string} - Text content
   */
  async getElementText(locator) {
    try {
      return await locator.textContent();
    } catch (error) {
      return '';
    }
  }

  /**
   * Get element input value
   * @param {Locator} locator - Element locator
   * @returns {string} - Input value
   */
  async getElementValue(locator) {
    try {
      return await locator.inputValue();
    } catch (error) {
      return '';
    }
  }

  /**
   * Click element with retry
   * @param {Locator} locator - Element locator
   * @param {Object} options - Click options
   */
  async clickElement(locator, options = {}) {
    try {
      await locator.click(options);
      return true;
    } catch (error) {
      console.log('Click failed:', error.message);
      return false;
    }
  }

  /**
   * Fill input with retry
   * @param {Locator} locator - Element locator
   * @param {string} value - Value to fill
   */
  async fillInput(locator, value) {
    try {
      await locator.clear();
      await locator.fill(value);
      return true;
    } catch (error) {
      console.log('Fill failed:', error.message);
      return false;
    }
  }

  /**
   * Scroll element into view
   * @param {Locator} locator - Element locator
   */
  async scrollIntoView(locator) {
    try {
      await locator.scrollIntoViewIfNeeded();
    } catch (error) {
      console.log('Scroll failed:', error.message);
    }
  }

  /**
   * Wait for page to load
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForPageLoad(timeout = 30000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      console.log('Page load timeout:', error.message);
    }
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name = 'screenshot') {
    try {
      await this.page.screenshot({ 
        path: `.playwright-mcp/${name}-${Date.now()}.png`,
        fullPage: true 
      });
    } catch (error) {
      console.log('Screenshot failed:', error.message);
    }
  }
}

module.exports = BasePage;
