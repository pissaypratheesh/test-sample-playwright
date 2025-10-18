// @ts-check
const { test, expect } = require('@playwright/test');

test('Verify BUY NOW button selector logic', async ({ page }) => {
  // Navigate to a sample page with the quote listing structure
  await page.goto('file://' + require('path').resolve(__dirname, '../rawhtmls/getquotes.html'));
  
  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');
  
  // Log the test starting
  console.log('Starting BUY NOW button selector test...');
  
  // Wait a moment to ensure everything is loaded
  await page.waitForTimeout(1000);
  
  // APPROACH 1: Target the first PolicyListing card's BUY NOW button directly
  let buyNowFound = false;
  try {
    // First, ensure we can see the quote cards
    const policyCard = page.locator('.MuiPaper-root.MuiPaper-outlined.MuiCard-root.PolicyListing').first();
    const isVisible = await policyCard.isVisible().catch(() => false);
    console.log(`Policy card visible: ${isVisible}`);
    
    if (isVisible) {
      // Find the BUY NOW button within the first quote card using the specific structure
      const buyNowButton = policyCard.locator('button.MuiButtonBase-root.MuiButton-root.MuiButton-contained:has-text("BUY NOW")').first();
      
      const buttonVisible = await buyNowButton.isVisible().catch(() => false);
      console.log(`BUY NOW button visible: ${buttonVisible}`);
      
      if (buttonVisible) {
        console.log('Found BUY NOW button in first PolicyListing card');
        buyNowFound = true;
        
        // Get the text of the button for verification
        const buttonText = await buyNowButton.innerText();
        console.log(`Button text: ${buttonText}`);
        
        // Verify the button contains expected text
        expect(buttonText).toContain('BUY NOW');
      }
    }
  } catch (e) {
    console.log('Error with direct PolicyListing approach:', e.message);
  }
  
  // APPROACH 2: Try using the exact CSS path if approach 1 failed
  if (!buyNowFound) {
    try {
      // This targets the specific button structure from getquotes.html
      const specificBuyNow = page.locator('.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.cursor-pointer').first();
      
      const isVisible = await specificBuyNow.isVisible().catch(() => false);
      console.log(`Specific BUY NOW button visible: ${isVisible}`);
      
      if (isVisible) {
        console.log('Found BUY NOW button using specific CSS selector');
        buyNowFound = true;
        
        // Get the text of the button for verification
        const buttonText = await specificBuyNow.innerText();
        console.log(`Button text: ${buttonText}`);
        
        // Verify the button contains expected text
        expect(buttonText).toContain('BUY NOW');
      }
    } catch (e) {
      console.log('Error with specific CSS selector approach:', e.message);
    }
  }
  
  // APPROACH 3: Try common selectors for Buy Now
  if (!buyNowFound) {
    const buyCandidates = [
      page.locator('button:has-text("BUY NOW"):not([disabled])').first(),
      page.getByRole('button', { name: /buy\s*now/i }).first(),
      page.locator('a:has-text("BUY NOW")').first(),
      page.locator('.quotation-buynow-btn').first().locator('xpath=..'),
    ];

    for (const [index, cand] of buyCandidates.entries()) {
      try {
        const isVisible = await cand.isVisible().catch(() => false);
        console.log(`Candidate ${index} visible: ${isVisible}`);
        
        if (isVisible) {
          console.log(`Found BUY NOW button using common selector #${index}`);
          
          // Get the text of the button for verification
          const buttonText = await cand.innerText();
          console.log(`Button text: ${buttonText}`);
          
          // Verify the button contains expected text
          if (buttonText.includes('BUY NOW')) {
            buyNowFound = true;
            break;
          }
        }
      } catch (e) {
        console.log(`Error with common selector #${index}:`, e.message);
      }
    }
  }
  
  // Final verification
  console.log(`BUY NOW button found: ${buyNowFound}`);
  expect(buyNowFound).toBeTruthy();
});
