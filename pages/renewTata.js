module.exports = class RenewTata {
  constructor(page) {
    this.page = page;
  }
  async runFlow(data, creds) {
    const page = this.page;
    await page.goto('https://uatlifekaplan.tmibasl.in/');
    await page.getByRole('textbox', { name: 'Enter User Name' }).fill(creds.username);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(creds.password);
    await page.getByRole('button', { name: 'Login    ' }).click();
    await page.getByRole('button', { name: 'menu' }).click();
    await page.locator('a').filter({ hasText: 'Policy Centre' }).click();
    await page.locator('a').filter({ hasText: /^Policy$/ }).click();
    await page.locator('a').filter({ hasText: 'Policy Issuance' }).click();
    await page.getByRole('button', { name: 'Renew' }).click();
    await page.getByRole('button', { name: 'Non TMIBASL Policy' }).click();
    await page.getByRole('combobox', { name: 'OEM * --Select OEM--' }).click();
    await page.getByRole('option', { name: data.oem }).click();
    await page.getByRole('textbox', { name: 'Previous Policy No *' }).fill(data.prevPolicyNo);
    await page.getByText('--Select Previous Vehicle').click();
    await page.getByRole('option', { name: data.prevVehicleCover }).click();
    // TP Policy Expiry Date (robust dynamic selection, by input index)
    if (data.tpPolicyExpiryDate) {
      const [tpDay, tpMonth, tpYear] = data.tpPolicyExpiryDate.split('/');
      await this.page.locator('input[placeholder="DD/MM/YYYY"]').nth(1).click();
      await this.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      // Navigate to correct year/month
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const targetMonth = months[parseInt(tpMonth, 10) - 1];
      let headerText = await this.page.locator('[role="dialog"] [class*=MuiPickersCalendarHeader-label]').first().textContent();
      for (let i = 0; i < 24; i++) {
        if (headerText && headerText.includes(tpYear) && headerText.includes(targetMonth)) break;
        await this.page.getByRole('button', { name: /next month/i }).click();
        headerText = await this.page.locator('[role="dialog"] [class*=MuiPickersCalendarHeader-label]').first().textContent();
      }
      // Click the correct day (simulate double click if needed)
      const dayCell = this.page.getByRole('gridcell', { name: tpDay.replace(/^0/, ''), exact: true });
      await dayCell.click();
      await this.page.waitForTimeout(200);
      // If calendar is still open, click again or try to confirm/apply
      if (await this.page.isVisible('[role="dialog"]')) {
        await dayCell.click();
        await this.page.waitForTimeout(200);
        // Try clicking OK/Confirm/Apply if present
        const okBtn = await this.page.$('[role="dialog"] button:has-text("OK")');
        if (okBtn) { await okBtn.click(); await this.page.waitForTimeout(200); }
        const confirmBtn = await this.page.$('[role="dialog"] button:has-text("Confirm")');
        if (confirmBtn) { await confirmBtn.click(); await this.page.waitForTimeout(200); }
        const applyBtn = await this.page.$('[role="dialog"] button:has-text("Apply")');
        if (applyBtn) { await applyBtn.click(); await this.page.waitForTimeout(200); }
      }
      // Log for debugging
      const stillOpen = await this.page.isVisible('[role="dialog"]');
      if (stillOpen) console.log('Calendar dialog still open after all attempts.');
    }
    // Add more fields as per recorded_flow.js, always using data.*
    // Example for Vehicle Cover
    await page.getByRole('combobox', { name: 'OEM * --Select Vehicle Cover--' }).click();
    await page.getByRole('option', { name: data.vehicleCover }).click();
    await page.getByRole('combobox', { name: 'OEM * --Select Salutation--' }).click();
    await page.getByRole('option', { name: data.salutation }).click();
    await page.getByRole('textbox', { name: 'First Name *' }).fill(data.firstName);
    await page.getByRole('textbox', { name: 'Email Id *' }).fill(data.email);
    await page.getByRole('textbox', { name: 'Mobile No *' }).fill(data.mobile);
    await page.getByRole('textbox', { name: 'VIN (Chassis No) *' }).fill(data.vin);
    await page.getByRole('textbox', { name: 'Engine No *' }).fill(data.engineNo);
    await page.getByRole('combobox', { name: 'OEM * --Select Make--' }).click();
    await page.getByRole('option', { name: data.make }).click();
    await page.getByText('--Select Model--').click();
    await page.getByRole('option', { name: data.model }).click();
    await page.getByText('--Select Variant--').click();
    await page.getByRole('option', { name: data.variant }).click();
    await page.getByText('--Select Year of Manufacture--').click();
    await page.getByRole('option', { name: data.year }).click();
    await page.getByText('--Select Registration City--').click();
    await page.getByRole('option', { name: data.registrationCity }).click();
    await page.getByRole('combobox', { name: 'OEM * --Select Customer' }).click();
    await page.getByRole('option', { name: data.customer }).click();
    // Continue for all fields in the flow...
  }
};