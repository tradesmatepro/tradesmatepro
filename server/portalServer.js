// Customer Portal Express Server
// This is a simple Express server to handle customer portal API requests
// In production, this would be integrated with your main backend

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import the portal routes
const portalRoutes = require('../src/api/portalRoutes.js');

const app = express();
const PORT = process.env.PORTAL_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for IP addresses
app.set('trust proxy', true);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Portal API routes
app.use('/api/portal', portalRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Portal server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Customer Portal API server running on port ${PORT}`);
  console.log(`📱 Portal URL: http://localhost:${PORT}/portal`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/portal`);
});

module.exports = app;
