# 🚀 AI DevTools - Quick Reference Card

## 📋 Most Common Commands

### Test OnHold Modal
```json
{
  "commands": [
    {
      "id": "cmd_onhold_test",
      "command": "ui_run_test",
      "params": { "scenario": "onHoldModal" },
      "timestamp": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

### Login
```json
{
  "commands": [
    {
      "id": "cmd_login",
      "command": "ui_login",
      "params": {},
      "timestamp": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

### Navigate and Screenshot
```json
{
  "commands": [
    {
      "id": "cmd_nav",
      "command": "ui_navigate",
      "params": { "url": "/quotes" },
      "timestamp": "2025-10-06T12:00:00.000Z"
    },
    {
      "id": "cmd_screenshot",
      "command": "ui_screenshot",
      "params": { "name": "quotes-page", "fullPage": true },
      "timestamp": "2025-10-06T12:00:01.000Z"
    }
  ]
}
```

### Check Element Exists
```json
{
  "commands": [
    {
      "id": "cmd_check",
      "command": "ui_check_element",
      "params": {
        "selector": "[role='dialog']",
        "shouldExist": true,
        "shouldBeVisible": true
      },
      "timestamp": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

### Get Database Row Count
```json
{
  "commands": [
    {
      "id": "cmd_count",
      "command": "get_row_count",
      "params": { "table": "work_orders" },
      "timestamp": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

### Analyze Errors
```json
{
  "commands": [
    {
      "id": "cmd_analyze",
      "command": "analyze_errors",
      "params": {},
      "timestamp": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

---

## 🎬 Predefined Scenarios

| Scenario | Description |
|----------|-------------|
| `quoteFlow` | Create new quote |
| `invoiceFlow` | View invoices |
| `customerFlow` | Create new customer |
| `jobStatusTransition` | Test status changes |
| `onHoldModal` | Test OnHold modal ⭐ |
| `dashboardLoad` | Load dashboard |
| `completePipeline` | Quote → invoice |
| `authFlow` | Login test |

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `devtools/ai_commands.json` | AI writes commands here |
| `devtools/ai_responses.json` | AI reads responses here |
| `devtools/screenshots/ai-tests/` | Screenshots saved here |
| `devtools/dom-snapshots/` | DOM snapshots saved here |
| `error_logs/latest.json` | Recent errors |
| `error_logs/ai_context.json` | AI-optimized context |
| `logs.md` | Human-readable logs |

---

## 🎮 All Commands (34 Total!)

### Backend (13)
1. `get_logs`
2. `get_context`
3. `analyze_errors`
4. `check_status`
5. `test_pipeline`
6. `get_file`
7. `list_files`
8. `execute_sql`
9. `get_schema`
10. `get_row_count`
11. `get_recent_records`
12. `capture_screenshot`
13. `get_dom`

### Frontend (14)
1. `ui_navigate`
2. `ui_click`
3. `ui_type`
4. `ui_fill`
5. `ui_select`
6. `ui_check_element`
7. `ui_get_text`
8. `ui_wait_for`
9. `ui_screenshot`
10. `ui_get_dom`
11. `ui_run_scenario`
12. `ui_run_test`
13. `ui_login`
14. `ui_close_browser`

### Monitored (7) 🧠 NEW!
1. `ui_click_monitored` - Click with reasoning
2. `ui_fill_monitored` - Fill with reasoning
3. `ui_navigate_monitored` - Navigate with reasoning
4. `ui_select_monitored` - Select with reasoning
5. `ui_get_action_history` - Get recent actions
6. `ui_get_failed_actions` - Get failed actions
7. `ui_generate_report` - Generate analysis report

---

## 🚀 Startup

```bash
START_AI_UI_TESTING.bat
```

---

## 📚 Documentation

- **UI Guide:** `AIDevTools/UI_INTERACTION_GUIDE.md`
- **Full README:** `AIDevTools/README.md`
- **Implementation:** `AIDevTools/UI_INTERACTION_IMPLEMENTATION_COMPLETE.md`

---

## 💡 Quick Tips

1. **Always login first** for authenticated pages
2. **Use predefined scenarios** before custom ones
3. **Capture screenshots** for visual verification
4. **Check responses** in `ai_responses.json`
5. **View screenshots** in `devtools/screenshots/ai-tests/`

---

## 🎯 Typical Workflow

1. Write command to `devtools/ai_commands.json`
2. Wait 1-2 seconds for execution
3. Read response from `devtools/ai_responses.json`
4. View screenshots if needed
5. Repeat or fix issues

---

## 🔍 Debugging

### Check if servers are running
```json
{ "command": "check_status", "params": {} }
```

### Get recent errors
```json
{ "command": "get_logs", "params": {} }
```

### Capture current page
```json
{ "command": "ui_screenshot", "params": { "name": "debug" } }
```

### Get DOM state
```json
{ "command": "ui_get_dom", "params": { "name": "debug-dom" } }
```

---

## ⚡ Power User Tips

### Run multiple commands at once
```json
{
  "commands": [
    { "id": "1", "command": "ui_login", "params": {}, "timestamp": "..." },
    { "id": "2", "command": "ui_navigate", "params": { "url": "/quotes" }, "timestamp": "..." },
    { "id": "3", "command": "ui_screenshot", "params": { "name": "quotes" }, "timestamp": "..." }
  ]
}
```

### Custom scenario
```json
{
  "command": "ui_run_scenario",
  "params": {
    "scenario": "My Custom Test",
    "steps": [
      { "action": "navigate", "params": { "url": "/quotes" } },
      { "action": "click", "params": { "selector": "button:has-text('New Quote')" } },
      { "action": "screenshot", "params": { "name": "form" } }
    ]
  }
}
```

### Monitored click (with reasoning) 🧠
```json
{
  "command": "ui_click_monitored",
  "params": {
    "selector": "#saveButton",
    "expectations": {
      "shouldShowModal": true,
      "shouldChangeDom": true
    }
  }
}
```

### Get action history
```json
{
  "command": "ui_get_action_history",
  "params": { "limit": 10 }
}
```

### Get failed actions
```json
{
  "command": "ui_get_failed_actions",
  "params": {}
}
```

### Generate report
```json
{
  "command": "ui_generate_report",
  "params": {}
}
```

---

## 🧠 Part 2: Monitored Actions

**Use these when you need reasoning about outcomes!**

### Why Use Monitored Commands?
- ✅ Know if action actually worked
- ✅ Get reasoning about failures
- ✅ Receive fix suggestions
- ✅ Analyze patterns

### When to Use
- Critical actions (save, submit, delete)
- Actions that should trigger modals
- Actions that should navigate
- Debugging failing tests

---

**Keep this card handy for quick reference!** 📌

