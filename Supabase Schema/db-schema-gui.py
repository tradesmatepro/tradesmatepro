import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import json
import os
import threading
import time
import socket
from datetime import datetime, timedelta
from tkinter import filedialog
import sys

# Import the database dumper functionality
import importlib.util
spec = importlib.util.spec_from_file_location("db_dumper", "db-dumper.js")

class DatabaseSchemaGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("TradeMate Pro - Database Schema Manager")
        self.root.geometry("800x600")
        self.root.configure(bg='#f0f0f0')
        
        # Configuration
        self.config_file = "db-schema-config.json"
        self.load_config()
        
        # Timer variables
        self.timer_thread = None
        self.timer_running = False
        self.next_dump_time = None
        
        # Create GUI
        self.create_widgets()
        self.update_status()
        
        # Start timer if enabled
        if self.config.get('auto_dump_enabled', False):
            self.start_timer()
    
    def load_config(self):
        """Load configuration from JSON file"""
        default_config = {
            'auto_dump_enabled': False,
            'dump_interval_minutes': 60,
            'output_directory': './supabase schema',
            'keep_historical_files': True,
            'max_historical_files': 50,
            'db_host': 'aws-0-us-east-1.pooler.supabase.com',
            'db_port': 5432,
            'db_name': 'postgres',
            'db_user': 'postgres',
            'db_password': 'Alphaecho19!',
            'project_name': 'TradeMate Pro',
            'project_id': 'amgtktrwpdsigcomavlg'
        }
        
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    self.config = {**default_config, **json.load(f)}
            else:
                self.config = default_config
                self.save_config()
        except Exception as e:
            self.config = default_config
            print(f"Error loading config: {e}")
    
    def save_config(self):
        """Save configuration to JSON file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")
    
    def create_widgets(self):
        """Create the GUI widgets"""
        # Main notebook for tabs
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Main tab
        main_frame = ttk.Frame(notebook)
        notebook.add(main_frame, text="Schema Dumper")
        
        # Settings tab
        settings_frame = ttk.Frame(notebook)
        notebook.add(settings_frame, text="Settings")
        
        # Logs tab
        logs_frame = ttk.Frame(notebook)
        notebook.add(logs_frame, text="Logs")

        # Schema Browser tab
        browser_frame = ttk.Frame(notebook)
        notebook.add(browser_frame, text="Schema Browser")
        
        self.create_main_tab(main_frame)
        self.create_settings_tab(settings_frame)
        self.create_logs_tab(logs_frame)
        self.create_browser_tab(browser_frame)
    
    def create_main_tab(self, parent):
        """Create the main control tab"""
        # Status section
        status_frame = ttk.LabelFrame(parent, text="Status", padding=10)
        status_frame.pack(fill='x', padx=10, pady=5)
        
        self.status_label = ttk.Label(status_frame, text="Ready", font=('Arial', 12, 'bold'))
        self.status_label.pack(anchor='w')
        
        self.timer_label = ttk.Label(status_frame, text="Timer: Stopped")
        self.timer_label.pack(anchor='w')
        
        self.last_dump_label = ttk.Label(status_frame, text="Last dump: Never")
        self.last_dump_label.pack(anchor='w')
        
        # Manual controls
        controls_frame = ttk.LabelFrame(parent, text="Manual Controls", padding=10)
        controls_frame.pack(fill='x', padx=10, pady=5)
        
        button_frame = ttk.Frame(controls_frame)
        button_frame.pack(fill='x')
        
        self.dump_button = ttk.Button(button_frame, text="🔄 Dump Schema Now", 
                                     command=self.manual_dump, style='Accent.TButton')
        self.dump_button.pack(side='left', padx=5)
        
        self.start_timer_button = ttk.Button(button_frame, text="▶️ Start Auto Timer", 
                                           command=self.start_timer)
        self.start_timer_button.pack(side='left', padx=5)
        
        self.stop_timer_button = ttk.Button(button_frame, text="⏹️ Stop Auto Timer", 
                                          command=self.stop_timer)
        self.stop_timer_button.pack(side='left', padx=5)
        
        # Progress bar
        self.progress = ttk.Progressbar(controls_frame, mode='indeterminate')
        self.progress.pack(fill='x', pady=5)
        
        # Recent files section
        files_frame = ttk.LabelFrame(parent, text="Recent Schema Files", padding=10)
        files_frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Files listbox with scrollbar
        files_list_frame = ttk.Frame(files_frame)
        files_list_frame.pack(fill='both', expand=True)
        
        self.files_listbox = tk.Listbox(files_list_frame)
        files_scrollbar = ttk.Scrollbar(files_list_frame, orient='vertical', command=self.files_listbox.yview)
        self.files_listbox.configure(yscrollcommand=files_scrollbar.set)
        
        self.files_listbox.pack(side='left', fill='both', expand=True)
        files_scrollbar.pack(side='right', fill='y')
        
        # File buttons
        file_buttons_frame = ttk.Frame(files_frame)
        file_buttons_frame.pack(fill='x', pady=5)
        
        ttk.Button(file_buttons_frame, text="📂 Open File", 
                  command=self.open_selected_file).pack(side='left', padx=5)
        ttk.Button(file_buttons_frame, text="📁 Open Folder", 
                  command=self.open_output_folder).pack(side='left', padx=5)
        ttk.Button(file_buttons_frame, text="🔄 Refresh List", 
                  command=self.refresh_files_list).pack(side='left', padx=5)
    
    def create_settings_tab(self, parent):
        """Create the settings tab"""
        # Auto dump settings
        auto_frame = ttk.LabelFrame(parent, text="Automatic Dumping", padding=10)
        auto_frame.pack(fill='x', padx=10, pady=5)
        
        self.auto_enabled_var = tk.BooleanVar(value=self.config.get('auto_dump_enabled', False))
        ttk.Checkbutton(auto_frame, text="Enable automatic schema dumping", 
                       variable=self.auto_enabled_var).pack(anchor='w')
        
        interval_frame = ttk.Frame(auto_frame)
        interval_frame.pack(fill='x', pady=5)
        ttk.Label(interval_frame, text="Dump interval (minutes):").pack(side='left')
        self.interval_var = tk.StringVar(value=str(self.config.get('dump_interval_minutes', 60)))
        ttk.Entry(interval_frame, textvariable=self.interval_var, width=10).pack(side='left', padx=5)
        
        # File settings
        file_frame = ttk.LabelFrame(parent, text="File Management", padding=10)
        file_frame.pack(fill='x', padx=10, pady=5)
        
        # Output directory
        dir_frame = ttk.Frame(file_frame)
        dir_frame.pack(fill='x', pady=2)
        ttk.Label(dir_frame, text="Output directory:").pack(side='left')
        self.output_dir_var = tk.StringVar(value=self.config.get('output_directory', './supabase schema'))
        ttk.Entry(dir_frame, textvariable=self.output_dir_var, width=40).pack(side='left', padx=5, fill='x', expand=True)
        ttk.Button(dir_frame, text="Browse", command=self.browse_output_dir).pack(side='right')
        
        # Historical files
        self.keep_historical_var = tk.BooleanVar(value=self.config.get('keep_historical_files', True))
        ttk.Checkbutton(file_frame, text="Keep historical schema files", 
                       variable=self.keep_historical_var).pack(anchor='w', pady=2)
        
        max_files_frame = ttk.Frame(file_frame)
        max_files_frame.pack(fill='x', pady=2)
        ttk.Label(max_files_frame, text="Max historical files:").pack(side='left')
        self.max_files_var = tk.StringVar(value=str(self.config.get('max_historical_files', 50)))
        ttk.Entry(max_files_frame, textvariable=self.max_files_var, width=10).pack(side='left', padx=5)
        
        # Database settings
        db_frame = ttk.LabelFrame(parent, text="Database Connection", padding=10)
        db_frame.pack(fill='x', padx=10, pady=5)
        
        # Connection fields
        project_id_default = self.config.get('project_id', 'amgtktrwpdsigcomavlg')
        default_user = f"postgres.{project_id_default}"
        fields = [
            ('Host:', 'db_host', 'aws-0-us-east-1.pooler.supabase.com'),
            ('Port:', 'db_port', '5432'),
            ('Database:', 'db_name', 'postgres'),
            ('User:', 'db_user', default_user),
            ('Password:', 'db_password', 'Alphaecho19!'),
            ('Project Name:', 'project_name', 'TradeMate Pro'),
            ('Project ID:', 'project_id', 'amgtktrwpdsigcomavlg')
        ]
        
        self.db_vars = {}
        for label, key, default in fields:
            frame = ttk.Frame(db_frame)
            frame.pack(fill='x', pady=2)
            ttk.Label(frame, text=label, width=15).pack(side='left')
            var = tk.StringVar(value=self.config.get(key, default))
            self.db_vars[key] = var
            if key == 'db_password':
                entry = ttk.Entry(frame, textvariable=var, show='*', width=30)
            else:
                entry = ttk.Entry(frame, textvariable=var, width=30)
            entry.pack(side='left', padx=5)
        
        # Save settings button
        ttk.Button(parent, text="💾 Save Settings", command=self.save_settings).pack(pady=10)
    
    def create_logs_tab(self, parent):
        """Create the logs tab"""
        self.log_text = scrolledtext.ScrolledText(parent, wrap=tk.WORD, height=20)
        self.log_text.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Clear logs button
        ttk.Button(parent, text="🗑️ Clear Logs", command=self.clear_logs).pack(pady=5)

    def log_message(self, message):
        """Add a message to the logs"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        self.log_text.insert(tk.END, log_entry)
        self.log_text.see(tk.END)
        print(message)  # Also print to console

    def clear_logs(self):
        """Clear the log text area"""
        self.log_text.delete(1.0, tk.END)

    def create_browser_tab(self, parent):
        """Create the schema browser tab"""
        # Create main paned window
        paned = ttk.PanedWindow(parent, orient='horizontal')
        paned.pack(fill='both', expand=True, padx=10, pady=10)

        # Left panel - Schema tree
        left_frame = ttk.Frame(paned)
        paned.add(left_frame, weight=1)

        ttk.Label(left_frame, text="Schema Browser", font=('Arial', 12, 'bold')).pack(pady=5)

        # Tree view for schema
        self.schema_tree = ttk.Treeview(left_frame, height=20)
        tree_scrollbar = ttk.Scrollbar(left_frame, orient='vertical', command=self.schema_tree.yview)
        self.schema_tree.configure(yscrollcommand=tree_scrollbar.set)

        self.schema_tree.pack(side='left', fill='both', expand=True)
        tree_scrollbar.pack(side='right', fill='y')

        # Right panel - Details
        right_frame = ttk.Frame(paned)
        paned.add(right_frame, weight=2)

        ttk.Label(right_frame, text="Details", font=('Arial', 12, 'bold')).pack(pady=5)

        self.details_text = scrolledtext.ScrolledText(right_frame, wrap=tk.WORD, height=20)
        self.details_text.pack(fill='both', expand=True)

        # Buttons
        button_frame = ttk.Frame(parent)
        button_frame.pack(fill='x', padx=10, pady=5)

        ttk.Button(button_frame, text="🔄 Load Schema", command=self.load_schema_browser).pack(side='left', padx=5)
        ttk.Button(button_frame, text="🔍 Show Enums", command=self.show_enum_summary).pack(side='left', padx=5)

        # Bind tree selection
        self.schema_tree.bind('<<TreeviewSelect>>', self.on_tree_select)

    def browse_output_dir(self):
        """Browse for output directory"""
        directory = filedialog.askdirectory(initialdir=self.output_dir_var.get())
        if directory:
            self.output_dir_var.set(directory)

    def save_settings(self):
        """Save current settings"""
        try:
            self.config['auto_dump_enabled'] = self.auto_enabled_var.get()
            self.config['dump_interval_minutes'] = int(self.interval_var.get())
            self.config['output_directory'] = self.output_dir_var.get()
            self.config['keep_historical_files'] = self.keep_historical_var.get()
            self.config['max_historical_files'] = int(self.max_files_var.get())

            for key, var in self.db_vars.items():
                self.config[key] = var.get()

            self.save_config()
            messagebox.showinfo("Settings", "Settings saved successfully!")
            self.log_message("Settings saved successfully")
        except ValueError as e:
            messagebox.showerror("Error", f"Invalid settings: {e}")

    def update_status(self):
        """Update status labels"""
        if self.timer_running:
            self.status_label.config(text="🟢 Auto Timer Running")
            if self.next_dump_time:
                next_time = self.next_dump_time.strftime("%H:%M:%S")
                self.timer_label.config(text=f"Next dump: {next_time}")
        else:
            self.status_label.config(text="🔴 Timer Stopped")
            self.timer_label.config(text="Timer: Stopped")

        # Update last dump time
        latest_file = os.path.join(self.config['output_directory'], 'latest.json')
        if os.path.exists(latest_file):
            mtime = os.path.getmtime(latest_file)
            last_dump = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
            self.last_dump_label.config(text=f"Last dump: {last_dump}")

        # Schedule next update
        self.root.after(1000, self.update_status)

    def refresh_files_list(self):
        """Refresh the files list"""
        self.files_listbox.delete(0, tk.END)

        output_dir = self.config['output_directory']
        if not os.path.exists(output_dir):
            return

        files = []
        for filename in os.listdir(output_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(output_dir, filename)
                mtime = os.path.getmtime(filepath)
                files.append((filename, mtime))

        # Sort by modification time (newest first)
        files.sort(key=lambda x: x[1], reverse=True)

        for filename, mtime in files:
            time_str = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
            display_text = f"{filename} ({time_str})"
            self.files_listbox.insert(tk.END, display_text)

    def open_selected_file(self):
        """Open the selected file"""
        selection = self.files_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a file first")
            return

        filename = self.files_listbox.get(selection[0]).split(' (')[0]
        filepath = os.path.join(self.config['output_directory'], filename)

        try:
            os.startfile(filepath)  # Windows
        except AttributeError:
            os.system(f'open "{filepath}"')  # macOS
        except:
            os.system(f'xdg-open "{filepath}"')  # Linux

    def open_output_folder(self):
        """Open the output folder"""
        output_dir = self.config['output_directory']
        try:
            os.startfile(output_dir)  # Windows
        except AttributeError:
            os.system(f'open "{output_dir}"')  # macOS
        except:
            os.system(f'xdg-open "{output_dir}"')  # Linux

    def manual_dump(self):
        """Perform a manual schema dump"""
        self.log_message("Starting manual schema dump...")
        self.dump_button.config(state='disabled')
        self.progress.start()

        # Run dump in separate thread
        thread = threading.Thread(target=self._perform_dump, args=(True,))
        thread.daemon = True
        thread.start()

    def start_timer(self):
        """Start the automatic timer"""
        if self.timer_running:
            return

        self.timer_running = True
        self.log_message(f"Starting auto timer (interval: {self.config['dump_interval_minutes']} minutes)")

        # Calculate next dump time
        interval_seconds = self.config['dump_interval_minutes'] * 60
        self.next_dump_time = datetime.now().replace(second=0, microsecond=0)
        self.next_dump_time = self.next_dump_time.replace(minute=0) + timedelta(hours=1)

        self.timer_thread = threading.Thread(target=self._timer_loop)
        self.timer_thread.daemon = True
        self.timer_thread.start()

        self.start_timer_button.config(state='disabled')
        self.stop_timer_button.config(state='normal')

    def stop_timer(self):
        """Stop the automatic timer"""
        self.timer_running = False
        self.log_message("Auto timer stopped")

        self.start_timer_button.config(state='normal')
        self.stop_timer_button.config(state='disabled')

    def _timer_loop(self):
        """Timer loop running in separate thread"""
        while self.timer_running:
            now = datetime.now()
            if now >= self.next_dump_time:
                self.log_message("Scheduled dump triggered")
                self._perform_dump(False)

                # Calculate next dump time
                interval_seconds = self.config['dump_interval_minutes'] * 60
                self.next_dump_time = now + timedelta(seconds=interval_seconds)

            time.sleep(10)  # Check every 10 seconds

    def _perform_dump(self, is_manual=False):
        """Perform the actual database dump"""
        try:
            # Import required modules
            import psycopg2
            from datetime import timedelta

            # Ensure output directory exists
            output_dir = self.config['output_directory']
            os.makedirs(output_dir, exist_ok=True)

            # Database connection (prefer pooler; derive defaults)
            project_id = self.config.get('project_id', 'amgtktrwpdsigcomavlg')
            pooler_host = 'aws-0-us-east-1.pooler.supabase.com'
            desired_user = self.config.get('db_user') or f"postgres.{project_id}"
            if desired_user == 'postgres':
                desired_user = f"postgres.{project_id}"

            host_cfg = self.config.get('db_host') or pooler_host
            port_cfg = int(self.config.get('db_port', 5432))

            # If DNS fails on provided host, fallback to pooler
            try:
                _ = socket.gethostbyname(host_cfg)
            except Exception:
                self.log_message(f"DNS failed for {host_cfg}; falling back to pooler {pooler_host}")
                host_cfg = pooler_host
                desired_user = f"postgres.{project_id}"

            conn_params = {
                'host': host_cfg,
                'port': port_cfg,
                'database': self.config.get('db_name', 'postgres'),
                'user': desired_user,
                'password': self.config.get('db_password'),
                'sslmode': 'require'
            }

            sanitized = f"postgresql://{conn_params['user']}:***@{conn_params['host']}:{conn_params['port']}/{conn_params['database']}"
            self.log_message(f"Connecting to database via {sanitized}")

            try:
                conn = psycopg2.connect(**conn_params)
            except Exception as e:
                # One more fallback attempt if not already using pooler
                if conn_params['host'] != pooler_host:
                    self.log_message(f"Primary connect failed ({e}); retrying via pooler host")
                    conn_params['host'] = pooler_host
                    conn_params['user'] = f"postgres.{project_id}"
                    sanitized = f"postgresql://{conn_params['user']}:***@{conn_params['host']}:{conn_params['port']}/{conn_params['database']}"
                    self.log_message(f"Connecting to database via {sanitized}")
                    conn = psycopg2.connect(**conn_params)
                else:
                    raise

            cursor = conn.cursor()

            # Define queries
            queries = {
                'tables': """
                    SELECT table_name, column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                    ORDER BY table_name, ordinal_position;
                """,
                'enums': """
                    SELECT t.typname AS enum_name, e.enumlabel AS value
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                    ORDER BY t.typname, e.enumsortorder;
                """,
                'constraints': """
                    SELECT
                      tc.table_name,
                      tc.constraint_name,
                      tc.constraint_type,
                      kcu.column_name,
                      ccu.table_name AS foreign_table_name,
                      ccu.column_name AS foreign_column_name,
                      cc.check_clause
                    FROM information_schema.table_constraints tc
                    LEFT JOIN information_schema.key_column_usage kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    LEFT JOIN information_schema.constraint_column_usage ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                    LEFT JOIN information_schema.check_constraints cc
                      ON cc.constraint_name = tc.constraint_name
                      AND cc.constraint_schema = tc.table_schema
                    WHERE tc.table_schema = 'public'
                    ORDER BY tc.table_name, tc.constraint_name;
                """,
                'indexes': """
                    SELECT
                      schemaname,
                      tablename,
                      indexname,
                      indexdef
                    FROM pg_indexes
                    WHERE schemaname = 'public'
                    ORDER BY tablename, indexname;
                """,
                'triggers': """
                    SELECT
                      tgname AS trigger_name,
                      tgrelid::regclass::text AS table_name,
                      tgtype,
                      tgenabled,
                      pg_get_triggerdef(oid) AS definition
                    FROM pg_trigger
                    WHERE NOT tgisinternal
                    ORDER BY tgrelid::regclass::text, tgname;
                """,
                'rls_policies': """
                    SELECT
                      schemaname,
                      tablename AS table_name,
                      policyname AS policy_name,
                      permissive,
                      roles,
                      cmd AS command,
                      qual,
                      with_check
                    FROM pg_policies
                    WHERE schemaname = 'public'
                    ORDER BY tablename, policyname;
                """,
                'functions': """
                    SELECT
                      p.proname AS function_name,
                      n.nspname AS schema_name,
                      pg_get_function_result(p.oid) AS return_type,
                      pg_get_function_arguments(p.oid) AS arguments,
                      p.prosrc AS source_code
                    FROM pg_proc p
                    JOIN pg_namespace n ON p.pronamespace = n.oid
                    WHERE n.nspname = 'public'
                    AND p.prokind = 'f'
                    ORDER BY p.proname;
                """,
                'views': """
                    SELECT
                      table_name AS view_name,
                      view_definition
                    FROM information_schema.views
                    WHERE table_schema = 'public'
                    ORDER BY table_name;
                """,
                'roles': """
                    SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolcanlogin
                    FROM pg_roles
                    ORDER BY rolname;
                """,
                'role_memberships': """
                    SELECT roleid::regrole AS role_name,
                           member::regrole AS member_name
                    FROM pg_auth_members
                    ORDER BY role_name, member_name;
                """,
                'object_grants': """
                    SELECT n.nspname AS schema,
                           c.relname AS object_name,
                           c.relkind,
                           c.relacl
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relacl IS NOT NULL
                    ORDER BY schema, object_name;
                """,
                'type_casts': """
                    SELECT
                        c.oid,
                        format_type(castsource, NULL) AS source_type,
                        format_type(casttarget, NULL) AS target_type,
                        c.castfunc::regprocedure AS cast_function,
                        c.castcontext AS context
                    FROM pg_cast c
                    ORDER BY source_type, target_type;
                """,
                'operators': """
                    SELECT
                        o.oid,
                        o.oprname AS operator_name,
                        n.nspname AS schema_name,
                        format_type(o.oprleft, NULL) AS left_type,
                        format_type(o.oprright, NULL) AS right_type,
                        o.oprcode::regprocedure AS function_name
                    FROM pg_operator o
                    JOIN pg_namespace n ON n.oid = o.oprnamespace
                    ORDER BY operator_name, left_type, right_type;
                """,
                'dependencies': """
                    SELECT
                        d.classid::regclass AS dependent_class,
                        d.objid::regclass AS dependent_object,
                        d.refclassid::regclass AS referenced_class,
                        d.refobjid::regclass AS referenced_object,
                        d.deptype
                    FROM pg_depend d
                    ORDER BY dependent_object, referenced_object;
                """
            }

            # Execute queries and collect results
            schema = {}
            for query_name, sql in queries.items():
                self.log_message(f"Fetching {query_name}...")
                cursor.execute(sql)
                results = cursor.fetchall()

                # Convert to list of dictionaries
                columns = [desc[0] for desc in cursor.description]
                schema[query_name] = [dict(zip(columns, row)) for row in results]

            # Add metadata and enhanced enum summary
            enum_summary = {}
            for enum_row in schema['enums']:
                enum_name = enum_row['enum_name']
                if enum_name not in enum_summary:
                    enum_summary[enum_name] = []
                enum_summary[enum_name].append(enum_row['value'])

            schema['metadata'] = {
                'project_name': self.config['project_name'],
                'project_id': self.config['project_id'],
                'dumped_at': datetime.now().isoformat(),
                'dump_type': 'manual' if is_manual else 'automatic',
                'total_tables': len(set(t['table_name'] for t in schema['tables'])),
                'total_enums': len(set(e['enum_name'] for e in schema['enums'])),
                'total_constraints': len(schema['constraints']),
                'total_indexes': len(schema['indexes']),
                'total_triggers': len(schema['triggers']),
                'total_policies': len(schema['rls_policies']),
                'total_functions': len(schema['functions']),
                'total_views': len(schema['views']),
                'total_roles': len(schema['roles']),
                'total_role_memberships': len(schema['role_memberships']),
                'total_object_grants': len(schema['object_grants']),
                'total_type_casts': len(schema['type_casts']),
                'total_operators': len(schema['operators']),
                'total_dependencies': len(schema['dependencies']),
                'enum_summary': enum_summary
            }

            # Save files
            timestamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
            latest_path = os.path.join(output_dir, 'latest.json')
            historical_path = os.path.join(output_dir, f'schema_{timestamp}.json')

            json_output = json.dumps(schema, indent=2, default=str)

            # Save latest (always overwritten)
            with open(latest_path, 'w') as f:
                f.write(json_output)

            # Save historical if enabled
            if self.config['keep_historical_files']:
                with open(historical_path, 'w') as f:
                    f.write(json_output)

                # Clean up old files if needed
                self._cleanup_old_files(output_dir)

            # Close database connection
            cursor.close()
            conn.close()

            # Log success with enhanced details
            stats = schema['metadata']
            self.log_message(f"✅ Schema dump completed successfully!")
            self.log_message(f"   📊 {stats['total_tables']} tables, {stats['total_enums']} enums, {stats['total_constraints']} constraints, {stats['total_indexes']} indexes")
            self.log_message(f"   📊 {stats['total_triggers']} triggers, {stats['total_policies']} policies, {stats['total_functions']} functions, {stats['total_views']} views")
            self.log_message(f"   🔐 {stats['total_roles']} roles, {stats['total_role_memberships']} role memberships, {stats['total_object_grants']} object grants")
            self.log_message(f"   🔀 {stats['total_type_casts']} type casts, {stats['total_operators']} operators, {stats['total_dependencies']} dependencies")

            # Log key enums for marketplace debugging
            enum_summary = stats.get('enum_summary', {})
            if 'request_type_enum' in enum_summary:
                self.log_message(f"   🔧 request_type_enum: {', '.join(enum_summary['request_type_enum'])}")
            if 'pricing_preference_enum' in enum_summary:
                self.log_message(f"   🔧 pricing_preference_enum: {', '.join(enum_summary['pricing_preference_enum'])}")

            self.log_message(f"   📁 Saved to: {latest_path}")
            if self.config['keep_historical_files']:
                self.log_message(f"   📁 Historical: {historical_path}")

            # Update UI on main thread
            self.root.after(0, self._dump_completed_ui_update)

        except Exception as e:
            error_msg = f"❌ Schema dump failed: {str(e)}"
            self.log_message(error_msg)
            self.root.after(0, lambda: messagebox.showerror("Error", error_msg))
            self.root.after(0, self._dump_completed_ui_update)

    def _dump_completed_ui_update(self):
        """Update UI after dump completion"""
        self.progress.stop()
        self.dump_button.config(state='normal')
        self.refresh_files_list()

    def _cleanup_old_files(self, output_dir):
        """Clean up old historical files"""
        try:
            max_files = self.config['max_historical_files']
            files = []

            for filename in os.listdir(output_dir):
                if filename.startswith('schema_') and filename.endswith('.json'):
                    filepath = os.path.join(output_dir, filename)
                    mtime = os.path.getmtime(filepath)
                    files.append((filepath, mtime))

            # Sort by modification time (oldest first)
            files.sort(key=lambda x: x[1])

            # Remove excess files
            while len(files) > max_files:
                old_file, _ = files.pop(0)
                os.remove(old_file)
                self.log_message(f"Removed old file: {os.path.basename(old_file)}")

        except Exception as e:
            self.log_message(f"Warning: Could not clean up old files: {e}")

    def load_schema_browser(self):
        """Load schema data into the browser"""
        try:
            latest_file = os.path.join(self.config['output_directory'], 'latest.json')
            if not os.path.exists(latest_file):
                self.details_text.delete(1.0, tk.END)
                self.details_text.insert(tk.END, "No schema file found. Please dump schema first.")
                return

            with open(latest_file, 'r') as f:
                schema = json.load(f)

            # Clear existing tree
            for item in self.schema_tree.get_children():
                self.schema_tree.delete(item)

            # Add schema sections
            tables_node = self.schema_tree.insert('', 'end', text='📊 Tables', values=['tables'])
            enums_node = self.schema_tree.insert('', 'end', text='🏷️ Enums', values=['enums'])
            constraints_node = self.schema_tree.insert('', 'end', text='🔗 Constraints', values=['constraints'])
            functions_node = self.schema_tree.insert('', 'end', text='⚙️ Functions', values=['functions'])
            roles_node = self.schema_tree.insert('', 'end', text='👥 Roles', values=['roles'])
            grants_node = self.schema_tree.insert('', 'end', text='🔐 Grants', values=['grants'])
            casts_node = self.schema_tree.insert('', 'end', text='🔀 Type Casts', values=['type_casts'])
            operators_node = self.schema_tree.insert('', 'end', text='⚖️ Operators', values=['operators'])
            dependencies_node = self.schema_tree.insert('', 'end', text='🔗 Dependencies', values=['dependencies'])

            # Add tables
            tables_by_name = {}
            for table_info in schema.get('tables', []):
                table_name = table_info['table_name']
                if table_name not in tables_by_name:
                    tables_by_name[table_name] = []
                tables_by_name[table_name].append(table_info)

            for table_name in sorted(tables_by_name.keys()):
                table_node = self.schema_tree.insert(tables_node, 'end', text=table_name, values=['table', table_name])
                for column in tables_by_name[table_name]:
                    col_text = f"{column['column_name']} ({column['data_type']})"
                    self.schema_tree.insert(table_node, 'end', text=col_text, values=['column', table_name, column['column_name']])

            # Add enums
            enums_by_name = {}
            for enum_info in schema.get('enums', []):
                enum_name = enum_info['enum_name']
                if enum_name not in enums_by_name:
                    enums_by_name[enum_name] = []
                enums_by_name[enum_name].append(enum_info['value'])

            for enum_name in sorted(enums_by_name.keys()):
                enum_node = self.schema_tree.insert(enums_node, 'end', text=enum_name, values=['enum', enum_name])
                for value in enums_by_name[enum_name]:
                    self.schema_tree.insert(enum_node, 'end', text=value, values=['enum_value', enum_name, value])

            # Add roles
            for role_info in schema.get('roles', []):
                role_name = role_info['rolname']
                role_details = []
                if role_info.get('rolsuper'):
                    role_details.append('SUPERUSER')
                if role_info.get('rolcreatedb'):
                    role_details.append('CREATEDB')
                if role_info.get('rolcreaterole'):
                    role_details.append('CREATEROLE')
                if role_info.get('rolcanlogin'):
                    role_details.append('LOGIN')

                role_text = f"{role_name} ({', '.join(role_details) if role_details else 'No special privileges'})"
                self.schema_tree.insert(roles_node, 'end', text=role_text, values=['role', role_name])

            # Add role memberships
            memberships_node = self.schema_tree.insert(roles_node, 'end', text='Role Memberships', values=['role_memberships'])
            for membership in schema.get('role_memberships', []):
                membership_text = f"{membership['member_name']} → {membership['role_name']}"
                self.schema_tree.insert(memberships_node, 'end', text=membership_text, values=['role_membership', membership['role_name'], membership['member_name']])

            # Add object grants
            for grant_info in schema.get('object_grants', []):
                grant_text = f"{grant_info['schema']}.{grant_info['object_name']} (ACL: {grant_info.get('relacl', 'None')})"
                self.schema_tree.insert(grants_node, 'end', text=grant_text, values=['object_grant', grant_info['schema'], grant_info['object_name']])

            # Add type casts
            for cast_info in schema.get('type_casts', []):
                cast_text = f"{cast_info['source_type']} → {cast_info['target_type']} ({cast_info.get('context', 'unknown')})"
                self.schema_tree.insert(casts_node, 'end', text=cast_text, values=['type_cast', cast_info['source_type'], cast_info['target_type']])

            # Add operators
            for op_info in schema.get('operators', []):
                op_text = f"{op_info['operator_name']} ({op_info.get('left_type', '')} {op_info['operator_name']} {op_info.get('right_type', '')})"
                self.schema_tree.insert(operators_node, 'end', text=op_text, values=['operator', op_info['operator_name'], op_info.get('schema_name', '')])

            # Add dependencies (limit to first 100 to avoid overwhelming the UI)
            dependencies = schema.get('dependencies', [])[:100]
            for dep_info in dependencies:
                dep_text = f"{dep_info.get('dependent_object', 'N/A')} → {dep_info.get('referenced_object', 'N/A')} ({dep_info.get('deptype', 'unknown')})"
                self.schema_tree.insert(dependencies_node, 'end', text=dep_text, values=['dependency', str(dep_info.get('dependent_object', '')), str(dep_info.get('referenced_object', ''))])

            if len(schema.get('dependencies', [])) > 100:
                self.schema_tree.insert(dependencies_node, 'end', text=f"... and {len(schema.get('dependencies', [])) - 100} more", values=['dependency_more'])

            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(tk.END, f"Schema loaded successfully!\n\n")
            self.details_text.insert(tk.END, f"📊 {len(tables_by_name)} tables\n")
            self.details_text.insert(tk.END, f"🏷️ {len(enums_by_name)} enums\n")
            self.details_text.insert(tk.END, f"🔗 {len(schema.get('constraints', []))} constraints\n")
            self.details_text.insert(tk.END, f"⚙️ {len(schema.get('functions', []))} functions\n")
            self.details_text.insert(tk.END, f"👥 {len(schema.get('roles', []))} roles\n")
            self.details_text.insert(tk.END, f"🔐 {len(schema.get('object_grants', []))} object grants\n")
            self.details_text.insert(tk.END, f"🔀 {len(schema.get('type_casts', []))} type casts\n")
            self.details_text.insert(tk.END, f"⚖️ {len(schema.get('operators', []))} operators\n")
            self.details_text.insert(tk.END, f"🔗 {len(schema.get('dependencies', []))} dependencies\n\n")
            self.details_text.insert(tk.END, "Select an item from the tree to view details.")

        except Exception as e:
            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(tk.END, f"Error loading schema: {e}")

    def show_enum_summary(self):
        """Show a summary of all enums and their values"""
        try:
            latest_file = os.path.join(self.config['output_directory'], 'latest.json')
            if not os.path.exists(latest_file):
                self.details_text.delete(1.0, tk.END)
                self.details_text.insert(tk.END, "No schema file found. Please dump schema first.")
                return

            with open(latest_file, 'r') as f:
                schema = json.load(f)

            enum_summary = schema.get('metadata', {}).get('enum_summary', {})

            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(tk.END, "🏷️ ENUM SUMMARY\n")
            self.details_text.insert(tk.END, "=" * 50 + "\n\n")

            for enum_name in sorted(enum_summary.keys()):
                values = enum_summary[enum_name]
                self.details_text.insert(tk.END, f"📋 {enum_name}:\n")
                for value in values:
                    self.details_text.insert(tk.END, f"   • {value}\n")
                self.details_text.insert(tk.END, "\n")

            # Highlight key marketplace enums
            if 'request_type_enum' in enum_summary:
                self.details_text.insert(tk.END, "🔧 MARKETPLACE REQUEST TYPES:\n")
                self.details_text.insert(tk.END, f"   {', '.join(enum_summary['request_type_enum'])}\n\n")

            if 'pricing_preference_enum' in enum_summary:
                self.details_text.insert(tk.END, "💰 PRICING PREFERENCES:\n")
                self.details_text.insert(tk.END, f"   {', '.join(enum_summary['pricing_preference_enum'])}\n\n")

        except Exception as e:
            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(tk.END, f"Error showing enum summary: {e}")

    def on_tree_select(self, event):
        """Handle tree selection"""
        selection = self.schema_tree.selection()
        if not selection:
            return

        item = selection[0]
        values = self.schema_tree.item(item, 'values')

        if not values:
            return

        try:
            latest_file = os.path.join(self.config['output_directory'], 'latest.json')
            if not os.path.exists(latest_file):
                return

            with open(latest_file, 'r') as f:
                schema = json.load(f)

            self.details_text.delete(1.0, tk.END)

            if values[0] == 'table' and len(values) > 1:
                table_name = values[1]
                self.details_text.insert(tk.END, f"📊 TABLE: {table_name}\n")
                self.details_text.insert(tk.END, "=" * 50 + "\n\n")

                # Show columns
                columns = [t for t in schema.get('tables', []) if t['table_name'] == table_name]
                for col in columns:
                    self.details_text.insert(tk.END, f"📋 {col['column_name']}\n")
                    self.details_text.insert(tk.END, f"   Type: {col['data_type']}\n")
                    self.details_text.insert(tk.END, f"   Nullable: {col['is_nullable']}\n")
                    if col['column_default']:
                        self.details_text.insert(tk.END, f"   Default: {col['column_default']}\n")
                    self.details_text.insert(tk.END, "\n")

            elif values[0] == 'enum' and len(values) > 1:
                enum_name = values[1]
                self.details_text.insert(tk.END, f"🏷️ ENUM: {enum_name}\n")
                self.details_text.insert(tk.END, "=" * 50 + "\n\n")

                enum_values = [e['value'] for e in schema.get('enums', []) if e['enum_name'] == enum_name]
                for value in enum_values:
                    self.details_text.insert(tk.END, f"   • {value}\n")

            elif values[0] == 'role' and len(values) > 1:
                role_name = values[1]
                self.details_text.insert(tk.END, f"👥 ROLE: {role_name}\n")
                self.details_text.insert(tk.END, "=" * 50 + "\n\n")

                role_info = next((r for r in schema.get('roles', []) if r['rolname'] == role_name), None)
                if role_info:
                    self.details_text.insert(tk.END, f"Superuser: {role_info.get('rolsuper', False)}\n")
                    self.details_text.insert(tk.END, f"Create DB: {role_info.get('rolcreatedb', False)}\n")
                    self.details_text.insert(tk.END, f"Create Role: {role_info.get('rolcreaterole', False)}\n")
                    self.details_text.insert(tk.END, f"Can Login: {role_info.get('rolcanlogin', False)}\n\n")

                # Show role memberships
                memberships = [m for m in schema.get('role_memberships', []) if m['role_name'] == role_name or m['member_name'] == role_name]
                if memberships:
                    self.details_text.insert(tk.END, "Role Memberships:\n")
                    for membership in memberships:
                        if membership['role_name'] == role_name:
                            self.details_text.insert(tk.END, f"   • Has member: {membership['member_name']}\n")
                        else:
                            self.details_text.insert(tk.END, f"   • Member of: {membership['role_name']}\n")

            elif values[0] == 'object_grant' and len(values) > 2:
                schema_name = values[1]
                object_name = values[2]
                self.details_text.insert(tk.END, f"🔐 OBJECT GRANT: {schema_name}.{object_name}\n")
                self.details_text.insert(tk.END, "=" * 50 + "\n\n")

                grant_info = next((g for g in schema.get('object_grants', []) if g['schema'] == schema_name and g['object_name'] == object_name), None)
                if grant_info:
                    self.details_text.insert(tk.END, f"Schema: {grant_info['schema']}\n")
                    self.details_text.insert(tk.END, f"Object: {grant_info['object_name']}\n")
                    self.details_text.insert(tk.END, f"Object Type: {grant_info.get('relkind', 'Unknown')}\n")
                    self.details_text.insert(tk.END, f"ACL: {grant_info.get('relacl', 'None')}\n")

            elif values[0] == 'type_cast' and len(values) > 2:
                source_type = values[1]
                target_type = values[2]
                self.details_text.insert(tk.END, f"🔀 TYPE CAST: {source_type} → {target_type}\n")
                self.details_text.insert(tk.END, "=" * 50 + "\n\n")

                cast_info = next((c for c in schema.get('type_casts', []) if c['source_type'] == source_type and c['target_type'] == target_type), None)
                if cast_info:
                    self.details_text.insert(tk.END, f"Source Type: {cast_info['source_type']}\n")
                    self.details_text.insert(tk.END, f"Target Type: {cast_info['target_type']}\n")
                    self.details_text.insert(tk.END, f"Cast Function: {cast_info.get('cast_function', 'None')}\n")
                    self.details_text.insert(tk.END, f"Context: {cast_info.get('context', 'Unknown')}\n")

            elif values[0] == 'operator' and len(values) > 1:
                operator_name = values[1]
                self.details_text.insert(tk.END, f"⚖️ OPERATOR: {operator_name}\n")
                self.details_text.insert(tk.END, "=" * 50 + "\n\n")

                operators = [o for o in schema.get('operators', []) if o['operator_name'] == operator_name]
                for op_info in operators:
                    self.details_text.insert(tk.END, f"Operator: {op_info['operator_name']}\n")
                    self.details_text.insert(tk.END, f"Schema: {op_info.get('schema_name', 'Unknown')}\n")
                    self.details_text.insert(tk.END, f"Left Type: {op_info.get('left_type', 'None')}\n")
                    self.details_text.insert(tk.END, f"Right Type: {op_info.get('right_type', 'None')}\n")
                    self.details_text.insert(tk.END, f"Function: {op_info.get('function_name', 'None')}\n\n")

            elif values[0] == 'dependency' and len(values) > 2:
                dependent_obj = values[1]
                referenced_obj = values[2]
                self.details_text.insert(tk.END, f"🔗 DEPENDENCY: {dependent_obj} → {referenced_obj}\n")
                self.details_text.insert(tk.END, "=" * 50 + "\n\n")

                dep_info = next((d for d in schema.get('dependencies', []) if str(d.get('dependent_object', '')) == dependent_obj and str(d.get('referenced_object', '')) == referenced_obj), None)
                if dep_info:
                    self.details_text.insert(tk.END, f"Dependent Class: {dep_info.get('dependent_class', 'Unknown')}\n")
                    self.details_text.insert(tk.END, f"Dependent Object: {dep_info.get('dependent_object', 'Unknown')}\n")
                    self.details_text.insert(tk.END, f"Referenced Class: {dep_info.get('referenced_class', 'Unknown')}\n")
                    self.details_text.insert(tk.END, f"Referenced Object: {dep_info.get('referenced_object', 'Unknown')}\n")
                    self.details_text.insert(tk.END, f"Dependency Type: {dep_info.get('deptype', 'Unknown')}\n")

        except Exception as e:
            self.details_text.insert(tk.END, f"Error loading details: {e}")


def main():
    """Main function to run the GUI"""
    root = tk.Tk()
    app = DatabaseSchemaGUI(root)

    # Initial file list refresh
    app.refresh_files_list()

    # Handle window closing
    def on_closing():
        if app.timer_running:
            app.stop_timer()
        root.destroy()

    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()


if __name__ == "__main__":
    main()
