const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Debug: TATA Date Picker Dialog Opening', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🔍 Debugging TATA date picker dialog opening...');
  
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
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/before-click-debug.png', fullPage: true });
    
    // Click the input and wait for dialog
    console.log('Clicking date input to open dialog...');
    await dateInput.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'test-results/after-click-debug.png', fullPage: true });
    
    // Check for various dialog selectors
    const dialogSelectors = [
      '[role="dialog"]',
      '.MuiModal-root',
      '.MuiDialog-root',
      '.date-picker',
      '.calendar',
      '.picker-dialog',
      '[data-testid*="dialog"]',
      '[data-testid*="picker"]',
      '[data-testid*="calendar"]'
    ];
    
    let dialogFound = false;
    for (const selector of dialogSelectors) {
      const dialog = page.locator(selector).first();
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`✅ Found dialog with selector: ${selector}`);
        dialogFound = true;
        
        // Take screenshot of the dialog
        await page.screenshot({ path: `test-results/dialog-found-${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png`, fullPage: true });
        
        // Check dialog content
        const dialogText = await dialog.innerText().catch(() => '');
        console.log(`Dialog content: ${dialogText.substring(0, 200)}...`);
        
        break;
      }
    }
    
    if (!dialogFound) {
      console.log('⚠️ No dialog found with any selector');
      
      // Check if there are any overlays or modals
      const overlays = page.locator('.overlay, .modal, .popup, .dropdown').first();
      if (await overlays.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('Found overlay/modal element');
        await page.screenshot({ path: 'test-results/overlay-found.png', fullPage: true });
      }
      
      // Check for any elements that might be date picker related
      const datePickerElements = page.locator('[class*="date"], [class*="picker"], [class*="calendar"], [id*="date"], [id*="picker"], [id*="calendar"]');
      const count = await datePickerElements.count();
      console.log(`Found ${count} potential date picker elements`);
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = datePickerElements.nth(i);
        const isVisible = await element.isVisible().catch(() => false);
        const className = await element.getAttribute('class').catch(() => '');
        const id = await element.getAttribute('id').catch(() => '');
        console.log(`Element ${i}: visible=${isVisible}, class="${className}", id="${id}"`);
      }
    }
    
    // Try different click methods
    console.log('Trying different click methods...');
    
    // Method 1: Double click
    await dateInput.dblclick();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/after-double-click.png', fullPage: true });
    
    // Method 2: Right click
    await dateInput.click({ button: 'right' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/after-right-click.png', fullPage: true });
    
    // Method 3: Focus and press Enter
    await dateInput.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/after-enter-key.png', fullPage: true });
    
    // Method 4: Focus and press Space
    await dateInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/after-space-key.png', fullPage: true });
    
    console.log('✅ Debug test completed');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/debug-test-error.png', fullPage: true });
    throw error;
  }
});
