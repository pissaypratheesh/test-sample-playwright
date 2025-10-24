const RenewalFormSystem = require('../pages/renewal/RenewalFormSystem');
const testdata = require('../testdata/renewFlowData.json');
const creds = require('../testdata/Auth.json');
const { test } = require('@playwright/test');

test('Renew Flow E2E - Individual Policy Holder', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  console.log('🚀 Starting Renew Flow - Individual Policy Holder');
  
  // Execute renewal form with individual policy holder data
  await renewalFormSystem.executeWithCustomData(
    {
      // Policy Details
      oem: testdata.vehicleDetails.make,
      proposerType: testdata.policyDetails.proposerType,
      prevPolicyNo: testdata.policyDetails.previousPolicyNo,
      prevVehicleCover: testdata.policyDetails.policyPeriod,
      ncb: testdata.additionalDiscounts.certifiedNcbPercent + "%",
      prevPolicyIC: testdata.policyDetails.previousInsurerName,
      vehicleCover: "TP",
      
      // Customer Details (Individual)
      salutation: "Mr.",
      firstName: "JOHNNYDEP",
      email: "naer@hji.com",
      mobile: "8765456789",
      
      // Vehicle Details
      vin: testdata.vehicleDetails.vehicleChassisNo,
      engineNo: testdata.vehicleDetails.engineNo,
      make: testdata.vehicleDetails.make,
      model: testdata.vehicleDetails.model,
      variant: testdata.vehicleDetails.variant,
      year: testdata.vehicleDetails.yearOfManufacture,
      registrationCity: testdata.vehicleDetails.registrationCity,
      customerState: testdata.vehicleDetails.customerResidenceState,
      odPolicyExpiryDate: testdata.policyDetails.cbPolicyExpiryDate,
      tpPolicyExpiryDate: testdata.policyDetails.tpPolicyExpiryDate,
      invoiceDate: testdata.vehicleDetails.invoiceDate,
      registrationDate: testdata.vehicleDetails.registrationDate,
      registrationStateRto: "DL-06",
      registrationSeries: "RAA",
      registrationNumber: "9999",
      ncbLevel: testdata.additionalDiscounts.certifiedNcbPercent,
      voluntaryExcess: testdata.vehicleDetails.voluntaryExcess
    }, // Policy Vehicle data
    { 
      ncbLevel: testdata.additionalDiscounts.certifiedNcbPercent,
      voluntaryExcess: testdata.vehicleDetails.voluntaryExcess,
      aaiMembership: testdata.additionalDiscounts.aaiMembership === "YES",
      handicappedDiscount: testdata.additionalDiscounts.handicapped === "YES",
      antiTheftDiscount: testdata.additionalDiscounts.antiTheft === "YES"
    }, // Additional Details data
    require('../testdata/proposalDetails.json'), // Proposal Details data
    creds
  );
  
  console.log('✅ Renew Flow - Individual Policy Holder completed successfully');
});

