const PolicyVehicleDetailsPage = require('./PolicyVehicleDetailsPage');
const AdditionalDetailsPage = require('./AdditionalDetailsPage');
const ProposalDetailsPage = require('./ProposalDetailsPage');
const FormStateManager = require('./utils/FormStateManager');
const FormValidationManager = require('./utils/FormValidationManager');
const LoginNavigationHandler = require('./utils/LoginNavigationHandler');

/**
 * Form Flow Coordinator
 * Manages the complete renewal form flow with dynamic variations
 */
class RenewalFormFlowCoordinator {
  constructor(page) {
    this.page = page;
    this.policyVehiclePage = new PolicyVehicleDetailsPage(page);
    this.additionalDetailsPage = new AdditionalDetailsPage(page);
    this.proposalDetailsPage = new ProposalDetailsPage(page);
    this.formStateManager = new FormStateManager();
    this.validationManager = new FormValidationManager();
    this.loginHandler = new LoginNavigationHandler(page);
  }

  /**
   * Execute the complete renewal form flow
   * @param {Object} policyVehicleData - Data for Policy & Vehicle Details
   * @param {Object} additionalDetailsData - Data for Additional Details
   * @param {Object} proposalDetailsData - Data for Proposal Details
   * @param {Object} credentials - Login credentials
   */
  async executeCompleteFlow(policyVehicleData, additionalDetailsData, proposalDetailsData, credentials) {
    console.log('🚀 Starting Complete Renewal Form Flow');
    
    try {
      // Step 1: Login and navigate to renewal form
      await this.loginHandler.performLoginAndNavigation(credentials);
      
      // Step 2: Fill Policy & Vehicle Details, Additional Details, and click BUY NOW
      await this.executePolicyVehicleForm(policyVehicleData, additionalDetailsData);
      
      // Step 3: Fill Proposal Details
      await this.executeProposalDetailsForm(proposalDetailsData);
      
      console.log('✅ Complete Renewal Form Flow executed successfully');
      
    } catch (error) {
      console.error('❌ Error in Complete Renewal Form Flow:', error.message);
      throw error;
    }
  }

  /**
   * Execute Policy & Vehicle Details Form
   * @param {Object} policyVehicleData - Data for Policy & Vehicle Details
   * @param {Object} additionalDetailsData - Data for Additional Details
   */
  async executePolicyVehicleForm(policyVehicleData, additionalDetailsData) {
    console.log('📄 Executing Policy & Vehicle Details Form');
    
    try {
      // Update form state based on selections
      this.formStateManager.updateFromPolicyVehicleData(policyVehicleData);
      
      // Fill Policy & Vehicle Details form
      await this.policyVehiclePage.fillPolicyVehicleForm(policyVehicleData);
      
      // Fill Additional Details & Discounts on the create policy page (before clicking Get Quotes)
      console.log('🔍 [FlowCoordinator] Filling Additional Details on create policy page...');
      console.log('🔍 [FlowCoordinator] Additional Details Data:', JSON.stringify(additionalDetailsData, null, 2));
      
      // Debug: Check page state before filling additional details
      try {
        const currentUrl = this.page.url();
        const pageTitle = await this.page.title();
        console.log(`🔍 [FlowCoordinator] Before Additional Details - URL: ${currentUrl}`);
        console.log(`🔍 [FlowCoordinator] Before Additional Details - Title: ${pageTitle}`);
      } catch (e) {
        console.log(`🔍 [FlowCoordinator] Error checking page state: ${e.message}`);
      }
      
      await this.additionalDetailsPage.fillAdditionalDetailsForm(additionalDetailsData);
      console.log('🔍 [FlowCoordinator] ✅ Additional Details form filled successfully');
      
      // Click Get Quotes to proceed to quotation page
      await this.policyVehiclePage.clickGetQuotes();
      
      // Click BUY NOW on first available quote
      console.log('🔍 [FlowCoordinator] Clicking BUY NOW on first available quote...');
      const newPage = await this.additionalDetailsPage.clickBuyNow();
      
      // Update page reference if new window opened
      if (newPage) {
        this.page = newPage;
        this.proposalDetailsPage = new ProposalDetailsPage(newPage);
        console.log('🔍 [FlowCoordinator] ✅ BUY NOW opened new page');
      } else {
        console.log('🔍 [FlowCoordinator] ✅ BUY NOW navigated in same page');
      }
      
      this.formStateManager.setCurrentStep('proposalDetails');
      console.log('✅ Policy & Vehicle Details Form completed successfully');
      
    } catch (error) {
      console.error('❌ Error in Policy & Vehicle Details Form:', error.message);
      throw error;
    }
  }

  /**
   * Execute Additional Details & Discounts Form
   * @param {Object} additionalDetailsData - Data for Additional Details
   */
  async executeAdditionalDetailsForm(additionalDetailsData) {
    console.log('📄 Executing Additional Details & Discounts Form');
    
    // Debug: Check page state before proceeding
    try {
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      console.log(`🔍 [FlowCoordinator] Before Additional Details - URL: ${currentUrl}`);
      console.log(`🔍 [FlowCoordinator] Before Additional Details - Title: ${pageTitle}`);
      
      // Check if we're still on the right page
      if (!currentUrl.includes('createPolicy') && !currentUrl.includes('quotation')) {
        console.log(`🔍 [FlowCoordinator] ⚠️ WARNING: Not on expected page! Current URL: ${currentUrl}`);
      }
      
      // Check for any error dialogs or alerts
      const errorDialog = this.page.locator('[role="dialog"]:has-text("error"), [role="alert"]:has-text("error")').first();
      const hasErrorDialog = await errorDialog.isVisible().catch(() => false);
      if (hasErrorDialog) {
        console.log(`🔍 [FlowCoordinator] ⚠️ ERROR DIALOG DETECTED!`);
        const errorText = await errorDialog.textContent().catch(() => 'Unknown error');
        console.log(`🔍 [FlowCoordinator] Error dialog text: ${errorText}`);
      }
      
      // Check for any loading indicators
      const loadingIndicator = this.page.locator('[class*="loading"], [class*="spinner"], [class*="loader"]').first();
      const isLoading = await loadingIndicator.isVisible().catch(() => false);
      console.log(`🔍 [FlowCoordinator] Loading indicator visible: ${isLoading}`);
      
    } catch (e) {
      console.log(`🔍 [FlowCoordinator] Error checking page state: ${e.message}`);
    }
    
    try {
      // Update form state based on Page 2 selections
      this.formStateManager.updateFromAdditionalDetailsData(additionalDetailsData);
      
      // Debug: Check page state before filling additional details
      try {
        const currentUrl = this.page.url();
        const pageTitle = await this.page.title();
        console.log(`🔍 [FlowCoordinator] Before filling additional details - URL: ${currentUrl}`);
        console.log(`🔍 [FlowCoordinator] Before filling additional details - Title: ${pageTitle}`);
      } catch (e) {
        console.log(`🔍 [FlowCoordinator] Error checking page state before filling: ${e.message}`);
      }
      
      // Fill Additional Details form
      await this.additionalDetailsPage.fillAdditionalDetailsForm(additionalDetailsData);
      
      // Debug: Check page state before clicking Buy Now
      try {
        const currentUrl = this.page.url();
        const pageTitle = await this.page.title();
        console.log(`🔍 [FlowCoordinator] Before Buy Now click - URL: ${currentUrl}`);
        console.log(`🔍 [FlowCoordinator] Before Buy Now click - Title: ${pageTitle}`);
      } catch (e) {
        console.log(`🔍 [FlowCoordinator] Error checking page state before Buy Now: ${e.message}`);
      }
      
      // Click Buy Now to proceed to Proposal Details
      console.log('🔍 [FlowCoordinator] Attempting to click Buy Now...');
      const newPage = await this.additionalDetailsPage.clickBuyNow();
      
      // Update page reference if new window opened
      if (newPage) {
        this.page = newPage;
        this.proposalDetailsPage = new ProposalDetailsPage(newPage);
        console.log('🔍 [FlowCoordinator] ✅ Buy Now opened new page');
      } else {
        console.log('🔍 [FlowCoordinator] ✅ Buy Now navigated in same page');
      }
      
      this.formStateManager.setCurrentStep('proposalDetails');
      console.log('✅ Additional Details & Discounts Form completed successfully');
      
    } catch (error) {
      console.error('❌ Error in Additional Details & Discounts Form:', error.message);
      throw error;
    }
  }

  /**
   * Execute Proposal Details Form
   * @param {Object} proposalDetailsData - Data for Proposal Details
   */
  async executeProposalDetailsForm(proposalDetailsData) {
    console.log('📄 Executing Proposal Details Form');
    
    try {
      // Fill Proposal Details form
      await this.proposalDetailsPage.fillProposalDetailsForm(proposalDetailsData);
      
      this.formStateManager.setCurrentStep('completed');
      console.log('✅ Proposal Details Form completed successfully');
      
    } catch (error) {
      console.error('❌ Error in Proposal Details Form:', error.message);
      throw error;
    }
  }

  /**
   * Execute flow with validation
   * @param {Object} policyVehicleData - Data for Policy & Vehicle Details
   * @param {Object} additionalDetailsData - Data for Additional Details
   * @param {Object} proposalDetailsData - Data for Proposal Details
   * @param {Object} credentials - Login credentials
   */
  async executeFlowWithValidation(policyVehicleData, additionalDetailsData, proposalDetailsData, credentials) {
    // Validate data first
    this.validationManager.validateCompleteFormData(policyVehicleData, additionalDetailsData, proposalDetailsData, credentials);
    
    // Execute the flow
    await this.executeCompleteFlow(policyVehicleData, additionalDetailsData, proposalDetailsData, credentials);
  }

  /**
   * Get current form state
   * @returns {Object} Current form state
   */
  getFormState() {
    return this.formStateManager.getFormState();
  }

  /**
   * Reset form state
   */
  resetFormState() {
    this.formStateManager.resetFormState();
  }

  /**
   * Get page instance for direct access
   * @param {string} pageType - Page type ('policyVehicle', 'additionalDetails', 'proposalDetails')
   * @returns {Object} Page instance
   */
  getPageInstance(pageType) {
    switch (pageType) {
      case 'policyVehicle':
        return this.policyVehiclePage;
      case 'additionalDetails':
        return this.additionalDetailsPage;
      case 'proposalDetails':
        return this.proposalDetailsPage;
      default:
        throw new Error(`Invalid page type: ${pageType}`);
    }
  }

}

module.exports = RenewalFormFlowCoordinator;