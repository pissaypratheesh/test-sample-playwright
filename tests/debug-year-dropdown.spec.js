const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy.js');
const testData = require('../testdata/renewTatadata.json');
const authData = require('../testdata/Auth.json');

test.describe('Debug Tests', () => {
  test('Debug Year of Manufacturing Dropdown', async ({ page }) => {
    const renewPage = new RenewPolicyPage(page);
    
    // Login first
    await page.goto('https://uatlifekaplan.tmibasl.in/TMIBASLAPP/#/login');
    await page.locator('input[name="username"]').fill(authData.username);
    await page.locator('input[name="password"]').fill(authData.password);
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/#/createPolicy');
    
    // Switch to Renew tab
    await page.getByRole('button', { name: /renew/i }).click();
    await page.waitForTimeout(1000);
    
    // Fill basic fields to get to vehicle details
    await page.locator('input[name="PREV_POLICY_NO"]').fill(testData.prevPolicyNo);
    await page.waitForTimeout(1000);
    
    // Try to select Year of Manufacturing
    console.log('Testing Year of Manufacturing dropdown...');
    try {
      await renewPage._selectMuiOption('#mui-component-select-DateofManufacture', testData.year);
      console.log('✅ Year of Manufacturing selected successfully!');
    } catch (error) {
      console.log('❌ Error selecting Year of Manufacturing:', error.message);
    }
    
    // Wait to see the result
    await page.waitForTimeout(3000);
  });
});
