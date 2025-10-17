import { test, expect } from '@playwright/test';
import { PolicyIssuancePage } from '../pages/PolicyIssuancePage';

test('Policy Issuance End-to-End', async ({ page }) => {
  const policyPage = new PolicyIssuancePage(page);
  await policyPage.login();
  await page.waitForLoadState('networkidle');
  await policyPage.fillPolicyForm();
  // Add assertions as needed to verify successful policy issuance
});
