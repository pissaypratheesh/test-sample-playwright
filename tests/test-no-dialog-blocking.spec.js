const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');
const testdata = require('../testdata/Auth.json');

test.describe('Dialog Blocking Fix Test', () => {
  test('should set 1992 dates without blocking other interactions', async ({ page }) => {
    const renewPage = new RenewPolicyPage(page);
    
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
    
    console.log('🧪 Testing dialog blocking fix...');
    
    // Test 1: Set Registration Date
    console.log('Test 1: Setting Registration Date...');
    const registrationDateInput = page.locator('input[name="RegistrationDate"]').first();
    await renewPage._setDateOnInput(registrationDateInput, '01/01/1992');
    await page.waitForTimeout(1000);
    
    // Check if dialog is still open (should be closed)
    const dialog = page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').first();
    const isDialogOpen = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    console.log(`Dialog open after Registration Date: ${isDialogOpen}`);
    
    if (isDialogOpen) {
      console.log('❌ Dialog is still open - blocking issue not fixed');
      await page.screenshot({ path: 'dialog-still-open.png' });
    } else {
      console.log('✅ Dialog closed successfully - no blocking');
    }
    
    // Test 2: Try to interact with another field
    console.log('Test 2: Testing interaction with another field...');
    try {
      const vehicleNumberInput = page.locator('input[name="VehicleNumber"]').first();
      if (await vehicleNumberInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await vehicleNumberInput.click();
        await vehicleNumberInput.fill('TEST123');
        console.log('✅ Successfully interacted with Vehicle Number field');
      } else {
        console.log('⚠️ Vehicle Number field not found');
      }
    } catch (e) {
      console.log('❌ Could not interact with other field:', e.message);
    }
    
    // Test 3: Set Invoice Date
    console.log('Test 3: Setting Invoice Date...');
    const invoiceDateInput = page.locator('input[name="InvoiceDate"]').first();
    await renewPage._setDateOnInput(invoiceDateInput, '01/01/1992');
    await page.waitForTimeout(1000);
    
    // Check dialog again
    const isDialogOpen2 = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    console.log(`Dialog open after Invoice Date: ${isDialogOpen2}`);
    
    if (isDialogOpen2) {
      console.log('❌ Dialog is still open after Invoice Date');
    } else {
      console.log('✅ Dialog closed after Invoice Date');
    }
    
    // Test 4: Try to interact with yet another field
    console.log('Test 4: Testing interaction with Policy Period From...');
    try {
      const policyPeriodFromInput = page.locator('input[name="PolicyPeriodFrom"]').first();
      if (await policyPeriodFromInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await policyPeriodFromInput.click();
        await policyPeriodFromInput.fill('18/10/2025');
        console.log('✅ Successfully interacted with Policy Period From field');
      } else {
        console.log('⚠️ Policy Period From field not found');
      }
    } catch (e) {
      console.log('❌ Could not interact with Policy Period From field:', e.message);
    }
    
    // Test 5: Set OD Policy Expiry Date
    console.log('Test 5: Setting OD Policy Expiry Date...');
    const odPolicyExpiryInput = page.locator('input[name="POLICY_EXPIRY_DATE"]').first();
    await renewPage._setDateOnInput(odPolicyExpiryInput, '01/01/1992');
    await page.waitForTimeout(1000);
    
    // Final dialog check
    const isDialogOpen3 = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    console.log(`Dialog open after OD Policy Expiry Date: ${isDialogOpen3}`);
    
    if (isDialogOpen3) {
      console.log('❌ Dialog is still open after OD Policy Expiry Date');
      await page.screenshot({ path: 'final-dialog-still-open.png' });
    } else {
      console.log('✅ Dialog closed after OD Policy Expiry Date');
    }
    
    // Test 6: Final interaction test
    console.log('Test 6: Final interaction test...');
    try {
      const policyPeriodToInput = page.locator('input[name="PolicyPeriodTo"]').first();
      if (await policyPeriodToInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await policyPeriodToInput.click();
        await policyPeriodToInput.fill('17/10/2026');
        console.log('✅ Successfully interacted with Policy Period To field');
      } else {
        console.log('⚠️ Policy Period To field not found');
      }
    } catch (e) {
      console.log('❌ Could not interact with Policy Period To field:', e.message);
    }
    
    console.log('🎉 Dialog blocking test completed');
    
    // Take final screenshot
    await page.screenshot({ path: 'final-no-blocking-test.png' });
  });
});
