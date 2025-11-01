/**
 * Console Logger - Captures console.log, console.error, console.warn to logs.md
 * Add this script to public/index.html: <script src="/console-logger.js"></script>
 */

(function() {
  const logs = [];
  const MAX_LOGS = 100;

  // Store original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  // Helper to format log entry
  function formatLog(type, args) {
    const timestamp = new Date().toISOString();
    const message = Array.from(args).map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    return {
      timestamp,
      type,
      message
    };
  }

  // Override console.log
  console.log = function(...args) {
    originalLog.apply(console, args);
    const entry = formatLog('LOG', args);
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs.shift();
    
    // Store in sessionStorage for persistence
    try {
      sessionStorage.setItem('console_logs', JSON.stringify(logs));
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Override console.error
  console.error = function(...args) {
    originalError.apply(console, args);
    const entry = formatLog('ERROR', args);
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs.shift();
    
    try {
      sessionStorage.setItem('console_logs', JSON.stringify(logs));
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Override console.warn
  console.warn = function(...args) {
    originalWarn.apply(console, args);
    const entry = formatLog('WARN', args);
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs.shift();
    
    try {
      sessionStorage.setItem('console_logs', JSON.stringify(logs));
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Add global function to download logs
  window.downloadConsoleLogs = function() {
    const logsText = logs.map(entry => {
      return `[${entry.timestamp}] ${entry.type}: ${entry.message}`;
    }).join('\n\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Add global function to view logs
  window.viewConsoleLogs = function() {
    console.log('=== CAPTURED CONSOLE LOGS ===');
    logs.forEach(entry => {
      console.log(`[${entry.timestamp}] ${entry.type}:`, entry.message);
    });
    console.log('=== END OF LOGS ===');
    console.log(`Total logs: ${logs.length}`);
    console.log('To download: window.downloadConsoleLogs()');
  };

  // Add global function to clear logs
  window.clearConsoleLogs = function() {
    logs.length = 0;
    try {
      sessionStorage.removeItem('console_logs');
    } catch (e) {
      // Ignore storage errors
    }
    console.log('Console logs cleared');
  };

  // Restore logs from sessionStorage on page load
  try {
    const stored = sessionStorage.getItem('console_logs');
    if (stored) {
      const parsed = JSON.parse(stored);
      logs.push(...parsed);
      console.log(`Restored ${logs.length} console logs from session`);
    }
  } catch (e) {
    // Ignore restore errors
  }

  console.log('✅ Console logger initialized');
  console.log('📋 Commands:');
  console.log('  - window.viewConsoleLogs() - View all captured logs');
  console.log('  - window.downloadConsoleLogs() - Download logs as text file');
  console.log('  - window.clearConsoleLogs() - Clear all logs');
})();

