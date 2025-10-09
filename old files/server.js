// server.js - Error Server for Developer Tools
// Runs on port 4000
// Saves errors into error_logs/errors_TIMESTAMP.json and error_logs/latest.json

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000;
const LOG_DIR = path.join(__dirname, "error_logs");

// Ensure error_logs folder exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "TradeMate Pro Error Server",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    features: [
      "Error logging",
      "Deployment log integration",
      "DevTools compatibility",
      "JSON structured logging",
      "AI integration ready"
    ]
  });
});

// AI analysis endpoint for dev tools integration
app.post("/ai-analysis", (req, res) => {
  try {
    const { timestamp, context, systemStatus, data, requestId } = req.body;

    // Log the AI analysis request
    const analysisLog = {
      requestId,
      timestamp,
      context,
      systemStatus,
      data,
      response: {
        status: "processed",
        message: "Data received and logged for AI analysis",
        recommendations: generateRecommendations(systemStatus, data)
      }
    };

    // Save analysis log
    const filename = `ai_analysis_${timestamp.replace(/[:.]/g, "-")}.json`;
    const filepath = path.join(LOG_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(analysisLog, null, 2));

    // Also update latest analysis
    const latestPath = path.join(LOG_DIR, "latest_ai_analysis.json");
    fs.writeFileSync(latestPath, JSON.stringify(analysisLog, null, 2));

    res.json({
      status: "success",
      requestId,
      message: "Analysis request processed",
      recommendations: analysisLog.response.recommendations,
      logFile: filename
    });

  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate AI recommendations based on system status
function generateRecommendations(systemStatus, data) {
  const recommendations = [];

  if (systemStatus?.logs?.count > 5) {
    recommendations.push({
      type: "error_reduction",
      priority: "high",
      message: `High error count detected (${systemStatus.logs.count}). Review and fix recurring issues.`,
      action: "Review error logs and identify patterns"
    });
  }

  if (systemStatus?.status === 'warning' || systemStatus?.status === 'critical') {
    recommendations.push({
      type: "system_health",
      priority: "high",
      message: "System health issues detected. Run diagnostics to identify problems.",
      action: "Execute system diagnostics and address identified issues"
    });
  }

  if (systemStatus?.logs?.count === 0) {
    recommendations.push({
      type: "maintenance",
      priority: "low",
      message: "System running cleanly. Consider routine maintenance tasks.",
      action: "Review performance metrics and update dependencies"
    });
  }

  return recommendations;
}

// Save errors endpoint (enhanced for deployment logs)
app.post("/save-errors", (req, res) => {
  try {
    const data = req.body || [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Handle different types of logs
    let filename, logData, count;

    if (data.type === 'DEPLOYMENT_LOG') {
      // Deployment log from enhanced deployer
      filename = `deployment_${timestamp}.json`;
      logData = data.deployment;
      count = data.deployment.logs ? data.deployment.logs.length : 0;

      console.log(`📊 Deployment log received: ${count} entries`);
    } else {
      // Regular error logs
      filename = `errors_${timestamp}.json`;
      logData = Array.isArray(data) ? data : [data];
      count = logData.length;

      console.log(`🔍 Error log received: ${count} errors`);
    }

    // Save timestamped file
    const filePath = path.join(LOG_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(logData, null, 2));

    // Update latest.json with appropriate data
    const latestPath = path.join(LOG_DIR, "latest.json");
    const latestData = {
      timestamp: new Date().toISOString(),
      type: data.type || 'ERROR_LOG',
      data: logData,
      count: count
    };
    fs.writeFileSync(latestPath, JSON.stringify(latestData, null, 2));

    res.json({
      ok: true,
      count: count,
      file: filename,
      latest: "latest.json",
      type: data.type || 'ERROR_LOG'
    });

    console.log(`✅ Saved ${count} entries → ${filename}, also updated latest.json`);
  } catch (err) {
    console.error("❌ Failed to save logs:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Phase 3: Ensure directory endpoint
app.post("/ensure-dir", (req, res) => {
  try {
    const { dir } = req.body;
    const dirPath = path.join(__dirname, dir);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    res.json({ success: true });
    console.log(`✅ Directory ensured: ${dirPath}`);
  } catch (error) {
    console.error("❌ Error ensuring directory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Phase 3: Save file endpoint for fix engine
app.post("/save-file", (req, res) => {
  try {
    const { filename, data } = req.body;
    const filepath = path.join(LOG_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    console.log(`✅ Fix engine file saved: ${filename}`);
    res.json({ success: true, filename });
  } catch (error) {
    console.error("❌ Error saving fix engine file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// List files endpoint
app.get("/list-files", (req, res) => {
  try {
    const files = fs.readdirSync(LOG_DIR);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get log file content endpoint
app.get("/get-log/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(LOG_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "Log file not found" });
    }

    const content = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(content);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Error server is running. POST errors to /save-errors, fix files to /save-file");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Error server listening on http://localhost:${PORT}`);
  console.log(`Phase 1: Error logging enabled`);
  console.log(`Phase 3: Fix engine JSON handoff enabled`);
});
