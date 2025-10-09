import { supabase } from '../utils/supabaseClient';

/**
 * Comprehensive Developer Tools Service
 * Provides remote debugging, monitoring, and control capabilities
 */
class DevToolsService {
  constructor() {
    this.isConnected = false;
    this.websocket = null;
    this.listeners = [];
    this.debugSession = null;
  }

  /**
   * Initialize remote debugging capabilities
   */
  async initialize() {
    try {
      // Create debug session
      this.debugSession = {
        id: `debug_${Date.now()}`,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      // Set up WebSocket for real-time communication (if available)
      this.setupWebSocket();

      // Set up database monitoring
      this.setupDatabaseMonitoring();

      // Set up environment inspection
      this.setupEnvironmentInspection();

      console.log('🛠️ DevTools Service initialized', this.debugSession);
      return true;
    } catch (error) {
      console.error('Failed to initialize DevTools Service:', error);
      return false;
    }
  }

  /**
   * Set up WebSocket connection for real-time debugging
   */
  setupWebSocket() {
    // Note: This would connect to a WebSocket server for real-time debugging
    // For now, we'll simulate this capability
    console.log('🔌 WebSocket debugging ready (simulated)');
  }

  /**
   * Set up database monitoring and query execution
   */
  setupDatabaseMonitoring() {
    this.databaseMonitor = {
      queryCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      lastQuery: null
    };
  }

  /**
   * Set up environment inspection
   */
  setupEnvironmentInspection() {
    this.environment = {
      nodeEnv: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
      localStorage: this.getLocalStorageInfo(),
      sessionStorage: this.getSessionStorageInfo(),
      cookies: this.getCookiesInfo()
    };
  }

  /**
   * Execute database query with monitoring
   */
  async executeQuery(query, params = {}) {
    const startTime = Date.now();
    this.databaseMonitor.queryCount++;

    try {
      let result;
      const queryLower = query.toLowerCase().trim();

      if (queryLower.startsWith('select')) {
        // Handle SELECT queries
        if (queryLower.includes('from companies')) {
          const { data, error, count } = await supabase
            .from('companies')
            .select('*', { count: 'exact' })
            .limit(params.limit || 10);
          
          if (error) throw error;
          result = { data, count, table: 'companies' };
        } else if (queryLower.includes('from profiles')) {
          const { data, error, count } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, company_id', { count: 'exact' })
            .limit(params.limit || 10);

          if (error) throw error;
          result = { data, count, table: 'profiles' };
        } else if (queryLower.includes('from customers')) {
          const { data, error, count } = await supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .limit(params.limit || 10);
          
          if (error) throw error;
          result = { data, count, table: 'customers' };
        } else {
          throw new Error('Query not supported. Use: companies, users, or customers');
        }
      } else {
        throw new Error('Only SELECT queries are allowed for security');
      }

      const duration = Date.now() - startTime;
      this.databaseMonitor.avgResponseTime = 
        (this.databaseMonitor.avgResponseTime + duration) / 2;
      this.databaseMonitor.lastQuery = {
        query,
        duration,
        timestamp: new Date().toISOString(),
        success: true
      };

      return {
        success: true,
        data: result,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.databaseMonitor.errorCount++;
      this.databaseMonitor.lastQuery = {
        query,
        duration,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };

      return {
        success: false,
        error: error.message,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get comprehensive system information
   */
  async getSystemInfo() {
    const info = {
      timestamp: new Date().toISOString(),
      session: this.debugSession,
      environment: this.environment,
      database: this.databaseMonitor,
      performance: this.getPerformanceInfo(),
      memory: this.getMemoryInfo(),
      network: this.getNetworkInfo(),
      storage: await this.getStorageInfo()
    };

    return info;
  }

  /**
   * Get performance information
   */
  getPerformanceInfo() {
    if (!performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : null,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : null,
      firstPaint: this.getFirstPaint(),
      resourceCount: performance.getEntriesByType('resource').length
    };
  }

  /**
   * Get first paint timing
   */
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  /**
   * Get memory information
   */
  getMemoryInfo() {
    if (!performance.memory) return null;

    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      online: navigator.onLine,
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      } : null
    };
  }

  /**
   * Get storage information
   */
  async getStorageInfo() {
    try {
      const estimate = await navigator.storage?.estimate();
      return {
        quota: estimate?.quota,
        usage: estimate?.usage,
        usagePercent: estimate ? Math.round((estimate.usage / estimate.quota) * 100) : null,
        localStorage: this.getLocalStorageInfo(),
        sessionStorage: this.getSessionStorageInfo()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get localStorage information
   */
  getLocalStorageInfo() {
    try {
      const keys = Object.keys(localStorage);
      return {
        itemCount: keys.length,
        keys: keys,
        totalSize: JSON.stringify(localStorage).length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get sessionStorage information
   */
  getSessionStorageInfo() {
    try {
      const keys = Object.keys(sessionStorage);
      return {
        itemCount: keys.length,
        keys: keys,
        totalSize: JSON.stringify(sessionStorage).length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get cookies information
   */
  getCookiesInfo() {
    try {
      const cookies = document.cookie.split(';').filter(cookie => cookie.trim());
      return {
        count: cookies.length,
        cookies: cookies.map(cookie => {
          const [name] = cookie.trim().split('=');
          return name;
        })
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    const startTime = Date.now();
    
    try {
      const { data, error, count } = await supabase
        .from('companies')
        .select('id', { count: 'exact', head: true });

      if (error) throw error;

      const latency = Date.now() - startTime;
      return {
        success: true,
        latency,
        recordCount: count,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        latency,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get database schema information
   */
  async getDatabaseSchema() {
    try {
      // Try to get schema information
      const tables = [
        'companies', 'users', 'customers', 'work_orders', 'quotes',
        'inventory_items', 'employees', 'employee_timesheets', 'invoices',
        'vendors', 'settings', 'documents', 'messages', 'notifications',
        'pto_policies', 'pto_ledger', 'employee_pto_balances'
      ];

      const schemaInfo = {
        timestamp: new Date().toISOString(),
        tables: tables,
        totalTables: tables.length,
        note: 'Basic table list - full schema inspection requires additional permissions'
      };

      return schemaInfo;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Export comprehensive debug data
   */
  async exportDebugData(additionalData = {}) {
    const systemInfo = await this.getSystemInfo();
    
    const debugData = {
      exportTimestamp: new Date().toISOString(),
      systemInfo,
      ...additionalData
    };

    return debugData;
  }
}

// Create singleton instance
const devToolsService = new DevToolsService();

export default devToolsService;
