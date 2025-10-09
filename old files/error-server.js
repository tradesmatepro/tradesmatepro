// Tiny Node server to persist captured errors from React frontend
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for React frontend

const LOG_DIR = "./error_logs";
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

app.post("/save-errors", (req, res) => {
  const errors = req.body || [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = `${LOG_DIR}/errors_${timestamp}.json`;
  const latestPath = `${LOG_DIR}/latest.json`;

  // Write both timestamped file and latest pointer
  fs.writeFileSync(filePath, JSON.stringify(errors, null, 2));
  fs.writeFileSync(latestPath, JSON.stringify(errors, null, 2));

  console.log(`✅ Saved ${errors.length} errors → ${filePath} + latest.json`);

  res.json({ success: true, files: [filePath, latestPath], count: errors.length });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Get latest error files
app.get("/latest-files", (req, res) => {
  try {
    const files = fs.readdirSync(LOG_DIR)
      .filter(f => f.startsWith('errors_') && f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 10); // Last 10 files
    
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`📡 Error logging server running at http://localhost:${PORT}`);
  console.log(`📁 Saving errors to: ${LOG_DIR}/`);
});
