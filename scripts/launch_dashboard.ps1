# TradeMate Pro Dashboard Launcher (PowerShell)
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  🔨 TradeMate Pro Dashboard 🔨" -ForegroundColor Green  
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Quick checks
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "✅ Starting TradeMate Pro Dashboard..." -ForegroundColor Green
Write-Host "🌐 Browser will open at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⏹️  Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Wait a moment then open browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

# Start React server
npm start

Read-Host "Press Enter to exit"
