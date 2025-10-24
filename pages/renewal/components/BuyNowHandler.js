const BaseRenewalPage = require('../BaseRenewalPage');

/**
 * Buy Now Handler
 * Handles Buy Now button clicking with multiple fallback approaches
 */
class BuyNowHandler extends BaseRenewalPage {
  constructor(page) {
    super(page);
  }

  /**
   * Click Buy Now button to proceed to proposal details form
   * @returns {Object} New page object if popup opened
   */
  async clickBuyNow() {
    console.log('🔍 [BuyNowHandler] Starting BUY NOW button click process...');
    
    const waitMs = parseInt(process.env.PLAYWRIGHT_QUOTE_LOAD_TIMEOUT_MS || '180000', 10);
    console.log(`🔍 [BuyNowHandler] Using timeout: ${waitMs}ms`);
    
    // Wait for quotes to load (reduced timeout since we already waited in clickGetQuotes)
    console.log('🔍 [BuyNowHandler] Waiting for quotes to load...');
    await this.page.waitForTimeout(2000); // Wait 2 seconds for quotes to appear
    
    console.log('🔍 [BuyNowHandler] Proceeding to find BUY NOW button...');
    
    // Debug: Check current page state
    try {
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      console.log(`🔍 [BuyNowHandler] Current URL: ${currentUrl}`);
      console.log(`🔍 [BuyNowHandler] Page Title: ${pageTitle}`);
    } catch (e) {
      console.log(`🔍 [BuyNowHandler] Error getting page info: ${e.message}`);
    }
    
    // Debug: Check for various quote-related elements
    console.log('🔍 [BuyNowHandler] Checking for quote-related elements...');
    
    // Check for quote tables/grids
    const quoteGrid = this.page.locator('table:has-text("Quote"), [data-testid="quotes-grid"], [role="grid"]:has-text("Quote")').first();
    const hasQuoteGrid = await quoteGrid.isVisible().catch(() => false);
    console.log(`🔍 [BuyNowHandler] Quote grid visible: ${hasQuoteGrid}`);
    
    // Check for PolicyListing cards
    const policyCards = this.page.locator('.PolicyListing');
    const policyCardCount = await policyCards.count();
    console.log(`🔍 [BuyNowHandler] PolicyListing cards found: ${policyCardCount}`);
    
    // Check for BUY NOW buttons
    const buyNowButtons = this.page.locator('button:has-text("BUY NOW")');
    const buyNowCount = await buyNowButtons.count();
    console.log(`🔍 [BuyNowHandler] BUY NOW buttons found: ${buyNowCount}`);
    
    // Check for any buttons containing "buy" or "BUY"
    const anyBuyButtons = this.page.locator('button:has-text("buy"), button:has-text("BUY")');
    const anyBuyCount = await anyBuyButtons.count();
    console.log(`🔍 [BuyNowHandler] Any BUY buttons found: ${anyBuyCount}`);
    
    // Wait for PolicyListing cards to be visible
    try {
      await this.page.locator('button:has-text("BUY NOW")').first().waitFor({ state: 'visible', timeout: waitMs });
      console.log('🔍 [BuyNowHandler] BUY NOW button is visible');
    } catch (e) {
      console.log(`🔍 [BuyNowHandler] BUY NOW button not found, will try alternative selectors: ${e.message}`);
    }

    console.log('🔍 [BuyNowHandler] Attempting to find and click BUY NOW button...');
    
    // Check if page is still alive
    try {
      await this.page.title();
      console.log('🔍 [BuyNowHandler] Page is still alive, proceeding with BUY NOW click');
    } catch (e) {
      console.log(`🔍 [BuyNowHandler] Page has been closed, cannot proceed with BUY NOW click: ${e.message}`);
      throw new Error('Page has been closed');
    }
    
    let clicked = false;
    let newPage = null;
    
    // Try multiple approaches to click Buy Now
    const approaches = [
      () => this.tryDirectBuyNowClick(),
      () => this.trySpecificCSSBuyNowClick(),
      () => this.tryCommonSelectorsBuyNowClick(),
      () => this.tryFirstCardBuyNowClick(),
      () => this.tryTableRowBuyNowClick(),
      () => this.tryFallbackBuyNowClick()
    ];
    
    for (let i = 0; i < approaches.length; i++) {
      if (clicked) break;
      
      console.log(`🔍 [BuyNowHandler] Trying approach ${i + 1}/${approaches.length}...`);
      
      try {
        const result = await approaches[i]();
        if (result.clicked) {
          clicked = true;
          newPage = result.newPage;
          console.log(`🔍 [BuyNowHandler] ✅ Approach ${i + 1} succeeded!`);
          break;
        } else {
          console.log(`🔍 [BuyNowHandler] ❌ Approach ${i + 1} failed - no button found`);
        }
      } catch (e) {
        console.log(`🔍 [BuyNowHandler] ❌ Approach ${i + 1} failed with error: ${e.message}`);
      }
    }
    
    if (clicked) {
      console.log('🔍 [BuyNowHandler] ✅ Buy Now button clicked successfully');
      return newPage;
    } else {
      console.log('🔍 [BuyNowHandler] ❌ Could not click Buy Now button with any approach');
      
      // Final debug: Take screenshot and log all available buttons
      try {
        console.log('🔍 [BuyNowHandler] Taking debug screenshot...');
        await this.page.screenshot({ path: 'debug-buynow-failed.png', fullPage: true });
        
        // Log all buttons on the page
        const allButtons = this.page.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`🔍 [BuyNowHandler] Total buttons on page: ${buttonCount}`);
        
        for (let i = 0; i < Math.min(buttonCount, 10); i++) {
          try {
            const buttonText = await allButtons.nth(i).textContent();
            const isVisible = await allButtons.nth(i).isVisible();
            console.log(`🔍 [BuyNowHandler] Button ${i}: "${buttonText}" (visible: ${isVisible})`);
          } catch (e) {
            console.log(`🔍 [BuyNowHandler] Button ${i}: Error getting text - ${e.message}`);
          }
        }
      } catch (e) {
        console.log(`🔍 [BuyNowHandler] Error taking debug screenshot: ${e.message}`);
      }
      
      throw new Error('Could not click Buy Now button with any approach');
    }
  }

  /**
   * Try direct Buy Now click approach
   */
  async tryDirectBuyNowClick() {
    console.log('🔍 [BuyNowHandler] Approach 1: Direct BUY NOW click');
    const buyNowButton = this.page.locator('button:has-text("BUY NOW")').first();
    const isVisible = await buyNowButton.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`🔍 [BuyNowHandler] Direct BUY NOW button visible: ${isVisible}`);
    
    if (isVisible) {
      console.log('🔍 [BuyNowHandler] Found BUY NOW button, clicking...');
      await buyNowButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1000);
      
      // Wait for navigation after clicking BUY NOW
      const [newPage] = await Promise.all([
        this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null),
        buyNowButton.click()
      ]);
      
      if (newPage) {
        console.log('🔍 [BuyNowHandler] ✅ BUY NOW opened new window, switching to it...');
        await newPage.waitForLoadState('networkidle');
        return { clicked: true, newPage };
      } else {
        // No popup, might be navigation in same window
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        return { clicked: true, newPage: null };
      }
    }
    console.log('🔍 [BuyNowHandler] Direct BUY NOW button not found');
    return { clicked: false };
  }

  /**
   * Try specific CSS Buy Now click approach
   */
  async trySpecificCSSBuyNowClick() {
    console.log('🔍 [BuyNowHandler] Approach 2: Specific CSS BUY NOW click');
    const specificBuyNow = this.page.locator('.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.cursor-pointer').first();
    
    const isVisible = await specificBuyNow.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`🔍 [BuyNowHandler] Specific CSS BUY NOW button visible: ${isVisible}`);
    
    if (isVisible) {
      console.log('🔍 [BuyNowHandler] Found BUY NOW button using specific CSS selector');
      await specificBuyNow.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1000);
      await specificBuyNow.click();
      return { clicked: true };
    }
    console.log('🔍 [BuyNowHandler] Specific CSS BUY NOW button not found');
    return { clicked: false };
  }

  /**
   * Try common selectors Buy Now click approach
   */
  async tryCommonSelectorsBuyNowClick() {
    console.log('🔍 [BuyNowHandler] Approach 3: Common selectors BUY NOW click');
    const buyCandidates = [
      this.page.locator('button:has-text("BUY NOW"):not([disabled])').first(),
      this.page.getByRole('button', { name: /buy\s*now/i }).first(),
      this.page.locator('a:has-text("BUY NOW")').first(),
      this.page.locator('.quotation-buynow-btn').first().locator('xpath=..'),
    ];

    for (let i = 0; i < buyCandidates.length; i++) {
      const cand = buyCandidates[i];
      const isVisible = await cand.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`🔍 [BuyNowHandler] Common selector ${i + 1} visible: ${isVisible}`);
      
      if (isVisible) {
        try {
          console.log(`🔍 [BuyNowHandler] Found BUY NOW button using common selector ${i + 1}`);
          await cand.scrollIntoViewIfNeeded();
          await cand.waitFor({ state: 'visible', timeout: 5000 });
          await this.page.waitForTimeout(1000);
          await cand.click({ trial: true });
          await cand.click();
          return { clicked: true };
        } catch (e) {
          console.log(`🔍 [BuyNowHandler] Error clicking with common selector ${i + 1}: ${e.message}`);
        }
      }
    }
    console.log('🔍 [BuyNowHandler] No common selector BUY NOW buttons found');
    return { clicked: false };
  }

  /**
   * Try first card Buy Now click approach
   */
  async tryFirstCardBuyNowClick() {
    console.log('🔍 [BuyNowHandler] Approach 4: First card BUY NOW click');
    const firstCard = this.page.locator('.PolicyListing').first();
    const cardVisible = await firstCard.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`🔍 [BuyNowHandler] First PolicyListing card visible: ${cardVisible}`);
    
    if (cardVisible) {
      const firstCardBuy = firstCard.locator('button:has-text("BUY NOW"), [role="button"]:has-text("BUY NOW")').first();
      const buyVisible = await firstCardBuy.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`🔍 [BuyNowHandler] BUY NOW button in first card visible: ${buyVisible}`);
      
      if (buyVisible) {
        console.log('🔍 [BuyNowHandler] Found BUY NOW button in first card');
        await firstCard.scrollIntoViewIfNeeded();
        await firstCardBuy.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await firstCardBuy.click({ trial: true });
        await firstCardBuy.click();
        return { clicked: true };
      }
    }
    console.log('🔍 [BuyNowHandler] No BUY NOW button found in first card');
    return { clicked: false };
  }

  /**
   * Try table row Buy Now click approach
   */
  async tryTableRowBuyNowClick() {
    console.log('🔍 [BuyNowHandler] Approach 5: Table row BUY NOW click');
    const firstRow = this.page.locator('table tbody tr').first();
    const rowVisible = await firstRow.isVisible().catch(() => false);
    console.log(`🔍 [BuyNowHandler] First table row visible: ${rowVisible}`);
    
    if (rowVisible) {
      const rowBuy = firstRow.getByRole('button', { name: /buy\s*now/i }).first();
      const buyVisible = await rowBuy.isVisible({ timeout: 1000 }).catch(() => false);
      console.log(`🔍 [BuyNowHandler] BUY NOW button in table row visible: ${buyVisible}`);
      
      if (buyVisible) {
        console.log('🔍 [BuyNowHandler] Found BUY NOW button in table row');
        await rowBuy.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await rowBuy.click({ trial: true });
        await rowBuy.click();
        return { clicked: true };
      }
    }
    console.log('🔍 [BuyNowHandler] No BUY NOW button found in table row');
    return { clicked: false };
  }

  /**
   * Try fallback Buy Now click approach
   */
  async tryFallbackBuyNowClick() {
    console.log('🔍 [BuyNowHandler] Approach 6: Fallback BUY NOW click');
    const anyBuyNow = this.page.locator('button:has-text("BUY NOW"), [class*="buynow" i]').first();
    const isVisible = await anyBuyNow.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`🔍 [BuyNowHandler] Fallback BUY NOW button visible: ${isVisible}`);
    
    if (isVisible) {
      console.log('🔍 [BuyNowHandler] Found BUY NOW using fallback approach');
      await anyBuyNow.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1000);
      await anyBuyNow.click({ force: true });
      return { clicked: true };
    }
    console.log('🔍 [BuyNowHandler] No fallback BUY NOW button found');
    return { clicked: false };
  }
}

module.exports = BuyNowHandler;
