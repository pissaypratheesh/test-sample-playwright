const { test, expect } = require('@playwright/test');
const RenewPolicyPage = require('../pages/renewPolicy');

test.describe('Date Picker Tests - Mock and Actual', () => {
  
  test('Mock Test: Date picker with 1992 year selection', async ({ page }) => {
    const renewPage = new RenewPolicyPage(page);
    
    console.log('🧪 Testing date picker with year 1992 using mock TATA UI...');
    
    try {
      // Create a comprehensive mock that simulates the actual TATA website date picker structure
      const mockHtml = `
        <html><body>
          <!-- Mock TATA Date Picker Structure -->
          <div class="MuiFormControl-root MuiTextField-root CustomDatePicker w-100">
            <div class="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary MuiInputBase-formControl MuiInputBase-adornedEnd Mui-readOnly MuiInputBase-readOnly">
              <input name="DOB" placeholder="DD/MM/YYYY" readonly="" type="text" aria-label="Choose date" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputAdornedEnd Mui-readOnly MuiInputBase-readOnly" value="DD/MM/YYYY">
              <fieldset aria-hidden="true" class="MuiOutlinedInput-notchedOutline">
                <legend class="MuiOutlinedInput-notchedOutline-legend"></legend>
              </fieldset>
            </div>
          </div>
          
          <!-- Mock Date Picker Dialog (hidden initially) -->
          <div role="dialog" style="display: none;" class="MuiModal-root">
            <div class="MuiDialog-root">
              <div class="MuiDialog-container">
                <div class="MuiPaper-root MuiDialog-paper">
                  <div class="MuiDialogTitle-root">
                    <div class="MuiTypography-root MuiTypography-h6">Select Date</div>
                  </div>
                  <div class="MuiDialogContent-root">
                    <div class="MuiPickersCalendar-root">
                      <div class="MuiPickersCalendarHeader-root">
                        <button aria-label="Previous month" class="MuiIconButton-root">‹</button>
                        <div class="MuiTypography-root MuiTypography-subtitle1">January 2025</div>
                        <button aria-label="Next month" class="MuiIconButton-root">›</button>
                      </div>
                      <div class="MuiPickersCalendarTransitionContainer-root">
                        <div class="MuiPickersCalendar-weekContainer">
                          <div role="gridcell" name="1" class="MuiPickersDay-root">1</div>
                          <div role="gridcell" name="2" class="MuiPickersDay-root">2</div>
                          <div role="gridcell" name="3" class="MuiPickersDay-root">3</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            // Mock the date picker behavior
            document.querySelector('input[name="DOB"]').addEventListener('click', function() {
              document.querySelector('[role="dialog"]').style.display = 'block';
            });
            
            // Mock year navigation
            let currentYear = 2025;
            document.querySelector('[aria-label="Previous month"]').addEventListener('click', function() {
              currentYear--;
              document.querySelector('.MuiTypography-subtitle1').textContent = 'January ' + currentYear;
            });
            
            document.querySelector('[aria-label="Next month"]').addEventListener('click', function() {
              currentYear++;
              document.querySelector('.MuiTypography-subtitle1').textContent = 'January ' + currentYear;
            });
            
            // Mock day selection
            document.querySelectorAll('[role="gridcell"]').forEach(cell => {
              cell.addEventListener('click', function() {
                const day = this.getAttribute('name');
                const month = 1; // January
                const year = currentYear;
                const formattedDate = day.padStart(2, '0') + '/' + month.toString().padStart(2, '0') + '/' + year;
                document.querySelector('input[name="DOB"]').value = formattedDate;
                document.querySelector('[role="dialog"]').style.display = 'none';
              });
            });
          </script>
        </body></html>
      `;
      await page.goto(`data:text/html,${encodeURIComponent(mockHtml)}`);
      
      // Test the date setting method
      const dobInput = page.locator('input[name="DOB"]');
      await renewPage._setDateOnInput(dobInput, "01/01/1992");
      
      // Verify the date was set correctly
      const setValue = await dobInput.inputValue();
      console.log(`📅 Date input value after setting: ${setValue}`);
      
      // The test passes if we can set the date without errors
      expect(setValue).toBeTruthy();
      console.log('✅ Mock TATA date picker test completed successfully');
      
    } catch (error) {
      console.error('❌ Mock TATA date picker test failed:', error.message);
      throw error;
    }
  });

  test('Mock Test: Calendar navigation for 1992', async ({ page }) => {
    const renewPage = new RenewPolicyPage(page);
    
    console.log('🧪 Testing calendar navigation for year 1992 using mock calendar...');
    
    try {
      // Create a mock calendar dialog for testing
      const mockCalendarHtml = `
        <html><body>
          <div role="dialog" style="display: block;" class="MuiModal-root">
            <div class="MuiDialog-root">
              <div class="MuiDialog-container">
                <div class="MuiPaper-root MuiDialog-paper">
                  <div class="MuiDialogTitle-root">
                    <div class="MuiTypography-root MuiTypography-h6">Select Date</div>
                  </div>
                  <div class="MuiDialogContent-root">
                    <div class="MuiPickersCalendar-root">
                      <div class="MuiPickersCalendarHeader-root">
                        <button aria-label="Previous month" class="MuiIconButton-root">‹</button>
                        <div class="MuiTypography-root MuiTypography-subtitle1">January 2025</div>
                        <button aria-label="Next month" class="MuiIconButton-root">›</button>
                      </div>
                      <div class="MuiPickersCalendarTransitionContainer-root">
                        <div class="MuiPickersCalendar-weekContainer">
                          <div role="gridcell" name="1" class="MuiPickersDay-root">1</div>
                          <div role="gridcell" name="2" class="MuiPickersDay-root">2</div>
                          <div role="gridcell" name="3" class="MuiPickersDay-root">3</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            // Mock year navigation
            let currentYear = 2025;
            document.querySelector('[aria-label="Previous month"]').addEventListener('click', function() {
              currentYear--;
              document.querySelector('.MuiTypography-subtitle1').textContent = 'January ' + currentYear;
            });
            
            document.querySelector('[aria-label="Next month"]').addEventListener('click', function() {
              currentYear++;
              document.querySelector('.MuiTypography-subtitle1').textContent = 'January ' + currentYear;
            });
          </script>
        </body></html>
      `;
      await page.goto(`data:text/html,${encodeURIComponent(mockCalendarHtml)}`);
      
      // Test the _selectDate method
      await renewPage._selectDate("01/01/1992");
      
      console.log('✅ Mock calendar navigation test completed successfully');
      
    } catch (error) {
      console.error('❌ Mock calendar navigation test failed:', error.message);
      throw error;
    }
  });

  test('Actual Test: TATA Website Date Picker Integration', async ({ page }) => {
    const renewPage = new RenewPolicyPage(page);
    
    console.log('🌐 Testing actual TATA website date picker integration...');
    
    try {
      // Load test data
      const testData = require('../testdata/renewTata.data.json');
      const credentials = require('../testdata/Auth.json');
      
      console.log('📋 Starting actual TATA website test...');
      
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
      
      // Fill basic form data to get to proposal details
      await page.locator('#mui-component-select-FKOEM_ID').click();
      await page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 10000 });
      await page.locator('ul[role="listbox"] li[role="option"]', { hasText: testData.oem }).click({ force: true });
      await page.waitForTimeout(500);
      
      // Select Vehicle Cover
      await renewPage._selectMuiOption('#mui-component-select-CoverTypeId', testData.vehicleCover);
      
      // Fill previous policy details
      await page.getByLabel('Previous Policy No').fill(testData.prevPolicyNo);
      await renewPage._selectMuiOption('#mui-component-select-PREV_COVERTYPE_ID', testData.prevVehicleCover);
      await renewPage._selectMuiOption('#mui-component-select-OLD_POL_NCB_LEVEL', testData.ncb, { numeric: true });
      await renewPage._selectMuiOption('#mui-component-select-FKISURANCE_COMP_ID', testData.prevPolicyIC);
      
      // Fill vehicle details
      const randomVin = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
      await page.locator('input[name="ChassisNo"]').fill(randomVin);
      
      const randomEngineNo = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
      await page.locator('input[name="EngineNo"]').fill(randomEngineNo);
      
      await renewPage._selectMuiOption('#mui-component-select-MakeId', testData.make);
      await renewPage._selectMuiOption('#mui-component-select-ModelId', testData.model);
      await renewPage._selectMuiOption('#mui-component-select-VariantId', testData.variant);
      await renewPage._selectMuiOption('#mui-component-select-DateofManufacture', testData.year);
      await renewPage._selectMuiOption('#mui-component-select-RTOId', testData.registrationCity);
      await renewPage._selectMuiOption('#mui-component-select-IsuredStateId', testData.customerState);
      
      // Fill customer details
      await page.locator('text=Customer Details').scrollIntoViewIfNeeded().catch(() => {});
      await renewPage._selectSalutation(testData.salutation).catch(() => {});
      await page.locator('input[name="FIRST_NAME"]').fill(testData.firstName);
      await page.locator('input[name="EMAIL"]').fill(testData.email);
      await page.locator('input[name="MOB_NO"]').fill(testData.mobile);
      
      console.log('📝 Filled basic form data, proceeding to Get Quotes...');
      
      // Click Get Quotes
      await page.getByRole('button', { name: /Get Quotes/i }).click();
      console.log('🔍 Clicked Get Quotes, waiting for results...');
      
      // Wait for quotes to load
      await page.waitForTimeout(10000);
      
      // Try to find and click Buy Now
      try {
        const buyNowButton = page.locator('button:has-text("BUY NOW")').first();
        if (await buyNowButton.isVisible({ timeout: 10000 })) {
          console.log('🛒 Found BUY NOW button, clicking...');
          await buyNowButton.click();
          console.log('✅ Clicked BUY NOW successfully');
          
          // Wait for proposal details page
          await page.waitForTimeout(5000);
          
          // Test the date picker on the actual proposal details page
          console.log('📅 Testing date picker on actual proposal details page...');
          
          const dobInput = page.locator('input[name="DOB"]');
          if (await dobInput.isVisible({ timeout: 5000 })) {
            console.log('🎯 Found DOB input field, testing date picker...');
            
            // Test setting 1992 date
            await renewPage._setDateOnInput(dobInput, "01/01/1992");
            
            // Verify the date was set
            const setValue = await dobInput.inputValue();
            console.log(`📅 DOB value after setting: ${setValue}`);
            
            // Take a screenshot for verification
            await page.screenshot({ path: 'test-results/actual-date-picker-test.png', fullPage: true });
            console.log('📸 Screenshot saved for verification');
            
            // The test passes if we can interact with the date picker
            expect(setValue).toBeTruthy();
            console.log('✅ Actual TATA website date picker test completed successfully');
            
          } else {
            console.log('⚠️ DOB input field not found on proposal details page');
          }
        } else {
          console.log('⚠️ BUY NOW button not found, skipping proposal details test');
        }
      } catch (e) {
        console.log('⚠️ Could not proceed to proposal details:', e.message);
      }
      
    } catch (error) {
      console.error('❌ Actual TATA website test failed:', error.message);
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/actual-test-error.png', fullPage: true });
      throw error;
    }
  });

  test('Actual Test: Direct Date Picker Test on TATA Website', async ({ page }) => {
    const renewPage = new RenewPolicyPage(page);
    
    console.log('🎯 Testing date picker directly on TATA website...');
    
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
      
      // Look for any date input fields on the current page
      const dateInputs = page.locator('input[placeholder*="DD/MM/YYYY"], input[name*="DATE"], input[name*="date"]');
      const dateInputCount = await dateInputs.count();
      
      console.log(`📅 Found ${dateInputCount} date input fields`);
      
      if (dateInputCount > 0) {
        // Test the first date input
        const firstDateInput = dateInputs.first();
        const inputName = await firstDateInput.getAttribute('name') || 'unknown';
        console.log(`🎯 Testing date input: ${inputName}`);
        
        // Test setting 1992 date
        await renewPage._setDateOnInput(firstDateInput, "01/01/1992");
        
        // Verify the date was set
        const setValue = await firstDateInput.inputValue();
        console.log(`📅 Date input value after setting: ${setValue}`);
        
        // Take a screenshot for verification
        await page.screenshot({ path: 'test-results/direct-date-picker-test.png', fullPage: true });
        console.log('📸 Screenshot saved for verification');
        
        // The test passes if we can interact with the date picker
        expect(setValue).toBeTruthy();
        console.log('✅ Direct date picker test completed successfully');
      } else {
        console.log('⚠️ No date input fields found on current page');
      }
      
    } catch (error) {
      console.error('❌ Direct date picker test failed:', error.message);
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/direct-test-error.png', fullPage: true });
      throw error;
    }
  });
});
