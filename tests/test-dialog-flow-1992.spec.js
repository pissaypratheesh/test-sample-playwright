const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Test TATA Date Picker Dialog Flow for 1992', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🎯 Testing TATA date picker dialog flow for 1992...');
  
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
    const dateInput = page.locator('input[name="POLICY_EXPIRY_DATE"]').first();
    
    console.log('🎯 Testing OD Policy Expiry Date with 1992...');
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/before-click-1992.png', fullPage: true });
    
    // Click the input to open the date picker
    console.log('Step 1: Clicking date input to open dialog...');
    await dateInput.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'test-results/after-click-1992.png', fullPage: true });
    
    // Check if dialog opened
    const dialog = page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').first();
    const dialogVisible = await dialog.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (dialogVisible) {
      console.log('✅ Date picker dialog opened');
      
      // Take screenshot of the dialog
      await page.screenshot({ path: 'test-results/dialog-opened-1992.png', fullPage: true });
      
      // Check what's displayed in the dialog
      const dialogText = await dialog.innerText().catch(() => '');
      console.log(`Dialog content: ${dialogText.substring(0, 300)}...`);
      
      // Step 2: Click on the month/year header to open year selection
      console.log('Step 2: Looking for month/year header to click...');
      
      // Try different selectors for the month/year header
      const monthYearSelectors = [
        'text=/^(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}$/',
        'button:has-text(/\\d{4}/)',
        '[role="button"]:has-text(/\\d{4}/)',
        '.MuiTypography-subtitle1',
        '.MuiTypography-h6',
        'button[aria-label*="month"]',
        'button[aria-label*="year"]'
      ];
      
      let headerClicked = false;
      for (const selector of monthYearSelectors) {
        const header = dialog.locator(selector).first();
        if (await header.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`Found header with selector: ${selector}`);
          await header.click();
          await page.waitForTimeout(1000);
          headerClicked = true;
          
          // Take screenshot after clicking header
          await page.screenshot({ path: 'test-results/after-header-click-1992.png', fullPage: true });
          break;
        }
      }
      
      if (!headerClicked) {
        console.log('⚠️ Could not find month/year header, trying alternative approach...');
        
        // Try clicking anywhere in the dialog that might trigger year selection
        const clickableElements = dialog.locator('button, [role="button"], .MuiButton-root').all();
        const count = await clickableElements.length;
        console.log(`Found ${count} clickable elements in dialog`);
        
        for (let i = 0; i < Math.min(count, 5); i++) {
          const element = clickableElements[i];
          const text = await element.innerText().catch(() => '');
          console.log(`Element ${i}: "${text}"`);
          
          if (text.match(/\d{4}/) || text.includes('2025') || text.includes('2024')) {
            console.log(`Clicking element ${i} that contains year: "${text}"`);
            await element.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: `test-results/after-element-${i}-click-1992.png`, fullPage: true });
            break;
          }
        }
      }
      
      // Step 3: Look for year 1992 in the year grid
      console.log('Step 3: Looking for year 1992 in year grid...');
      
      const year1992Selectors = [
        'button:has-text("1992")',
        '[role="button"]:has-text("1992")',
        'text=1992',
        '.MuiPickersYear-root:has-text("1992")',
        '[data-testid*="year"]:has-text("1992")'
      ];
      
      let year1992Found = false;
      for (const selector of year1992Selectors) {
        const yearButton = dialog.locator(selector).first();
        if (await yearButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`Found year 1992 with selector: ${selector}`);
          await yearButton.click();
          await page.waitForTimeout(1000);
          year1992Found = true;
          
          // Take screenshot after selecting year
          await page.screenshot({ path: 'test-results/after-year-1992-selected.png', fullPage: true });
          break;
        }
      }
      
      if (!year1992Found) {
        console.log('⚠️ Year 1992 not found, trying to scroll or navigate...');
        
        // Try scrolling up to find older years
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('ArrowUp');
          await page.waitForTimeout(200);
          
          const yearButton = dialog.locator('button:has-text("1992"), text=1992').first();
          if (await yearButton.isVisible({ timeout: 500 }).catch(() => false)) {
            console.log(`Found year 1992 after scrolling ${i} times`);
            await yearButton.click();
            await page.waitForTimeout(1000);
            year1992Found = true;
            break;
          }
        }
      }
      
      // Step 4: Select month (January)
      if (year1992Found) {
        console.log('Step 4: Selecting month January...');
        
        const monthSelectors = [
          'button:has-text("Jan")',
          'button:has-text("January")',
          '[role="button"]:has-text("Jan")',
          'text=Jan'
        ];
        
        for (const selector of monthSelectors) {
          const monthButton = dialog.locator(selector).first();
          if (await monthButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`Found January with selector: ${selector}`);
            await monthButton.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot after selecting month
            await page.screenshot({ path: 'test-results/after-january-selected.png', fullPage: true });
            break;
          }
        }
      }
      
      // Step 5: Select day 1
      if (year1992Found) {
        console.log('Step 5: Selecting day 1...');
        
        const daySelectors = [
          'button:has-text("1")',
          '[role="gridcell"]:has-text("1")',
          'text=1'
        ];
        
        for (const selector of daySelectors) {
          const dayButton = dialog.locator(selector).first();
          if (await dayButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`Found day 1 with selector: ${selector}`);
            await dayButton.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot after selecting day
            await page.screenshot({ path: 'test-results/after-day-1-selected.png', fullPage: true });
            break;
          }
        }
      }
      
      // Check if dialog closed automatically
      await page.waitForTimeout(2000);
      const dialogStillVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (dialogStillVisible) {
        console.log('⚠️ Dialog still open, trying to close it...');
        
        // Try different ways to close the dialog
        const closeMethods = [
          () => page.keyboard.press('Escape'),
          () => page.keyboard.press('Enter'),
          () => dialog.locator('button:has-text("OK"), button:has-text("Done"), button:has-text("Apply")').first().click(),
          () => dialog.locator('button:has-text("Cancel")').first().click()
        ];
        
        for (let i = 0; i < closeMethods.length; i++) {
          try {
            await closeMethods[i]();
            await page.waitForTimeout(1000);
            
            if (!(await dialog.isVisible({ timeout: 1000 }).catch(() => false))) {
              console.log(`✅ Dialog closed with method ${i + 1}`);
              break;
            }
          } catch (e) {
            console.log(`Method ${i + 1} failed: ${e.message}`);
          }
        }
      }
      
    } else {
      console.log('❌ Date picker dialog did not open');
    }
    
    // Final verification
    const finalValue = await dateInput.inputValue();
    console.log(`Final date input value: ${finalValue}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-dialog-test-1992.png', fullPage: true });
    
    if (finalValue === '01/01/1992') {
      console.log('✅ Successfully set 1992 date using dialog flow!');
    } else {
      console.log(`⚠️ Date not set correctly. Expected: 01/01/1992, Got: ${finalValue}`);
    }
    
  } catch (error) {
    console.error('❌ Dialog flow test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/dialog-flow-test-error.png', fullPage: true });
    throw error;
  }
});
