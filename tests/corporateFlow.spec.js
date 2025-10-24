const RenewalFormSystem = require('../pages/renewal/RenewalFormSystem');
const testdata = require('../testdata/renewcorporate.json');
const creds = require('../testdata/Auth.json');
const { test } = require('@playwright/test');

test('Corporate Flow E2E - Corporate Policy Holder', async ({ page }) => {
  const renewalFormSystem = new RenewalFormSystem(page);
  
  console.log('🚀 Starting Corporate Flow - Corporate Policy Holder');
  
  // Set a longer timeout for this test
  test.setTimeout(600000); // 10 minutes
  
  // Execute renewal form with corporate policy holder data
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
    creds
  );
  
  console.log('✅ Corporate Flow - Corporate Policy Holder completed successfully');
});
