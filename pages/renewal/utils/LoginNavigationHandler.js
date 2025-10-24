/**
 * Login and Navigation Handler
 * Handles login and navigation to renewal form
 */
class LoginNavigationHandler {
  constructor(page) {
    this.page = page;
  }

  /**
   * Perform login and navigation to renewal form
   * @param {Object} credentials - Login credentials
   */
  async performLoginAndNavigation(credentials) {
    console.log('🔐 Performing login and navigation...');
    
    // Navigate to login page
    await this.page.goto('https://uatlifekaplan.tmibasl.in/');
    
    // Fill login credentials
    await this.page.getByRole('textbox', { name: 'Enter User Name' }).fill(credentials.username);
    await this.page.getByRole('textbox', { name: 'Enter Password' }).fill(credentials.password);
    
    // Click login button
    await this.page.getByRole('button', { name: /login/i }).click();
    
    // Navigate to Policy Centre
    await this.navigateToPolicyCentre();
    
    console.log('✅ Login and navigation completed');
  }

  /**
   * Navigate to Policy Centre and renewal form
   */
  async navigateToPolicyCentre() {
    await this.page.getByRole('button', { name: /menu/i }).click();
    await this.page.getByText('Policy Centre').click();
    await this.page.getByText(/^Policy$/).click();
    await this.page.getByText('Policy Issuance').click();
    
    // Click Renew button
    await this.page.getByRole('button', { name: /renew/i }).click();
    await this.page.getByRole('button', { name: /NON TMIBASL POLICY/i }).click();
  }

  /**
   * Check if login was successful
   * @returns {boolean} Whether login was successful
   */
  async isLoginSuccessful() {
    try {
      // Check for elements that indicate successful login
      const menuButton = this.page.getByRole('button', { name: /menu/i });
      return await menuButton.isVisible({ timeout: 5000 });
    } catch (e) {
      return false;
    }
  }

  /**
   * Wait for page to load after login
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForPageLoad(timeout = 10000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (e) {
      console.log('Page load timeout, continuing...');
    }
  }

  /**
   * Take screenshot for debugging
   * @param {string} filename - Screenshot filename
   */
  async takeScreenshot(filename) {
    const path = require('path');
    const screenshotPath = path.join(__dirname, '../../../test-results', filename);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  }
}

module.exports = LoginNavigationHandler;
