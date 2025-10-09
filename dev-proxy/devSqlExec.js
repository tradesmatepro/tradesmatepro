import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// 🔑 Supabase configuration
const SUPABASE_URL = "https://cxlqzejzraczumqmsrcx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Logging function
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Main SQL execution endpoint for Claude/GPT
app.post("/dev/sql/exec", async (req, res) => {
  const { sql } = req.body;
  
  if (!sql) {
    return res.status(400).json({ success: false, error: "SQL query is required" });
  }

  log(`Executing SQL: ${sql.substring(0, 100)}...`);

  try {
    const { data, error } = await supabase.rpc("exec_sql", { query: sql });

    if (error) {
      log("SQL execution failed", error);
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    // Handle the new exec_sql function response format
    if (data && data.status === 'error') {
      log("SQL execution failed", data);
      return res.status(500).json({
        success: false,
        error: data.message,
        hint: data.hint,
        context: data.context
      });
    }

    log("SQL executed successfully", { result: data });
    res.json({ success: true, data });

  } catch (err) {
    log("Unexpected error", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test connection endpoint
app.get("/dev/test", async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("exec_sql", { 
      query: "SELECT NOW() as current_time, 'Connection test successful!' as message;" 
    });

    if (error) throw error;

    res.json({ success: true, connection: "healthy", data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server - bind to IPv4 to fix Windows networking issues
app.listen(4000, "0.0.0.0", () => {
  console.log("🚀 ========================================");
  console.log("🚀   DEV SQL PROXY SERVER STARTED");
  console.log("🚀 ========================================");
  console.log("✅ Dev SQL Exec API running at http://127.0.0.1:4000/dev/sql/exec");
  console.log("✅ Health check available at http://127.0.0.1:4000/health");
  console.log("✅ Connection test at http://127.0.0.1:4000/dev/test");
  console.log("🚀 ========================================");
  console.log("⚠️  WARNING: This server can execute ANY SQL!");
  console.log("⚠️  Only use in development environments!");
  console.log("🚀 ========================================");
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Dev SQL Proxy Server...');
  process.exit(0);
});
