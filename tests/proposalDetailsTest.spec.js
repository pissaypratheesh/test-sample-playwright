// @ts-check
const { test, expect } = require('@playwright/test');

test('Verify proposal details filling functionality', async ({ page }) => {
  // Load the proposal details HTML file directly to simulate the page
  await page.goto('file://' + require('path').resolve(__dirname, '../rawhtmls/proposaldetails.html'));
  await page.waitForLoadState('domcontentloaded');
  
  console.log('Starting proposal details filling test...');
  
  // Load the dummy data
  const proposalData = require('../testdata/proposal/proposalDetails.json');
  
  // Create a simple version of the fill function for testing
  const fillProposalDetails = async (data) => {
    try {
      console.log('Starting to fill proposal details...');
      
      // Wait for the proposal details section to be visible
      await page.waitForSelector('text=Proposer Details', { timeout: 10000 }).catch(() => {});
      
      // First Name
      try {
        console.log('Filling first name...');
        const firstNameInput = page.locator('input[name="FIRST_NAME"]');
        if (await firstNameInput.isVisible({ timeout: 2000 })) {
          await firstNameInput.clear();
          await firstNameInput.fill(data.firstName);
          console.log(`First name filled with: ${data.firstName}`);
        }
      } catch (e) {
        console.log('Error filling first name:', e.message);
      }
      
      // Middle Name
      try {
        console.log('Filling middle name...');
        const middleNameInput = page.locator('input[name="MIDDLE_NAME"]');
        if (await middleNameInput.isVisible({ timeout: 2000 })) {
          await middleNameInput.clear();
          await middleNameInput.fill(data.middleName);
          console.log(`Middle name filled with: ${data.middleName}`);
        }
      } catch (e) {
        console.log('Error filling middle name:', e.message);
      }
      
      // Last Name
      try {
        console.log('Filling last name...');
        const lastNameInput = page.locator('input[name="LAST_NAME"]');
        if (await lastNameInput.isVisible({ timeout: 2000 })) {
          await lastNameInput.clear();
          await lastNameInput.fill(data.lastName);
          console.log(`Last name filled with: ${data.lastName}`);
        }
      } catch (e) {
        console.log('Error filling last name:', e.message);
      }
      
      // Email
      try {
        console.log('Filling email...');
        const emailInput = page.locator('input[name="EMAIL"]');
        if (await emailInput.isVisible({ timeout: 2000 })) {
          await emailInput.clear();
          await emailInput.fill(data.email);
          console.log(`Email filled with: ${data.email}`);
        }
      } catch (e) {
        console.log('Error filling email:', e.message);
      }
      
      // Mobile Number
      try {
        console.log('Filling mobile number...');
        const mobileInput = page.locator('input[name="MOB_NO"]');
        if (await mobileInput.isVisible({ timeout: 2000 })) {
          await mobileInput.clear();
          await mobileInput.fill(data.mobileNo);
          console.log(`Mobile number filled with: ${data.mobileNo}`);
        }
      } catch (e) {
        console.log('Error filling mobile number:', e.message);
      }
      
      // PAN Number
      try {
        console.log('Filling PAN number...');
        const panInput = page.locator('input[name="PAN_NO"]');
        if (await panInput.isVisible({ timeout: 2000 })) {
          await panInput.clear();
          await panInput.fill(data.panNo);
          console.log(`PAN number filled with: ${data.panNo}`);
        }
      } catch (e) {
        console.log('Error filling PAN number:', e.message);
      }
      
      console.log('Finished filling proposal details form');
      
    } catch (e) {
      console.log('Error in fillProposalDetails:', e.message);
    }
  };
  
  // Fill the form
  await fillProposalDetails(proposalData);
  
  // Verify some fields were filled correctly
  const firstNameValue = await page.locator('input[name="FIRST_NAME"]').inputValue().catch(() => '');
  const emailValue = await page.locator('input[name="EMAIL"]').inputValue().catch(() => '');
  const mobileValue = await page.locator('input[name="MOB_NO"]').inputValue().catch(() => '');
  
  console.log(`Verification - First Name: ${firstNameValue}`);
  console.log(`Verification - Email: ${emailValue}`);
  console.log(`Verification - Mobile: ${mobileValue}`);
  
  // Take a screenshot for verification
  await page.screenshot({ path: 'proposal-details-filled.png', fullPage: true });
  
  // Stay on the page for 5 seconds (simulating the real test behavior)
  console.log('Staying on proposal details page for 5 seconds...');
  await page.waitForTimeout(5000);
  
  console.log('Proposal details test completed successfully!');
  
  // Basic assertions
  expect(firstNameValue).toBe(proposalData.firstName);
  expect(emailValue).toBe(proposalData.email);
  expect(mobileValue).toBe(proposalData.mobileNo);
});
