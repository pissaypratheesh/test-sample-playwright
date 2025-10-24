const RenewalFormFlowCoordinator = require('./RenewalFormFlowCoordinator');
const { Page1DataManager, Page2DataManager, Page3DataManager } = require('./dataManagers');
const { TEST_DATA_TEMPLATES } = require('./configurations');

/**
 * Main Renewal Form System
 * This is the main entry point for the modular renewal form system
 * Provides a clean API for executing renewal form flows with different configurations
 */
class RenewalFormSystem {
  constructor(page) {
    this.page = page;
    this.flowCoordinator = new RenewalFormFlowCoordinator(page);
    this.dataManagers = {
      page1: new Page1DataManager(),
      page2: new Page2DataManager(),
      page3: new Page3DataManager()
    };
  }

  /**
   * Execute renewal form with template data
   * @param {string} templateName - Name of the template to use
   * @param {Object} credentials - Login credentials
   * @param {Object} customData - Custom data to override template data
   */
  async executeWithTemplate(templateName, credentials, customData = {}) {
    console.log(`🚀 Executing renewal form with template: ${templateName}`);
    
    const template = TEST_DATA_TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found. Available templates: ${Object.keys(TEST_DATA_TEMPLATES).join(', ')}`);
    }

    // Merge template data with custom data
    const mergedData = this.mergeTemplateWithCustomData(template, customData);

    // Process data through data managers
    const processedData = this.processDataThroughManagers(mergedData);

    // Execute the flow
    await this.flowCoordinator.executeFlowWithValidation(
      processedData.policyVehicle,
      processedData.additionalDetails,
      processedData.proposalDetails,
      credentials
    );

    console.log(`✅ Renewal form completed successfully with template: ${templateName}`);
  }

  /**
   * Execute renewal form with custom data
   * @param {Object} policyVehicleData - Custom Policy Vehicle data
   * @param {Object} additionalDetailsData - Custom Additional Details data
   * @param {Object} proposalDetailsData - Custom Proposal Details data
   * @param {Object} credentials - Login credentials
   */
  async executeWithCustomData(policyVehicleData, additionalDetailsData, proposalDetailsData, credentials) {
    console.log('🚀 Executing renewal form with custom data');
    
    // Process data through data managers
    const processedData = {
      policyVehicle: this.dataManagers.page1.processPage1Data(policyVehicleData),
      additionalDetails: this.dataManagers.page2.processPage2Data(additionalDetailsData),
      proposalDetails: this.dataManagers.page3.processPage3Data(proposalDetailsData)
    };

    // Execute the flow
    await this.flowCoordinator.executeFlowWithValidation(
      processedData.policyVehicle,
      processedData.additionalDetails,
      processedData.proposalDetails,
      credentials
    );

    console.log('✅ Renewal form completed successfully with custom data');
  }

  /**
   * Execute renewal form with specific OEM and cover type
   * @param {string} oem - OEM name
   * @param {string} vehicleCover - Vehicle cover type
   * @param {string} proposerType - Proposer type (Individual/Corporate)
   * @param {Object} credentials - Login credentials
   * @param {Object} additionalData - Additional data to customize
   */
  async executeWithOEMAndCover(oem, vehicleCover, proposerType = 'Individual', credentials, additionalData = {}) {
    console.log(`🚀 Executing renewal form with OEM: ${oem}, Cover: ${vehicleCover}, Proposer: ${proposerType}`);
    
    // Generate data based on OEM and cover type
    const generatedData = this.generateDataForOEMAndCover(oem, vehicleCover, proposerType, additionalData);

    // Process data through data managers
    const processedData = this.processDataThroughManagers(generatedData);

    // Execute the flow
    await this.flowCoordinator.executeFlowWithValidation(
      processedData.page1,
      processedData.page2,
      processedData.page3,
      credentials
    );

    console.log(`✅ Renewal form completed successfully with OEM: ${oem}, Cover: ${vehicleCover}`);
  }

  /**
   * Execute renewal form with dynamic sections enabled
   * @param {Object} enabledSections - Object specifying which sections to enable
   * @param {Object} credentials - Login credentials
   * @param {Object} baseData - Base data for the form
   */
  async executeWithDynamicSections(enabledSections, credentials, baseData = {}) {
    console.log('🚀 Executing renewal form with dynamic sections:', Object.keys(enabledSections).filter(key => enabledSections[key]));
    
    // Generate data with specified dynamic sections
    const generatedData = this.generateDataWithDynamicSections(enabledSections, baseData);

    // Process data through data managers
    const processedData = this.processDataThroughManagers(generatedData);

    // Execute the flow
    await this.flowCoordinator.executeFlowWithValidation(
      processedData.page1,
      processedData.page2,
      processedData.page3,
      credentials
    );

    console.log('✅ Renewal form completed successfully with dynamic sections');
  }


  /**
   * Get available templates
   * @returns {Array} List of available template names
   */
  getAvailableTemplates() {
    return Object.keys(TEST_DATA_TEMPLATES);
  }

  /**
   * Get form state
   * @returns {Object} Current form state
   */
  getFormState() {
    return this.flowCoordinator.getFormState();
  }

  /**
   * Reset form state
   */
  resetFormState() {
    this.flowCoordinator.resetFormState();
  }

  /**
   * Merge template data with custom data
   * @param {Object} template - Template data
   * @param {Object} customData - Custom data to override
   * @returns {Object} Merged data
   */
  mergeTemplateWithCustomData(template, customData) {
    const merged = JSON.parse(JSON.stringify(template)); // Deep clone
    
    // Merge each page's data
    if (customData.page1) {
      merged.page1 = { ...merged.page1, ...customData.page1 };
    }
    if (customData.page2) {
      merged.page2 = { ...merged.page2, ...customData.page2 };
    }
    if (customData.page3) {
      merged.page3 = this.deepMerge(merged.page3, customData.page3);
    }
    
    return merged;
  }

  /**
   * Process data through data managers
   * @param {Object} data - Data to process
   * @returns {Object} Processed data
   */
  processDataThroughManagers(data) {
    return {
      page1: this.dataManagers.page1.processPage1Data(data.page1),
      page2: this.dataManagers.page2.processPage2Data(data.page2),
      page3: this.dataManagers.page3.processPage3Data(data.page3)
    };
  }

  /**
   * Generate data for specific OEM and cover type
   * @param {string} oem - OEM name
   * @param {string} vehicleCover - Vehicle cover type
   * @param {string} proposerType - Proposer type
   * @param {Object} additionalData - Additional data
   * @returns {Object} Generated data
   */
  generateDataForOEMAndCover(oem, vehicleCover, proposerType, additionalData) {
    const baseTemplate = TEST_DATA_TEMPLATES.basicRenewal;
    
    const generatedData = {
      page1: {
        ...baseTemplate.page1,
        oem,
        vehicleCover,
        proposerType,
        make: oem,
        ...additionalData.page1
      },
      page2: {
        ...baseTemplate.page2,
        ...additionalData.page2
      },
      page3: {
        ...baseTemplate.page3,
        ...additionalData.page3
      }
    };

    return generatedData;
  }

  /**
   * Generate data with dynamic sections
   * @param {Object} enabledSections - Enabled sections
   * @param {Object} baseData - Base data
   * @returns {Object} Generated data
   */
  generateDataWithDynamicSections(enabledSections, baseData) {
    const baseTemplate = TEST_DATA_TEMPLATES.comprehensiveRenewal;
    
    const generatedData = {
      page1: {
        ...baseTemplate.page1,
        ...baseData.page1
      },
      page2: {
        ...baseTemplate.page2,
        ncbLevel: enabledSections.ncbCarryForward ? '25' : undefined,
        voluntaryExcess: enabledSections.voluntaryExcess ? '3000' : undefined,
        aaiMembership: enabledSections.aaiMembership || false,
        handicappedDiscount: enabledSections.handicappedDiscount || false,
        antiTheftDiscount: enabledSections.antiTheftDiscount || false,
        ...baseData.page2
      },
      page3: {
        ...baseTemplate.page3,
        ...baseData.page3
      }
    };

    return generatedData;
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
   * Validate form data
   * @param {Object} page1Data - Page 1 data
   * @param {Object} page2Data - Page 2 data
   * @param {Object} page3Data - Page 3 data
   * @param {Object} credentials - Login credentials
   */
  validateFormData(page1Data, page2Data, page3Data, credentials) {
    this.flowCoordinator.validateFormData(page1Data, page2Data, page3Data, credentials);
  }

  /**
   * Get page instance for direct access
   * @param {number} pageNumber - Page number (1, 2, or 3)
   * @returns {Object} Page instance
   */
  getPageInstance(pageNumber) {
    return this.flowCoordinator.getPageInstance(pageNumber);
  }

  /**
   * Take debug screenshot
   * @param {string} filename - Screenshot filename
   */
  async takeDebugScreenshot(filename) {
    await this.flowCoordinator.takeDebugScreenshot(filename);
  }
}

module.exports = RenewalFormSystem;
