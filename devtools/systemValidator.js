/**
 * System Validator
 * 
 * Automated validation of the entire AI DevTools system
 * Generates comprehensive audit reports
 * 
 * Features:
 * - Validates all files exist
 * - Checks all commands are registered
 * - Verifies server health
 * - Tests core functionality
 * - Generates audit report
 */

const fs = require('fs');
const path = require('path');
const sessionState = require('./sessionState');
const healthMonitor = require('./healthMonitor');
const perceptionEngine = require('./perceptionEngine');
const autoTestRunner = require('./autoTestRunner');

const ROOT = process.cwd();

/**
 * System Validator Class
 */
class SystemValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      files: {},
      commands: {},
      servers: {},
      functionality: {},
      recommendations: []
    };
  }

  /**
   * Run complete system validation
   */
  async validate() {
    console.log('🔍 Starting System Validation...');
    console.log('═'.repeat(60));

    try {
      // Step 1: Validate files
      console.log('\n📁 Step 1: Validating Files...');
      await this.validateFiles();

      // Step 2: Validate commands
      console.log('\n⚙️  Step 2: Validating Commands...');
      await this.validateCommands();

      // Step 3: Validate servers
      console.log('\n🏥 Step 3: Validating Servers...');
      await this.validateServers();

      // Step 4: Validate functionality
      console.log('\n🧪 Step 4: Validating Functionality...');
      await this.validateFunctionality();

      // Step 5: Generate recommendations
      console.log('\n💡 Step 5: Generating Recommendations...');
      this.generateRecommendations();

      // Determine overall status
      this.determineOverallStatus();

      // Save report
      this.saveReport();

      console.log('\n✅ System Validation Complete');
      console.log('═'.repeat(60));

      return this.results;

    } catch (err) {
      console.error('❌ Validation failed:', err);
      this.results.overall = 'error';
      this.results.error = err.message;
      return this.results;
    }
  }

  /**
   * Validate all required files exist
   */
  async validateFiles() {
    const requiredFiles = {
      // Core DevTools
      'devtools/commandExecutor.js': 'Command processing',
      'devtools/sessionState.js': 'Session persistence',
      'devtools/healthMonitor.js': 'Health monitoring',
      'devtools/perceptionEngine.js': 'Perception layer',
      'devtools/autoTestRunner.js': 'Autonomous testing',
      'devtools/uiInteractionController.js': 'UI automation',
      'devtools/actionOutcomeMonitor.js': 'Action verification',
      'devtools/local_logger_server.js': 'Error logging',
      
      // Documentation
      'AIDevTools/PHASE_LOG.md': 'Phase log',
      'AIDevTools/HOW_TO_USE_AI_TOOLS.md': 'Usage guide',
      'AIDevTools/AUTONOMOUS_SYSTEM_SUMMARY.md': 'System summary',
      'START_AUTONOMOUS_AI.bat': 'Startup script'
    };

    for (const [file, description] of Object.entries(requiredFiles)) {
      const filepath = path.join(ROOT, file);
      const exists = fs.existsSync(filepath);
      
      this.results.files[file] = {
        description,
        exists,
        status: exists ? 'ok' : 'missing'
      };

      if (exists) {
        const stats = fs.statSync(filepath);
        this.results.files[file].size = stats.size;
        this.results.files[file].modified = stats.mtime;
      }

      console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    }

    const missingFiles = Object.entries(this.results.files)
      .filter(([_, data]) => !data.exists)
      .map(([file, _]) => file);

    if (missingFiles.length > 0) {
      console.log(`\n   ⚠️  Missing ${missingFiles.length} files`);
    } else {
      console.log(`\n   ✅ All files present`);
    }
  }

  /**
   * Validate all commands are registered
   */
  async validateCommands() {
    const expectedCommands = {
      // Phase 1
      'check_health': 'Check server health',
      'restart_service': 'Restart service',
      'save_session_state': 'Save session',
      'get_session_state': 'Get session',
      'record_scenario_result': 'Record result',
      'get_scenario_stats': 'Get stats',
      'start_health_monitor': 'Start monitoring',
      'stop_health_monitor': 'Stop monitoring',
      
      // Phase 2
      'get_perception_report': 'Perception report',
      'get_perception_history': 'Perception history',
      'get_failure_analysis': 'Failure analysis',
      'clear_perception_history': 'Clear history',
      
      // Phase 3
      'run_full_auto': 'Run all tests',
      'run_scenario': 'Run scenario',
      'get_test_results': 'Get results'
    };

    try {
      const commandExecutor = require('./commandExecutor');
      const handlers = commandExecutor.commandHandlers || {};

      for (const [command, description] of Object.entries(expectedCommands)) {
        const exists = typeof handlers[command] === 'function';
        
        this.results.commands[command] = {
          description,
          exists,
          status: exists ? 'ok' : 'missing'
        };

        console.log(`   ${exists ? '✅' : '❌'} ${command}`);
      }

      const missingCommands = Object.entries(this.results.commands)
        .filter(([_, data]) => !data.exists)
        .map(([cmd, _]) => cmd);

      if (missingCommands.length > 0) {
        console.log(`\n   ⚠️  Missing ${missingCommands.length} commands`);
      } else {
        console.log(`\n   ✅ All commands registered`);
      }

    } catch (err) {
      console.log(`   ❌ Failed to load commandExecutor: ${err.message}`);
      this.results.commands.error = err.message;
    }
  }

  /**
   * Validate server health
   */
  async validateServers() {
    try {
      const healthResults = await healthMonitor.checkAll();
      
      for (const [server, result] of Object.entries(healthResults)) {
        this.results.servers[server] = {
          status: result.status,
          message: result.message,
          healthy: result.status === 'healthy' || result.status === 'disabled'
        };

        const icon = result.status === 'healthy' ? '✅' : 
                     result.status === 'disabled' ? '⚪' : '❌';
        console.log(`   ${icon} ${server}: ${result.status.toUpperCase()}`);
      }

    } catch (err) {
      console.log(`   ❌ Health check failed: ${err.message}`);
      this.results.servers.error = err.message;
    }
  }

  /**
   * Validate core functionality
   */
  async validateFunctionality() {
    const tests = [
      {
        name: 'Session State',
        test: async () => {
          const state = sessionState.getState();
          return state && state.sessionId ? 'ok' : 'fail';
        }
      },
      {
        name: 'Session Save',
        test: async () => {
          return sessionState.saveState() ? 'ok' : 'fail';
        }
      },
      {
        name: 'Perception Engine',
        test: async () => {
          const report = perceptionEngine.generateReport();
          return report && typeof report.totalActions === 'number' ? 'ok' : 'fail';
        }
      },
      {
        name: 'Health Monitor',
        test: async () => {
          const status = healthMonitor.getStatus();
          return status ? 'ok' : 'fail';
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.results.functionality[test.name] = {
          status: result,
          passed: result === 'ok'
        };
        console.log(`   ${result === 'ok' ? '✅' : '❌'} ${test.name}`);
      } catch (err) {
        this.results.functionality[test.name] = {
          status: 'error',
          passed: false,
          error: err.message
        };
        console.log(`   ❌ ${test.name}: ${err.message}`);
      }
    }
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Check for missing files
    const missingFiles = Object.entries(this.results.files)
      .filter(([_, data]) => !data.exists);
    
    if (missingFiles.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'files',
        message: `${missingFiles.length} required files are missing`,
        action: 'Create missing files or restore from backup'
      });
    }

    // Check for missing commands
    const missingCommands = Object.entries(this.results.commands)
      .filter(([_, data]) => !data.exists);
    
    if (missingCommands.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'commands',
        message: `${missingCommands.length} commands are not registered`,
        action: 'Update commandExecutor.js to register missing commands'
      });
    }

    // Check server health
    const unhealthyServers = Object.entries(this.results.servers)
      .filter(([_, data]) => data.status === 'down' || data.status === 'unhealthy');
    
    if (unhealthyServers.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'servers',
        message: `${unhealthyServers.length} servers are not healthy`,
        action: 'Start servers with: node devtools/healthMonitor.js start'
      });
    }

    // Check functionality
    const failedTests = Object.entries(this.results.functionality)
      .filter(([_, data]) => !data.passed);
    
    if (failedTests.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'functionality',
        message: `${failedTests.length} functionality tests failed`,
        action: 'Review error messages and fix issues'
      });
    }

    // If everything is good
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'info',
        category: 'status',
        message: 'System is fully operational',
        action: 'Ready to run autonomous tests'
      });
    }

    this.results.recommendations = recommendations;

    console.log('\n   Recommendations:');
    recommendations.forEach(rec => {
      const icon = rec.priority === 'high' ? '🔴' : 
                   rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`   ${icon} [${rec.priority.toUpperCase()}] ${rec.message}`);
      console.log(`      → ${rec.action}`);
    });
  }

  /**
   * Determine overall status
   */
  determineOverallStatus() {
    const hasHighPriority = this.results.recommendations.some(r => r.priority === 'high');
    const hasMediumPriority = this.results.recommendations.some(r => r.priority === 'medium');

    if (hasHighPriority) {
      this.results.overall = 'critical';
    } else if (hasMediumPriority) {
      this.results.overall = 'warning';
    } else {
      this.results.overall = 'healthy';
    }

    const statusIcon = this.results.overall === 'healthy' ? '✅' : 
                       this.results.overall === 'warning' ? '⚠️' : '❌';
    
    console.log(`\n   Overall Status: ${statusIcon} ${this.results.overall.toUpperCase()}`);
  }

  /**
   * Save validation report
   */
  saveReport() {
    try {
      const reportPath = path.join(ROOT, 'devtools', 'validation_report.json');
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2), 'utf8');
      console.log(`\n   💾 Report saved: devtools/validation_report.json`);
    } catch (err) {
      console.error(`   ❌ Failed to save report: ${err.message}`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const validator = new SystemValidator();
  
  validator.validate()
    .then(results => {
      process.exit(results.overall === 'healthy' ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = new SystemValidator();
module.exports.SystemValidator = SystemValidator;

