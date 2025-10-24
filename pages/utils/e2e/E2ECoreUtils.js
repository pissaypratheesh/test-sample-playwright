const FormUtils = require('../forms/FormUtils');
const NavigationUtils = require('../navigation/NavigationUtils');

/**
 * E2E Core Utilities - Main flow functions for complete E2E flows
 * Extends FormUtils for common form interactions
 */
class E2ECoreUtils extends FormUtils {
  constructor(page) {
    super(page);
    this.navigation = new NavigationUtils(page);
  }

  /**
   * Complete login and navigation flow
   * @param {Object} creds - Credentials object
   * @param {string} flowType - Type of flow ('renewal' or 'new')
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async loginAndNavigate(creds, flowType = 'renewal', takeScreenshot = true) {
    console.log('📋 Step: Login and Navigation');
    
    try {
      // Navigate to login page
      await this.navigation.navigateToLoginPage();
      
      // Login with credentials
      await this.navigation.login(creds);
      
      // Navigate to policy issuance
      await this.navigation.navigateToPolicyIssuance();
      
      // Navigate to specific flow
      if (flowType === 'renewal') {
        await this.navigation.navigateToRenewalFlow();
      } else if (flowType === 'new') {
        await this.navigation.navigateToNewPolicyFlow();
      }
      
      // Wait for page to be fully loaded
      await this.page.waitForLoadState('networkidle');
      
      if (takeScreenshot) {
        await this.takeFormScreenshot('login-navigation-complete.png');
      }
      
      console.log('✅ Login and Navigation Complete');
    } catch (error) {
      console.error('❌ Error in login and navigation:', error.message);
      throw error;
    }
  }

  /**
   * Fill customer details section
   * @param {Object} testdata - Test data object
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async fillCustomerDetails(testdata, takeScreenshot = true) {
    console.log('📋 Step: Filling Customer Details');
    
    try {
      // Wait for customer details section to be ready
      await this.page.waitForSelector('input[name="ChassisNo"]', { timeout: 30000 });
      
      // Fill chassis number
      await this.safeFill(
        this.page.locator('input[name="ChassisNo"]'),
        testdata.chassisNo
      );

      // Fill engine number
      await this.safeFill(
        this.page.locator('input[name="EngineNo"]'),
        testdata.engineNo
      );

      // Note: RegNo and RegDate fields don't exist on this page
      // They are handled elsewhere in the form flow

      // Wait for form to process
      await this.page.waitForTimeout(2000);
      
      if (takeScreenshot) {
        await this.takeFormScreenshot('customer-details-filled.png');
      }
      
      console.log('✅ Customer Details Filled');
    } catch (error) {
      console.error('❌ Error filling customer details:', error.message);
      throw error;
    }
  }

  /**
   * Fill vehicle details section
   * @param {Object} testdata - Test data object
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async fillVehicleDetails(testdata, takeScreenshot = true) {
    console.log('📋 Step: Filling Vehicle Details');
    
    try {
      // Fill vehicle make (dropdown)
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-MakeId'),
        testdata.make
      );

      // Wait for model dropdown to populate
      await this.page.waitForTimeout(2000);

      // Fill vehicle model (dropdown)
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-ModelId'),
        testdata.model
      );

      // Wait for variant dropdown to populate
      await this.page.waitForTimeout(2000);

      // Fill vehicle variant (dropdown)
      await this.selectDropdownOption(
        this.page.locator('#mui-component-select-VariantId'),
        testdata.variant
      );

      // Wait for vehicle fetch to complete
      await this.page.waitForTimeout(3000);
      
      if (takeScreenshot) {
        await this.takeFormScreenshot('vehicle-details-filled.png');
      }
      
      console.log('✅ Vehicle Details Filled');
    } catch (error) {
      console.error('❌ Error filling vehicle details:', error.message);
      throw error;
    }
  }

  /**
   * Get quotes after filling form
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async getQuotes(takeScreenshot = true) {
    console.log('📋 Step: Getting Quotes');
    
    try {
      // Wait for quotes button to be ready
      await this.page.waitForSelector('button:has-text("Get Quotes")', { timeout: 30000 });
      
      // Click Get Quotes button
      await this.clickButton('Get Quotes');
      
      // Wait longer for quotes to load
      await this.page.waitForTimeout(5000);
      
      if (takeScreenshot) {
        await this.takeFormScreenshot('quotes-loaded.png');
      }
      
      console.log('✅ Quotes Generated');
    } catch (error) {
      console.error('❌ Error getting quotes:', error.message);
      throw error;
    }
  }

  /**
   * Click BUY NOW button and handle popup
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   * @returns {Object} - The page object (original or new popup page)
   */
  async clickBuyNow(takeScreenshot = true) {
    console.log('📋 Step: Clicking BUY NOW');
    
    try {
      // Wait for BUY NOW button to be available
      await this.page.waitForSelector('button:has-text("BUY NOW")', { timeout: 30000 });
      
      const buyNowSelectors = [
        'button:has-text("BUY NOW")',
        'a:has-text("BUY NOW")',
        '.quotation-buynow-btn',
        '[data-testid="buy-now"]'
      ];

      let buyNowButton = null;
      for (const selector of buyNowSelectors) {
        try {
          buyNowButton = this.page.locator(selector).first();
          if (await buyNowButton.isVisible({ timeout: 5000 })) {
            console.log(`Found BUY NOW button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!buyNowButton || !(await buyNowButton.isVisible().catch(() => false))) {
        throw new Error('BUY NOW button not found');
      }

      // Handle potential popup
      const [newPage] = await Promise.all([
        this.page.waitForEvent('popup', { timeout: 15000 }).catch(() => null),
        buyNowButton.click()
      ]);

      if (newPage) {
        console.log('BUY NOW opened new window, switching to it...');
        await newPage.waitForLoadState('networkidle');
        await newPage.waitForTimeout(3000); // Additional wait for page to stabilize
        
        if (takeScreenshot) {
          await newPage.screenshot({ path: '.playwright-mcp/proposal-details-page.png', fullPage: true });
        }
        
        // Update the page reference to the new page
        this.page = newPage;
        console.log('✅ BUY NOW Clicked - Switched to new page');
        return newPage;
      } else {
        await this.page.waitForTimeout(3000);
        
        if (takeScreenshot) {
          await this.page.screenshot({ path: '.playwright-mcp/proposal-details-page.png', fullPage: true });
        }
        
        console.log('✅ BUY NOW Clicked - Same page');
        return this.page;
      }
    } catch (error) {
      console.error('❌ Error clicking BUY NOW:', error.message);
      throw error;
    }
  }

  /**
   * Click proposal preview button
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async clickProposalPreview(takeScreenshot = true) {
    console.log('📋 Step: Clicking Proposal Preview');
    
    try {
      // Look for Proposal Preview button
      const previewSelectors = [
        'button:has-text("Proposal Preview")',
        'button:has-text("PROPOSAL PREVIEW")',
        'button[type="submit"]',
        '.css-1wtvbz6' // Specific class from HTML
      ];

      let previewButton = null;
      for (const selector of previewSelectors) {
        try {
          previewButton = this.page.locator(selector).first();
          if (await previewButton.isVisible({ timeout: 5000 })) {
            console.log(`Found Proposal Preview button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (previewButton && await previewButton.isVisible().catch(() => false)) {
        await previewButton.click();
        console.log('✅ Proposal Preview button clicked');
        
        // Wait for preview to load
        await this.page.waitForTimeout(3000);
        
        if (takeScreenshot) {
          await this.page.screenshot({ path: '.playwright-mcp/after-proposal-preview.png', fullPage: true });
        }
        
        console.log('✅ Proposal Preview Opened');
      } else {
        console.log('⚠️ Proposal Preview button not found, but form filling completed');
      }
    } catch (error) {
      console.error('❌ Error clicking proposal preview:', error.message);
      throw error;
    }
  }

  /**
   * Take form screenshot with timestamp
   * @param {string} filename - Screenshot filename
   */
  async takeFormScreenshot(filename) {
    try {
      await this.page.screenshot({ 
        path: `.playwright-mcp/${filename}`, 
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.log(`⚠️ Could not take screenshot: ${error.message}`);
    }
  }
}

module.exports = E2ECoreUtils;

