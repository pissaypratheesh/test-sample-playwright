# Renewal Form System - Modular Architecture

This document describes the refactored, modular architecture for the insurance renewal form system. The system has been broken down into reusable components that handle the complex 3-page form with dynamic variations.

## 🏗️ Architecture Overview

The renewal form system is now organized into the following modular components:

```
pages/renewal/
├── BaseRenewalPage.js              # Base class with common utilities
├── PolicyVehicleDetailsPage.js     # Page 1: Policy & Vehicle Details
├── AdditionalDetailsPage.js        # Page 2: Additional Details & Discounts
├── ProposalDetailsPage.js          # Page 3: Proposal Details
├── RenewalFormFlowCoordinator.js   # Form flow coordinator
├── dataManagers.js                 # Data managers for each page
├── configurations.js               # Form variations and templates
└── RenewalFormSystem.js            # Main entry point
```

## 📋 Form Structure

### Page 1: Policy & Vehicle Details
- **OEM Selection**: Affects available makes, models, and variants
- **Proposer Type**: Individual vs Corporate (affects form fields)
- **Vehicle Cover**: TP, OD, or Comprehensive (affects form behavior)
- **Previous Policy Details**: Policy number, expiry dates, NCB level
- **Customer Details**: Basic customer information
- **Vehicle Details**: Make, model, variant, year, VIN, engine number
- **Registration Details**: Registration number, dates, city, state

### Page 2: Additional Details & Discounts (Dynamic Sections)
- **NCB Carry Forward**: Dynamic section based on NCB level selection
- **Voluntary Excess**: Dynamic section for deductible selection
- **AAI Membership**: Dynamic section for association membership
- **Handicapped Discount**: Dynamic section for handicapped persons
- **Anti-Theft Discount**: Dynamic section for anti-theft devices

### Page 3: Proposal Details
- **Personal Details**: Complete personal information
  - **Individual**: Name, Date of Birth, Gender, etc.
  - **Corporate**: Company details, authorized signatory details, **Date of Incorporation**
- **Address Information**: Full address with state, city, pincode
- **Identity Documents**: PAN, Aadhaar, EI account number
- **AA Membership Details**: Association membership information
- **NCB Carry Forward Details**: Previous vehicle and policy details
- **Policy Details**: Policy period and insurance company
- **Nominee Details**: Nominee information (conditional - only for Individual proposers)
- **Payment Details**: Payment mode and DP information

## 🔧 Key Components

### 1. BaseRenewalPage
Base class containing common utilities used across all pages:
- Material-UI dropdown selection
- Date picker handling with DatePickerCore integration
- Toggle button handling
- Input field filling
- Element waiting and scrolling utilities

### 2. Page-Specific Classes
Each page has its own class that extends BaseRenewalPage:
- **PolicyVehicleDetailsPage**: Handles Page 1 form filling
- **AdditionalDetailsPage**: Handles Page 2 with dynamic sections
- **ProposalDetailsPage**: Handles Page 3 proposal form

### 3. Data Managers
Specialized classes for processing and validating data:
- **Page1DataManager**: Processes Page 1 data with OEM-specific transformations
- **Page2DataManager**: Handles dynamic section data processing
- **Page3DataManager**: Manages complex proposal form data

### 4. RenewalFormFlowCoordinator
Orchestrates the complete form flow:
- Manages page transitions
- Tracks form state and variations
- Handles dynamic form behavior
- Provides validation and error handling

### 5. RenewalFormSystem
Main entry point providing multiple execution methods:
- Template-based execution
- Custom data execution
- OEM and cover type specific execution
- Dynamic sections execution
- Step-by-step execution for debugging

## 🚀 Usage Examples

### Basic Usage with Template
```javascript
const RenewalFormSystem = require('../pages/renewal/RenewalFormSystem');
const creds = require('../testdata/Auth.json');

test('Basic Renewal Test', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  await renewalFormSystem.executeWithTemplate(
    'basicRenewal',
    creds
  );
});
```

### Custom Data Execution
```javascript
test('Custom Data Test', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  await renewalFormSystem.executeWithCustomData(
    {
      oem: 'Tata',
      vehicleCover: '1 OD + 1 TP',
      make: 'Tata',
      model: 'NEXON',
      variant: 'XZ+',
      firstName: 'RAJESH',
      email: 'rajesh@example.com',
      mobile: '9876543210'
    },
    {
      ncbLevel: '25',
      voluntaryExcess: '3000',
      aaiMembership: true,
      antiTheftDiscount: true
    },
    {
      personalDetails: { /* personal details */ },
      nomineeDetails: { /* nominee details */ },
      paymentDetails: { /* payment details */ }
    },
    creds
  );
});
```

### Dynamic Sections Execution
```javascript
test('Dynamic Sections Test', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  await renewalFormSystem.executeWithDynamicSections(
    {
      ncbCarryForward: true,
      voluntaryExcess: true,
      aaiMembership: true,
      handicappedDiscount: false,
      antiTheftDiscount: true
    },
    creds,
    {
      page1: {
        oem: 'Ford',
        vehicleCover: 'OD',
        firstName: 'JOHN',
        email: 'john@example.com',
        mobile: '9876543210'
      }
    }
  );
});
```

### Step-by-Step Execution (Debugging)
```javascript
test('Debug Test', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  await renewalFormSystem.executeStepByStep(
    page1Data,
    page2Data,
    page3Data,
    creds,
    {
      pauseBetweenPages: true,
      takeScreenshots: true,
      validateEachStep: true
    }
  );
});
```

## 📊 Available Templates

The system includes predefined templates for common scenarios:

### 1. basicRenewal
- Simple renewal with basic TP coverage
- Individual proposer
- Minimal dynamic sections

### 2. comprehensiveRenewal
- Full comprehensive coverage (OD + TP)
- Individual proposer
- All dynamic sections enabled
- Complete proposal details

### 3. corporateRenewal
- Corporate proposer type
- Different form fields and validation
- Corporate-specific data structure

## 🔄 Dynamic Form Variations

The system handles various form variations based on user selections:

### OEM Variations
- **Ford**: Specific makes, models, and variants
- **Tata**: Different vehicle options and configurations
- **Maruti**: Maruti-specific vehicle lineup
- **Hyundai**: Hyundai vehicle options

### Vehicle Cover Variations
- **TP (Third Party)**: Hides OD-specific fields
- **OD (Own Damage)**: Shows OD policy fields
- **1 OD + 1 TP (Comprehensive)**: Shows all fields

### Proposer Type Variations
- **Individual**: 
  - Shows personal details fields
  - Date of Birth field
  - Nominee Details section
- **Corporate**: 
  - Shows corporate fields (company name, GST, etc.)
  - **Date of Incorporation** field (instead of Date of Birth)
  - Conditional Nominee Details (may not always be present)
  - Additional company-specific fields

### Dynamic Section Variations
- **NCB Carry Forward**: Appears when NCB level is selected
- **Voluntary Excess**: Shows when voluntary excess is enabled
- **AAI Membership**: Dynamic section for association membership
- **Handicapped Discount**: Special discount section
- **Anti-Theft Discount**: Anti-theft device discount section

## 🛠️ Configuration System

The configuration system allows easy customization:

### OEM Configurations
```javascript
const OEM_CONFIGURATIONS = {
  'Ford': {
    makes: ['Ford'],
    models: { 'Ford': ['ECOSPORT', 'FIGO', 'ASPIRE'] },
    variants: { 'ECOSPORT': ['1.0 ECOSPORT PTL TIT', '1.5 ECOSPORT AMT TIT'] }
  }
};
```

### Form Variation Configurations
```javascript
const FORM_VARIATION_CONFIGURATIONS = {
  'vehicleCoverVariations': {
    'TP': {
      hideFields: ['odPolicyExpiryDate', 'voluntaryExcess'],
      showFields: ['tpPolicyExpiryDate', 'ncbLevel']
    }
  }
};
```

## 🔍 Validation System

Comprehensive validation at multiple levels:

### Data Validation
- Required field validation
- Format validation (email, phone, PAN, Aadhaar)
- Business rule validation

### Form State Validation
- Cross-page data consistency
- Dynamic section dependencies
- Form completion validation

## 🐛 Debugging Features

### Step-by-Step Execution
- Execute form page by page
- Pause between pages for inspection
- Take screenshots at each step

### Form State Tracking
- Track current page and selections
- Monitor dynamic section states
- Log form progression

### Error Handling
- Comprehensive error messages
- Screenshot capture on errors
- Graceful fallback mechanisms

## ⚡ Performance Optimizations

### Recent Updates (Latest Version)

#### 1. Timeout Optimizations
- **Dropdown Click Timeout**: Reduced from 5 seconds to 2 seconds for faster failure detection
- **Proposal Page Loading**: Maintained 60-second timeout for complex form loading (required)
- **Final Preview Wait**: Reduced from 20 seconds to 5 seconds for faster test completion

#### 2. VIN Field Handling
- **Automatic VIN Generation**: System now automatically generates 17-character VIN numbers
- **Robust Field Detection**: Multiple fallback selectors for VIN field detection
- **Debug Logging**: Added comprehensive logging for VIN field filling process

#### 3. Error Handling Improvements
- **Graceful Timeout Handling**: Faster timeout detection for missing fields
- **Fallback Mechanisms**: Multiple approaches for field interaction
- **Comprehensive Logging**: Detailed logs for debugging form filling issues

#### 4. Test Performance Metrics
- **Previous Performance**: ~2.6 minutes for complete end-to-end test
- **Current Performance**: ~2.1 minutes for complete end-to-end test
- **Improvement**: ~19% faster execution time

#### 5. Corporate Proposer Support (Latest - December 2024)
- **Date of Incorporation**: Added support for corporate proposer date field
  - Field detection using multiple strategies
  - DOM tree traversal for robust field identification
  - Automatic fallback mechanisms
- **Nominee Details**: Enhanced to handle conditional section visibility
  - Graceful skipping when section is not present
  - Comprehensive logging for debugging
- **NCB Date Validation**: Fixed NCB certificate date requirements
  - Dates must be within last 3 years
  - Updated test data to meet validation rules
- **Wait Times**: Adjusted for manual verification
  - 15 seconds wait before Proposal Preview click
  - Allows verification of field filling correctness

### Performance Monitoring

#### Timeout Configuration
```javascript
// BaseRenewalPage.js - Optimized timeouts
await page.locator(selectLocator).click({ timeout: 2000 }); // Reduced from 5000ms
await list.waitFor({ state: 'visible', timeout: 10000 });   // Maintained for reliability

// ProposalDetailsPage.js - Critical timeouts maintained
await this.page.waitForSelector('input[name="DOB"]', { timeout: 60000 }); // Required for complex loading
```

#### VIN Generation Process
```javascript
// VehicleDetailsHandler.js - Automatic VIN generation
generateRandomVin() {
  return Array.from({ length: 17 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('').toUpperCase();
}
```

### Performance Best Practices

1. **Timeout Management**: Use appropriate timeouts for different operations
2. **Field Detection**: Implement multiple fallback selectors for critical fields
3. **Error Recovery**: Graceful handling of missing or unavailable fields
4. **Logging**: Comprehensive logging for performance monitoring and debugging

## 📈 Benefits of Modular Architecture

### 1. Reusability
- Each component can be reused across different test scenarios
- Common utilities shared across pages
- Template system for common configurations

### 2. Maintainability
- Clear separation of concerns
- Easy to modify individual components
- Centralized configuration management

### 3. Extensibility
- Easy to add new OEMs or vehicle covers
- Simple to add new dynamic sections
- Flexible data processing pipeline

### 4. Testability
- Individual components can be tested in isolation
- Multiple execution methods for different test scenarios
- Comprehensive debugging capabilities

### 5. Scalability
- Easy to add new form variations
- Simple to extend with new features
- Modular data processing

### 6. Performance
- Optimized timeout management for faster execution
- Automatic field generation (VIN, Engine numbers)
- Graceful error handling with minimal delays
- ~19% improvement in test execution time

## 🚀 Getting Started

1. **Import the RenewalFormSystem**:
   ```javascript
   const RenewalFormSystem = require('../pages/renewal/RenewalFormSystem');
   ```

2. **Create an instance**:
   ```javascript
   const renewalFormSystem = new RenewalFormSystem(page);
   ```

3. **Execute with your preferred method**:
   - Use templates for common scenarios
   - Use custom data for specific requirements
   - Use dynamic sections for complex forms
   - Use step-by-step for debugging

4. **Handle different scenarios**:
   - Different OEMs and vehicle covers
   - Individual vs Corporate proposers
   - Various dynamic section combinations

## 📝 Best Practices

1. **Use Templates**: Start with predefined templates and customize as needed
2. **Validate Data**: Always validate data before execution
3. **Handle Errors**: Implement proper error handling and logging
4. **Use Debugging**: Use step-by-step execution for complex scenarios
5. **Maintain State**: Track form state for complex flows
6. **Test Variations**: Test different OEM and cover combinations

This modular architecture provides a robust, maintainable, and extensible foundation for handling complex insurance renewal forms with dynamic variations.

## 📜 Recent Changes

For detailed information about the latest changes made to the renewal form system, please refer to:
- **[CHANGELOG_LATEST.md](./CHANGELOG_LATEST.md)** - Detailed changelog of recent updates
- Recent updates include:
  - Corporate Proposer Date of Incorporation support
  - Enhanced Nominee Details handling
  - NCB certificate date validation fixes
  - Improved field detection with DOM tree traversal
