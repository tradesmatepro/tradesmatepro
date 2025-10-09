# 📊 TradeMate Pro - Automated Schema Dumps

This folder contains automated exports of the TradeMate Pro Supabase database schema.

## 🔄 How It Works

The `db-dumper.js` script automatically connects to your Supabase database every hour and exports:

- **Tables & Columns** - All table structures with data types
- **Enums** - Custom enum types and their values  
- **Triggers** - Database triggers and their definitions
- **RLS Policies** - Row Level Security policies
- **Functions** - Stored procedures and functions
- **Views** - Database views and their definitions

## 📁 Files

- **`latest.json`** - Always contains the most recent schema dump (overwritten each time)
- **`schema_TIMESTAMP.json`** - Historical snapshots for comparison

## 🚀 Usage

### Start the Dumper
```bash
# Option 1: Use the batch file
start-db-dumper.bat

# Option 2: Use npm script
npm run dev-db-dumper

# Option 3: Run directly
node db-dumper.js
```

### Schedule
- **Automatic:** Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
- **Manual:** Runs immediately when started

## 🔑 Connection Details

- **Project:** TradesMatePro (cxlqzejzraczumqmsrcx)
- **Host:** db.cxlqzejzraczumqmsrcx.supabase.co
- **Database:** postgres
- **SSL:** Enabled with self-signed certificates

## 📊 Current Schema Stats

Based on latest dump:
- **155 Tables** - Complete database structure
- **13 Enums** - Custom data types
- **54 Triggers** - Automated database actions
- **52 RLS Policies** - Security policies
- **111 Functions** - Stored procedures
- **12 Views** - Computed data views

## 🎯 AI Integration

This automated schema export enables AI assistants (Claude, GPT) to:

1. **Instant Schema Awareness** - Read `latest.json` for current database structure
2. **Schema-Aware Debugging** - Understand table relationships and constraints
3. **Accurate Query Generation** - Write correct SQL based on actual schema
4. **Migration Planning** - Compare historical snapshots to track changes

## 🔧 Troubleshooting

### Connection Issues
- Verify Supabase project is running
- Check network connectivity
- Confirm database credentials

### Missing Data
- Ensure proper permissions for schema queries
- Check PostgreSQL version compatibility
- Verify RLS policies don't block system queries

### File Permissions
- Ensure write access to `supabase schema/` folder
- Check disk space for historical snapshots

## 📝 Notes

- Schema dumps are read-only operations - no data is modified
- Historical files accumulate over time - clean up old snapshots as needed
- The dumper runs continuously - use Ctrl+C to stop
- All timestamps are in ISO format (UTC)

---

**🎉 Success!** Your database schema is now automatically documented and AI-accessible!
