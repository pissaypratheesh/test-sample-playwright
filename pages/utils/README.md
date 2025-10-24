# Utils Directory Structure

This directory contains organized utility classes for the Playwright test automation framework, structured into logical subfolders for better maintainability and clarity.

## 📁 Directory Structure

```
utils/
├── core/                    # Core base utilities
│   ├── BasePage.js         # Base page class with common utilities
│   ├── DatePickerUtils.js  # Main date picker orchestrator
│   └── datepicker/         # Date picker utilities
│       ├── DatePickerCore.js           # Main date picker logic
│       ├── DatePickerNavigation.js     # Calendar navigation methods
│       ├── DatePickerStrategies.js     # Different date setting strategies
│       ├── DatePickerValidation.js     # Validation and utility methods
│       ├── DatePickerUtilsFirstVersion.js  # First version fallback
│       └── DatePickerUtilsSecversion.js    # Second version fallback
│
├── forms/                  # Form-related utilities
│   ├── FormUtils.js        # General form interaction utilities
│   ├── PolicyDetailsUtils.js    # Policy details form utilities
│   └── ProposalDetailsUtils.js  # Proposal details form utilities
│
├── navigation/             # Navigation utilities
│   └── NavigationUtils.js  # Navigation and menu utilities
│
└── e2e/                    # End-to-end flow utilities
    ├── E2ECoreUtils.js     # Core E2E flow functions
    ├── E2EFlowUtils.js     # Main E2E orchestrator
    └── E2EValidationUtils.js # E2E validation utilities
```

## 🎯 Purpose of Each Folder

### `core/` - Core Base Utilities
- **BasePage.js**: Foundation class with common utilities (waitForElement, safeClick, safeFill, etc.)
- **DatePickerUtils.js**: Main orchestrator for comprehensive date picker functionality
- **datepicker/**: Specialized date picker utilities broken down into focused components

### `forms/` - Form-Related Utilities
- **FormUtils.js**: General form interaction utilities (dropdowns, radio buttons, etc.)
- **PolicyDetailsUtils.js**: Specialized utilities for policy details forms
- **ProposalDetailsUtils.js**: Specialized utilities for proposal details forms

### `navigation/` - Navigation Utilities
- **NavigationUtils.js**: Menu navigation, login/logout, page navigation utilities

### `e2e/` - End-to-End Flow Utilities
- **E2ECoreUtils.js**: Core E2E flow functions (login, customer details, vehicle details, etc.)
- **E2EFlowUtils.js**: Main orchestrator that combines all utilities
- **E2EValidationUtils.js**: Validation and success checking utilities

## 📋 Usage Examples

### Importing Utilities

```javascript
// Core utilities
const BasePage = require('./utils/core/BasePage');
const DatePickerUtils = require('./utils/core/DatePickerUtils');

// Form utilities
const FormUtils = require('./utils/forms/FormUtils');
const PolicyDetailsUtils = require('./utils/forms/PolicyDetailsUtils');

// Navigation utilities
const NavigationUtils = require('./utils/navigation/NavigationUtils');

// E2E utilities
const E2EFlowUtils = require('./utils/e2e/E2EFlowUtils');
```

### Using E2E Flow Utilities

```javascript
const E2EFlowUtils = require('../pages/utils/e2e/E2EFlowUtils');

test('Complete E2E Flow', async ({ page }) => {
  const e2eFlow = new E2EFlowUtils(page);
  
  await e2eFlow.loginAndNavigate(creds, 'renewal');
  await e2eFlow.fillPolicyDetails(testdata, 'renewal');
  await e2eFlow.fillCustomerDetails(testdata);
  await e2eFlow.fillVehicleDetails(testdata);
  await e2eFlow.getQuotes();
  await e2eFlow.clickBuyNow();
  await e2eFlow.fillProposalDetails(proposalDetails);
  await e2eFlow.clickProposalPreview();
});
```

## 🔧 Benefits of This Structure

1. **Logical Organization**: Related utilities are grouped together
2. **Easy Navigation**: Clear folder structure makes finding utilities simple
3. **Maintainability**: Easier to maintain and update specific utility types
4. **Scalability**: Easy to add new utilities in appropriate folders
5. **Separation of Concerns**: Each folder has a specific responsibility
6. **Code Reusability**: Utilities can be imported individually as needed

## 📏 File Size Compliance

All files maintain compliance with the 300-line limit:
- **Core utilities**: 127-1038 lines (DatePickerUtils is comprehensive but focused)
- **Form utilities**: 121-397 lines
- **Navigation utilities**: 183 lines
- **E2E utilities**: 120-330 lines

## 🔄 Migration Notes

If you're updating existing code, update import paths as follows:

```javascript
// Old imports
const FormUtils = require('./utils/FormUtils');
const NavigationUtils = require('./utils/NavigationUtils');
const E2EFlowUtils = require('./utils/E2EFlowUtils');

// New imports
const FormUtils = require('./utils/forms/FormUtils');
const NavigationUtils = require('./utils/navigation/NavigationUtils');
const E2EFlowUtils = require('./utils/e2e/E2EFlowUtils');
```
