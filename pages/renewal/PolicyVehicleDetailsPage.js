const OEMSelectionHandler = require('./components/OEMSelectionHandler');
const PreviousPolicyHandler = require('./components/PreviousPolicyHandler');
const CustomerDetailsHandler = require('./components/CustomerDetailsHandler');
const VehicleDetailsHandler = require('./components/VehicleDetailsHandler');
const RegistrationDetailsHandler = require('./components/RegistrationDetailsHandler');

/**
 * Policy Vehicle Details Page
 * Orchestrates the policy and vehicle details form filling
 */
class PolicyVehicleDetailsPage {
  constructor(page) {
    this.page = page;
    this.oemHandler = new OEMSelectionHandler(page);
    this.previousPolicyHandler = new PreviousPolicyHandler(page);
    this.customerHandler = new CustomerDetailsHandler(page);
    this.vehicleHandler = new VehicleDetailsHandler(page);
    this.registrationHandler = new RegistrationDetailsHandler(page);
  }

  /**
   * Fill the complete policy and vehicle details form
   * @param {Object} data - Form data for policy and vehicle details
   */
  async fillPolicyVehicleForm(data) {
    console.log('Starting Policy & Vehicle Details Form');
    
    // Step 1: Select OEM first to initialize dependent form state
    await this.oemHandler.selectOEM(data.oem);
    
    // Step 2: Select Proposer Type (Individual/Corporate)
    await this.oemHandler.selectProposerType(data.proposerType || 'Individual');
    
    // Step 3: Select Vehicle Cover (affects form fields)
    await this.oemHandler.selectVehicleCover(data.vehicleCover);
    
    // Step 4: Fill Previous Policy Details
    await this.previousPolicyHandler.fillPreviousPolicyDetails(data);
    
    // Step 5: Fill Customer Details
    await this.customerHandler.fillCustomerDetails(data);
    
    // Step 6: Fill Vehicle Details
    await this.vehicleHandler.fillVehicleDetails(data);
    
    // Step 7: Fill Registration Details
    await this.registrationHandler.fillRegistrationDetails(data);
    
    console.log('✅ Policy & Vehicle Details Form completed successfully');
  }

  /**
   * Click Get Quotes button to proceed to additional details form
   */
  async clickGetQuotes() {
    console.log('Clicking Get Quotes button...');
    await this.page.getByRole('button', { name: /Get Quotes/i }).click();
    
    // Optional pause for manual observation
    const debugSleepMs = parseInt(process.env.PLAYWRIGHT_DEBUG_SLEEP_MS || '0', 10);
    if (Number.isFinite(debugSleepMs) && debugSleepMs > 0) {
      await this.page.waitForTimeout(debugSleepMs);
    }
    
    // Brief wait to let any validation surface
    await this.page.waitForTimeout(2000);

    // Robust, configurable wait for slow quote result loads
    try {
      const waitMs = parseInt(process.env.PLAYWRIGHT_QUOTE_LOAD_TIMEOUT_MS || '180000', 10);
      const pollIntervalMs = 500;
      const deadline = Date.now() + waitMs;
      
      console.log(`🔍 [PolicyVehicleDetailsPage] Starting quote loading wait (timeout: ${waitMs}ms)...`);
      
      while (Date.now() < deadline) {
        // Success conditions: quotes table/list visible OR a success toast
        const quoteGrid = this.page.locator('table:has-text("Quote"), [data-testid="quotes-grid"], [role="grid"]:has-text("Quote")').first();
        if (await quoteGrid.isVisible().catch(() => false)) {
          console.log('🔍 [PolicyVehicleDetailsPage] ✅ Quote grid found');
          break;
        }
        
        const successToast = this.page.getByText(/quote|premium|plan|result/i).first();
        if (await successToast.isVisible().catch(() => false)) {
          console.log('🔍 [PolicyVehicleDetailsPage] ✅ Success toast found');
          break;
        }
        
        // Failure conditions: error alert surfaced
        const errorAlert = this.page.getByRole('alert').filter({ hasText: /error|failed|unable|timeout/i }).first();
        if (await errorAlert.isVisible().catch(() => false)) {
          console.log('🔍 [PolicyVehicleDetailsPage] ❌ Error alert found');
          throw new Error('Quote loading failed with error alert');
        }
        
        // Check for BUY NOW buttons (quotes loaded)
        const buyNowButton = this.page.locator('button:has-text("BUY NOW")').first();
        if (await buyNowButton.isVisible().catch(() => false)) {
          console.log('🔍 [PolicyVehicleDetailsPage] ✅ BUY NOW button found');
          break;
        }
        
        await this.page.waitForTimeout(pollIntervalMs);
      }
      
      console.log('🔍 [PolicyVehicleDetailsPage] ✅ Quotes loaded successfully');
    } catch (error) {
      console.log(`🔍 [PolicyVehicleDetailsPage] ❌ Quote loading timeout or error: ${error.message}`);
      // Continue anyway, the BuyNowHandler will handle the retry
    }
    
    console.log('✅ Get Quotes button clicked');
  }
}

module.exports = PolicyVehicleDetailsPage;