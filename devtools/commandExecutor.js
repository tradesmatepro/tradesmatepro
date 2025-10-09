/**
 * AI Command Executor
 * 
 * Watches devtools/ai_commands.json for commands from Claude/GPT-5
 * Executes commands and writes responses to devtools/ai_responses.json
 * 
 * This enables AI assistants to control the app without API calls!
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const AI_COMMANDS_PATH = path.join(__dirname, 'ai_commands.json');
const AI_RESPONSES_PATH = path.join(__dirname, 'ai_responses.json');
const ERROR_LOGS_PATH = path.join(__dirname, '../error_logs/latest.json');
const AI_CONTEXT_PATH = path.join(__dirname, '../error_logs/ai_context.json');

// Import new Phase 1 modules
const sessionState = require('./sessionState');
const healthMonitor = require('./healthMonitor');

// Import Phase 2 modules
const perceptionEngine = require('./perceptionEngine');

// Import Phase 3 modules
const autoTestRunner = require('./autoTestRunner');

// Track processed commands to avoid duplicates
const processedCommands = new Set();

// Global error handlers for reliability
process.on('unhandledRejection', async (err) => {
  console.error('❌ Unhandled rejection:', err);

  // Try to recover browser if it's a Playwright error
  if (err.message && err.message.includes('Target')) {
    console.log('🔄 Attempting to restart browser...');
    try {
      const { closeBrowser, getBrowser } = require('./uiInteractionController');
      await closeBrowser();
      await getBrowser(); // Restart
      console.log('✅ Browser restarted successfully');
    } catch (restartErr) {
      console.error('❌ Failed to restart browser:', restartErr);
    }
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  // Don't exit - try to continue
});

// Command handlers
const commandHandlers = {
  // Get current logs
  get_logs: async (params) => {
    try {
      const logs = JSON.parse(fs.readFileSync(ERROR_LOGS_PATH, 'utf8'));
      return {
        status: 'success',
        data: logs
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to read logs: ${err.message}`
      };
    }
  },

  // Get AI context
  get_context: async (params) => {
    try {
      const context = JSON.parse(fs.readFileSync(AI_CONTEXT_PATH, 'utf8'));
      return {
        status: 'success',
        data: context
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to read AI context: ${err.message}`
      };
    }
  },

  // Analyze errors
  analyze_errors: async (params) => {
    try {
      const context = JSON.parse(fs.readFileSync(AI_CONTEXT_PATH, 'utf8'));
      
      // Perform analysis
      const analysis = {
        totalErrors: context.summary?.totalErrors || 0,
        errorsByType: context.errors?.byType || {},
        suggestions: context.suggestions || [],
        criticalIssues: context.suggestions?.filter(s => s.priority === 'critical') || [],
        timestamp: new Date().toISOString()
      };
      
      return {
        status: 'success',
        data: analysis
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to analyze errors: ${err.message}`
      };
    }
  },

  // Run tests
  test_pipeline: async (params) => {
    try {
      const { runPipelineTest } = require('./testRunner');
      console.log('🧪 Running pipeline tests...');

      const results = await runPipelineTest(params);

      return {
        status: results.status,
        message: `Tests completed: ${results.passedSteps}/${results.totalSteps} passed`,
        data: results
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Test execution failed: ${err.message}`,
        error: err.stack
      };
    }
  },

  // Check app status
  check_status: async (params) => {
    try {
      // Check if servers are running
      const http = require('http');

      const checkPort = (port) => {
        return new Promise((resolve) => {
          const req = http.get(`http://localhost:${port}/health`, (res) => {
            resolve(res.statusCode === 200);
          });
          req.on('error', () => resolve(false));
          req.setTimeout(1000, () => {
            req.destroy();
            resolve(false);
          });
        });
      };

      const mainAppRunning = await checkPort(3004);
      const errorServerRunning = await checkPort(4000);

      return {
        status: 'success',
        data: {
          mainApp: {
            port: 3004,
            running: mainAppRunning,
            url: 'http://localhost:3004'
          },
          errorServer: {
            port: 4000,
            running: errorServerRunning,
            url: 'http://localhost:4000'
          },
          webSocket: {
            port: 4001,
            url: 'ws://localhost:4001'
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to check status: ${err.message}`
      };
    }
  },

  // ========== PHASE 1 COMMANDS: System Memory and Health ==========

  // Check health of all servers
  check_health: async (params) => {
    try {
      console.log('🏥 Running health checks...');
      const results = await healthMonitor.checkAll();

      return {
        status: 'success',
        message: 'Health check completed',
        data: {
          servers: results,
          sessionState: sessionState.getState(),
          timestamp: new Date().toISOString()
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Health check failed: ${err.message}`
      };
    }
  },

  // Restart a specific service
  restart_service: async (params) => {
    try {
      const { service } = params;

      if (!service) {
        return {
          status: 'error',
          message: 'Service name required (errorLogger, commandExecutor, mainApp)'
        };
      }

      console.log(`🔄 Restarting service: ${service}`);
      const success = healthMonitor.restartServer(service);

      return {
        status: success ? 'success' : 'error',
        message: success ? `${service} restarted successfully` : `Failed to restart ${service}`,
        data: {
          service,
          timestamp: new Date().toISOString()
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to restart service: ${err.message}`
      };
    }
  },

  // Save session state
  save_session_state: async (params) => {
    try {
      const success = sessionState.saveState();

      return {
        status: success ? 'success' : 'error',
        message: success ? 'Session state saved' : 'Failed to save session state',
        data: {
          sessionId: sessionState.state.sessionId,
          lastUpdated: sessionState.state.lastUpdated,
          currentScenario: sessionState.state.currentScenario,
          statistics: sessionState.getStatistics()
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to save session state: ${err.message}`
      };
    }
  },

  // Get session state
  get_session_state: async (params) => {
    try {
      const state = sessionState.getState();

      return {
        status: 'success',
        message: 'Session state retrieved',
        data: state
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get session state: ${err.message}`
      };
    }
  },

  // Record scenario result
  record_scenario_result: async (params) => {
    try {
      const { scenario, result, duration } = params;

      if (!scenario || !result) {
        return {
          status: 'error',
          message: 'Scenario name and result required'
        };
      }

      sessionState.recordScenarioResult(scenario, result, duration || 0);

      return {
        status: 'success',
        message: `Recorded ${result} for ${scenario}`,
        data: {
          scenario,
          result,
          history: sessionState.getScenarioHistory(scenario)
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to record scenario result: ${err.message}`
      };
    }
  },

  // Get scenario statistics
  get_scenario_stats: async (params) => {
    try {
      const { scenario } = params;

      if (scenario) {
        const history = sessionState.getScenarioHistory(scenario);
        return {
          status: 'success',
          message: `Statistics for ${scenario}`,
          data: history
        };
      }

      // Return all scenarios
      const allScenarios = sessionState.getAllScenarios();
      return {
        status: 'success',
        message: 'All scenario statistics',
        data: {
          scenarios: allScenarios,
          overall: sessionState.getStatistics()
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get scenario stats: ${err.message}`
      };
    }
  },

  // Start health monitoring
  start_health_monitor: async (params) => {
    try {
      const intervalMs = params?.intervalMs || 60000;
      healthMonitor.start(intervalMs);

      return {
        status: 'success',
        message: `Health monitor started (interval: ${intervalMs / 1000}s)`,
        data: {
          intervalMs,
          timestamp: new Date().toISOString()
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to start health monitor: ${err.message}`
      };
    }
  },

  // Stop health monitoring
  stop_health_monitor: async (params) => {
    try {
      healthMonitor.stop();

      return {
        status: 'success',
        message: 'Health monitor stopped'
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to stop health monitor: ${err.message}`
      };
    }
  },

  // ========== PHASE 2 COMMANDS: Perception and Reasoning ==========

  // Get perception report
  get_perception_report: async (params) => {
    try {
      const report = perceptionEngine.generateReport();

      return {
        status: 'success',
        message: 'Perception report generated',
        data: report
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to generate perception report: ${err.message}`
      };
    }
  },

  // Get perception history
  get_perception_history: async (params) => {
    try {
      const limit = params?.limit || 10;
      const history = perceptionEngine.getHistory(limit);

      return {
        status: 'success',
        message: `Retrieved last ${history.length} actions`,
        data: {
          history,
          successRate: perceptionEngine.getSuccessRate(),
          totalActions: perceptionEngine.actionHistory.length
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get perception history: ${err.message}`
      };
    }
  },

  // Get failure analysis
  get_failure_analysis: async (params) => {
    try {
      const analysis = perceptionEngine.analyzeFailurePatterns();

      return {
        status: 'success',
        message: 'Failure analysis completed',
        data: analysis
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to analyze failures: ${err.message}`
      };
    }
  },

  // Clear perception history
  clear_perception_history: async (params) => {
    try {
      perceptionEngine.clearHistory();

      return {
        status: 'success',
        message: 'Perception history cleared'
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to clear perception history: ${err.message}`
      };
    }
  },

  // ========== PHASE 3 COMMANDS: Autonomy and Persistence ==========

  // Run full autonomous test suite
  run_full_auto: async (params) => {
    try {
      console.log('🤖 Starting full autonomous test run...');
      const options = params || {};
      const report = await autoTestRunner.runFullAuto(options);

      return {
        status: report.status,
        message: `Test run completed: ${report.summary?.passed || 0}/${report.summary?.total || 0} passed`,
        data: report
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Autonomous test run failed: ${err.message}`,
        error: err.stack
      };
    }
  },

  // Run specific scenario
  run_scenario: async (params) => {
    try {
      const { scenario } = params;

      if (!scenario) {
        return {
          status: 'error',
          message: 'Scenario name required'
        };
      }

      console.log(`🧪 Running scenario: ${scenario}`);
      const report = await autoTestRunner.runFullAuto({ scenario });

      return {
        status: report.status,
        message: `Scenario ${scenario} completed`,
        data: report
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Scenario execution failed: ${err.message}`,
        error: err.stack
      };
    }
  },

  // Get test results
  get_test_results: async (params) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const resultsPath = path.join(__dirname, 'test_results', 'latest.json');

      if (!fs.existsSync(resultsPath)) {
        return {
          status: 'success',
          message: 'No test results available',
          data: null
        };
      }

      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

      return {
        status: 'success',
        message: 'Test results retrieved',
        data: results
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get test results: ${err.message}`
      };
    }
  },

  // Execute SQL (with safety checks)
  execute_sql: async (params) => {
    try {
      const { executeSQL } = require('./sqlExecutor');
      return await executeSQL(params);
    } catch (err) {
      return {
        status: 'error',
        message: `SQL execution failed: ${err.message}`
      };
    }
  },

  // Get database schema
  get_schema: async (params) => {
    try {
      const { getDatabaseSchema } = require('./sqlExecutor');
      return await getDatabaseSchema(params);
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get schema: ${err.message}`
      };
    }
  },

  // Get table row count
  get_row_count: async (params) => {
    try {
      const { getTableRowCount } = require('./sqlExecutor');
      return await getTableRowCount(params);
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get row count: ${err.message}`
      };
    }
  },

  // Get recent records
  get_recent_records: async (params) => {
    try {
      const { getRecentRecords } = require('./sqlExecutor');
      return await getRecentRecords(params);
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get records: ${err.message}`
      };
    }
  },

  // Capture screenshot
  capture_screenshot: async (params) => {
    try {
      const { captureScreenshot } = require('./screenshotCapture');
      return await captureScreenshot(params);
    } catch (err) {
      return {
        status: 'error',
        message: `Screenshot capture failed: ${err.message}`
      };
    }
  },

  // Get file content
  get_file: async (params) => {
    try {
      const filePath = path.join(__dirname, '..', params.path);
      
      // Security check - only allow reading from project directory
      if (!filePath.startsWith(__dirname.replace('devtools', ''))) {
        return {
          status: 'error',
          message: 'Access denied: Path outside project directory'
        };
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      return {
        status: 'success',
        data: {
          path: params.path,
          content,
          lines: content.split('\n').length
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to read file: ${err.message}`
      };
    }
  },

  // List files in directory
  list_files: async (params) => {
    try {
      const dirPath = path.join(__dirname, '..', params.path || '.');

      // Security check
      if (!dirPath.startsWith(__dirname.replace('devtools', ''))) {
        return {
          status: 'error',
          message: 'Access denied: Path outside project directory'
        };
      }

      const files = fs.readdirSync(dirPath);
      return {
        status: 'success',
        data: {
          path: params.path || '.',
          files: files.map(file => {
            const stats = fs.statSync(path.join(dirPath, file));
            return {
              name: file,
              type: stats.isDirectory() ? 'directory' : 'file',
              size: stats.size,
              modified: stats.mtime
            };
          })
        }
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to list files: ${err.message}`
      };
    }
  },

  // ========================================
  // UI INTERACTION COMMANDS (NEW!)
  // ========================================

  // Navigate to URL
  ui_navigate: async (params) => {
    try {
      const { navigate } = require('./uiInteractionController');
      return await navigate(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI navigation failed: ${err.message}`
      };
    }
  },

  // Click element
  ui_click: async (params) => {
    try {
      const { click } = require('./uiInteractionController');
      return await click(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI click failed: ${err.message}`
      };
    }
  },

  // Type into element
  ui_type: async (params) => {
    try {
      const { type } = require('./uiInteractionController');
      return await type(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI type failed: ${err.message}`
      };
    }
  },

  // Fill form field
  ui_fill: async (params) => {
    try {
      const { fill } = require('./uiInteractionController');
      return await fill(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI fill failed: ${err.message}`
      };
    }
  },

  // Select from dropdown
  ui_select: async (params) => {
    try {
      const { select } = require('./uiInteractionController');
      return await select(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI select failed: ${err.message}`
      };
    }
  },

  // Check if element exists/visible
  ui_check_element: async (params) => {
    try {
      const { checkElement } = require('./uiInteractionController');
      return await checkElement(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI element check failed: ${err.message}`
      };
    }
  },

  // Get text from element
  ui_get_text: async (params) => {
    try {
      const { getText } = require('./uiInteractionController');
      return await getText(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI get text failed: ${err.message}`
      };
    }
  },

  // Wait for element
  ui_wait_for: async (params) => {
    try {
      const { waitFor } = require('./uiInteractionController');
      return await waitFor(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI wait failed: ${err.message}`
      };
    }
  },

  // Capture screenshot
  ui_screenshot: async (params) => {
    try {
      const { screenshot } = require('./uiInteractionController');
      return await screenshot(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI screenshot failed: ${err.message}`
      };
    }
  },

  // Get DOM snapshot
  ui_get_dom: async (params) => {
    try {
      const { getDOMSnapshot } = require('./uiInteractionController');
      return await getDOMSnapshot(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI DOM snapshot failed: ${err.message}`
      };
    }
  },

  // Run complete scenario
  ui_run_scenario: async (params) => {
    try {
      const { runScenario } = require('./uiInteractionController');
      return await runScenario(params);
    } catch (err) {
      return {
        status: 'error',
        message: `UI scenario failed: ${err.message}`
      };
    }
  },

  // Run predefined scenario
  ui_run_test: async (params) => {
    try {
      const { runScenario } = require('./uiInteractionController');
      const { scenarios } = require('./uiTestScenarios');

      const scenarioName = params.scenario;
      const scenario = scenarios[scenarioName];

      if (!scenario) {
        return {
          status: 'error',
          message: `Unknown scenario: ${scenarioName}`,
          availableScenarios: Object.keys(scenarios)
        };
      }

      return await runScenario(scenario);
    } catch (err) {
      return {
        status: 'error',
        message: `UI test failed: ${err.message}`
      };
    }
  },

  // Login helper
  ui_login: async (params) => {
    try {
      const { login } = require('./uiInteractionController');
      const { TEST_USER } = require('./uiTestScenarios');

      return await login({
        email: params.email || TEST_USER.email,
        password: params.password || TEST_USER.password,
        url: params.url || '/login'
      });
    } catch (err) {
      return {
        status: 'error',
        message: `UI login failed: ${err.message}`
      };
    }
  },

  // Close browser
  ui_close_browser: async (params) => {
    try {
      const { closeBrowser } = require('./uiInteractionController');
      await closeBrowser();
      return {
        status: 'success',
        message: 'Browser closed'
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to close browser: ${err.message}`
      };
    }
  },

  // ========================================
  // MONITORED UI COMMANDS (Part 2!)
  // These provide reasoning about outcomes
  // ========================================

  // Click with monitoring
  ui_click_monitored: async (params) => {
    try {
      const { clickWithMonitoring } = require('./uiInteractionController');
      return await clickWithMonitoring(params);
    } catch (err) {
      return {
        status: 'error',
        message: `Monitored click failed: ${err.message}`
      };
    }
  },

  // Fill with monitoring
  ui_fill_monitored: async (params) => {
    try {
      const { fillWithMonitoring } = require('./uiInteractionController');
      return await fillWithMonitoring(params);
    } catch (err) {
      return {
        status: 'error',
        message: `Monitored fill failed: ${err.message}`
      };
    }
  },

  // Navigate with monitoring
  ui_navigate_monitored: async (params) => {
    try {
      const { navigateWithMonitoring } = require('./uiInteractionController');
      return await navigateWithMonitoring(params);
    } catch (err) {
      return {
        status: 'error',
        message: `Monitored navigation failed: ${err.message}`
      };
    }
  },

  // Select with monitoring
  ui_select_monitored: async (params) => {
    try {
      const { selectWithMonitoring } = require('./uiInteractionController');
      return await selectWithMonitoring(params);
    } catch (err) {
      return {
        status: 'error',
        message: `Monitored select failed: ${err.message}`
      };
    }
  },

  // Get action history
  ui_get_action_history: async (params) => {
    try {
      const { getActionHistory } = require('./actionOutcomeMonitor');
      const history = getActionHistory(params.limit || 10);
      return {
        status: 'success',
        data: history
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get action history: ${err.message}`
      };
    }
  },

  // Get failed actions
  ui_get_failed_actions: async (params) => {
    try {
      const { getFailedActions } = require('./actionOutcomeMonitor');
      const failed = getFailedActions();
      return {
        status: 'success',
        data: failed
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to get failed actions: ${err.message}`
      };
    }
  },

  // Generate action report
  ui_generate_report: async (params) => {
    try {
      const { generateReport } = require('./actionOutcomeMonitor');
      const report = generateReport();
      return {
        status: 'success',
        data: report
      };
    } catch (err) {
      return {
        status: 'error',
        message: `Failed to generate report: ${err.message}`
      };
    }
  }
};

// Process a command
async function processCommand(command) {
  const { id, command: cmd, params, timestamp } = command;
  
  console.log(`🤖 Processing AI command: ${cmd} (ID: ${id})`);
  
  try {
    const handler = commandHandlers[cmd];
    
    if (!handler) {
      return {
        id,
        status: 'error',
        message: `Unknown command: ${cmd}`,
        availableCommands: Object.keys(commandHandlers),
        timestamp: new Date().toISOString()
      };
    }
    
    const result = await handler(params || {});
    
    return {
      id,
      command: cmd,
      ...result,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      id,
      status: 'error',
      message: `Command execution failed: ${err.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

// Watch for new commands
function watchCommands() {
  console.log('👀 Watching for AI commands...');

  let debounceTimer;

  fs.watch(AI_COMMANDS_PATH, async (eventType) => {
    if (eventType === 'change') {
      // Debounce to wait for complete write
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const raw = fs.readFileSync(AI_COMMANDS_PATH, 'utf8');

          // Skip empty or incomplete files
          if (!raw.trim() || raw.trim().length < 10) {
            console.log('⏳ File not ready, skipping...');
            return;
          }

          const data = JSON.parse(raw);
          const commands = data.commands || [];

          // Process new commands
          for (const command of commands) {
            if (!processedCommands.has(command.id)) {
              processedCommands.add(command.id);

              const response = await processCommand(command);

              // Append response
              const responses = JSON.parse(fs.readFileSync(AI_RESPONSES_PATH, 'utf8'));
              responses.responses = responses.responses || [];
              responses.responses.push(response);

              // Keep only last 100 responses
              if (responses.responses.length > 100) {
                responses.responses = responses.responses.slice(-100);
              }

              fs.writeFileSync(AI_RESPONSES_PATH, JSON.stringify(responses, null, 2));

              console.log(`✅ Command ${command.id} processed: ${response.status}`);
            }
          }
        } catch (err) {
          console.error('❌ Error processing commands:', err);
          console.log('⏳ Will retry on next file change...');
        }
      }, 300); // 300ms debounce
    }
  });
}

// Start watching
if (require.main === module) {
  console.log('🚀 AI Command Executor started');
  console.log(`📁 Commands: ${AI_COMMANDS_PATH}`);
  console.log(`📁 Responses: ${AI_RESPONSES_PATH}`);
  console.log('');
  console.log('Available commands:');
  Object.keys(commandHandlers).forEach(cmd => {
    console.log(`  - ${cmd}`);
  });
  console.log('');
  
  watchCommands();
}

module.exports = { processCommand, commandHandlers };

