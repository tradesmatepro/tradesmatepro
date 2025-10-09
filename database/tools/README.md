# Database Tools

Automated tools for maintaining database consistency and preventing enum case issues.

---

## 🔧 Available Tools

### 1. **check-enum-consistency.ps1** (Recommended)
**PowerShell script for comprehensive enum consistency checking**

**Features:**
- ✅ Checks all enum types in database
- ✅ Detects mixed case enum values (UPPERCASE, lowercase, MixedCase)
- ✅ Finds duplicate enum values (case-insensitive)
- ✅ Analyzes actual data in work_orders table
- ✅ Scans frontend code for uppercase status values
- ✅ Generates detailed report with recommendations
- ✅ Color-coded status output

**Usage:**
```powershell
# Right-click and select "Run with PowerShell"
# OR from PowerShell terminal:
.\database\tools\check-enum-consistency.ps1
```

**Output:**
- Console summary with color-coded status
- Detailed report saved to `database/reports/enum-check-YYYYMMDD-HHMMSS.txt`
- Automatically opens report in Notepad

**Status Codes:**
- 🟢 **CLEAN** - All enums, data, and code are lowercase
- 🟡 **DATA ISSUE** - Enum is clean but data has uppercase values
- 🟡 **CODE ISSUE** - Database is clean but code has uppercase values
- 🔴 **INCONSISTENT** - Enum has uppercase values

---

### 2. **check-enum-consistency.bat**
**Batch file version for Windows Command Prompt**

**Features:**
- ✅ Checks enum types and values
- ✅ Detects mixed case issues
- ✅ Analyzes work_orders data
- ✅ Generates report

**Usage:**
```cmd
# Double-click the file
# OR from Command Prompt:
database\tools\check-enum-consistency.bat
```

**Note:** PowerShell version is recommended for better features and code scanning.

---

### 3. **fix-uppercase-data.ps1**
**Automated fix for uppercase status values in data**

**Features:**
- ✅ Detects uppercase status values in work_orders
- ✅ Shows preview of changes before applying
- ✅ Requires confirmation before making changes
- ✅ Updates all uppercase values to lowercase
- ✅ Verifies fix after completion
- ✅ Safe - only updates data, doesn't touch enum

**Usage:**
```powershell
# Right-click and select "Run with PowerShell"
# OR from PowerShell terminal:
.\database\tools\fix-uppercase-data.ps1
```

**What it fixes:**
```
DRAFT       → draft
SCHEDULED   → scheduled
IN_PROGRESS → in_progress
COMPLETED   → completed
SENT        → sent
ACCEPTED    → approved
REJECTED    → rejected
CANCELLED   → cancelled
INVOICED    → invoiced
PAID        → paid
CLOSED      → closed
```

---

## 📋 Recommended Workflow

### Daily/Weekly Checks
```powershell
# 1. Run consistency check
.\database\tools\check-enum-consistency.ps1

# 2. If issues found, review the report

# 3. If data issues, run auto-fix
.\database\tools\fix-uppercase-data.ps1

# 4. If enum issues, run migration
psql -f database\migrations\cleanup_status_enum.sql
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "INCONSISTENT - Enum has uppercase values"
**Cause:** Database enum type has both uppercase and lowercase values

**Solution:**
```powershell
# Run the enum cleanup migration
$env:PGPASSWORD='Alphaecho19!'
psql -h aws-1-us-west-1.pooler.supabase.com -p 5432 -d postgres -U postgres.cxlqzejzraczumqmsrcx -f database\migrations\cleanup_status_enum.sql
```

---

### Issue 2: "DATA ISSUE - Data has uppercase values"
**Cause:** Enum is clean but work_orders table has uppercase status values

**Solution:**
```powershell
# Run the auto-fix script
.\database\tools\fix-uppercase-data.ps1
```

---

### Issue 3: "CODE ISSUE - Code has uppercase values"
**Cause:** Frontend code is using uppercase status values like 'SCHEDULED', 'IN_PROGRESS'

**Solution:**
1. Review the report to see which files have issues
2. Update the files to use lowercase values:
   - `'SCHEDULED'` → `'scheduled'`
   - `'IN_PROGRESS'` → `'in_progress'`
   - `'COMPLETED'` → `'completed'`
   - `'ACCEPTED'` → `'approved'`
   - etc.

---

## 📊 Report Structure

The consistency check generates a detailed report with:

1. **Enum Types List** - All enum types in database
2. **Case Analysis** - Each enum value with its case type
3. **Duplicate Detection** - Case-insensitive duplicate check
4. **Data Analysis** - Actual status values in work_orders
5. **Uppercase Data** - Records with uppercase status
6. **Code Scan** - Frontend files with uppercase status values
7. **Summary** - Overall status and recommendations

---

## 🔒 Safety Features

### check-enum-consistency.ps1
- ✅ **Read-only** - Never modifies database
- ✅ **Safe to run anytime** - No side effects
- ✅ **Detailed logging** - All checks logged to report

### fix-uppercase-data.ps1
- ✅ **Preview before changes** - Shows what will be updated
- ✅ **Requires confirmation** - Must type 'Y' to proceed
- ✅ **Verification** - Checks results after update
- ✅ **Rollback-friendly** - Only updates data, not schema

---

## 🎯 Best Practices

1. **Run checks regularly** - Weekly or after major changes
2. **Review reports** - Don't just look at status, read the details
3. **Fix issues promptly** - Don't let inconsistencies accumulate
4. **Keep reports** - Useful for tracking changes over time
5. **Test after fixes** - Always verify the application works after fixes

---

## 📁 File Locations

```
database/
├── tools/
│   ├── README.md                      ← This file
│   ├── check-enum-consistency.ps1     ← PowerShell checker (recommended)
│   ├── check-enum-consistency.bat     ← Batch checker
│   └── fix-uppercase-data.ps1         ← Auto-fix script
├── reports/
│   └── enum-check-*.txt               ← Generated reports
└── migrations/
    └── cleanup_status_enum.sql        ← Enum cleanup migration
```

---

## 🆘 Troubleshooting

### "psql: command not found"
**Solution:** Install PostgreSQL client tools or use full path to psql.exe

### "Permission denied"
**Solution:** Right-click script → Properties → Unblock

### "Execution policy" error (PowerShell)
**Solution:**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force
```

### "Connection refused"
**Solution:** Check database credentials in script, verify network connection

---

## 📞 Support

If you encounter issues:
1. Check the generated report for details
2. Review the troubleshooting section
3. Check database connection with manual psql command
4. Verify credentials are correct

---

## 🔄 Version History

**v1.0** (2025-10-02)
- Initial release
- PowerShell and Batch versions
- Auto-fix script
- Code scanning feature
- Comprehensive reporting

---

**Happy Database Maintaining! 🚀**

