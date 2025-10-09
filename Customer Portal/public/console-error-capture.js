/**
 * Console Error Capture Script
 * This script runs immediately when the page loads to capture all console errors
 * It can be loaded via script tag to capture errors from the very beginning
 */

(function() {
  // Storage for captured errors
  window.capturedErrors = [];
  window.capturedWarnings = [];
  window.capturedLogs = [];
  
  // Store original console methods
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info,
    debug: console.debug
  };

  // Override console.error
  console.error = function(...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => safeStringify(arg)).join(' ');

    window.capturedErrors.push({
      timestamp,
      message,
      args: args,
      stack: new Error().stack,
      type: 'ERROR'
    });

    // Debug: Log to original console that we captured an error
    originalConsole.log(`🔍 CAPTURED ERROR: ${message}`);

    // Call original method
    originalConsole.error.apply(console, args);
  };

  // Override console.warn
  console.warn = function(...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => safeStringify(arg)).join(' ');

    window.capturedWarnings.push({
      timestamp,
      message,
      args: args,
      type: 'WARNING'
    });

    // Debug: Log to original console that we captured a warning
    originalConsole.log(`🔍 CAPTURED WARNING: ${message}`);

    // Call original method
    originalConsole.warn.apply(console, args);
  };

  // Helper function to safely stringify objects with circular references
  function safeStringify(obj) {
    if (obj === null || obj === undefined) return String(obj);
    if (typeof obj !== 'object') return String(obj);

    // Handle DOM elements
    if (obj instanceof Element) {
      return `<${obj.tagName.toLowerCase()}${obj.id ? ` id="${obj.id}"` : ''}${obj.className ? ` class="${obj.className}"` : ''}>`;
    }

    // Handle NodeList
    if (obj instanceof NodeList) {
      return `NodeList(${obj.length}) [${Array.from(obj).map(el => safeStringify(el)).join(', ')}]`;
    }

    // Handle HTMLCollection
    if (obj instanceof HTMLCollection) {
      return `HTMLCollection(${obj.length}) [${Array.from(obj).map(el => safeStringify(el)).join(', ')}]`;
    }

    // Handle regular objects with circular reference protection
    try {
      return JSON.stringify(obj, (key, value) => {
        if (value instanceof Element) {
          return safeStringify(value);
        }
        if (value instanceof NodeList || value instanceof HTMLCollection) {
          return safeStringify(value);
        }
        return value;
      }, 2);
    } catch (e) {
      return `[Object: ${obj.constructor?.name || 'Unknown'} - ${e.message}]`;
    }
  }

  // Override console.log
  console.log = function(...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => safeStringify(arg)).join(' ');
    
    window.capturedLogs.push({
      timestamp,
      message,
      args: args,
      type: 'LOG'
    });
    
    // Call original method
    originalConsole.log.apply(console, args);
  };

  // Capture unhandled errors
  window.addEventListener('error', function(event) {
    window.capturedErrors.push({
      timestamp: new Date().toISOString(),
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      type: 'RUNTIME_ERROR'
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    window.capturedErrors.push({
      timestamp: new Date().toISOString(),
      message: event.reason?.message || String(event.reason),
      reason: event.reason,
      type: 'PROMISE_REJECTION'
    });
  });

  // Capture network errors (fetch failures and HTTP errors)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
    const method = args[1]?.method || 'GET';

    return originalFetch.apply(this, args).then(response => {
      // Capture HTTP error responses (400, 500, etc.)
      if (!response.ok) {
        window.capturedErrors.push({
          type: 'HTTP_ERROR',
          message: `${method} ${url} ${response.status} (${response.statusText})`,
          url: url,
          method: method,
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString()
        });
      }
      return response;
    }).catch(error => {
      window.capturedErrors.push({
        type: 'NETWORK_ERROR',
        message: `${method} ${url} - Fetch failed: ${error.message}`,
        url: url,
        method: method,
        timestamp: new Date().toISOString(),
        stack: error.stack
      });
      throw error; // Re-throw to maintain normal error handling
    });
  };

  // Function to get all captured errors
  window.getAllCapturedErrors = function() {
    return {
      errors: window.capturedErrors,
      warnings: window.capturedWarnings,
      logs: window.capturedLogs,
      summary: {
        totalErrors: window.capturedErrors.length,
        totalWarnings: window.capturedWarnings.length,
        totalLogs: window.capturedLogs.length
      }
    };
  };

  // Function to export errors as JSON
  window.exportCapturedErrors = function() {
    const data = window.getAllCapturedErrors();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-errors-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return data;
  };

  // Function to clear captured errors
  window.clearCapturedErrors = function() {
    window.capturedErrors = [];
    window.capturedWarnings = [];
    window.capturedLogs = [];
  };

  // Function to analyze errors and provide fixes
  window.analyzeErrors = function() {
    const analysis = {
      categories: {},
      fixes: [],
      criticalErrors: [],
      summary: {}
    };

    // Categorize errors
    window.capturedErrors.forEach(error => {
      const msg = error.message.toLowerCase();
      let category = 'UNKNOWN';
      
      if (msg.includes('failed to load') || msg.includes('404') || msg.includes('not found')) {
        category = 'RESOURCE_NOT_FOUND';
      } else if (msg.includes('react') || msg.includes('hook') || msg.includes('jsx')) {
        category = 'REACT_ERROR';
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('cors')) {
        category = 'NETWORK_ERROR';
      } else if (msg.includes('supabase') || msg.includes('database')) {
        category = 'DATABASE_ERROR';
      } else if (msg.includes('websocket') || msg.includes('ws://')) {
        category = 'WEBSOCKET_ERROR';
      } else if (msg.includes('undefined') || msg.includes('null') || msg.includes('cannot read')) {
        category = 'REFERENCE_ERROR';
      } else if (msg.includes('syntax') || msg.includes('unexpected')) {
        category = 'SYNTAX_ERROR';
      }
      
      if (!analysis.categories[category]) {
        analysis.categories[category] = [];
      }
      analysis.categories[category].push(error);
    });

    // Generate fixes based on categories
    Object.keys(analysis.categories).forEach(category => {
      const errors = analysis.categories[category];
      
      switch(category) {
        case 'RESOURCE_NOT_FOUND':
          analysis.fixes.push({
            category,
            count: errors.length,
            fix: 'Check file paths and ensure all resources exist. Look for missing imports or incorrect file references.',
            errors: errors.slice(0, 3) // Show first 3 examples
          });
          break;
          
        case 'REACT_ERROR':
          analysis.fixes.push({
            category,
            count: errors.length,
            fix: 'Fix React Hook dependencies, component lifecycle issues, or JSX syntax errors.',
            errors: errors.slice(0, 3)
          });
          break;
          
        case 'NETWORK_ERROR':
          analysis.fixes.push({
            category,
            count: errors.length,
            fix: 'Check API endpoints, CORS settings, and network connectivity.',
            errors: errors.slice(0, 3)
          });
          break;
          
        case 'WEBSOCKET_ERROR':
          analysis.fixes.push({
            category,
            count: errors.length,
            fix: 'WebSocket connection failed - this is expected if no debug server is running.',
            errors: errors.slice(0, 3)
          });
          break;
          
        case 'REFERENCE_ERROR':
          analysis.fixes.push({
            category,
            count: errors.length,
            fix: 'Fix undefined variables, null references, or missing object properties.',
            errors: errors.slice(0, 3)
          });
          break;
      }
    });

    analysis.summary = {
      totalErrors: window.capturedErrors.length,
      totalWarnings: window.capturedWarnings.length,
      categoriesFound: Object.keys(analysis.categories).length,
      mostCommonCategory: Object.keys(analysis.categories).reduce((a, b) => 
        analysis.categories[a].length > analysis.categories[b].length ? a : b, 'NONE')
    };

    return analysis;
  };

  // Test function to verify capture is working
  window.testConsoleCapture = function() {
    originalConsole.log('🧪 Testing console capture...');
    console.error('TEST ERROR: This is a test error message');
    console.warn('TEST WARNING: This is a test warning message');
    console.log('TEST LOG: This is a test log message');
    originalConsole.log(`✅ Test complete. Captured ${window.capturedErrors.length} errors, ${window.capturedWarnings.length} warnings, ${window.capturedLogs.length} logs`);
  };

  // --- OLD Auto-export system (DISABLED - using new global auto-send instead) ---
  // (function setupAutoExport() {
    const DEFAULT_EXPORT_URL = (window.DEBUG_LOG_EXPORT_URL || 'http://localhost:3002/ingest');
    const HEALTH_URL = (window.DEBUG_LOG_HEALTH_URL || 'http://localhost:3002/health');
    const INTERVAL_MS = Number(window.DEBUG_LOG_EXPORT_INTERVAL_MS || 10000);

    const state = {
      enabled: false,
      url: DEFAULT_EXPORT_URL,
      cursor: { errors: 0, warnings: 0, logs: 0 },
      timer: null,
    };

    function sliceNew(arr, from) { return Array.isArray(arr) ? arr.slice(from) : []; }

    async function exportOnce(beaconOnly = false) {
      const errors = sliceNew(window.capturedErrors, state.cursor.errors);
      const warnings = sliceNew(window.capturedWarnings, state.cursor.warnings);
      const logs = sliceNew(window.capturedLogs, state.cursor.logs);
      if (errors.length === 0 && warnings.length === 0 && logs.length === 0) return true;

      const payload = JSON.stringify({ ts: new Date().toISOString(), errors, warnings, logs });

      try {
        if (!beaconOnly && typeof fetch === 'function') {
          const resp = await fetch(state.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
            mode: 'cors'
          });
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
        } else if (navigator.sendBeacon) {
          navigator.sendBeacon(state.url, new Blob([payload], { type: 'application/json' }));
        } else {
          return false;
        }

        state.cursor.errors = window.capturedErrors.length;
        state.cursor.warnings = window.capturedWarnings.length;
        state.cursor.logs = window.capturedLogs.length;
        return true;
      } catch (e) {
        // Keep data for next attempt
        return false;
      }
    }

    async function detectServerAndStart() {
      try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 1200);
        const resp = await fetch(HEALTH_URL, { signal: ctrl.signal, mode: 'cors' });
        clearTimeout(to);
        if (resp.ok) {
          enableAutoExport();
        }
      } catch (_) {
        // Server not found; stay disabled silently
      }
    }

    function enableAutoExport(url) {
      if (state.enabled) return;
      state.enabled = true;
      if (url) state.url = url;
      state.timer = setInterval(() => { exportOnce(false); }, INTERVAL_MS);
      window.addEventListener('beforeunload', () => { exportOnce(true); });
      originalConsole.log('📤 Auto-export of console logs enabled →', state.url);
    }

    function disableAutoExport() {
      if (!state.enabled) return;
      state.enabled = false;
      if (state.timer) clearInterval(state.timer);
      originalConsole.log('⏸️ Auto-export of console logs disabled');
    }

    // Expose controls
    window.enableAutoExport = enableAutoExport;
    window.disableAutoExport = disableAutoExport;

    // Auto-detect and start shortly after load
    // setTimeout(detectServerAndStart, 2000); // DISABLED
  // })(); // DISABLED - using new global auto-send instead

  // 🔥 Auto-send errors to error server every 30s
  function sendErrors() {
    if (window.capturedErrors.length === 0) {
      console.log("ℹ️ No errors captured yet");
      return;
    }

    fetch("http://localhost:4000/save-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(window.capturedErrors),
    })
      .then(() => console.log("✅ Sent", window.capturedErrors.length, "errors to error server"))
      .catch((err) => console.warn("⚠️ Auto-send failed", err));
  }

  // Start auto-send: immediate + every 30 seconds
  console.log("🚀 Starting global auto-send of errors every 30 seconds");
  sendErrors(); // Send immediately
  setInterval(sendErrors, 30000); // Then every 30s

  console.log('🔍 Console Error Capture initialized');
  console.log('📊 Use getAllCapturedErrors() to see captured errors');
  console.log('📁 Use exportCapturedErrors() to download error report');
  console.log('🔬 Use analyzeErrors() to get error analysis and fixes');
  console.log('🧪 Run window.testConsoleCapture() to test capture functionality');
})();
