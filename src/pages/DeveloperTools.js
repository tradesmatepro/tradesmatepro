import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { supabase } from '../utils/supabaseClient';
import consoleErrorDetector from '../utils/consoleErrorDetector';
import { runDeveloperToolsTests } from '../tests/developerToolsTest';
import RealTimeErrorFixer from '../utils/realTimeErrorFixer';
// Phase 2: Validator imports
import { runAllValidators } from '../devtools/validators';
import { captureUISnapshot } from '../devtools/core/uiSnapshot';
// Phase 3: Fix Engine imports
import { runFixCycle, getFixHistory, rollbackFix } from '../devtools/fixEngine/fixLoop';

// Auto-send errors to error server (ENABLED)
function autoSendErrors(intervalSec = 30) {
  console.log(`✅ Auto-send errors enabled - sending to http://localhost:4000/save-errors`);

  const sendErrors = async () => {
    try {
      let errors = [];

      // Multiple fallbacks for error sources
      if (window.getAllCapturedErrors) {
        errors = window.getAllCapturedErrors();
      } else if (window.capturedErrors) {
        errors = window.capturedErrors;
      } else if (
        window.consoleErrorDetector &&
        window.consoleErrorDetector.errors
      ) {
        errors = window.consoleErrorDetector.errors;
      }

      console.log(`📊 Found ${errors.length} errors (auto-send disabled)`);

      // Disabled to prevent connection errors
      // if (errors && errors.length > 0) {
      //   const response = await fetch("http://localhost:4000/save-errors", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(errors),
      //   });

      //   if (response.ok) {
      //     const result = await response.json();
      //     console.log(
      //       `✅ Auto-saved ${result.count} errors to ${result.latest}`
      //     );
      //   } else {
      //     console.warn(`⚠️ Error server responded with ${response.status}`);
      //   }
      // } else {
      //   console.log("📝 No errors to send");
      // }
    } catch (err) {
      console.warn("⚠️ Failed to process captured errors:", err.message);
    }
  };

  // Disabled auto-send to prevent connection errors
  // sendErrors();
  // const interval = setInterval(sendErrors, intervalSec * 1000);
  // return interval;

  return null; // Return null instead of interval
}

// Real-time logging system
class DevToolsLogger {
  constructor() {
    this.logs = [];
    this.listeners = [];
    this.apiRequests = [];
    this.errors = [];
    this.performance = [];
    this.setupConsoleInterception();
    this.setupNetworkInterception();
    this.setupErrorTracking();
    this.setupPerformanceMonitoring();
  }

  setupConsoleInterception() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      this.addLog('INFO', args.join(' '), 'app');
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.addLog('ERROR', args.join(' '), 'app');
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.addLog('WARN', args.join(' '), 'app');
      originalWarn.apply(console, args);
    };

    console.info = (...args) => {
      this.addLog('INFO', args.join(' '), 'app');
      originalInfo.apply(console, args);
    };
  }

  setupNetworkInterception() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const [url, options = {}] = args;

      const requestId = Date.now() + Math.random();
      const requestData = {
        id: requestId,
        url: typeof url === 'string' ? url : url.url,
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body,
        timestamp: new Date().toISOString(),
        startTime
      };

      this.addApiRequest({ ...requestData, status: 'pending' });

      try {
        const response = await originalFetch.apply(window, args);
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.updateApiRequest(requestId, {
          status: response.status,
          statusText: response.statusText,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          duration,
          success: response.ok
        });

        // Log API request with 'api' category
        this.addLog('INFO', `${requestData.method} ${requestData.url} - ${response.status} (${duration}ms)`, 'api');

        return response;
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.updateApiRequest(requestId, {
          status: 'error',
          error: error.message,
          duration,
          success: false
        });

        // Log API error with 'api' category
        this.addLog('ERROR', `${requestData.method} ${requestData.url} - ERROR: ${error.message} (${duration}ms)`, 'api');

        throw error;
      }
    };
  }

  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.addError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.addError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  setupPerformanceMonitoring() {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addPerformanceEntry({
            name: entry.name,
            type: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            timestamp: new Date().toISOString()
          });
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'mark'] });
    }
  }

  addLog(level, message, source) {
    const log = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      message,
      source
    };

    this.logs.push(log);
    this.notifyListeners('log', log);
  }

  addApiRequest(request) {
    this.apiRequests.push(request);
    this.notifyListeners('apiRequest', request);
  }

  updateApiRequest(id, updates) {
    const index = this.apiRequests.findIndex(req => req.id === id);
    if (index !== -1) {
      this.apiRequests[index] = { ...this.apiRequests[index], ...updates };
      this.notifyListeners('apiRequestUpdate', this.apiRequests[index]);
    }
  }

  addError(error) {
    this.errors.push(error);
    this.addLog('ERROR', `${error.type}: ${error.message}`, 'error-tracker');
    this.notifyListeners('error', error);
  }

  addPerformanceEntry(entry) {
    this.performance.push(entry);
    this.notifyListeners('performance', entry);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(type, data) {
    this.listeners.forEach(listener => listener(type, data));
  }

  getLogs() { return [...this.logs]; }
  getApiRequests() { return [...this.apiRequests]; }
  getErrors() { return [...this.errors]; }
  getPerformance() { return [...this.performance]; }

  clearLogs() { this.logs = []; }
  clearApiRequests() { this.apiRequests = []; }
  clearErrors() { this.errors = []; }
  clearPerformance() { this.performance = []; }
}

// Global logger instance
const devLogger = new DevToolsLogger();

const DeveloperTools = () => {
  const { user, company } = useUser();
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [schemaData, setSchemaData] = useState(null);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM companies LIMIT 5;');
  const [sqlResult, setSqlResult] = useState(null);
  const [apiRequests, setApiRequests] = useState([]);
  const [errors, setErrors] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [logFilter, setLogFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [errorFixer, setErrorFixer] = useState(null);
  const [fixReport, setFixReport] = useState(null);
  const [networkRequests, setNetworkRequests] = useState([]);
  const [debugBundle, setDebugBundle] = useState(null);
  // Phase 2: Validator state
  const [validatorResults, setValidatorResults] = useState([]);
  const [uiSnapshots, setUiSnapshots] = useState({});
  // Phase 3: Fix Engine state
  const [fixResults, setFixResults] = useState([]);
  const [isFixing, setIsFixing] = useState(false);
  const logsRef = useRef(null);

  // Access gating: restrict Developer Tools to dev or allowed emails in production
  const allowedEmailsEnv = process.env.REACT_APP_DEVTOOLS_ALLOWED_EMAILS || '';
  const allowedEmails = allowedEmailsEnv.split(',').map(s => s.trim()).filter(Boolean);
  const isDevEnv = process.env.NODE_ENV !== 'production';
  const enableInProd = process.env.REACT_APP_ENABLE_DEVTOOLS === 'true';
  const isAllowedUser = !!user?.email && allowedEmails.includes(user.email);
  const canViewDevTools = isDevEnv || (allowedEmails.length > 0 ? isAllowedUser : (enableInProd && !!user));


  // Real-time data subscription
  useEffect(() => {
    const unsubscribe = devLogger.subscribe((type, data) => {
      if (!isRealTimeEnabled) return;

      switch (type) {
        case 'log':
          setLogs(prev => [...prev, data].slice(-1000)); // Keep last 1000 logs
          break;
        case 'apiRequest':
          setApiRequests(prev => [...prev, data].slice(-500)); // Keep last 500 requests
          break;
        case 'apiRequestUpdate':
          setApiRequests(prev => prev.map(req => req.id === data.id ? data : req));
          break;
        case 'error':
          setErrors(prev => [...prev, data].slice(-200)); // Keep last 200 errors
          break;
        case 'performance':
          setPerformance(prev => [...prev, data].slice(-300)); // Keep last 300 entries
          break;
      }
    });

    // Initialize with existing data
    setLogs(devLogger.getLogs());
    setApiRequests(devLogger.getApiRequests());
    setErrors(devLogger.getErrors());
    setPerformance(devLogger.getPerformance());

    // Add initial system logs
    devLogger.addLog('INFO', 'Developer Tools initialized successfully', 'system');
    devLogger.addLog('INFO', `User: ${user?.email || 'Unknown'}, Company: ${company?.name || 'Unknown'}`, 'system');
    devLogger.addLog('INFO', 'Real-time monitoring active', 'system');

    // Phase 1: Auto-send errors every 30 seconds
    autoSendErrors(30);

    // Phase 1: Initialize RealTimeErrorFixer (Basic Mode)
    if (window.realTimeErrorFixer) {
      window.realTimeErrorFixer.start();
      devLogger.addLog('INFO', 'RealTimeErrorFixer started (basic mode)', 'system');
    } else {
      devLogger.addLog('WARN', 'RealTimeErrorFixer not available', 'system');
    }

    // Log UI initialization events
    devLogger.addLog('INFO', 'UI Init - Developer Tools mounted', 'ui');

    return unsubscribe;
  }, [user, isRealTimeEnabled]);

  // Initialize system health and database status
  useEffect(() => {
    setDbStatus({ status: 'ready', message: 'Database connection ready for testing' });
    setSystemHealth({
      database: { status: 'ok' },
      auth: { status: 'ok', hasSession: !!user },
      storage: { status: 'ok' },
      realTime: { status: isRealTimeEnabled ? 'active' : 'paused' }
    });
  }, [user, isRealTimeEnabled]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  // Real database connection test
  const testDbConnection = async () => {
    const startTime = Date.now();
    try {
      setDbStatus({ status: 'testing', message: 'Testing Supabase connection...' });
      devLogger.addLog('INFO', 'Testing database connection...', 'db');

      // Test actual Supabase connection
      const { data, error, count } = await supabase
        .from('companies')
        .select('id', { count: 'exact', head: true });

      if (error) throw error;

      const latency = Date.now() - startTime;
      const status = {
        status: 'connected',
        latency,
        message: 'Supabase connection successful',
        recordCount: count || 0,
        timestamp: new Date().toISOString()
      };

      setDbStatus(status);
      devLogger.addLog('INFO', `Database connected - ${count} companies found (${latency}ms)`, 'db');

      // Update system health
      setSystemHealth(prev => ({
        ...prev,
        database: { status: 'ok', latency, recordCount: count }
      }));

    } catch (err) {
      const latency = Date.now() - startTime;
      const status = {
        status: 'error',
        error: err.message,
        latency,
        timestamp: new Date().toISOString()
      };

      setDbStatus(status);
      devLogger.addLog('ERROR', `Database connection failed: ${err.message}`, 'db');

      setSystemHealth(prev => ({
        ...prev,
        database: { status: 'error', error: err.message }
      }));
    }
  };
  // Automated Marketplace submit-and-cleanup test (adaptive: tries safe variants, inserts then deletes)
  const runMarketplaceAutoSubmitTest = useCallback(async () => {
    const start = Date.now();
    devLogger.addLog('INFO', '🧪 Marketplace auto-submit test starting (adaptive)...', 'marketplace-test');
    try {
      if (!user?.company_id) throw new Error('No company context');

      // Pick any existing customer (prefer the most recent for this company)
      const { data: customers, error: custErr } = await supabase
        .from('customers')
        .select('id')
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (custErr) throw custErr;
      if (!customers || customers.length === 0) throw new Error('No customers found for this company');
      const customerId = customers[0].id;

      const now = new Date();
      const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const endTime = new Date(now.getTime() + 26 * 60 * 60 * 1000).toISOString();

      // Try a small set of safe variants using ACTUAL schema from latest.json
      const requestTypes = ['STANDARD', 'EMERGENCY']; // request_type_enum
      const pricingPreferences = ['FLAT', 'HOURLY', 'NEGOTIABLE']; // pricing_preference_enum
      const serviceModes = ['onsite']; // text field

      let lastError = null;
      for (const rt of requestTypes) {
        for (const pp of pricingPreferences) {
          for (const sm of serviceModes) {
            const payload = {
              company_id: user.company_id,
              // customer_id: null, // Let it be null for contractor-posted requests
              title: `DevTools Auto Test ${now.toISOString()}`,
              description: 'Automated test insert from Developer Tools (will be deleted)',
              request_type: rt, // request_type_enum (STANDARD/EMERGENCY)
              service_mode: sm, // text field (onsite/remote/hybrid)
              pricing_type: 'negotiable', // text field default
              pricing_preference: pp, // pricing_preference_enum (FLAT/HOURLY/NEGOTIABLE)
              budget: pp === 'FLAT' ? 123.45 : null,
              flat_rate: pp === 'FLAT' ? 123.45 : null,
              hourly_rate: pp === 'HOURLY' ? 55.0 : null,
              hourly_rate_limit: pp === 'HOURLY' ? 55.0 : null,
              max_responses: 3,
              requires_inspection: false,
              start_time: startTime,
              end_time: endTime
            };

            devLogger.addLog('INFO', `➡️ Attempt insert variant: ${JSON.stringify(payload)}`, 'marketplace-test');
            const { data: request, error: insertErr } = await supabase
              .from('marketplace_requests')
              .insert([payload])
              .select()
              .single();

            if (!insertErr && request?.id) {
              devLogger.addLog('INFO', `✅ Inserted request id=${request.id} with variant rt=${rt}, pp=${pp}, sm=${sm}`, 'marketplace-test');
              // Clean up to keep DB tidy
              const { error: delErr } = await supabase
                .from('marketplace_requests')
                .delete()
                .eq('id', request.id);
              if (delErr) throw delErr;

              const ms = Date.now() - start;
              devLogger.addLog('INFO', `🧪 Marketplace auto-submit test PASSED in ${ms}ms (insert+delete)`, 'marketplace-test');
              alert('Marketplace auto-submit test PASSED (insert+delete). See Developer Tools logs.');
              return;
            } else {
              lastError = insertErr;
              devLogger.addLog('ERROR', `❌ Insert failed for rt=${rt}, pp=${pp}, sm=${sm}: ${insertErr?.message || 'Unknown error'}`, 'marketplace-test');
              // Adaptive hints based on actual schema
              if (insertErr?.message?.includes('request_type_enum')) {
                devLogger.addLog('WARN', 'Hint: request_type must be STANDARD or EMERGENCY (UPPERCASE)', 'marketplace-test');
              }
              if (insertErr?.message?.includes('pricing_preference_enum')) {
                devLogger.addLog('WARN', 'Hint: pricing_preference must be FLAT, HOURLY, or NEGOTIABLE (UPPERCASE)', 'marketplace-test');
              }
              if (insertErr?.message?.includes('foreign key constraint')) {
                devLogger.addLog('WARN', 'Hint: customer_id foreign key issue - using null for contractor requests', 'marketplace-test');
              }
            }
          }
        }
      }

      throw new Error(lastError?.message || 'All adaptive insert variants failed');
    } catch (err) {
      const ms = Date.now() - start;
      devLogger.addLog('ERROR', `🧪 Marketplace auto-submit test FAILED in ${ms}ms: ${err.message}`, 'marketplace-test');
      console.error('Marketplace auto-submit test failed:', err);
      alert(`Marketplace auto-submit test FAILED: ${err.message}`);
    }
  }, [user]);


  // Expose to window for easy console trigger
  useEffect(() => {
    window.runMarketplaceAutoSubmitTest = runMarketplaceAutoSubmitTest;
    return () => { if (window.runMarketplaceAutoSubmitTest) delete window.runMarketplaceAutoSubmitTest; };
  }, [runMarketplaceAutoSubmitTest]);


  // Real schema inspection using the devtools_get_schema RPC function

  // Full-auto: run marketplace submit test automatically when DevTools is open
  useEffect(() => {
    if (canViewDevTools) {
      const t = setTimeout(() => {
        runMarketplaceAutoSubmitTest();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [canViewDevTools, runMarketplaceAutoSubmitTest]);

  const getSchema = async () => {
    try {
      devLogger.addLog('INFO', 'Fetching database schema via devtools_get_schema RPC...', 'db');

      // Call the devtools_get_schema RPC function you created
      const { data, error } = await supabase.rpc('devtools_get_schema');



      if (error) {
        throw new Error(`RPC Error: ${error.message}`);
      }

      // Transform the data into a more useful format
      const schemaByTable = {};
      data.forEach(row => {
        if (!schemaByTable[row.table_name]) {
          schemaByTable[row.table_name] = [];
        }
        schemaByTable[row.table_name].push({
          column: row.column_name,
          type: row.data_type
        });
      });

      const schemaInfo = {
        timestamp: new Date().toISOString(),
        tables: Object.keys(schemaByTable).sort(),
        totalTables: Object.keys(schemaByTable).length,
        totalColumns: data.length,
        schemaByTable,
        rawData: data,
        method: 'rpc_function',
        note: 'Live schema from devtools_get_schema RPC function'
      };

      setSchemaData(schemaInfo);
      devLogger.addLog('INFO', `✅ Schema loaded: ${schemaInfo.totalTables} tables, ${schemaInfo.totalColumns} columns`, 'db');

    } catch (err) {
      devLogger.addLog('ERROR', `❌ Schema fetch failed: ${err.message}`, 'database');

      // Fallback to basic table list if RPC fails
      const tableNames = [
        'companies', 'users', 'customers', 'work_orders', 'quotes',
        'inventory_items', 'employees', 'employee_timesheets', 'invoices',
        'vendors', 'settings', 'documents', 'messages', 'notifications',
        'pto_policies', 'pto_ledger', 'employee_pto_balances', 'sales_activities',
        'purchase_orders', 'po_items', 'attachments', 'integration_tokens',
        'schedule_events', 'payments', 'invoice_items', 'document_templates'
      ];

      const fallbackInfo = {
        timestamp: new Date().toISOString(),
        tables: tableNames,
        totalTables: tableNames.length,
        error: err.message,
        method: 'fallback_static_list',
        note: 'Fallback to static list - RPC function may not exist or failed'
      };

      setSchemaData(fallbackInfo);
    }
  };

  // Execute SQL query using the exec_readonly_sql RPC function
  const executeSql = async () => {
    const startTime = Date.now();
    try {
      devLogger.addLog('INFO', `🔍 Executing query via exec_readonly_sql RPC: ${sqlQuery.substring(0, 100)}...`, 'database');

      // Safety check - only allow SELECT queries
      const trimmedQuery = sqlQuery.trim().toLowerCase();
      if (!trimmedQuery.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed for security');
      }

      // Call the exec_readonly_sql RPC function you created
      const { data, error } = await supabase.rpc('exec_readonly_sql', {
        sql: sqlQuery
      });

      if (error) {
        throw new Error(`RPC Error: ${error.message}`);
      }

      const duration = Date.now() - startTime;
      const queryResult = {
        query: sqlQuery,
        result: {
          data: data || [],
          count: data ? data.length : 0,
          method: 'rpc_function'
        },
        duration,
        timestamp: new Date().toISOString(),
        success: true,
        note: 'Executed via exec_readonly_sql RPC function'
      };

      setSqlResult(queryResult);
      devLogger.addLog('INFO', `✅ Query executed successfully (${duration}ms) - ${queryResult.result.count} rows returned`, 'database');

    } catch (err) {
      const duration = Date.now() - startTime;
      devLogger.addLog('ERROR', `❌ Query failed: ${err.message}`, 'database');

      // Try fallback approach for basic queries
      try {
        devLogger.addLog('INFO', '🔄 Attempting fallback query execution...', 'database');

        const trimmedQuery = sqlQuery.trim().toLowerCase();
        let fallbackResult;

        if (trimmedQuery.includes('companies')) {
          const { data, error, count } = await supabase
            .from('companies')
            .select('*', { count: 'exact' })
            .limit(10);
          if (error) throw error;
          fallbackResult = { data, count, table: 'companies', method: 'fallback' };

        } else if (trimmedQuery.includes('profiles')) {
          const { data, error, count } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, company_id', { count: 'exact' })
            .limit(10);
          if (error) throw error;
          fallbackResult = { data, count, table: 'profiles', method: 'fallback' };

        } else {
          throw new Error('Fallback failed - query not supported');
        }

        const queryResult = {
          query: sqlQuery,
          result: fallbackResult,
          duration,
          timestamp: new Date().toISOString(),
          success: true,
          note: 'Executed via fallback method - RPC function may not exist'
        };

        setSqlResult(queryResult);
        devLogger.addLog('INFO', `✅ Fallback query executed (${duration}ms) - ${fallbackResult.count} rows`, 'database');

      } catch (fallbackErr) {
        const errorResult = {
          query: sqlQuery,
          error: `Primary: ${err.message} | Fallback: ${fallbackErr.message}`,
          duration,
          timestamp: new Date().toISOString(),
          success: false
        };

        setSqlResult(errorResult);
        devLogger.addLog('ERROR', `❌ Both primary and fallback queries failed`, 'database');
      }
    }
  };

  // Enhanced export with all data
  const exportLogs = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      user: user?.email,
      company: company?.name,
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: logs.slice(-500), // Last 500 logs
      apiRequests: apiRequests.slice(-100), // Last 100 requests
      errors: errors.slice(-50), // Last 50 errors
      performance: performance.slice(-100), // Last 100 performance entries
      dbStatus,
      schemaData,
      systemHealth,
      memoryUsage: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trademate-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    devLogger.addLog('INFO', `Debug data exported (${logs.length} logs, ${apiRequests.length} API requests)`, 'system');
  };

  // Clear all data
  const clearLogs = () => {
    devLogger.clearLogs();
    setLogs([]);
    devLogger.addLog('INFO', 'Logs cleared', 'system');
  };

  const clearApiRequests = () => {
    devLogger.clearApiRequests();
    setApiRequests([]);
    devLogger.addLog('INFO', 'API requests cleared', 'system');
  };

  const clearErrors = () => {
    devLogger.clearErrors();
    setErrors([]);
    devLogger.addLog('INFO', 'Errors cleared', 'system');
  };

  // Network monitoring functions
  const loadNetworkRequests = () => {
    const captured = window.__capturedRequests || [];
    setNetworkRequests(captured.slice(-100)); // Last 100 requests
    devLogger.addLog('INFO', `Loaded ${captured.length} network requests`, 'network');
  };

  const clearNetworkRequests = () => {
    window.__capturedRequests = [];
    setNetworkRequests([]);
    devLogger.addLog('INFO', 'Network requests cleared', 'network');
  };

  // Enhanced debug bundle export for full automation
  const exportDebugBundle = async () => {
    try {
      devLogger.addLog('INFO', '📦 Creating comprehensive debug bundle...', 'system');

      // Gather all available data
      const capturedLogs = window.__capturedLogs || [];
      const capturedErrors = window.capturedErrors || [];
      const capturedRequests = window.__capturedRequests || [];

      // Get fresh schema data
      let currentSchema = schemaData;
      if (!currentSchema) {
        try {
          const { data, error } = await supabase.rpc('devtools_get_schema');
          if (!error && data) {
            currentSchema = {
              timestamp: new Date().toISOString(),
              data,
              method: 'rpc_function'
            };
          }
        } catch (e) {
          devLogger.addLog('WARN', `Could not fetch fresh schema: ${e.message}`, 'system');
        }
      }

      // Phase 1: Determine app type
      const appType = process.env.REACT_APP_PORTAL === "customer"
        ? "customer-portal"
        : "tradesmate-pro";

      // Phase 3: Updated JSON structure with fix history
      const debugBundle = {
        timestamp: new Date().toISOString(),
        app: appType,
        user: user?.email || null,
        company: company?.name || null,
        userAgent: navigator.userAgent,
        url: window.location.href,
        logs: logs.slice(-500),
        apiRequests: apiRequests.slice(-100),
        errors: errors.slice(-50),
        dbStatus: dbStatus || { status: "unknown", latency: 0, recordCount: 0 },
        schemaData: currentSchema || { tables: [], totalTables: 0, totalColumns: 0 },
        systemHealth: systemHealth || { database: "unknown", auth: "unknown", storage: "unknown", realTime: "unknown" },
        uiSnapshots: uiSnapshots,
        validatorResults: validatorResults,
        fixHistory: window.__FIX_RESULTS__ || fixResults
      };

      setDebugBundle(debugBundle);

      // Phase 1: Filename format
      const timestamp = Date.now();
      const filename = `debug-bundle-${appType}-${timestamp}.json`;

      // Auto-download the bundle
      const blob = new Blob([JSON.stringify(debugBundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      // Phase 1: Required log message
      devLogger.addLog('INFO', `✅ Debug bundle exported with ${debugBundle.logs.length} logs, ${debugBundle.apiRequests.length} requests, ${debugBundle.errors.length} errors`, 'system');

    } catch (err) {
      devLogger.addLog('ERROR', `❌ Failed to create debug bundle: ${err.message}`, 'system');
    }
  };

  const clearAll = () => {
    devLogger.clearLogs();
    devLogger.clearApiRequests();
    devLogger.clearErrors();
    devLogger.clearPerformance();
    setLogs([]);
    setApiRequests([]);
    setErrors([]);
    setPerformance([]);
    devLogger.addLog('INFO', 'All data cleared', 'system');
  };

  // Comprehensive system health check
  const checkSystemHealth = async () => {
    devLogger.addLog('INFO', 'Running comprehensive system health check...', 'system');

    const health = {
      timestamp: new Date().toISOString()
    };

    // Database health
    try {
      const dbStart = Date.now();
      const { error } = await supabase.from('companies').select('id', { head: true });
      const dbLatency = Date.now() - dbStart;

      health.database = {
        status: error ? 'error' : 'ok',
        latency: dbLatency,
        message: error ? error.message : 'Database connection healthy',
        error: error?.message
      };
    } catch (err) {
      health.database = {
        status: 'error',
        message: 'Database connection failed',
        error: err.message
      };
    }

    // Storage health (Supabase Storage)
    try {
      const { data, error } = await supabase.storage.listBuckets();
      health.storage = {
        status: error ? 'error' : 'ok',
        message: error ? error.message : 'Storage access healthy',
        buckets: data?.length || 0,
        error: error?.message
      };
    } catch (err) {
      health.storage = {
        status: 'error',
        message: 'Storage access failed',
        error: err.message
      };
    }

    // Auth health
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      health.auth = {
        status: error ? 'error' : 'ok',
        hasSession: !!session,
        userId: session?.user?.id,
        expiresAt: session?.expires_at,
        message: error ? error.message : 'Authentication healthy',
        error: error?.message
      };
    } catch (err) {
      health.auth = {
        status: 'error',
        message: 'Auth check failed',
        error: err.message
      };
    }

    // Real-time monitoring health
    health.realTime = {
      status: isRealTimeEnabled ? 'active' : 'paused',
      logsCount: logs.length,
      apiRequestsCount: apiRequests.length,
      errorsCount: errors.length,
      message: isRealTimeEnabled ? 'Real-time monitoring active' : 'Real-time monitoring paused'
    };

    // Memory usage
    if (performance.memory) {
      const memory = performance.memory;
      health.memory = {
        status: 'ok',
        usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        usagePercent: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      };
    }

    setSystemHealth(health);

    const healthyServices = Object.values(health).filter(service =>
      typeof service === 'object' && service.status === 'ok'
    ).length;

    devLogger.addLog('INFO', `Health check complete: ${healthyServices} services healthy`, 'system');
  };

  // Phase 2: Run Validators
  const runValidators = useCallback(() => {
    devLogger.addLog('INFO', '🔍 Running validators...', 'ui');

    const state = {
      marketplace: window.__APP_STATE__?.marketplace,
      quotes: window.__APP_STATE__?.quotes,
      jobs: window.__APP_STATE__?.jobs,
      invoices: window.__APP_STATE__?.invoices,
      auth: window.__APP_STATE__?.auth || { user },
      systemHealth: systemHealth,
    };

    const api = {}; // placeholder, hook Supabase/API client later
    const ui = captureUISnapshot();
    setUiSnapshots(ui);

    const results = runAllValidators(state, api, ui);
    console.log("🔍 Validator Results:", results);

    results.forEach(v => {
      if (v.pass) {
        devLogger.addLog("INFO", `✅ ${v.validator} passed`, "ui");
      } else {
        devLogger.addLog("ERROR", `❌ ${v.validator} failed`, "ui");
        v.results.forEach(r => {
          if (!r.pass) {
            devLogger.addLog("ERROR", `[${r.id}] ${r.errors.join("; ")}`, "ui");
          }
        });
      }
    });

    setValidatorResults(results);
    window.__VALIDATOR_RESULTS__ = results;

    devLogger.addLog('INFO', `🔍 Validators complete: ${results.filter(r => r.pass).length}/${results.length} passed`, 'ui');
  }, [user, systemHealth]);

  // Test function for marketplace issues
  const runMarketplaceTests = useCallback(async () => {
    devLogger.addLog('INFO', '🧪 Running marketplace issue tests...', 'system');

    try {
      // Test 1: Dashboard Card Clicks
      const dashboardCards = document.querySelectorAll('.cursor-pointer');
      if (dashboardCards.length === 0) {
        const error = new Error('DASHBOARD_CARDS_NOT_FOUND: No clickable dashboard cards detected');
        if (window.capturedErrors) {
          window.capturedErrors.push({
            type: 'UI_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
            context: { test: 'dashboard_card_clicks', location: window.location.href }
          });
        }
        devLogger.addLog('ERROR', error.message, 'system');
      }

      // Test 2: Form Submission - Check for RPC endpoint
      try {
        const testResponse = await fetch('/rest/v1/rpc/submit_response_to_role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });

        if (!testResponse.ok && testResponse.status === 404) {
          const error = new Error('API_ENDPOINT_MISSING: RPC function submit_response_to_role not found');
          if (window.capturedErrors) {
            window.capturedErrors.push({
              type: 'API_ERROR',
              message: error.message,
              timestamp: new Date().toISOString(),
              context: { test: 'api_endpoints', endpoint: 'rpc/submit_response_to_role' }
            });
          }
          devLogger.addLog('ERROR', error.message, 'system');
        }
      } catch (fetchError) {
        devLogger.addLog('ERROR', `API test failed: ${fetchError.message}`, 'system');
      }

      devLogger.addLog('INFO', '✅ Marketplace tests completed', 'system');
    } catch (error) {
      devLogger.addLog('ERROR', `❌ Marketplace tests failed: ${error.message}`, 'system');
    }
  }, []);

  // Phase 3: Run Auto-Fix (JSON Handoff Mode)
  const runAutoFix = useCallback(async () => {
    if (isFixing) {
      devLogger.addLog('WARN', '🛠 Fix cycle already in progress', 'system');
      return;
    }

    setIsFixing(true);
    devLogger.addLog('INFO', '🚀 Starting Fix Cycle (JSON Handoff Mode)', 'system');

    try {
      // First run marketplace tests to generate test errors
      await runMarketplaceTests();

      const results = await runFixCycle();
      setFixResults(results);

      const proposalCount = results.reduce((sum, r) => sum + r.attempts.length, 0);
      devLogger.addLog('INFO', `🎯 Fix cycle complete: ${proposalCount} patch proposals created for ${results.length} issues`, 'system');

      console.log("🛠 Fix Cycle Results:", results);
    } catch (error) {
      devLogger.addLog('ERROR', `❌ Fix cycle failed: ${error.message}`, 'system');
    } finally {
      setIsFixing(false);
    }
  }, [isFixing, runMarketplaceTests]);

  // Phase 3: Rollback Fix
  const handleRollback = useCallback((fixId) => {
    devLogger.addLog('INFO', `🔄 Rolling back fix ${fixId}`, 'system');
    const success = rollbackFix(fixId);

    if (success) {
      devLogger.addLog('INFO', `✅ Rollback successful for ${fixId}`, 'system');
      // Refresh fix results
      const history = getFixHistory();
      setFixResults(history);
    } else {
      devLogger.addLog('ERROR', `❌ Rollback failed for ${fixId}`, 'system');
    }
  }, []);

  // Phase 1: Filtering and search functions with category support
  const getFilteredLogs = useCallback(() => {
    let filtered = logs;

    if (logFilter !== 'ALL') {
      // Phase 1: Filter by level (ERROR, WARN, INFO) or source (api, db, ui, system)
      filtered = filtered.filter(log =>
        log.level === logFilter || log.source === logFilter
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(term) ||
        log.source.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [logs, logFilter, searchTerm]);

  const getFilteredApiRequests = useCallback(() => {
    if (!searchTerm) return apiRequests;

    const term = searchTerm.toLowerCase();
    return apiRequests.filter(req =>
      req.url.toLowerCase().includes(term) ||
      req.method.toLowerCase().includes(term) ||
      (req.status && req.status.toString().includes(term))
    );
  }, [apiRequests, searchTerm]);

  const getFilteredErrors = useCallback(() => {
    if (!searchTerm) return errors;

    const term = searchTerm.toLowerCase();
    return errors.filter(error =>
      error.message.toLowerCase().includes(term) ||
      error.type.toLowerCase().includes(term)
    );
  }, [errors, searchTerm]);

  // Initialize on mount
  useEffect(() => {
    testDbConnection();
    getSchema();
    checkSystemHealth();

    // Phase 2: Run validators on load
    setTimeout(() => {
      runValidators();
    }, 2000); // Wait 2 seconds for app state to initialize

    // Start console error detection
    consoleErrorDetector.startCapture();

    // Load network requests
    loadNetworkRequests();

    // Note: Auto-sending errors is now handled globally by console-error-capture.js

    // Set up periodic network request updates
    const networkInterval = setInterval(loadNetworkRequests, 2000);

    // Initialize real-time error fixer
    if (window.realTimeErrorFixer) {
      setErrorFixer(window.realTimeErrorFixer);
      window.realTimeErrorFixer.start();
    }

    // DEBUG: Check if console capture is working
    setTimeout(() => {
      console.log('🔍 DEVELOPER TOOLS DEBUG CHECK:');
      console.log('window.capturedErrors exists:', !!window.capturedErrors);
      console.log('window.capturedErrors length:', window.capturedErrors?.length || 0);
      console.log('window.capturedWarnings length:', window.capturedWarnings?.length || 0);
      console.log('consoleErrorDetector.errors length:', consoleErrorDetector.errors?.length || 0);

      // Show actual captured errors
      if (window.capturedErrors && window.capturedErrors.length > 0) {
        console.log('🚨 CAPTURED ERRORS:');
        window.capturedErrors.forEach((error, i) => {
          if (error.type === 'HTTP_ERROR' || error.type === 'NETWORK_ERROR') {
            console.log(`${i+1}. ${error.message}`);
            if (error.url && error.url !== 'unknown') {
              console.log(`   URL: ${error.url}`);
            }
            if (error.method) {
              console.log(`   Method: ${error.method}`);
            }
            if (error.status) {
              console.log(`   Status: ${error.status} ${error.statusText || ''}`);
            }
            console.log(`   Time: ${error.timestamp}`);
          } else {
            console.log(`${i+1}. ${error.message} (${error.timestamp})`);
          }
        });
      }

      if (window.capturedWarnings && window.capturedWarnings.length > 0) {
        console.log('⚠️ CAPTURED WARNINGS:');
        window.capturedWarnings.forEach((warning, i) => {
          console.log(`${i+1}. ${warning.message} (${warning.timestamp})`);
        });
      }
    }, 2000);

    // Set up periodic health checks
    const healthInterval = setInterval(checkSystemHealth, 30000); // Every 30 seconds

    return () => {
      clearInterval(healthInterval);
      clearInterval(networkInterval);
      consoleErrorDetector.stopCapture();
      if (window.realTimeErrorFixer) {
        window.realTimeErrorFixer.stop();
      }
    };
  }, [runValidators]);

  const tabs = [
    { id: 'logs', name: 'Live Logs', icon: '📋', badge: logs.length },
    { id: 'network', name: 'Network Monitor', icon: '🌐', badge: networkRequests.length + apiRequests.length },
    { id: 'database', name: 'Database Inspector', icon: '🗄️' },
    { id: 'errors', name: 'Error Tracker', icon: '🚨', badge: errors.length },
    { id: 'console-errors', name: 'Console Errors', icon: '🔍', badge: consoleErrorDetector.errors?.length || 0 },
    { id: 'validators', name: 'Validators', icon: '🔍', badge: validatorResults.filter(r => !r.pass).length },
    { id: 'ai-fix', name: 'AI Fix Engine', icon: '🛠️', badge: fixResults.length },
    { id: 'performance', name: 'Performance', icon: '⚡', badge: performance.length },
    { id: 'auth', name: 'Auth Debugger', icon: '🔐' },
    { id: 'health', name: 'System Health', icon: '💚' },
    { id: 'export', name: 'Export Tools', icon: '📤' }
  ];

  if (!canViewDevTools) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Developer Tools</h2>
          <p className="text-gray-600">Access is restricted.</p>
          <p className="text-sm text-gray-500 mt-2">
            To enable, set REACT_APP_DEVTOOLS_ALLOWED_EMAILS to your email or run in a non-production environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="developer-tools min-h-screen bg-gray-50" data-testid="developer-tools">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🛠️ Developer Tools</h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time debugging and monitoring interface
              </p>
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                <span>📊 {logs.length} logs</span>
                <span>🌐 {apiRequests.length} requests</span>

                <span>🚨 {errors.length} errors</span>
                <span className={`px-2 py-1 rounded ${isRealTimeEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {isRealTimeEnabled ? '🟢 Live' : '⏸️ Paused'}
                </span>
                <button
                  onClick={() => {
                    console.log('🧪 Running Developer Tools Tests...');
                    runDeveloperToolsTests();
                  }}
                  className="ml-4 bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
                >
                  🧪 Run Tests
                </button>
                <button
                  onClick={() => {
                    if (window.getAllCapturedErrors) {
                      const errors = window.getAllCapturedErrors();
                      console.log('📊 Captured Console Errors:', errors);
                      const analysis = window.analyzeErrors();
                      console.log('🔬 Error Analysis:', analysis);
                    } else {
                      console.warn('Console error capture not available');
                    }
                  }}
                  className="ml-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                >
                  🔍 Analyze Errors
                </button>
                <button
                  onClick={() => {
                    if (window.exportCapturedErrors) {
                      window.exportCapturedErrors();
                    } else {
                      console.warn('Console error export not available');
                    }
                  }}
                  className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                >
                  📁 Export Errors
                </button>
                <button
                  onClick={() => {
                    if (errorFixer) {
                      const report = errorFixer.getFixReport();
                      setFixReport(report);
                      console.log('🔧 Fix Report:', report);
                    } else {
                      console.warn('Error fixer not available');
                    }
                  }}
                  className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                >
                  🔧 Get Fix Report
                </button>
                <button
                  onClick={() => {
                    if (errorFixer) {
                      errorFixer.exportFixes();
                    } else {
                      console.warn('Error fixer not available');
                    }

                  }}
                  className="ml-2 bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
                >
                  📋 Export Fixes
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                  className={`px-3 py-1 rounded text-sm ${
                    isRealTimeEnabled
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isRealTimeEnabled ? '⏸️ Pause' : '▶️ Resume'}
                </button>
                <button
                  onClick={checkSystemHealth}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={exportLogs}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  📤 Export
                </button>
                <button
                  onClick={clearAll}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search logs, API requests, errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Filter:</label>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All</option>
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
                <option value="api">api</option>
                <option value="db">db</option>
                <option value="ui">ui</option>
                <option value="system">system</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon} {tab.name}</span>
                {tab.badge > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">📋 Live Console Logs</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Showing {getFilteredLogs().length} of {logs.length} logs
                  </span>
                  <button
                    onClick={clearLogs}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div
                ref={logsRef}
                className="bg-black text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm"
              >
                {getFilteredLogs().map((log) => (
                  <div key={log.id} className={`mb-1 hover:bg-gray-900 px-1 rounded ${
                    log.level === 'ERROR' ? 'text-red-400' :
                    log.level === 'WARN' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`ml-2 px-1 rounded text-xs ${
                      log.level === 'ERROR' ? 'bg-red-900' :
                      log.level === 'WARN' ? 'bg-yellow-900' :
                      'bg-green-900'
                    }`}>
                      {log.level}
                    </span>
                    <span className="ml-2 text-blue-300">[{log.source}]</span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))}
                {getFilteredLogs().length === 0 && logs.length > 0 && (
                  <div className="text-gray-500">No logs match current filter...</div>
                )}
                {logs.length === 0 && (
                  <div className="text-gray-500">No logs captured yet. Use the application to generate logs...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-6">
            {/* Network Requests Captured by network-capture.js */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">🌐 Network Monitor (Live Capture)</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {networkRequests.length} captured requests
                  </span>
                  <button
                    onClick={loadNetworkRequests}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={clearNetworkRequests}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {networkRequests.slice(-50).map((request, index) => (
                      <tr key={`${request.timestamp}-${index}`} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {new Date(request.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            request.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            request.method === 'POST' ? 'bg-green-100 text-green-800' :
                            request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.method}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 max-w-xs truncate" title={request.url}>
                          {request.url}
                        </td>
                        <td className="px-3 py-2">
                          {request.status === 'NETWORK_ERROR' ? (
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                              Network Error
                            </span>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs ${
                              request.status >= 200 && request.status < 300 ? 'bg-green-100 text-green-800' :
                              request.status >= 400 ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate" title={request.responseBody}>
                          {request.responseBody ? request.responseBody.substring(0, 100) + (request.responseBody.length > 100 ? '...' : '') : 'No response'}
                        </td>
                      </tr>
                    ))}
                    {networkRequests.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-3 py-4 text-center text-gray-500 text-sm">
                          No network requests captured yet. Make some API calls to see them here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legacy API Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">📊 Legacy API Monitor</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {getFilteredApiRequests().length} requests
                  </span>
                  <button
                    onClick={clearApiRequests}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredApiRequests().slice(-50).map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {new Date(request.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            request.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            request.method === 'POST' ? 'bg-green-100 text-green-800' :
                            request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.method}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 max-w-xs truncate">
                          {request.url}
                        </td>
                        <td className="px-3 py-2">
                          {request.status === 'pending' ? (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          ) : request.success ? (
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                              {request.status}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                              {request.status || 'Error'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {request.duration ? `${request.duration}ms` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredApiRequests().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No API requests captured yet. Make some requests to see them here.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">🗄️ Database Inspector</h2>

              {/* Connection Status */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Connection Status</h3>
                <div className="flex items-center space-x-4">
                  {dbStatus ? (
                    <>
                      <span className={`px-2 py-1 rounded text-sm ${
                        dbStatus.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {dbStatus.status === 'connected' ? '✅ Connected' : '❌ Error'}
                      </span>
                      <span className="text-sm text-gray-600">Latency: {dbStatus.latency}ms</span>
                      {dbStatus.error && <span className="text-sm text-red-600">{dbStatus.error}</span>}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Testing connection...</span>
                  )}
                  <button
                    onClick={testDbConnection}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Test Connection
                  </button>
                </div>
              </div>

              {/* Schema Information */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Schema Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {schemaData ? (
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(schemaData, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-sm text-gray-500">Loading schema...</span>
                  )}
                </div>
                <button
                  onClick={getSchema}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Refresh Schema
                </button>
              </div>

              {/* SQL Playground */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">SQL Playground</h3>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder="Enter SQL query..."
                />
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={executeSql}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Execute Query
                  </button>
                  <span className="text-xs text-gray-500">⚠️ Read-only queries recommended</span>
                </div>

                {sqlResult && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-700 mb-2">Query Result:</h4>
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(sqlResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">🚨 Error Tracker</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {getFilteredErrors().length} errors
                  </span>
                  <button
                    onClick={clearErrors}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {getFilteredErrors().map((error, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 font-medium">
                            {error.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-red-900 mb-2">
                          {error.message}
                        </h3>
                        {error.filename && (
                          <p className="text-xs text-gray-600 mb-2">
                            File: {error.filename}
                            {error.lineno && ` (Line ${error.lineno}${error.colno ? `, Col ${error.colno}` : ''})`}
                          </p>
                        )}
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                              Stack Trace
                            </summary>
                            <pre className="mt-2 text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {getFilteredErrors().length === 0 && errors.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No errors match current filter.
                  </div>
                )}
                {errors.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No errors captured yet. This is good! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'console-errors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">🔍 Console Error Detector</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const report = consoleErrorDetector.getErrorReport();
                      console.log('📊 Console Error Report:', report);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => consoleErrorDetector.exportReport()}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Export Report
                  </button>
                  <button
                    onClick={() => consoleErrorDetector.clear()}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {(window.capturedErrors?.length || 0) + (consoleErrorDetector.errors?.length || 0)}
                  </div>
                  <div className="text-sm text-red-800">Console Errors</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {(window.capturedWarnings?.length || 0) + (consoleErrorDetector.warnings?.length || 0)}
                  </div>
                  <div className="text-sm text-yellow-800">Console Warnings</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {(window.capturedLogs?.length || 0) + (consoleErrorDetector.logs?.length || 0)}
                  </div>
                  <div className="text-sm text-blue-800">Console Logs</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Console Errors</h3>

                {/* Display captured errors from window.capturedErrors */}
                {window.capturedErrors?.slice(-10).reverse().map((error, index) => (
                  <div key={`captured-${index}`} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 font-medium">
                            {error.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-red-900 mb-2">
                          {error.message}
                        </h4>

                        {/* Enhanced details for HTTP/Network errors */}
                        {(error.type === 'HTTP_ERROR' || error.type === 'NETWORK_ERROR') && (
                          <div className="mb-2 space-y-1">
                            {error.url && error.url !== 'unknown' && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">URL:</span> <span className="font-mono break-all">{error.url}</span>
                              </p>
                            )}
                            {error.method && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Method:</span> <span className="font-mono">{error.method}</span>
                              </p>
                            )}
                            {error.status && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Status:</span> <span className="font-mono">{error.status} {error.statusText || ''}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {error.filename && (
                          <p className="text-xs text-gray-600 mb-2">
                            File: {error.filename}
                            {error.lineno && ` (Line ${error.lineno}${error.colno ? `, Col ${error.colno}` : ''})`}
                          </p>
                        )}
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                              Stack Trace
                            </summary>
                            <pre className="mt-2 text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )) || []}

                {/* Display errors from consoleErrorDetector */}
                {consoleErrorDetector.errors?.slice(-5).reverse().map((error, index) => (
                  <div key={`detector-${error.id || index}`} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 font-medium">
                            {error.category || error.level} (Detector)
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                          {error.relativeTime && (
                            <span className="text-xs text-gray-400">
                              +{error.relativeTime}ms
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-orange-900 mb-2">
                          {error.message}
                        </h4>
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                              Stack Trace
                            </summary>
                            <pre className="mt-2 text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )) || []}

                {(!window.capturedErrors || window.capturedErrors.length === 0) &&
                 (!consoleErrorDetector.errors || consoleErrorDetector.errors.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No console errors detected yet. Navigate around the app to capture errors! 🔍
                  </div>
                )}

                {/* Fix Report Display */}
                {fixReport && (
                  <div className="mt-6 border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-lg font-medium text-blue-900 mb-4">🔧 Error Fix Report</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white border border-blue-200 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{fixReport.totalFixes}</div>
                        <div className="text-sm text-blue-800">Total Fixes</div>
                      </div>
                      <div className="bg-white border border-green-200 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{fixReport.appliedFixes}</div>
                        <div className="text-sm text-green-800">Applied</div>
                      </div>
                      <div className="bg-white border border-orange-200 rounded-lg p-3">
                        <div className="text-2xl font-bold text-orange-600">{fixReport.pendingFixes}</div>
                        <div className="text-sm text-orange-800">Pending</div>
                      </div>
                    </div>

                    {Object.keys(fixReport.categories).map(category => (
                      <div key={category} className="mb-4">
                        <h5 className="font-medium text-blue-900 mb-2">
                          {category} ({fixReport.categories[category].length} fixes)
                        </h5>
                        <div className="space-y-2">
                          {fixReport.categories[category].slice(0, 3).map((fix, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  fix.applied ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {fix.applied ? '✅ Applied' : '⏳ Pending'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(fix.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{fix.fix.description}</p>
                              <p className="text-xs text-gray-600">{fix.fix.action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">⚡ Performance Monitor</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {performance.length} entries
                  </span>
                </div>
              </div>

              {/* Memory Usage */}
              {systemHealth.memory && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Memory Usage</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-blue-600 font-medium">Used</div>
                      <div className="text-blue-900">{systemHealth.memory.usedMB} MB</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Total</div>
                      <div className="text-blue-900">{systemHealth.memory.totalMB} MB</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Limit</div>
                      <div className="text-blue-900">{systemHealth.memory.limitMB} MB</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Usage</div>
                      <div className={`font-medium ${
                        systemHealth.memory.usagePercent > 80 ? 'text-red-600' :
                        systemHealth.memory.usagePercent > 60 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {systemHealth.memory.usagePercent}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Entries */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performance.slice(-50).map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 max-w-xs truncate">
                          {entry.name}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {entry.duration ? `${entry.duration.toFixed(2)}ms` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {performance.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No performance data captured yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">🔐 Auth Debugger</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Current Session</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="space-y-2 text-sm">
                      <div><strong>User ID:</strong> {user?.id || 'Not logged in'}</div>
                      <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
                      <div><strong>Company:</strong> {company?.name || 'N/A'}</div>
                      <div><strong>Company ID:</strong> {company?.id || 'N/A'}</div>
                      <div><strong>Role:</strong> {user?.role || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Auth Health</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {systemHealth.auth ? (
                      <div className="space-y-2 text-sm">
                        <div className={`px-2 py-1 rounded ${
                          systemHealth.auth.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {systemHealth.auth.status === 'ok' ? '✅ Auth OK' : '❌ Auth Error'}
                        </div>
                        {systemHealth.auth.error && (
                          <div className="text-red-600">{systemHealth.auth.error}</div>
                        )}
                        {systemHealth.auth.expiresAt && (
                          <div><strong>Session Expires:</strong> {new Date(systemHealth.auth.expiresAt * 1000).toLocaleString()}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Checking auth status...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">💚 System Health Dashboard</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(systemHealth).map(([service, health]) => (
                  <div key={service} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-2 capitalize">{service}</h3>
                    <div className={`px-2 py-1 rounded text-sm ${
                      health.status === 'ok' || health.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {health.status === 'ok' || health.status === 'connected' ? '✅ Healthy' : '❌ Error'}
                    </div>
                    {health.error && (
                      <div className="mt-2 text-sm text-red-600">{health.error}</div>
                    )}
                    {health.latency && (
                      <div className="mt-1 text-xs text-gray-500">Latency: {health.latency}ms</div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={checkSystemHealth}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Refresh Health Check
              </button>
            </div>
          </div>
        )}

        {activeTab === 'validators' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">🔍 Validators</h2>
                <button
                  onClick={runValidators}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                >
                  Run Validators
                </button>
              </div>

              <div className="space-y-4">
                {validatorResults.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No validator results yet. Click "Run Validators" to start validation.
                  </div>
                ) : (
                  validatorResults.map((validator, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      validator.pass ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {validator.pass ? '✅' : '❌'} {validator.validator}
                        </h3>
                        <span className={`px-2 py-1 rounded text-sm ${
                          validator.pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {validator.pass ? 'PASS' : 'FAIL'}
                        </span>
                      </div>

                      {validator.results.length > 0 && (
                        <div className="space-y-2">
                          {validator.results.map((result, resultIndex) => (
                            <div key={resultIndex} className={`p-2 rounded ${
                              result.pass ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <div className="font-medium text-sm">
                                {result.pass ? '✅' : '❌'} {result.title}
                              </div>
                              {result.errors.length > 0 && (
                                <div className="text-sm text-red-600 mt-1">
                                  {result.errors.map((error, errorIndex) => (
                                    <div key={errorIndex}>{error}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {uiSnapshots && Object.keys(uiSnapshots).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-700 mb-2">UI Snapshots</h3>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <pre className="text-sm text-gray-600 overflow-auto max-h-40">
                      {JSON.stringify(uiSnapshots, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai-fix' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">🛠️ AI Fix Engine (JSON Handoff Mode)</h2>
                <div className="flex gap-2">
                  <button
                    onClick={runMarketplaceTests}
                    className="px-4 py-2 rounded font-medium bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    🧪 Test Marketplace Issues
                  </button>
                  <button
                    onClick={runAutoFix}
                    disabled={isFixing}
                    className={`px-4 py-2 rounded font-medium ${
                      isFixing
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFixing ? '🔄 Processing...' : '🚀 Generate Fix Proposals'}
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>JSON Handoff Mode:</strong> This creates patch proposals in <code>/error_logs/</code> for external review.
                  No code is automatically modified.
                </p>
              </div>

              <div className="space-y-4">
                {fixResults.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No fix proposals yet. Click "Generate Fix Proposals" to analyze issues and create JSON patch files.
                  </div>
                ) : (
                  fixResults.map((fix, index) => (
                    <div key={index} className="border rounded-lg p-4 border-blue-200 bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          📝 Fix Proposal {fix.id}
                        </h3>
                        <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                          {fix.finalStatus.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Issue:</strong> {fix.issue.message}
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Type:</strong> {fix.issue.type} | <strong>Validator:</strong> {fix.issue.validator}
                      </div>

                      {fix.attempts.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">
                            Patch Proposals ({fix.attempts.length})
                          </h4>
                          <div className="space-y-2">
                            {fix.attempts.map((attempt, attemptIndex) => (
                              <div key={attemptIndex} className="p-2 rounded text-xs bg-white border">
                                <div className="font-medium text-blue-700">
                                  📄 Proposal {attempt.attempt}: {attempt.reason}
                                </div>
                                {attempt.patchProposal && (
                                  <div className="mt-1">
                                    <div className="font-medium">Suggested File:</div>
                                    <div className="bg-gray-100 p-1 rounded font-mono text-xs">
                                      {attempt.patchProposal.file}
                                    </div>
                                    <div className="text-gray-600 mt-1">
                                      {attempt.patchProposal.description}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {isFixing && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-800">Analyzing issues and generating patch proposals...</span>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">📁 Output Files</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Fix proposals are saved to <code>/error_logs/</code> directory:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <code>patch_proposal_[timestamp].json</code> - Individual patch proposals</li>
                  <li>• <code>fix_record_[timestamp].json</code> - Complete fix attempt records</li>
                  <li>• <code>fix_record_latest.json</code> - Latest fix attempt record</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">📤 Export & Debug Tools</h2>

              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Debug Data Export</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Export comprehensive debug information including logs, API requests, errors, performance data, and system health.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={exportDebugBundle}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium"
                    >
                      🚀 Export Automation Bundle
                    </button>
                    <button
                      onClick={exportLogs}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      📤 Export Debug Package
                    </button>
                    <button
                      onClick={() => {
                        const logsOnly = { timestamp: new Date().toISOString(), logs };
                        const blob = new Blob([JSON.stringify(logsOnly, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `trademate-logs-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      📋 Export Logs Only
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Console Error Debug</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Debug console error capture system and view real-time console errors.
                  </p>
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => {
                        console.log('🔍 MANUAL DEBUG CHECK:');
                        console.log('window.capturedErrors:', window.capturedErrors?.length || 0);
                        console.log('window.capturedWarnings:', window.capturedWarnings?.length || 0);
                        console.log('consoleErrorDetector.errors:', consoleErrorDetector.errors?.length || 0);

                        if (window.capturedErrors?.length > 0) {
                          console.log('🚨 RECENT ERRORS:');
                          window.capturedErrors.slice(-5).forEach((error, i) => {
                            console.log(`${i+1}. ${error.message}`);
                          });
                        }

                        if (window.capturedWarnings?.length > 0) {
                          console.log('⚠️ RECENT WARNINGS:');
                          window.capturedWarnings.slice(-5).forEach((warning, i) => {
                            console.log(`${i+1}. ${warning.message}`);
                          });
                        }
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                      🔍 Debug Console Capture
                    </button>
                    <button
                      onClick={() => {
                        if (window.testConsoleCapture) {
                          window.testConsoleCapture();
                        } else {
                          console.error('TEST ERROR: Console capture test');
                          console.warn('TEST WARNING: Console capture test');
                          console.log('TEST LOG: Console capture test');
                        }
                      }}
                      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                    >
                      🧪 Test Console Capture
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-red-600">Captured Errors</div>
                      <div className="text-2xl font-bold text-red-900">{window.capturedErrors?.length || 0}</div>
                    </div>
                    <div>
                      <div className="font-medium text-yellow-600">Captured Warnings</div>
                      <div className="text-2xl font-bold text-yellow-900">{window.capturedWarnings?.length || 0}</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">Detector Errors</div>
                      <div className="text-2xl font-bold text-blue-900">{consoleErrorDetector.errors?.length || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Current Debug Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-blue-600">Logs</div>
                      <div className="text-2xl font-bold text-blue-900">{logs.length}</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">API Requests</div>
                      <div className="text-2xl font-bold text-green-900">{apiRequests.length}</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">Errors</div>
                      <div className="text-2xl font-bold text-red-900">{errors.length}</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-600">Performance</div>
                      <div className="text-2xl font-bold text-purple-900">{performance.length}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">DB Status</div>
                      <div className={`text-sm font-medium ${
                        dbStatus?.status === 'connected' ? 'text-green-600' :
                        dbStatus?.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {dbStatus?.status || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Real-time</div>
                      <div className={`text-sm font-medium ${isRealTimeEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                        {isRealTimeEnabled ? 'Active' : 'Paused'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Clear Data</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Clear specific types of captured data or all data at once.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={clearLogs}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Clear Logs ({logs.length})
                    </button>
                    <button
                      onClick={clearApiRequests}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Clear API Requests ({apiRequests.length})
                    </button>
                    <button
                      onClick={clearErrors}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Clear Errors ({errors.length})
                    </button>
                    <button
                      onClick={clearAll}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      🗑️ Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperTools;
