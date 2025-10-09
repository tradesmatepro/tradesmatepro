# 🛠️ TradeMate Pro Developer Tools

Comprehensive automated testing and development tools for TradeMate Pro.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Available Tools](#available-tools)
3. [Test Reports](#test-reports)
4. [Configuration](#configuration)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install Playwright (if not already installed)
npm install -D playwright

# Make sure your dev server is running
npm run dev
# Server should be at http://localhost:3004
```

### Run Your First Test

```bash
# Simple data seeder (recommended for first run)
node devtools/seedData.js

# Comprehensive workflow test
node devtools/realWorldTest.js
```

---

## 🧰 Available Tools

### 1. **seedData.js** - Simple Data Seeder 🌱

**Purpose:** Quickly populate your database with realistic test data.

**Creates:**
- 10 customers (residential + commercial)
- 5 employees (various roles)
- 15 quotes (various amounts)

**Runtime:** ~3-5 minutes

**Use When:**
- Setting up a fresh database
- Creating demo environments
- Need quick test data
- Don't need complex workflows

**Run:**
```bash
node devtools/seedData.js
```

**Output:**
- Console progress updates
- `devtools/seed-results.json` - Detailed results

---

### 2. **realWorldTest.js** - Comprehensive Workflow Tester 🎯

**Purpose:** Test the entire quote-to-payment workflow with real UI interactions.

**Creates:**
- 10 customers
- 5 employees
- 20 quotes (progressed through different stages)
- Tests: draft → sent → approved → scheduled → completed → invoiced → paid → closed

**Runtime:** ~8-12 minutes

**Use When:**
- Testing full workflows
- Validating bug fixes
- Stress testing the system
- Verifying deployment success

**Run:**
```bash
node devtools/realWorldTest.js
```

**Output:**
- Console progress updates
- `devtools/real-world-test-results.json` - Detailed results
- `devtools/TEST_REPORT.md` - Human-readable report

---

## 📊 Test Reports

### Understanding Test Results

All tests generate JSON result files with this structure:

```json
{
  "startTime": "2025-10-05T03:18:19.600Z",
  "endTime": "2025-10-05T03:28:25.339Z",
  "customers": [
    { "name": "John Smith", "status": "created" }
  ],
  "employees": [
    { "name": "Tom Anderson", "role": "technician", "status": "created" }
  ],
  "quotes": [
    { "title": "Kitchen Sink Replacement", "amount": 850, "status": "created" }
  ],
  "errors": [
    { "type": "quote", "index": 10, "error": "..." }
  ]
}
```

### Success Metrics

| Metric | Good | Acceptable | Needs Work |
|--------|------|------------|------------|
| Customer Creation | 100% | 90%+ | <90% |
| Employee Creation | 100% | 90%+ | <90% |
| Quote Creation | 100% | 80%+ | <80% |
| Workflow Completion | 80%+ | 60%+ | <60% |
| Error Rate | 0% | <10% | >10% |

---

## ⚙️ Configuration

### Changing Test Credentials

Edit the constants at the top of each test file:

```javascript
const APP_URL = 'http://localhost:3004';
const TEST_EMAIL = 'your-email@example.com';
const TEST_PASSWORD = 'your-password';
```

### Adjusting Test Speed

```javascript
const browser = await chromium.launch({ 
  headless: false,  // Set to true for faster headless mode
  slowMo: 50        // Milliseconds between actions (0 = fastest)
});
```

### Customizing Test Data

Edit the data arrays in each file:

```javascript
const CUSTOMERS = [
  { name: 'Your Customer', phone: '+1...', ... }
];

const EMPLOYEES = [
  { firstName: 'Your', lastName: 'Employee', ... }
];

const QUOTES = [
  { title: 'Your Quote', description: '...', ... }
];
```

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Cannot find module 'playwright'"

**Solution:**
```bash
npm install -D playwright
npx playwright install
```

#### ❌ "Navigation timeout exceeded"

**Cause:** Dev server not running or wrong URL

**Solution:**
```bash
# Make sure dev server is running
npm run dev

# Verify URL in test file matches your server
const APP_URL = 'http://localhost:3004';
```

#### ❌ "Login failed" or "Already logged in"

**Cause:** Incorrect credentials or session issues

**Solution:**
1. Update credentials in test file
2. Clear browser data: `rm -rf ~/.cache/ms-playwright`
3. Try logging in manually first

#### ❌ "Element not found" errors

**Cause:** UI changes or timing issues

**Solution:**
1. Increase `slowMo` value for slower execution
2. Add more `waitForTimeout()` calls
3. Update selectors to match current UI

#### ❌ "Element outside viewport"

**Cause:** UI layout issues (known issue with Accept button)

**Solution:**
1. See `TEST_REPORT.md` for details
2. Fix UI layout to keep buttons in viewport
3. Or manually approve quotes after test creates them

---

## 📈 Best Practices

### Before Running Tests

1. ✅ **Backup your database** (if using production data)
2. ✅ **Ensure dev server is running**
3. ✅ **Close other browser windows** (reduces conflicts)
4. ✅ **Check available disk space** (for screenshots/videos)

### During Tests

1. 👀 **Watch the browser** (headless: false recommended)
2. 📸 **Take screenshots** of any errors
3. 📝 **Note any unexpected behavior**
4. ⏱️ **Monitor performance** (slow pages = potential issues)

### After Tests

1. 📊 **Review result files** (`*-results.json`)
2. 📄 **Read test reports** (`TEST_REPORT.md`)
3. 🐛 **File bugs** for any failures
4. ✅ **Verify data** in the actual UI
5. 🧹 **Clean up test data** if needed

---

## 🎯 Test Coverage

### What's Tested ✅

- ✅ Customer creation (residential + commercial)
- ✅ Employee creation (all roles)
- ✅ Quote creation
- ✅ Quote sending
- ✅ Form validation
- ✅ Navigation flows
- ✅ Button states

### What's NOT Tested ❌

- ❌ Quote approval (viewport issue)
- ❌ Job scheduling
- ❌ Timesheet creation
- ❌ PTO requests
- ❌ Expense tracking
- ❌ Inventory management
- ❌ Vendor management
- ❌ Invoice creation
- ❌ Payment processing
- ❌ Reporting features

---

## 🔮 Future Enhancements

### Planned Features

1. **API Testing** - Direct database seeding for speed
2. **Visual Regression** - Screenshot comparison
3. **Performance Testing** - Load time monitoring
4. **Accessibility Testing** - WCAG compliance
5. **Mobile Testing** - Responsive design validation
6. **Integration Tests** - External service mocking
7. **CI/CD Integration** - Automated test runs
8. **Test Data Cleanup** - Automatic rollback

### Want to Contribute?

1. Add new test scenarios
2. Improve error handling
3. Add more realistic data
4. Create test utilities
5. Write documentation

---

## 📞 Support

### Getting Help

1. **Check TEST_REPORT.md** for known issues
2. **Review error logs** in result files
3. **Search existing issues** in the repo
4. **Ask in team chat** with error details

### Reporting Bugs

Include:
- Test file name
- Error message
- Result JSON file
- Screenshots (if applicable)
- Steps to reproduce

---

## 📝 Notes

### Why Playwright?

- ✅ **Real browser testing** - Tests actual user experience
- ✅ **Cross-browser support** - Chrome, Firefox, Safari
- ✅ **Auto-wait** - Handles timing automatically
- ✅ **Screenshots/videos** - Easy debugging
- ✅ **Fast execution** - Parallel test support
- ✅ **Great documentation** - Easy to learn

### Why UI Testing vs API Testing?

**UI Testing (Current):**
- ✅ Tests real user flows
- ✅ Catches UI bugs
- ✅ Validates form behavior
- ❌ Slower execution
- ❌ More brittle

**API Testing (Future):**
- ✅ Faster execution
- ✅ More reliable
- ✅ Better for CI/CD
- ❌ Misses UI bugs
- ❌ Doesn't test UX

**Best Approach:** Use both! UI tests for critical flows, API tests for data creation.

---

## 🎓 Learning Resources

### Playwright Documentation
- [Getting Started](https://playwright.dev/docs/intro)
- [Selectors](https://playwright.dev/docs/selectors)
- [Best Practices](https://playwright.dev/docs/best-practices)

### TradeMate Pro Docs
- See `notes.md` for database schema
- See `gptnotes.txt` for dev tools info
- See `TEST_REPORT.md` for test results

---

**Last Updated:** October 5, 2025  
**Maintained By:** TradeMate Pro Development Team  
**Version:** 1.0.0

