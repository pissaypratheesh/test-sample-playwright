/**
 * Form Validation Manager
 * Handles form data validation
 */
class FormValidationManager {
  constructor() {
    this.validationRules = {
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
  }

  /**
   * Validate policy vehicle data
   * @param {Object} data - Policy vehicle data
   */
  validatePolicyVehicleData(data) {
    const requiredFields = [
      'oem', 'vehicleCover', 'make', 'model', 'variant', 'year',
      'firstName', 'email', 'mobile'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for Policy Vehicle Data: ${missingFields.join(', ')}`);
    }

    // Validate email format
    if (data.email && !this.validationRules.email.pattern.test(data.email)) {
      throw new Error(this.validationRules.email.message);
    }

    // Validate mobile format
    if (data.mobile && !this.validationRules.mobile.pattern.test(data.mobile)) {
      throw new Error(this.validationRules.mobile.message);
    }
  }

  /**
   * Validate additional details data
   * @param {Object} data - Additional details data
   */
  validateAdditionalDetailsData(data) {
    // NCB Level validation
    if (data.ncbLevel) {
      const validNCBLevels = ['0', '20', '25', '35', '45', '50'];
      if (!validNCBLevels.includes(data.ncbLevel.toString())) {
        throw new Error(`Invalid NCB Level: ${data.ncbLevel}. Valid values: ${validNCBLevels.join(', ')}`);
      }
    }

    // Voluntary Excess validation
    if (data.voluntaryExcess) {
      const validAmounts = ['1000', '1500', '2000', '2500', '3000', '5000'];
      if (!validAmounts.includes(data.voluntaryExcess.toString())) {
        throw new Error(`Invalid Voluntary Excess: ${data.voluntaryExcess}. Valid values: ${validAmounts.join(', ')}`);
      }
    }
  }

  /**
   * Validate proposal details data
   * @param {Object} data - Proposal details data
   */
  validateProposalDetailsData(data) {
    const requiredSections = ['personalDetails', 'nomineeDetails', 'paymentDetails'];
    
    for (const section of requiredSections) {
      if (!data[section]) {
        throw new Error(`Missing required section: ${section}`);
      }
    }

    // Validate personal details
    this.validatePersonalDetails(data.personalDetails);

    // Validate nominee details
    this.validateNomineeDetails(data.nomineeDetails);

    // Validate payment details
    this.validatePaymentDetails(data.paymentDetails);
  }

  /**
   * Validate personal details
   * @param {Object} personalDetails - Personal details data
   */
  validatePersonalDetails(personalDetails) {
    const requiredFields = ['firstName', 'dateOfBirth', 'email', 'mobileNo'];
    for (const field of requiredFields) {
      if (!personalDetails[field]) {
        throw new Error(`Missing required personal detail: ${field}`);
      }
    }

    // Validate email format
    if (personalDetails.email && !this.validationRules.email.pattern.test(personalDetails.email)) {
      throw new Error(this.validationRules.email.message);
    }

    // Validate mobile format
    if (personalDetails.mobileNo && !this.validationRules.mobile.pattern.test(personalDetails.mobileNo)) {
      throw new Error(this.validationRules.mobile.message);
    }

    // Validate PAN format
    if (personalDetails.panNo && !this.validationRules.panNo.pattern.test(personalDetails.panNo)) {
      throw new Error(this.validationRules.panNo.message);
    }

    // Validate Aadhaar format
    if (personalDetails.aadhaarNo && !this.validationRules.aadhaarNo.pattern.test(personalDetails.aadhaarNo)) {
      throw new Error(this.validationRules.aadhaarNo.message);
    }

    // Validate date format
    if (personalDetails.dateOfBirth && !this.validationRules.dateOfBirth.pattern.test(personalDetails.dateOfBirth)) {
      throw new Error(this.validationRules.dateOfBirth.message);
    }
  }

  /**
   * Validate nominee details
   * @param {Object} nomineeDetails - Nominee details data
   */
  validateNomineeDetails(nomineeDetails) {
    const requiredFields = ['nomineeName', 'nomineeAge', 'nomineeRelation', 'nomineeGender'];
    for (const field of requiredFields) {
      if (!nomineeDetails[field]) {
        throw new Error(`Missing required nominee detail: ${field}`);
      }
    }

    // Validate age is numeric
    if (nomineeDetails.nomineeAge && isNaN(parseInt(nomineeDetails.nomineeAge))) {
      throw new Error('Nominee age must be a valid number');
    }
  }

  /**
   * Validate payment details
   * @param {Object} paymentDetails - Payment details data
   */
  validatePaymentDetails(paymentDetails) {
    const requiredFields = ['paymentMode', 'dpName'];
    for (const field of requiredFields) {
      if (!paymentDetails[field]) {
        throw new Error(`Missing required payment detail: ${field}`);
      }
    }
  }

  /**
   * Validate credentials
   * @param {Object} credentials - Login credentials
   */
  validateCredentials(credentials) {
    if (!credentials.username || !credentials.password) {
      throw new Error('Missing login credentials');
    }
  }

  /**
   * Validate complete form data
   * @param {Object} policyVehicleData - Policy vehicle data
   * @param {Object} additionalDetailsData - Additional details data
   * @param {Object} proposalDetailsData - Proposal details data
   * @param {Object} credentials - Login credentials
   */
  validateCompleteFormData(policyVehicleData, additionalDetailsData, proposalDetailsData, credentials) {
    console.log('🔍 Validating complete form data...');
    
    this.validateCredentials(credentials);
    this.validatePolicyVehicleData(policyVehicleData);
    this.validateAdditionalDetailsData(additionalDetailsData);
    this.validateProposalDetailsData(proposalDetailsData);
    
    console.log('✅ Form data validation passed');
  }
}

module.exports = FormValidationManager;
