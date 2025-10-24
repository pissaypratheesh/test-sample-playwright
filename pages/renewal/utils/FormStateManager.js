/**
 * Form State Manager
 * Handles form state tracking and updates
 */
class FormStateManager {
  constructor() {
    this.formState = {
      currentStep: 'login',
      selectedOEM: null,
      selectedVehicleCover: null,
      selectedProposerType: null,
      dynamicSections: {
        ncbCarryForward: false,
        voluntaryExcess: false,
        aaiMembership: false,
        handicappedDiscount: false,
        antiTheftDiscount: false
      }
    };
  }

  /**
   * Update form state from policy vehicle data
   * @param {Object} policyVehicleData - Policy vehicle data
   */
  updateFromPolicyVehicleData(policyVehicleData) {
    this.formState.selectedOEM = policyVehicleData.oem;
    this.formState.selectedVehicleCover = policyVehicleData.vehicleCover;
    this.formState.selectedProposerType = policyVehicleData.proposerType;
    this.formState.currentStep = 'additionalDetails';
    
    console.log('📊 Form State Updated from Policy Vehicle Data:');
    console.log(`  OEM: ${this.formState.selectedOEM}`);
    console.log(`  Vehicle Cover: ${this.formState.selectedVehicleCover}`);
    console.log(`  Proposer Type: ${this.formState.selectedProposerType}`);
  }

  /**
   * Update form state from additional details data
   * @param {Object} additionalDetailsData - Additional details data
   */
  updateFromAdditionalDetailsData(additionalDetailsData) {
    this.formState.dynamicSections.ncbCarryForward = !!(additionalDetailsData.ncbLevel || additionalDetailsData.ncb);
    this.formState.dynamicSections.voluntaryExcess = !!(additionalDetailsData.voluntaryExcess);
    this.formState.dynamicSections.aaiMembership = !!(additionalDetailsData.aaiMembership);
    this.formState.dynamicSections.handicappedDiscount = !!(additionalDetailsData.handicappedDiscount);
    this.formState.dynamicSections.antiTheftDiscount = !!(additionalDetailsData.antiTheftDiscount);
    this.formState.currentStep = 'proposalDetails';
    
    console.log('📊 Form State Updated from Additional Details Data:');
    console.log(`  NCB Carry Forward: ${this.formState.dynamicSections.ncbCarryForward}`);
    console.log(`  Voluntary Excess: ${this.formState.dynamicSections.voluntaryExcess}`);
    console.log(`  AAI Membership: ${this.formState.dynamicSections.aaiMembership}`);
    console.log(`  Handicapped Discount: ${this.formState.dynamicSections.handicappedDiscount}`);
    console.log(`  Anti-Theft Discount: ${this.formState.dynamicSections.antiTheftDiscount}`);
  }

  /**
   * Get current form state
   * @returns {Object} Current form state
   */
  getFormState() {
    return { ...this.formState };
  }

  /**
   * Reset form state
   */
  resetFormState() {
    this.formState = {
      currentStep: 'login',
      selectedOEM: null,
      selectedVehicleCover: null,
      selectedProposerType: null,
      dynamicSections: {
        ncbCarryForward: false,
        voluntaryExcess: false,
        aaiMembership: false,
        handicappedDiscount: false,
        antiTheftDiscount: false
      }
    };
  }

  /**
   * Check if dynamic section is enabled
   * @param {string} sectionName - Section name
   * @returns {boolean} Whether section is enabled
   */
  isDynamicSectionEnabled(sectionName) {
    return this.formState.dynamicSections[sectionName];
  }

  /**
   * Get current step
   * @returns {string} Current step
   */
  getCurrentStep() {
    return this.formState.currentStep;
  }

  /**
   * Set current step
   * @param {string} step - Step name
   */
  setCurrentStep(step) {
    this.formState.currentStep = step;
  }
}

module.exports = FormStateManager;
