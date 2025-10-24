const FormUtils = require('../forms/FormUtils');

/**
 * E2E Validation Utilities - Functions for validation and success checking
 * Extends FormUtils for common form interactions
 */
class E2EValidationUtils extends FormUtils {
  constructor(page) {
    super(page);
  }

  /**
   * Validate final success state
   * @returns {boolean} - True if success indicators found
   */
  async validateSuccess() {
    console.log('📋 Final Validation');
    
    try {
      // Check if we're on a success page or next step
      const successIndicators = [
        'text="Success"',
        'text="Policy Created"',
        'text="Proposal Submitted"',
        'text="Payment"',
        'text="Confirmation"'
      ];

      let foundSuccess = false;
      for (const indicator of successIndicators) {
        try {
          if (await this.page.locator(indicator).isVisible({ timeout: 5000 })) {
            console.log(`✅ Found success indicator: ${indicator}`);
            foundSuccess = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!foundSuccess) {
        console.log('⚠️ No clear success indicator found, but flow completed');
      }

      return foundSuccess;
    } catch (error) {
      console.error('❌ Error in validation:', error.message);
      return false;
    }
  }

  /**
   * Validate form completion
   * @returns {boolean} - True if form is complete
   */
  async validateFormCompletion() {
    try {
      // Check if all required fields are filled by looking at the actual values
      const requiredChecks = [
        // Check OEM is selected (not default)
        async () => {
          const oemDropdown = this.page.getByRole('combobox', { name: 'OEM * --Select OEM--' });
          const oemText = await oemDropdown.textContent();
          return oemText && oemText !== '--Select OEM--';
        },
        
        // Check Vehicle Cover is selected
        async () => {
          const vehicleCoverDropdown = this.page.getByRole('combobox', { name: 'OEM * --Select Vehicle Cover--' });
          const vehicleCoverText = await vehicleCoverDropdown.textContent();
          return vehicleCoverText && vehicleCoverText !== '--Select Vehicle Cover--';
        }
      ];

      for (const check of requiredChecks) {
        const result = await check();
        if (!result) {
          console.log('❌ Form validation failed');
          return false;
        }
      }

      console.log('✅ Form validation passed');
      return true;
    } catch (error) {
      console.error('❌ Error validating form completion:', error.message);
      return false;
    }
  }

  /**
   * Validate proposal details form completion
   * @returns {boolean} - True if proposal form is complete
   */
  async validateProposalFormCompletion() {
    try {
      const requiredChecks = [
        // Check if first name is filled
        async () => {
          const firstNameInput = this.page.locator('input[name="FIRST_NAME"]');
          const firstNameValue = await firstNameInput.inputValue();
          return firstNameValue && firstNameValue.trim() !== '';
        },
        
        // Check if last name is filled
        async () => {
          const lastNameInput = this.page.locator('input[name="LAST_NAME"]');
          const lastNameValue = await lastNameInput.inputValue();
          return lastNameValue && lastNameValue.trim() !== '';
        },
        
        // Check if PAN is filled
        async () => {
          const panInput = this.page.locator('input[name="PAN_NO"]');
          const panValue = await panInput.inputValue();
          return panValue && panValue.trim() !== '';
        }
      ];

      for (const check of requiredChecks) {
        const result = await check();
        if (!result) {
          console.log('❌ Proposal form validation failed');
          return false;
        }
      }

      console.log('✅ Proposal form validation passed');
      return true;
    } catch (error) {
      console.error('❌ Error validating proposal form completion:', error.message);
      return false;
    }
  }
}

module.exports = E2EValidationUtils;
