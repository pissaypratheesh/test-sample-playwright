const RenewPolicyPage = require('../pages/RenewPolicyPage');
const testdata = require('../testdata/renewTatadata.json');
const creds = require('../testdata/Auth.json');
const { test, expect } = require('@playwright/test');

test.describe('Date Picker Debug', () => {
  test('Debug Date Picker - Handle Open Dialog', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    
    try {
      // Navigate to the form
      await renewPolicyPage.navigation.navigateToLoginPage();
      await renewPolicyPage.navigation.login(creds);
      await renewPolicyPage.navigation.navigateToPolicyIssuance();
      await renewPolicyPage.navigation.navigateToRenewalFlow();
      
      // Fill basic policy details first
      await renewPolicyPage.fillPolicyDetails(testdata);
      
      // Take screenshot before any date picker interaction
      await page.screenshot({ path: '.playwright-mcp/before-any-date-picker.png', fullPage: true });
      
      // Check if date picker dialog is already open
      const datePickerDialog = page.locator('dialog[role="dialog"]').filter({ hasText: 'Select date' });
      const isDialogOpen = await datePickerDialog.isVisible();
      console.log('Date picker dialog already open:', isDialogOpen);
      
      if (isDialogOpen) {
        console.log('Date picker dialog is already open, closing it first...');
        // Try to close the dialog by clicking Cancel
        const cancelButton = page.locator('button:has-text("Cancel")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Now try to interact with registration date field
      const registrationDateInput = page.locator('text=Registration Date').locator('..').locator('input').first();
      
      // Check if element exists and is visible
      const isVisible = await registrationDateInput.isVisible();
      console.log('Registration date input visible:', isVisible);
      
      if (isVisible) {
        // Click on the input to open date picker
        await registrationDateInput.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot after clicking
        await page.screenshot({ path: '.playwright-mcp/after-click-date-input.png', fullPage: true });
        
        // Check if date picker opened
        const isDialogOpenAfterClick = await datePickerDialog.isVisible();
        console.log('Date picker dialog open after click:', isDialogOpenAfterClick);
        
        if (isDialogOpenAfterClick) {
          // Try to navigate to the correct year (2025)
          const yearButton = page.locator('button:has-text("calendar view is open, switch to year view")');
          if (await yearButton.isVisible()) {
            await yearButton.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot of year view
            await page.screenshot({ path: '.playwright-mcp/year-view.png', fullPage: true });
            
            // Look for 2025 in year view
            const year2025 = page.locator('button:has-text("2025")');
            if (await year2025.isVisible()) {
              await year2025.click();
              await page.waitForTimeout(1000);
              
              // Take screenshot after year selection
              await page.screenshot({ path: '.playwright-mcp/after-year-selection.png', fullPage: true });
            }
          }
          
          // Try to select October (month 10)
          const monthButton = page.locator('button:has-text("October 2025")');
          if (await monthButton.isVisible()) {
            await monthButton.click();
            await page.waitForTimeout(1000);
          }
          
          // Try to select day 10
          const day10 = page.locator('gridcell:has-text("10")');
          if (await day10.isVisible()) {
            await day10.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot after day selection
            await page.screenshot({ path: '.playwright-mcp/after-day-selection.png', fullPage: true });
          }
        }
      } else {
        console.log('Registration date input not found or not visible');
        await page.screenshot({ path: '.playwright-mcp/date-input-not-found.png', fullPage: true });
      }
      
    } catch (error) {
      console.error('Error in date picker debug:', error.message);
      await page.screenshot({ path: '.playwright-mcp/error-screenshot.png', fullPage: true });
      throw error;
    }
  });
});
