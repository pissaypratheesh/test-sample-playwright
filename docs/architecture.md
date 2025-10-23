# Technical Architecture - Playwright Policy Renewal Automation

## Architecture Overview

This document outlines the technical architecture of the Playwright Policy Renewal Automation framework, designed for maintainability, reusability, and scalability.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution Layer                     │
├─────────────────────────────────────────────────────────────┤
│  renewTataClean.spec.js  │  datePickerUtils.spec.js        │
│  (E2E Tests)             │  (Component Tests)               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Page Object Layer                        │
├─────────────────────────────────────────────────────────────┤
│  RenewPolicyPage.js     │  (Orchestration Layer)           │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Utility Layer                            │
├─────────────────────────────────────────────────────────────┤
│  FormUtils.js          │  NavigationUtils.js  │  DatePickerUtils.js │
│  (Form Interactions)  │  (Navigation)       │  (Date Handling)    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Base Layer                               │
├─────────────────────────────────────────────────────────────┤
│  BasePage.js           │  (Common Utilities)                │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Playwright API                          │
├─────────────────────────────────────────────────────────────┤
│  Browser Automation    │  Element Interaction  │  Screenshots │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Architecture

### 1. Base Layer (BasePage.js)

**Purpose**: Foundation layer providing common Playwright interactions

**Responsibilities**:
- Element waiting and interaction
- Screenshot management
- Common utility methods
- Error handling patterns

**Key Patterns**:
```javascript
class BasePage {
  constructor(page) {
    this.page = page;
    this.datePicker = new DatePickerUtils(page);
  }
  
  // Common interaction patterns
  async waitForElement(locator, timeout = 10000)
  async safeClick(locator, timeout = 10000)
  async safeFill(locator, value, timeout = 10000)
}
```

### 2. Utility Layer

#### FormUtils.js
**Purpose**: Form-specific interactions and data handling

**Architecture**:
```javascript
class FormUtils extends BasePage {
  // Form section methods
  async fillPolicyDetails(data)
  async fillCustomerDetails(data)
  async fillVehicleDetails(data)
  
  // Data transformation utilities
  convertNcbToNumber(ncbStr)
}
```

#### NavigationUtils.js
**Purpose**: Application navigation and authentication

**Architecture**:
```javascript
class NavigationUtils extends BasePage {
  // Authentication
  async login(creds)
  
  // Navigation patterns
  async navigateToPolicyIssuance()
  async navigateToMenuItem(menuPath)
  
  // Policy type selection
  async selectRenewPolicyType()
}
```

#### DatePickerUtils.js
**Purpose**: Comprehensive Material UI date picker automation

**Architecture**:
```javascript
class DatePickerUtils extends BasePage {
  // Main date setting method
  async setDateOnMaterialUIPicker(inputLocator, dateStr, options)
  
  // Fallback strategies
  async _tryDirectValueSetting(inputLocator, dateStr)
  async _tryCalendarPicker(inputLocator, dateStr, options)
  async _tryTypeAndValidate(inputLocator, dateStr)
  
  // Calendar navigation
  async _navigateToTargetDate(dialog, targetYear, targetMonth)
  async _navigateToTargetYear(dialog, targetYear, yearNavButtons)
  async _navigateToTargetMonth(dialog, targetMonthName, monthNavButtons)
  
  // Utility methods
  validateDateFormat(dateStr)
  convertDateFormat(dateStr, format)
}
```

### 3. Page Object Layer (RenewPolicyPage.js)

**Purpose**: Orchestrates the complete renewal flow

**Architecture**:
```javascript
class RenewPolicyPage extends FormUtils {
  constructor(page) {
    super(page);
    this.navigation = new NavigationUtils(page);
  }
  
  // Main flow orchestration
  async runRenewalFlow(testdata, creds, proposalDetails)
  async runNewPolicyFlow(testdata, creds)
  
  // Validation and utilities
  async validateFormCompletion()
  async getQuotes()
}
```

### 4. Test Layer

**Purpose**: Test specifications and execution

**Architecture**:
```javascript
// E2E Test Structure
test.describe('Policy Renewal Flow - Reusable Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
  });
  
  test('Renew Tata Policy - Complete E2E Flow', async ({ page }) => {
    const renewPolicyPage = new RenewPolicyPage(page);
    await renewPolicyPage.runRenewalFlow(testdata, creds, proposalDetails);
    // Assertions...
  });
});
```

## 🔄 Data Flow Architecture

### 1. Test Data Flow

```
testdata/
├── Auth.json              → NavigationUtils.login()
├── renewTatadata.json    → FormUtils.fillPolicyDetails()
└── proposalDetails.json  → RenewPolicyPage.fillProposalDetails()
```

### 2. Configuration Flow

```
config/
└── testConfig.js          → All components (appUrl, timeouts, etc.)
```

### 3. Error Handling Flow

```
Error Occurrence
       │
       ▼
BasePage.safeClick() / safeFill()
       │
       ▼
Retry Mechanism (3 attempts)
       │
       ▼
Screenshot Capture (if enabled)
       │
       ▼
Error Propagation with Context
```

## 🎯 Design Patterns

### 1. Page Object Model (POM)
- **Encapsulation**: UI elements and interactions encapsulated in page objects
- **Reusability**: Common interactions abstracted into utility classes
- **Maintainability**: Changes to UI only require updates in page objects

### 2. Strategy Pattern
- **Date Picker**: Multiple fallback strategies for date selection
- **Locator Strategy**: Multiple locator approaches for element finding
- **Wait Strategy**: Different wait strategies for different scenarios

### 3. Template Method Pattern
- **BasePage**: Common interaction templates
- **FormUtils**: Form filling templates
- **NavigationUtils**: Navigation templates

### 4. Factory Pattern
- **Page Object Creation**: Dynamic page object instantiation
- **Locator Creation**: Dynamic locator generation based on context

## 🔧 Configuration Architecture

### Environment Configuration
```javascript
// testConfig.js
module.exports = {
  appUrl: 'https://uatlifekaplan.tmibasl.in/',
  timeouts: {
    default: 10000,
    datePicker: 15000,
    navigation: 20000
  },
  retries: {
    default: 3,
    datePicker: 5,
    navigation: 2
  }
};
```

### Test Data Architecture
```javascript
// Hierarchical test data structure
{
  "policyDetails": { /* Policy-specific data */ },
  "customerDetails": { /* Customer-specific data */ },
  "vehicleDetails": { /* Vehicle-specific data */ },
  "proposalDetails": { /* Proposal-specific data */ }
}
```

## 🚀 Performance Architecture

### 1. Parallel Execution
- **Test Isolation**: Each test runs in isolated browser context
- **Resource Management**: Proper cleanup after test completion
- **Parallel Test Execution**: Multiple tests run simultaneously

### 2. Optimization Strategies
- **Locator Optimization**: Fast, stable locator strategies
- **Wait Optimization**: Appropriate wait strategies for different scenarios
- **Resource Optimization**: Efficient browser resource usage

### 3. Caching Strategy
- **Element Caching**: Reuse element locators where possible
- **Data Caching**: Cache test data for multiple test runs
- **Configuration Caching**: Cache configuration values

## 🔒 Security Architecture

### 1. Credential Management
```javascript
// Secure credential handling
const creds = require('../testdata/Auth.json');
// Never hardcode credentials in code
```

### 2. Data Privacy
- **Sensitive Data**: Externalized to JSON files
- **Environment Separation**: Different configs for different environments
- **Clean State**: Clean test state between runs

### 3. Access Control
- **Test Isolation**: Each test runs in isolated context
- **Resource Cleanup**: Proper cleanup of sensitive data

## 📊 Monitoring and Debugging Architecture

### 1. Screenshot Strategy
```javascript
// Automatic screenshot capture
await this.takeFormScreenshot('before-renewal.png');
await this.takeFormScreenshot('after-renewal.png');
```

### 2. Logging Strategy
```javascript
// Comprehensive logging
console.log('✅ Renewal flow completed successfully');
console.log('Form validation results:', validationResults);
```

### 3. Error Tracking
```javascript
// Error context preservation
try {
  await operation();
} catch (error) {
  console.error('Operation failed:', error.message);
  await this.takeFormScreenshot('error-state.png');
  throw error;
}
```

## 🔄 Extensibility Architecture

### 1. Adding New Form Sections
```javascript
// Extend FormUtils
class ExtendedFormUtils extends FormUtils {
  async fillNewSection(data) {
    // Implementation
  }
}
```

### 2. Adding New Page Objects
```javascript
// Extend BasePage
class NewPageObject extends BasePage {
  constructor(page) {
    super(page);
    this.navigation = new NavigationUtils(page);
  }
}
```

### 3. Adding New Test Types
```javascript
// Extend test patterns
test.describe('New Test Category', () => {
  test('New Test Case', async ({ page }) => {
    // Implementation
  });
});
```

## 📈 Scalability Considerations

### 1. Horizontal Scaling
- **Parallel Test Execution**: Multiple tests run simultaneously
- **Test Distribution**: Tests can be distributed across multiple machines
- **Resource Distribution**: Browser resources distributed efficiently

### 2. Vertical Scaling
- **Component Reusability**: Components can be reused across different test suites
- **Data Reusability**: Test data can be shared across different test scenarios
- **Configuration Reusability**: Configuration can be shared across environments

### 3. Maintenance Scaling
- **Modular Architecture**: Easy to maintain and update individual components
- **Documentation**: Comprehensive documentation for easy onboarding
- **Standards**: Coding standards ensure consistency across team

## 🔮 Future Architecture Considerations

### 1. Microservices Integration
- **API Testing**: Integration with microservices architecture
- **Service Mocking**: Mock services for isolated testing
- **Contract Testing**: API contract validation

### 2. Cloud Integration
- **Cloud Testing**: Integration with cloud testing platforms
- **CI/CD Integration**: Seamless integration with CI/CD pipelines
- **Reporting Integration**: Integration with test reporting platforms

### 3. AI Integration
- **Smart Locators**: AI-powered locator generation
- **Test Generation**: AI-powered test case generation
- **Anomaly Detection**: AI-powered test failure analysis

---

**Architecture Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Playwright v1.40+, Node.js v18+
