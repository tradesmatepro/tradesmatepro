/**
 * Console Error Capture Script
 * This script runs immediately when the page loads to capture all console errors
 * It can be loaded via script tag to capture errors from the very beginning
 */

(function() {
  // Optional runtime-configured DevTools API base URL; when not provided, network sends are disabled
  const DEVTOOLS_API_BASE = (window.REACT_APP_DEVTOOLS_API_URL || window.localStorage.getItem('DEVTOOLS_API_BASE') || '');
  // Storage for captured errors
  window.capturedErrors = [];
  window.capturedWarnings = [];
  window.capturedLogs = [];

  // Enhanced spam detection and frequency tracking
  window.messageFrequency = new Map();
  window.spamThreshold = 10; // Messages repeated more than this are considered spam
  window.spamTimeWindow = 5000; // 5 seconds
  
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

  // Enhanced spam detection function
  function detectSpam(message, timestamp) {
    const now = new Date(timestamp).getTime();
    const messageKey = message.substring(0, 100); // Use first 100 chars as key

    if (!window.messageFrequency.has(messageKey)) {
      window.messageFrequency.set(messageKey, []);
    }

    const timestamps = window.messageFrequency.get(messageKey);

    // Remove old timestamps outside the time window
    const recentTimestamps = timestamps.filter(ts => now - ts < window.spamTimeWindow);
    recentTimestamps.push(now);

    window.messageFrequency.set(messageKey, recentTimestamps);

    // Check if this message is spam
    if (recentTimestamps.length > window.spamThreshold) {
      return {
        isSpam: true,
        frequency: recentTimestamps.length,
        timeWindow: window.spamTimeWindow,
        pattern: messageKey
      };
    }

    return { isSpam: false, frequency: recentTimestamps.length };
  }

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

    // ENHANCED: Capture more types of issues, not just errors
    const shouldCapture = !message.includes('📊 Captured errors:') &&
                         !message.includes('✅ Logged') &&
                         !message.includes('✅ Sent') &&
                         !message.includes('🚀 Starting global auto-send') &&
                         !message.includes('⚠️ Auto-send disabled');

    if (shouldCapture) {
      // Detect potential issues in console.log messages
      let logType = 'LOG';
      let severity = 'info';

      // Check for spam patterns (like SLOT ADDED)
      if (message.includes('SLOT ADDED') || message.includes('CONFLICT DETECTED')) {
        logType = 'SPAM_DETECTED';
        severity = 'warning';
      }

      // Check for performance issues
      if (message.includes('slow') || message.includes('timeout') || message.includes('performance')) {
        logType = 'PERFORMANCE_ISSUE';
        severity = 'warning';
      }

      // Check for API/network issues
      if (message.includes('404') || message.includes('500') || message.includes('failed to fetch')) {
        logType = 'NETWORK_ISSUE';
        severity = 'error';
      }

      window.capturedLogs.push({
        timestamp,
        message,
        args: args,
        type: logType,
        severity,
        source: 'console.log'
      });
    }

    // Call original method
    originalConsole.log.apply(console, args);
  };

  // Enhanced console.warn capture
  console.warn = function(...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => safeStringify(arg)).join(' ');

    // Enhanced warning detection
    let issueType = 'WARN';
    if (message.includes('deprecated') || message.includes('legacy')) {
      issueType = 'DEPRECATED_CODE';
    } else if (message.includes('performance') || message.includes('slow')) {
      issueType = 'PERFORMANCE_WARNING';
    } else if (message.includes('memory') || message.includes('leak')) {
      issueType = 'MEMORY_WARNING';
    }

    window.capturedLogs.push({
      timestamp,
      message,
      args: args,
      type: issueType,
      severity: 'warning',
      source: 'console.warn'
    });

    // Call original method
    originalConsole.warn.apply(console, args);
  };

  // Enhanced console.error capture
  console.error = function(...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => safeStringify(arg)).join(' ');

    // Enhanced error detection
    let issueType = 'ERROR';
    if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
      issueType = 'NETWORK_ERROR';
    } else if (message.includes('database') || message.includes('sql') || message.includes('supabase')) {
      issueType = 'DATABASE_ERROR';
    } else if (message.includes('auth') || message.includes('permission') || message.includes('unauthorized')) {
      issueType = 'AUTH_ERROR';
    } else if (message.includes('validation') || message.includes('schema') || message.includes('required')) {
      issueType = 'VALIDATION_ERROR';
    }

    window.capturedLogs.push({
      timestamp,
      message,
      args: args,
      type: issueType,
      severity: 'error',
      source: 'console.error'
    });

    // Call original method
    originalConsole.error.apply(console, args);
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

    return originalFetch.apply(this, args).then(async response => {
      // Capture HTTP error responses (400, 500, etc.)
      if (!response.ok) {
        // Suppress 404 errors for non-existent tables (user_permissions, etc.)
        // These are expected and handled gracefully by the application
        if (response.status === 404 && url.includes('user_permissions')) {
          return response;
        }

        let bodyText = '';
        try {
          bodyText = await response.clone().text();
        } catch (e) {
          bodyText = '[unable to read body]';
        }
        const errObj = {
          type: 'HTTP_ERROR',
          message: `${method} ${url} ${response.status} (${response.statusText})`,
          url: url,
          method: method,
          status: response.status,
          statusText: response.statusText,
          body: bodyText,
          timestamp: new Date().toISOString()
        };
        window.capturedErrors.push(errObj);
        console.error('HTTP_ERROR_DETAIL', errObj);
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

  // 🔥 Enhanced error reporting with spam detection and analysis
  function sendErrors() {
    const allCapturedData = {
      errors: window.capturedErrors || [],
      warnings: window.capturedWarnings || [],
      logs: window.capturedLogs || [],
      timestamp: new Date().toISOString(),
      totalCount: (window.capturedErrors?.length || 0) + (window.capturedWarnings?.length || 0) + (window.capturedLogs?.length || 0)
    };

    if (allCapturedData.totalCount === 0) {
      console.log("ℹ️ No errors, warnings, or logs captured yet");
      return;
    }

    // Analyze for spam patterns
    const spamAnalysis = analyzeSpamPatterns();
    allCapturedData.spamAnalysis = spamAnalysis;

    // Send to server (only if configured)
    if (!DEVTOOLS_API_BASE) {
      console.warn('ℹ️ DevTools error server not configured; skipping send');
      console.log("📊 Captured data (no server configured):", allCapturedData);
      return;
    }
    fetch(`${DEVTOOLS_API_BASE}/save-errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allCapturedData.errors.concat(allCapturedData.warnings).concat(allCapturedData.logs))
    }).then(response => {
      if (response.ok) {
        console.log("✅ Sent", allCapturedData.totalCount, "captured items to error server");
        if (spamAnalysis.spamDetected) {
          console.warn("🚨 SPAM DETECTED:", spamAnalysis.spamPatterns.length, "spam patterns found");
          spamAnalysis.spamPatterns.forEach(pattern => {
            console.warn(`   → "${pattern.message}" repeated ${pattern.count} times`);
          });
        }
      } else {
        console.error("❌ Failed to send errors to server");
      }
    }).catch(error => {
      console.error("❌ Error sending to server:", error.message);
      // Fallback: log to console
      console.log("📊 Captured data (server failed):", allCapturedData);
    });
  }

  // Analyze spam patterns in captured data
  function analyzeSpamPatterns() {
    const patterns = new Map();
    const allMessages = [
      ...(window.capturedErrors || []),
      ...(window.capturedWarnings || []),
      ...(window.capturedLogs || [])
    ];

    allMessages.forEach(item => {
      const key = item.message?.substring(0, 100) || 'unknown';
      if (!patterns.has(key)) {
        patterns.set(key, { message: key, count: 0, type: item.type, timestamps: [] });
      }
      const pattern = patterns.get(key);
      pattern.count++;
      pattern.timestamps.push(item.timestamp);
    });

    const spamPatterns = Array.from(patterns.values()).filter(p => p.count > window.spamThreshold);

    return {
      spamDetected: spamPatterns.length > 0,
      spamPatterns: spamPatterns,
      totalPatterns: patterns.size,
      threshold: window.spamThreshold
    };
  }

  // 🚀 GLOBAL AUTO-SEND: Only enabled when a DevTools API base is configured
  if (DEVTOOLS_API_BASE) {
    console.log(`✅ Auto-send of errors enabled (sending to ${DEVTOOLS_API_BASE}/save-errors)`);
  } else {
    console.log('ℹ️ Auto-send of errors disabled (no DEVTOOLS_API_BASE configured)');
  }

  const autoSendErrors = async () => {
    try {
      const allCapturedData = {
        errors: window.capturedErrors || [],
        warnings: window.capturedWarnings || [],
        logs: window.capturedLogs || [],
        spamAnalysis: analyzeSpamPatterns ? analyzeSpamPatterns() : { spamDetected: false, spamPatterns: [] }
      };

      const totalItems = allCapturedData.errors.length + allCapturedData.warnings.length + allCapturedData.logs.length;

      if (totalItems > 0) {
        if (!DEVTOOLS_API_BASE) return; // Skip if not configured
        const response = await fetch(`${DEVTOOLS_API_BASE}/save-errors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allCapturedData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Sent ${totalItems} items to error server (${result.file})`);
        } else {
          console.warn(`⚠️ Error server responded with ${response.status}`);
        }
      } else {
        console.log("📝 No errors to send");
      }
    } catch (err) {
      console.warn("⚠️ Failed to auto-send errors:", err.message);
    }
  };

  // ✅ ENABLED: Auto-send errors every 30 seconds when configured
  if (DEVTOOLS_API_BASE) {
    setTimeout(autoSendErrors, 2000);
    setInterval(autoSendErrors, 30000);
  }

  // Make sendErrors available globally for manual testing
  window.sendErrors = sendErrors;

  console.log('🔍 Console Error Capture initialized');
  console.log('📊 Use getAllCapturedErrors() to see captured errors');
  console.log('📁 Use exportCapturedErrors() to download error report');
  console.log('🔬 Use analyzeErrors() to get error analysis and fixes');
  console.log('🧪 Run window.testConsoleCapture() to test capture functionality');
})();
