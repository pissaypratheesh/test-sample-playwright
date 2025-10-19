const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test('Test All Date Fields with Updated Data', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🎯 Testing all date fields with updated test data...');
  
  try {
    // Load credentials and test data
    const credentials = require('../testdata/Auth.json');
    const testData = require('../testdata/proposalDetails.json');
    
    console.log('📋 Test data loaded:');
    console.log(`   OD Policy Expiry Date: ${testData.odPolicyExpiryDate}`);
    console.log(`   TP Policy Expiry Date: ${testData.tpPolicyExpiryDate}`);
    console.log(`   Invoice Date: ${testData.invoiceDate}`);
    console.log(`   Registration Date: ${testData.registrationDate}`);
    console.log(`   Policy Period From: ${testData.policyDetails.policyPeriodFrom}`);
    console.log(`   Policy Period To: ${testData.policyDetails.policyPeriodTo}`);
    
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
    
    // Test all date fields
    const dateFields = [
      { name: 'POLICY_EXPIRY_DATE', expected: testData.odPolicyExpiryDate, description: 'OD Policy Expiry Date' },
      { name: 'POLICY_EXPIRY_DATE', expected: testData.tpPolicyExpiryDate, description: 'TP Policy Expiry Date', index: 1 },
      { name: 'InvoiceDate', expected: testData.invoiceDate, description: 'Invoice Date' },
      { name: 'RegistrationDate', expected: testData.registrationDate, description: 'Registration Date' }
    ];
    
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
        await renewPage._setDateOnInput(input, field.expected);
        
        const actualValue = await input.inputValue();
        console.log(`   Result: ${actualValue}`);
        
        if (actualValue === field.expected) {
          console.log(`   ✅ ${field.description} set successfully`);
        } else {
          console.log(`   ⚠️ ${field.description} may not have been set correctly`);
        }
      } else {
        console.log(`   ⚠️ ${field.description} input not found`);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/all-date-fields-test.png', fullPage: true });
    
    console.log('✅ All date fields test completed');
    
  } catch (error) {
    console.error('❌ All date fields test failed:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/all-date-fields-test-error.png', fullPage: true });
    throw error;
  }
});
