const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Test All Date Fields with 1992 Dates', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🎯 Testing all date fields with 1992 dates...');
  
  try {
    // Load credentials and test data
    const credentials = require('../testdata/Auth.json');
    const testData = require('../testdata/proposalDetails.json');
    
    console.log('📋 Test data loaded with 1992 dates:');
    console.log(`   OD Policy Expiry Date: ${testData.odPolicyExpiryDate}`);
    console.log(`   TP Policy Expiry Date: ${testData.tpPolicyExpiryDate}`);
    console.log(`   Invoice Date: ${testData.invoiceDate}`);
    console.log(`   Registration Date: ${testData.registrationDate}`);
    console.log(`   Date of Birth: ${testData.personalDetails.dateOfBirth}`);
    
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
    
    // Test all date fields with 1992 dates
    const dateFields = [
      { name: 'POLICY_EXPIRY_DATE', expected: testData.odPolicyExpiryDate, description: 'OD Policy Expiry Date (1992)' },
      { name: 'POLICY_EXPIRY_DATE', expected: testData.tpPolicyExpiryDate, description: 'TP Policy Expiry Date (1992)', index: 1 },
      { name: 'InvoiceDate', expected: testData.invoiceDate, description: 'Invoice Date (1992)' },
      { name: 'RegistrationDate', expected: testData.registrationDate, description: 'Registration Date (1992)' }
    ];
    
    let successCount = 0;
    let totalCount = dateFields.length;
    
    for (const field of dateFields) {
      console.log(`\n🎯 Testing ${field.description}...`);
      
      let input;
      if (field.index !== undefined) {
        input = page.locator(`input[name="${field.name}"]`).nth(field.index);
      } else {
        input = page.locator(`input[name="${field.name}"]`).first();
      }
      
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`   Setting ${field.description} to ${field.expected}...`);
        
        // Take screenshot before
        await page.screenshot({ path: `test-results/before-${field.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`, fullPage: true });
        
        await renewPage._setDateOnInput(input, field.expected);
        
        const actualValue = await input.inputValue();
        console.log(`   Result: ${actualValue}`);
        
        // Take screenshot after
        await page.screenshot({ path: `test-results/after-${field.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`, fullPage: true });
        
        if (actualValue === field.expected) {
          console.log(`   ✅ ${field.description} set successfully`);
          successCount++;
        } else {
          console.log(`   ❌ ${field.description} failed - Expected: ${field.expected}, Got: ${actualValue}`);
          
          // Test clicking to see if dialog opens
          console.log(`   Testing click behavior for ${field.description}...`);
          await input.click();
          await page.waitForTimeout(2000);
          
          const dialog = page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').first();
          const dialogVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
          console.log(`   Dialog opened: ${dialogVisible}`);
          
          if (dialogVisible) {
            await page.screenshot({ path: `test-results/dialog-${field.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`, fullPage: true });
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
          }
        }
      } else {
        console.log(`   ⚠️ ${field.description} input not found`);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-1992-test.png', fullPage: true });
    
    console.log(`\n📊 Test Results: ${successCount}/${totalCount} date fields set successfully`);
    
    if (successCount === totalCount) {
      console.log('✅ All 1992 date fields set successfully!');
    } else {
      console.log(`⚠️ ${totalCount - successCount} date fields failed to set 1992 dates`);
    }
    
  } catch (error) {
    console.error('❌ 1992 date fields test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/1992-test-error.png', fullPage: true });
    throw error;
  }
});
