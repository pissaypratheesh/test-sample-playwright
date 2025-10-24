/**
 * Data Manager for Page 1 - Policy & Vehicle Details
 * Handles data transformation and validation for Page 1 form
 */
class Page1DataManager {
  constructor() {
    this.defaultData = {
      proposerType: 'Individual',
      vehicleCover: 'TP',
      oem: 'Ford',
      make: 'Ford',
      model: 'ECOSPORT',
      variant: '1.0 ECOSPORT PTL TIT',
      year: '2024',
      registrationCity: 'DELHI CENTRAL DL 06 (DL)',
      customerState: 'DELHI',
      salutation: 'Mr.',
      firstName: 'JOHNNY',
      email: 'naer@hji.com',
      mobile: '8765456789'
    };
  }

  /**
   * Transform and validate Page 1 data
   * @param {Object} rawData - Raw input data
   * @returns {Object} Processed Page 1 data
   */
  processPage1Data(rawData) {
    console.log('🔄 Processing Page 1 data...');
    
    const processedData = {
      ...this.defaultData,
      ...rawData
    };

    // Validate required fields
    this.validatePage1Data(processedData);

    // Apply OEM-specific transformations
    this.applyOEMTransformations(processedData);

    // Apply vehicle cover transformations
    this.applyVehicleCoverTransformations(processedData);

    // Generate dynamic data
    this.generateDynamicData(processedData);

    console.log('✅ Page 1 data processed successfully');
    return processedData;
  }

  /**
   * Validate Page 1 data
   * @param {Object} data - Data to validate
   */
  validatePage1Data(data) {
    const requiredFields = [
      'oem', 'vehicleCover', 'make', 'model', 'variant', 'year',
      'firstName', 'email', 'mobile'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for Page 1: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Apply OEM-specific transformations
   * @param {Object} data - Data to transform
   */
  applyOEMTransformations(data) {
    const oemTransformations = {
      'Ford': {
        make: 'Ford',
        availableModels: ['ECOSPORT', 'FIGO', 'ASPIRE'],
        defaultModel: 'ECOSPORT'
      },
      'Tata': {
        make: 'Tata',
        availableModels: ['NEXON', 'TIAGO', 'TIGOR'],
        defaultModel: 'NEXON'
      },
      'Maruti': {
        make: 'Maruti',
        availableModels: ['SWIFT', 'BALENO', 'DZIRE'],
        defaultModel: 'SWIFT'
      }
    };

    const transformation = oemTransformations[data.oem];
    if (transformation) {
      data.make = transformation.make;
      if (!data.model || !transformation.availableModels.includes(data.model)) {
        data.model = transformation.defaultModel;
      }
    }
  }

  /**
   * Apply vehicle cover transformations
   * @param {Object} data - Data to transform
   */
  applyVehicleCoverTransformations(data) {
    const coverTransformations = {
      'TP': {
        requiresODPolicy: false,
        policyType: 'Third Party'
      },
      'OD': {
        requiresODPolicy: true,
        policyType: 'Own Damage'
      },
      '1 OD + 1 TP': {
        requiresODPolicy: true,
        policyType: 'Comprehensive'
      }
    };

    const transformation = coverTransformations[data.vehicleCover];
    if (transformation) {
      data.policyType = transformation.policyType;
      data.requiresODPolicy = transformation.requiresODPolicy;
    }
  }

  /**
   * Generate dynamic data for Page 1
   * @param {Object} data - Data to enhance
   */
  generateDynamicData(data) {
    // Generate random VIN and Engine numbers if not provided
    if (!data.vin) {
      data.vin = this.generateRandomVin();
    }
    if (!data.engineNo) {
      data.engineNo = this.generateRandomEngineNo();
    }

    // Generate registration details if not provided
    if (!data.registrationStateRto) {
      data.registrationStateRto = 'DL-06';
    }
    if (!data.registrationSeries) {
      data.registrationSeries = 'RAA';
    }
    if (!data.registrationNumber) {
      data.registrationNumber = this.generateRandomRegistrationNumber();
    }

    // Set default dates if not provided
    if (!data.invoiceDate) {
      data.invoiceDate = '01/01/2024';
    }
    if (!data.registrationDate) {
      data.registrationDate = '01/01/2024';
    }
    if (!data.odPolicyExpiryDate) {
      data.odPolicyExpiryDate = '10/10/2025';
    }
    if (!data.tpPolicyExpiryDate) {
      data.tpPolicyExpiryDate = '10/10/2025';
    }
  }

  /**
   * Generate random VIN number
   * @returns {string} Random VIN number
   */
  generateRandomVin() {
    return Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
  }

  /**
   * Generate random Engine number
   * @returns {string} Random Engine number
   */
  generateRandomEngineNo() {
    return Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
  }

  /**
   * Generate random registration number
   * @returns {string} Random registration number
   */
  generateRandomRegistrationNumber() {
    return Math.floor(Math.random() * 9000 + 1000).toString();
  }

  /**
   * Get OEM-specific configuration
   * @param {string} oem - OEM name
   * @returns {Object} OEM configuration
   */
  getOEMConfiguration(oem) {
    const configurations = {
      'Ford': {
        makes: ['Ford'],
        models: {
          'Ford': ['ECOSPORT', 'FIGO', 'ASPIRE', 'ENDEAVOUR']
        },
        variants: {
          'ECOSPORT': ['1.0 ECOSPORT PTL TIT', '1.5 ECOSPORT AMT TIT'],
          'FIGO': ['1.2 FIGO PETROL', '1.5 FIGO DIESEL']
        }
      },
      'Tata': {
        makes: ['Tata'],
        models: {
          'Tata': ['NEXON', 'TIAGO', 'TIGOR', 'HARRIER']
        },
        variants: {
          'NEXON': ['XZ+', 'XZ', 'XZ+ DARK'],
          'TIAGO': ['XT', 'XZ', 'XZ+']
        }
      }
    };

    return configurations[oem] || configurations['Ford'];
  }
}

/**
 * Data Manager for Page 2 - Additional Details & Discounts
 * Handles dynamic section data based on checkbox selections
 */
class Page2DataManager {
  constructor() {
    this.defaultData = {
      ncbLevel: '20',
      voluntaryExcess: '2500',
      aaiMembership: false,
      handicappedDiscount: false,
      antiTheftDiscount: false
    };
  }

  /**
   * Process Page 2 data with dynamic sections
   * @param {Object} rawData - Raw input data
   * @returns {Object} Processed Page 2 data
   */
  processPage2Data(rawData) {
    console.log('🔄 Processing Page 2 data...');
    
    const processedData = {
      ...this.defaultData,
      ...rawData
    };

    // Determine which sections should be enabled
    this.determineDynamicSections(processedData);

    // Apply section-specific transformations
    this.applySectionTransformations(processedData);

    console.log('✅ Page 2 data processed successfully');
    return processedData;
  }

  /**
   * Determine which dynamic sections should be enabled
   * @param {Object} data - Data to process
   */
  determineDynamicSections(data) {
    // NCB Carry Forward section
    data.enableNCBCarryForward = !!(data.ncbLevel || data.ncb);

    // Voluntary Excess section
    data.enableVoluntaryExcess = !!(data.voluntaryExcess);

    // AAI Membership section
    data.enableAAIMembership = !!(data.aaiMembership);

    // Handicapped Discount section
    data.enableHandicappedDiscount = !!(data.handicappedDiscount);

    // Anti-Theft Discount section
    data.enableAntiTheftDiscount = !!(data.antiTheftDiscount);
  }

  /**
   * Apply section-specific transformations
   * @param {Object} data - Data to transform
   */
  applySectionTransformations(data) {
    // NCB Level transformation
    if (data.ncbLevel) {
      data.ncbLevel = this.normalizeNCBLevel(data.ncbLevel);
    }

    // Voluntary Excess transformation
    if (data.voluntaryExcess) {
      data.voluntaryExcess = this.normalizeVoluntaryExcess(data.voluntaryExcess);
    }
  }

  /**
   * Normalize NCB Level value
   * @param {string|number} ncbLevel - NCB Level value
   * @returns {string} Normalized NCB Level
   */
  normalizeNCBLevel(ncbLevel) {
    const value = ncbLevel.toString();
    if (value.includes('%')) {
      return value.replace('%', '');
    }
    return value;
  }

  /**
   * Normalize Voluntary Excess value
   * @param {string|number} voluntaryExcess - Voluntary Excess value
   * @returns {string} Normalized Voluntary Excess
   */
  normalizeVoluntaryExcess(voluntaryExcess) {
    const value = voluntaryExcess.toString();
    if (value.includes('Rs') || value.includes('₹')) {
      return value.replace(/[Rs₹,\s]/g, '');
    }
    return value;
  }

  /**
   * Get available NCB levels
   * @returns {Array} Available NCB levels
   */
  getAvailableNCBLevels() {
    return ['0', '20', '25', '35', '45', '50'];
  }

  /**
   * Get available Voluntary Excess amounts
   * @returns {Array} Available Voluntary Excess amounts
   */
  getAvailableVoluntaryExcessAmounts() {
    return ['1000', '1500', '2000', '2500', '3000', '5000'];
  }
}

/**
 * Data Manager for Page 3 - Proposal Details
 * Handles complex proposal form data with multiple sections
 */
class Page3DataManager {
  constructor() {
    this.defaultData = {
      personalDetails: {
        salutation: 'Mr.',
        firstName: 'JOHN',
        middleName: 'WILLIAM',
        lastName: 'DOE',
        dateOfBirth: '01/01/1995',
        email: 'john.doe@example.com',
        mobileNo: '9876543210',
        alternateMobileNo: '9876543211',
        addressLine1: '123 Main Street',
        addressLine2: 'Apartment 4B',
        landmark: 'Near City Mall',
        state: 'DELHI',
        city: 'NEW DELHI',
        pinCode: '110001',
        panNo: 'ABCDE1234F',
        aadhaarNo: '123456789012',
        eiAccountNo: ''
      },
      aaMembershipDetails: {
        associationName: 'Automobile Association of Eastern India',
        membershipNo: 'AA123456789',
        validityMonth: 'Dec',
        year: '2026'
      },
      ncbCarryForwardDetails: {
        make: 'TATA',
        model: 'NEXON',
        variant: 'XZ+',
        yearOfManufacturer: '2020',
        chasisNo: 'MAT123456789012345',
        engineNo: 'ENG123456789012345',
        invoiceDate: '15/01/2020',
        registrationNo: 'DL09RAA5445',
        previousPolicyNo: 'POL123456789',
        ncbDocumentSubmitted: true,
        insuranceCompany: 'TATA AIG General Insurance',
        officeAddress: 'Mumbai Office',
        policyPeriodFrom: '18/10/2025',
        policyPeriodTo: '17/10/2026'
      },
      policyDetails: {
        policyPeriodFrom: '18/10/2025',
        policyPeriodTo: '17/10/2026',
        insuranceCompany: 'TATA AIG General Insurance',
        officeAddress: 'Mumbai Office'
      },
      nomineeDetails: {
        nomineeName: 'Jane Doe',
        nomineeAge: '35',
        nomineeRelation: 'Spouse',
        nomineeGender: 'Female'
      },
      paymentDetails: {
        paymentMode: 'Credit Card',
        dpName: 'Ashutosh DP'
      }
    };
  }

  /**
   * Process Page 3 data
   * @param {Object} rawData - Raw input data
   * @returns {Object} Processed Page 3 data
   */
  processPage3Data(rawData) {
    console.log('🔄 Processing Page 3 data...');
    
    const processedData = this.deepMerge(this.defaultData, rawData);

    // Validate required sections
    this.validatePage3Data(processedData);

    // Apply data transformations
    this.applyDataTransformations(processedData);

    // Generate missing data
    this.generateMissingData(processedData);

    console.log('✅ Page 3 data processed successfully');
    return processedData;
  }

  /**
   * Deep merge objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Validate Page 3 data
   * @param {Object} data - Data to validate
   */
  validatePage3Data(data) {
    const requiredSections = ['personalDetails', 'nomineeDetails', 'paymentDetails'];
    
    for (const section of requiredSections) {
      if (!data[section]) {
        throw new Error(`Missing required section: ${section}`);
      }
    }

    // Validate personal details
    const personalRequired = ['firstName', 'dateOfBirth', 'email', 'mobileNo'];
    for (const field of personalRequired) {
      if (!data.personalDetails[field]) {
        throw new Error(`Missing required personal detail: ${field}`);
      }
    }

    // Validate nominee details
    const nomineeRequired = ['nomineeName', 'nomineeAge', 'nomineeRelation', 'nomineeGender'];
    for (const field of nomineeRequired) {
      if (!data.nomineeDetails[field]) {
        throw new Error(`Missing required nominee detail: ${field}`);
      }
    }

    // Validate payment details
    const paymentRequired = ['paymentMode', 'dpName'];
    for (const field of paymentRequired) {
      if (!data.paymentDetails[field]) {
        throw new Error(`Missing required payment detail: ${field}`);
      }
    }
  }

  /**
   * Apply data transformations
   * @param {Object} data - Data to transform
   */
  applyDataTransformations(data) {
    // Transform date formats
    this.transformDateFormats(data);

    // Transform phone numbers
    this.transformPhoneNumbers(data);

    // Transform PAN and Aadhaar numbers
    this.transformIdentityNumbers(data);
  }

  /**
   * Transform date formats
   * @param {Object} data - Data to transform
   */
  transformDateFormats(data) {
    const dateFields = [
      'personalDetails.dateOfBirth',
      'ncbCarryForwardDetails.invoiceDate',
      'ncbCarryForwardDetails.policyPeriodFrom',
      'ncbCarryForwardDetails.policyPeriodTo',
      'policyDetails.policyPeriodFrom',
      'policyDetails.policyPeriodTo'
    ];

    for (const fieldPath of dateFields) {
      const value = this.getNestedValue(data, fieldPath);
      if (value) {
        this.setNestedValue(data, fieldPath, this.normalizeDateFormat(value));
      }
    }
  }

  /**
   * Transform phone numbers
   * @param {Object} data - Data to transform
   */
  transformPhoneNumbers(data) {
    const phoneFields = [
      'personalDetails.mobileNo',
      'personalDetails.alternateMobileNo'
    ];

    for (const fieldPath of phoneFields) {
      const value = this.getNestedValue(data, fieldPath);
      if (value) {
        this.setNestedValue(data, fieldPath, this.normalizePhoneNumber(value));
      }
    }
  }

  /**
   * Transform identity numbers
   * @param {Object} data - Data to transform
   */
  transformIdentityNumbers(data) {
    // PAN Number
    if (data.personalDetails.panNo) {
      data.personalDetails.panNo = data.personalDetails.panNo.toUpperCase();
    }

    // Aadhaar Number
    if (data.personalDetails.aadhaarNo) {
      data.personalDetails.aadhaarNo = data.personalDetails.aadhaarNo.replace(/\D/g, '');
    }
  }

  /**
   * Generate missing data
   * @param {Object} data - Data to enhance
   */
  generateMissingData(data) {
    // Generate random data for missing fields
    if (!data.personalDetails.middleName) {
      data.personalDetails.middleName = 'WILLIAM';
    }
    if (!data.personalDetails.lastName) {
      data.personalDetails.lastName = 'DOE';
    }
    if (!data.personalDetails.alternateMobileNo) {
      data.personalDetails.alternateMobileNo = this.generateAlternateMobileNumber(data.personalDetails.mobileNo);
    }
    if (!data.personalDetails.eiAccountNo) {
      data.personalDetails.eiAccountNo = '';
    }
  }

  /**
   * Get nested value from object
   * @param {Object} obj - Object to get value from
   * @param {string} path - Path to the value
   * @returns {*} Value at the path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value in object
   * @param {Object} obj - Object to set value in
   * @param {string} path - Path to set the value
   * @param {*} value - Value to set
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Normalize date format
   * @param {string} date - Date string
   * @returns {string} Normalized date string
   */
  normalizeDateFormat(date) {
    // Convert various date formats to DD/MM/YYYY
    if (typeof date === 'string') {
      // Handle different separators
      const normalized = date.replace(/[-.]/g, '/');
      
      // Handle different orders (YYYY/MM/DD -> DD/MM/YYYY)
      const parts = normalized.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY/MM/DD format
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return normalized;
      }
    }
    return date;
  }

  /**
   * Normalize phone number
   * @param {string} phone - Phone number
   * @returns {string} Normalized phone number
   */
  normalizePhoneNumber(phone) {
    return phone.replace(/\D/g, '');
  }

  /**
   * Generate alternate mobile number
   * @param {string} primaryMobile - Primary mobile number
   * @returns {string} Alternate mobile number
   */
  generateAlternateMobileNumber(primaryMobile) {
    const normalized = this.normalizePhoneNumber(primaryMobile);
    const lastDigit = parseInt(normalized.slice(-1));
    const newLastDigit = (lastDigit + 1) % 10;
    return normalized.slice(0, -1) + newLastDigit;
  }

  /**
   * Get available salutations
   * @returns {Array} Available salutations
   */
  getAvailableSalutations() {
    return ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
  }

  /**
   * Get available nominee relations
   * @returns {Array} Available nominee relations
   */
  getAvailableNomineeRelations() {
    return ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];
  }

  /**
   * Get available payment modes
   * @returns {Array} Available payment modes
   */
  getAvailablePaymentModes() {
    return ['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallet'];
  }
}

module.exports = {
  Page1DataManager,
  Page2DataManager,
  Page3DataManager
};
