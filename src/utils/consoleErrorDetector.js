/**
 * Console Error Detection and Reporting Utility
 * Automatically captures and categorizes all console errors, warnings, and issues
 */

class ConsoleErrorDetector {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.logs = [];
    this.networkErrors = [];
    this.reactErrors = [];
    this.isCapturing = false;
    this.originalConsole = {};
    this.startTime = Date.now();
  }

  /**
   * Start capturing console output
   */
  startCapture() {
    if (this.isCapturing) return;
    
    this.isCapturing = true;
    this.startTime = Date.now();
    
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };

    // Override console methods
    console.error = (...args) => {
      this.captureError('ERROR', args);
      this.originalConsole.error.apply(console, args);
    };

    console.warn = (...args) => {
      this.captureError('WARN', args);
      this.originalConsole.warn.apply(console, args);
    };

    console.log = (...args) => {
      this.captureLog('LOG', args);
      this.originalConsole.log.apply(console, args);
    };

    console.info = (...args) => {
      this.captureLog('INFO', args);
      this.originalConsole.info.apply(console, args);
    };

    console.debug = (...args) => {
      this.captureLog('DEBUG', args);
      this.originalConsole.debug.apply(console, args);
    };

    // Capture unhandled errors
    window.addEventListener('error', this.handleWindowError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    console.log('🔍 Console Error Detector started');
  }

  /**
   * Stop capturing and restore original console
   */
  stopCapture() {
    if (!this.isCapturing) return;
    
    this.isCapturing = false;
    
    // Restore original console methods
    Object.keys(this.originalConsole).forEach(method => {
      console[method] = this.originalConsole[method];
    });

    // Remove event listeners
    window.removeEventListener('error', this.handleWindowError.bind(this));
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    console.log('🔍 Console Error Detector stopped');
  }

  /**
   * Capture error messages
   */
  captureError(level, args) {
    const timestamp = Date.now();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    const errorEntry = {
      id: `${level}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp,
      relativeTime: timestamp - this.startTime,
      stack: this.getStackTrace(),
      category: this.categorizeError(message),
      args: args
    };

    if (level === 'ERROR') {
      this.errors.push(errorEntry);
    } else if (level === 'WARN') {
      this.warnings.push(errorEntry);
    }
  }

  /**
   * Safely stringify objects with circular reference protection
   */
  safeStringify(obj) {
    if (obj === null || obj === undefined) return String(obj);
    if (typeof obj !== 'object') return String(obj);

    // Handle DOM elements
    if (obj instanceof Element) {
      return `<${obj.tagName.toLowerCase()}${obj.id ? ` id="${obj.id}"` : ''}${obj.className ? ` class="${obj.className}"` : ''}>`;
    }

    // Handle NodeList
    if (obj instanceof NodeList) {
      return `NodeList(${obj.length}) [${Array.from(obj).map(el => this.safeStringify(el)).join(', ')}]`;
    }

    // Handle HTMLCollection
    if (obj instanceof HTMLCollection) {
      return `HTMLCollection(${obj.length}) [${Array.from(obj).map(el => this.safeStringify(el)).join(', ')}]`;
    }

    // Handle regular objects with circular reference protection
    try {
      return JSON.stringify(obj, (key, value) => {
        if (value instanceof Element) {
          return this.safeStringify(value);
        }
        if (value instanceof NodeList || value instanceof HTMLCollection) {
          return this.safeStringify(value);
        }
        return value;
      }, 2);
    } catch (e) {
      return `[Object: ${obj.constructor?.name || 'Unknown'} - ${e.message}]`;
    }
  }

  /**
   * Capture log messages
   */
  captureLog(level, args) {
    const timestamp = Date.now();
    const message = args.map(arg => this.safeStringify(arg)).join(' ');

    const logEntry = {
      id: `${level}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp,
      relativeTime: timestamp - this.startTime,
      category: this.categorizeLog(message),
      args: args
    };

    this.logs.push(logEntry);
  }

  /**
   * Handle window errors
   */
  handleWindowError(event) {
    const errorEntry = {
      id: `WINDOW_ERROR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level: 'ERROR',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: Date.now(),
      relativeTime: Date.now() - this.startTime,
      category: 'RUNTIME_ERROR',
      type: 'window_error'
    };

    this.errors.push(errorEntry);
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    const errorEntry = {
      id: `UNHANDLED_REJECTION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level: 'ERROR',
      message: event.reason?.message || String(event.reason),
      reason: event.reason,
      timestamp: Date.now(),
      relativeTime: Date.now() - this.startTime,
      category: 'PROMISE_REJECTION',
      type: 'unhandled_rejection'
    };

    this.errors.push(errorEntry);
  }

  /**
   * Get current stack trace
   */
  getStackTrace() {
    try {
      throw new Error();
    } catch (e) {
      return e.stack;
    }
  }

  /**
   * Categorize error messages
   */
  categorizeError(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('react') || msg.includes('jsx') || msg.includes('hook')) {
      return 'REACT_ERROR';
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('xhr')) {
      return 'NETWORK_ERROR';
    }
    if (msg.includes('supabase') || msg.includes('database') || msg.includes('sql')) {
      return 'DATABASE_ERROR';
    }
    if (msg.includes('websocket') || msg.includes('ws://')) {
      return 'WEBSOCKET_ERROR';
    }
    if (msg.includes('eslint') || msg.includes('warning')) {
      return 'LINT_WARNING';
    }
    if (msg.includes('permission') || msg.includes('auth')) {
      return 'AUTH_ERROR';
    }
    if (msg.includes('undefined') || msg.includes('null')) {
      return 'REFERENCE_ERROR';
    }
    
    return 'GENERAL_ERROR';
  }

  /**
   * Categorize log messages
   */
  categorizeLog(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('developer tools') || msg.includes('debug')) {
      return 'DEBUG_LOG';
    }
    if (msg.includes('api') || msg.includes('request')) {
      return 'API_LOG';
    }
    if (msg.includes('auth') || msg.includes('login')) {
      return 'AUTH_LOG';
    }
    
    return 'GENERAL_LOG';
  }

  /**
   * Get comprehensive error report
   */
  getErrorReport() {
    const totalRuntime = Date.now() - this.startTime;
    
    return {
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalLogs: this.logs.length,
        runtime: totalRuntime,
        captureStarted: new Date(this.startTime).toISOString()
      },
      errors: this.errors,
      warnings: this.warnings,
      logs: this.logs.slice(-50), // Last 50 logs to avoid overwhelming
      categorizedErrors: this.getCategorizedErrors(),
      topErrorCategories: this.getTopErrorCategories()
    };
  }

  /**
   * Get errors grouped by category
   */
  getCategorizedErrors() {
    const categorized = {};
    
    [...this.errors, ...this.warnings].forEach(error => {
      if (!categorized[error.category]) {
        categorized[error.category] = [];
      }
      categorized[error.category].push(error);
    });
    
    return categorized;
  }

  /**
   * Get top error categories by frequency
   */
  getTopErrorCategories() {
    const categories = {};
    
    [...this.errors, ...this.warnings].forEach(error => {
      categories[error.category] = (categories[error.category] || 0) + 1;
    });
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * Export error report as downloadable JSON
   */
  exportReport() {
    const report = this.getErrorReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-error-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return report;
  }

  /**
   * Clear all captured data
   */
  clear() {
    this.errors = [];
    this.warnings = [];
    this.logs = [];
    this.networkErrors = [];
    this.reactErrors = [];
  }
}

// Create global instance
const consoleErrorDetector = new ConsoleErrorDetector();

export default consoleErrorDetector;
