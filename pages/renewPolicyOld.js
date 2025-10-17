const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

class RenewPolicyPage {
  constructor(page) {
    this.page = page;
  }

  async runFlow(data, creds) {
    const page = this.page;
    await page.goto('https://uatlifekaplan.tmibasl.in/');
    await page.getByRole('textbox', { name: 'Enter User Name' }).fill(creds.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(creds.password);
    await page.getByRole('button', { name: /login/i }).click();
    await page.getByRole('button', { name: /menu/i }).click();
    await page.getByText('Policy Centre').click();
    await page.getByText(/^Policy$/).click();
    await page.getByText('Policy Issuance').click();
    await page.getByRole('button', { name: /renew/i }).click();
    await page.getByRole('button', { name: /NON TMIBASL POLICY/i }).click();
    await page.getByLabel('Previous Policy No').fill(data.prevPolicyNo);
    await page.locator('#mui-component-select-PREV_COVERTYPE_ID').click();
    await page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 5000 });
    await page.locator('ul[role="listbox"] li[role="option"]', { hasText: data.prevVehicleCover }).click();
    // OD Policy Expiry Date
    await page.locator('input[name="POLICY_EXPIRY_DATE"]').first().click();
    await this._selectDate(data.odPolicyExpiryDate);
    // TP Policy Expiry Date
    await page.locator('input[name="POLICY_EXPIRY_DATE"]').nth(1).click();
    await this._selectDate(data.tpPolicyExpiryDate);
    await page.locator('#mui-component-select-OLD_POL_NCB_LEVEL').click();
    await page.getByRole('option', { name: data.ncb }).click();
    // OEM (robust selector using provided HTML)
    await page.locator('#mui-component-select-FKOEM_ID').click();
    await page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 5000 });
    await page.locator('ul[role="listbox"] li[role="option"]', { hasText: data.oem }).click({ force: true });
    await page.waitForTimeout(500); // Wait for the next dropdown to render
    if (page.isClosed && page.isClosed()) return;
    // Previous Vehicle Cover (robust selector)
    await page.locator('#mui-component-select-PREV_COVERTYPE_ID').click();
    await page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 5000 });
    await page.locator('ul[role="listbox"] li[role="option"]', { hasText: data.prevVehicleCover }).click();
    await page.locator('#mui-component-select-FKISURANCE_COMP_ID').click();
    await page.getByRole('option', { hasText: data.prevPolicyIC }).click();
    await page.locator('#mui-component-select-CoverTypeId').click();
    await page.waitForSelector('ul[role="listbox"] li[role="option"]', { timeout: 5000 });
    await page.locator('ul[role="listbox"] li[role="option"]', { hasText: data.vehicleCover }).click();
    await page.locator('#mui-component-select-Salutation').click();
    await page.getByRole('option', { name: data.salutation }).click();
    await page.locator('input[name="FIRST_NAME"]').fill(data.firstName);
    await page.locator('input[name="EMAIL"]').fill(data.email);
    await page.locator('input[name="MOB_NO"]').fill(data.mobile);
    // VIN (Chassis No)
    const randomVin = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await page.locator('input[name="ChassisNo"]').fill(randomVin);
    fs.writeFileSync(path.join(__dirname, '../testdata/generated_vin.json'), JSON.stringify({ vin: randomVin }, null, 2));
    // Engine No
    const randomEngineNo = Array.from({ length: 17 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
    await page.locator('input[name="EngineNo"]').fill(randomEngineNo);
    fs.writeFileSync(path.join(__dirname, '../testdata/generated_engine.json'), JSON.stringify({ engine: randomEngineNo }, null, 2));
    await page.locator('#mui-component-select-MakeId').click();
    await page.getByRole('option', { name: data.make }).click();
    await page.locator('#mui-component-select-ModelId').click();
    await page.getByRole('option', { name: data.model }).click();
    await page.locator('#mui-component-select-VariantId').click();
    await page.getByRole('option', { name: data.variant }).click();
    await page.locator('#mui-component-select-DateofManufacture').click();
    await page.getByRole('option', { name: data.year }).click();
    await page.locator('#mui-component-select-RTOId').click();
    await page.getByRole('option', { hasText: data.registrationCity }).click();
    await page.locator('#mui-component-select-IsuredStateId').click();
    await page.getByRole('option', { hasText: data.customerState }).click();
    // Invoice Date
    await page.locator('input[name="InvoiceDate"]').click();
    await this._selectDate(data.invoiceDate);
    // Registration Date
    await page.locator('input[name="RegistrationDate"]').click();
    await this._selectDate(data.registrationDate);
    await page.getByRole('button', { name: /Get Quotes/i }).click();
    await page.pause();
  }

  async _selectDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    await this.page.getByRole('gridcell', { name: day.replace(/^0/, ''), exact: true }).click();
  }
}

module.exports = RenewPolicyPage;
