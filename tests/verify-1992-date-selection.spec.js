const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');
const testdata = require('../testdata/Auth.json');

test('Verify 1992 Date Selection and Dialog Status', async ({ page }) => {
  const renewPage = new RenewPolicyPage(page);
  
  console.log('🔍 Verifying 1992 date selection and dialog status...');
  
  // Navigate to TATA website
  await page.goto('https://uatlifekaplan.tmibasl.in/');
  console.log('🌐 Navigated to TATA website');
  
  // Login
  await page.getByRole('textbox', { name: 'Enter User Name' }).fill(testdata.username);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(testdata.password);
  await page.getByRole('button', { name: /login/i }).click();
  console.log('🔐 Logged in successfully');
  await page.waitForTimeout(2000);
  
  // Navigate to Policy Issuance
  await page.getByRole('button', { name: /menu/i }).click();
  await page.getByText('Policy Centre').click();
  await page.getByText(/^Policy$/).click();
  await page.getByText('Policy Issuance').click();
  await page.getByRole('button', { name: /renew/i }).click();
  await page.getByRole('button', { name: /NON TMIBASL POLICY/i }).click();
  console.log('📄 Navigated to Policy Issuance form');
  await page.waitForTimeout(3000);
  
  // Test Registration Date
  console.log('🎯 Testing Registration Date...');
  const registrationDateInput = page.locator('input[name="RegistrationDate"]').first();
  
  // Take screenshot before setting date
  await page.screenshot({ path: 'before-setting-date.png' });
  
  // Set the date
  await renewPage._setDateOnInput(registrationDateInput, '01/01/1992');
  await page.waitForTimeout(2000);
  
  // Check the actual value
  const actualValue = await registrationDateInput.inputValue().catch(() => '');
  console.log(`📅 Registration Date actual value: "${actualValue}"`);
  
  // Check if dialog is still open
  const dialog = page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').first();
  const isDialogOpen = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
  console.log(`🔍 Dialog still open: ${isDialogOpen}`);
  
  // Take screenshot after setting date
  await page.screenshot({ path: 'after-setting-date.png' });
  
  // Try to click the input to see what happens
  console.log('🖱️ Clicking the date input to check behavior...');
  try {
    await registrationDateInput.click();
    await page.waitForTimeout(1000);
    
    const isDialogOpenAfterClick = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    console.log(`🔍 Dialog open after click: ${isDialogOpenAfterClick}`);
    
    const valueAfterClick = await registrationDateInput.inputValue().catch(() => '');
    console.log(`📅 Value after click: "${valueAfterClick}"`);
    
    // Take screenshot after click
    await page.screenshot({ path: 'after-clicking-date.png' });
    
  } catch (e) {
    console.log('❌ Error clicking date input:', e.message);
  }
  
  // Test if we can interact with other elements
  console.log('🧪 Testing interaction with other elements...');
  try {
    const makeDropdown = page.locator('#mui-component-select-MakeId').first();
    if (await makeDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Make dropdown is visible');
      
      // Try to click it
      await makeDropdown.click();
      console.log('✅ Successfully clicked Make dropdown');
      
      // Take screenshot after clicking dropdown
      await page.screenshot({ path: 'after-clicking-dropdown.png' });
      
    } else {
      console.log('❌ Make dropdown not visible');
    }
  } catch (e) {
    console.log('❌ Error interacting with Make dropdown:', e.message);
    await page.screenshot({ path: 'error-dropdown-interaction.png' });
  }
  
  console.log('🎉 Verification test completed');
});
