import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import smartLoggingService from './services/SmartLoggingService';

// Start smart logging in development
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  smartLoggingService.startCapture();
  console.log('📊 Smart Logging Service started - AI can now read console logs');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
