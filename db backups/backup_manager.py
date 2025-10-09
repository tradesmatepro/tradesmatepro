#!/usr/bin/env python3
"""
Supabase Database Backup Manager
Automated backup and restore system with GUI
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import json
import os
import subprocess
import threading
import schedule
import time
from datetime import datetime
import sys

class BackupManager:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Supabase Backup Manager")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        # Load configuration
        self.config_file = "config.json"
        self.load_config()
        
        # Setup GUI
        self.setup_gui()
        
        # Start scheduler thread
        self.scheduler_running = True
        self.scheduler_thread = threading.Thread(target=self.run_scheduler, daemon=True)
        self.scheduler_thread.start()
        
    def load_config(self):
        """Load configuration from config.json"""
        default_config = {
            "db_uri": "postgresql://postgres:Alphaecho19!@db.cxlqzejzraczumqmsrcx.supabase.co:5432/postgres",
            "backup_dir": "C:/Users/CGREL/Desktop/SupabaseBackups",
            "schedule": "daily"
        }
        
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
            else:
                self.config = default_config
                self.save_config()
        except Exception as e:
            self.config = default_config
            self.log_message(f"Error loading config: {e}")
            
        # Ensure backup directory exists
        os.makedirs(self.config["backup_dir"], exist_ok=True)
    
    def save_config(self):
        """Save configuration to config.json"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            self.log_message(f"Error saving config: {e}")
    
    def setup_gui(self):
        """Setup the main GUI interface"""
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="Supabase Database Backup Manager", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # Configuration Section
        config_frame = ttk.LabelFrame(main_frame, text="Configuration", padding="10")
        config_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        config_frame.columnconfigure(1, weight=1)
        
        # Database URI
        ttk.Label(config_frame, text="Database URI:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.db_uri_var = tk.StringVar(value=self.mask_password(self.config["db_uri"]))
        self.db_uri_entry = ttk.Entry(config_frame, textvariable=self.db_uri_var, width=60, show="*")
        self.db_uri_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=(10, 0), pady=2)
        
        # Backup Directory
        ttk.Label(config_frame, text="Backup Directory:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.backup_dir_var = tk.StringVar(value=self.config["backup_dir"])
        self.backup_dir_entry = ttk.Entry(config_frame, textvariable=self.backup_dir_var, width=50)
        self.backup_dir_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), padx=(10, 0), pady=2)
        
        ttk.Button(config_frame, text="Browse", 
                  command=self.browse_backup_dir).grid(row=1, column=2, padx=(5, 0), pady=2)
        
        # Schedule
        ttk.Label(config_frame, text="Auto Backup:").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.schedule_var = tk.StringVar(value=self.config["schedule"])
        schedule_combo = ttk.Combobox(config_frame, textvariable=self.schedule_var, 
                                     values=["hourly", "daily", "weekly"], state="readonly")
        schedule_combo.grid(row=2, column=1, sticky=tk.W, padx=(10, 0), pady=2)
        
        # Save Config Button
        ttk.Button(config_frame, text="Save Configuration", 
                  command=self.save_configuration).grid(row=3, column=1, sticky=tk.W, padx=(10, 0), pady=10)
        
        # Action Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=2, column=0, columnspan=3, pady=10)
        
        self.backup_btn = ttk.Button(button_frame, text="🔄 Run Backup Now", 
                                    command=self.run_backup_threaded, style="Accent.TButton")
        self.backup_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.restore_btn = ttk.Button(button_frame, text="📁 Restore Backup", 
                                     command=self.restore_backup)
        self.restore_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.list_btn = ttk.Button(button_frame, text="📋 List Backups", 
                                  command=self.list_backups)
        self.list_btn.pack(side=tk.LEFT)
        
        # Status Log
        log_frame = ttk.LabelFrame(main_frame, text="Status Log", padding="10")
        log_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=10)
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        main_frame.rowconfigure(3, weight=1)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=15, width=80)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Clear log button
        ttk.Button(log_frame, text="Clear Log", 
                  command=self.clear_log).grid(row=1, column=0, sticky=tk.E, pady=(5, 0))
        
        # Initial log message
        self.log_message("Backup Manager initialized successfully!")
        self.log_message(f"Backup directory: {self.config['backup_dir']}")
        self.log_message(f"Auto backup schedule: {self.config['schedule']}")
    
    def mask_password(self, uri):
        """Mask password in database URI for display"""
        if "@" in uri and ":" in uri:
            parts = uri.split("@")
            if len(parts) == 2:
                auth_part = parts[0]
                if ":" in auth_part:
                    user_pass = auth_part.split("://")[1]
                    if ":" in user_pass:
                        user, password = user_pass.split(":", 1)
                        masked = auth_part.replace(password, "*" * len(password))
                        return masked + "@" + parts[1]
        return uri
    
    def browse_backup_dir(self):
        """Browse for backup directory"""
        directory = filedialog.askdirectory(initialdir=self.backup_dir_var.get())
        if directory:
            self.backup_dir_var.set(directory)
    
    def save_configuration(self):
        """Save current configuration"""
        # Get the actual URI (unmask if needed)
        db_uri = self.config["db_uri"]  # Keep original URI
        
        self.config["backup_dir"] = self.backup_dir_var.get()
        self.config["schedule"] = self.schedule_var.get()
        
        # Ensure backup directory exists
        os.makedirs(self.config["backup_dir"], exist_ok=True)
        
        self.save_config()
        self.log_message("Configuration saved successfully!")
        
        # Restart scheduler with new schedule
        self.setup_scheduler()
    
    def log_message(self, message):
        """Add message to log with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        self.log_text.insert(tk.END, log_entry)
        self.log_text.see(tk.END)
        self.root.update_idletasks()
    
    def clear_log(self):
        """Clear the log text"""
        self.log_text.delete(1.0, tk.END)
    
    def run_backup_threaded(self):
        """Run backup in separate thread to prevent GUI freezing"""
        self.backup_btn.config(state="disabled", text="🔄 Backing up...")
        thread = threading.Thread(target=self.run_backup_with_ui_update, daemon=True)
        thread.start()
    
    def run_backup_with_ui_update(self):
        """Run backup and update UI"""
        try:
            self.run_backup()
        finally:
            self.root.after(0, lambda: self.backup_btn.config(state="normal", text="🔄 Run Backup Now"))
    
    def run_backup(self):
        """Execute database backup"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M")
            backup_filename = f"supabase_backup_{timestamp}.dump"
            backup_path = os.path.join(self.config["backup_dir"], backup_filename)
            
            self.log_message(f"Starting backup: {backup_filename}")
            
            # pg_dump command
            cmd = [
                "pg_dump",
                "--no-owner",
                "--no-privileges", 
                "--format=custom",
                f"--file={backup_path}",
                self.config["db_uri"]
            ]
            
            # Execute backup
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                file_size = os.path.getsize(backup_path) / (1024 * 1024)  # MB
                self.log_message(f"✅ Backup completed successfully!")
                self.log_message(f"   File: {backup_filename}")
                self.log_message(f"   Size: {file_size:.2f} MB")
            else:
                self.log_message(f"❌ Backup failed!")
                self.log_message(f"   Error: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            self.log_message("❌ Backup timed out after 5 minutes")
        except FileNotFoundError:
            self.log_message("❌ pg_dump not found. Please install PostgreSQL tools.")
        except Exception as e:
            self.log_message(f"❌ Backup error: {str(e)}")
    
    def restore_backup(self):
        """Restore from backup file"""
        backup_file = filedialog.askopenfilename(
            title="Select Backup File",
            initialdir=self.config["backup_dir"],
            filetypes=[("Dump files", "*.dump"), ("All files", "*.*")]
        )
        
        if not backup_file:
            return
            
        # Confirmation dialog
        if not messagebox.askyesno("Confirm Restore", 
                                  f"This will restore the database from:\n{os.path.basename(backup_file)}\n\n"
                                  "⚠️ WARNING: This will overwrite the current database!\n\n"
                                  "Are you sure you want to continue?"):
            return
        
        self.restore_btn.config(state="disabled", text="📁 Restoring...")
        thread = threading.Thread(target=self.run_restore, args=(backup_file,), daemon=True)
        thread.start()
    
    def run_restore(self, backup_file):
        """Execute database restore"""
        try:
            self.log_message(f"Starting restore from: {os.path.basename(backup_file)}")
            
            # pg_restore command
            cmd = [
                "pg_restore",
                "--clean",
                "--no-owner",
                "--no-privileges",
                f"--dbname={self.config['db_uri']}",
                backup_file
            ]
            
            # Execute restore
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            
            if result.returncode == 0:
                self.log_message("✅ Restore completed successfully!")
            else:
                self.log_message(f"❌ Restore failed!")
                self.log_message(f"   Error: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            self.log_message("❌ Restore timed out after 10 minutes")
        except FileNotFoundError:
            self.log_message("❌ pg_restore not found. Please install PostgreSQL tools.")
        except Exception as e:
            self.log_message(f"❌ Restore error: {str(e)}")
        finally:
            self.root.after(0, lambda: self.restore_btn.config(state="normal", text="📁 Restore Backup"))
    
    def list_backups(self):
        """List available backup files"""
        try:
            backup_files = []
            for file in os.listdir(self.config["backup_dir"]):
                if file.endswith(".dump"):
                    file_path = os.path.join(self.config["backup_dir"], file)
                    file_size = os.path.getsize(file_path) / (1024 * 1024)  # MB
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    backup_files.append((file, file_size, file_time))
            
            if backup_files:
                self.log_message("📋 Available backups:")
                backup_files.sort(key=lambda x: x[2], reverse=True)  # Sort by date, newest first
                for file, size, time in backup_files:
                    self.log_message(f"   {file} ({size:.2f} MB) - {time.strftime('%Y-%m-%d %H:%M:%S')}")
            else:
                self.log_message("📋 No backup files found")
                
        except Exception as e:
            self.log_message(f"❌ Error listing backups: {str(e)}")
    
    def setup_scheduler(self):
        """Setup automatic backup scheduler"""
        schedule.clear()
        
        if self.config["schedule"] == "hourly":
            schedule.every().hour.do(self.run_backup)
            self.log_message("📅 Scheduled hourly backups")
        elif self.config["schedule"] == "daily":
            schedule.every().day.at("00:00").do(self.run_backup)
            self.log_message("📅 Scheduled daily backups at midnight")
        elif self.config["schedule"] == "weekly":
            schedule.every().sunday.at("00:00").do(self.run_backup)
            self.log_message("📅 Scheduled weekly backups on Sunday at midnight")
    
    def run_scheduler(self):
        """Run the backup scheduler"""
        self.setup_scheduler()
        while self.scheduler_running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def run(self):
        """Start the GUI application"""
        try:
            self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
            self.root.mainloop()
        except KeyboardInterrupt:
            self.on_closing()
    
    def on_closing(self):
        """Handle application closing"""
        self.scheduler_running = False
        self.root.destroy()

if __name__ == "__main__":
    app = BackupManager()
    app.run()
