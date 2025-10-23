/**
 * Robust DOB setter for MUI v5 date picker used on the proposal page.
 * Uses direct value setting with event dispatch to avoid calendar popup issues.
 * @param {import('@playwright/test').Page} page
 * @param {string} dateStr DD/MM/YYYY
 */
async function setDobMUIv5(page, dateStr) {
  const dobInput = page.locator('input[name="DOB"]').first();
  if (!(await dobInput.isVisible().catch(() => false))) return;

  try {
    // Method 1: Direct value setting with event dispatch (most reliable)
    await dobInput.evaluate((el, value) => {
      el.removeAttribute('readonly');
      el.readOnly = false;
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    }, dateStr);
    
    await page.waitForTimeout(500);
    const value = await dobInput.inputValue().catch(() => '');
    if (value === dateStr) {
      console.log(`[DOB] Direct set successful: ${value}`);
      return value;
    }
  } catch (e) {
    console.log(`[DOB] Direct set failed: ${e.message}`);
  }

  try {
    // Method 2: Type directly without opening calendar
    await dobInput.click();
    await dobInput.fill('');
    await dobInput.type(dateStr);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    const value = await dobInput.inputValue().catch(() => '');
    if (value === dateStr) {
      console.log(`[DOB] Type method successful: ${value}`);
      return value;
    }
  } catch (e) {
    console.log(`[DOB] Type method failed: ${e.message}`);
  }

  // Method 3: Calendar interaction (fallback only)
  try {
    await dobInput.click();
    await page.waitForTimeout(300);
    
    const dialog = page.locator('[role="dialog"]').first();
    if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click Cancel immediately to avoid any calendar issues
      const cancel = dialog.getByRole('button', { name: /cancel/i }).first();
      if (await cancel.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cancel.click();
      }
    }
  } catch (e) {
    console.log(`[DOB] Calendar fallback failed: ${e.message}`);
  }

  return await dobInput.inputValue().catch(() => '');
}

module.exports = { setDobMUIv5 };