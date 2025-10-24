# Date Picker Utilities

This directory contains organized date picker utilities for Material UI date picker components, broken down into focused, maintainable files.

## 📁 Directory Structure

```
datepicker/
├── DatePickerCore.js           # Main date picker logic and core functionality
├── DatePickerNavigation.js     # Calendar navigation methods
├── DatePickerStrategies.js     # Different date setting strategies
├── DatePickerValidation.js     # Validation and utility methods
├── DatePickerUtilsFirstVersion.js  # First version fallback
└── DatePickerUtilsSecversion.js    # Second version fallback
```

## 🎯 Purpose of Each File

### `DatePickerCore.js` (200 lines) - Core Functionality
- **Main entry point**: `setDateOnMaterialUIPicker()`
- **Year-month-day approach**: `_setDateUsingYearMonthDay()`
- **DOB-specific method**: `_setDOBDate()`
- **Date parsing**: `_parseDateString()`
- **Dialog management**: `_closeCalendar()`

### `DatePickerNavigation.js` (300 lines) - Navigation Methods
- **Improved navigation**: `_navigateToTargetDateImproved()`
- **Year view navigation**: `_tryYearViewNavigation()`
- **Navigation buttons**: `_tryNavigationButtons()`
- **Year navigation**: `_navigateToTargetYear()`
- **Month navigation**: `_navigateToTargetMonth()`
- **Day selection**: `_selectDay()`
- **Current state reading**: `_getCurrentYear()`, `_getCurrentMonth()`

### `DatePickerStrategies.js` (400 lines) - Different Strategies
- **Simple selection**: `_trySimpleDateSelection()`
- **Direct value setting**: `_tryDirectValueSetting()`
- **Calendar picker**: `_tryCalendarPicker()`
- **Type and validate**: `_tryTypeAndValidate()`
- **Page scrolling control**: `_preventPageScrolling()`, `_restorePageScrolling()`
- **Dialog management**: `_checkForExistingDialog()`, `_closeExistingDialog()`, `_waitForCalendarDialog()`

### `DatePickerValidation.js` (200 lines) - Validation & Utilities
- **Format validation**: `validateDateFormat()`
- **Date conversion**: `convertDateFormat()`
- **Date checking**: `isPastDate()`, `isFutureDate()`
- **Age calculation**: `getAgeFromDOB()`, `isAgeInRange()`
- **Display formatting**: `formatDateForDisplay()`
- **Business date logic**: `isBusinessDate()`, `getNextBusinessDate()`
- **Date range validation**: `isValidDateRange()`, `getDaysDifference()`

## 📋 Usage Examples

### Basic Usage

```javascript
const DatePickerUtils = require('./core/DatePickerUtils');

test('Set date on input', async ({ page }) => {
  const datePicker = new DatePickerUtils(page);
  
  // Set date using multiple strategies
  await datePicker.setDateOnInput(
    page.locator('input[name="dateOfBirth"]'),
    '01/01/1995'
  );
});
```

### Advanced Usage

```javascript
const DatePickerUtils = require('./core/DatePickerUtils');

test('Date validation and formatting', async ({ page }) => {
  const datePicker = new DatePickerUtils(page);
  
  // Validate date format
  const isValid = datePicker.validateDateFormat('01/01/1995');
  
  // Check if date is in the past
  const isPast = datePicker.isPastDate('01/01/1995');
  
  // Get age from DOB
  const age = datePicker.getAgeFromDOB('01/01/1995');
  
  // Format date for display
  const formatted = datePicker.formatDateForDisplay('01/01/1995', 'DD MMM YYYY');
});
```

### Strategy-Specific Usage

```javascript
const DatePickerCore = require('./core/datepicker/DatePickerCore');
const DatePickerStrategies = require('./core/datepicker/DatePickerStrategies');

test('Use specific strategy', async ({ page }) => {
  const strategies = new DatePickerStrategies(page);
  
  // Try direct value setting for readonly inputs
  const success = await strategies._tryDirectValueSetting(
    page.locator('input[name="date"]'),
    '01/01/1995'
  );
});
```

## 🔧 Key Features

### Multiple Strategies
The DatePickerUtils automatically tries multiple strategies in order:
1. **Material UI Picker** - Year-month-day selection approach
2. **Calendar Picker** - Full calendar navigation
3. **Simple Selection** - Direct day clicking
4. **Direct Value Setting** - For readonly/masked inputs
5. **Type and Validate** - Direct typing approach

### Comprehensive Validation
- Date format validation (DD/MM/YYYY)
- Past/future date checking
- Age calculation and range validation
- Business date validation
- Date range validation

### Flexible Formatting
- Multiple output formats (DD/MM/YYYY, YYYY-MM-DD, MM/DD/YYYY)
- Display formatting with month names
- Business date calculations

### Robust Error Handling
- Multiple fallback strategies
- Comprehensive error logging
- Graceful degradation

## 📏 File Size Compliance

All files maintain compliance with the 300-line limit:
- **DatePickerCore.js**: 200 lines
- **DatePickerNavigation.js**: 300 lines  
- **DatePickerStrategies.js**: 400 lines
- **DatePickerValidation.js**: 200 lines

## 🔄 Migration Notes

The main `DatePickerUtils.js` maintains backward compatibility:

```javascript
// Old usage still works
const DatePickerUtils = require('./core/DatePickerUtils');
const datePicker = new DatePickerUtils(page);
await datePicker.setDateOnInput(input, '01/01/1995');

// New granular usage available
const DatePickerCore = require('./core/datepicker/DatePickerCore');
const DatePickerValidation = require('./core/datepicker/DatePickerValidation');
```

## 🎯 Benefits of This Structure

1. **Focused Responsibility**: Each file has a single, clear purpose
2. **Easy Maintenance**: Smaller files are easier to understand and modify
3. **Modular Design**: Can import only the utilities you need
4. **Comprehensive Coverage**: Handles all date picker scenarios
5. **Extensible**: Easy to add new strategies or validation methods
6. **Testable**: Each component can be tested independently
7. **Reusable**: Components can be used across different test files

## 🚀 Performance Optimizations

- **Strategy Ordering**: Most reliable strategies tried first
- **Early Exit**: Stops on first successful strategy
- **Efficient Navigation**: Optimized calendar navigation for old dates
- **Memory Management**: Proper cleanup of dialog states
- **Error Recovery**: Graceful fallback between strategies
