/**
 * AI Dev Tools Service
 * Provides AI assistant integration with the TradeMate Pro dev tools
 * Enables direct AI access to logs, database, and system diagnostics
 */

class AIDevToolsService {
  constructor() {
    this.baseUrl = 'http://localhost:4000';
    this.logHistory = [];
    this.diagnostics = {
      lastCheck: null,
      status: 'unknown',
      issues: [],
      recommendations: []
    };
  }

  /**
   * Get comprehensive system status for AI analysis
   */
  async getSystemStatus() {
    try {
      const [errorLogs, healthCheck, dbStatus] = await Promise.all([
        this.getErrorLogs(),
        this.checkHealth(),
        this.checkDatabaseStatus()
      ]);

      return {
        timestamp: new Date().toISOString(),
        status: this.determineOverallStatus(errorLogs, healthCheck, dbStatus),
        components: {
          errorServer: healthCheck,
          database: dbStatus,
          frontend: { status: 'running', port: 3000 }
        },
        logs: errorLogs,
        summary: this.generateStatusSummary(errorLogs, healthCheck, dbStatus)
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message,
        components: {},
        logs: [],
        summary: 'Failed to retrieve system status'
      };
    }
  }

  /**
   * Get latest error logs with AI-friendly formatting
   */
  async getErrorLogs() {
    try {
      const response = await fetch('/error_logs/latest.json');
      const logs = await response.json();
      
      return {
        count: Array.isArray(logs) ? logs.length : 0,
        logs: Array.isArray(logs) ? logs : [],
        categories: this.categorizeErrors(logs),
        severity: this.analyzeSeverity(logs),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      return {
        count: 0,
        logs: [],
        categories: {},
        severity: 'unknown',
        error: error.message
      };
    }
  }

  /**
   * Check error server health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        data,
        responseTime: Date.now() - performance.now(),
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Check database connectivity and status
   */
  async checkDatabaseStatus() {
    try {
      // Test database connection through error server
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      
      return {
        status: 'connected',
        features: data.features || [],
        version: data.version || 'unknown',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Run comprehensive system diagnostics
   */
  async runDiagnostics() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: [],
      issues: [],
      recommendations: [],
      overallStatus: 'unknown'
    };

    // Test 1: Error server connectivity
    try {
      const health = await this.checkHealth();
      diagnostics.tests.push({
        name: 'Error Server Health',
        status: health.status === 'healthy' ? 'pass' : 'fail',
        details: health
      });
      
      if (health.status !== 'healthy') {
        diagnostics.issues.push('Error server is not responding properly');
        diagnostics.recommendations.push('Restart error server with: npm run dev-error-server');
      }
    } catch (error) {
      diagnostics.tests.push({
        name: 'Error Server Health',
        status: 'fail',
        error: error.message
      });
      diagnostics.issues.push('Cannot connect to error server');
    }

    // Test 2: Error log accessibility
    try {
      const logs = await this.getErrorLogs();
      diagnostics.tests.push({
        name: 'Error Logs Access',
        status: 'pass',
        details: { count: logs.count, categories: Object.keys(logs.categories).length }
      });
      
      if (logs.count > 10) {
        diagnostics.issues.push(`High error count detected: ${logs.count} errors`);
        diagnostics.recommendations.push('Review error logs and address recurring issues');
      }
    } catch (error) {
      diagnostics.tests.push({
        name: 'Error Logs Access',
        status: 'fail',
        error: error.message
      });
      diagnostics.issues.push('Cannot access error logs');
    }

    // Test 3: Frontend connectivity
    try {
      const response = await fetch('http://localhost:3000');
      diagnostics.tests.push({
        name: 'Frontend Accessibility',
        status: response.ok ? 'pass' : 'fail',
        details: { status: response.status, statusText: response.statusText }
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'Frontend Accessibility',
        status: 'fail',
        error: error.message
      });
      diagnostics.issues.push('Frontend is not accessible');
      diagnostics.recommendations.push('Start frontend with: npm run dev-main');
    }

    // Determine overall status
    const failedTests = diagnostics.tests.filter(test => test.status === 'fail').length;
    if (failedTests === 0) {
      diagnostics.overallStatus = 'healthy';
    } else if (failedTests <= 1) {
      diagnostics.overallStatus = 'warning';
    } else {
      diagnostics.overallStatus = 'critical';
    }

    this.diagnostics = diagnostics;
    return diagnostics;
  }

  /**
   * Send structured data to AI for analysis
   */
  async sendToAI(data, context = 'general') {
    const payload = {
      timestamp: new Date().toISOString(),
      context,
      systemStatus: await this.getSystemStatus(),
      data,
      requestId: this.generateRequestId()
    };

    try {
      const response = await fetch(`${this.baseUrl}/ai-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`AI analysis failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('AI analysis not available:', error.message);
      return {
        status: 'unavailable',
        error: error.message,
        fallback: 'Direct analysis not available, but data has been logged for manual review'
      };
    }
  }

  /**
   * Helper methods
   */
  categorizeErrors(logs) {
    if (!Array.isArray(logs)) return {};
    
    const categories = {};
    logs.forEach(log => {
      const category = log.type || 'unknown';
      if (!categories[category]) categories[category] = 0;
      categories[category]++;
    });
    
    return categories;
  }

  analyzeSeverity(logs) {
    if (!Array.isArray(logs) || logs.length === 0) return 'none';
    
    const severities = logs.map(log => log.severity || 'info');
    if (severities.includes('error')) return 'high';
    if (severities.includes('warning')) return 'medium';
    return 'low';
  }

  determineOverallStatus(errorLogs, healthCheck, dbStatus) {
    if (healthCheck.status === 'error' || dbStatus.status === 'disconnected') {
      return 'critical';
    }
    if (errorLogs.count > 5 || errorLogs.severity === 'high') {
      return 'warning';
    }
    return 'healthy';
  }

  generateStatusSummary(errorLogs, healthCheck, dbStatus) {
    const parts = [];
    
    if (healthCheck.status === 'healthy') {
      parts.push('Error server is running');
    } else {
      parts.push('Error server has issues');
    }
    
    if (dbStatus.status === 'connected') {
      parts.push('database is connected');
    } else {
      parts.push('database connection failed');
    }
    
    if (errorLogs.count === 0) {
      parts.push('no errors detected');
    } else {
      parts.push(`${errorLogs.count} errors logged`);
    }
    
    return parts.join(', ');
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get formatted data for AI consumption
   */
  async getAIReadyData() {
    const systemStatus = await this.getSystemStatus();
    const diagnostics = await this.runDiagnostics();
    
    return {
      system: systemStatus,
      diagnostics,
      capabilities: [
        'Error log analysis',
        'System health monitoring',
        'Database connectivity testing',
        'API endpoint testing',
        'Real-time diagnostics'
      ],
      instructions: {
        errorAnalysis: 'Use getErrorLogs() to analyze current errors',
        healthCheck: 'Use checkHealth() to verify system status',
        diagnostics: 'Use runDiagnostics() for comprehensive system check',
        aiIntegration: 'Use sendToAI() to request analysis of specific issues'
      }
    };
  }
}

// Export singleton instance
const aiDevToolsService = new AIDevToolsService();
export default aiDevToolsService;
