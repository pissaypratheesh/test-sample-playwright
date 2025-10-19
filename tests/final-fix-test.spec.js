const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Final Fix: Avoid Clicking Input to Maintain Date', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🔧 Testing final fix: avoiding input clicks to maintain date...');
  
  try {
    // Load credentials
    const credentials = require('../testdata/Auth.json');
    
    // Navigate to TATA website
    await page.goto('https://uatlifekaplan.tmibasl.in/');
    console.log('🌐 Navigated to TATA website');
    
    // Login
    await page.getByRole('textbox', { name: 'Enter User Name' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(credentials.password);
    await page.getByRole('button', { name: /login/i }).click();
    console.log('🔐 Logged in successfully');
    
    // Navigate to Policy Issuance
    await page.getByRole('button', { name: /menu/i }).click();
    await page.getByText('Policy Centre').click();
    await page.getByText(/^Policy$/).click();
    await page.getByText('Policy Issuance').click();
    await page.getByRole('button', { name: /renew/i }).click();
    await page.getByRole('button', { name: /NON TMIBASL POLICY/i }).click();
    console.log('📄 Navigated to Policy Issuance form');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Find the first date input
    const dateInput = page.locator('input[placeholder*="DD/MM/YYYY"]').first();
    const inputName = await dateInput.getAttribute('name') || 'unknown';
    
    console.log(`🎯 Testing date input: ${inputName}`);
    
    // Take screenshot before
    await page.screenshot({ path: 'test-results/before-final-fix.png', fullPage: true });
    
    // Test setting 1992 date with our updated method
    console.log('Setting date to 01/01/1992...');
    await renewPage._setDateOnInput(dateInput, "01/01/1992");
    
    // Verify the date was set
    const setValue = await dateInput.inputValue();
    console.log(`Date input value: ${setValue}`);
    
    // Wait and check persistence without clicking
    await page.waitForTimeout(3000);
    const persistedValue = await dateInput.inputValue();
    console.log(`Date input value after 3 seconds: ${persistedValue}`);
    
    // Take screenshot after
    await page.screenshot({ path: 'test-results/after-final-fix.png', fullPage: true });
    
    // Test scrolling to see if it affects the date
    console.log('Testing scroll behavior...');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    const scrollValue = await dateInput.inputValue();
    console.log(`Date input value after scroll: ${scrollValue}`);
    
    // Test tab navigation to see if it affects the date
    console.log('Testing tab navigation...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
    
    const tabValue = await dateInput.inputValue();
    console.log(`Date input value after tab: ${tabValue}`);
    
    // Final verification
    const finalValue = await dateInput.inputValue();
    console.log(`Final date input value: ${finalValue}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-result.png', fullPage: true });
    
    // The test passes if the date was set correctly and persisted
    expect(finalValue).toBe("01/01/1992");
    console.log('✅ Final fix test completed successfully');
    
  } catch (error) {
    console.error('❌ Final fix test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/final-fix-test-error.png', fullPage: true });
    throw error;
  }
});
