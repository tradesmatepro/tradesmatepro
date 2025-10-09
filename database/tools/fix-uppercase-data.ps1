# ========================================
# AUTO-FIX UPPERCASE DATA
# ========================================
# Purpose: Automatically fix uppercase status values in work_orders data
# Usage: Right-click and "Run with PowerShell"
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AUTO-FIX UPPERCASE DATA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database credentials
$env:PGPASSWORD = "Alphaecho19!"
$PGHOST = "aws-1-us-west-1.pooler.supabase.com"
$PGPORT = "5432"
$PGDATABASE = "postgres"
$PGUSER = "postgres.cxlqzejzraczumqmsrcx"

# Check current state
Write-Host "Checking current state..." -ForegroundColor Yellow
$uppercaseCount = (& psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -t -c "SELECT COUNT(*) FROM work_orders WHERE status::text != LOWER(status::text);" 2>&1).Trim()

if ([int]$uppercaseCount -eq 0) {
    Write-Host ""
    Write-Host "No uppercase status values found in data!" -ForegroundColor Green
    Write-Host "Database is already clean." -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

Write-Host ""
Write-Host "Found $uppercaseCount records with UPPERCASE status values." -ForegroundColor Red
Write-Host ""

# Show what will be changed
Write-Host "Current uppercase values:" -ForegroundColor Yellow
& psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -P pager=off -c "SELECT status, COUNT(*) as count FROM work_orders WHERE status::text != LOWER(status::text) GROUP BY status ORDER BY count DESC;"

Write-Host ""
Write-Host "These will be converted to lowercase:" -ForegroundColor Yellow
Write-Host "  DRAFT -> draft" -ForegroundColor Gray
Write-Host "  SCHEDULED -> scheduled" -ForegroundColor Gray
Write-Host "  IN_PROGRESS -> in_progress" -ForegroundColor Gray
Write-Host "  COMPLETED -> completed" -ForegroundColor Gray
Write-Host "  SENT -> sent" -ForegroundColor Gray
Write-Host "  ACCEPTED -> approved" -ForegroundColor Gray
Write-Host "  REJECTED -> rejected" -ForegroundColor Gray
Write-Host "  CANCELLED -> cancelled" -ForegroundColor Gray
Write-Host "  INVOICED -> invoiced" -ForegroundColor Gray
Write-Host ""

# Confirm
Write-Host "Do you want to proceed with the fix? (Y/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -ne "Y" -and $response -ne "y") {
    Write-Host ""
    Write-Host "Operation cancelled." -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

Write-Host ""
Write-Host "Applying fixes..." -ForegroundColor Yellow
Write-Host ""

# Apply fixes
$fixes = @(
    "UPDATE work_orders SET status = 'draft' WHERE status::text = 'DRAFT';",
    "UPDATE work_orders SET status = 'sent' WHERE status::text IN ('QUOTE', 'SENT');",
    "UPDATE work_orders SET status = 'approved' WHERE status::text = 'ACCEPTED';",
    "UPDATE work_orders SET status = 'rejected' WHERE status::text = 'REJECTED';",
    "UPDATE work_orders SET status = 'scheduled' WHERE status::text = 'SCHEDULED';",
    "UPDATE work_orders SET status = 'in_progress' WHERE status::text = 'IN_PROGRESS';",
    "UPDATE work_orders SET status = 'completed' WHERE status::text = 'COMPLETED';",
    "UPDATE work_orders SET status = 'cancelled' WHERE status::text = 'CANCELLED';",
    "UPDATE work_orders SET status = 'invoiced' WHERE status::text = 'INVOICED';",
    "UPDATE work_orders SET status = 'paid' WHERE status::text = 'PAID';",
    "UPDATE work_orders SET status = 'closed' WHERE status::text = 'CLOSED';"
)

$totalUpdated = 0

foreach ($fix in $fixes) {
    $result = & psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -t -c $fix 2>&1
    if ($result -match "UPDATE (\d+)") {
        $count = [int]$matches[1]
        if ($count -gt 0) {
            $totalUpdated += $count
            Write-Host "  Updated $count records" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total records updated: $totalUpdated" -ForegroundColor Green
Write-Host ""

# Verify
Write-Host "Verifying fix..." -ForegroundColor Yellow
$remainingUppercase = (& psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -t -c "SELECT COUNT(*) FROM work_orders WHERE status::text != LOWER(status::text);" 2>&1).Trim()

if ([int]$remainingUppercase -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! All status values are now lowercase." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "WARNING: $remainingUppercase uppercase values still remain." -ForegroundColor Red
    Write-Host "These may be values not covered by the fix script." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Remaining uppercase values:" -ForegroundColor Yellow
    & psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -P pager=off -c "SELECT status, COUNT(*) as count FROM work_orders WHERE status::text != LOWER(status::text) GROUP BY status ORDER BY count DESC;"
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

