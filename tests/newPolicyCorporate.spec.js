const RenewalFormSystem = require('../pages/renewal/RenewalFormSystem');
const testdata = require('../testdata/newPolicyCorporate.json');
const creds = require('../testdata/Auth.json');
const { test } = require('@playwright/test');

test('New Policy - Corporate Proposer E2E', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  console.log('🚀 Starting New Policy - Corporate Proposer Flow');
  
  // NOTE: This test currently uses the RenewalFormSystem which is designed for renewal flows.
  // To implement proper "New Policy" flow, you would need to:
  // 1. Create a new PolicyFormSystem that handles both new and renewal policies
  // 2. Modify LoginNavigationHandler to support navigation to "New Policy" instead of "Renew"
  // 3. Create separate page classes for new policy flows
  // For now, this reuses the renewal infrastructure as they share similar forms
  
  // Set a longer timeout for this test
  test.setTimeout(600000); // 10 minutes
  
  // Execute new policy form with corporate policy holder data
  await renewalFormSystem.executeWithCustomData(
    {
      // Policy Details
      oem: testdata.vehicleDetails.make,
      proposerType: testdata.policyDetails.proposerType,
      prevPolicyNo: testdata.policyDetails.previousPolicyNo,
      prevVehicleCover: testdata.policyDetails.policyPeriod,
      ncb: testdata.additionalDiscounts.certifiedNcbPercent + "%",
      prevPolicyIC: testdata.policyDetails.previousInsurerName,
      vehicleCover: testdata.policyDetails.policyPeriod,
      
      // Company Details (Corporate)
      companySalutation: testdata.companyDetails.companySalutation,
      companyName: testdata.companyDetails.companyName,
      companyContactNo: testdata.companyDetails.companyContactNo,
      companyEmail: testdata.companyDetails.email,
      companyLandlineNo: testdata.companyDetails.companyLandlineNo,
      companyAddress: testdata.companyDetails.companyAddress,
      
      // Customer Details (Corporate Contact)
      salutation: testdata.personalDetails.salutation,
      firstName: testdata.personalDetails.firstName,
      email: testdata.personalDetails.email,
      mobile: testdata.personalDetails.mobileNo,
      
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
      registrationStateRto: testdata.vehicleDetails.registrationStateRto,
      registrationSeries: testdata.vehicleDetails.registrationSeries,
      registrationNumber: testdata.vehicleDetails.registrationNumber,
      ncbLevel: testdata.additionalDiscounts.certifiedNcbPercent,
      voluntaryExcess: testdata.additionalDiscounts.voluntaryExcessAmount
    }, // Policy Vehicle data
    { 
      ncbLevel: testdata.additionalDiscounts.certifiedNcbPercent,
      voluntaryExcess: testdata.additionalDiscounts.voluntaryExcessAmount,
      ncbCarryForward: testdata.additionalDiscounts.ncbCarryForward === "YES",
      voluntaryExcessEnabled: testdata.additionalDiscounts.voluntaryExcess === "YES",
      aaiMembership: testdata.additionalDiscounts.aaiMembership === "YES",
      handicappedDiscount: testdata.additionalDiscounts.handicapped === "YES",
      antiTheftDiscount: testdata.additionalDiscounts.antiTheft === "YES"
    }, // Additional Details data
    {
      personalDetails: testdata.personalDetails,
      aaMembershipDetails: testdata.aaMembershipDetails,
      ncbCarryForwardDetails: testdata.ncbCarryForwardDetails,
      policyDetails: {
        prevVehIc: testdata.policyDetails.previousInsurerName,
        insuranceCompany: testdata.ncbCarryForwardDetails.insuranceCompany,
        officeAddress: testdata.ncbCarryForwardDetails.officeAddress
      },
      financierDetails: testdata.financierDetails,
      nomineeDetails: testdata.nomineeDetails,
      paymentDetails: testdata.paymentDetails
    }, // Corporate Proposal Details data
    creds,
    'new' // Flow type: 'new' for new policy
  );
  
  console.log('✅ New Policy - Corporate Proposer Flow completed successfully');
});

