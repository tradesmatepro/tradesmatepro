# Supabase Database Backup Manager

Automated backup and restore system for your Supabase database with GUI interface.

## Features

- **GUI Interface**: Easy-to-use Tkinter interface
- **One-Click Backup**: Instant database backups with timestamps
- **One-Click Restore**: Select and restore from any backup file
- **Automated Scheduling**: Daily, weekly, or hourly automatic backups
- **Backup Management**: List and manage existing backup files
- **Security**: Masked password display, secure configuration storage

## Quick Start

### 1. Launch the GUI Application (Recommended)
```bash
launch_backup_manager.bat
```
*Double-click this file to automatically install dependencies and open the GUI*

### 2. Or Run Python Directly
```bash
pip install -r requirements.txt
python backup_manager.py
```

### 3. Or Use Quick Backup (No GUI)
```bash
backup_now.bat
```
*Creates an immediate backup without opening the interface*

## Configuration

The app uses `config.json` for settings:

```json
{
  "db_uri": "postgresql://postgres:Alphaecho19!@db.amgtktrwpdsigcomavlg.supabase.co:5432/postgres",
  "backup_dir": "C:/Users/CGREL/Desktop/SupabaseBackups",
  "schedule": "daily"
}
```

## Prerequisites

- **Python 3.7+** with tkinter
- **PostgreSQL Tools** (pg_dump, pg_restore) installed and in PATH
- **Network access** to your Supabase database

## File Structure

```
db backups/
├── backup_manager.py           # Main GUI application
├── launch_backup_manager.bat   # GUI launcher (double-click to start)
├── backup_now.bat             # Quick backup without GUI
├── config.json               # Configuration file
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## Usage

### GUI Application

**Launch**: Double-click `launch_backup_manager.bat`

1. **Run Backup Now**: Creates an immediate backup with timestamp
2. **Restore Backup**: Select a backup file to restore (⚠️ overwrites current database)
3. **List Backups**: Shows all available backup files with sizes and dates
4. **Configuration**: Set backup directory, schedule, and database URI

### Batch Scripts

- **`launch_backup_manager.bat`**: Opens the GUI application (auto-installs dependencies)
- **`backup_now.bat`**: Quick backup without opening the GUI

## Backup Files

Backups are saved as:
- **Format**: Custom PostgreSQL dump format (.dump)
- **Naming**: `supabase_backup_YYYYMMDD_HHMM.dump`
- **Location**: Configurable backup directory

## Security Notes

- Database URI with password is stored in `config.json`
- Password is masked in the GUI display
- Keep `config.json` secure and don't commit to version control

## Troubleshooting

### "pg_dump not found"
- Install PostgreSQL tools or add to PATH
- On Windows: Download from postgresql.org

### "Connection failed"
- Check database URI in config.json
- Verify network connectivity to Supabase
- Confirm database credentials

### "Permission denied"
- Check backup directory write permissions
- Run as administrator if needed

## Automation

The GUI app runs a background scheduler that automatically creates backups based on your schedule setting:

- **Daily**: Every day at midnight
- **Weekly**: Every Sunday at midnight  
- **Hourly**: Every hour on the hour

## Support

For issues or questions, check the Status Log in the GUI application for detailed error messages.
