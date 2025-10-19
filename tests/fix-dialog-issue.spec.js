const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Fix: Dialog Issue on TATA Website', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🔧 Testing fix for dialog issue on TATA website...');
  
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
    await page.screenshot({ path: 'test-results/before-fix.png', fullPage: true });
    
    // Test setting 1992 date with our updated method
    console.log('Setting date to 01/01/1992...');
    await renewPage._setDateOnInput(dateInput, "01/01/1992");
    
    // Check if dialog is still open
    const dialog = page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').first();
    const dialogVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    
    console.log(`Dialog visible after setting date: ${dialogVisible}`);
    
    // Verify the date was set
    const setValue = await dateInput.inputValue();
    console.log(`Date input value: ${setValue}`);
    
    // Take screenshot after
    await page.screenshot({ path: 'test-results/after-fix.png', fullPage: true });
    
    // Test clicking the input to see if dialog opens properly
    console.log('Testing click behavior...');
    await dateInput.click();
    await page.waitForTimeout(2000);
    
    const dialogVisibleAfterClick = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    console.log(`Dialog visible after click: ${dialogVisibleAfterClick}`);
    
    if (dialogVisibleAfterClick) {
      // Take screenshot of dialog
      await page.screenshot({ path: 'test-results/dialog-opened.png', fullPage: true });
      
      // Check what year is displayed in the dialog
      const yearText = await dialog.locator('.MuiTypography-subtitle1').innerText().catch(() => '');
      console.log(`Year displayed in dialog: ${yearText}`);
      
      // Close dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    // Final verification
    const finalValue = await dateInput.inputValue();
    console.log(`Final date input value: ${finalValue}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-result.png', fullPage: true });
    
    // The test passes if the date was set correctly
    expect(finalValue).toBe("01/01/1992");
    console.log('✅ Dialog issue fix test completed successfully');
    
  } catch (error) {
    console.error('❌ Dialog issue fix test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/fix-test-error.png', fullPage: true });
    throw error;
  }
});
