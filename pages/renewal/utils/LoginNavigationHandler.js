/**
 * Login and Navigation Handler
 * Handles login and navigation to policy forms (New Policy or Renewal)
 */
class LoginNavigationHandler {
  constructor(page) {
    this.page = page;
    this.flowType = 'renew'; // Default to renewal
  }

  /**
   * Perform login and navigation to policy form
   * @param {Object} credentials - Login credentials
   * @param {string} flowType - 'new' for new policy, 'renew' for renewal (default)
   */
  async performLoginAndNavigation(credentials, flowType = 'renew') {
    console.log('🔐 Performing login and navigation...');
    
    // Store flow type for navigation
    this.flowType = flowType;
    
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
   * Navigate to Policy Centre and policy form
   * Supports both 'new' and 'renew' flows
   */
  async navigateToPolicyCentre() {
    await this.page.getByRole('button', { name: /menu/i }).click();
    await this.page.getByText('Policy Centre').click();
    await this.page.getByText(/^Policy$/).click();
    await this.page.getByText('Policy Issuance').click();
    
    // After clicking "Policy Issuance", we see the form with New/Renew toggle
    // By default, "New" is already selected (pressed=true)
    // For "renew" flow, we need to click the "Renew" button
    if (this.flowType === 'new') {
      console.log('📄 Form is already in NEW Policy mode (default), no action needed');
      await this.page.waitForTimeout(2000);
    } else {
      console.log('🔄 Switching to RENEWAL Policy...');
      // Use specific selector for "Renew" button (value="R")
      await this.page.locator('button[value="R"]').click();
      await this.page.waitForTimeout(2000);
      
      // Click NON TMIBASL POLICY
      await this.page.getByRole('button', { name: /NON TMIBASL POLICY/i }).click();
    }
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
