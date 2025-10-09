# 🚀 TradeMate Pro SQL Automation System

**Full automation system that gives Claude/GPT direct SQL execution capabilities for hands-free debugging and schema fixes.**

⚠️ **EXTREMELY DANGEROUS** - Only use in development/beta environments with proper backups!

## 🎯 What This Enables

- **Claude detects errors** → **Generates SQL fixes** → **Executes automatically** → **Verifies results**
- **Real-time schema fixes** without manual intervention
- **Automated table creation** for missing dependencies
- **Live error resolution** while you work
- **Full backup safety net** with automatic rollback capability

## 📋 Setup Instructions

### 1. Create the Supabase RPC Function (CRITICAL)

**Copy and paste this into Supabase SQL Editor:**

```sql
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json AS $$
DECLARE
  result json;
  rec record;
  query_type text;
  row_count integer := 0;
  result_array json[] := '{}';
BEGIN
  query_type := upper(trim(split_part(query, ' ', 1)));
  
  IF query_type IN ('SELECT', 'WITH') THEN
    FOR rec IN EXECUTE query LOOP
      result_array := result_array || to_json(rec);
      row_count := row_count + 1;
    END LOOP;
    result := json_build_object('type', 'SELECT', 'data', result_array, 'row_count', row_count, 'success', true);
  ELSIF query_type IN ('INSERT', 'UPDATE', 'DELETE') THEN
    EXECUTE query;
    GET DIAGNOSTICS row_count = ROW_COUNT;
    result := json_build_object('type', query_type, 'rows_affected', row_count, 'success', true);
  ELSE
    EXECUTE query;
    result := json_build_object('type', query_type, 'success', true, 'message', 'Query executed successfully');
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM, 'error_code', SQLSTATE);
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
```

### 2. Start the SQL Automation Server

```bash
# Install dependencies and start server
start_sql_server.bat
```

**Server will be available at:** `http://localhost:4000`

### 3. Setup Automated Backups (Recommended)

```bash
# Run as Administrator to setup Task Scheduler
setup_auto_backup.bat
```

**This creates automatic backups every 2 hours.**

## 🔧 Available Endpoints

### **POST /dev/sql/exec**
Execute single SQL statement
```json
{
  "sql": "CREATE TABLE test (id UUID PRIMARY KEY);",
  "description": "Creating test table"
}
```

### **POST /dev/sql/batch**
Execute multiple SQL statements
```json
{
  "queries": [
    "CREATE TABLE users (id UUID PRIMARY KEY);",
    "INSERT INTO users (id) VALUES (gen_random_uuid());"
  ],
  "description": "Batch table creation"
}
```

### **GET /dev/schema/tables**
Get current database schema

### **GET /dev/test-connection**
Test database connectivity

### **GET /health**
Server health check

## 🤖 How Claude Uses This

### **Error Detection Flow:**
1. **Monitor logs** via console-error-capture.js
2. **Identify HTTP 400/404 errors** from missing tables/columns
3. **Generate SQL fixes** based on error analysis
4. **Execute via /dev/sql/exec** endpoint
5. **Verify fixes** by re-testing the failing functionality

### **Example Automation:**
```javascript
// Claude detects: "customer_communications table doesn't exist"
const fix = await fetch('http://localhost:4000/dev/sql/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `CREATE TABLE customer_communications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID REFERENCES customers(id),
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    description: "Fix missing customer_communications table"
  })
});
```

## 🛡️ Safety Features

### **Automated Backups**
- **Every 2 hours** via Windows Task Scheduler
- **Timestamped files** (`auto_backup_YYYYMMDD_HHMM.dump`)
- **Automatic cleanup** (keeps 48 hours worth)
- **Log file tracking** all backup operations

### **Error Handling**
- **Detailed error messages** with SQL state codes
- **Query type detection** (SELECT, INSERT, CREATE, etc.)
- **Rollback capabilities** via backup restoration
- **Connection monitoring** and health checks

### **Security Measures**
- **Development only** - never use in production
- **Service role authentication** required
- **CORS restrictions** to localhost only
- **Request logging** for audit trail

## 📁 File Structure

```
TradeMate Pro Webapp/
├── devSqlExec.js                    # Main SQL execution server
├── package-sql-server.json         # Node.js dependencies
├── start_sql_server.bat            # Server launcher
├── auto_backup_scheduler.bat       # Automated backup script
├── setup_auto_backup.bat          # Task Scheduler setup
├── sql files/
│   ├── create_exec_sql_function.sql # RPC function creation
│   └── fix_missing_sales_tables.sql # Table fixes
└── SQL_AUTOMATION_README.md        # This file
```

## 🚨 Security Warnings

### **⚠️ NEVER USE IN PRODUCTION**
- This system can execute **ANY SQL** including `DROP DATABASE`
- Only use in development/beta environments
- Always have recent backups before making changes
- Monitor all SQL execution via logs

### **🔒 Access Control**
- Server only accepts connections from localhost
- Requires Supabase service role key
- All queries are logged with timestamps
- Failed queries return detailed error information

## 🧪 Testing the System

### **1. Test Database Connection**
```bash
curl -X GET http://localhost:4000/dev/test-connection
```

### **2. Test SQL Execution**
```bash
curl -X POST http://localhost:4000/dev/sql/exec \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT NOW() as current_time;"}'
```

### **3. Test Schema Inspection**
```bash
curl -X GET http://localhost:4000/dev/schema/tables
```

## 🔄 Backup & Recovery

### **Manual Backup**
```bash
# From db backups folder
backup_now.bat
```

### **Restore from Backup**
```bash
# From db backups folder
launch_backup_manager.bat
# Then use "Restore Backup" button in GUI
```

### **Automated Backup Status**
Check log file: `C:\Users\CGREL\Desktop\SupabaseBackups\auto_backup.log`

## 🎉 Success Indicators

When everything is working correctly:

✅ **SQL Server**: `http://localhost:4000/health` returns healthy status  
✅ **RPC Function**: `/dev/test-connection` succeeds  
✅ **Automated Backups**: Log file shows successful backups every 2 hours  
✅ **Claude Integration**: HTTP 400 errors get automatically fixed  

## 🆘 Troubleshooting

### **"exec_sql function not found"**
- Run the SQL function creation script in Supabase SQL Editor
- Check function permissions with `GRANT EXECUTE` statements

### **"Connection refused"**
- Ensure SQL server is running: `start_sql_server.bat`
- Check port 4000 is not blocked by firewall
- Verify Supabase credentials in devSqlExec.js

### **"Backup failed"**
- Install PostgreSQL tools (pg_dump, pg_restore)
- Check database connection string
- Verify backup directory permissions

---

**🚀 With this system, Claude can now automatically detect and fix database issues in real-time!**
