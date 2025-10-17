const fs = require('fs');
const path = require('path');

class PolicyIssuancePageWithToggles {
  constructor(page) {
    this.page = page;
  }

  async openHamburgerMenu() {
    await this.page.getByRole('button', { name: /menu/i }).click();
  }

  async goToPolicyIssuance() {
    await this.page.getByText('Policy Centre').click();
    await this.page.getByText(/^Policy$/).click();
    await this.page.getByText('Policy Issuance').click();
  }

  async selectOEM(make) {
    await this.page.getByRole('combobox', { name: 'OEM * --Select OEM--' }).click();
    await this.page.getByRole('option', { name: make }).click();
  }

  async selectVehicleCover() {
    await this.page.getByRole('combobox', { name: 'OEM * --Select Vehicle Cover--' }).click();
    await this.page.getByRole('option', { name: 'OD + 3 TP' }).click();
  }

  async selectSalutation() {
    await this.page.getByRole('combobox', { name: 'OEM * --Select Salutation--' }).click();
    await this.page.getByRole('option', { name: 'MR.' }).click();
  }

  async fillPersonalDetails(data) {
    await this.page.getByLabel('First Name').fill(data.firstName);
    await this.page.getByLabel('Email Id').fill(data.email);
    await this.page.locator('input[name="MOB_NO"]').fill(data.mobile);
  }

  async fillRandomVinAndEngineNo() {
    const randomVin = Array.from({length: 17}, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    const randomEngineNo = Array.from({length: 17}, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await this.page.getByLabel('VIN (Chassis No)').fill(randomVin);
    await this.page.getByLabel('Engine No').fill(randomEngineNo);
    fs.writeFileSync(path.join(__dirname, '../testdata/generated_withtoggle.json'), JSON.stringify({ vin: randomVin, engineNo: randomEngineNo }, null, 2));
  }

  async selectMakeModelVariantYear(data) {
    await this.page.getByRole('combobox', { name: 'OEM * --Select Make--' }).click();
    await this.page.getByRole('option', { name: data.make }).click();
    await this.page.getByRole('combobox', { name: 'OEM * --Select Model--' }).click();
    await this.page.getByRole('option', { name: data.model }).click();
    await this.page.getByRole('combobox', { name: 'OEM * --Select Variant--' }).click();
    await this.page.getByRole('option', { name: data.variant }).click();
    await this.page.getByRole('combobox', { name: '--Select Year of Manufacture--' }).click();
    await this.page.getByRole('option', { name: data.year }).click();
  }

  async selectRegistrationAndResidence(data) {
    await this.page.getByRole('combobox', { name: '--Select Registration City--' }).click();
    await this.page.getByRole('option', { name: data.registration }).click();
    await this.page.getByRole('combobox', { name: '--Select Customer Residence State--' }).click();
    await this.page.getByRole('option', { name: data.customerResidence }).click();
  }

  async togglePaCoverPaidDriver(amount) {
    const yesButton = this.page.locator('label:has-text("PA Cover - Paid Driver")').locator('..').locator('button:has-text("Yes")');
    await yesButton.waitFor({ state: 'visible', timeout: 5000 });
    await yesButton.click();
    await this.page.getByRole('combobox', { name: 'PA Cover Amount' }).click();
    await this.page.locator(`li[role="option"][data-value="${amount}"]`).click();
    await this.page.waitForTimeout(500);
  }
  async clickGetQuotes() {
    await this.page.getByRole('button', { name: /Get Quotes/i }).click();
  }

  async pauseAfterQuotes() {
    await this.page.pause();
  }

  async clickHdfcEgroBuyNow() {
    // Click the first visible BUY NOW button in the card list
    await this.page.locator('button:has-text("BUY NOW")').first().click();
    await this.page.pause();
  }

  async setOptionalDiscounts() {
    // Toggle yes for Voluntary Excess
    const voluntaryToggle = this.page.locator('label:has-text("Voluntary Excess")').locator('..').locator('button:has-text("Yes")');
    await voluntaryToggle.waitFor({ state: 'visible', timeout: 5000 });
    await voluntaryToggle.click();
    // Select 2500 in voluntary excess dropdown
    await this.page.getByRole('combobox', { name: /Voluntary Excess/ }).click();
    await this.page.getByRole('option', { name: '2500' }).click();
    // Toggle yes for AAI Membership
    const aaiToggle = this.page.locator('label:has-text("AAI Membership")').locator('..').locator('button:has-text("Yes")');
    await aaiToggle.waitFor({ state: 'visible', timeout: 5000 });
    await aaiToggle.click();
    // Toggle yes for Anti Theft
    const antiTheftToggle = this.page.locator('label:has-text("Anti Theft")').locator('..').locator('button:has-text("Yes")');
    await antiTheftToggle.waitFor({ state: 'visible', timeout: 5000 });
    await antiTheftToggle.click();
  }

  async toggleOfflineQuote() {
    const yesButton = this.page.locator('label:has-text("Offline Quote")').locator('..').locator('button:has-text("Yes")');
    await yesButton.waitFor({ state: 'visible', timeout: 5000 });
    await yesButton.click();
  }

  async togglePaCoverUnnamedPassenger() {
    const yesButton = this.page.locator('label:has-text("Unnamed Passenger")').locator('..').locator('button:has-text("Yes")');
    await yesButton.waitFor({ state: 'visible', timeout: 5000 });
    await yesButton.click();
  }

  async toggleLegalLiabilityPaidDriver() {
    const yesButton = this.page.locator('label:has-text("Legal Liability - Paid Driver")').locator('..').locator('button:has-text("Yes")');
    await yesButton.waitFor({ state: 'visible', timeout: 5000 });
    if (await yesButton.isEnabled()) {
      await yesButton.click();
    } else {
      console.log('Legal Liability - Paid Driver toggle is disabled, skipping click.');
    }
  }

  async fillAdditionalDetails(data) {
    // Use calendar picker for DOB
    await this.page.getByRole('textbox', { name: 'Choose date' }).click();
    await this.page.waitForTimeout(300); // Wait for calendar popup
    await this.page.getByRole('button', { name: 'calendar view is open, switch to year view' }).click();
    await this.page.waitForTimeout(300); // Wait for year view
    await this.page.getByRole('radio', { name: data.dateOfBirth.split('/')[2] }).click();
    await this.page.waitForTimeout(300); // Wait for month view
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[parseInt(data.dateOfBirth.split('/')[1], 10) - 1];
    await this.page.getByRole('radio', { name: month }).click();
    await this.page.waitForTimeout(300); // Wait for day view
    const day = String(parseInt(data.dateOfBirth.split('/')[0], 10)); // Remove leading zero
    await this.page.getByRole('gridcell', { name: day, exact: true }).click();
    await this.page.getByLabel('Address Line 1').fill(data.address);
    // City dropdown (Material-UI custom, using id and exact match, select first 'DELHI')
    await this.page.locator('#mui-component-select-CITY_ID').click();
    await this.page.getByRole('option', { name: 'DELHI', exact: true }).first().click();
    // Wait for pincode dropdown to be visible after city selection
    await this.page.waitForSelector('#mui-component-select-PIN', { state: 'visible', timeout: 10000 });
    await this.page.locator('#mui-component-select-PIN').click();
    await this.page.getByRole('option', { name: '110000', exact: true }).click();

    // Association Name dropdown
    await this.page.locator('#mui-component-select-ASSOCIATION_NAME').click();
    const assocOption = this.page.getByRole('option', { name: 'Automobile Association of Eastern India', exact: true });
    await assocOption.waitFor({ state: 'visible', timeout: 5000 });
    await assocOption.click();
    // Membership No. (using id and name for precision)
    const membershipInput = this.page.locator('input#\\:r2k\\:[name="MEMBERSHIP_NO"]');
    await membershipInput.waitFor({ state: 'visible', timeout: 5000 });
    await membershipInput.fill('68723');
    // Validity Month dropdown (using correct id and selecting Feb)
    const validityMonthDropdown = this.page.locator('#mui-component-select-AAMonth');
    await validityMonthDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await validityMonthDropdown.click();
    await this.page.getByRole('option', { name: 'Feb', exact: true }).click();
    // Year (use input[name='AAYear'][placeholder='Year'] for precision)
    const yearInput = this.page.locator("input[name='AAYear'][placeholder='Year']");
    await yearInput.waitFor({ state: 'visible', timeout: 5000 });
    await yearInput.fill('2027');
    // Ensure Nominee Details section is expanded
    const nomineeDetailsBtn = this.page.getByRole('button', { name: /Nominee Details/i });
    const expanded = await nomineeDetailsBtn.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await nomineeDetailsBtn.click();
      await this.page.waitForTimeout(300);
    }
    // Nominee Name
    const nomineeNameInput = this.page.locator("input[name='NomineeName'][placeholder='Nominee Name']");
    await nomineeNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nomineeNameInput.fill('NAM');
    // Nominee Age
    await this.page.locator("input[name='NomineeAge'][placeholder='Nominee Age']").fill('23');
    // Nominee Relation dropdown
    await this.page.locator('#mui-component-select-NomineeRelation').click();
    await this.page.getByRole('option', { name: 'daughter', exact: false }).click();
    // Nominee Gender dropdown
    await this.page.locator('#mui-component-select-NomineeGender').click();
    await this.page.getByRole('option', { name: 'Female', exact: true }).click();
    // Proposal review button (robust: scroll into view, wait for visible/attached, force click)
    const proposalBtn = this.page.locator("button[type='submit']").filter({ hasText: 'Proposal Preview' });
    await proposalBtn.scrollIntoViewIfNeeded();
    await proposalBtn.waitFor({ state: 'visible', timeout: 10000 });
    await proposalBtn.waitFor({ state: 'attached', timeout: 10000 });
    await proposalBtn.click({ force: true });
    // Payment Mode dropdown
    await this.page.locator('#mui-component-select-PAYMENT_MODE').click();
    const paymentOption = this.page.locator("li[role='option']").filter({ hasText: /dealer/i });
    await paymentOption.waitFor({ state: 'visible', timeout: 5000 });
    await paymentOption.click();
    // DP Name dropdown
    await this.page.locator('#mui-component-select-AgentID').click();
    await this.page.getByRole('option', { name: 'Ashutosh DP', exact: true }).click();
    // PAN No.
    await this.page.locator("input[name='PAN_NO'][placeholder='PAN No.']").fill('BPEDK4567L');
  }

  // ...add more methods for the rest of the steps as needed...
}

module.exports = { PolicyIssuancePageWithToggles };
