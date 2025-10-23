/**
 * Test Configuration - Reusable settings for all tests
 */
const config = {
  // Application URLs
  baseUrl: 'https://uatlifekaplan.tmibasl.in/',
  dashboardUrl: '**/dashboard',
  policyIssuanceUrl: '**/createPolicy',

  // Timeouts (in milliseconds)
  timeouts: {
    default: 30000,
    navigation: 60000,
    element: 10000,
    network: 30000,
    test: 120000
  },

  // Retry settings
  retries: {
    default: 3,
    critical: 5,
    nonCritical: 2
  },

  // Test data paths
  dataPaths: {
    renewalData: '../testdata/renewTatadata.json',
    authData: '../testdata/Auth.json',
    proposalData: '../testdata/proposalDetails.json'
  },

  // Screenshot settings
  screenshots: {
    directory: '.playwright-mcp/',
    format: 'png',
    fullPage: true
  },

  // Browser settings
  browser: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    slowMo: 100
  },

  // Form field mappings
  fieldMappings: {
    // OEM options
    oem: ['2W', 'CVBU', 'FORD', 'PVBU'],
    
    // NCB percentage mappings
    ncbMapping: {
      '0%': '0',
      '20%': '20',
      '25%': '25',
      '35%': '35',
      '45%': '45',
      '50%': '50',
      '55%': '55',
      '65%': '65'
    },

    // Vehicle cover options
    vehicleCover: ['1 OD + 1 TP', '0 OD + 1 TP', '1 OD + 3 TP', '1 OD + 0 TP'],

    // Salutation options
    salutation: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'],

    // Proposer types
    proposerType: ['Individual', 'Corporate'],

    // Vehicle classes
    vehicleClass: ['Private', 'Commercial']
  },

  // Validation rules
  validation: {
    requiredFields: [
      'OEM *',
      'Previous Policy No *',
      'Previous Vehicle Cover *',
      'Previous NCB % *',
      'Previous OD Policy IC *',
      'Vehicle Cover *'
    ],
    
    fieldPatterns: {
      policyNo: /^[A-Z0-9]{8,12}$/,
      mobile: /^[6-9]\d{9}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      aadhaar: /^\d{12}$/
    }
  },

  // Error messages
  errorMessages: {
    elementNotFound: 'Element not found or not visible',
    timeout: 'Operation timed out',
    validationFailed: 'Form validation failed',
    networkError: 'Network request failed',
    loginFailed: 'Login failed - check credentials'
  }
};

module.exports = config;
