# ========================================
# ENUM CONSISTENCY CHECKER (PowerShell)
# ========================================
# Purpose: Automatically check database for uppercase/lowercase enum inconsistencies
# Usage: Right-click and "Run with PowerShell" or run from PowerShell terminal
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ENUM CONSISTENCY CHECKER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checking database for enum inconsistencies..." -ForegroundColor Yellow
Write-Host ""

# Database credentials
$env:PGPASSWORD = "Alphaecho19!"
$PGHOST = "aws-1-us-west-1.pooler.supabase.com"
$PGPORT = "5432"
$PGDATABASE = "postgres"
$PGUSER = "postgres.cxlqzejzraczumqmsrcx"

# Create reports directory
$reportsDir = "database\reports"
if (-not (Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

# Generate report filename
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = "$reportsDir\enum-check-$timestamp.txt"

Write-Host "Report will be saved to: $reportFile" -ForegroundColor Gray
Write-Host ""

# Start report
@"
========================================
  ENUM CONSISTENCY CHECK REPORT
  Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
========================================

"@ | Out-File -FilePath $reportFile -Encoding UTF8

# ========================================
# CHECK 1: List all enum types
# ========================================
Write-Host "[1/7] Checking enum types..." -ForegroundColor Yellow
"[1/7] Checking enum types...`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

$result = & psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -P pager=off -c "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;" 2>&1
$result | Out-File -FilePath $reportFile -Append -Encoding UTF8
"`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

# ========================================
# CHECK 2: Check work_order_status_enum for mixed case
# ========================================
Write-Host "[2/7] Checking work_order_status_enum for mixed case..." -ForegroundColor Yellow
"[2/7] Checking work_order_status_enum for mixed case...`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

$result = & psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -P pager=off -c "SELECT enumlabel, CASE WHEN enumlabel = LOWER(enumlabel) THEN 'lowercase' WHEN enumlabel = UPPER(enumlabel) THEN 'UPPERCASE' ELSE 'MixedCase' END as case_type FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype ORDER BY enumsortorder;" 2>&1
$result | Out-File -FilePath $reportFile -Append -Encoding UTF8
"`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

# ========================================
# CHECK 3: Find duplicate enum values
# ========================================
Write-Host "[3/7] Checking for duplicate enum values..." -ForegroundColor Yellow
"[3/7] Checking for duplicate enum values (case-insensitive)...`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

$result = & psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -P pager=off -c "SELECT LOWER(enumlabel) as normalized_value, COUNT(*) as count, STRING_AGG(enumlabel, ', ') as variants FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype GROUP BY LOWER(enumlabel) HAVING COUNT(*) > 1 ORDER BY count DESC;" 2>&1
$result | Out-File -FilePath $reportFile -Append -Encoding UTF8
"`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

# ========================================
# CHECK 4: Check actual data in work_orders
# ========================================
Write-Host "[4/7] Checking status values in work_orders table..." -ForegroundColor Yellow
"[4/7] Checking actual status values in work_orders table...`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

$result = & psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -P pager=off -c "SELECT status, COUNT(*) as count, CASE WHEN status::text = LOWER(status::text) THEN 'lowercase' WHEN status::text = UPPER(status::text) THEN 'UPPERCASE' ELSE 'MixedCase' END as case_type FROM work_orders GROUP BY status ORDER BY count DESC;" 2>&1
$result | Out-File -FilePath $reportFile -Append -Encoding UTF8
"`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

# ========================================
# CHECK 5: Check for uppercase in data
# ========================================
Write-Host "[5/7] Checking for UPPERCASE status values in data..." -ForegroundColor Yellow
"[5/7] Checking for UPPERCASE status values in data...`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

$result = & psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -P pager=off -c "SELECT status, COUNT(*) as count FROM work_orders WHERE status::text != LOWER(status::text) GROUP BY status ORDER BY count DESC;" 2>&1
$result | Out-File -FilePath $reportFile -Append -Encoding UTF8
"`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

# ========================================
# CHECK 6: Check frontend code for uppercase
# ========================================
Write-Host "[6/7] Scanning frontend code for uppercase status values..." -ForegroundColor Yellow
"[6/7] Scanning frontend code for uppercase status values...`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

$uppercasePatterns = @('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'INVOICED', 'CANCELLED')
$foundIssues = @()

foreach ($pattern in $uppercasePatterns) {
    $files = Get-ChildItem -Path "src" -Recurse -Include "*.js","*.jsx","*.ts","*.tsx" | 
             Select-String -Pattern "status.*=.*['""]$pattern['""]" -SimpleMatch:$false |
             Select-Object -ExpandProperty Path -Unique
    
    if ($files) {
        $foundIssues += "Found '$pattern' in: $($files -join ', ')"
    }
}

if ($foundIssues.Count -gt 0) {
    "UPPERCASE status values found in code:`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8
    $foundIssues | ForEach-Object { "$_`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8 }
} else {
    "No uppercase status values found in code.`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8
}
"`n" | Out-File -FilePath $reportFile -Append -Encoding UTF8

# ========================================
# CHECK 7: Generate summary
# ========================================
Write-Host "[7/7] Generating summary..." -ForegroundColor Yellow

# ✅ FIXED: Convert to int properly by filtering only numeric output
$totalEnums = [int]((& psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -t -c "SELECT COUNT(*) FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$').Line.Trim())
$lowercaseEnums = [int]((& psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -t -c "SELECT COUNT(*) FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype AND enumlabel = LOWER(enumlabel);" 2>&1 | Select-String -Pattern '^\s*\d+\s*$').Line.Trim())
$uppercaseEnums = [int]((& psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -t -c "SELECT COUNT(*) FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype AND enumlabel = UPPER(enumlabel);" 2>&1 | Select-String -Pattern '^\s*\d+\s*$').Line.Trim())
$totalRecords = [int]((& psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -t -c "SELECT COUNT(*) FROM work_orders;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$').Line.Trim())
$uppercaseData = [int]((& psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -t -c "SELECT COUNT(*) FROM work_orders WHERE status::text != LOWER(status::text);" 2>&1 | Select-String -Pattern '^\s*\d+\s*$').Line.Trim())

@"
========================================
  SUMMARY
========================================

ENUM ANALYSIS:
  Total enum values: $totalEnums
  Lowercase enum values: $lowercaseEnums
  UPPERCASE enum values: $uppercaseEnums

DATA ANALYSIS:
  Total work_orders records: $totalRecords
  Records with UPPERCASE status: $uppercaseData

CODE ANALYSIS:
  Files with uppercase status: $($foundIssues.Count)

"@ | Out-File -FilePath $reportFile -Append -Encoding UTF8

# Determine status
$statusMsg = ""
$statusColor = "Green"
$recommendation = ""

if ($uppercaseEnums -gt 0) {
    $statusMsg = "INCONSISTENT - Enum has uppercase values"
    $statusColor = "Red"
    $recommendation = "Run: database\migrations\cleanup_status_enum.sql"
} elseif ($uppercaseData -gt 0) {
    $statusMsg = "DATA ISSUE - Enum is clean but data has uppercase values"
    $statusColor = "Yellow"
    $recommendation = "Run: database\tools\fix-uppercase-data.ps1"
} elseif ($foundIssues.Count -gt 0) {
    $statusMsg = "CODE ISSUE - Database is clean but code has uppercase values"
    $statusColor = "Yellow"
    $recommendation = "Review files listed above and update to lowercase"
} else {
    $statusMsg = "CLEAN - All enums, data, and code are lowercase"
    $statusColor = "Green"
    $recommendation = "No action needed"
}

@"
STATUS: $statusMsg
RECOMMENDATION: $recommendation

========================================
  END OF REPORT
========================================
"@ | Out-File -FilePath $reportFile -Append -Encoding UTF8

# Display results
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ENUM ANALYSIS:" -ForegroundColor White
Write-Host "  Total: $totalEnums | Lowercase: $lowercaseEnums | UPPERCASE: $uppercaseEnums" -ForegroundColor Gray
Write-Host ""
Write-Host "DATA ANALYSIS:" -ForegroundColor White
Write-Host "  Total records: $totalRecords | UPPERCASE: $uppercaseData" -ForegroundColor Gray
Write-Host ""
Write-Host "CODE ANALYSIS:" -ForegroundColor White
Write-Host "  Files with uppercase: $($foundIssues.Count)" -ForegroundColor Gray
Write-Host ""
Write-Host "STATUS: " -NoNewline
Write-Host $statusMsg -ForegroundColor $statusColor
Write-Host ""
Write-Host "RECOMMENDATION: " -NoNewline -ForegroundColor White
Write-Host $recommendation -ForegroundColor Yellow
Write-Host ""
Write-Host "Full report saved to:" -ForegroundColor White
Write-Host $reportFile -ForegroundColor Cyan
Write-Host ""

# Open report
Write-Host "Opening report..." -ForegroundColor Gray
Start-Process notepad $reportFile

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

