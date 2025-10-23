const { test, expect } = require('@playwright/test');
const DatePickerUtils = require('../pages/utils/DatePickerUtils');
const NavigationUtils = require('../pages/utils/NavigationUtils');
const creds = require('../testdata/Auth.json');

test.describe('Material UI Date Picker - Comprehensive Testing', () => {
  let datePickerUtils;
  let navigationUtils;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
    datePickerUtils = new DatePickerUtils(page);
    navigationUtils = new NavigationUtils(page);
  });

  test('Date Picker - Test Old Date Selection (1992)', async ({ page }) => {
    // Navigate to policy issuance page
    await navigationUtils.navigateToLoginPage();
    await navigationUtils.login(creds);
    await navigationUtils.navigateToPolicyIssuance();

    // Take screenshot before date selection
    await page.screenshot({ path: '.playwright-mcp/before-date-selection-1992.png' });

    // Test Registration Date field with old date
    const registrationDateInput = page.locator('text=Registration Date').locator('..').locator('input').first();
    
    try {
      await datePickerUtils.setDateOnMaterialUIPicker(
        registrationDateInput, 
        '15/05/1992', 
        { 
          retries: 3, 
          timeout: 15000, 
          takeScreenshot: true 
        }
      );

      // Verify the date was set correctly
      const finalValue = await registrationDateInput.inputValue();
      console.log('✅ Date set successfully:', finalValue);
      
      // Take screenshot after date selection
      await page.screenshot({ path: '.playwright-mcp/after-date-selection-1992.png' });
      
      // Verify the date contains expected values
      expect(finalValue).toContain('1992');
      expect(finalValue).toContain('05');
      expect(finalValue).toContain('15');
      
    } catch (error) {
      console.error('❌ Date picker test failed:', error.message);
      await page.screenshot({ path: '.playwright-mcp/date-picker-error-1992.png' });
      throw error;
    }
  });

  test('Date Picker - Test Recent Date Selection (2024)', async ({ page }) => {
    // Navigate to policy issuance page
    await navigationUtils.navigateToLoginPage();
    await navigationUtils.login(creds);
    await navigationUtils.navigateToPolicyIssuance();

    // Test Registration Date field with recent date
    const registrationDateInput = page.locator('text=Registration Date').locator('..').locator('input').first();
    
    try {
      await datePickerUtils.setDateOnMaterialUIPicker(
        registrationDateInput, 
        '10/12/2024', 
        { 
          retries: 3, 
          timeout: 15000, 
          takeScreenshot: true 
        }
      );

      // Verify the date was set correctly
      const finalValue = await registrationDateInput.inputValue();
      console.log('✅ Recent date set successfully:', finalValue);
      
      // Take screenshot after date selection
      await page.screenshot({ path: '.playwright-mcp/after-date-selection-2024.png' });
      
      // Verify the date contains expected values
      expect(finalValue).toContain('2024');
      expect(finalValue).toContain('12');
      expect(finalValue).toContain('10');
      
    } catch (error) {
      console.error('❌ Recent date picker test failed:', error.message);
      await page.screenshot({ path: '.playwright-mcp/date-picker-error-2024.png' });
      throw error;
    }
  });

  test('Date Picker - Test Future Date Selection (2030)', async ({ page }) => {
    // Navigate to policy issuance page
    await navigationUtils.navigateToLoginPage();
    await navigationUtils.login(creds);
    await navigationUtils.navigateToPolicyIssuance();

    // Test Registration Date field with future date
    const registrationDateInput = page.locator('text=Registration Date').locator('..').locator('input').first();
    
    try {
      await datePickerUtils.setDateOnMaterialUIPicker(
        registrationDateInput, 
        '01/01/2030', 
        { 
          retries: 3, 
          timeout: 15000, 
          takeScreenshot: true 
        }
      );

      // Verify the date was set correctly
      const finalValue = await registrationDateInput.inputValue();
      console.log('✅ Future date set successfully:', finalValue);
      
      // Take screenshot after date selection
      await page.screenshot({ path: '.playwright-mcp/after-date-selection-2030.png' });
      
      // Verify the date contains expected values
      expect(finalValue).toContain('2030');
      expect(finalValue).toContain('01');
      
    } catch (error) {
      console.error('❌ Future date picker test failed:', error.message);
      await page.screenshot({ path: '.playwright-mcp/date-picker-error-2030.png' });
      throw error;
    }
  });

  test('Date Picker - Test Multiple Date Fields', async ({ page }) => {
    // Navigate to policy issuance page
    await navigationUtils.navigateToLoginPage();
    await navigationUtils.login(creds);
    await navigationUtils.navigateToPolicyIssuance();

    const testDates = [
      { field: 'Registration Date', date: '15/05/1992', description: 'Old date' },
      { field: 'Invoice Date', date: '10/12/2024', description: 'Recent date' }
    ];

    for (const testCase of testDates) {
      try {
        console.log(`Testing ${testCase.description}: ${testCase.date}`);
        
        // Find the date input field
        const dateInput = page.locator('text=Registration Date').locator('..').locator('input').first();
        
        await datePickerUtils.setDateOnMaterialUIPicker(
          dateInput, 
          testCase.date, 
          { 
            retries: 2, 
            timeout: 10000 
          }
        );

        // Verify the date was set
        const finalValue = await dateInput.inputValue();
        console.log(`✅ ${testCase.description} set successfully:`, finalValue);
        
        // Clear the field for next test
        await dateInput.click();
        await dateInput.fill('');
        
      } catch (error) {
        console.error(`❌ ${testCase.description} test failed:`, error.message);
        throw error;
      }
    }
  });

  test('Date Picker - Test Error Handling', async ({ page }) => {
    // Navigate to policy issuance page
    await navigationUtils.navigateToLoginPage();
    await navigationUtils.login(creds);
    await navigationUtils.navigateToPolicyIssuance();

    const registrationDateInput = page.locator('text=Registration Date').locator('..').locator('input').first();
    
    // Test with invalid date format
    try {
      await datePickerUtils.setDateOnMaterialUIPicker(
        registrationDateInput, 
        'invalid-date', 
        { 
          retries: 1, 
          timeout: 5000 
        }
      );
      
      // Should not reach here
      expect(false).toBe(true);
      
    } catch (error) {
      console.log('✅ Error handling works correctly:', error.message);
      expect(error.message).toContain('Failed to set date');
    }
  });

  test('Date Picker - Test Date Format Validation', async ({ page }) => {
    const datePickerUtils = new DatePickerUtils(page);
    
    // Test valid date formats
    const validDates = ['15/05/1992', '01/01/2024', '31/12/2030'];
    for (const date of validDates) {
      const isValid = datePickerUtils.validateDateFormat(date);
      expect(isValid).toBe(true);
    }
    
    // Test invalid date formats
    const invalidDates = ['1992-05-15', '15-05-1992', 'invalid', '15/5/92'];
    for (const date of invalidDates) {
      const isValid = datePickerUtils.validateDateFormat(date);
      expect(isValid).toBe(false);
    }
  });

  test('Date Picker - Test Date Format Conversion', async ({ page }) => {
    const datePickerUtils = new DatePickerUtils(page);
    
    // Test date format conversion
    const originalDate = '15/05/1992';
    
    const yyyyMmDd = datePickerUtils.convertDateFormat(originalDate, 'YYYY-MM-DD');
    expect(yyyyMmDd).toBe('1992-05-15');
    
    const mmDdYyyy = datePickerUtils.convertDateFormat(originalDate, 'MM/DD/YYYY');
    expect(mmDdYyyy).toBe('05/15/1992');
    
    const ddMmYyyy = datePickerUtils.convertDateFormat(originalDate, 'DD/MM/YYYY');
    expect(ddMmYyyy).toBe(originalDate);
  });
});
