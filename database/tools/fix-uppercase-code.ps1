# ========================================
# AUTO-FIX UPPERCASE STATUS IN CODE
# ========================================
# Purpose: Automatically fix uppercase status values in frontend code
# Usage: Right-click and "Run with PowerShell"
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AUTO-FIX UPPERCASE STATUS IN CODE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Status mapping (uppercase -> lowercase)
$statusMap = @{
    'DRAFT' = 'draft'
    'SENT' = 'sent'
    'PRESENTED' = 'presented'
    'CHANGES_REQUESTED' = 'changes_requested'
    'FOLLOW_UP' = 'follow_up'
    'APPROVED' = 'approved'
    'ACCEPTED' = 'approved'  # Map old ACCEPTED to new approved
    'REJECTED' = 'rejected'
    'EXPIRED' = 'expired'
    'SCHEDULED' = 'scheduled'
    'IN_PROGRESS' = 'in_progress'
    'COMPLETED' = 'completed'
    'ON_HOLD' = 'on_hold'
    'INVOICED' = 'invoiced'
    'PAID' = 'paid'
    'CLOSED' = 'closed'
    'CANCELLED' = 'cancelled'
}

# Scan for files with uppercase status values
Write-Host "Scanning for files with uppercase status values..." -ForegroundColor Yellow
Write-Host ""

$filesToFix = @{}
$totalMatches = 0

foreach ($uppercase in $statusMap.Keys) {
    $lowercase = $statusMap[$uppercase]
    
    # Search for patterns like: status='UPPERCASE', status="UPPERCASE", status: 'UPPERCASE', etc.
    $patterns = @(
        "status\s*[=:]\s*['""]$uppercase['""]",
        "status\s*[=:]\s*`"$uppercase`"",
        "\bstatus\b.*['""]$uppercase['""]",
        "\.status\s*===?\s*['""]$uppercase['""]",
        "status\s*!==?\s*['""]$uppercase['""]"
    )
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path "src" -Recurse -Include "*.js","*.jsx","*.ts","*.tsx" -ErrorAction SilentlyContinue |
                 Where-Object { (Get-Content $_.FullName -Raw) -match $pattern }
        
        foreach ($file in $files) {
            if (-not $filesToFix.ContainsKey($file.FullName)) {
                $filesToFix[$file.FullName] = @()
            }
            $filesToFix[$file.FullName] += @{
                'uppercase' = $uppercase
                'lowercase' = $lowercase
            }
            $totalMatches++
        }
    }
}

if ($filesToFix.Count -eq 0) {
    Write-Host "No uppercase status values found in code!" -ForegroundColor Green
    Write-Host "Code is already clean." -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

Write-Host "Found uppercase status values in $($filesToFix.Count) files ($totalMatches potential matches)" -ForegroundColor Red
Write-Host ""

# Show files that will be modified
Write-Host "Files to be modified:" -ForegroundColor Yellow
$filesToFix.Keys | ForEach-Object {
    $relativePath = $_.Replace((Get-Location).Path + "\", "")
    Write-Host "  - $relativePath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Replacements that will be made:" -ForegroundColor Yellow
foreach ($key in $statusMap.Keys | Sort-Object) {
    Write-Host "  $key -> $($statusMap[$key])" -ForegroundColor Gray
}

Write-Host ""
Write-Host "WARNING: This will modify your source files!" -ForegroundColor Red
Write-Host "Make sure you have committed your changes or have a backup." -ForegroundColor Red
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

$filesModified = 0
$replacementsMade = 0

foreach ($filePath in $filesToFix.Keys) {
    $relativePath = $filePath.Replace((Get-Location).Path + "\", "")
    Write-Host "Processing: $relativePath" -ForegroundColor Gray
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    # Apply all replacements for this file
    foreach ($uppercase in $statusMap.Keys) {
        $lowercase = $statusMap[$uppercase]
        
        # Replace various patterns
        # Pattern 1: status='UPPERCASE' or status="UPPERCASE"
        $pattern1 = "status\s*=\s*['""]$uppercase['""]"
        $replacement1 = "status = '$lowercase'"
        if ($content -match $pattern1) {
            $content = $content -replace $pattern1, $replacement1
            $fileReplacements++
        }
        
        # Pattern 2: status: 'UPPERCASE' or status: "UPPERCASE"
        $pattern2 = "status\s*:\s*['""]$uppercase['""]"
        $replacement2 = "status: '$lowercase'"
        if ($content -match $pattern2) {
            $content = $content -replace $pattern2, $replacement2
            $fileReplacements++
        }
        
        # Pattern 3: .status === 'UPPERCASE' or .status == 'UPPERCASE'
        $pattern3 = "\.status\s*===?\s*['""]$uppercase['""]"
        $replacement3 = ".status === '$lowercase'"
        if ($content -match $pattern3) {
            $content = $content -replace $pattern3, $replacement3
            $fileReplacements++
        }
        
        # Pattern 4: .status !== 'UPPERCASE' or .status != 'UPPERCASE'
        $pattern4 = "\.status\s*!==?\s*['""]$uppercase['""]"
        $replacement4 = ".status !== '$lowercase'"
        if ($content -match $pattern4) {
            $content = $content -replace $pattern4, $replacement4
            $fileReplacements++
        }
        
        # Pattern 5: status=eq.UPPERCASE (PostgREST query)
        $pattern5 = "status=eq\.$uppercase"
        $replacement5 = "status=eq.$lowercase"
        if ($content -match $pattern5) {
            $content = $content -replace $pattern5, $replacement5
            $fileReplacements++
        }
        
        # Pattern 6: status=in.(UPPERCASE,...) (PostgREST query)
        $pattern6 = "([,\(])$uppercase([,\)])"
        $replacement6 = "`$1$lowercase`$2"
        if ($content -match "status=in\..*$uppercase") {
            $content = $content -replace $pattern6, $replacement6
            $fileReplacements++
        }
    }
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -NoNewline
        $filesModified++
        $replacementsMade += $fileReplacements
        Write-Host "  [OK] Modified ($fileReplacements replacements)" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] No changes needed" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files modified: $filesModified" -ForegroundColor Green
Write-Host "Replacements made: $replacementsMade" -ForegroundColor Green
Write-Host ""

# Run checker again to verify
Write-Host "Running consistency check to verify..." -ForegroundColor Yellow
Write-Host ""

$uppercasePatterns = @('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'INVOICED', 'CANCELLED')
$remainingIssues = @()

foreach ($pattern in $uppercasePatterns) {
    $files = Get-ChildItem -Path "src" -Recurse -Include "*.js","*.jsx","*.ts","*.tsx" -ErrorAction SilentlyContinue | 
             Select-String -Pattern "status.*=.*['""]$pattern['""]" -SimpleMatch:$false |
             Select-Object -ExpandProperty Path -Unique
    
    if ($files) {
        $remainingIssues += "Found '$pattern' in: $($files.Count) files"
    }
}

if ($remainingIssues.Count -eq 0) {
    Write-Host "SUCCESS! All uppercase status values have been fixed." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "WARNING: Some uppercase values may still remain:" -ForegroundColor Yellow
    $remainingIssues | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""
    Write-Host "These may be in comments, strings, or complex patterns." -ForegroundColor Gray
    Write-Host "Review manually if needed." -ForegroundColor Gray
    Write-Host ""
}

Write-Host "NEXT STEPS:" -ForegroundColor White
Write-Host "1. Test your application to ensure everything works" -ForegroundColor Gray
Write-Host "2. Run: .\database\tools\check-enum-consistency.ps1" -ForegroundColor Gray
Write-Host "3. Commit your changes if everything looks good" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

