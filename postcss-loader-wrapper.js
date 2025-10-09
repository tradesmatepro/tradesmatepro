/**
 * PostCSS Loader Wrapper
 * Captures PostCSS/Tailwind compilation errors that don't bubble up to webpack
 */

const axios = require('axios');

module.exports = function(source, map, meta) {
  const callback = this.async();
  const postcssLoader = require('postcss-loader');

  // Store original context
  const originalContext = this;
  let callbackCalled = false;

  // Wrap callback to prevent double calls
  const safeCallback = (...args) => {
    if (!callbackCalled) {
      callbackCalled = true;
      callback(...args);
    }
  };

  // Override the async method to use our safe callback
  const originalAsync = this.async;
  this.async = () => safeCallback;

  try {
    // Call the original postcss-loader
    postcssLoader.call(this, source, map, meta);
  } catch (error) {
    capturePostCSSError(error, originalContext);
    safeCallback(error);
  } finally {
    // Restore original async method
    this.async = originalAsync;
  }
};

// Error capture function
function capturePostCSSError(error, loaderContext) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    phase: "BUILD",
    type: "CSS_COMPILE_ERROR",
    category: "POSTCSS_LOADER",
    message: error.message || error.toString(),
    stack: error.stack,
    file: loaderContext.resourcePath || loaderContext.resource,
    line: error.line,
    column: error.column,
    severity: "error"
  };

  // Special handling for Tailwind CSS class errors
  if (error.message && (error.message.includes('does not exist') ||
                        error.message.includes('class') ||
                        error.message.includes('@apply') ||
                        error.message.includes('tailwind'))) {
    errorLog.type = 'TAILWIND_CSS_ERROR';
    errorLog.category = 'CSS_CLASS_MISSING';

    // Extract class name from error message
    const classMatch = error.message.match(/`([^`]+)`/);
    if (classMatch) {
      errorLog.missingClass = classMatch[1];
    }
  }

  console.error('🔴 [PostCSS Loader Error Captured]', JSON.stringify(errorLog, null, 2));

  // Send to error server
  sendErrorToServer(errorLog);
}

async function sendErrorToServer(errorLog) {
  try {
    const formattedError = {
      timestamp: new Date().toISOString(),
      type: 'BUILD_ERROR_LOG',
      source: 'postcss-loader',
      data: [{
        errors: [errorLog],
        warnings: [],
        logs: []
      }]
    };

    await axios.post('http://localhost:4000/save-errors', formattedError, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });

    console.log('📤 PostCSS Loader: Sent CSS error to error server');
  } catch (serverError) {
    console.error('❌ Failed to send PostCSS error to server:', serverError.message);
  }
}
