#!/usr/bin/env node
/**
 * Development SQL Execution Server
 * Provides Claude/GPT with direct SQL execution capabilities
 * ⚠️ EXTREMELY DANGEROUS - Only use in development/beta!
 */

import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.DEV_SQL_PORT || 4000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4322'],
  credentials: true
}));

// Supabase client with service role (God mode)
const supabase = createClient(
  "https://amgtktrwpdsigcomavlg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Logging function
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Dev SQL Execution Server'
  });
});

// Main SQL execution endpoint
app.post('/dev/sql/exec', async (req, res) => {
  const { sql, description = 'Manual SQL execution' } = req.body;
  
  if (!sql) {
    return res.status(400).json({ 
      success: false, 
      error: 'SQL query is required' 
    });
  }

  log('info', `Executing SQL: ${description}`, { sql: sql.substring(0, 200) + '...' });

  try {
    // Execute SQL using the exec_sql RPC function
    // Remove trailing semicolon as it causes syntax errors in the RPC function
    const cleanSQL = sql.trim().replace(/;+$/, '');
    const { data, error } = await supabase.rpc('exec_sql', {
      query: cleanSQL
    });

    if (error) {
      log('error', 'SQL execution failed', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }

    log('success', 'SQL executed successfully', { rowCount: data?.length || 0 });
    
    res.json({ 
      success: true, 
      data,
      message: 'SQL executed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    log('error', 'Unexpected error during SQL execution', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Batch SQL execution (for multiple statements)
app.post('/dev/sql/batch', async (req, res) => {
  const { queries, description = 'Batch SQL execution' } = req.body;
  
  if (!Array.isArray(queries) || queries.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Queries array is required' 
    });
  }

  log('info', `Executing batch SQL: ${description}`, { queryCount: queries.length });

  const results = [];
  const errors = [];

  try {
    for (let i = 0; i < queries.length; i++) {
      const sql = queries[i];
      
      try {
        // Remove trailing semicolon as it causes syntax errors in the RPC function
        const cleanSQL = sql.trim().replace(/;+$/, '');
        const { data, error } = await supabase.rpc('exec_sql', {
          query: cleanSQL
        });

        if (error) {
          errors.push({ index: i, sql, error: error.message });
          log('error', `Query ${i + 1} failed`, error);
        } else {
          results.push({ index: i, sql, data, success: true });
          log('success', `Query ${i + 1} succeeded`);
        }
      } catch (err) {
        errors.push({ index: i, sql, error: err.message });
        log('error', `Query ${i + 1} threw exception`, err);
      }
    }

    const response = {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: queries.length,
        successful: results.length,
        failed: errors.length
      },
      timestamp: new Date().toISOString()
    };

    if (errors.length > 0) {
      res.status(207).json(response); // 207 Multi-Status
    } else {
      res.json(response);
    }

  } catch (err) {
    log('error', 'Batch execution failed', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      results,
      errors
    });
  }
});

// Schema inspection endpoint
app.get('/dev/schema/tables', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('devtools_get_schema');
    
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, tables: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test database connection
app.get('/dev/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: 'SELECT NOW() as current_time, version() as postgres_version;' 
    });

    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection failed',
        details: error.message 
      });
    }

    res.json({ 
      success: true, 
      connection: 'healthy',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Connection test failed',
      details: err.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  log('error', 'Unhandled error', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /dev/sql/exec',
      'POST /dev/sql/batch', 
      'GET /dev/schema/tables',
      'GET /dev/test-connection',
      'GET /health'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🚀   DEV SQL EXECUTION SERVER STARTED');
  console.log('🚀 ========================================');
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log('🚀 Available endpoints:');
  console.log('🚀   POST /dev/sql/exec     - Execute single SQL');
  console.log('🚀   POST /dev/sql/batch    - Execute multiple SQL');
  console.log('🚀   GET  /dev/schema/tables - Get table schema');
  console.log('🚀   GET  /dev/test-connection - Test DB connection');
  console.log('🚀   GET  /health           - Health check');
  console.log('🚀 ========================================');
  console.log('⚠️  WARNING: This server can execute ANY SQL!');
  console.log('⚠️  Only use in development/beta environments!');
  console.log('🚀 ========================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Dev SQL Execution Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Dev SQL Execution Server...');
  process.exit(0);
});
