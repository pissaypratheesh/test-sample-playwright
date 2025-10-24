const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * Customer Details Handler
 * Handles customer information filling
 */
class CustomerDetailsHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Fill Customer Details section
   * @param {Object} data - Customer data
   */
  async fillCustomerDetails(data) {
    console.log('Filling Customer Details...');
    
    // Scroll to Customer Details section
    await this.scrollIntoView(this.page.locator('text=Customer Details'));
    
    // Salutation
    try {
      await this.selectSalutation(data.salutation);
    } catch (e) {
      console.log('Could not select salutation:', e.message);
    }
    
    // First Name
    await this.fillInput(this.page.locator('input[name="FIRST_NAME"]'), data.firstName);
    
    // Email
    await this.fillInput(this.page.locator('input[name="EMAIL"]'), data.email);
    
    // Mobile Number
    await this.fillInput(this.page.locator('input[name="MOB_NO"]'), data.mobile);
    
    console.log('✅ Customer Details filled');
  }

  /**
   * Select Salutation dropdown
   * @param {string} salutation - Salutation value
   */
  async selectSalutation(salutation) {
    // Try by known ID
    const byId = this.page.locator('#mui-component-select-Salutation');
    if (await byId.isVisible().catch(() => false)) {
      await this.selectMuiOption('#mui-component-select-Salutation', salutation);
      return;
    }
    
    // Try combobox by accessible name
    const byRole = this.page.getByRole('combobox', { name: /salutation/i });
    if (await byRole.isVisible().catch(() => false)) {
      await byRole.click();
      await this.page.getByRole('option', { name: salutation, exact: false }).click();
      return;
    }
    
    // Try proximity to label text
    const label = this.page.getByText(/Salutation\s*\*/i);
    if (await label.isVisible().catch(() => false)) {
      const container = label.locator('xpath=..');
      const button = container.locator('[role="button"], [aria-haspopup="listbox"]');
      if (await button.first().isVisible().catch(() => false)) {
        await button.first().click();
        await this.page.getByRole('option', { name: salutation, exact: false }).click();
        return;
      }
    }
    
    throw new Error(`Salutation dropdown not found`);
  }
}

module.exports = CustomerDetailsHandler;
