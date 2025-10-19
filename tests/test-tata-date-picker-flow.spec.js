const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Test Updated TATA Date Picker Flow with 1992', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🎯 Testing updated TATA date picker flow with 1992...');
  
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
    await page.screenshot({ path: 'test-results/before-tata-flow.png', fullPage: true });
    
    // Test setting 1992 date using the updated TATA date picker flow
    console.log('Setting date to 01/01/1992 using TATA date picker flow...');
    await renewPage._setDateOnInput(dateInput, "01/01/1992");
    
    // Verify the date was set
    const setValue = await dateInput.inputValue();
    console.log(`Date input value: ${setValue}`);
    
    // Take screenshot after
    await page.screenshot({ path: 'test-results/after-tata-flow.png', fullPage: true });
    
    // Test clicking the input to see if the dialog shows the correct date
    console.log('Testing click behavior to verify dialog shows correct date...');
    await dateInput.click();
    await page.waitForTimeout(2000);
    
    const dialog = page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').first();
    const dialogVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (dialogVisible) {
      // Take screenshot of dialog
      await page.screenshot({ path: 'test-results/dialog-with-correct-date.png', fullPage: true });
      
      // Check what date is displayed in the dialog
      const dialogDateText = await dialog.locator('.MuiTypography-subtitle1, .MuiTypography-h6').first().innerText().catch(() => '');
      console.log(`Date displayed in dialog: ${dialogDateText}`);
      
      // Close dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    // Final verification
    const finalValue = await dateInput.inputValue();
    console.log(`Final date input value: ${finalValue}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-tata-flow-result.png', fullPage: true });
    
    // The test passes if the date was set correctly
    expect(finalValue).toBe("01/01/1992");
    console.log('✅ Updated TATA date picker flow test completed successfully');
    
  } catch (error) {
    console.error('❌ Updated TATA date picker flow test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/tata-flow-test-error.png', fullPage: true });
    throw error;
  }
});
