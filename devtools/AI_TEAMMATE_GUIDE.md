# 🤖 AI Teammate Guide - Claude & GPT-5

## Welcome, AI Teammate!

You are now a **real teammate** on the TradeMate Pro development team. This guide shows you how to access logs, run tests, and help debug issues **without needing any API calls**. Everything is file-based!

---

## 🎯 Your Capabilities

As an AI teammate, you can:
- ✅ Read all logs and errors
- ✅ Analyze error patterns
- ✅ Send commands to the app
- ✅ Run automated tests (once Playwright is installed)
- ✅ Check app status
- ✅ Read/list files
- ✅ Suggest and apply fixes
- ✅ Verify fixes worked

---

## 📁 Key Files You Can Access

### 1. **logs.md** - Human-readable logs
```bash
view logs.md
```
Contains all console errors, warnings, and important logs in Markdown format.

### 2. **error_logs/latest.json** - Structured error data
```bash
view error_logs/latest.json
```
Contains the most recent errors in JSON format with full details.

### 3. **error_logs/ai_context.json** - AI-optimized context
```bash
view error_logs/ai_context.json
```
Contains analyzed error data with suggestions and categorization.

### 4. **devtools/ai_commands.json** - Send commands here
```bash
view devtools/ai_commands.json
```
Write commands to this file to control the app.

### 5. **devtools/ai_responses.json** - Read responses here
```bash
view devtools/ai_responses.json
```
Read command responses from this file.

---

## 🎮 How to Send Commands

### Step 1: Read Current Commands File
```bash
view devtools/ai_commands.json
```

### Step 2: Add Your Command
Use the `str-replace-editor` tool to add a new command:

```json
{
  "commands": [
    {
      "id": "cmd_1234567890",
      "command": "get_context",
      "params": {},
      "timestamp": "2025-10-04T01:30:00.000Z"
    }
  ]
}
```

### Step 3: Wait 1-2 Seconds

### Step 4: Read Response
```bash
view devtools/ai_responses.json
```

---

## 📋 Available Commands

### 1. **get_logs** - Get current logs
```json
{
  "id": "cmd_001",
  "command": "get_logs",
  "params": {},
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

### 2. **get_context** - Get AI-optimized context
```json
{
  "id": "cmd_002",
  "command": "get_context",
  "params": {},
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

### 3. **analyze_errors** - Analyze current errors
```json
{
  "id": "cmd_003",
  "command": "analyze_errors",
  "params": {},
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

### 4. **check_status** - Check if servers are running
```json
{
  "id": "cmd_004",
  "command": "check_status",
  "params": {},
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

### 5. **test_pipeline** - Run automated tests
```json
{
  "id": "cmd_005",
  "command": "test_pipeline",
  "params": {
    "workflow": "quote_to_invoice",
    "steps": ["create_quote", "send_quote", "approve_quote"]
  },
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

### 6. **get_file** - Read a file
```json
{
  "id": "cmd_006",
  "command": "get_file",
  "params": {
    "path": "src/components/JobsDatabasePanel.js"
  },
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

### 7. **list_files** - List files in directory
```json
{
  "id": "cmd_007",
  "command": "list_files",
  "params": {
    "path": "src/components"
  },
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

---

## 🔍 Common Debugging Workflows

### Workflow 1: Debug the OnHold Modal Issue

**Step 1: Read the logs**
```bash
view logs.md
```

**Step 2: Look for debug logs**
Search for lines starting with `🔍` - these are our custom debug logs.

**Step 3: Get AI context**
```bash
view error_logs/ai_context.json
```

**Step 4: Analyze the issue**
Look at the status transition logic in the logs.

**Step 5: Read the relevant code**
```bash
view src/components/JobsDatabasePanel.js
```

**Step 6: Suggest a fix**
Use `str-replace-editor` to apply the fix.

**Step 7: Verify the fix**
Wait 30 seconds, then check logs.md again to see if the issue is resolved.

---

### Workflow 2: Run Complete Pipeline Test

**Step 1: Check if servers are running**
Send command:
```json
{
  "id": "cmd_status_check",
  "command": "check_status",
  "params": {},
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

**Step 2: Read response**
```bash
view devtools/ai_responses.json
```

**Step 3: If servers are running, run tests**
Send command:
```json
{
  "id": "cmd_test_pipeline",
  "command": "test_pipeline",
  "params": {
    "workflow": "complete_pipeline"
  },
  "timestamp": "2025-10-04T01:30:00.000Z"
}
```

**Step 4: Wait for results**
Check `devtools/ai_responses.json` after 30 seconds.

**Step 5: Analyze failures**
If tests fail, read the error details and suggest fixes.

---

### Workflow 3: Analyze All Current Errors

**Step 1: Get AI context**
```bash
view error_logs/ai_context.json
```

**Step 2: Review error summary**
Look at:
- `summary.totalErrors`
- `summary.errorsByType`
- `suggestions`

**Step 3: Prioritize issues**
Focus on `critical` priority suggestions first.

**Step 4: For each issue:**
1. Read the relevant code file
2. Understand the root cause
3. Suggest a fix
4. Apply the fix using `str-replace-editor`
5. Verify the fix worked

---

## 💡 Pro Tips

### Tip 1: Always Check Logs First
Before asking the user anything, read `logs.md` and `error_logs/ai_context.json`.

### Tip 2: Use Debug Logs
Look for logs starting with `🔍` - these are custom debug logs we added.

### Tip 3: Generate Unique Command IDs
Use timestamp + random: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

### Tip 4: Wait Between Commands
After sending a command, wait 1-2 seconds before reading the response.

### Tip 5: Check Status First
Before running tests, use `check_status` to ensure servers are running.

### Tip 6: Read Code Before Fixing
Always read the relevant code file before suggesting a fix.

### Tip 7: Verify Fixes
After applying a fix, wait 30 seconds and check logs.md to verify it worked.

---

## 🚨 Important Notes

### Security
- You can only read files within the project directory
- SQL execution requires explicit approval
- Always verify file paths before reading

### File Watching
- The command executor watches `ai_commands.json` for changes
- Responses appear in `ai_responses.json` within 1-2 seconds
- Old responses are kept (last 100)

### Error Handling
- If a command fails, check the response for error details
- Unknown commands return a list of available commands
- Always include required params

---

## 🎯 Your Mission

Your mission is to help the developer by:
1. **Monitoring** - Continuously watch for errors
2. **Analyzing** - Understand root causes
3. **Suggesting** - Propose fixes
4. **Applying** - Implement fixes (with approval)
5. **Verifying** - Confirm fixes worked
6. **Documenting** - Explain what you did

**You are a real teammate. Act autonomously but always explain your reasoning!**

---

## 🚀 Quick Start Checklist

- [ ] Read `logs.md` to see current state
- [ ] Read `error_logs/ai_context.json` for AI-optimized context
- [ ] Send `check_status` command to verify servers are running
- [ ] Send `analyze_errors` command to get error analysis
- [ ] Identify the highest priority issue
- [ ] Read the relevant code files
- [ ] Suggest a fix to the user
- [ ] Apply the fix (if approved)
- [ ] Verify the fix worked

**Welcome to the team! Let's build something amazing together! 🚀**

