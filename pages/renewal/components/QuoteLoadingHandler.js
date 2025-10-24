const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * Quote Loading Handler
 * Handles quote loading and validation alerts
 */
class QuoteLoadingHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Wait for quotes to load and handle any validation alerts
   */
  async waitForQuotesToLoad() {
    console.log('Waiting for quotes to load...');
    
    // Robust, configurable wait for slow quote result loads
    try {
      const waitMs = parseInt(process.env.PLAYWRIGHT_QUOTE_LOAD_TIMEOUT_MS || '180000', 10);
      const pollIntervalMs = 500;
      const deadline = Date.now() + waitMs;
      
      while (Date.now() < deadline) {
        // Success conditions: quotes table/list visible OR a success toast
        const quoteGrid = this.page.locator('table:has-text("Quote"), [data-testid="quotes-grid"], [role="grid"]:has-text("Quote")').first();
        if (await quoteGrid.isVisible().catch(() => false)) break;
        
        const successToast = this.page.getByText(/quote|premium|plan|result/i).first();
        if (await successToast.isVisible().catch(() => false)) break;
        
        // Failure conditions: error alert surfaced
        const errorAlert = this.page.getByRole('alert').filter({ hasText: /error|failed|unable|timeout/i }).first();
        if (await errorAlert.isVisible().catch(() => false)) {
          break;
        }
        
        await this.page.waitForTimeout(pollIntervalMs);
      }
    } catch (e) {
      console.log('Error waiting for quotes:', e.message);
    }

    // Check for validation alerts
    await this.checkForValidationAlerts();
  }

  /**
   * Check for validation alerts and handle them
   */
  async checkForValidationAlerts() {
    try {
      const alertRole = this.page.getByRole('alert');
      if (await alertRole.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await alertRole.first().innerText();
        if (/minimum|min\b/i.test(text)) {
          console.log('Validation alert detected:', text);
          const path = require('path');
          await this.page.screenshot({ path: path.join(__dirname, '../../../test-results/validation-alert.png'), fullPage: true });
        }
      } else {
        const minText = this.page.getByText(/minimum|min\b/i).first();
        if (await minText.isVisible({ timeout: 1000 }).catch(() => false)) {
          const text = await minText.innerText();
          console.log('Validation message detected:', text);
          const path = require('path');
          await this.page.screenshot({ path: path.join(__dirname, '../../../test-results/validation-alert.png'), fullPage: true });
        }
      }
    } catch (e) {
      console.log('Error checking validation alerts:', e.message);
    }
  }
}

module.exports = QuoteLoadingHandler;
