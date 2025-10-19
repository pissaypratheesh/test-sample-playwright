const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Debug: Actual TATA Website Date Picker Issue', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🔍 Debugging actual TATA website date picker issue...');
  
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
    
    // Find all date inputs
    const dateInputs = page.locator('input[placeholder*="DD/MM/YYYY"], input[name*="DATE"], input[name*="date"]');
    const dateInputCount = await dateInputs.count();
    
    console.log(`📅 Found ${dateInputCount} date input fields`);
    
    if (dateInputCount > 0) {
      // Test each date input
      for (let i = 0; i < dateInputCount; i++) {
        const dateInput = dateInputs.nth(i);
        const inputName = await dateInput.getAttribute('name') || `input-${i}`;
        const currentValue = await dateInput.inputValue();
        const isReadonly = await dateInput.getAttribute('readonly');
        const isDisabled = await dateInput.isDisabled();
        
        console.log(`\n🎯 Testing date input ${i + 1}:`);
        console.log(`   Name: ${inputName}`);
        console.log(`   Current value: ${currentValue}`);
        console.log(`   Readonly: ${isReadonly}`);
        console.log(`   Disabled: ${isDisabled}`);
        
        // Take screenshot before
        await page.screenshot({ path: `test-results/debug-before-${i}.png`, fullPage: true });
        
        // Test setting 1992 date
        console.log(`   Setting date to 01/01/1992...`);
        await renewPage._setDateOnInput(dateInput, "01/01/1992");
        
        // Check result
        const newValue = await dateInput.inputValue();
        console.log(`   New value: ${newValue}`);
        
        // Take screenshot after
        await page.screenshot({ path: `test-results/debug-after-${i}.png`, fullPage: true });
        
        // Test clicking the input to see what happens
        console.log(`   Testing click behavior...`);
        await dateInput.click();
        await page.waitForTimeout(2000);
        
        // Check if dialog opened
        const dialog = page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').first();
        const dialogVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
        console.log(`   Dialog opened: ${dialogVisible}`);
        
        if (dialogVisible) {
          // Take screenshot of dialog
          await page.screenshot({ path: `test-results/debug-dialog-${i}.png`, fullPage: true });
          
          // Try to close dialog
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
        
        console.log(`   ✅ Completed testing input ${i + 1}`);
      }
    } else {
      console.log('⚠️ No date input fields found on current page');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/debug-final.png', fullPage: true });
    console.log('📸 Debug screenshots saved');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/debug-error.png', fullPage: true });
    throw error;
  }
});
