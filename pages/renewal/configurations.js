/**
 * Configuration for different form variations and checkbox combinations
 * This file contains predefined configurations for various form scenarios
 */

/**
 * OEM-specific configurations
 */
const OEM_CONFIGURATIONS = {
  'Ford': {
    name: 'Ford',
    makes: ['Ford'],
    models: {
      'Ford': ['ECOSPORT', 'FIGO', 'ASPIRE', 'ENDEAVOUR', 'MUSTANG']
    },
    variants: {
      'ECOSPORT': [
        '1.0 ECOSPORT PTL TIT',
        '1.5 ECOSPORT AMT TIT',
        '1.5 ECOSPORT DIESEL TIT'
      ],
      'FIGO': [
        '1.2 FIGO PETROL',
        '1.5 FIGO DIESEL',
        '1.5 FIGO AMT'
      ],
      'ASPIRE': [
        '1.2 ASPIRE PETROL',
        '1.5 ASPIRE DIESEL'
      ]
    },
    defaultModel: 'ECOSPORT',
    defaultVariant: '1.0 ECOSPORT PTL TIT',
    supportedYears: ['2020', '2021', '2022', '2023', '2024'],
    defaultYear: '2024'
  },
  
  'Tata': {
    name: 'Tata',
    makes: ['Tata'],
    models: {
      'Tata': ['NEXON', 'TIAGO', 'TIGOR', 'HARRIER', 'SAFARI']
    },
    variants: {
      'NEXON': [
        'XZ+',
        'XZ',
        'XZ+ DARK',
        'XZ+ DARK EDITION'
      ],
      'TIAGO': [
        'XT',
        'XZ',
        'XZ+',
        'XZ+ DARK'
      ],
      'TIGOR': [
        'XZ',
        'XZ+',
        'XZ+ DARK'
      ]
    },
    defaultModel: 'NEXON',
    defaultVariant: 'XZ+',
    supportedYears: ['2020', '2021', '2022', '2023', '2024'],
    defaultYear: '2024'
  },
  
  'Maruti': {
    name: 'Maruti',
    makes: ['Maruti'],
    models: {
      'Maruti': ['SWIFT', 'BALENO', 'DZIRE', 'ERTIGA', 'BREZZA']
    },
    variants: {
      'SWIFT': [
        'LXI',
        'VXI',
        'ZXI',
        'ZXI AMT'
      ],
      'BALENO': [
        'SIGMA',
        'DELTA',
        'ZETA',
        'ALPHA'
      ],
      'DZIRE': [
        'LXI',
        'VXI',
        'ZXI',
        'ZXI AMT'
      ]
    },
    defaultModel: 'SWIFT',
    defaultVariant: 'ZXI',
    supportedYears: ['2020', '2021', '2022', '2023', '2024'],
    defaultYear: '2024'
  },
  
  'Hyundai': {
    name: 'Hyundai',
    makes: ['Hyundai'],
    models: {
      'Hyundai': ['I20', 'I10', 'CRETA', 'VENUE', 'ELANTRA']
    },
    variants: {
      'I20': [
        'MAGNA',
        'SPORTZ',
        'ASTA',
        'ASTA O'
      ],
      'I10': [
        'MAGNA',
        'SPORTZ',
        'ASTA'
      ],
      'CRETA': [
        'E',
        'EX',
        'SX',
        'SX O'
      ]
    },
    defaultModel: 'I20',
    defaultVariant: 'SPORTZ',
    supportedYears: ['2020', '2021', '2022', '2023', '2024'],
    defaultYear: '2024'
  }
};

/**
 * Vehicle Cover configurations
 */
const VEHICLE_COVER_CONFIGURATIONS = {
  'TP': {
    name: 'Third Party',
    description: 'Third Party Liability Coverage',
    requiresODPolicy: false,
    policyType: 'Third Party',
    coverageDetails: {
      thirdPartyLiability: true,
      ownDamage: false,
      personalAccident: true
    },
    formFields: {
      showODPolicyExpiry: false,
      showODPolicyDetails: false,
      showNCBCarryForward: true,
      showVoluntaryExcess: false
    }
  },
  
  'OD': {
    name: 'Own Damage',
    description: 'Own Damage Coverage',
    requiresODPolicy: true,
    policyType: 'Own Damage',
    coverageDetails: {
      thirdPartyLiability: false,
      ownDamage: true,
      personalAccident: false
    },
    formFields: {
      showODPolicyExpiry: true,
      showODPolicyDetails: true,
      showNCBCarryForward: true,
      showVoluntaryExcess: true
    }
  },
  
  '1 OD + 1 TP': {
    name: 'Comprehensive',
    description: 'Comprehensive Coverage (OD + TP)',
    requiresODPolicy: true,
    policyType: 'Comprehensive',
    coverageDetails: {
      thirdPartyLiability: true,
      ownDamage: true,
      personalAccident: true
    },
    formFields: {
      showODPolicyExpiry: true,
      showODPolicyDetails: true,
      showNCBCarryForward: true,
      showVoluntaryExcess: true
    }
  }
};

/**
 * Proposer Type configurations
 */
const PROPOSER_TYPE_CONFIGURATIONS = {
  'Individual': {
    name: 'Individual',
    description: 'Individual Proposer',
    formFields: {
      showCorporateFields: false,
      showIndividualFields: true,
      showGSTNumber: false,
      showCompanyName: false,
      showAuthorizedSignatory: false
    },
    requiredFields: [
      'firstName',
      'lastName',
      'dateOfBirth',
      'email',
      'mobile',
      'address',
      'panNo',
      'aadhaarNo'
    ]
  },
  
  'Corporate': {
    name: 'Corporate',
    description: 'Corporate Proposer',
    formFields: {
      showCorporateFields: true,
      showIndividualFields: false,
      showGSTNumber: true,
      showCompanyName: true,
      showAuthorizedSignatory: true
    },
    requiredFields: [
      'companyName',
      'gstNumber',
      'authorizedSignatory',
      'email',
      'mobile',
      'address',
      'panNo'
    ]
  }
};

/**
 * Dynamic Section configurations
 */
const DYNAMIC_SECTION_CONFIGURATIONS = {
  'ncbCarryForward': {
    name: 'NCB Carry Forward',
    description: 'No Claim Bonus Carry Forward',
    triggerFields: ['ncbLevel', 'ncb'],
    formFields: {
      showNCBLevel: true,
      showPreviousPolicyDetails: true,
      showNCBDocumentUpload: true
    },
    validationRules: {
      ncbLevel: {
        required: true,
        type: 'string',
        validValues: ['0', '20', '25', '35', '45', '50']
      },
      previousPolicyNo: {
        required: true,
        type: 'string',
        minLength: 5
      }
    }
  },
  
  'voluntaryExcess': {
    name: 'Voluntary Excess',
    description: 'Voluntary Deductible',
    triggerFields: ['voluntaryExcess'],
    formFields: {
      showVoluntaryExcessAmount: true,
      showVoluntaryExcessOptions: true
    },
    validationRules: {
      voluntaryExcess: {
        required: true,
        type: 'string',
        validValues: ['1000', '1500', '2000', '2500', '3000', '5000']
      }
    }
  },
  
  'aaiMembership': {
    name: 'AAI Membership',
    description: 'Automobile Association of India Membership',
    triggerFields: ['aaiMembership'],
    formFields: {
      showAssociationName: true,
      showMembershipNumber: true,
      showValidityDetails: true
    },
    validationRules: {
      associationName: {
        required: true,
        type: 'string'
      },
      membershipNo: {
        required: true,
        type: 'string',
        minLength: 5
      }
    }
  },
  
  'handicappedDiscount': {
    name: 'Handicapped Discount',
    description: 'Discount for Handicapped Persons',
    triggerFields: ['handicappedDiscount'],
    formFields: {
      showHandicappedCertificate: true,
      showDiscountPercentage: true
    },
    validationRules: {
      handicappedCertificate: {
        required: true,
        type: 'file'
      }
    }
  },
  
  'antiTheftDiscount': {
    name: 'Anti-Theft Discount',
    description: 'Discount for Anti-Theft Devices',
    triggerFields: ['antiTheftDiscount'],
    formFields: {
      showAntiTheftDeviceDetails: true,
      showDiscountPercentage: true
    },
    validationRules: {
      antiTheftDevice: {
        required: true,
        type: 'string'
      }
    }
  }
};

/**
 * Form Variation Configurations
 * These define how the form changes based on different selections
 */
const FORM_VARIATION_CONFIGURATIONS = {
  'oemVariations': {
    'Ford': {
      affectsFields: ['make', 'model', 'variant'],
      dynamicUpdates: {
        make: 'Ford',
        availableModels: ['ECOSPORT', 'FIGO', 'ASPIRE'],
        defaultModel: 'ECOSPORT'
      }
    },
    'Tata': {
      affectsFields: ['make', 'model', 'variant'],
      dynamicUpdates: {
        make: 'Tata',
        availableModels: ['NEXON', 'TIAGO', 'TIGOR'],
        defaultModel: 'NEXON'
      }
    }
  },
  
  'vehicleCoverVariations': {
    'TP': {
      affectsFields: ['odPolicyExpiryDate', 'voluntaryExcess'],
      dynamicUpdates: {
        hideFields: ['odPolicyExpiryDate', 'voluntaryExcess'],
        showFields: ['tpPolicyExpiryDate', 'ncbLevel']
      }
    },
    'OD': {
      affectsFields: ['tpPolicyExpiryDate', 'ncbLevel'],
      dynamicUpdates: {
        hideFields: ['tpPolicyExpiryDate'],
        showFields: ['odPolicyExpiryDate', 'voluntaryExcess', 'ncbLevel']
      }
    },
    '1 OD + 1 TP': {
      affectsFields: [],
      dynamicUpdates: {
        showFields: ['odPolicyExpiryDate', 'tpPolicyExpiryDate', 'voluntaryExcess', 'ncbLevel']
      }
    }
  },
  
  'proposerTypeVariations': {
    'Individual': {
      affectsFields: ['companyName', 'gstNumber', 'authorizedSignatory'],
      dynamicUpdates: {
        hideFields: ['companyName', 'gstNumber', 'authorizedSignatory'],
        showFields: ['firstName', 'lastName', 'dateOfBirth', 'panNo', 'aadhaarNo']
      }
    },
    'Corporate': {
      affectsFields: ['firstName', 'lastName', 'dateOfBirth', 'aadhaarNo'],
      dynamicUpdates: {
        hideFields: ['firstName', 'lastName', 'dateOfBirth', 'aadhaarNo'],
        showFields: ['companyName', 'gstNumber', 'authorizedSignatory', 'panNo']
      }
    }
  }
};

/**
 * Test Data Templates
 * Predefined data templates for different test scenarios
 */
const TEST_DATA_TEMPLATES = {
  'basicRenewal': {
    page1: {
      oem: 'Ford',
      vehicleCover: 'TP',
      proposerType: 'Individual',
      make: 'Ford',
      model: 'ECOSPORT',
      variant: '1.0 ECOSPORT PTL TIT',
      year: '2024',
      firstName: 'JOHN',
      email: 'john@example.com',
      mobile: '9876543210'
    },
    page2: {
      ncbLevel: '20',
      voluntaryExcess: '2500',
      aaiMembership: false,
      handicappedDiscount: false,
      antiTheftDiscount: false
    },
    page3: {
      personalDetails: {
        salutation: 'Mr.',
        firstName: 'JOHN',
        lastName: 'DOE',
        dateOfBirth: '01/01/1990',
        email: 'john@example.com',
        mobileNo: '9876543210'
      },
      nomineeDetails: {
        nomineeName: 'Jane Doe',
        nomineeAge: '30',
        nomineeRelation: 'Spouse',
        nomineeGender: 'Female'
      },
      paymentDetails: {
        paymentMode: 'Credit Card',
        dpName: 'Test DP'
      }
    }
  },
  
  'comprehensiveRenewal': {
    page1: {
      oem: 'Tata',
      vehicleCover: '1 OD + 1 TP',
      proposerType: 'Individual',
      make: 'Tata',
      model: 'NEXON',
      variant: 'XZ+',
      year: '2024',
      firstName: 'RAJESH',
      email: 'rajesh@example.com',
      mobile: '9876543211'
    },
    page2: {
      ncbLevel: '25',
      voluntaryExcess: '3000',
      aaiMembership: true,
      handicappedDiscount: false,
      antiTheftDiscount: true
    },
    page3: {
      personalDetails: {
        salutation: 'Mr.',
        firstName: 'RAJESH',
        lastName: 'KUMAR',
        dateOfBirth: '15/05/1985',
        email: 'rajesh@example.com',
        mobileNo: '9876543211'
      },
      aaMembershipDetails: {
        associationName: 'Automobile Association of Eastern India',
        membershipNo: 'AA123456789',
        validityMonth: 'Dec',
        year: '2026'
      },
      ncbCarryForwardDetails: {
        make: 'Tata',
        model: 'NEXON',
        variant: 'XZ+',
        yearOfManufacturer: '2020',
        chasisNo: 'MAT123456789012345',
        engineNo: 'ENG123456789012345',
        invoiceDate: '15/01/2020',
        registrationNo: 'DL09RAA5445',
        previousPolicyNo: 'POL123456789',
        ncbDocumentSubmitted: true
      },
      nomineeDetails: {
        nomineeName: 'Priya Kumar',
        nomineeAge: '35',
        nomineeRelation: 'Spouse',
        nomineeGender: 'Female'
      },
      paymentDetails: {
        paymentMode: 'Net Banking',
        dpName: 'Test DP'
      }
    }
  },
  
  'corporateRenewal': {
    page1: {
      oem: 'Maruti',
      vehicleCover: 'OD',
      proposerType: 'Corporate',
      make: 'Maruti',
      model: 'SWIFT',
      variant: 'ZXI',
      year: '2024',
      companyName: 'ABC Corporation',
      gstNumber: '29ABCDE1234F1Z5',
      email: 'corporate@example.com',
      mobile: '9876543212'
    },
    page2: {
      ncbLevel: '35',
      voluntaryExcess: '2000',
      aaiMembership: false,
      handicappedDiscount: false,
      antiTheftDiscount: false
    },
    page3: {
      personalDetails: {
        salutation: 'Mr.',
        firstName: 'CORPORATE',
        lastName: 'USER',
        dateOfBirth: '01/01/1980',
        email: 'corporate@example.com',
        mobileNo: '9876543212'
      },
      nomineeDetails: {
        nomineeName: 'Corporate Nominee',
        nomineeAge: '40',
        nomineeRelation: 'Other',
        nomineeGender: 'Male'
      },
      paymentDetails: {
        paymentMode: 'UPI',
        dpName: 'Corporate DP'
      }
    }
  }
};

/**
 * Validation Rules
 */
const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  mobile: {
    pattern: /^[6-9]\d{9}$/,
    message: 'Please enter a valid 10-digit mobile number'
  },
  panNo: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    message: 'Please enter a valid PAN number'
  },
  aadhaarNo: {
    pattern: /^\d{12}$/,
    message: 'Please enter a valid 12-digit Aadhaar number'
  },
  dateOfBirth: {
    pattern: /^\d{2}\/\d{2}\/\d{4}$/,
    message: 'Please enter date in DD/MM/YYYY format'
  }
};

module.exports = {
  OEM_CONFIGURATIONS,
  VEHICLE_COVER_CONFIGURATIONS,
  PROPOSER_TYPE_CONFIGURATIONS,
  DYNAMIC_SECTION_CONFIGURATIONS,
  FORM_VARIATION_CONFIGURATIONS,
  TEST_DATA_TEMPLATES,
  VALIDATION_RULES
};
