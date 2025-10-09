(function () {
  const oldLog = console.log;
  const oldError = console.error;
  const oldWarn = console.warn;
  const oldInfo = console.info;
  const logs = [];

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

  function pushLog(type, args) {
    const logEntry = {
      type,
      message: args.map(a => safeStringify(a)).join(" "),
      timestamp: new Date().toISOString(),
      args: args // Keep original args for detailed inspection
    };
    
    logs.push(logEntry);
    window.__capturedLogs = logs;
    
    // Keep only last 1000 logs to prevent memory issues
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
  }

  console.log = function (...args) {
    pushLog("log", args);
    oldLog.apply(console, args);
  };

  console.error = function (...args) {
    pushLog("error", args);
    oldError.apply(console, args);
  };

  console.warn = function (...args) {
    pushLog("warn", args);
    oldWarn.apply(console, args);
  };

  console.info = function (...args) {
    pushLog("info", args);
    oldInfo.apply(console, args);
  };

  // Capture unhandled errors
  window.addEventListener('error', function(event) {
    pushLog("error", [`Unhandled Error: ${event.message}`, `File: ${event.filename}:${event.lineno}:${event.colno}`, event.error]);
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    pushLog("error", [`Unhandled Promise Rejection: ${event.reason}`]);
  });

  console.log('📝 Enhanced console capture initialized - all console output will be logged');
})();
