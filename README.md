# Insurance Renewal Form Test Automation

This project contains Playwright-based end-to-end tests for insurance renewal forms with support for both Individual and Corporate proposer types.

## Project Structure

```
├── docs/                          # Documentation files
│   ├── README.md                  # Main documentation
│   ├── CHANGELOG_LATEST.md        # Latest changes log
│   ├── REFACTORING_SUMMARY.md     # Architecture refactoring details
│   ├── debugging_suspects.md      # Debugging notes
│   └── ProposalDetailsPage_Analysis.md
├── pages/
│   └── renewal/                   # Renewal form system
│       ├── BaseRenewalPage.js
│       ├── PolicyVehicleDetailsPage.js
│       ├── AdditionalDetailsPage.js
│       ├── ProposalDetailsPage.js
│       ├── RenewalFormFlowCoordinator.js
│       └── components/            # Modular components
├── tests/                         # Test files
│   ├── renewTata.spec.js          # Individual proposer flow
│   └── corporateFlow.spec.js     # Corporate proposer flow
└── testdata/                      # Test data files
    ├── renewTatadata.json
    ├── renewcorporate.json
    └── proposalDetails.json
```

## Documentation

All documentation files are located in the `docs/` folder:

- **[README.md](./docs/README.md)** - Complete documentation of the renewal form system
- **[CHANGELOG_LATEST.md](./docs/CHANGELOG_LATEST.md)** - Latest changes and updates
- **[REFACTORING_SUMMARY.md](./docs/REFACTORING_SUMMARY.md)** - Architecture refactoring details

## Quick Start

### Running Tests

```bash
# Run individual proposer flow
npx playwright test tests/renewTata.spec.js --headed

# Run corporate proposer flow
npx playwright test tests/corporateFlow.spec.js --headed
```

### Prerequisites

- Node.js 14+
- npm or yarn
- Playwright installed

```bash
npm install
npx playwright install
```

## Key Features

- ✅ Support for Individual and Corporate proposer types
- ✅ Dynamic form sections handling
- ✅ NCB Carry Forward support
- ✅ AAI Membership integration
- ✅ Date of Incorporation for corporate flows
- ✅ Modular, maintainable architecture

## Recent Updates

For detailed information about recent changes, see [CHANGELOG_LATEST.md](./docs/CHANGELOG_LATEST.md)

Main updates include:
- Corporate Proposer Date of Incorporation support
- Enhanced Nominee Details handling
- NCB certificate date validation fixes
- Improved field detection with DOM tree traversal

## License

[Your License Here]

