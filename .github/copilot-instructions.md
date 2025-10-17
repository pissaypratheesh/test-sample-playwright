# Copilot Instructions for AI Agents

## Project Overview
This project is a Playwright-based end-to-end (E2E) and UI testing framework for web applications. It uses JavaScript and Playwright's test runner, with test data stored in JSON files. The codebase is organized for modular page object patterns and supports CI via GitHub Actions.

## Key Directories & Files
- `pages/`: Page Object Model classes (e.g., `LoginPage.js`, `LogoutPage.js`).
- `tests/`: Main Playwright test specs (e.g., `LoginTest.spec.js`).
- `e2e/`: Example/spec files for Playwright, using modern import syntax.
- `testdata/`: JSON files for test data (e.g., `Login_Data.json`).
- `playwright.config.js`: Playwright configuration (testDir, timeouts, etc).
- `.github/workflows/playwright.yml`: CI pipeline for Playwright tests.

## Patterns & Conventions
- **Page Object Model**: Each page class (e.g., `LoginPage`, `LogoutPage`) encapsulates selectors and actions. Instantiate with `new PageClass(page)`.
- **Test Data**: Import test data from JSON files. Key names in JSON must match usage in code (e.g., `testdata.URL`).
- **Selectors**: Use CSS selectors. If elements are not found, verify selectors against the actual HTML.
- **Test Structure**: Use Playwright's `test()` blocks. Example:
  ```js
  import { test, expect } from '@playwright/test';
  import { LoginPage } from '../pages/LoginPage';
  test('Login Test', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.gotoLoginPage();
    await loginPage.doLogin();
  });
  ```
- **CI/CD**: Tests run automatically on push/PR to `main`/`master` via GitHub Actions. See `.github/workflows/playwright.yml`.

## Developer Workflows
- **Install dependencies**: `npm ci` (used in CI) or `npm install` locally.
- **Run tests**: `npx playwright test` (all tests) or `npx playwright test tests/LoginTest.spec.js --headed` (single test, headed mode).
- **Debugging**: Use `--headed` to observe browser actions. Check selectors and page objects if tests fail due to missing elements.
- **Add new tests**: Place in `tests/` or `e2e/`. Use page objects and import test data as needed.

## Integration Points
- **External**: Relies on Playwright and Node.js. No custom build scripts; all test orchestration via Playwright CLI and GitHub Actions.
- **Artifacts**: Test results and reports are saved in `test-results/` and uploaded as GitHub Action artifacts.

## Examples
- See `e2e/example.spec.js` for modern Playwright syntax and role-based selectors.
- See `tests/LoginTest.spec.js` for page object usage and test data integration.

## Troubleshooting
- If tests fail due to missing selectors, inspect the target page and update selectors in page objects.
- Ensure JSON keys match code usage (e.g., `URL` vs `url`).
- For CI issues, check `.github/workflows/playwright.yml` for steps and environment setup.

---

_If any section is unclear or missing important project-specific details, please provide feedback or point to files that need deeper documentation._
