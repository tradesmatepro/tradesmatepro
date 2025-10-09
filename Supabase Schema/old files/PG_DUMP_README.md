# TradeMate Pro Schema Dumper (pg_dump Edition)

This folder contains automated tools for dumping your complete database schema using the official PostgreSQL `pg_dump` utility.

## 🚀 Quick Start

### Option 1: One-Time Setup + Dump
**Double-click: `setup-pgpass-and-dump.bat`**
- Sets up passwordless authentication
- Finds your PostgreSQL installation
- Runs the schema dump
- Creates both timestamped and latest files

### Option 2: Regular Dumps (after setup)
**Double-click: `pg-dump-schema.bat`**
- Quick schema dump (assumes pgpass.conf is already set up)
- Creates timestamped files
- Opens output folder when done

### Option 3: Scheduled/Silent Dumps
**Use: `daily-schema-dump.bat`**
- Silent operation (no popups)
- Logs to dump_log.txt
- Cleans up old files automatically
- Perfect for Windows Task Scheduler

## 📋 Prerequisites

### Install PostgreSQL Client Tools
1. Download from: https://www.postgresql.org/download/windows/
2. During installation, make sure to include "Command Line Tools"
3. Default installation path: `C:\Program Files\PostgreSQL\[version]\bin\`

### Alternative: Portable pg_dump
If you don't want the full PostgreSQL installation:
1. Download just the client tools from EDB
2. Extract to a folder
3. Update the batch files with your custom path

## 🔧 Configuration

### Database Connection
All scripts use these connection details:
- **Host:** `aws-0-us-east-1.pooler.supabase.com`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres.cxlqzejzraczumqmsrcx`
- **Password:** `Alphaecho19!`

### pgpass.conf Location
The password file is automatically created at:
`%APPDATA%\postgresql\pgpass.conf`

Format: `host:port:database:username:password`

## 📁 Output Files

### File Types Generated:
- `full_schema_YYYY-MM-DD_HH-MM-SS.sql` - Timestamped dumps
- `full_schema_latest.sql` - Always the most recent dump
- `daily_schema_YYYY-MM-DD_HH-MM-SS.sql` - Daily scheduled dumps
- `dump_log.txt` - Log file for scheduled operations

### What's Included:
- ✅ All table structures
- ✅ All custom types (enums)
- ✅ All indexes
- ✅ All constraints (PK, FK, CHECK, UNIQUE)
- ✅ All functions and procedures
- ✅ All triggers
- ✅ All views and materialized views
- ✅ All RLS policies
- ✅ All extensions
- ❌ No data (schema only)
- ❌ No ownership info (--no-owner)
- ❌ No privilege grants (--no-privileges)

## ⏰ Setting Up Scheduled Dumps

### Using Windows Task Scheduler:

1. **Open Task Scheduler**
   - Press `Win + R`, type `taskschd.msc`

2. **Create Basic Task**
   - Name: "TradeMate Schema Dump"
   - Description: "Daily database schema backup"

3. **Set Trigger**
   - Daily at 2:00 AM (or your preferred time)

4. **Set Action**
   - Program: `daily-schema-dump.bat`
   - Start in: `[path to your Supabase Schema folder]`

5. **Configure Settings**
   - ✅ Run whether user is logged on or not
   - ✅ Run with highest privileges
   - ✅ Configure for Windows 10/11

### Manual Schedule Setup:
```batch
schtasks /create /tn "TradeMate Schema Dump" /tr "C:\path\to\daily-schema-dump.bat" /sc daily /st 02:00
```

## 🛠️ Troubleshooting

### "pg_dump not found"
- Install PostgreSQL client tools
- Or update batch files with correct path to pg_dump.exe

### "Connection refused" or "timeout"
- Check internet connection
- Verify Supabase database is accessible
- Test with: `telnet aws-0-us-east-1.pooler.supabase.com 5432`

### "Authentication failed"
- Verify credentials in pgpass.conf
- Check if password has changed
- Re-run `setup-pgpass-and-dump.bat`

### Permission errors
- Run as Administrator
- Check folder write permissions
- Ensure %APPDATA% is accessible

## 📊 Comparison with Other Tools

| Tool | Format | Size | Speed | Completeness |
|------|--------|------|-------|--------------|
| pg_dump | SQL | ~200KB | Fast | 100% |
| Node.js dumper | JSON | ~50KB | Medium | 95% |
| Python GUI | JSON | ~50KB | Medium | 95% |

**Recommendation:** Use pg_dump for production backups, JSON tools for development analysis.

## 🔄 Integration with Existing Tools

These pg_dump tools work alongside your existing schema tools:
- **db-dumper.js** - JSON format with metadata
- **db-schema-gui.py** - Interactive browser
- **pg_dump tools** - Standard SQL format

Use them together for comprehensive schema management!

## 📝 Log Analysis

Check `dump_log.txt` for:
- Successful dump timestamps
- Error messages and codes
- File cleanup operations

Example log entry:
```
2025-09-20 14:30:01 - Starting daily schema dump
2025-09-20 14:30:15 - SUCCESS: Schema dumped to daily_schema_2025-09-20_14-30-01.sql
```

## 🎯 Next Steps

1. Run `setup-pgpass-and-dump.bat` once
2. Use `pg-dump-schema.bat` for manual dumps
3. Set up `daily-schema-dump.bat` in Task Scheduler
4. Monitor `dump_log.txt` for any issues

Happy schema dumping! 🚀
