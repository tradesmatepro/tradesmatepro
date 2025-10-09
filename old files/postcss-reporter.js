/**
 * PostCSS Reporter Plugin for TradeMate Pro DevTools
 * Captures CSS build errors and sends them to the error server
 */

const axios = require('axios');

module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-reporter',

    // Hook into the Once phase to capture messages
    Once(root, { result }) {
      // Add a listener for when the result is processed
      result.processor.process = (function(originalProcess) {
        return function(...args) {
          try {
            return originalProcess.apply(this, args);
          } catch (error) {
            // Capture CSS compilation errors
            const log = {
              phase: "BUILD",
              type: "CSS_BUILD_ERROR",
              plugin: "postcss",
              text: error.message,
              file: error.file || null,
              line: error.line || null,
              column: error.column || null,
              timestamp: new Date().toISOString(),
              severity: 'error',
              category: 'CSS_COMPILATION',
              stack: error.stack
            };

            // Log to console for immediate visibility
            console.error(`🎨 CSS Build ERROR:`, JSON.stringify(log, null, 2));

            // Send to error server (non-blocking)
            axios.post("http://localhost:4000/capture", log, {
              timeout: 1000,
              headers: { "Content-Type": "application/json" }
            }).catch(err => {
              // Silently fail if error server is not available
              console.warn('⚠️ Could not send CSS error to error server:', err.message);
            });

            // Re-throw the error to maintain normal error handling
            throw error;
          }
        };
      })(result.processor.process);
    },

    // Also capture messages in OnceExit for warnings
    OnceExit(root, { result }) {
      if (result.messages && result.messages.length > 0) {
        result.messages.forEach(msg => {
          if (msg.type === 'warning' || msg.type === 'error') {
            const log = {
              phase: "BUILD",
              type: msg.type === 'error' ? "CSS_BUILD_ERROR" : "CSS_BUILD_WARNING",
              plugin: msg.plugin || "postcss",
              text: msg.text,
              file: msg.node && msg.node.source ? msg.node.source.input.file : null,
              line: msg.node && msg.node.source ? msg.node.source.start.line : null,
              column: msg.node && msg.node.source ? msg.node.source.start.column : null,
              timestamp: new Date().toISOString(),
              severity: msg.type === 'error' ? 'error' : 'warning',
              category: 'CSS_COMPILATION'
            };

            // Log to console for immediate visibility
            console.error(`🎨 CSS Build ${msg.type.toUpperCase()}:`, JSON.stringify(log, null, 2));

            // Send to error server (non-blocking)
            axios.post("http://localhost:4000/capture", log, {
              timeout: 1000,
              headers: { "Content-Type": "application/json" }
            }).catch(err => {
              // Silently fail if error server is not available
              console.warn('⚠️ Could not send CSS error to error server:', err.message);
            });
          }
        });
      }
    }
  };
};

module.exports.postcss = true;
