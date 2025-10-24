const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * Registration Details Handler
 * Handles vehicle registration information filling
 */
class RegistrationDetailsHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Fill Registration Details section
   * @param {Object} data - Registration data
   */
  async fillRegistrationDetails(data) {
    console.log('Filling Registration Details...');
    
    // Invoice Date
    await this.setDateOnInput(this.page.locator('input[name="InvoiceDate"]'), data.invoiceDate);
    
    // Registration Date
    await this.setDateOnInput(this.page.locator('input[name="RegistrationDate"]'), data.registrationDate);
    
    // Registration Number (split fields)
    await this.fillRegistrationNumber(data);
    
    console.log('✅ Registration Details filled');
  }

  /**
   * Fill Registration Number in split fields
   * @param {Object} data - Registration data
   */
  async fillRegistrationNumber(data) {
    try {
      const regStateRto = this.page.locator('input[placeholder="DL-09"], input[aria-label="Registration State RTO"], input[name="REG_STATE_RTO"]');
      const regSeries = this.page.locator('input[placeholder="RAA"], input[aria-label="Registration Series"], input[name="REG_SERIES"]');
      const regNumber = this.page.locator('input[placeholder="5445"], input[aria-label="Registration Number"], input[name="REG_NUMBER"]');

      const stateRtoVal = data.registrationStateRto;
      const seriesVal = data.registrationSeries;
      const numberVal = data.registrationNumber;

      if (await regStateRto.first().isVisible().catch(() => false)) {
        await this.fillInput(regStateRto.first(), stateRtoVal);
      }
      if (await regSeries.first().isVisible().catch(() => false)) {
        await this.fillInput(regSeries.first(), seriesVal);
      }
      if (await regNumber.first().isVisible().catch(() => false)) {
        await this.fillInput(regNumber.first(), numberVal);
      }
    } catch (e) {
      console.log('Error filling registration number:', e.message);
    }
  }
}

module.exports = RegistrationDetailsHandler;
