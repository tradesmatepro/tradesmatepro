# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

# Set PGPASSWORD for psql
$env:PGPASSWORD = $env:SUPABASE_DB_PASSWORD

# Run the migration
Write-Host "Deploying tax ID encryption migration..." -ForegroundColor Yellow

psql -h $env:SUPABASE_DB_HOST -p $env:SUPABASE_DB_PORT -U $env:SUPABASE_DB_USER -d $env:SUPABASE_DB_NAME -f "database/migrations/add_tax_id_encryption.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}

