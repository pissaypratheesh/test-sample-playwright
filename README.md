# Playwright Test Automation Framework

Welcome to the Playwright Test Automation Framework! This project provides a clean, organized, and reusable structure for Playwright test automation, specifically designed for insurance policy renewal flows.

## 📚 Documentation

All detailed documentation is organized in the `docs/` folder:

### 🏗️ Project Documentation
- **[Project Overview](docs/project-overview.md)** - Complete project structure, setup, and usage guide
- **[Architecture](docs/architecture.md)** - Technical architecture and design patterns
- **[Implementation Summary](docs/implementation-summary.md)** - Implementation details and patterns

### 🛠️ Utilities Documentation
- **[Utils Directory Structure](docs/utils-directory-structure.md)** - Complete guide to the organized utils folder structure
- **[DatePicker Utilities](docs/datepicker-utilities.md)** - Comprehensive date picker utilities documentation
- **[Date Picker Guide](docs/date-picker-guide.md)** - Detailed date picker usage guide

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Tests**
   ```bash
   npx playwright test
   ```

3. **Run Specific Test**
   ```bash
   npx playwright test tests/completeE2E.spec.js
   ```

## 📁 Key Directories

- **`pages/`** - Page objects and utilities
- **`tests/`** - Test specifications
- **`testdata/`** - Test data files
- **`config/`** - Configuration files
- **`docs/`** - Documentation

## 🎯 Key Features

- **Modular Design** - Organized into logical, reusable components
- **Comprehensive Utilities** - Extensive utility classes for common operations
- **Date Picker Support** - Robust Material UI date picker handling
- **E2E Flow Management** - Complete end-to-end test flow utilities
- **Form Automation** - Advanced form interaction utilities
- **Navigation Utilities** - Comprehensive navigation and menu handling

## 📋 Coding Standards

This project follows strict coding standards:
- **File Length Limit**: Maximum 300 lines per file
- **Modular Design**: Single responsibility principle
- **Reusable Components**: DRY principle implementation
- **Comprehensive Documentation**: JSDoc comments and README files
- **Error Handling**: Robust error handling with retry mechanisms

## 🔧 Utilities Overview

### Core Utilities (`pages/utils/core/`)
- **BasePage.js** - Foundation class with common utilities
- **DatePickerUtils.js** - Main date picker orchestrator
- **datepicker/** - Specialized date picker components

### Form Utilities (`pages/utils/forms/`)
- **FormUtils.js** - General form interaction utilities
- **PolicyDetailsUtils.js** - Policy details form utilities
- **ProposalDetailsUtils.js** - Proposal details form utilities

### Navigation Utilities (`pages/utils/navigation/`)
- **NavigationUtils.js** - Navigation and menu utilities

### E2E Utilities (`pages/utils/e2e/`)
- **E2ECoreUtils.js** - Core E2E flow functions
- **E2EFlowUtils.js** - Main E2E orchestrator
- **E2EValidationUtils.js** - E2E validation utilities

## 📖 Getting Started

For detailed information, please refer to the documentation in the `docs/` folder:

1. Start with **[Project Overview](docs/project-overview.md)** for complete setup
2. Review **[Architecture](docs/architecture.md)** for technical details
3. Check **[Utils Directory Structure](docs/utils-directory-structure.md)** for utilities guide
4. See **[DatePicker Utilities](docs/datepicker-utilities.md)** for date picker usage

## 🤝 Contributing

When contributing to this project:
1. Follow the coding standards (300-line file limit)
2. Maintain modular design principles
3. Add comprehensive JSDoc comments
4. Update relevant documentation
5. Ensure all tests pass

## 📞 Support

For questions or issues:
1. Check the documentation in the `docs/` folder
2. Review the code examples in test files
3. Refer to the utility class documentation

---

**Happy Testing! 🎉**
