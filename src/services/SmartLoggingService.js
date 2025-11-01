/**
 * Smart Logging Service
 * Captures console logs and makes them available for AI analysis
 * Auto-exports logs to files that AI can read
 */

class SmartLoggingService {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.exportInterval = 5000; // Export every 5 seconds
    this.logFile = 'error_logs/smart_logs_latest.json';
    this.isCapturing = false;
    
    // Categories for filtering
    this.categories = {
      quote: [],
      labor: [],
      lineItems: [],
      database: [],
      api: [],
      error: [],
      debug: []
    };
  }

  /**
   * Start capturing console logs
   */
  startCapture() {
    if (this.isCapturing) return;
    
    this.isCapturing = true;
    console.log('📊 Smart Logging Service started - AI can now read console logs');
    
    // Intercept console methods
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };

    // Override console.log
    console.log = (...args) => {
      this.captureLog('log', args);
      this.originalConsole.log.apply(console, args);
    };

    // Override console.error
    console.error = (...args) => {
      this.captureLog('error', args);
      this.originalConsole.error.apply(console, args);
    };

    // Override console.warn
    console.warn = (...args) => {
      this.captureLog('warn', args);
      this.originalConsole.warn.apply(console, args);
    };

    // Override console.info
    console.info = (...args) => {
      this.captureLog('info', args);
      this.originalConsole.info.apply(console, args);
    };

    // Override console.debug
    console.debug = (...args) => {
      this.captureLog('debug', args);
      this.originalConsole.debug.apply(console, args);
    };

    // Start auto-export
    this.startAutoExport();
  }

  /**
   * Capture a log entry
   */
  captureLog(level, args) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.formatMessage(args),
      raw: args,
      category: this.categorizeLog(args)
    };

    this.logs.push(logEntry);
    
    // Add to category
    if (logEntry.category && this.categories[logEntry.category]) {
      this.categories[logEntry.category].push(logEntry);
    }

    // Trim if too many logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Format log message from arguments
   */
  formatMessage(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  /**
   * Categorize log based on content
   */
  categorizeLog(args) {
    const message = this.formatMessage(args).toLowerCase();
    
    if (message.includes('quote') || message.includes('🔧')) return 'quote';
    if (message.includes('labor') || message.includes('laborrows')) return 'labor';
    if (message.includes('line item') || message.includes('quote_items')) return 'lineItems';
    if (message.includes('database') || message.includes('supabase')) return 'database';
    if (message.includes('api') || message.includes('fetch')) return 'api';
    if (message.includes('error') || message.includes('❌')) return 'error';
    if (message.includes('debug') || message.includes('🔍')) return 'debug';
    
    return 'general';
  }

  /**
   * Start auto-export to file
   */
  startAutoExport() {
    setInterval(() => {
      this.exportToFile();
    }, this.exportInterval);
  }

  /**
   * Export logs to file for AI to read
   */
  async exportToFile() {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalLogs: this.logs.length,
      categories: Object.keys(this.categories).reduce((acc, key) => {
        acc[key] = this.categories[key].length;
        return acc;
      }, {}),
      recentLogs: this.logs.slice(-100), // Last 100 logs
      categorizedLogs: this.categories
    };

    try {
      // Send to error server for file export
      await fetch('http://localhost:4000/export-smart-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });
    } catch (error) {
      // Silently fail if error server not available
    }
  }

  /**
   * Get logs for AI analysis
   */
  getLogsForAI(options = {}) {
    const {
      category = null,
      level = null,
      since = null,
      limit = 100
    } = options;

    let filtered = this.logs;

    // Filter by category
    if (category && this.categories[category]) {
      filtered = this.categories[category];
    }

    // Filter by level
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    // Filter by time
    if (since) {
      const sinceTime = new Date(since).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= sinceTime);
    }

    // Limit results
    return filtered.slice(-limit);
  }

  /**
   * Get summary for AI
   */
  getSummary() {
    return {
      totalLogs: this.logs.length,
      categories: Object.keys(this.categories).reduce((acc, key) => {
        acc[key] = this.categories[key].length;
        return acc;
      }, {}),
      recentErrors: this.categories.error.slice(-10),
      recentQuoteLogs: this.categories.quote.slice(-20),
      recentLaborLogs: this.categories.labor.slice(-20),
      recentLineItemLogs: this.categories.lineItems.slice(-20)
    };
  }

  /**
   * Search logs
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
    Object.keys(this.categories).forEach(key => {
      this.categories[key] = [];
    });
  }

  /**
   * Stop capturing
   */
  stopCapture() {
    if (!this.isCapturing) return;
    
    // Restore original console methods
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
    
    this.isCapturing = false;
    console.log('📊 Smart Logging Service stopped');
  }
}

// Export singleton
const smartLoggingService = new SmartLoggingService();

// Auto-start if in development
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  smartLoggingService.startCapture();
}

export default smartLoggingService;

