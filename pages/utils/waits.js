async function waitForQuotationResults(page, options = {}) {
  const envTimeout = parseInt(process.env.PLAYWRIGHT_QUOTE_LOAD_TIMEOUT_MS || '', 10);
  const defaultTimeout = Number.isFinite(envTimeout) && envTimeout > 0 ? envTimeout : 120000; // default 120s
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : defaultTimeout;
  const pollIntervalMs = Number.isFinite(options.pollIntervalMs) ? options.pollIntervalMs : 500;
  const deadline = Date.now() + timeoutMs;

  // First, try to catch URL navigation quickly (non-fatal if it doesn't change)
  try {
    await page.waitForURL(/Quotation/i, { timeout: 5000 });
  } catch {}

  // Ensure the page is at least DOM-ready; in SPA this may already be complete
  try {
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: Math.min(5000, timeoutMs) });
  } catch {}

  while (Date.now() < deadline) {
    try {
      // If there are loaders/backdrops, wait for them to disappear
      const loadingSelectors = [
        '.MuiBackdrop-root[aria-hidden="false"]',
        '.MuiCircularProgress-root',
        '.MuiLinearProgress-root',
        '[data-testid="loader"]',
        '.loading',
      ];
      let anyLoaderVisible = false;
      for (const sel of loadingSelectors) {
        const loc = page.locator(sel);
        if (await loc.first().isVisible().catch(() => false)) {
          anyLoaderVisible = true;
          break;
        }
      }
      if (anyLoaderVisible) {
        await page.waitForTimeout(pollIntervalMs);
        continue;
      }

      // Primary success condition: at least one BUY NOW button visible and enabled
      const buyNow = page.locator('button:has-text("BUY NOW")').first();
      if (await buyNow.isVisible().catch(() => false) && await buyNow.isEnabled().catch(() => false)) {
        return true;
      }

      // Secondary: presence of premium card prices or Selected Addons text
      const premiumCard = page.getByText(/BUY NOW|Premium Breakup|Selected Addons/i).first();
      if (await premiumCard.isVisible().catch(() => false)) {
        return true;
      }

      // Tertiary: Quotation heading visible
      const heading = page.getByRole('heading', { name: /Quotation/i });
      if (await heading.isVisible().catch(() => false)) {
        return true;
      }
    } catch {}

    await page.waitForTimeout(pollIntervalMs);
  }

  throw new Error('Timed out waiting for Quotation results to appear.');
}

module.exports = { waitForQuotationResults };
/**
 * Robustly clicks the first visible and enabled BUY NOW button on the Quotation page.
 */
async function clickFirstBuyNow(page, options = {}) {
  const envTimeout = parseInt(process.env.PLAYWRIGHT_QUOTE_LOAD_TIMEOUT_MS || '', 10);
  const defaultTimeout = Number.isFinite(envTimeout) && envTimeout > 0 ? envTimeout : 120000; // default 120s
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : defaultTimeout;
  const buttonCandidates = [
    page.locator('button:has-text("BUY NOW")').first(),
    page.getByRole('button', { name: /buy now/i }).first(),
  ];
  const start = Date.now();
  let lastError;
  // Ensure results are present before attempting click
  try { await waitForQuotationResults(page, { timeoutMs: Math.min(30000, timeoutMs) }); } catch {}
  while (Date.now() - start < timeoutMs) {
    for (const candidate of buttonCandidates) {
      try {
        await candidate.waitFor({ state: 'visible', timeout: 1500 });
        // Ensure in view
        await candidate.scrollIntoViewIfNeeded();
        // Some UIs need hover to enable
        await candidate.hover({ trial: true }).catch(() => {});
        // Try a normal click first
        await candidate.click({ timeout: 2500 });
        return true;
      } catch (err) {
        lastError = err;
        // As a fallback, try a force click if element exists
        try {
          const isVisible = await candidate.isVisible().catch(() => false);
          if (isVisible) {
            await candidate.click({ force: true, timeout: 1500 });
            return true;
          }
        } catch (ignore) {}
        // As a last resort, attempt JS click
        try {
          const handle = await candidate.elementHandle();
          if (handle) {
            await handle.evaluate((el) => el.click());
            return true;
          }
        } catch (ignore) {}
      }
    }
    await page.waitForTimeout(300);
  }
  throw lastError || new Error('Unable to click the first BUY NOW button within timeout');
}

module.exports.clickFirstBuyNow = clickFirstBuyNow;


