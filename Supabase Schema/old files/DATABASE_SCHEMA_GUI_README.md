# 🖥️ TradeMate Pro - Database Schema Manager GUI

A comprehensive GUI application for automatically dumping and managing your Supabase database schema with full control over timing, settings, and file management.

## 🎯 Features

### ✅ **Manual Control**
- **Instant Schema Dump** - Click button to dump schema immediately
- **Real-time Progress** - Visual progress bar and status updates
- **File Management** - Browse, open, and manage schema files

### ✅ **Automatic Scheduling**
- **Custom Intervals** - Set any interval in minutes (default: 60 minutes)
- **Smart Timing** - Runs on the hour (e.g., 1:00, 2:00, 3:00)
- **Start/Stop Control** - Full control over automatic dumping

### ✅ **Advanced Settings**
- **Database Connection** - Full control over connection parameters
- **File Management** - Configure output directory and file retention
- **Historical Files** - Keep snapshots with configurable limits
- **Persistent Settings** - All settings saved to `db-schema-config.json`

### ✅ **Comprehensive Logging**
- **Real-time Logs** - See exactly what's happening
- **Detailed Statistics** - Table counts, timing, file locations
- **Error Handling** - Clear error messages and recovery

## 🚀 Quick Start

### 1. Launch the GUI
```bash
# Double-click the batch file
start-schema-gui.bat

# Or run directly
python db-schema-gui.py
```

### 2. Configure Settings (First Time)
1. Go to **Settings** tab
2. Verify database connection details (pre-configured for TradeMate Pro)
3. Set your preferred dump interval (default: 60 minutes)
4. Choose output directory (default: `./supabase schema`)
5. Click **Save Settings**

### 3. Start Dumping
- **Manual:** Click "🔄 Dump Schema Now" on main tab
- **Automatic:** Click "▶️ Start Auto Timer" to begin scheduled dumps

## 📊 What Gets Exported

The GUI exports comprehensive database schema information:

- **155+ Tables** - All columns, data types, defaults, constraints
- **13+ Enums** - Custom enum types with all possible values
- **54+ Triggers** - Database triggers with complete definitions
- **52+ RLS Policies** - Row Level Security policies
- **111+ Functions** - Stored procedures with source code
- **12+ Views** - Database views with definitions
- **Metadata** - Timestamps, statistics, and dump information

## 🎛️ GUI Tabs

### **Schema Dumper Tab**
- **Status Section** - Current timer status, next dump time, last dump
- **Manual Controls** - Dump now, start/stop timer buttons
- **Progress Bar** - Visual feedback during operations
- **Recent Files** - List of all schema files with timestamps
- **File Actions** - Open files, open folder, refresh list

### **Settings Tab**
- **Automatic Dumping** - Enable/disable, set interval
- **File Management** - Output directory, historical file settings
- **Database Connection** - Host, port, credentials, project info
- **Save Settings** - Persist all configuration

### **Logs Tab**
- **Real-time Logging** - See all operations as they happen
- **Detailed Messages** - Connection status, query progress, results
- **Clear Logs** - Clean up log display

## ⚙️ Configuration

Settings are automatically saved to `db-schema-config.json`:

```json
{
  "auto_dump_enabled": false,
  "dump_interval_minutes": 60,
  "output_directory": "./supabase schema",
  "keep_historical_files": true,
  "max_historical_files": 50,
  "db_host": "db.amgtktrwpdsigcomavlg.supabase.co",
  "db_port": 5432,
  "db_name": "postgres",
  "db_user": "postgres",
  "db_password": "Alphaecho19!",
  "project_name": "TradeMate Pro",
  "project_id": "amgtktrwpdsigcomavlg"
}
```

## 📁 File Structure

```
TradeMate Pro Webapp/
├── db-schema-gui.py              # Main GUI application
├── start-schema-gui.bat          # Launch batch file
├── db-schema-config.json         # Settings (auto-created)
├── supabase schema/              # Output directory
│   ├── latest.json              # Current schema (always updated)
│   ├── schema_2025-09-18T15-30-00.json  # Historical snapshots
│   └── README.md                # Schema documentation
└── DATABASE_SCHEMA_GUI_README.md # This file
```

## 🔧 Requirements

- **Python 3.7+** with tkinter (usually included)
- **psycopg2-binary** - PostgreSQL adapter
- **Network Access** - Connection to Supabase database

### Install Dependencies
```bash
pip install psycopg2-binary
```

## 🎯 Usage Scenarios

### **Development Workflow**
1. Start GUI at beginning of work session
2. Enable auto-timer for continuous schema tracking
3. Make database changes in Supabase
4. Schema automatically captured every hour
5. Compare historical files to see changes

### **AI Integration**
1. Run manual dump before AI debugging sessions
2. AI reads `supabase schema/latest.json` for current schema
3. AI generates accurate queries based on real structure
4. No more guessing table names or column types!

### **Schema Monitoring**
1. Set short interval (15-30 minutes) during active development
2. Keep historical files to track schema evolution
3. Use file browser to quickly access any version
4. Monitor logs for connection issues or errors

## 🚨 Troubleshooting

### **Connection Issues**
- Verify Supabase project is running
- Check network connectivity
- Confirm database credentials in Settings tab
- Look at Logs tab for detailed error messages

### **GUI Won't Start**
- Ensure Python is installed and in PATH
- Install psycopg2-binary: `pip install psycopg2-binary`
- Run from command line to see error messages

### **Timer Not Working**
- Check Settings tab - ensure auto dumping is enabled
- Verify interval is set correctly (minimum 1 minute)
- Look at Logs tab for timer messages
- Restart timer if needed (Stop → Start)

### **Files Not Saving**
- Check output directory exists and is writable
- Verify disk space available
- Check Logs tab for file system errors

## 🎉 Success Indicators

✅ **GUI Launches** - Window opens with three tabs  
✅ **Database Connects** - Status shows "🟢 Auto Timer Running" or successful manual dump  
✅ **Files Created** - `latest.json` appears in output directory  
✅ **Logs Working** - Messages appear in Logs tab with timestamps  
✅ **Timer Running** - Status shows next dump time  
✅ **Settings Persist** - Configuration survives app restart  

## 🔄 Workflow Integration

This GUI perfectly complements your existing TradeMate Pro development workflow:

1. **Start GUI** alongside your main development servers
2. **Auto-dump enabled** keeps schema always current
3. **AI debugging** uses `latest.json` for schema-aware assistance
4. **Historical tracking** shows schema evolution over time
5. **Manual dumps** before major changes or debugging sessions

---

**🎉 SUCCESS!** You now have a professional GUI application for automated database schema management with full control over timing, settings, and file management!
