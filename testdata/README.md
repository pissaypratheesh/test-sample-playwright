# Test Data Directory Structure

This directory contains all test data files organized into logical subfolders for better maintainability and clarity.

## 📁 Directory Structure

```
testdata/
├── auth/                        # Authentication data
│   ├── Auth.json               # Main authentication credentials
│   └── PolicyIssuance_Credentials.json  # Policy issuance specific credentials
│
├── policy/                     # Policy-related test data
│   ├── PolicyIssuanceData.json # Complete policy issuance data
│   ├── renewTatadata.json      # Tata renewal policy data
│   ├── renewTatadataOld.json   # Legacy Tata renewal data
│   ├── renewdata.json          # General renewal data
│   └── renewTata.data.json     # Additional Tata renewal data
│
├── vehicle/                    # Vehicle-specific test data
│   └── withtoggle.json        # Vehicle data with toggle configurations
│
├── proposal/                   # Proposal details test data
│   └── proposalDetails.json   # Complete proposal details structure
│
└── generated/                  # Auto-generated test data
    ├── generated_engine.json           # Generated engine numbers
    ├── generated_renew_values.json     # Generated renewal values
    ├── generated_renew_vin_engine.json # Generated VIN and engine pairs
    ├── generated_values.json          # General generated values
    ├── generated_vin.json             # Generated VIN numbers
    └── generated_withtoggle.json      # Generated data with toggles
```

## 🎯 Purpose of Each Folder

### **auth/**
Contains authentication-related test data including:
- Login credentials
- User authentication information
- Policy issuance specific credentials

### **policy/**
Contains policy-related test data including:
- Policy issuance data
- Renewal policy data
- Policy configuration data
- Legacy policy data for backward compatibility

### **vehicle/**
Contains vehicle-specific test data including:
- Vehicle make, model, variant information
- Registration details
- Vehicle configuration data

### **proposal/**
Contains proposal details test data including:
- Personal information
- Contact details
- Address information
- Identity documents
- Policy details
- Nominee information
- Payment details

### **generated/**
Contains auto-generated test data including:
- Dynamically generated VIN numbers
- Engine numbers
- Test values for various scenarios
- Randomized data for testing

## 📝 Usage Examples

### Authentication Data
```javascript
const creds = require('../testdata/auth/Auth.json');
```

### Policy Data
```javascript
const testdata = require('../testdata/policy/renewTatadata.json');
```

### Proposal Details
```javascript
const proposalDetails = require('../testdata/proposal/proposalDetails.json');
```

### Vehicle Data
```javascript
const vehicleData = require('../testdata/vehicle/withtoggle.json');
```

### Generated Data
```javascript
const generatedData = require('../testdata/generated/generated_values.json');
```

## 🔧 Data Structure Guidelines

### Authentication Files
- **username**: User login identifier
- **password**: User password
- **firstName**: User's first name
- **email**: User's email address
- **mobile**: User's mobile number

### Policy Files
- **prevPolicyType**: Previous policy type
- **oem**: Original Equipment Manufacturer
- **prevPolicyNo**: Previous policy number
- **vehicleCover**: Vehicle coverage type
- **ncb**: No Claim Bonus percentage
- **make/model/variant**: Vehicle details
- **year**: Manufacturing year
- **registrationCity**: Registration city
- **customerState**: Customer state

### Proposal Files
- **personalDetails**: Personal information section
- **aaMembershipDetails**: AA membership information
- **ncbCarryForwardDetails**: NCB carry forward details
- **policyDetails**: Policy-specific information
- **nomineeDetails**: Nominee information
- **paymentDetails**: Payment information
- **actions**: Action flags for testing

### Generated Files
- **vin**: Vehicle Identification Number
- **engineNo**: Engine number
- **engine**: Engine identifier

## 🚀 Benefits of This Organization

1. **Clear Separation**: Each type of test data is clearly separated
2. **Easy Maintenance**: Easy to find and update specific data types
3. **Scalability**: Easy to add new data files in appropriate folders
4. **Reusability**: Data can be easily reused across different tests
5. **Version Control**: Better tracking of changes to specific data types
6. **Team Collaboration**: Clear structure for team members to understand

## 📋 Maintenance Guidelines

- **Naming Convention**: Use descriptive names that indicate the purpose
- **Data Validation**: Ensure all required fields are present
- **Version Control**: Track changes to test data files
- **Documentation**: Update this README when adding new data structures
- **Consistency**: Maintain consistent data formats across similar files
- **Cleanup**: Remove unused or outdated test data files

## 🔍 Finding Test Data

To find specific test data:
1. **Authentication**: Look in `auth/` folder
2. **Policy Information**: Look in `policy/` folder
3. **Vehicle Details**: Look in `vehicle/` folder
4. **Proposal Forms**: Look in `proposal/` folder
5. **Generated Data**: Look in `generated/` folder

This organization makes it easy to locate and maintain test data while keeping the codebase clean and organized.
