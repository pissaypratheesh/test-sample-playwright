const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Debug: Find How to Open TATA Date Picker', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🔍 Debugging how to open TATA date picker...');
  
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
    
    console.log('🎯 Analyzing date input element...');
    
    // Get detailed information about the input
    const inputInfo = await dateInput.evaluate((el) => ({
      tagName: el.tagName,
      type: el.type,
      name: el.name,
      id: el.id,
      className: el.className,
      placeholder: el.placeholder,
      value: el.value,
      readOnly: el.readOnly,
      disabled: el.disabled,
      autocomplete: el.autocomplete,
      'data-testid': el.getAttribute('data-testid'),
      'aria-label': el.getAttribute('aria-label'),
      'aria-describedby': el.getAttribute('aria-describedby'),
      onclick: el.onclick ? 'has onclick' : 'no onclick',
      onfocus: el.onfocus ? 'has onfocus' : 'no onfocus',
      onchange: el.onchange ? 'has onchange' : 'no onchange'
    }));
    
    console.log('Input element info:', JSON.stringify(inputInfo, null, 2));
    
    // Take screenshot before any interaction
    await page.screenshot({ path: 'test-results/debug-initial-state.png', fullPage: true });
    
    // Try different ways to trigger the date picker
    const triggerMethods = [
      {
        name: 'Single Click',
        action: async () => {
          await dateInput.click();
          await page.waitForTimeout(2000);
        }
      },
      {
        name: 'Double Click',
        action: async () => {
          await dateInput.dblclick();
          await page.waitForTimeout(2000);
        }
      },
      {
        name: 'Focus + Click',
        action: async () => {
          await dateInput.focus();
          await page.waitForTimeout(500);
          await dateInput.click();
          await page.waitForTimeout(2000);
        }
      },
      {
        name: 'Focus + Enter',
        action: async () => {
          await dateInput.focus();
          await page.waitForTimeout(500);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(2000);
        }
      },
      {
        name: 'Focus + Space',
        action: async () => {
          await dateInput.focus();
          await page.waitForTimeout(500);
          await page.keyboard.press('Space');
          await page.waitForTimeout(2000);
        }
      },
      {
        name: 'Focus + Arrow Down',
        action: async () => {
          await dateInput.focus();
          await page.waitForTimeout(500);
          await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(2000);
        }
      },
      {
        name: 'Right Click',
        action: async () => {
          await dateInput.click({ button: 'right' });
          await page.waitForTimeout(2000);
        }
      }
    ];
    
    for (const method of triggerMethods) {
      console.log(`\n🔍 Trying method: ${method.name}`);
      
      try {
        await method.action();
        
        // Check for any dialogs or overlays
        const dialogSelectors = [
          '[role="dialog"]',
          '.MuiModal-root',
          '.MuiDialog-root',
          '.date-picker',
          '.calendar',
          '.picker-dialog',
          '[data-testid*="dialog"]',
          '[data-testid*="picker"]',
          '[data-testid*="calendar"]',
          '.overlay',
          '.modal',
          '.popup',
          '.dropdown'
        ];
        
        let dialogFound = false;
        for (const selector of dialogSelectors) {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`✅ Found element with selector: ${selector}`);
            dialogFound = true;
            
            // Take screenshot
            await page.screenshot({ path: `test-results/debug-${method.name.replace(/[^a-zA-Z0-9]/g, '_')}-dialog.png`, fullPage: true });
            
            // Get element info
            const elementInfo = await element.evaluate((el) => ({
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              innerText: el.innerText.substring(0, 200),
              'data-testid': el.getAttribute('data-testid'),
              'aria-label': el.getAttribute('aria-label')
            }));
            
            console.log(`Element info:`, JSON.stringify(elementInfo, null, 2));
            
            // Try to close the dialog
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
            break;
          }
        }
        
        if (!dialogFound) {
          console.log(`❌ No dialog found with method: ${method.name}`);
        }
        
      } catch (error) {
        console.log(`❌ Method ${method.name} failed: ${error.message}`);
      }
    }
    
    // Check if there are any date picker related elements on the page
    console.log('\n🔍 Looking for date picker related elements on the page...');
    
    const datePickerElements = page.locator('[class*="date"], [class*="picker"], [class*="calendar"], [id*="date"], [id*="picker"], [id*="calendar"]');
    const count = await datePickerElements.count();
    console.log(`Found ${count} potential date picker elements`);
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = datePickerElements.nth(i);
      const isVisible = await element.isVisible().catch(() => false);
      const className = await element.getAttribute('class').catch(() => '');
      const id = await element.getAttribute('id').catch(() => '');
      const tagName = await element.evaluate(el => el.tagName).catch(() => '');
      console.log(`Element ${i}: ${tagName}, visible=${isVisible}, class="${className}", id="${id}"`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/debug-final-state.png', fullPage: true });
    
    console.log('✅ Debug test completed');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/debug-error.png', fullPage: true });
    throw error;
  }
});
