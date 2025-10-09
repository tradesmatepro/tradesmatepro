/**
 * Health Monitor
 * 
 * Monitors all AI DevTools servers and automatically restarts them if they fail
 * Provides health check endpoints and status reporting
 * 
 * Features:
 * - Periodic health checks (every 60s)
 * - Automatic server restart on failure
 * - Health status reporting
 * - Integration with session state
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const sessionState = require('./sessionState');

const ROOT = process.cwd();

/**
 * Server configurations
 */
const SERVERS = {
  errorLogger: {
    name: 'Error Logger Server',
    port: 4000,
    healthPath: '/health',
    startCommand: 'node',
    startArgs: [path.join(ROOT, 'devtools', 'local_logger_server.js')],
    process: null,
    enabled: true
  },
  commandExecutor: {
    name: 'Command Executor',
    port: null, // File watcher, no HTTP port
    healthPath: null,
    startCommand: 'node',
    startArgs: [path.join(ROOT, 'devtools', 'commandExecutor.js')],
    process: null,
    enabled: true
  },
  mainApp: {
    name: 'Main App',
    port: 3004,
    healthPath: '/',
    startCommand: null, // Managed separately
    startArgs: [],
    process: null,
    enabled: false // Don't auto-manage main app
  }
};

/**
 * Health Monitor Class
 */
class HealthMonitor {
  constructor() {
    this.checkInterval = null;
    this.checkIntervalMs = 60000; // 60 seconds
    this.isRunning = false;
  }

  /**
   * Start health monitoring
   */
  start(intervalMs = 60000) {
    if (this.isRunning) {
      console.log('⚠️ Health monitor already running');
      return;
    }

    this.checkIntervalMs = intervalMs;
    this.isRunning = true;

    console.log('🏥 Health Monitor started');
    console.log(`   Check interval: ${intervalMs / 1000}s`);

    // Initial check
    this.checkAll();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAll();
    }, intervalMs);
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Health Monitor stopped');
  }

  /**
   * Check all servers
   */
  async checkAll() {
    console.log('🔍 Running health checks...');
    
    const results = {};
    
    for (const [key, server] of Object.entries(SERVERS)) {
      if (!server.enabled) {
        results[key] = { status: 'disabled', message: 'Server not managed by health monitor' };
        continue;
      }

      const result = await this.checkServer(key);
      results[key] = result;
      
      // Update session state
      sessionState.updateServerStatus(key, result.status);
    }

    this.logResults(results);
    return results;
  }

  /**
   * Check individual server
   */
  async checkServer(serverKey) {
    const server = SERVERS[serverKey];
    
    if (!server) {
      return { status: 'unknown', message: 'Server not found' };
    }

    // For servers with HTTP endpoints
    if (server.port && server.healthPath) {
      return await this.checkHttpHealth(server);
    }
    
    // For file-based processes (like command executor)
    if (server.process) {
      return this.checkProcessHealth(server);
    }

    return { status: 'unknown', message: 'No health check method available' };
  }

  /**
   * Check HTTP server health
   */
  checkHttpHealth(server) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: server.port,
        path: server.healthPath,
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          resolve({
            status: 'healthy',
            message: `${server.name} is running`,
            port: server.port
          });
        } else {
          resolve({
            status: 'unhealthy',
            message: `${server.name} returned status ${res.statusCode}`,
            port: server.port
          });
        }
      });

      req.on('error', (err) => {
        console.log(`❌ ${server.name} is down: ${err.message}`);
        
        // Attempt restart
        this.restartServer(server);
        
        resolve({
          status: 'down',
          message: `${server.name} is not responding`,
          error: err.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 'timeout',
          message: `${server.name} health check timed out`
        });
      });

      req.end();
    });
  }

  /**
   * Check process health
   */
  checkProcessHealth(server) {
    if (server.process && !server.process.killed) {
      return {
        status: 'healthy',
        message: `${server.name} process is running`,
        pid: server.process.pid
      };
    }

    // Process not running, restart it
    console.log(`❌ ${server.name} process is not running`);
    this.restartServer(server);

    return {
      status: 'down',
      message: `${server.name} process was not running, restarting...`
    };
  }

  /**
   * Restart a server
   */
  restartServer(serverKey) {
    const server = typeof serverKey === 'string' ? SERVERS[serverKey] : serverKey;
    
    if (!server || !server.enabled) {
      console.log(`⚠️ Cannot restart ${server?.name || serverKey}: not enabled`);
      return false;
    }

    console.log(`🔄 Restarting ${server.name}...`);

    // Kill existing process if any
    if (server.process && !server.process.killed) {
      try {
        server.process.kill();
        console.log(`   Killed existing process (PID: ${server.process.pid})`);
      } catch (err) {
        console.log(`   Failed to kill process: ${err.message}`);
      }
    }

    // Start new process
    try {
      const proc = spawn(server.startCommand, server.startArgs, {
        cwd: ROOT,
        stdio: 'inherit',
        shell: true
      });

      server.process = proc;

      proc.on('error', (err) => {
        console.error(`❌ ${server.name} failed to start:`, err.message);
        sessionState.updateServerStatus(serverKey, 'error');
      });

      proc.on('exit', (code) => {
        console.log(`⚠️ ${server.name} exited with code ${code}`);
        server.process = null;
        sessionState.updateServerStatus(serverKey, 'stopped');
      });

      console.log(`✅ ${server.name} started (PID: ${proc.pid})`);
      sessionState.updateServerStatus(serverKey, 'starting');

      return true;
    } catch (err) {
      console.error(`❌ Failed to restart ${server.name}:`, err.message);
      sessionState.updateServerStatus(serverKey, 'error');
      return false;
    }
  }

  /**
   * Start all servers
   */
  startAllServers() {
    console.log('🚀 Starting all servers...');
    
    for (const [key, server] of Object.entries(SERVERS)) {
      if (server.enabled && !server.process) {
        this.restartServer(key);
      }
    }
  }

  /**
   * Stop all servers
   */
  stopAllServers() {
    console.log('🛑 Stopping all servers...');
    
    for (const [key, server] of Object.entries(SERVERS)) {
      if (server.process && !server.process.killed) {
        try {
          server.process.kill();
          console.log(`✅ Stopped ${server.name}`);
        } catch (err) {
          console.error(`❌ Failed to stop ${server.name}:`, err.message);
        }
      }
    }
  }

  /**
   * Log health check results
   */
  logResults(results) {
    console.log('\n📊 Health Check Results:');
    console.log('─'.repeat(60));
    
    for (const [key, result] of Object.entries(results)) {
      const icon = result.status === 'healthy' ? '✅' : 
                   result.status === 'disabled' ? '⚪' : '❌';
      console.log(`${icon} ${SERVERS[key].name}: ${result.status.toUpperCase()}`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    }
    
    console.log('─'.repeat(60));
    console.log(`Last check: ${new Date().toISOString()}\n`);
  }

  /**
   * Get current status of all servers
   */
  getStatus() {
    const status = {};
    
    for (const [key, server] of Object.entries(SERVERS)) {
      status[key] = {
        name: server.name,
        enabled: server.enabled,
        port: server.port,
        running: server.process && !server.process.killed,
        pid: server.process?.pid || null
      };
    }
    
    return status;
  }
}

// Singleton instance
const healthMonitor = new HealthMonitor();

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      healthMonitor.startAllServers();
      healthMonitor.start();
      break;
    
    case 'check':
      healthMonitor.checkAll().then(() => process.exit(0));
      break;
    
    case 'stop':
      healthMonitor.stopAllServers();
      process.exit(0);
      break;
    
    default:
      console.log('Usage: node healthMonitor.js [start|check|stop]');
      process.exit(1);
  }
}

module.exports = healthMonitor;
module.exports.HealthMonitor = HealthMonitor;

