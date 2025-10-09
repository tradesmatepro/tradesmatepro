# =========================================
# TRADEMATE PRO - DATABASE BACKUP SCRIPT
# =========================================
# Date: 2025-10-01
# Purpose: Backup database before migration
# =========================================

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_before_migration_$timestamp.sql"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "TRADEMATE PRO - DATABASE BACKUP" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backing up database..." -ForegroundColor Yellow
Write-Host "Backup file: $backupFile" -ForegroundColor Yellow
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = 'Alphaecho19!'

# Run pg_dump
pg_dump -h aws-1-us-west-1.pooler.supabase.com `
        -p 5432 `
        -U postgres.cxlqzejzraczumqmsrcx `
        -d postgres `
        --no-owner `
        --no-acl `
        -f $backupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "✅ BACKUP SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backup saved to: $backupFile" -ForegroundColor Green
    
    # Get file size
    $fileSize = (Get-Item $backupFile).Length / 1MB
    Write-Host "File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host "❌ BACKUP FAILED!" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Please check your database connection and try again." -ForegroundColor Red
    Write-Host ""
    exit 1
}

