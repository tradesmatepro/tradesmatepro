# 🎮 AI UI Interaction Guide

## 🎯 Overview

You (Claude/GPT) can now **actually interact with the TradeMate Pro frontend** like a human QA tester!

No more "pretend testing" by inserting backend data. You can now:
- ✅ Click buttons and links
- ✅ Type into input fields
- ✅ Fill forms
- ✅ Select from dropdowns
- ✅ Verify DOM elements appear/disappear
- ✅ Capture screenshots
- ✅ Run complete test scenarios
- ✅ Detect visual regressions

This is **TRUE FRONTEND TESTING** - you're testing what users actually see and interact with!

---

## 🚀 Quick Start

### 1. Run a Predefined Test

The easiest way to test the frontend:

```json
{
  "commands": [
    {
      "id": "cmd_1234567890",
      "command": "ui_run_test",
      "params": {
        "scenario": "quoteFlow"
      },
      "timestamp": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

**Available Scenarios:**
- `quoteFlow` - Create a new quote
- `invoiceFlow` - View invoices
- `customerFlow` - Create a new customer
- `jobStatusTransition` - Test job status changes
- `onHoldModal` - Test OnHold modal
- `dashboardLoad` - Load and verify dashboard
- `completePipeline` - Full quote → invoice flow
- `authFlow` - Login test

### 2. Check the Response

```bash
view devtools/ai_responses.json
```

You'll see:
- ✅ Which steps passed
- ❌ Which steps failed
- 📸 Screenshot paths
- 📊 Detailed results

---

## 📋 All UI Commands

### Navigation

#### `ui_navigate` - Navigate to URL
```json
{
  "command": "ui_navigate",
  "params": {
    "url": "/quotes",
    "waitForSelector": "table",
    "timeout": 30000
  }
}
```

---

### Interactions

#### `ui_click` - Click element
```json
{
  "command": "ui_click",
  "params": {
    "selector": "button:has-text('New Quote')",
    "waitForNavigation": false,
    "timeout": 5000
  }
}
```

#### `ui_type` - Type into field (with delay)
```json
{
  "command": "ui_type",
  "params": {
    "selector": "input[name='job_title']",
    "text": "Test Quote",
    "clear": true,
    "timeout": 5000
  }
}
```

#### `ui_fill` - Fill field (fast)
```json
{
  "command": "ui_fill",
  "params": {
    "selector": "input[name='customer_name']",
    "value": "John Smith",
    "timeout": 5000
  }
}
```

#### `ui_select` - Select from dropdown
```json
{
  "command": "ui_select",
  "params": {
    "selector": "select[name='job_status']",
    "value": "on_hold",
    "timeout": 5000
  }
}
```

---

### Verification

#### `ui_check_element` - Check if element exists/visible
```json
{
  "command": "ui_check_element",
  "params": {
    "selector": "[role='dialog']",
    "shouldExist": true,
    "shouldBeVisible": true,
    "timeout": 5000
  }
}
```

#### `ui_get_text` - Get text from element
```json
{
  "command": "ui_get_text",
  "params": {
    "selector": "h1",
    "timeout": 5000
  }
}
```

#### `ui_wait_for` - Wait for element state
```json
{
  "command": "ui_wait_for",
  "params": {
    "selector": ".modal",
    "state": "visible",
    "timeout": 10000
  }
}
```

**States:** `visible`, `hidden`, `attached`, `detached`

---

### Capture

#### `ui_screenshot` - Capture screenshot
```json
{
  "command": "ui_screenshot",
  "params": {
    "name": "quote-form",
    "fullPage": true,
    "selector": null
  }
}
```

#### `ui_get_dom` - Get DOM snapshot
```json
{
  "command": "ui_get_dom",
  "params": {
    "name": "quote-page-dom",
    "selector": "body"
  }
}
```

---

### Advanced

#### `ui_run_scenario` - Run custom scenario
```json
{
  "command": "ui_run_scenario",
  "params": {
    "scenario": "Custom Test",
    "steps": [
      {
        "action": "navigate",
        "description": "Go to quotes",
        "params": { "url": "/quotes" }
      },
      {
        "action": "click",
        "description": "Click New Quote",
        "params": { "selector": "button:has-text('New Quote')" }
      },
      {
        "action": "screenshot",
        "description": "Capture form",
        "params": { "name": "quote-form" }
      }
    ]
  }
}
```

**Available Actions:**
- `navigate` - Navigate to URL
- `click` - Click element
- `type` - Type into field
- `fill` - Fill field
- `select` - Select from dropdown
- `checkElement` - Verify element
- `getText` - Get text content
- `waitFor` - Wait for element
- `screenshot` - Capture screenshot
- `wait` - Wait for milliseconds

#### `ui_login` - Login helper
```json
{
  "command": "ui_login",
  "params": {
    "email": "jeraldjsmith@gmail.com",
    "password": "Gizmo123",
    "url": "/login"
  }
}
```

#### `ui_close_browser` - Close browser
```json
{
  "command": "ui_close_browser",
  "params": {}
}
```

---

## 🎯 Common Workflows

### Test OnHold Modal Issue

```json
{
  "commands": [
    {
      "id": "cmd_1",
      "command": "ui_login",
      "params": {},
      "timestamp": "2025-10-06T12:00:00.000Z"
    },
    {
      "id": "cmd_2",
      "command": "ui_run_test",
      "params": {
        "scenario": "onHoldModal"
      },
      "timestamp": "2025-10-06T12:00:01.000Z"
    }
  ]
}
```

### Create Quote and Verify

```json
{
  "commands": [
    {
      "id": "cmd_1",
      "command": "ui_run_scenario",
      "params": {
        "scenario": "Create and Verify Quote",
        "steps": [
          {
            "action": "navigate",
            "params": { "url": "/quotes" }
          },
          {
            "action": "click",
            "params": { "selector": "button:has-text('New Quote')" }
          },
          {
            "action": "waitFor",
            "params": { "selector": "form", "timeout": 5000 }
          },
          {
            "action": "fill",
            "params": { 
              "selector": "input[name='job_title']", 
              "value": "Test Quote 123" 
            }
          },
          {
            "action": "screenshot",
            "params": { "name": "quote-form-filled" }
          },
          {
            "action": "click",
            "params": { "selector": "button[type='submit']" }
          },
          {
            "action": "wait",
            "params": { "ms": 2000 }
          },
          {
            "action": "screenshot",
            "params": { "name": "quote-saved" }
          }
        ]
      },
      "timestamp": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

---

## 🔍 Selector Tips

### Good Selectors (Reliable)
- `button:has-text("New Quote")` - Text-based
- `[data-testid="quote-form"]` - Test IDs
- `input[name="job_title"]` - Name attributes
- `[role="dialog"]` - ARIA roles

### Bad Selectors (Fragile)
- `.css-abc123` - Generated CSS classes
- `div > div > div:nth-child(3)` - Deep nesting
- `#root > div > div` - Generic structure

---

## 📊 Reading Results

After running a command, check `devtools/ai_responses.json`:

```json
{
  "responses": [
    {
      "id": "cmd_1234567890",
      "command": "ui_run_test",
      "status": "success",
      "data": {
        "scenario": "Quote Flow - Create New Quote",
        "passed": 5,
        "failed": 0,
        "steps": [
          {
            "step": 1,
            "action": "navigate",
            "status": "success",
            "message": "Navigated to /quotes"
          }
        ]
      },
      "timestamp": "2025-10-06T12:00:05.000Z"
    }
  ]
}
```

---

## 🎬 Example: Full Testing Workflow

### 1. Login
```json
{ "command": "ui_login", "params": {} }
```

### 2. Test Quote Flow
```json
{ "command": "ui_run_test", "params": { "scenario": "quoteFlow" } }
```

### 3. Check Results
```bash
view devtools/ai_responses.json
```

### 4. View Screenshots
```bash
view devtools/screenshots/ai-tests/
```

### 5. If Failed, Debug
```json
{
  "command": "ui_navigate",
  "params": { "url": "/quotes" }
}
```

```json
{
  "command": "ui_screenshot",
  "params": { "name": "debug-quotes-page", "fullPage": true }
}
```

```json
{
  "command": "ui_get_dom",
  "params": { "name": "debug-quotes-dom" }
}
```

---

## 🚨 Important Notes

### Browser State
- Browser stays open between commands for performance
- Use `ui_close_browser` to clean up
- Browser auto-closes when command executor stops

### Timeouts
- Default timeout: 5 seconds for most actions
- Navigation timeout: 30 seconds
- Adjust with `timeout` parameter

### Screenshots
- Saved to: `devtools/screenshots/ai-tests/`
- Auto-captured on test failures
- Use descriptive names

### DOM Snapshots
- Saved to: `devtools/dom-snapshots/`
- Full HTML of page
- Useful for debugging

---

## 💡 Pro Tips

### 1. Always Login First
Most pages require authentication. Run `ui_login` before other tests.

### 2. Use Predefined Scenarios
Start with `ui_run_test` before writing custom scenarios.

### 3. Capture Screenshots
Take screenshots before and after actions to see what changed.

### 4. Check Element Visibility
Use `ui_check_element` to verify modals opened, forms appeared, etc.

### 5. Wait for Elements
Use `ui_wait_for` before interacting with dynamic content.

---

## 🎉 You Can Now Test Like a Human!

No more guessing if the frontend works. You can:
- ✅ See what users see
- ✅ Click what users click
- ✅ Verify what users verify
- ✅ Catch bugs that backend tests miss

**This is REAL frontend testing!** 🚀

