/**
 * Error Logging Server
 * 
 * Receives console errors/warnings/logs from the frontend and saves them to:
 * 1. error_logs/latest.json - Always the most recent errors
 * 2. error_logs/errors_TIMESTAMP.json - Historical snapshots
 * 3. logs.md - Human-readable format for AI analysis
 * 
 * Run with: npm run dev-error-server
 * Or: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = 4000;
const WS_PORT = 4001;
const ERROR_LOGS_DIR = path.join(__dirname, 'error_logs');
const DEVTOOLS_DIR = path.join(__dirname, 'devtools');
const LOGS_MD_PATH = path.join(__dirname, 'logs.md');
const AI_CONTEXT_PATH = path.join(ERROR_LOGS_DIR, 'ai_context.json');
const AI_COMMANDS_PATH = path.join(DEVTOOLS_DIR, 'ai_commands.json');
const AI_RESPONSES_PATH = path.join(DEVTOOLS_DIR, 'ai_responses.json');
const SMART_LOGS_PATH = path.join(ERROR_LOGS_DIR, 'smart_logs_latest.json');

// Ensure directories exist
[ERROR_LOGS_DIR, DEVTOOLS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize AI files if they don't exist
if (!fs.existsSync(AI_COMMANDS_PATH)) {
  fs.writeFileSync(AI_COMMANDS_PATH, JSON.stringify({ commands: [] }, null, 2));
}
if (!fs.existsSync(AI_RESPONSES_PATH)) {
  fs.writeFileSync(AI_RESPONSES_PATH, JSON.stringify({ responses: [] }, null, 2));
}

// Helper to format timestamp
function formatTimestamp(date = new Date()) {
  return date.toISOString();
}

// Helper to write to logs.md
function appendToLogsMd(content) {
  try {
    fs.appendFileSync(LOGS_MD_PATH, content + '\n');
  } catch (err) {
    console.error('Failed to write to logs.md:', err);
  }
}

// Helper to format errors for logs.md
function formatErrorsForMd(data) {
  const lines = [];
  const timestamp = new Date().toISOString();
  
  lines.push(`\n=== ERROR CAPTURE: ${timestamp} ===`);
  
  if (data.errors && data.errors.length > 0) {
    lines.push(`\n--- ERRORS (${data.errors.length}) ---`);
    data.errors.forEach((err, idx) => {
      lines.push(`\nError ${idx + 1}:`);
      lines.push(`  Time: ${err.timestamp || timestamp}`);
      lines.push(`  Message: ${err.message || JSON.stringify(err)}`);
      if (err.stack) {
        lines.push(`  Stack: ${err.stack.substring(0, 200)}...`);
      }
    });
  }
  
  if (data.warnings && data.warnings.length > 0) {
    lines.push(`\n--- WARNINGS (${data.warnings.length}) ---`);
    data.warnings.forEach((warn, idx) => {
      lines.push(`\nWarning ${idx + 1}:`);
      lines.push(`  Time: ${warn.timestamp || timestamp}`);
      lines.push(`  Message: ${warn.message || JSON.stringify(warn)}`);
    });
  }
  
  if (data.logs && data.logs.length > 0) {
    // Only log important logs (errors, warnings, network issues)
    const importantLogs = data.logs.filter(log => 
      log.severity === 'error' || 
      log.severity === 'warning' ||
      log.type === 'NETWORK_ISSUE' ||
      log.type === 'DATABASE_ERROR' ||
      log.message?.includes('🔍') // Debug logs we added
    );
    
    if (importantLogs.length > 0) {
      lines.push(`\n--- IMPORTANT LOGS (${importantLogs.length}) ---`);
      importantLogs.forEach((log, idx) => {
        lines.push(`\nLog ${idx + 1} [${log.type || 'LOG'}]:`);
        lines.push(`  Time: ${log.timestamp || timestamp}`);
        lines.push(`  Message: ${log.message || JSON.stringify(log)}`);
      });
    }
  }
  
  lines.push(`\n=== END CAPTURE ===\n`);
  
  return lines.join('\n');
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      ok: true, 
      timestamp: formatTimestamp(),
      logsDir: ERROR_LOGS_DIR
    }));
    return;
  }
  
  // Save errors endpoint
  if (req.url === '/save-errors' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const timestamp = formatTimestamp();
        const filename = `errors_${timestamp.replace(/[:.]/g, '-')}.json`;
        const filepath = path.join(ERROR_LOGS_DIR, filename);
        const latestPath = path.join(ERROR_LOGS_DIR, 'latest.json');
        
        // Add metadata
        const enrichedData = {
          ...data,
          receivedAt: timestamp,
          counts: {
            errors: data.errors?.length || 0,
            warnings: data.warnings?.length || 0,
            logs: data.logs?.length || 0
          }
        };
        
        // Save to timestamped file
        fs.writeFileSync(filepath, JSON.stringify(enrichedData, null, 2));
        
        // Save to latest.json
        fs.writeFileSync(latestPath, JSON.stringify(enrichedData, null, 2));
        
        // Append to logs.md
        const mdContent = formatErrorsForMd(data);
        appendToLogsMd(mdContent);

        // Generate and save AI context
        saveAIContext(data);

        // Broadcast to WebSocket clients
        broadcastToWebSocket({
          type: 'errors_saved',
          counts: enrichedData.counts,
          timestamp: timestamp
        });

        console.log(`✅ Saved ${enrichedData.counts.errors + enrichedData.counts.warnings + enrichedData.counts.logs} items to ${filename}`);
        console.log(`   Errors: ${enrichedData.counts.errors}, Warnings: ${enrichedData.counts.warnings}, Logs: ${enrichedData.counts.logs}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          ok: true, 
          file: filename,
          counts: enrichedData.counts
        }));
      } catch (err) {
        console.error('❌ Error saving logs:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          ok: false, 
          error: err.message 
        }));
      }
    });
    
    return;
  }
  
  // Get latest errors
  if (req.url === '/latest' && req.method === 'GET') {
    const latestPath = path.join(ERROR_LOGS_DIR, 'latest.json');

    if (fs.existsSync(latestPath)) {
      const data = fs.readFileSync(latestPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: false,
        error: 'No errors captured yet'
      }));
    }

    return;
  }

  // Export smart logs (from SmartLoggingService)
  if (req.url === '/export-smart-logs' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // Save to smart_logs_latest.json
        fs.writeFileSync(SMART_LOGS_PATH, JSON.stringify(data, null, 2));

        console.log(`📊 Smart logs exported: ${data.totalLogs} total logs`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'Smart logs exported' }));
      } catch (err) {
        console.error('❌ Failed to export smart logs:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });

    return;
  }

  // Get smart logs (for AI to read)
  if (req.url === '/smart-logs' && req.method === 'GET') {
    if (fs.existsSync(SMART_LOGS_PATH)) {
      const data = fs.readFileSync(SMART_LOGS_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: false,
        error: 'No smart logs captured yet. Make sure SmartLoggingService is running.'
      }));
    }

    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    ok: false,
    error: 'Not found'
  }));
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Error Logging Server running on http://localhost:${PORT}`);
  console.log(`📁 Saving errors to: ${ERROR_LOGS_DIR}`);
  console.log(`📝 Appending to: ${LOGS_MD_PATH}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health             - Health check`);
  console.log(`  POST /save-errors        - Save errors from frontend`);
  console.log(`  GET  /latest             - Get latest errors`);
  console.log(`  POST /export-smart-logs  - Export smart logs from frontend`);
  console.log(`  GET  /smart-logs         - Get smart logs for AI analysis\n`);
});

// ============================================
// WebSocket Server for Real-Time Streaming
// ============================================
const wss = new WebSocket.Server({ port: WS_PORT });
const wsClients = new Set();

wss.on('connection', (ws) => {
  console.log('🔌 AI DevTools connected via WebSocket');
  wsClients.add(ws);

  ws.send(JSON.stringify({
    type: 'connected',
    timestamp: formatTimestamp(),
    message: 'Connected to TradeMate Pro DevTools WebSocket'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received WebSocket message:', data.type);

      // Echo back for now (can add command handling later)
      ws.send(JSON.stringify({
        type: 'ack',
        originalType: data.type,
        timestamp: formatTimestamp()
      }));
    } catch (err) {
      console.error('❌ WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 AI DevTools disconnected');
    wsClients.delete(ws);
  });
});

// Broadcast to all connected WebSocket clients
function broadcastToWebSocket(data) {
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log(`🔌 WebSocket server running on ws://localhost:${WS_PORT}`);

// ============================================
// AI Context Generation
// ============================================
function generateAIContext(data) {
  const errors = data.errors || [];
  const warnings = data.warnings || [];
  const logs = data.logs || [];

  // Categorize errors
  const errorsByType = {};
  errors.forEach(err => {
    const type = err.type || 'UNKNOWN';
    errorsByType[type] = (errorsByType[type] || 0) + 1;
  });

  // Extract recent critical errors
  const recentErrors = errors.slice(-10).map(err => ({
    timestamp: err.timestamp,
    type: err.type,
    message: err.message,
    stack: err.stack ? err.stack.substring(0, 500) : null
  }));

  // Generate suggestions based on error patterns
  const suggestions = [];
  if (errorsByType.NETWORK_ERROR > 0) {
    suggestions.push({
      priority: 'high',
      type: 'network_issue',
      message: `${errorsByType.NETWORK_ERROR} network errors detected. Check API endpoints and network connectivity.`,
      affectedCount: errorsByType.NETWORK_ERROR
    });
  }
  if (errorsByType.DATABASE_ERROR > 0) {
    suggestions.push({
      priority: 'critical',
      type: 'database_issue',
      message: `${errorsByType.DATABASE_ERROR} database errors detected. Check Supabase connection and schema.`,
      affectedCount: errorsByType.DATABASE_ERROR
    });
  }

  const aiContext = {
    timestamp: formatTimestamp(),
    app: {
      name: 'TradeMate Pro',
      environment: 'development',
      url: 'http://localhost:3004'
    },
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      totalLogs: logs.length,
      errorsByType
    },
    errors: {
      recent: recentErrors,
      byType: errorsByType
    },
    suggestions,
    metadata: {
      capturedAt: data.timestamp || formatTimestamp(),
      receivedAt: formatTimestamp()
    }
  };

  return aiContext;
}

// Save AI context
function saveAIContext(data) {
  try {
    const aiContext = generateAIContext(data);
    fs.writeFileSync(AI_CONTEXT_PATH, JSON.stringify(aiContext, null, 2));
    console.log(`🤖 AI context updated: ${aiContext.summary.totalErrors} errors, ${aiContext.suggestions.length} suggestions`);

    // Broadcast to WebSocket clients
    broadcastToWebSocket({
      type: 'ai_context_updated',
      data: aiContext
    });
  } catch (err) {
    console.error('❌ Failed to save AI context:', err);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down error server...');
  wss.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

