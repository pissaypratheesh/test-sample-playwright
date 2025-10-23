# Playwright Policy Renewal Automation - Comprehensive Documentation

## Project Overview

This project contains a comprehensive Playwright test automation framework for the Tata Motors Insurance Broking And Advisory Services Limited UAT environment. The framework is designed to be modular, reusable, and maintainable, following best practices for test automation.

## 🚀 Key Features

- **Modular Architecture**: Clean separation of concerns with utility classes
- **Material UI Date Picker Support**: Comprehensive date picker automation for old dates (1992+) and future dates
- **Reusable Components**: BasePage, FormUtils, NavigationUtils, and DatePickerUtils
- **Data-Driven Testing**: External JSON test data files
- **Robust Error Handling**: Retry mechanisms and comprehensive error handling
- **Screenshot Support**: Automatic screenshots for debugging and documentation
- **Relative XPath Locators**: Stable element identification strategies

## 📁 Project Structure

```
playwright-policy-renewal/
├── docs/                           # Documentation files
│   ├── README.md                   # This comprehensive documentation
│   ├── date-picker-guide.md        # Date picker usage guide
│   └── architecture.md             # Technical architecture details
├── pages/                          # Page Object Model files
│   ├── RenewPolicyPage.js          # Main page object for renewal flow
│   └── utils/                      # Utility classes
│       ├── BasePage.js             # Base page with common utilities
│       ├── FormUtils.js            # Form-specific interactions
│       ├── NavigationUtils.js     # Navigation and login utilities
│       └── DatePickerUtils.js     # Comprehensive Material UI date picker
├── tests/                          # Test specification files
│   ├── renewTataClean.spec.js      # Clean renewal flow tests
│   └── datePickerUtils.spec.js     # Date picker comprehensive tests
├── testdata/                       # Test data files
│   ├── Auth.json                   # Authentication credentials
│   ├── renewTatadata.json         # Renewal flow test data
│   └── proposalDetails.json       # Proposal details test data
├── config/                         # Configuration files
│   └── testConfig.js              # Centralized configuration
├── .cursorrules                    # Project coding standards
├── .cursor/                        # Cursor IDE rules
│   └── rules/
│       ├── code-standards.mdc     # General coding standards
│       └── playwright-patterns.mdc # Playwright-specific patterns
└── .playwright-mcp/               # MCP screenshots and debugging
```

## 🛠️ Core Components

### 1. BasePage.js
**Purpose**: Provides common Playwright interactions and utility methods
**Key Features**:
- Safe element interactions with retry mechanisms
- Screenshot capabilities
- Wait strategies
- Common utility methods

**Key Methods**:
```javascript
async waitForElement(locator, timeout = 10000)
async safeClick(locator, timeout = 10000)
async safeFill(locator, value, timeout = 10000)
async selectDropdownOption(dropdownLocator, optionName, timeout = 10000)
async setDateOnInput(inputLocator, dateStr, options = {})
async takeFormScreenshot(filename)
```

### 2. DatePickerUtils.js
**Purpose**: Comprehensive Material UI date picker automation
**Key Features**:
- Multiple fallback strategies for date selection
- Support for old dates (1992+) and future dates
- Calendar navigation with year/month selection
- Robust error handling and retry mechanisms
- Date format validation and conversion

**Key Methods**:
```javascript
async setDateOnMaterialUIPicker(inputLocator, dateStr, options = {})
validateDateFormat(dateStr)
convertDateFormat(dateStr, format = 'DD/MM/YYYY')
```

**Supported Date Formats**:
- Input: `DD/MM/YYYY` (e.g., `15/05/1992`)
- Output: `YYYY-MM-DD`, `MM/DD/YYYY`, `DD/MM/YYYY`

**Date Range Support**:
- ✅ Old dates: 1992, 1995, 2000, etc.
- ✅ Recent dates: 2024, 2025, etc.
- ✅ Future dates: 2030, 2035, etc.

### 3. FormUtils.js
**Purpose**: Handles form-specific interactions
**Key Features**:
- Policy details form filling
- Customer details form filling
- Vehicle details form filling
- Additional discounts section
- NCB percentage conversion

**Key Methods**:
```javascript
async fillPolicyDetails(data)
async fillCustomerDetails(data)
async fillVehicleDetails(data)
async fillAdditionalDiscounts()
convertNcbToNumber(ncbStr)
```

### 4. NavigationUtils.js
**Purpose**: Handles navigation and authentication
**Key Features**:
- Login functionality
- Menu navigation
- Policy type selection
- Page navigation utilities

**Key Methods**:
```javascript
async login(creds)
async navigateToPolicyIssuance()
async selectRenewPolicyType()
async navigateToNewPolicyFlow()
async navigateToMenuItem(menuPath)
```

### 5. RenewPolicyPage.js
**Purpose**: Main page object orchestrating the renewal flow
**Key Features**:
- Complete renewal flow orchestration
- Form validation
- Screenshot capabilities
- Proposal details handling

**Key Methods**:
```javascript
async runRenewalFlow(testdata, creds, proposalDetails)
async runNewPolicyFlow(testdata, creds)
async validateFormCompletion()
async getQuotes()
```

## 📋 Test Files

### 1. renewTataClean.spec.js
**Purpose**: Clean, organized renewal flow tests
**Test Cases**:
- Complete E2E renewal flow
- New policy flow
- Form validation
- NCB selection testing
- Error handling
- Proposal details flow

### 2. datePickerUtils.spec.js
**Purpose**: Comprehensive date picker testing
**Test Cases**:
- Old date selection (1992)
- Recent date selection (2024)
- Future date selection (2030)
- Multiple date fields testing
- Error handling validation
- Date format validation
- Date format conversion

## 🎯 Usage Examples

### Basic Date Picker Usage
```javascript
const DatePickerUtils = require('./pages/utils/DatePickerUtils');
const datePicker = new DatePickerUtils(page);

// Set an old date (1992)
await datePicker.setDateOnMaterialUIPicker(
  page.getByRole('textbox', { name: 'Choose date' }),
  '15/05/1992',
  { retries: 3, timeout: 15000, takeScreenshot: true }
);
```

### Complete Renewal Flow
```javascript
const RenewPolicyPage = require('./pages/RenewPolicyPage');
const testdata = require('./testdata/renewTatadata.json');
const creds = require('./testdata/Auth.json');

const renewPolicyPage = new RenewPolicyPage(page);
await renewPolicyPage.runRenewalFlow(testdata, creds);
```

### Form Validation
```javascript
const isFormComplete = await renewPolicyPage.validateFormCompletion();
console.log('Form completion status:', isFormComplete);
```

## 🔧 Configuration

### testConfig.js
```javascript
module.exports = {
  appUrl: 'https://uatlifekaplan.tmibasl.in/',
  // Add other configuration settings here
};
```

### Test Data Structure
```javascript
// renewTatadata.json
{
  "oem": "Ford",
  "prevPolicyNo": "2WERDFT56",
  "prevVehicleCover": "1 OD + 1 TP",
  "ncb": "20%",
  "prevPolicyIC": "Bajaj Allianz General Insurance Co. Ltd.",
  "vehicleCover": "1 OD + 1 TP",
  "salutation": "Mr.",
  "firstName": "JOHNNY",
  "email": "naer@hji.com",
  "mobile": "8765456789",
  "make": "Ford",
  "model": "ECOSPORT",
  "variant": "1.0 ECOSPORT PTL TIT",
  "year": "2024",
  "registrationCity": "DELHI CENTRAL DL 06 (DL)",
  "customerState": "DELHI",
  "odPolicyExpiryDate": "10/10/2025",
  "tpPolicyExpiryDate": "10/10/2025",
  "invoiceDate": "01/01/2024",
  "registrationDate": "01/01/2024",
  "registrationStateRto": "DL-06",
  "registrationSeries": "RAA",
  "registrationNumber": "9999"
}
```

## 🚀 Running Tests

### Prerequisites
```bash
npm install
npx playwright install
```

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test Files
```bash
# Run renewal flow tests
npx playwright test tests/renewTataClean.spec.js

# Run date picker tests
npx playwright test tests/datePickerUtils.spec.js

# Run with UI mode
npx playwright test --ui

# Run in headed mode
npx playwright test --headed
```

### Run Specific Test Cases
```bash
# Run only old date tests
npx playwright test --grep "Old Date"

# Run only E2E flow
npx playwright test --grep "Complete E2E Flow"
```

## 🐛 Debugging and Troubleshooting

### Screenshots
Screenshots are automatically taken during test execution and saved to:
- `.playwright-mcp/` directory for MCP debugging
- `test-results/` directory for test failures

### Common Issues and Solutions

#### 1. Date Picker Not Opening
**Issue**: Calendar dialog doesn't appear
**Solution**: 
- Check if the input field is visible and enabled
- Verify the locator is correct
- Add wait time for page load

#### 2. Old Date Navigation Fails
**Issue**: Cannot navigate to years like 1992
**Solution**:
- Use the comprehensive DatePickerUtils
- Increase timeout values
- Enable screenshot debugging

#### 3. Browser Closes Prematurely
**Issue**: "Target page, context or browser has been closed"
**Solution**:
- Check for unhandled errors
- Add proper wait strategies
- Verify form validation logic

### Debug Mode
```javascript
// Enable debug mode with screenshots
await datePicker.setDateOnMaterialUIPicker(
  inputLocator,
  '15/05/1992',
  { 
    retries: 3, 
    timeout: 15000, 
    takeScreenshot: true 
  }
);
```

## 📊 Best Practices

### 1. Locator Strategy
- Use relative XPath locators for stability
- Prefer role-based locators (`getByRole`)
- Use text-based locators (`getByText`) for visible elements
- Implement fallback locator strategies

### 2. Wait Strategies
- Always wait for elements before interaction
- Use `waitForElement` for critical elements
- Implement proper timeout values
- Wait for page load completion

### 3. Error Handling
- Implement retry mechanisms for flaky operations
- Use try-catch blocks for critical interactions
- Provide meaningful error messages
- Take screenshots on failures

### 4. Code Organization
- Keep files under 300 lines
- Use descriptive method names
- Implement proper JSDoc documentation
- Follow single responsibility principle

## 🔄 Maintenance and Updates

### Adding New Date Fields
1. Update `FormUtils.js` with new date field methods
2. Add test cases in `datePickerUtils.spec.js`
3. Update documentation

### Adding New Form Sections
1. Create new methods in `FormUtils.js`
2. Update `RenewPolicyPage.js` to orchestrate new sections
3. Add corresponding test data
4. Create test cases

### Updating Locators
1. Use MCP to inspect new UI elements
2. Update locators in respective utility classes
3. Test with screenshots to verify changes
4. Update documentation

## 📈 Performance Considerations

- **Parallel Execution**: Tests are designed to run in parallel
- **Resource Management**: Proper browser cleanup after tests
- **Timeout Optimization**: Balanced timeout values for speed and reliability
- **Efficient Locators**: Fast, stable locator strategies

## 🔒 Security Considerations

- **Credential Management**: Never hardcode credentials
- **Data Privacy**: Handle sensitive test data appropriately
- **Environment Separation**: Use different configs for different environments
- **Clean State**: Ensure clean test state between runs

## 📞 Support and Contributing

### Getting Help
1. Check the troubleshooting section
2. Review screenshots in `.playwright-mcp/`
3. Check console logs for detailed error messages
4. Use MCP for real-time UI inspection

### Contributing
1. Follow the coding standards in `.cursorrules`
2. Keep files under 300 lines
3. Add comprehensive tests for new features
4. Update documentation for changes
5. Use meaningful commit messages

## 📝 Changelog

### Version 1.0.0
- Initial implementation with comprehensive date picker support
- Modular architecture with utility classes
- Complete renewal flow automation
- Material UI date picker with old date support (1992+)
- Comprehensive test coverage
- Documentation and coding standards

---

**Last Updated**: December 2024  
**Framework**: Playwright  
**Target Application**: Tata Motors Insurance Broking And Advisory Services Limited UAT
