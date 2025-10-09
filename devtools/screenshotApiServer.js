/**
 * Screenshot API Server
 * 
 * HTTP server for screenshot analysis endpoints
 * Runs on port 5050
 * 
 * Endpoints:
 * - POST /ai/analyze-screenshot - Save screenshot
 * - POST /ai/analyze-screenshot/local - Analyze with OCR
 * - GET /ai/analyze-screenshot/report - Get recent analyses
 */

const express = require('express');
const { registerScreenshotRoutes } = require('../AIDevTools/analyzeScreenshotBridge');

const PORT = 5050;

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Allow large base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Screenshot API Server',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Register screenshot routes
registerScreenshotRoutes(app);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log('═'.repeat(60));
    console.log('📸 Screenshot API Server');
    console.log('═'.repeat(60));
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  POST http://localhost:${PORT}/ai/analyze-screenshot`);
    console.log(`  POST http://localhost:${PORT}/ai/analyze-screenshot/local`);
    console.log(`  GET  http://localhost:${PORT}/ai/analyze-screenshot/report`);
    console.log(`  GET  http://localhost:${PORT}/health`);
    console.log('');
    console.log('═'.repeat(60));
  });
}

module.exports = app;

