const E2ECoreUtils = require('./E2ECoreUtils');
const PolicyDetailsUtils = require('../forms/PolicyDetailsUtils');
const ProposalDetailsUtils = require('../forms/ProposalDetailsUtils');
const E2EValidationUtils = require('./E2EValidationUtils');

/**
 * E2E Flow Utilities - Main orchestrator class that combines all utilities
 * Extends E2ECoreUtils and includes all other utility classes
 */
class E2EFlowUtils extends E2ECoreUtils {
  constructor(page) {
    super(page);
    this.policyDetails = new PolicyDetailsUtils(page);
    this.proposalDetails = new ProposalDetailsUtils(page);
    this.validation = new E2EValidationUtils(page);
  }

  /**
   * Fill policy details with variations for renew/new policies
   * @param {Object} testdata - Test data object
   * @param {string} policyType - Type of policy ('renewal' or 'new')
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async fillPolicyDetails(testdata, policyType = 'renewal', takeScreenshot = true) {
    return await this.policyDetails.fillPolicyDetails(testdata, policyType, takeScreenshot);
  }

  /**
   * Fill proposal details form
   * @param {Object} proposalDetails - Proposal details object
   * @param {boolean} takeScreenshot - Whether to take screenshot after completion
   */
  async fillProposalDetails(proposalDetails, takeScreenshot = true) {
    return await this.proposalDetails.fillProposalDetails(proposalDetails, takeScreenshot);
  }

  /**
   * Fill personal information section
   * @param {Object} personalDetails - Personal details object
   */
  async fillPersonalInformation(personalDetails) {
    return await this.proposalDetails.fillPersonalInformation(personalDetails);
  }

  /**
   * Fill contact information section
   * @param {Object} personalDetails - Personal details object
   */
  async fillContactInformation(personalDetails) {
    return await this.proposalDetails.fillContactInformation(personalDetails);
  }

  /**
   * Fill address information section
   * @param {Object} personalDetails - Personal details object
   */
  async fillAddressInformation(personalDetails) {
    return await this.proposalDetails.fillAddressInformation(personalDetails);
  }

  /**
   * Fill identity documents section
   * @param {Object} personalDetails - Personal details object
   */
  async fillIdentityDocuments(personalDetails) {
    return await this.proposalDetails.fillIdentityDocuments(personalDetails);
  }

  /**
   * Fill AA membership details section
   * @param {Object} aaMembershipDetails - AA membership details object
   */
  async fillAAMembershipDetails(aaMembershipDetails) {
    return await this.proposalDetails.fillAAMembershipDetails(aaMembershipDetails);
  }

  /**
   * Fill NCB carry forward details section
   * @param {Object} ncbCarryForwardDetails - NCB carry forward details object
   */
  async fillNCBCarryForwardDetails(ncbCarryForwardDetails) {
    return await this.proposalDetails.fillNCBCarryForwardDetails(ncbCarryForwardDetails);
  }

  /**
   * Fill nominee details section
   * @param {Object} proposalDetails - Proposal details object
   */
  async fillNomineeDetails(proposalDetails) {
    return await this.proposalDetails.fillNomineeDetails(proposalDetails);
  }

  /**
   * Fill payment details section
   * @param {Object} proposalDetails - Proposal details object
   */
  async fillPaymentDetails(proposalDetails) {
    return await this.proposalDetails.fillPaymentDetails(proposalDetails);
  }

  /**
   * Fill solicitation details section
   * @param {Object} proposalDetails - Proposal details object
   */
  async fillSolicitationDetails(proposalDetails) {
    return await this.proposalDetails.fillSolicitationDetails(proposalDetails);
  }

  /**
   * Validate final success state
   * @returns {boolean} - True if success indicators found
   */
  async validateSuccess() {
    return await this.validation.validateSuccess();
  }

  /**
   * Validate form completion
   * @returns {boolean} - True if form is complete
   */
  async validateFormCompletion() {
    return await this.validation.validateFormCompletion();
  }

  /**
   * Validate proposal details form completion
   * @returns {boolean} - True if proposal form is complete
   */
  async validateProposalFormCompletion() {
    return await this.validation.validateProposalFormCompletion();
  }
}

module.exports = E2EFlowUtils;
