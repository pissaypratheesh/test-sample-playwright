const fs = require('fs');
const path = require('path');
let testdata;
try {
  const raw = fs.readFileSync(path.join(__dirname, '../testdata/PolicyIssuanceData.json'), 'utf8');
  console.log('DEBUG: Raw JSON:', raw);
  testdata = JSON.parse(raw);
  console.log('DEBUG: Parsed testdata:', testdata);
} catch (err) {
  console.error('ERROR reading or parsing PolicyIssuanceData.json:', err);
  testdata = {};
}

exports.PolicyIssuancePage = class PolicyIssuancePage {
  constructor(page) {
    this.page = page;
  }

  async login() {
    await this.page.goto('https://uatlifekaplan.tmibasl.in/');
    console.log('DEBUG: testdata.username =', testdata.username);
    const username = testdata.username || 'DEFAULT_USERNAME';
    await this.page.getByRole('textbox', { name: 'Enter User Name' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Enter Password' }).fill(testdata.password || 'DEFAULT_PASSWORD');
    await this.page.getByRole('button', { name: 'Login    ' }).click();
  }

  async fillPolicyForm() {
    await this.page.getByRole('button', { name: 'menu' }).click();
    await this.page.locator('a').filter({ hasText: 'Policy Centre' }).click();
    await this.page.locator('a').filter({ hasText: /^Policy$/ }).click();
    await this.page.locator('a').filter({ hasText: 'Policy Issuance' }).click();
    await this.page.getByText('--Select OEM--').click();
    await this.page.getByRole('option', { name: 'FORD' }).click();
    await this.page.getByText('--Select Vehicle Cover--').click();
    await this.page.getByRole('option', { name: 'OD + 3 TP' }).click();
    await this.page.getByRole('combobox', { name: 'OEM * --Select Salutation--' }).click();
    await this.page.getByRole('option', { name: 'MR.' }).click();
    await this.page.getByRole('textbox', { name: 'First Name *' }).fill(testdata.firstName);
    await this.page.getByRole('textbox', { name: 'Email Id *' }).fill(testdata.email);
    await this.page.getByRole('textbox', { name: 'Mobile No *' }).fill(testdata.mobile);
    await this.page.getByRole('textbox', { name: 'VIN (Chassis No) *' }).fill(testdata.vin);
    await this.page.getByRole('textbox', { name: 'Engine No *' }).fill(testdata.engineNo);
    await this.page.getByRole('combobox', { name: 'OEM * --Select Make--' }).click();
    await this.page.getByRole('option', { name: testdata.make }).click();
    await this.page.getByRole('combobox', { name: 'OEM * --Select Model--' }).click();
    await this.page.getByRole('option', { name: testdata.model }).click();
    await this.page.getByText('--Select Variant--').click();
    await this.page.getByRole('option', { name: testdata.variant }).click();
    await this.page.getByText('--Select Year of Manufacture--').click();
    await this.page.getByRole('option', { name: testdata.year }).click();
    await this.page.getByText('--Select Registration City--').click();
    await this.page.getByRole('option', { name: testdata.registration }).click();
    await this.page.getByRole('combobox', { name: 'OEM * --Select Customer' }).click();
    await this.page.getByRole('option', { name: testdata.customer }).click();
    await this.page.getByRole('button', { name: 'Get Quotes' }).click();
    await this.page.getByRole('button', { name: '₹ 43012 BUY NOW' }).click();
    await this.page.getByRole('textbox', { name: 'Address Line 1 *' }).fill(testdata.address);
    await this.page.getByRole('combobox', { name: 'Salutation * --Select City--' }).click();
    await this.page.getByRole('option', { name: testdata.city }).click();
    await this.page.locator('#divPINvalidate').click();
    await this.page.getByRole('option', { name: testdata.pin }).click();
    await this.page.getByRole('textbox', { name: 'PAN No.' }).fill(testdata.pan);
    await this.page.getByRole('textbox', { name: 'Nominee Name *' }).fill(testdata.nomineeName);
    await this.page.getByRole('textbox', { name: 'Nominee Age *' }).fill(testdata.nomineeAge);
    await this.page.locator('#mui-component-select-NomineeRelation').click();
    await this.page.getByRole('option', { name: testdata.nomineeRelation }).click();
    await this.page.locator('#mui-component-select-PAYMENT_MODE').click();
    await this.page.getByRole('option', { name: testdata.paymentMode }).click();
    await this.page.getByRole('combobox', { name: 'Salutation * --Select DP Name' }).click();
    await this.page.getByRole('option', { name: testdata.dpName }).click();
    await this.page.getByRole('button', { name: 'Proposal Preview' }).click();
    await this.page.getByRole('textbox', { name: 'Choose date' }).click();
    await this.page.getByRole('button', { name: 'calendar view is open, switch' }).click();
    await this.page.getByRole('radio', { name: testdata.proposalYear }).click();
    await this.page.getByRole('button', { name: 'Proposal Preview' }).click();
    await this.page.locator('label').filter({ hasText: 'I hereby agree to receive a' }).getByTestId('CheckBoxOutlineBlankIcon').click();
    await this.page.getByTestId('CheckBoxOutlineBlankIcon').click();
    await this.page.getByRole('radio', { name: 'Mandate Form' }).check();
    await this.page.getByText('Drag and drop your files here').click();
    await this.page.getByText('Browse files').click();
    await this.page.locator('body').setInputFiles(testdata.fileUpload);
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.getByRole('button', { name: 'Ok' }).click();
  }
}
