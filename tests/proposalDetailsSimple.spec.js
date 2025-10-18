// @ts-check
const { test, expect } = require('@playwright/test');

test('Verify proposal details filling - simple test', async ({ page }) => {
  // Load the proposal details HTML file directly to simulate the page
  await page.goto('file://' + require('path').resolve(__dirname, '../rawhtmls/proposaldetails.html'));
  await page.waitForLoadState('domcontentloaded');
  
  console.log('Starting simple proposal details filling test...');
  
  // Load the dummy data
  const proposalData = require('../testdata/proposalDetails.json');
  
  // Wait for the proposal details section to be visible
  await page.waitForSelector('text=Proposer Details', { timeout: 10000 }).catch(() => {});
  
  // Test filling only the fields that are enabled
  let fieldsFilledCount = 0;
  
  // First Name
  try {
    console.log('Checking first name field...');
    const firstNameInput = page.locator('input[name="FIRST_NAME"]');
    if (await firstNameInput.isVisible({ timeout: 2000 })) {
      const isEnabled = await firstNameInput.isEnabled().catch(() => false);
      console.log(`First name field enabled: ${isEnabled}`);
      if (isEnabled) {
        await firstNameInput.clear();
        await firstNameInput.fill(proposalData.firstName);
        console.log(`First name filled with: ${proposalData.firstName}`);
        fieldsFilledCount++;
      }
    }
  } catch (e) {
    console.log('Error with first name field:', e.message);
  }
  
  // Middle Name
  try {
    console.log('Checking middle name field...');
    const middleNameInput = page.locator('input[name="MIDDLE_NAME"]');
    if (await middleNameInput.isVisible({ timeout: 2000 })) {
      const isEnabled = await middleNameInput.isEnabled().catch(() => false);
      console.log(`Middle name field enabled: ${isEnabled}`);
      if (isEnabled) {
        await middleNameInput.clear();
        await middleNameInput.fill(proposalData.middleName);
        console.log(`Middle name filled with: ${proposalData.middleName}`);
        fieldsFilledCount++;
      }
    }
  } catch (e) {
    console.log('Error with middle name field:', e.message);
  }
  
  // Last Name
  try {
    console.log('Checking last name field...');
    const lastNameInput = page.locator('input[name="LAST_NAME"]');
    if (await lastNameInput.isVisible({ timeout: 2000 })) {
      const isEnabled = await lastNameInput.isEnabled().catch(() => false);
      console.log(`Last name field enabled: ${isEnabled}`);
      if (isEnabled) {
        await lastNameInput.clear();
        await lastNameInput.fill(proposalData.lastName);
        console.log(`Last name filled with: ${proposalData.lastName}`);
        fieldsFilledCount++;
      }
    }
  } catch (e) {
    console.log('Error with last name field:', e.message);
  }
  
  // Email (check if enabled)
  try {
    console.log('Checking email field...');
    const emailInput = page.locator('input[name="EMAIL"]');
    if (await emailInput.isVisible({ timeout: 2000 })) {
      const isEnabled = await emailInput.isEnabled().catch(() => false);
      console.log(`Email field enabled: ${isEnabled}`);
      if (isEnabled) {
        await emailInput.clear();
        await emailInput.fill(proposalData.email);
        console.log(`Email filled with: ${proposalData.email}`);
        fieldsFilledCount++;
      } else {
        console.log('Email field is disabled, skipping...');
      }
    }
  } catch (e) {
    console.log('Error with email field:', e.message);
  }
  
  // Mobile Number (check if enabled)
  try {
    console.log('Checking mobile number field...');
    const mobileInput = page.locator('input[name="MOB_NO"]');
    if (await mobileInput.isVisible({ timeout: 2000 })) {
      const isEnabled = await mobileInput.isEnabled().catch(() => false);
      console.log(`Mobile number field enabled: ${isEnabled}`);
      if (isEnabled) {
        await mobileInput.clear();
        await mobileInput.fill(proposalData.mobileNo);
        console.log(`Mobile number filled with: ${proposalData.mobileNo}`);
        fieldsFilledCount++;
      } else {
        console.log('Mobile number field is disabled, skipping...');
      }
    }
  } catch (e) {
    console.log('Error with mobile number field:', e.message);
  }
  
  // Alternate Mobile Number
  try {
    console.log('Checking alternate mobile number field...');
    const altMobileInput = page.locator('input[name="ALT_MOBILE_NO"]');
    if (await altMobileInput.isVisible({ timeout: 2000 })) {
      const isEnabled = await altMobileInput.isEnabled().catch(() => false);
      console.log(`Alternate mobile number field enabled: ${isEnabled}`);
      if (isEnabled) {
        await altMobileInput.clear();
        await altMobileInput.fill(proposalData.alternateMobileNo);
        console.log(`Alternate mobile number filled with: ${proposalData.alternateMobileNo}`);
        fieldsFilledCount++;
      }
    }
  } catch (e) {
    console.log('Error with alternate mobile number field:', e.message);
  }
  
  // PAN Number
  try {
    console.log('Checking PAN number field...');
    const panInput = page.locator('input[name="PAN_NO"]');
    if (await panInput.isVisible({ timeout: 2000 })) {
      const isEnabled = await panInput.isEnabled().catch(() => false);
      console.log(`PAN number field enabled: ${isEnabled}`);
      if (isEnabled) {
        await panInput.clear();
        await panInput.fill(proposalData.panNo);
        console.log(`PAN number filled with: ${proposalData.panNo}`);
        fieldsFilledCount++;
      }
    }
  } catch (e) {
    console.log('Error with PAN number field:', e.message);
  }
  
  console.log(`Total fields filled: ${fieldsFilledCount}`);
  
  // Take a screenshot for verification
  await page.screenshot({ path: 'proposal-details-simple-filled.png', fullPage: true });
  
  // Stay on the page for 5 seconds (simulating the real test behavior)
  console.log('Staying on proposal details page for 5 seconds...');
  await page.waitForTimeout(5000);
  
  console.log('Simple proposal details test completed successfully!');
  
  // Basic assertion - at least some fields should be fillable
  expect(fieldsFilledCount).toBeGreaterThan(0);
});
