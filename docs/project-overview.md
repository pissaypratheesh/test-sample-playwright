# Playwright Test Automation - Reusable Structure

This project provides a clean, organized, and reusable structure for Playwright test automation, specifically designed for insurance policy renewal flows.

## 🏗️ Project Structure

```
├── pages/
│   ├── utils/
│   │   ├── BasePage.js          # Base utilities with common methods
│   │   ├── FormUtils.js         # Form interaction utilities
│   │   └── NavigationUtils.js   # Navigation utilities
│   └── RenewPolicyPage.js       # Main page object (extends utilities)
├── tests/
│   └── renewTataClean.spec.js   # Clean test specifications
├── testdata/
│   ├── renewTatadata.json       # Renewal test data
│   ├── Auth.json               # Authentication credentials
│   └── proposalDetails.json    # Proposal details data
├── config/
│   └── testConfig.js           # Reusable configuration
└── .playwright-mcp/            # Screenshots and debug files
```

## 🚀 Key Features

### 1. **Reusable Utility Classes**
- **BasePage**: Common methods like `safeClick()`, `safeFill()`, `waitForElement()`
- **FormUtils**: Form-specific interactions like `selectDropdownOption()`, `setDateOnInput()`
- **NavigationUtils**: Navigation patterns like `login()`, `navigateToPolicyIssuance()`

### 2. **Modular Page Objects**
- Extends utility classes for maximum reusability
- Clean separation of concerns
- Easy to maintain and extend

### 3. **Comprehensive Test Coverage**
- Multiple test scenarios (renewal, new policy, validation)
- Error handling tests
- NCB selection variations
- Form validation tests

### 4. **Configuration Management**
- Centralized configuration in `testConfig.js`
- Reusable field mappings
- Timeout and retry settings

## 🔧 Usage Examples

### Basic Renewal Flow
```javascript
const renewPolicyPage = new RenewPolicyPage(page);
await renewPolicyPage.runRenewalFlow(testdata, creds, proposalDetails);
```

### New Policy Flow
```javascript
const renewPolicyPage = new RenewPolicyPage(page);
await renewPolicyPage.runNewPolicyFlow(testdata, creds, proposalDetails);
```

### Custom Form Filling
```javascript
const formUtils = new FormUtils(page);
await formUtils.fillPolicyDetails(data);
await formUtils.fillCustomerDetails(data);
await formUtils.fillVehicleDetails(data);
```

### Navigation Utilities
```javascript
const navUtils = new NavigationUtils(page);
await navUtils.navigateToLoginPage();
await navUtils.login(creds);
await navUtils.navigateToMenuItem('Policy Centre > Policy > Policy Issuance');
```

## 🛠️ Utility Methods

### BasePage Methods
- `waitForElement(locator, timeout)` - Wait for element to be visible
- `safeClick(locator, retries)` - Click with retry mechanism
- `safeFill(locator, text, retries)` - Fill with retry mechanism
- `waitForPageLoad(urlPattern)` - Wait for page to load completely

### FormUtils Methods
- `selectDropdownOption(dropdownLocator, optionText)` - Select dropdown option
- `setDateOnInput(inputLocator, dateStr)` - Set date with multiple strategies
- `selectRadioOption(groupName, optionValue)` - Select radio button
- `convertNcbToNumber(ncbStr)` - Convert NCB percentage to number

### NavigationUtils Methods
- `navigateToLoginPage(baseUrl)` - Navigate to login page
- `login(creds, captcha)` - Perform login
- `navigateToPolicyIssuance()` - Navigate to policy issuance
- `navigateToMenuItem(menuPath)` - Navigate to specific menu item

## 🧪 Test Examples

### 1. Complete E2E Renewal Flow
```javascript
test('Renew Tata Policy - Complete E2E Flow', async ({ page }) => {
  const renewPolicyPage = new RenewPolicyPage(page);
  await renewPolicyPage.runRenewalFlow(testdata, creds, proposalDetails);
  
  const isFormComplete = await renewPolicyPage.validateFormCompletion();
  expect(isFormComplete).toBe(true);
});
```

### 2. NCB Selection Testing
```javascript
test('NCB Selection - Different Values', async ({ page }) => {
  const renewPolicyPage = new RenewPolicyPage(page);
  const ncbValues = ['0', '20', '25', '35', '45', '50', '55', '65'];
  
  for (const ncbValue of ncbValues) {
    const testData = { ...testdata, ncb: `${ncbValue}%` };
    await renewPolicyPage.fillPolicyDetails(testData);
    // Verify selection...
  }
});
```

### 3. Error Handling
```javascript
test('Error Handling - Invalid Data', async ({ page }) => {
  const renewPolicyPage = new RenewPolicyPage(page);
  const invalidData = { ...testdata, prevPolicyNo: 'INVALID123' };
  
  try {
    await renewPolicyPage.runRenewalFlow(invalidData, creds);
  } catch (error) {
    expect(error.message).toBeDefined();
  }
});
```

## 🔍 Debugging Features

### Screenshots
```javascript
await renewPolicyPage.takeFormScreenshot('before-renewal.png');
await renewPolicyPage.takeFormScreenshot('after-renewal.png');
```

### Form Validation
```javascript
const isFormComplete = await renewPolicyPage.validateFormCompletion();
expect(isFormComplete).toBe(true);
```

## 📝 Configuration

### Test Configuration
```javascript
const config = require('../config/testConfig');

// Use configuration values
await page.waitForTimeout(config.timeouts.default);
await renewPolicyPage.selectDropdownOption(dropdown, config.fieldMappings.oem[0]);
```

## 🚀 Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/renewTataClean.spec.js

# Run with headed mode
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

## 🔧 Customization

### Adding New Utility Methods
1. Extend the appropriate utility class
2. Add your method with proper error handling
3. Update documentation

### Adding New Test Scenarios
1. Create new test in the spec file
2. Use existing utility methods
3. Add proper assertions and error handling

### Adding New Page Objects
1. Extend FormUtils or BasePage
2. Implement page-specific methods
3. Follow the established patterns

## 📊 Benefits

1. **Reusability**: Utility classes can be used across different test flows
2. **Maintainability**: Clean separation of concerns makes updates easier
3. **Reliability**: Built-in retry mechanisms and error handling
4. **Scalability**: Easy to add new tests and page objects
5. **Debugging**: Comprehensive logging and screenshot capabilities
6. **Configuration**: Centralized settings for easy management

## 🎯 Best Practices

1. Always use utility methods instead of direct Playwright calls
2. Implement proper error handling and retries
3. Take screenshots at key points for debugging
4. Use configuration values instead of hardcoded values
5. Write descriptive test names and comments
6. Keep test data separate from test logic
7. Validate form completion before proceeding
8. Use relative XPath locators for better stability

This structure provides a solid foundation for building comprehensive test automation suites that are maintainable, reusable, and reliable.
