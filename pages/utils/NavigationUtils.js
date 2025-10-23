const BasePage = require('./BasePage');

/**
 * Navigation utilities for common navigation patterns
 */
class NavigationUtils extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Navigate to login page
   * @param {string} baseUrl - Base URL of the application
   */
  async navigateToLoginPage(baseUrl = 'https://uatlifekaplan.tmibasl.in/') {
    await this.page.goto(baseUrl);
    await this.waitForPageLoad();
  }

  /**
   * Perform login with credentials
   * @param {Object} creds - Credentials object with username, password
   * @param {string} captcha - Captcha value (default: '1234')
   */
  async login(creds, captcha = '1234') {
    // Fill username
    await this.safeFill(
      this.page.getByRole('textbox', { name: 'Enter User Name' }),
      creds.username
    );

    // Fill password
    await this.safeFill(
      this.page.getByRole('textbox', { name: 'Enter Password' }),
      creds.password
    );

    // Fill captcha
    await this.safeFill(
      this.page.getByRole('textbox', { name: 'Enter Captcha' }),
      captcha
    );

    // Click login button
    await this.safeClick(
      this.page.getByRole('button', { name: 'Login  ' })
    );

    // Wait for dashboard to load
    await this.waitForPageLoad('**/dashboard');
  }

  /**
   * Navigate to policy issuance page through menu
   */
  async navigateToPolicyIssuance() {
    // Click menu button
    await this.safeClick(
      this.page.getByRole('button', { name: 'menu' })
    );

    // Click Policy Centre
    await this.safeClick(
      this.page.locator('a').filter({ hasText: 'Policy Centre' })
    );

    // Click Policy submenu
    await this.safeClick(
      this.page.locator('a').filter({ hasText: /^Policy$/ })
    );

    // Click Policy Issuance
    await this.safeClick(
      this.page.locator('a').filter({ hasText: 'Policy Issuance' })
    );

    // Wait for policy issuance page to load
    await this.waitForPageLoad('**/createPolicy');
  }

  /**
   * Navigate to renewal flow
   */
  async navigateToRenewalFlow() {
    // Click Renew button
    await this.safeClick(
      this.page.getByRole('button', { name: 'Renew' })
    );

    // Click Non TMIBASL Policy
    await this.safeClick(
      this.page.getByRole('button', { name: 'Non TMIBASL Policy' })
    );

    // Wait for form to be ready
    await this.page.waitForTimeout(1000);
  }

  /**
   * Navigate to new policy flow
   */
  async navigateToNewPolicyFlow() {
    // Click New button (use exact match to avoid NEWS button)
    await this.safeClick(
      this.page.getByRole('button', { name: 'New', exact: true })
    );

    // Wait for form to be ready
    await this.page.waitForTimeout(1000);
  }

  /**
   * Navigate to specific menu item
   * @param {string} menuPath - Menu path like "Policy Centre > Policy > Policy Issuance"
   */
  async navigateToMenuItem(menuPath) {
    const menuItems = menuPath.split(' > ');
    
    // Click menu button first
    await this.safeClick(
      this.page.getByRole('button', { name: 'menu' })
    );

    // Navigate through each menu item
    for (let i = 0; i < menuItems.length; i++) {
      const menuItem = menuItems[i].trim();
      
      if (i === 0) {
        // First level menu
        await this.safeClick(
          this.page.locator('a').filter({ hasText: menuItem })
        );
      } else {
        // Submenu items
        await this.safeClick(
          this.page.locator('a').filter({ hasText: menuItem })
        );
      }
      
      // Wait between clicks
      await this.page.waitForTimeout(500);
    }

    // Wait for final page to load
    await this.waitForPageLoad();
  }

  /**
   * Logout from application
   */
  async logout() {
    try {
      // Click user account button
      await this.safeClick(
        this.page.getByRole('button', { name: 'account of current user' })
      );

      // Look for logout option
      const logoutOption = this.page.locator('text=Logout').first();
      if (await logoutOption.isVisible().catch(() => false)) {
        await this.safeClick(logoutOption);
      }
    } catch (error) {
      console.warn('Logout failed:', error.message);
    }
  }

  /**
   * Check if user is logged in
   * @returns {boolean} - True if logged in
   */
  async isLoggedIn() {
    try {
      const dashboardElement = this.page.locator('text=Dashboard').first();
      return await dashboardElement.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }
}

module.exports = NavigationUtils;
