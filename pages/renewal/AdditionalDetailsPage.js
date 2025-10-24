const QuoteLoadingHandler = require('./components/QuoteLoadingHandler');
const DynamicSectionsHandler = require('./components/DynamicSectionsHandler');
const BuyNowHandler = require('./components/BuyNowHandler');

/**
 * Additional Details Page
 * Orchestrates the additional details and discounts form filling
 */
class AdditionalDetailsPage {
  constructor(page) {
    this.page = page;
    this.quoteHandler = new QuoteLoadingHandler(page);
    this.dynamicSectionsHandler = new DynamicSectionsHandler(page);
    this.buyNowHandler = new BuyNowHandler(page);
  }

  /**
   * Fill the complete additional details and discounts form with dynamic sections
   * @param {Object} data - Form data for additional details and discounts
   */
  async fillAdditionalDetailsForm(data) {
    console.log('🔍 [AdditionalDetailsPage] Starting Additional Details & Discounts Form');
    
    // Debug: Check page state before proceeding
    try {
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      console.log(`🔍 [AdditionalDetailsPage] Before filling - URL: ${currentUrl}`);
      console.log(`🔍 [AdditionalDetailsPage] Before filling - Title: ${pageTitle}`);
    } catch (e) {
      console.log(`🔍 [AdditionalDetailsPage] Error checking page state: ${e.message}`);
    }
    
    try {
      // Wait for quotes to load and handle the quote selection
      console.log('🔍 [AdditionalDetailsPage] Waiting for quotes to load...');
      await this.quoteHandler.waitForQuotesToLoad();
      console.log('🔍 [AdditionalDetailsPage] ✅ Quotes loaded successfully');
      
      // Debug: Check page state after quotes loaded
      try {
        const currentUrl = this.page.url();
        const pageTitle = await this.page.title();
        console.log(`🔍 [AdditionalDetailsPage] After quotes loaded - URL: ${currentUrl}`);
        console.log(`🔍 [AdditionalDetailsPage] After quotes loaded - Title: ${pageTitle}`);
      } catch (e) {
        console.log(`🔍 [AdditionalDetailsPage] Error checking page state after quotes: ${e.message}`);
      }
      
      // Fill additional details section
      console.log('🔍 [AdditionalDetailsPage] Filling additional details section...');
      await this.dynamicSectionsHandler.fillAdditionalDetailsSection(data);
      console.log('🔍 [AdditionalDetailsPage] ✅ Additional details section filled');
      
      // Debug: Check page state after filling additional details
      try {
        const currentUrl = this.page.url();
        const pageTitle = await this.page.title();
        console.log(`🔍 [AdditionalDetailsPage] After filling details - URL: ${currentUrl}`);
        console.log(`🔍 [AdditionalDetailsPage] After filling details - Title: ${pageTitle}`);
      } catch (e) {
        console.log(`🔍 [AdditionalDetailsPage] Error checking page state after filling: ${e.message}`);
      }
      
    } catch (error) {
      console.log(`🔍 [AdditionalDetailsPage] ❌ Error in fillAdditionalDetailsForm: ${error.message}`);
      throw error;
    }
    
    console.log('✅ Additional Details & Discounts Form completed successfully');
  }

  /**
   * Click Buy Now button to proceed to proposal details form
   * @returns {Object} New page object if popup opened
   */
  async clickBuyNow() {
    return await this.buyNowHandler.clickBuyNow();
  }
}

module.exports = AdditionalDetailsPage;